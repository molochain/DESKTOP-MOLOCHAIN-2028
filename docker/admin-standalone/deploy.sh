#!/bin/bash
# =============================================================================
# Admin Service Deployment Script
# Run from /var/www/vhosts/molochain.com/admin-docker/
# =============================================================================

set -e

echo "=========================================="
echo "  Molochain Admin Service Deployment"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Copy .env.example to .env and configure values"
    exit 1
fi

# Load environment
source .env

# Verify critical env vars
if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ]; then
    echo "ERROR: DATABASE_URL and JWT_SECRET must be set in .env"
    exit 1
fi

echo "Step 1: Stopping existing container (if any)..."
docker-compose down 2>/dev/null || true

echo "Step 2: Building admin service..."
docker-compose build --no-cache

echo "Step 3: Starting admin service..."
docker-compose up -d

echo "Step 4: Waiting for health check..."
sleep 10

# Health check
for i in {1..30}; do
    if curl -sf http://localhost:7000/api/health > /dev/null 2>&1; then
        echo "✅ Admin service is healthy!"
        break
    fi
    echo "Waiting for service to start... ($i/30)"
    sleep 2
done

# Final status
echo ""
echo "=========================================="
echo "  Deployment Complete"
echo "=========================================="
docker-compose ps
echo ""
echo "Logs: docker-compose logs -f admin"
echo "Health: curl http://localhost:7000/api/health"
