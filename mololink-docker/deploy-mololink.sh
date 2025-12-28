#!/bin/bash
# ===========================================
# MOLOLINK DEPLOYMENT SCRIPT v3.0
# ===========================================
# This script deploys the Mololink service to production
# Run on the production server with: bash deploy-mololink.sh
# ===========================================

set -e

echo "==========================================="
echo "MOLOLINK DEPLOYMENT SCRIPT v3.0"
echo "==========================================="

# Configuration
MOLOLINK_DOCKER_DIR="/var/www/vhosts/molochain.com/mololink-docker"
MOLOLINK_FRONTEND_DIR="/var/www/vhosts/molochain.com/mololink.molochain.com"
CONTAINER_NAME="mololink-app"
NETWORK_NAME="molochain-core"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        log_warn "Running without root privileges. Some operations may fail."
    fi
}

# Step 1: Deploy Frontend (index.html)
deploy_frontend() {
    log_info "Step 1: Deploying Frontend..."
    
    if [ -f "public/index.html" ]; then
        cp public/index.html "$MOLOLINK_FRONTEND_DIR/index.html"
        log_info "Frontend deployed to $MOLOLINK_FRONTEND_DIR/index.html"
    else
        log_error "public/index.html not found!"
        exit 1
    fi
    
    # Set proper permissions
    chown -R nginx:nginx "$MOLOLINK_FRONTEND_DIR" 2>/dev/null || true
    chmod 644 "$MOLOLINK_FRONTEND_DIR/index.html"
    
    log_info "Frontend deployment complete!"
}

# Step 2: Update Docker Files
update_docker_files() {
    log_info "Step 2: Updating Docker configuration..."
    
    # Copy Docker files if directory exists
    if [ -d "$MOLOLINK_DOCKER_DIR" ]; then
        cp Dockerfile "$MOLOLINK_DOCKER_DIR/"
        cp docker-compose.yml "$MOLOLINK_DOCKER_DIR/"
        cp server.js "$MOLOLINK_DOCKER_DIR/"
        cp package.json "$MOLOLINK_DOCKER_DIR/"
        [ -f ".env" ] && cp .env "$MOLOLINK_DOCKER_DIR/"
        log_info "Docker files updated in $MOLOLINK_DOCKER_DIR"
    else
        log_warn "Docker directory not found. Creating..."
        mkdir -p "$MOLOLINK_DOCKER_DIR"
        cp -r . "$MOLOLINK_DOCKER_DIR/"
        log_info "Docker directory created and files copied"
    fi
}

# Step 3: Rebuild and Restart Docker Container
rebuild_container() {
    log_info "Step 3: Rebuilding Docker container..."
    
    cd "$MOLOLINK_DOCKER_DIR"
    
    # Stop existing container
    if docker ps -a | grep -q "$CONTAINER_NAME"; then
        log_info "Stopping existing container..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
    fi
    
    # Ensure network exists
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        log_info "Creating Docker network..."
        docker network create "$NETWORK_NAME"
    fi
    
    # Build new image
    log_info "Building Docker image..."
    docker-compose build --no-cache
    
    # Start container
    log_info "Starting container..."
    docker-compose up -d
    
    # Wait for container to be healthy
    log_info "Waiting for container health check..."
    sleep 5
    
    # Verify container is running
    if docker ps | grep -q "$CONTAINER_NAME"; then
        log_info "Container $CONTAINER_NAME is running!"
    else
        log_error "Container failed to start!"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
}

# Step 4: Verify Deployment
verify_deployment() {
    log_info "Step 4: Verifying deployment..."
    
    # Check frontend
    if [ -f "$MOLOLINK_FRONTEND_DIR/index.html" ]; then
        FRONTEND_SIZE=$(wc -c < "$MOLOLINK_FRONTEND_DIR/index.html")
        log_info "Frontend file size: $FRONTEND_SIZE bytes"
        
        # Check for v3 features
        if grep -q "activeTab.*connections\|getAuctions\|getSsoConfig" "$MOLOLINK_FRONTEND_DIR/index.html"; then
            log_info "Frontend v3 features verified (tabs, SSO, marketplace)"
        else
            log_warn "Frontend may be outdated - v3 features not detected"
        fi
    else
        log_error "Frontend file not found!"
    fi
    
    # Check backend API
    log_info "Testing backend health endpoint..."
    if curl -sf "http://localhost:5001/health" > /dev/null; then
        log_info "Backend health check: OK"
    else
        log_warn "Backend health check failed (may need a moment to start)"
    fi
    
    # Check SSO config endpoint
    log_info "Testing SSO config endpoint..."
    SSO_RESPONSE=$(curl -sf "http://localhost:5001/api/sso/config" 2>/dev/null)
    if echo "$SSO_RESPONSE" | grep -q "auth.molochain.com"; then
        log_info "SSO config endpoint: OK"
    else
        log_warn "SSO config may not be properly configured"
    fi
}

# Step 5: Display Status
display_status() {
    echo ""
    echo "==========================================="
    echo "DEPLOYMENT COMPLETE"
    echo "==========================================="
    echo ""
    echo "Frontend URL: https://mololink.molochain.com"
    echo "API Base: https://mololink.molochain.com/api"
    echo "Health Check: https://mololink.molochain.com/health"
    echo ""
    echo "Docker Status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "To view logs: docker logs -f $CONTAINER_NAME"
    echo "==========================================="
}

# Main execution
main() {
    check_permissions
    deploy_frontend
    update_docker_files
    rebuild_container
    verify_deployment
    display_status
}

# Run if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
