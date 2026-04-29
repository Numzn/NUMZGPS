#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/deployment/compose/docker-compose.prod.yml"
STATE_FILE="$ROOT_DIR/deployment/deploy/.last_deploy"
HISTORY_FILE="$ROOT_DIR/deployment/deploy/.deploy_history"

log() { printf '[deploy] %s\n' "$*"; }
fail() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

SHA="${1:-}"
ENV_FILE="${2:-$ROOT_DIR/deployment/.env}"

[[ -n "$SHA" ]] || fail "Usage: $0 <git-sha> [env-file]"
[[ -f "$ENV_FILE" ]] || fail "Missing env file: $ENV_FILE"

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

case "${REGISTRY_PROVIDER:-}" in
  dockerhub)
    REGISTRY_PREFIX="${DOCKERHUB_USERNAME}"
    ;;
  ghcr)
    REGISTRY_PREFIX="ghcr.io/${GHCR_OWNER}"
    ;;
  *)
    fail "REGISTRY_PROVIDER must be dockerhub or ghcr"
    ;;
esac

export IMAGE_TAG="$SHA"
export REGISTRY_PREFIX

log "Pulling images for SHA=$SHA from $REGISTRY_PREFIX"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

log "Starting services"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

if [[ -f "$STATE_FILE" ]]; then
  PREV_SHA="$(cat "$STATE_FILE")"
  if [[ "$PREV_SHA" != "$SHA" ]]; then
    printf '%s\n' "$PREV_SHA" >> "$HISTORY_FILE"
  fi
fi
printf '%s\n' "$SHA" >> "$HISTORY_FILE"
printf '%s\n' "$SHA" > "$STATE_FILE"

log "Deployment completed. Recorded SHA in $STATE_FILE"
