#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() { printf '[build-backend] %s\n' "$*"; }

SHA="${1:-$($ROOT_DIR/deployment/utils/get-sha.sh)}"

log "Building backend image for SHA=$SHA"
docker build \
  -f "$ROOT_DIR/deployment/docker/backend.Dockerfile" \
  -t numztrak-backend:local \
  -t numztrak-backend:"$SHA" \
  "$ROOT_DIR"

log "Backend image built: numztrak-backend:$SHA"
