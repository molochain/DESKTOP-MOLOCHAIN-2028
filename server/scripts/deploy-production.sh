#!/bin/bash

# =============================================================================
# Production Deployment Script for Molochain
# =============================================================================
# This script deploys the frontend to the Plesk server httpdocs directory.
# Run this script from the project root via SSH on the Plesk server.
#
# Usage: bash server/scripts/deploy-production.sh
# =============================================================================

set -e

# Configuration
PROJECT_ROOT="/var/www/vhosts/molochain.com/molochain-core"
BUILD_OUTPUT="${PROJECT_ROOT}/dist/public"
WEB_ROOT="/var/www/vhosts/molochain.com/httpdocs"
BACKUP_DIR="/var/www/vhosts/molochain.com/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=============================================="
echo "  Molochain Production Deployment"
echo "  $(date)"
echo "=============================================="

# Step 1: Navigate to project root
echo -e "\n${YELLOW}[1/7] Navigating to project directory...${NC}"
cd "$PROJECT_ROOT"
echo -e "${GREEN}✓ Working directory: $(pwd)${NC}"

# Step 2: Set production environment variables
echo -e "\n${YELLOW}[2/7] Setting production environment variables...${NC}"
export NODE_ENV=production
export VITE_APP_ENV=production
export VITE_API_CMS_BASE_URL=https://cms.molochain.com/api
export VITE_API_OTMS_BASE_URL=https://opt.molochain.com/v1
export VITE_API_GODLAYER_BASE_URL=https://molochain.com/api
echo -e "${GREEN}✓ Environment variables set${NC}"

# Step 3: Install dependencies (if needed)
echo -e "\n${YELLOW}[3/7] Checking dependencies...${NC}"
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "Installing dependencies..."
    npm ci --production=false
else
    echo "Dependencies up to date"
fi
echo -e "${GREEN}✓ Dependencies ready${NC}"

# Step 4: Build the frontend
echo -e "\n${YELLOW}[4/7] Building frontend for production...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed${NC}"

# Step 5: Verify build output exists
echo -e "\n${YELLOW}[5/7] Verifying build output...${NC}"
if [ ! -d "$BUILD_OUTPUT" ]; then
    echo -e "${RED}ERROR: Build output directory not found: $BUILD_OUTPUT${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build output verified at $BUILD_OUTPUT${NC}"

# Step 6: Backup current httpdocs (optional but recommended)
echo -e "\n${YELLOW}[6/7] Creating backup of current deployment...${NC}"
mkdir -p "$BACKUP_DIR"
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT 2>/dev/null)" ]; then
    tar -czf "$BACKUP_DIR/httpdocs_backup_$TIMESTAMP.tar.gz" -C "$WEB_ROOT" . 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created: httpdocs_backup_$TIMESTAMP.tar.gz${NC}"
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t httpdocs_backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
    cd "$PROJECT_ROOT"
else
    echo "No existing files to backup"
fi

# Step 7: Deploy to httpdocs
echo -e "\n${YELLOW}[7/7] Deploying to web root...${NC}"

# Clear existing files (except .htaccess and any special files)
find "$WEB_ROOT" -mindepth 1 -maxdepth 1 ! -name '.htaccess' ! -name '.well-known' -exec rm -rf {} + 2>/dev/null || true

# Copy new build files
cp -r "$BUILD_OUTPUT"/* "$WEB_ROOT/"

# Set proper permissions
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
find "$WEB_ROOT" -type f -exec chmod 644 {} \;

echo -e "${GREEN}✓ Deployment completed${NC}"

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}  DEPLOYMENT SUCCESSFUL${NC}"
echo "=============================================="
echo "  Deployed from: $BUILD_OUTPUT"
echo "  Deployed to:   $WEB_ROOT"
echo "  Timestamp:     $TIMESTAMP"
echo ""
echo "  Your site should now be live at:"
echo "  https://molochain.com"
echo "=============================================="
