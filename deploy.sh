#!/bin/bash
#
# deploy.sh — Despliegue remoto parametrizado de SISGAD5 (docker-compose.prod.yml).
#
# Fuente única de verdad del despliegue: el job `deploy` de cd.yml invoca este
# script por SSH. También puede ejecutarse manualmente en el servidor.
#
# Uso:
#   IMAGE_TAG=sha-abc123 ./deploy.sh
#
# Variables de entorno (todas opcionales salvo IMAGE_TAG):
#   IMAGE_TAG          (obligatorio) Tag de imagen a desplegar, p. ej. sha-<commit>.
#   IMAGE_PREFIX       Prefijo de imágenes GHCR (def: ghcr.io/ybotet/sisgad5_1.0).
#   COMPOSE_FILE       Archivo compose (def: docker-compose.prod.yml).
#   COMPOSE_DIR        Directorio del compose (def: /opt/sisgad5).
#   GHCR_USER          Usuario para docker login GHCR (opcional; si se define
#                      junto a GHCR_TOKEN se hace login antes del pull).
#   GHCR_TOKEN         Token PAT con scope read:packages para GHCR.
#   HEALTH_URL         URL de healthcheck (def: http://localhost:5000/health).
#   HEALTH_TIMEOUT     Segundos máximos de espera (def: 60).
#   CURRENT_TAG_FILE   Fichero que guarda el último tag desplegado OK
#                      (def: /opt/sisgad5/CURRENT_TAG).
#   NGINX_RELOAD       Si es "true", recarga nginx del host tras el deploy (def: false).
#
# Comportamiento:
#   1. Login GHCR (si hay credenciales).
#   2. Guarda el tag actual (CURRENT_TAG) como rollback.
#   3. docker compose pull + up -d con IMAGE_TAG.
#   4. Healthcheck en bucle hasta HEALTH_TIMEOUT.
#   5. Si el healthcheck falla, rollback automático al tag anterior y exit 1.
#   6. Si todo OK, persiste IMAGE_TAG en CURRENT_TAG.
#
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG es obligatorio (p. ej. sha-abc123)}"
IMAGE_PREFIX="${IMAGE_PREFIX:-ghcr.io/ybotet/sisgad5_1.0}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
COMPOSE_DIR="${COMPOSE_DIR:-/opt/sisgad5}"
HEALTH_URL="${HEALTH_URL:-http://localhost:5000/health}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"
CURRENT_TAG_FILE="${CURRENT_TAG_FILE:-/opt/sisgad5/CURRENT_TAG}"
NGINX_RELOAD="${NGINX_RELOAD:-false}"

export IMAGE_TAG
export IMAGE_PREFIX

log() { echo "[deploy] $*"; }
err() { echo "[deploy][ERROR] $*" >&2; }

cd "$COMPOSE_DIR"

DC="docker compose -f $COMPOSE_FILE"

# ---------------------------------------------------------------------------
# 1. Login GHCR (opcional)
# ---------------------------------------------------------------------------
if [ -n "${GHCR_USER:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  log "Login GHCR como ${GHCR_USER}..."
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
else
  log "Sin credenciales GHCR en el entorno; se asume docker login persistente en el servidor."
fi

# ---------------------------------------------------------------------------
# 2. Guardar tag actual para rollback
# ---------------------------------------------------------------------------
PREVIOUS_TAG=""
if [ -f "$CURRENT_TAG_FILE" ]; then
  PREVIOUS_TAG="$(cat "$CURRENT_TAG_FILE" | tr -d '[:space:]')"
  log "Tag actual (rollback): ${PREVIOUS_TAG:-<ninguno>}"
else
  log "No existe CURRENT_TAG; primer despliegue (sin rollback previo)."
fi

# ---------------------------------------------------------------------------
# 3. Pull + up con el nuevo tag
# ---------------------------------------------------------------------------
log "Pull de imágenes con IMAGE_TAG=${IMAGE_TAG}..."
$DC pull

log "Levantando stack (up -d)..."
$DC up -d

# ---------------------------------------------------------------------------
# 4. Healthcheck en bucle
# ---------------------------------------------------------------------------
log "Healthcheck: ${HEALTH_URL} (timeout ${HEALTH_TIMEOUT}s)..."
deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
healthy=0
while [ "$(date +%s)" -lt "$deadline" ]; do
  if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
    healthy=1
    break
  fi
  sleep 3
done

# ---------------------------------------------------------------------------
# 5. Rollback automático si el healthcheck falla
# ---------------------------------------------------------------------------
if [ "$healthy" -ne 1 ]; then
  err "Healthcheck falló tras ${HEALTH_TIMEOUT}s."
  if [ -n "$PREVIOUS_TAG" ]; then
    err "Rollback a tag anterior: ${PREVIOUS_TAG}"
    export IMAGE_TAG="$PREVIOUS_TAG"
    $DC pull
    $DC up -d
    log "Rollback aplicado. Reintentando healthcheck..."
    deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
    while [ "$(date +%s)" -lt "$deadline" ]; do
      if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
        log "Rollback verificado OK."
        exit 1
      fi
      sleep 3
    done
    err "Rollback tampoco pasó el healthcheck. Revisar logs: $DC logs"
  else
    err "No hay tag previo para rollback."
  fi
  $DC logs --tail=50
  exit 1
fi

# ---------------------------------------------------------------------------
# 6. Persistir tag desplegado OK
# ---------------------------------------------------------------------------
echo "$IMAGE_TAG" > "$CURRENT_TAG_FILE"
log "Despliegue OK. CURRENT_TAG=${IMAGE_TAG}"

# Recarga nginx del host (opcional, no bloqueante)
if [ "$NGINX_RELOAD" = "true" ]; then
  log "Recargando nginx del host..."
  sudo nginx -t && sudo systemctl reload nginx || err "nginx reload falló (no bloqueante)."
fi

log "Despliegue completado."