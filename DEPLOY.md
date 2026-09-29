# Despliegue en Producción con Docker

## Requisitos previos
- Docker 24+
- Docker Compose v2 (`docker compose`) o v1 (`docker-compose`)

## Configuración inicial

```bash
# 1. Copia el template de entorno
cp .env.production.example .env.production

# 2. Edita .env.production con TUS valores reales
#    - PAYLOAD_SECRET (openssl rand -hex 32)
#    - STRIPE_* claves de PRODUCCIÓN
#    - NEXT_PUBLIC_SERVER_URL=https://tudominio.com
#    - etc.
nano .env.production
```

## Uso del script

```bash
# Despliegue normal (puerto 3001, foreground)
./deploy-prod.sh

# Despliegue en background (detached)
./deploy-prod.sh -d

# Puerto personalizado
./deploy-prod.sh --port 8080 -d

# Reconstruir desde cero conservando datos (útil si cambias el Dockerfile)
./deploy-prod.sh --clean -d

# BORRA la base de datos y los medios. Pide confirmación.
./deploy-prod.sh --wipe-data -d
./deploy-prod.sh --wipe-data -d --yes   # sin confirmar
```

> En Windows (PowerShell) ejecuta el script con Git Bash:
> `bash deploy-prod.sh -d`

### `--clean` vs `--wipe-data`

No son lo mismo y confundirlos es la forma más fácil de perder el catálogo:

| Flag | Contenedores | Volúmenes (Mongo + media) | Cuándo |
|------|--------------|--------------------------|--------|
| sin flag | conserva | conserva | despliegue normal |
| `--clean` | **borra y recrea** | **conserva** | cambiaste el Dockerfile o la app está rota |
| `--wipe-data` | borra | **borra** | empezar de cero a propósito |

`--wipe-data` no tiene vuelta atrás: borra productos, pedidos, páginas y medios.

## Sembrar contenido de ejemplo

La base de recién desplegar está vacía. `seed-prod.sh` la puebla con el
contenido de la plantilla: 2 productos, 3 categorías, variantes, páginas y media.

```bash
# Contenido solamente (recomendado en producción)
./seed-prod.sh --port 3001

# Añade además pedidos, carritos y transacciones de prueba
./seed-prod.sh --port 3001 --full
```

No es un flag de `deploy-prod.sh` a propósito: desplegar y modificar datos son
acciones distintas, y esta no debería dispararse sin que lo pidas explícitamente.

Detalles que conviene saber:

- **Es idempotente.** Puedes correrlo las veces que quieras; limpia y recrea.
- **Por defecto solo contenido.** Los pedidos de ejemplo son datos de prueba y
  no deberían aterrizar en una base real. Usa `--full` si los quieres.
- **El servicio usa `profiles: [seed]`.** Un `up` normal nunca lo ejecuta.
- **Las credenciales del admin son obligatorias.** El seed aborta sin
  `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `.env.production`. No hay
  password por defecto: cámbiala tras el primer acceso.
- **Reconstruye la imagen antes de sembrar**, para no ejecutar código viejo.
  Usa `--skip-build` si solo cambiaste datos.

## Comandos manuales de Docker Compose

`docker compose` **solo auto-carga `.env`**, nunca `.env.production`. Si lo
omite, todas las variables `${...}` del compose quedan vacías y el contenedor
arranca sin `DATABASE_URL`. Incluye siempre `--env-file`:

```bash
# Ver logs en tiempo real
docker compose -f docker-compose.yml --env-file .env.production logs -f

# Detener todo
docker compose -f docker-compose.yml --env-file .env.production down

# Reiniciar solo la app
docker compose -f docker-compose.yml --env-file .env.production restart app
```

## Qué hace el script

| Paso | Acción |
|------|--------|
| 1 | Valida que `.env.production` existe y tiene claves reales |
| 2 | Si `--clean`: `docker compose down -v` + `docker system prune` |
| 3 | `docker compose --env-file .env.production build --no-cache` |
| 4 | `docker compose --env-file .env.production up` (MongoDB + App) |
| 5 | Healthcheck espera a que responda `http://localhost:PUERTO/api/health` |
| 6 | Muestra URLs de acceso, o falla si la app no arrancó en 60s |

