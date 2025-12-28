#!/bin/bash
# =============================================================================
# Admin Service Rollback Script
# Stops the admin container and restores static serving
# =============================================================================

set -e

echo "=========================================="
echo "  Admin Service Rollback"
echo "=========================================="

echo "Step 1: Stopping admin container..."
docker-compose down 2>/dev/null || true

echo "Step 2: Removing container and image..."
docker rm molochain-admin 2>/dev/null || true
docker rmi admin-docker_admin 2>/dev/null || true

echo "=========================================="
echo "  Rollback Complete"
echo "=========================================="
echo ""
echo "The admin.molochain.com subdomain will now serve"
echo "static files from /var/www/vhosts/molochain.com/admin.molochain.com/"
echo ""
echo "To restore the Docker service, run: ./deploy.sh"
