# Dockerfile multi-stage para Meridian Supply (Payload + Next.js)
# Requiere Node 20+ y pnpm

# ===========================================
# BASE - Dependencias comunes
# ===========================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ===========================================
# BUILDER - Compila la aplicación
# ===========================================
FROM base AS builder
WORKDIR /app

# Next.js inlinea las NEXT_PUBLIC_* en el bundle en tiempo de build.
# Si no llegan aquí, el cliente las ve como undefined aunque se inyecten
# luego en runtime.
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV PAYLOAD_SECRET=build-time-placeholder-not-used-at-runtime

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar dependencias (incluyendo dev para build)
RUN npm install

# Copiar código fuente
COPY . .

# Generar tipos de Payload
RUN npm run generate:types

# Build de Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ===========================================
# RUNNER - Imagen de producción ligera
# ===========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Default sensato si se ejecuta la imagen sin compose. compose lo sobrescribe
# con el puerto publicado, y publica el mismo para que las URLs de media que
# genera Payload sean alcanzables desde dentro del contenedor.
ENV PORT=3002
# Bind en todas las interfaces, no en la IP de la red de Docker
ENV HOSTNAME=0.0.0.0

# Usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar node_modules de producción
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Crear directorio para uploads (media)
RUN mkdir -p /app/public/media && chown -R nextjs:nodejs /app/public/media

USER nextjs

# Solo informativo: el puerto real lo fija compose, que publica el mismo en
# ambos lados a proposito (ver comentario de PORT en docker-compose.yml).
EXPOSE 3000

# Healthcheck endpoint simple
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

CMD ["node", "server.js"]