#!/usr/bin/env bash
set -euo pipefail

# deploy-prod.sh - Despliegue productivo con Docker Compose
# Uso: ./deploy-prod.sh [--clean] [--wipe-data] [--port PUERTO] [--detach] [--yes]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuración por defecto
PORT="${PORT:-3001}"
CLEAN=false
WIPE_DATA=false
DETACH=false
ASSUME_YES=false
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"
ENV_TEMPLATE=".env.production.example"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
error() { echo -e "${RED}[error]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC} $*"; }

usage() {
  cat <<EOF
Uso: $0 [OPCIONES]

Opciones:
  --detach, -d      Ejecuta en segundo plano (background)
  --port PUERTO     Puerto público. Si se omite, usa el PORT de
                    .env.production, que es lo que espera NEXT_PUBLIC_SERVER_URL.
  --clean           Borra el contenedor y lo reconstruye desde cero.
                    Los datos (base de datos e imágenes) se conservan.
  --wipe-data       DESTRUCTIVO: borra además los volúmenes, con ellos la base
                    de datos y las imágenes subidas. Pide confirmación.
  --yes, -y         No preguntar confirmación (para --wipe-data en CI)
  --help, -h        Muestra esta ayuda

Ejemplos:
  $0 -d                    # Despliegue normal
  $0 --clean -d            # Reconstruir el contenedor desde cero (conserva datos)
  $0 --clean -d --port 8080
  $0                       # Igual, pero mostrando los logs en directo
  $0 --wipe-data -d        # Empieza de cero, TODO borrado (PIDE CONFIRMACIÓN)
  $0 --wipe-data -d -y     # Igual sin preguntar (CI)
EOF
}

# Parsear argumentos
# CLI_PORT se guarda aparte: source "$ENV_FILE" puede sobrescribir PORT.
# Vacío significa "no se pasó --port", y entonces manda el PORT del env file.
CLI_PORT=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean) CLEAN=true; shift ;;
    --wipe-data) WIPE_DATA=true; shift ;;
    --port) CLI_PORT="$2"; shift 2 ;;
    --detach|-d) DETACH=true; shift ;;
    --yes|-y) ASSUME_YES=true; shift ;;
    --help|-h) usage; exit 0 ;;
    *) error "Opción desconocida: $1"; usage; exit 1 ;;
  esac
done

# Verificar Docker
if ! command -v docker &> /dev/null; then
  error "Docker no está instalado"
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  error "Docker Compose no está disponible"
  exit 1
fi

if docker compose version &> /dev/null; then
  COMPOSE_DISPLAY="docker compose"
  read -r -a COMPOSE_CMD <<< "docker compose"
else
  COMPOSE_DISPLAY="docker-compose"
  read -r -a COMPOSE_CMD <<< "docker-compose"
fi

# Verificar archivo .env.production
if [[ ! -f "$ENV_FILE" ]]; then
  warn "No existe $ENV_FILE, creando desde $ENV_TEMPLATE..."
  if [[ -f "$ENV_TEMPLATE" ]]; then
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    warn "EDITA $ENV_FILE con tus claves reales antes de continuar"
    exit 1
  else
    error "No hay $ENV_TEMPLATE para crear $ENV_FILE"
    exit 1
  fi
fi

# Validar variables críticas en .env.production
source "$ENV_FILE" 2>/dev/null || true

# Precedencia del puerto: --port (CLI) > PORT del env file > 3001.
# Si no se pasó --port, respetamos el PORT de .env.production en vez de
# imposing un default que luego choca con NEXT_PUBLIC_SERVER_URL.
if [[ -n "$CLI_PORT" ]]; then
  PORT="$CLI_PORT"
elif [[ -n "${PORT:-}" ]]; then
  PORT="$PORT"
else
  PORT="3001"
fi