> `--clean` ejecuta `docker system prune --volumes`, que borra **volúmenes no
> usados de todos tus proyectos Docker**, no solo los de Meridian Supply.

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐
│   App (Next.js) │────▶│   MongoDB 8     │
│   Puerto 3000   │     │   Puerto 27017  │
└─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
   ./public/media          Volumen persistente
   (uploads)               mongodb_data
```

## Variables en `.env.production`

**Obligatorias** (el script para si faltan):

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `mongodb://mongodb:27017/meridian-supply` (nombre del servicio Docker) |
| `PAYLOAD_SECRET` | 32+ chars aleatorios (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SERVER_URL` | `https://tudominio.com` (sin trailing slash) |

> **El puerto de `NEXT_PUBLIC_SERVER_URL` debe coincidir con `PORT`.** Payload
> genera URLs de media absolutas y el optimizador de imágenes de Next las
> descarga desde esa URL. Si no coinciden, las imágenes devuelven HTTP 500
> aunque el sitio cargue bien. `deploy-prod.sh` lo comprueba y para antes de
> desplegar. Además, `docker-compose.yml` publica el mismo puerto dentro y
> fuera del contenedor a propósito, para que la URL sea alcanzable desde
> dentro. Si cambias `PORT`, cambia también `NEXT_PUBLIC_SERVER_URL`.

**Opcionales — Stripe.** Déjalas vacías si todavía no quieres cobrar. El catálogo,
el carrito, el CMS y el admin funcionan igual; el checkout muestra "Pagos no
configurados" en lugar del formulario. Cuando rellenes las claves y redespliegues,
el checkout se activa solo (no hay que tocar código).

| Variable | Descripción |
|----------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` de dashboard.stripe.com/apikeys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | `whsec_...` de Stripe CLI / Dashboard |

> No dejes `sk_test_` a secas como valor: es una cadena *truthy* y se cuela como
> si fuera una clave real. Si no tienes claves, deja la variable **vacía**.

**Opcionales — seed.** Solo las necesita `seed-prod.sh`. El seed aborta si
faltan las dos primeras, por diseño: crear un admin con una contraseña fija
dentro del repositorio termina en una contraseña real en producción.

| Variable | Descripción |
|----------|-------------|
| `SEED_ADMIN_EMAIL` | Email del admin que crea el seed |
| `SEED_ADMIN_PASSWORD` | Su contraseña, mínimo 12 caracteres |
| `SEED_ADMIN_NAME` | Nombre visible (opcional) |
| `SEED_CONTENT_ONLY` | `true` (default) salta pedidos, carritos y transacciones |

## Stripe Webhook en producción

```bash
# En tu servidor, apunta el webhook a:
https://tudominio.com/api/payments/stripe/webhooks

# Eventos a suscribir:
- payment_intent.succeeded
- payment_intent.payment_failed
- checkout.session.completed
```

## Backup de MongoDB

```bash
# Backup
docker exec meridian-mongodb mongodump --uri="mongodb://localhost:27017/meridian-supply" --out=/data/backup
docker cp meridian-mongodb:/data/backup ./backup-$(date +%F)

# Restore
docker cp ./backup-2025-01-15 meridian-mongodb:/data/restore
docker exec meridian-mongodb mongorestore --uri="mongodb://localhost:27017/meridian-supply" /data/restore/meridian-supply
```

## Actualizar la app

```bash
git pull
./deploy-prod.sh --clean -d
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Puerto ocupado | `./deploy-prod.sh --port 8080 -d` |
| Mongo no arranca | `docker compose -f docker-compose.yml --env-file .env.production logs mongodb` |
| App no compila | `docker compose -f docker-compose.yml --env-file .env.production build --no-cache app` |
| Permisos uploads | `docker exec meridian-app chown -R nextjs:nodejs /app/public/media` |
| `ECONNREFUSED` a mongo | `DATABASE_URL` con `127.0.0.1` en vez de `mongodb://mongodb:27017/...` |
| Variables vacías en el contenedor | Falta `--env-file .env.production` en tu comando de compose |