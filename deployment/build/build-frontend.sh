#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() { printf '[build-frontend] %s\n' "$*"; }

SHA="${1:-$($ROOT_DIR/deployment/utils/get-sha.sh)}"

log "Building frontend image for SHA=$SHA"
docker build \
  -f "$ROOT_DIR/deployment/docker/frontend.Dockerfile" \
  -t numztrak-frontend:local \
  -t numztrak-frontend:"$SHA" \
  "$ROOT_DIR"

log "Frontend image built: numztrak-frontend:$SHA"
