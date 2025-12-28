#!/bin/bash
# =============================================================================
# SSO Configuration Deployment Script
# Deploys cross-subdomain SSO updates to production
# =============================================================================

set -e

PROD_SERVER="molochain.com"
PROD_USER="${PROD_USER:-root}"
PROD_PATH="/var/www/molochain/current"
DOCKER_PATH="/var/www/vhosts/molochain.com/admin-docker"

echo "=========================================="
echo "MoloChain SSO Configuration Deployment"
echo "=========================================="
echo ""

# Check if we're running on production server or need to sync
if [[ "$1" == "--local" ]]; then
    echo "Running in local mode (on production server)"
    LOCAL_MODE=true
else
    echo "Running in sync mode (from development)"
    LOCAL_MODE=false
fi

# Function to sync files to production
sync_to_production() {
    echo ""
    echo "[1/4] Syncing configuration files to production..."
    
    # Sync PM2 config
    scp ecosystem.config.production.cjs ${PROD_USER}@${PROD_SERVER}:${PROD_PATH}/
    
    # Sync Docker config
    scp docker/docker-compose.yml ${PROD_USER}@${PROD_SERVER}:${DOCKER_PATH}/
    
    echo "✓ Configuration files synced"
}

# Function to restart PM2 services
restart_pm2() {
    echo ""
    echo "[2/4] Restarting PM2 services..."
    
    if [[ "$LOCAL_MODE" == "true" ]]; then
        cd ${PROD_PATH}
        pm2 reload ecosystem.config.production.cjs --update-env
        pm2 save
    else
        ssh ${PROD_USER}@${PROD_SERVER} "cd ${PROD_PATH} && pm2 reload ecosystem.config.production.cjs --update-env && pm2 save"
    fi
    
    echo "✓ PM2 services restarted"
}

# Function to restart Docker services (admin)
restart_docker() {
    echo ""
    echo "[3/4] Restarting Docker services (admin.molochain.com)..."
    
    if [[ "$LOCAL_MODE" == "true" ]]; then
        cd ${DOCKER_PATH}
        docker-compose pull
        docker-compose up -d --force-recreate
    else
        ssh ${PROD_USER}@${PROD_SERVER} "cd ${DOCKER_PATH} && docker-compose pull && docker-compose up -d --force-recreate"
    fi
    
    echo "✓ Docker services restarted"
}

# Function to validate SSO
validate_sso() {
    echo ""
    echo "[4/4] Validating SSO configuration..."
    echo ""
    
    # Test health endpoints
    echo "Testing health endpoints:"
    echo "  - Main app: https://molochain.com/api/health"
    echo "  - Admin app: https://admin.molochain.com/api/health"
    echo ""
    
    # Check main app
    MAIN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://molochain.com/api/health 2>/dev/null || echo "failed")
    if [[ "$MAIN_HEALTH" == "200" ]]; then
        echo "✓ Main app healthy (HTTP 200)"
    else
        echo "✗ Main app check failed (HTTP $MAIN_HEALTH)"
    fi
    
    # Check admin app
    ADMIN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://admin.molochain.com/api/health 2>/dev/null || echo "failed")
    if [[ "$ADMIN_HEALTH" == "200" ]]; then
        echo "✓ Admin app healthy (HTTP 200)"
    else
        echo "✗ Admin app check failed (HTTP $ADMIN_HEALTH)"
    fi
    
    echo ""
    echo "=========================================="
    echo "SSO Validation Commands"
    echo "=========================================="
    echo ""
    echo "Test login and check cookie domain:"
    echo ""
    echo "curl -v -X POST https://molochain.com/api/auth/login \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"admin@molochain.com\",\"password\":\"YOUR_PASSWORD\"}' \\"
    echo "  -c cookies.txt 2>&1 | grep -E 'Set-Cookie|molochain.sid'"
    echo ""
    echo "Expected: Set-Cookie header should show:"
    echo "  - Cookie name: molochain.sid"
    echo "  - Domain: .molochain.com"
    echo "  - SameSite=None"
    echo "  - Secure"
    echo ""
}

# Main execution
echo ""
echo "Starting deployment..."

if [[ "$LOCAL_MODE" != "true" ]]; then
    sync_to_production
fi

restart_pm2
restart_docker
validate_sso

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open browser DevTools > Application > Cookies"
echo "2. Login at https://molochain.com/login"
echo "3. Verify cookie 'molochain.sid' has domain '.molochain.com'"
echo "4. Navigate to https://admin.molochain.com - should be authenticated"
echo ""
