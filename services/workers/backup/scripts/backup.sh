#!/bin/bash
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATABASES="${DATABASES:-molochaindb mololinkdb cmsdb}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2; exit 1; }

mkdir -p "${BACKUP_DIR}/daily" "${BACKUP_DIR}/weekly"

log "========================================="
log "PostgreSQL Backup Started"
log "========================================="
log "Host: ${PGHOST}"
log "Databases: ${DATABASES}"

FAILED_DBS=""
SUCCESS_COUNT=0

for DB in ${DATABASES}; do
    BACKUP_FILE="${BACKUP_DIR}/daily/${DB}-${DATE}.dump"
    log "Backing up ${DB}..."
    
    if pg_dump -h "${PGHOST}" -p "${PGPORT:-5432}" -U "${PGUSER}" \
        -d "${DB}" -F c -Z 9 -f "${BACKUP_FILE}" 2>/dev/null; then
        
        SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
        log "Success: ${DB} (${SIZE})"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        
        if [ "$DAY_OF_WEEK" = "7" ]; then
            cp "${BACKUP_FILE}" "${BACKUP_DIR}/weekly/${DB}-${DATE}.dump"
            log "Weekly backup created for ${DB}"
        fi
    else
        log "FAILED: ${DB}"
        FAILED_DBS="${FAILED_DBS} ${DB}"
    fi
done

log "Cleaning up old backups..."
find "${BACKUP_DIR}/daily" -name "*.dump" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}/weekly" -name "*.dump" -mtime +90 -delete

TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

log "========================================="
log "Backup Summary"
log "========================================="
log "Successful: ${SUCCESS_COUNT}"
log "Failed: ${FAILED_DBS:-none}"
log "Total storage: ${TOTAL_SIZE}"
log "========================================="

if [ -n "${FAILED_DBS}" ]; then
    exit 1
fi
