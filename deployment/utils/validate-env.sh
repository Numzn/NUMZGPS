#!/usr/bin/env bash
set -euo pipefail

log() { printf '[validate-env] %s\n' "$*"; }
fail() { printf '[validate-env] ERROR: %s\n' "$*" >&2; exit 1; }

ENV_FILE="${1:-.env}"
[[ -f "$ENV_FILE" ]] || fail "Missing env file: $ENV_FILE"

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${REGISTRY_PROVIDER:?REGISTRY_PROVIDER is required (dockerhub|ghcr)}"
: "${REGISTRY_NAMESPACE:?REGISTRY_NAMESPACE is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

case "$REGISTRY_PROVIDER" in
  dockerhub)
    : "${DOCKERHUB_USERNAME:?DOCKERHUB_USERNAME required for dockerhub}"
    ;;
  ghcr)
    : "${GHCR_OWNER:?GHCR_OWNER required for ghcr}"
    ;;
  *)
    fail "REGISTRY_PROVIDER must be dockerhub or ghcr"
    ;;
esac

log "Environment validated successfully using $ENV_FILE"
