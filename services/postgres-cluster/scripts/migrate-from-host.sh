#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[MIGRATE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

SOURCE_HOST="${SOURCE_HOST:-localhost}"
SOURCE_PORT="${SOURCE_PORT:-5432}"
SOURCE_USER="${SOURCE_USER:-postgres}"
DATABASES="${DATABASES:-molochaindb mololinkdb}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/pg-migration}"

log "========================================="
log "PostgreSQL Migration: Host to Container"
log "========================================="
log "Source: ${SOURCE_HOST}:${SOURCE_PORT}"
log "Databases: ${DATABASES}"
log ""

read -p "This will migrate databases from host PostgreSQL to container. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Migration cancelled."
    exit 0
fi

mkdir -p "${BACKUP_DIR}"

log "Step 1: Dumping databases from source..."
for DB in ${DATABASES}; do
    DUMP_FILE="${BACKUP_DIR}/${DB}.dump"
    log "Dumping ${DB}..."
    
    pg_dump -h "${SOURCE_HOST}" -p "${SOURCE_PORT}" -U "${SOURCE_USER}" \
        -d "${DB}" -F c -f "${DUMP_FILE}" || error "Failed to dump ${DB}"
    
    SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
    log "Dumped ${DB}: ${SIZE}"
done

log "Step 2: Starting target container..."
cd "${PROJECT_DIR}"
docker-compose up -d molochain-postgres

log "Waiting for PostgreSQL to be ready..."
sleep 10
RETRY=0
while ! docker-compose exec -T molochain-postgres pg_isready -U molochain > /dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -gt 30 ]; then
        error "PostgreSQL container failed to start"
    fi
    echo -n "."
    sleep 2
done
log "PostgreSQL container is ready!"

log "Step 3: Restoring databases..."
for DB in ${DATABASES}; do
    DUMP_FILE="${BACKUP_DIR}/${DB}.dump"
    log "Restoring ${DB}..."
    
    docker-compose exec -T molochain-postgres psql -U molochain -c "DROP DATABASE IF EXISTS ${DB};" 2>/dev/null || true
    docker-compose exec -T molochain-postgres psql -U molochain -c "CREATE DATABASE ${DB};" || error "Failed to create ${DB}"
    
    cat "${DUMP_FILE}" | docker-compose exec -T molochain-postgres pg_restore -U molochain -d "${DB}" --no-owner --no-acl || {
        warn "Some errors during restore of ${DB} (may be normal)"
    }
    
    log "Restored ${DB}"
done

log "Step 4: Verifying migration..."
for DB in ${DATABASES}; do
    TABLE_COUNT=$(docker-compose exec -T molochain-postgres psql -U molochain -d "${DB}" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
    log "${DB}: ${TABLE_COUNT} tables"
done

log "Step 5: Cleanup..."
rm -rf "${BACKUP_DIR}"

log "========================================="
log "Migration completed successfully!"
log "========================================="
log ""
log "Next steps:"
log "1. Update application connection strings to use new container"
log "2. Test all database connections"
log "3. Stop host PostgreSQL when ready: sudo systemctl stop postgresql"
