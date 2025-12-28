#!/bin/bash
# MoloChain Production Deployment Script
# Run this from your Replit project or local machine

set -e

# Configuration
SERVER="root@molochain.com"
DEPLOY_PATH="/var/www/vhosts/molochain.com/molochain-core"
BACKUP_PATH="/var/www/vhosts/molochain.com/BACKUPS"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "MoloChain Production Deployment"
echo "=========================================="

# Step 1: Build production assets
echo "[1/6] Building production assets..."
npm run build

# Step 2: Create deployment package (includes all needed files)
echo "[2/6] Creating deployment package..."
tar --exclude='node_modules' --exclude='.git' --exclude='*.log' -czf deploy/molochain-deploy-${TIMESTAMP}.tar.gz \
    dist/ \
    db/ \
    shared/ \
    package.json \
    package-lock.json \
    ecosystem.config.production.cjs \
    deploy/.env.production \
    deploy/nginx-molochain.conf \
    deploy/DEPLOYMENT_GUIDE.md

echo "[3/6] Uploading to production server..."
scp deploy/molochain-deploy-${TIMESTAMP}.tar.gz ${SERVER}:${DEPLOY_PATH}/

echo "[4/6] Connecting to server for deployment..."
ssh ${SERVER} << 'ENDSSH'
cd /var/www/vhosts/molochain.com/molochain-core

# Backup current deployment
echo "Creating backup..."
BACKUP_NAME="molochain-backup-$(date +%Y%m%d_%H%M%S)"
tar -czf ../BACKUPS/${BACKUP_NAME}.tar.gz dist/ --ignore-failed-read 2>/dev/null || true

# Extract new deployment
echo "Extracting new deployment..."
LATEST_DEPLOY=$(ls -t molochain-deploy-*.tar.gz | head -1)
tar -xzf ${LATEST_DEPLOY}

# Install dependencies
echo "Installing production dependencies..."
npm ci --production

# Copy production environment from the extracted deploy folder
echo "Setting up environment..."
cp deploy/.env.production .env

# Create logs directory if not exists
mkdir -p logs

# Restart PM2 with production environment
echo "Restarting application..."
pm2 delete molochain-core 2>/dev/null || true
pm2 start ecosystem.config.production.cjs --env production

# Save PM2 process list
pm2 save

# Cleanup old deployment packages (keep last 3)
ls -t molochain-deploy-*.tar.gz | tail -n +4 | xargs rm -f 2>/dev/null || true

echo "Deployment complete!"
pm2 status molochain-core
pm2 logs molochain-core --lines 20
ENDSSH

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo "Visit: https://molochain.com"
