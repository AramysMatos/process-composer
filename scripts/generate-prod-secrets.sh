#!/usr/bin/env bash
# Generate random values for production .env (prints to stdout; copy into src/main/docker/.env).
set -euo pipefail

echo "# Paste into src/main/docker/.env (adjust GHCR_IMAGE and JHIPSTER_MAIL_BASE_URL manually)"
echo "MYSQL_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
echo "SPRING_DATASOURCE_PASSWORD=\${MYSQL_ROOT_PASSWORD}"
echo "JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
echo "GITHUB_TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')"
