#!/usr/bin/env bash
set -euo pipefail

echo "=== Mentor OS Deploy ==="

# Rebuild and restart api + web (nginx stays running)
echo "[1/3] Building and restarting api + web..."
docker compose up -d --build api web

# Wait for containers to be healthy
echo "[2/3] Waiting for services to start..."
sleep 3

# Reload nginx to pick up any config changes (DNS is dynamic, but reload is cheap)
echo "[3/3] Reloading nginx..."
docker compose exec nginx nginx -s reload 2>/dev/null || docker compose restart nginx

echo ""
echo "=== Deploy complete ==="
echo "Verifying health..."
sleep 1
# Health check via nginx (HTTPS with self-signed cert)
curl -skf https://localhost/api/health && echo "" && echo "API: OK" || echo "WARNING: API health check failed"
curl -sko /dev/null https://localhost/ && echo "Web: OK" || echo "WARNING: Web health check failed"
