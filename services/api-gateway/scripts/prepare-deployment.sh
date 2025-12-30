#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATEWAY_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$GATEWAY_DIR/dist"
DEPLOY_DIR="$GATEWAY_DIR/deploy-package"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TARBALL="api-gateway-$TIMESTAMP.tar.gz"

echo "=== API Gateway Deployment Package Builder ==="
echo ""

cd "$GATEWAY_DIR"

echo "1. Installing dependencies..."
npm install --production=false

echo "2. Building TypeScript..."
npm run build

echo "3. Creating deployment package..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

cp -r dist "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
cp Dockerfile "$DEPLOY_DIR/"
cp docker-compose.yml "$DEPLOY_DIR/"
cp -r nginx "$DEPLOY_DIR/"

mkdir -p "$DEPLOY_DIR/scripts"
cat > "$DEPLOY_DIR/scripts/deploy.sh" << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "=== API Gateway Production Deployment ==="

if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET environment variable is required"
    exit 1
fi

echo "1. Creating external Docker networks (if not exist)..."
docker network create molochain-ecosystem 2>/dev/null || true
docker network create rayanava-ai_default 2>/dev/null || true

echo "2. Building and starting containers..."
docker-compose up -d --build

echo "3. Waiting for health check..."
sleep 5
curl -f http://localhost:4000/health/live || { echo "Health check failed"; exit 1; }

echo "4. Deployment complete!"
docker-compose ps
DEPLOY_SCRIPT
chmod +x "$DEPLOY_DIR/scripts/deploy.sh"

echo "4. Creating tarball..."
tar -czf "$TARBALL" -C "$DEPLOY_DIR" .

echo ""
echo "=== Deployment Package Ready ==="
echo "Package: $GATEWAY_DIR/$TARBALL"
echo ""
echo "To deploy to production:"
echo "  1. Upload $TARBALL to production server"
echo "  2. Extract: tar -xzf $TARBALL"
echo "  3. Set environment: export JWT_SECRET=your-secret"
echo "  4. Run: ./scripts/deploy.sh"
echo ""
echo "NGINX Configuration:"
echo "  Copy nginx/*.conf to /etc/nginx/sites-available/"
echo "  Create symlinks in /etc/nginx/sites-enabled/"
echo "  Run: sudo nginx -t && sudo systemctl reload nginx"
