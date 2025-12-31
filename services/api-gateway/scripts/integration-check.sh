#!/bin/bash

echo "=== INTEGRATION CHECK ==="
echo ""

echo "1. External API endpoints:"
echo "   api.molochain.com: $(curl -sk https://api.molochain.com/health/live -w '%{http_code}' -o /dev/null)"
echo ""

echo "2. Internal service connectivity:"
SERVICES=$(curl -s http://localhost:4000/health/services 2>/dev/null | grep -o '"status":"healthy"' | wc -l)
echo "   Healthy services: $SERVICES/10"
echo ""

echo "3. Redis integration:"
docker exec molochain-gateway-redis redis-cli ping 2>/dev/null
echo ""

echo "4. Nginx status:"
nginx -t 2>&1 | head -1
echo ""

echo "=== FOLDER ORGANIZATION CHECK ==="
cd /opt/molochain/services/api-gateway
echo ""
echo "Root files:"
ls -1 *.json *.yml *.ts Dockerfile 2>/dev/null | sed 's/^/  /'
echo ""
echo "Source structure:"
find src -type f -name "*.ts" 2>/dev/null | sort | sed 's/^/  /'
echo ""
echo "Test files:"
ls tests/load/ 2>/dev/null | sed 's/^/  /'
echo ""

echo "=== REQUIRED FILES CHECK ==="
FILES="src/index.ts src/config/services.ts src/routes/proxy.ts src/routes/health.ts src/routes/websocket.ts src/middleware/auth.ts src/middleware/metrics.ts src/middleware/rate-limit.ts src/middleware/cache.ts src/middleware/circuit-breaker.ts src/middleware/security.ts"
for f in $FILES; do
  if [ -f "$f" ]; then
    echo "  [OK] $f"
  else
    echo "  [MISSING] $f"
  fi
done
echo ""

echo "=== DOCKER NETWORK CHECK ==="
docker network ls | grep -E "molochain|rayanava" | awk '{print "  " $2}'
echo ""

echo "=== COMPLETE ==="
