#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       COMPREHENSIVE PRODUCTION SERVER SCAN                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "┌─ 1. SERVER INFO ────────────────────────────────────────────┐"
echo "  Host: $(hostname)"
echo "  IP: $(hostname -I | awk '{print $1}')"
echo "  Uptime: $(uptime -p)"
echo "  Disk: $(df -h / | tail -1 | awk '{print $5 " used"}')"
echo ""

echo "┌─ 2. DOCKER CONTAINERS ───────────────────────────────────────┐"
docker ps --format "  {{.Names}}: {{.Status}}" | head -20
echo ""
echo "  Total containers: $(docker ps -q | wc -l)"
echo ""

echo "┌─ 3. API GATEWAY STATUS ──────────────────────────────────────┐"
cd /opt/molochain/services/api-gateway
echo "  Directory: $(pwd)"
echo "  Container: $(docker ps --filter name=molochain-api-gateway --format '{{.Status}}')"
echo ""

echo "┌─ 4. NGINX SUBDOMAINS ────────────────────────────────────────┐"
ls /etc/nginx/conf.d/*.conf 2>/dev/null | xargs -I {} basename {} | sed 's/^/  /'
echo ""

echo "┌─ 5. REDIS STATUS ───────────────────────────────────────────┐"
docker exec molochain-gateway-redis redis-cli ping 2>/dev/null || echo "  Checking redis..."
docker ps --filter name=redis --format "  {{.Names}}: {{.Status}}"
echo ""

echo "┌─ 6. DATABASE STATUS ─────────────────────────────────────────┐"
docker ps --filter name=postgres --format "  {{.Names}}: {{.Status}}" | head -5
echo ""

echo "┌─ 7. API GATEWAY SERVICES ────────────────────────────────────┐"
curl -s http://localhost:4000/health/services 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    for s in d['services']:
        icon = 'OK' if s['status']=='healthy' else 'FAIL'
        print(f\"  [{icon}] {s['name']}: {s['responseTime']}ms\")
except: print('  Error reading services')
"
echo ""

echo "┌─ 8. API ROUTES TEST ─────────────────────────────────────────┐"
echo "  Health endpoints:"
echo "    /health/live:     $(curl -sk https://api.molochain.com/health/live -w '%{http_code}' -o /dev/null)"
echo "    /health/ready:    $(curl -sk https://api.molochain.com/health/ready -w '%{http_code}' -o /dev/null)"
echo "    /health/services: $(curl -sk https://api.molochain.com/health/services -w '%{http_code}' -o /dev/null)"
echo ""
echo "  API routes:"
echo "    /api/v1: $(curl -sk https://api.molochain.com/api/v1/health -w '%{http_code}' -o /dev/null)"
echo "    /api/v2: $(curl -sk https://api.molochain.com/api/v2/health -w '%{http_code}' -o /dev/null)"
echo "    /api/mololink: $(curl -sk https://api.molochain.com/api/mololink/health -w '%{http_code}' -o /dev/null)"
echo "    /api/ai: $(curl -sk https://api.molochain.com/api/ai/health -w '%{http_code}' -o /dev/null)"
echo "    /api/comms: $(curl -sk https://api.molochain.com/api/comms/health -w '%{http_code}' -o /dev/null)"
echo ""
echo "  Security:"
echo "    /metrics: $(curl -sk https://api.molochain.com/metrics -w '%{http_code}' -o /dev/null)"
echo "    /schema: $(curl -sk https://api.molochain.com/schema -w '%{http_code}' -o /dev/null)"
echo ""

echo "┌─ 9. FILE STRUCTURE ─────────────────────────────────────────┐"
cd /opt/molochain/services/api-gateway
echo "  Root files:"
ls -1 *.ts *.json *.yml 2>/dev/null | sed 's/^/    /'
echo "  src/config/:"
ls src/config/ 2>/dev/null | sed 's/^/    /'
echo "  src/middleware/:"
ls src/middleware/ 2>/dev/null | sed 's/^/    /'
echo "  src/routes/:"
ls src/routes/ 2>/dev/null | sed 's/^/    /'
echo "  src/utils/:"
ls src/utils/ 2>/dev/null | sed 's/^/    /'
echo "  tests/load/:"
ls tests/load/ 2>/dev/null | sed 's/^/    /'
echo ""

echo "┌─ 10. PROMETHEUS METRICS ─────────────────────────────────────┐"
echo "  Total lines: $(curl -s http://localhost:4000/metrics | wc -l)"
echo "  HTTP metrics: $(curl -s http://localhost:4000/metrics | grep -c gateway_http)"
echo "  WS metrics: $(curl -s http://localhost:4000/metrics | grep -c gateway_ws)"
echo "  Cache metrics: $(curl -s http://localhost:4000/metrics | grep -c gateway_cache)"
echo "  Circuit metrics: $(curl -s http://localhost:4000/metrics | grep -c gateway_circuit)"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    SCAN COMPLETE                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
