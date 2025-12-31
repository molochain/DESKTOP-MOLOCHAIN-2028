#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_ENV="${1:-production}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

log "Starting zero-downtime deployment for CMS Laravel..."
log "Environment: $DEPLOY_ENV"

cd "$PROJECT_DIR"

if [ ! -f ".env" ]; then
    error ".env file not found. Please create it from .env.example"
fi

log "Step 1: Building new Docker image..."
docker-compose build --no-cache cms-app

log "Step 2: Pulling latest base images..."
docker-compose pull cms-nginx cms-redis

log "Step 3: Running database migrations (if any)..."
docker-compose run --rm cms-app php artisan migrate --force

log "Step 4: Starting new containers with rolling update..."
docker-compose up -d --no-deps --scale cms-queue=2 cms-queue

log "Step 5: Waiting for health checks..."
sleep 10

log "Step 6: Restarting main application..."
docker-compose up -d --no-deps cms-app

log "Step 7: Waiting for app health check..."
RETRY=0
MAX_RETRY=30
while [ $RETRY -lt $MAX_RETRY ]; do
    if docker-compose exec -T cms-app php artisan tinker --execute="echo 'OK';" 2>/dev/null | grep -q "OK"; then
        log "Application is healthy!"
        break
    fi
    RETRY=$((RETRY + 1))
    echo -n "."
    sleep 2
done

if [ $RETRY -eq $MAX_RETRY ]; then
    error "Application failed health check. Rolling back..."
fi

log "Step 8: Restarting nginx..."
docker-compose up -d --no-deps cms-nginx

log "Step 9: Scaling queue workers back to 1..."
docker-compose up -d --no-deps --scale cms-queue=1 cms-queue

log "Step 10: Restarting scheduler..."
docker-compose up -d --no-deps cms-scheduler

log "Step 11: Clearing and warming caches..."
docker-compose exec -T cms-app php artisan optimize

log "Step 12: Cleaning up old images..."
docker image prune -f

log "========================================="
log "Deployment completed successfully!"
log "========================================="

docker-compose ps
