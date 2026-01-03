#!/bin/bash
# Package Ecosystem Registry for Production Deployment
# Creates a tarball with all necessary files for the ecosystem registry deployment

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="ecosystem-registry-${TIMESTAMP}.tar.gz"
PACKAGE_DIR="deploy/packages"

echo "=========================================="
echo "Packaging Ecosystem Registry Deployment"
echo "=========================================="

mkdir -p "$PACKAGE_DIR"

echo "[1/4] Creating deployment package..."

tar -czf "${PACKAGE_DIR}/${PACKAGE_NAME}" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  server/services/ecosystem-health-worker.ts \
  server/services/webhook-delivery.ts \
  server/routes/ecosystem-registry.ts \
  server/routes/ecosystem-metrics.ts \
  server/registrars/ecosystem.registrar.ts \
  server/scripts/seed-ecosystem-services.ts \
  shared/schema.ts \
  docs/ECOSYSTEM_DEPLOYMENT_RUNBOOK.md

echo "[2/4] Package created: ${PACKAGE_DIR}/${PACKAGE_NAME}"

echo "[3/4] Package contents:"
tar -tzf "${PACKAGE_DIR}/${PACKAGE_NAME}"

echo "[4/4] Package size: $(du -h ${PACKAGE_DIR}/${PACKAGE_NAME} | cut -f1)"

echo ""
echo "=========================================="
echo "Package ready for deployment!"
echo "=========================================="
echo ""
echo "To deploy to production:"
echo "  1. scp ${PACKAGE_DIR}/${PACKAGE_NAME} root@31.186.24.19:/tmp/"
echo "  2. SSH to server: ssh root@31.186.24.19"
echo "  3. Extract: tar -xzf /tmp/${PACKAGE_NAME} -C /var/www/vhosts/molochain.com/molochain-core/"
echo "  4. Follow: docs/ECOSYSTEM_DEPLOYMENT_RUNBOOK.md"
echo ""