# Docker Compose solo auto-carga .env, nunca .env.production.
# Sin --env-file, todas las variables ${...} del compose llegan vacías.
export PORT
COMPOSE=("${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --env-file "$ENV_FILE")

required_vars=(
  "DATABASE_URL"
  "PAYLOAD_SECRET"
  "NEXT_PUBLIC_SERVER_URL"
)

# Opcionales: el sitio arranca sin ellas, pero sin pagos en línea.
optional_vars=(
  "STRIPE_SECRET_KEY"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  "STRIPE_WEBHOOKS_SIGNING_SECRET"
)

is_placeholder() {
  local value="$1"
  [[ -z "$value" || "$value" == *TU_CLAVE* || "$value" == *REEMPLAZA* \
     || "$value" == *mygeneratedsecret* || "$value" == *demo-draft-secret* \
     || "$value" == *template-* || "$value" == sk_test_* || "$value" == pk_test_* \
     || "$value" == whsec_* || "$value" == whsec_ ]]
}

missing=()
for var in "${required_vars[@]}"; do
  if is_placeholder "${!var:-}"; then
    missing+=("$var")
  fi
done

missing_optional=()
for var in "${optional_vars[@]}"; do
  if is_placeholder "${!var:-}"; then
    missing_optional+=("$var")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  error "Variables obligatorias faltantes o con placeholders en $ENV_FILE:"
  for v in "${missing[@]}"; do echo "  - $v"; done
  error "Copia $ENV_TEMPLATE y rellena los valores reales."
  exit 1
fi

if [[ ${#missing_optional[@]} -gt 0 ]]; then
  warn "Stripe NO configurado: ${missing_optional[*]}"
  warn "El sitio, catálogo, carrito y CMS funcionarán, pero NO se podrán cobrar pedidos."
  warn "Para activarlo, rellena esas variables en $ENV_FILE y redespliega."
fi

# Payload devuelve URLs de media absolutas usando NEXT_PUBLIC_SERVER_URL, y el
# optimizador de imagenes de Next las descarga desde ahi. Si el puerto no
# coincide con el publicado, las imagenes dan 500 aunque el sitio cargue bien.
SERVER_URL_PORT="$(printf '%s' "${NEXT_PUBLIC_SERVER_URL:-}" | sed -n 's|.*:\([0-9]\{2,5\}\).*|\1|p')"
if [[ -n "$SERVER_URL_PORT" && "$SERVER_URL_PORT" != "$PORT" ]]; then
  error "NEXT_PUBLIC_SERVER_URL usa el puerto $SERVER_URL_PORT, pero se despliega en $PORT."
  error "Las imagenes fallaran con HTTP 500: Payload genera URLs absolutas y Next las descarga desde ahi."
  error "Corrige $ENV_FILE (puerto $PORT) o despliega con --port $SERVER_URL_PORT."
  exit 1
fi

# Aviso si mongo apunta a localhost: dentro del contenedor la app, 127.0.0.1
# es ella misma, no el servicio mongodb. La conexión fallaría.
if [[ "$DATABASE_URL" == *127.0.0.1* || "$DATABASE_URL" == *localhost* ]]; then
  error "DATABASE_URL apunta a localhost, pero la app corre DENTRO de Docker."
  error "Debe usar el nombre del servicio: mongodb://mongodb:27017/meridian-supply"
  exit 1
fi

# Eliminar contenedores y reconstruir desde cero.
#
# Sin "-v": los volúmenes (base de datos e imágenes) se conservan.
#
# SOLO toca este proyecto. No se llama a "docker system prune" porque eso borra
# volúmenes huérfanos de TODO el sistema, incluidos los de otros proyectos.
remove_containers() {
  log "Eliminando contenedores anteriores (los datos se conservan)..."
  "${COMPOSE[@]}" down --remove-orphans 2>/dev/null || true
}

# BORRADO TOTAL: contenedores + volúmenes. Irreversible, pide confirmación.
wipe_data() {
  if [[ "$ASSUME_YES" != true ]]; then
    warn "--wipe-data va a BORRAR datos de producción de forma irreversible:"
    warn "  - volumen mongodb_data   → base de datos (productos, pedidos, usuarios)"
    warn "  - volumen media_data     → imágenes subidas desde el admin"
    warn "  - contenedores y redes de este proyecto"
    echo ""
    if [[ ! -t 0 ]]; then
      error "No hay terminal interactiva para pedir confirmación."
      error "Usa --yes solo si sabes lo que haces (por ejemplo en CI)."
      exit 1
    fi
    read -r -p "Escribe 'si' para continuar (cualquier otra cosa cancela): " answer
    if [[ "$answer" != "si" ]]; then
      error "Cancelado. No se ha borrado nada."
      exit 1
    fi
  fi

  log "Limpiando despliegue anterior..."
  "${COMPOSE[@]}" down -v --remove-orphans --rmi local 2>/dev/null || true
  success "Contenedores, volúmenes, redes e imágenes de este proyecto eliminados"
}

# --clean borra el contenedor y lo reconstruye desde cero. Los datos se conservan.
# --wipe-data va un paso más allá y borra también la base de datos y las imágenes.
if [[ "$WIPE_DATA" == true ]]; then
  wipe_data
elif [[ "$CLEAN" == true ]]; then
  remove_containers
fi

# Validar la config antes de construir: si el compose no cuadra, falla aquí
# con un mensaje claro en vez de a mitad del build.
if ! "${COMPOSE[@]}" config --quiet; then
  error "La configuración de $COMPOSE_FILE no es válida."
  exit 1
fi

# Construir imágenes
log "Construyendo imágenes Docker..."
"${COMPOSE[@]}" build --no-cache

# Levantar servicios. "--wait" espera a que cada contenedor esté healthy en vez
# de dormir a ciegas: usa el healthcheck que ya tienen definido app y mongodb.
log "Iniciando servicios (MongoDB + App)..."
if [[ "$DETACH" == true ]]; then
  "${COMPOSE[@]}" up -d --wait --wait-timeout 120
else
  "${COMPOSE[@]}" up
fi

# Comprobación desde el host: "--wait" confirma que el contenedor está sano, pero
# no que el puerto publicado esté bien mapeado. Esto sí lo verifica.
if [[ "$DETACH" == true ]]; then
  log "Comprobando el puerto publicado ($PORT)..."
  ready=false
  for i in {1..30}; do
    if curl -sf "http://localhost:$PORT/api/health" >/dev/null 2>&1 || \
       curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 2
  done

  if [[ "$ready" != true ]]; then
    error "El contenedor está sano pero http://localhost:$PORT no responde tras 60s."
    error "Revisa los logs: ${COMPOSE_DISPLAY} -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
    exit 1
  fi
fi

# Mostrar información final
echo ""
success "Despliegue completado"
echo ""
echo "┌────────────────────────────────────────────────────┐"
echo "│  Meridian Supply - Producción                      │"
echo "├────────────────────────────────────────────────────┤"
echo "│  App:        http://localhost:$PORT"
echo "│  Admin:      http://localhost:$PORT/admin"
echo "│  MongoDB:    red interna de compose (no expuesto)   │"
echo "├────────────────────────────────────────────────────┤"
echo "│  Logs:       ${COMPOSE_DISPLAY} -f $COMPOSE_FILE \\"
echo "│                 --env-file $ENV_FILE logs -f"
echo "│  Detener:    ${COMPOSE_DISPLAY} -f $COMPOSE_FILE \\"
echo "│                 --env-file $ENV_FILE down"
echo "│  Reiniciar:  ${COMPOSE_DISPLAY} -f $COMPOSE_FILE \\"
echo "│                 --env-file $ENV_FILE restart"
echo "└────────────────────────────────────────────────────┘"
echo ""

if [[ "$DETACH" == true ]]; then
  log "Servicios corriendo en background. Usa '${COMPOSE_DISPLAY} -f $COMPOSE_FILE --env-file $ENV_FILE logs -f' para ver logs."
fi