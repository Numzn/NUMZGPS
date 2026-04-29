#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() { printf '[tag-images] %s\n' "$*"; }

SHA="${1:-$($ROOT_DIR/deployment/utils/get-sha.sh)}"

log "Tagging local images with SHA=$SHA"

docker tag numztrak-frontend:local "numztrak-frontend:$SHA"
docker tag numztrak-backend:local "numztrak-backend:$SHA"

log "Tagged images: numztrak-frontend:$SHA, numztrak-backend:$SHA"
