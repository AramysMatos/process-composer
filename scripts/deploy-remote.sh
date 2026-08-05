#!/usr/bin/env bash
# Pull latest image on the GCP VM and restart the stack.
# Usage: ./scripts/deploy-remote.sh [ssh-user@vm-host]
# Requires: SSH access and docker compose files on the VM (git clone of this repo).
set -euo pipefail

REMOTE="${1:-}"
if [[ -z "${REMOTE}" ]]; then
  echo "Usage: $0 <ssh-user@vm-host>"
  echo "Example: $0 user@34.56.78.90"
  exit 1
fi

REMOTE_DIR="${REMOTE_DIR:-process-composer}"
COMPOSE_FILE="src/main/docker/app-prod.yml"

ssh "${REMOTE}" bash -s <<EOF
set -euo pipefail
cd ~/${REMOTE_DIR}
docker compose -f ${COMPOSE_FILE} pull
docker compose -f ${COMPOSE_FILE} up -d
docker compose -f ${COMPOSE_FILE} ps
EOF

echo "Deploy complete on ${REMOTE}"
