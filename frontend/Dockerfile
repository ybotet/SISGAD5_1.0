# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# IMPORTANTE: Las variables de entorno se pasarán desde docker-compose
# No necesitas copiar .env aquí porque docker-compose las inyectará

# Sentry (TASK-220-04) — el dev server de Vite lee import.meta.env.VITE_* del
# entorno del proceso al arrancar. Se exponen como ARG→ENV (no-op si vacío).
ARG VITE_SENTRY_DSN_FRONTEND=
ARG VITE_SENTRY_ENVIRONMENT=production
ARG VITE_GIT_SHA=
ENV VITE_SENTRY_DSN_FRONTEND=$VITE_SENTRY_DSN_FRONTEND
ENV VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT
ENV VITE_GIT_SHA=$VITE_GIT_SHA

EXPOSE 5004

# Modifica el comando para asegurar que escuche en todas las interfaces
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5004"]