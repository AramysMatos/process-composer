#!/usr/bin/env bash
# Build production image with Jib and push to GitHub Container Registry (GHCR).
# Prerequisites: docker login ghcr.io (see DEPLOY-GCP.md)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GITHUB_USER="${GITHUB_USER:-YOUR_GITHUB_USER}"
VERSION="${1:-latest}"
IMAGE="ghcr.io/${GITHUB_USER}/process-composer:${VERSION}"

echo "Building and pushing ${IMAGE} ..."

./mvnw -ntp -Pprod verify -DskipTests jib:build -Djib.to.image="${IMAGE}"

if [[ "${VERSION}" != "latest" ]]; then
  LATEST_IMAGE="ghcr.io/${GITHUB_USER}/process-composer:latest"
  echo "Also tagging as ${LATEST_IMAGE} ..."
  ./mvnw -ntp -Pprod verify -DskipTests jib:build -Djib.to.image="${LATEST_IMAGE}"
fi

echo "Done. Image published: ${IMAGE}"
