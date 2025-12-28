#!/bin/bash
set -e

echo "======================================"
echo "  MOLOCHAIN-CORE PRODUCTION BUILD"
echo "======================================"

PROJECT_DIR="/var/www/vhosts/molochain.com/molochain-core"
HTTPDOCS="/var/www/vhosts/molochain.com/httpdocs"
BACKUP_DIR="/var/www/vhosts/molochain.com/BACKUPS"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cd "$PROJECT_DIR"

echo ""
echo "[1/8] Creating backup of current build..."
if [ -d "$HTTPDOCS" ] && [ "$(ls -A $HTTPDOCS 2>/dev/null)" ]; then
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/httpdocs-$TIMESTAMP.tar.gz" -C "$HTTPDOCS" . 2>/dev/null || true
    echo "  ✓ Backup created: $BACKUP_DIR/httpdocs-$TIMESTAMP.tar.gz"
else
    echo "  ✓ No existing build to backup"
fi

echo ""
echo "[2/8] Cleaning previous build artifacts..."
rm -rf dist
mkdir -p dist/public
echo "  ✓ Build directory cleaned"

echo ""
echo "[3/8] Installing production dependencies..."
npm ci --production=false --prefer-offline 2>/dev/null || npm install
echo "  ✓ Dependencies installed"

echo ""
echo "[4/8] Building frontend with production Vite config..."
npx vite build --config vite.config.production.ts
echo "  ✓ Frontend built with code splitting and compression"

echo ""
echo "[5/8] Building backend with esbuild..."
npx esbuild server/index.ts \
    --platform=node \
    --packages=external \
    --bundle \
    --format=esm \
    --minify \
    --sourcemap=external \
    --outdir=dist \
    --target=node20
echo "  ✓ Backend bundled and minified"

echo ""
echo "[6/8] Copying static assets to httpdocs..."
# Preserve Plesk-managed directories
PRESERVE_DIRS=(".well-known" "plesk-stat" "cgi-bin" "error_docs")
TEMP_PRESERVE="/tmp/httpdocs_preserve_$$"
mkdir -p "$TEMP_PRESERVE"
for dir in "${PRESERVE_DIRS[@]}"; do
    if [ -d "$HTTPDOCS/$dir" ]; then
        cp -r "$HTTPDOCS/$dir" "$TEMP_PRESERVE/" 2>/dev/null || true
    fi
done

# Remove old files but keep preserved dirs
find "$HTTPDOCS" -mindepth 1 -maxdepth 1 ! -name '.well-known' ! -name 'plesk-stat' ! -name 'cgi-bin' ! -name 'error_docs' -exec rm -rf {} \; 2>/dev/null || true

# Copy new build
cp -r dist/public/* "$HTTPDOCS/"

# Restore preserved dirs if they were overwritten
for dir in "${PRESERVE_DIRS[@]}"; do
    if [ -d "$TEMP_PRESERVE/$dir" ]; then
        rm -rf "$HTTPDOCS/$dir" 2>/dev/null || true
        cp -r "$TEMP_PRESERVE/$dir" "$HTTPDOCS/" 2>/dev/null || true
    fi
done
rm -rf "$TEMP_PRESERVE"
echo "  ✓ Static assets deployed to httpdocs (preserved .well-known, plesk-stat)"

echo ""
echo "[7/8] Setting file permissions..."
chown -R $(whoami):$(whoami) "$HTTPDOCS" 2>/dev/null || true
find "$HTTPDOCS" -type d -exec chmod 755 {} \;
find "$HTTPDOCS" -type f -exec chmod 644 {} \;
echo "  ✓ Permissions set"

echo ""
echo "[8/8] Restarting Node.js application..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.production.cjs --env production || \
    pm2 start ecosystem.config.production.cjs --env production
    echo "  ✓ Application restarted via PM2"
else
    echo "  ⚠ PM2 not found. Install with: npm install -g pm2"
    echo "  Then run: pm2 start ecosystem.config.production.cjs --env production"
fi

echo ""
echo "======================================"
echo "  BUILD COMPLETE!"
echo "======================================"
echo ""
echo "Build summary:"
echo "  - Frontend: $HTTPDOCS"
echo "  - Backend: $PROJECT_DIR/dist/index.js"
echo "  - Backup: $BACKUP_DIR/httpdocs-$TIMESTAMP.tar.gz"
echo ""
echo "Next steps:"
echo "  1. Verify the app at https://molochain.com"
echo "  2. Check PM2 status: pm2 status"
echo "  3. View logs: pm2 logs molochain-core"
echo ""
