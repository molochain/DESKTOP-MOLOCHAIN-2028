#!/bin/bash
set -e

DEPLOY_DIR="/var/www/vhosts/molochain.com/services"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "  Phase 2 Admin System Deployment"
echo "  Timestamp: $TIMESTAMP"
echo "=========================================="

echo ""
echo "[1/6] Creating backup of existing services..."
if [ -d "$DEPLOY_DIR/admin-standalone" ]; then
  tar -czf "$DEPLOY_DIR/../BACKUPS/admin-phase2-backup-$TIMESTAMP.tar.gz" \
    -C "$DEPLOY_DIR" admin-standalone database-admin ssl-checker 2>/dev/null || echo "Backup created (some dirs may not exist)"
fi

echo ""
echo "[2/6] Creating required directories..."
mkdir -p "$DEPLOY_DIR/container-monitor"
mkdir -p "$DEPLOY_DIR/notification-service"

echo ""
echo "[3/6] Stopping existing Phase 2 containers..."
cd "$DEPLOY_DIR/admin-standalone"
docker-compose down 2>/dev/null || true
docker stop container-monitor notification-service 2>/dev/null || true
docker rm container-monitor notification-service 2>/dev/null || true

echo ""
echo "[4/6] Files will be synced by rsync..."
echo "Ready to receive files."

echo ""
echo "[5/6] Building and starting containers..."
cd "$DEPLOY_DIR/admin-standalone"

if [ -z "$INTERNAL_API_KEY" ]; then
  echo "ERROR: INTERNAL_API_KEY environment variable must be set."
  echo "Please set it before running: export INTERNAL_API_KEY='your-secure-key'"
  exit 1
fi

docker-compose build --no-cache
docker-compose up -d

echo ""
echo "[6/6] Verifying deployment..."
sleep 10

echo ""
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "admin-frontend|database-admin|ssl-checker|container-monitor|notification-service" || echo "Some containers may still be starting..."

echo ""
echo "Health Checks:"
curl -s -o /dev/null -w "Admin Frontend: %{http_code}\n" http://localhost:7001/health
curl -s -o /dev/null -w "SSL Checker: %{http_code}\n" http://localhost:7002/health
curl -s -o /dev/null -w "Database Admin: %{http_code}\n" http://localhost:7003/health
curl -s -o /dev/null -w "Container Monitor: %{http_code}\n" http://localhost:7004/health
curl -s -o /dev/null -w "Notification Service: %{http_code}\n" http://localhost:7005/health

echo ""
echo "=========================================="
echo "  Phase 2 Deployment Complete!"
echo "=========================================="
