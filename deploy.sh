#!/usr/bin/env bash
set -euo pipefail

echo "=== Mentor OS Deploy ==="

# Rebuild and restart api + web (nginx stays running)
echo "[1/4] Building and restarting api + web..."
docker compose up -d --build api web

# Wait for containers to start
echo "[2/4] Waiting for services to start..."
sleep 5

# Check web container is actually running (not crash-looping)
echo "[3/4] Checking container health..."
WEB_STATUS=$(docker inspect --format='{{.State.Status}}' mentor-web 2>/dev/null || echo "missing")
API_STATUS=$(docker inspect --format='{{.State.Status}}' mentor-api 2>/dev/null || echo "missing")

echo "  mentor-web: $WEB_STATUS"
echo "  mentor-api: $API_STATUS"

if [ "$WEB_STATUS" != "running" ]; then
    echo ""
    echo "ERROR: mentor-web is not running! Logs:"
    docker logs mentor-web --tail=30 2>&1
    echo ""
    echo "Trying to fix: rebuilding web without cache..."
    docker compose build --no-cache web
    docker compose up -d web
    sleep 5
fi

if [ "$API_STATUS" != "running" ]; then
    echo ""
    echo "ERROR: mentor-api is not running! Logs:"
    docker logs mentor-api --tail=30 2>&1
fi

# Reload nginx
echo "[4/4] Reloading nginx..."
docker compose exec nginx nginx -s reload 2>/dev/null || docker compose restart nginx

echo ""
echo "=== Deploy complete ==="
echo "Verifying health..."
sleep 2

curl -skf https://localhost/api/health && echo "" && echo "API: OK" || echo "FAIL: API unreachable"

# Actually check for 200, not just any response
HTTP_CODE=$(curl -sko /dev/null -w '%{http_code}' https://localhost/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "Web: OK (HTTP $HTTP_CODE)"
else
    echo "FAIL: Web returned HTTP $HTTP_CODE"
    echo "Web container logs:"
    docker logs mentor-web --tail=15 2>&1
fi
