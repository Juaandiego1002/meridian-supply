#!/usr/bin/env bash
set -euo pipefail

# seed-prod.sh - Siembra contenido (productos, categorías, páginas, media) en la
# base de producción. No crea pedidos, carritos ni transacciones.
#
# A propósito NO es un flag de deploy-prod.sh: desplegar y modificar datos son
# cosas distintas, y esta no debería poder dispararse por error.
#
# Uso: ./seed-prod.sh [--full] [--port PUERTO]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-3001}"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"
CONTENT_ONLY=true

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[seed]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
error() { echo -e "${RED}[error]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC} $*"; }

usage() {
  cat <<EOF
Uso: $0 [OPCIONES]

Siembra contenido demo en la base de producción. Es idempotente: no duplica lo
que ya existe.

Opciones:
  --port PUERTO   Puerto público de la app (default: 3001). Debe coincidir con
                  el despliegue en curso, para asegurar la misma base.
  --full          Crea también pedidos, carritos y transacciones de ejemplo.
                  NO recomendado en producción: son datos de prueba.
  --skip-build    No reconstruir la imagen del seed antes de ejecutarlo. Más
                  rápido, pero usa el código de la última imagen construida.
  -h, --help      Muestra esta ayuda
EOF
}

SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --full) CONTENT_ONLY=false; shift ;;
    --port) PORT="$2"; shift 2 ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) error "Opción desconocida: $1"; usage; exit 1 ;;
  esac
done

if ! docker compose version >/dev/null 2>&1; then
  error "Docker Compose V2 no está disponible."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  error "No existe $ENV_FILE. Despliega primero con ./deploy-prod.sh"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE" 2>/dev/null || true

# Sin estas el seed aborta, y es lo correcto: sin admin no puede crear contenido.
if [[ -z "${SEED_ADMIN_EMAIL:-}" || -z "${SEED_ADMIN_PASSWORD:-}" ]]; then
  error "Faltan SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en $ENV_FILE"
  error "El seed no crea admins con credenciales hardcodeadas por seguridad."
  exit 1
fi

export PORT
COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE")

# La app debe estar en marcha: el seed se conecta a la misma red de compose.
if ! "${COMPOSE[@]}" ps --status running --services 2>/dev/null | grep -qx mongodb; then
  log "MongoDB no está en marcha, levantando servicios..."
  "${COMPOSE[@]}" up -d --wait mongodb
fi

if [[ "$CONTENT_ONLY" == true ]]; then
    log "Modo: solo contenido (sin pedidos, carritos ni transacciones)"
  else
  warn "Modo: seed COMPLETO. Se crearán pedidos y carritos de ejemplo en producción."
fi

# El seed corre sobre el stage builder, que compila Next. Sin este build, una
# imagen cacheada ejecuta el codigo viejo y el seed "termina bien" sin sembrar.
if [[ "$SKIP_BUILD" == true ]]; then
  warn "--skip-build: se usa la imagen existente, con su codigo actual."
else
  log "Construyendo imagen del seed (usa el codigo actual)..."
  "${COMPOSE[@]}" --profile seed build seed
fi

log "Ejecutando seed..."
SEED_LOG="$(SEED_CONTENT_ONLY="$CONTENT_ONLY" "${COMPOSE[@]}" --profile seed run --rm seed 2>&1)" || {
  echo "$SEED_LOG"
  error "El contenedor del seed fallo."
  exit 1
}
echo "$SEED_LOG"

# El compose devuelve 0 tambien cuando el contenedor no llega a ejecutar el
# script, asi que no basta con el exit code: exigimos la marca que deja el seed.
if [[ "$SEED_LOG" != *"Seed completado exitosamente"* ]]; then
  error "El seed no termino correctamente. Revisa el log de arriba."
  exit 1
fi

success "Seed completado"
echo ""
log "Admin:  ${SEED_ADMIN_EMAIL}"
log "Panel:  http://localhost:${PORT}/admin"
echo ""
log "Credenciales del admin: $SEED_ADMIN_EMAIL"
warn "Cambia SEED_ADMIN_PASSWORD en $ENV_FILE tras el primer acceso."
