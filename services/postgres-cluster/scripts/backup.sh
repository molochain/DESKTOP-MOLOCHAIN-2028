#!/bin/bash
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATABASES="molochaindb mololinkdb cmsdb"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2; exit 1; }

mkdir -p "${BACKUP_DIR}/daily" "${BACKUP_DIR}/wal"

log "Starting PostgreSQL backup..."
log "Databases: ${DATABASES}"

for DB in ${DATABASES}; do
    BACKUP_FILE="${BACKUP_DIR}/daily/${DB}-${DATE}.sql.gz"
    log "Backing up ${DB}..."
    
    pg_dump -h "${PGHOST}" -U "${PGUSER}" -d "${DB}" -F c -Z 9 -f "${BACKUP_FILE}" || {
        error "Failed to backup ${DB}"
    }
    
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup complete: ${BACKUP_FILE} (${SIZE})"
done

log "Verifying backups..."
for DB in ${DATABASES}; do
    BACKUP_FILE="${BACKUP_DIR}/daily/${DB}-${DATE}.sql.gz"
    if pg_restore --list "${BACKUP_FILE}" > /dev/null 2>&1; then
        log "Verification passed: ${DB}"
    else
        error "Verification failed for ${DB}"
    fi
done

log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}/daily" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}/wal" -name "*.gz" -mtime +${RETENTION_DAYS} -delete

DELETED_COUNT=$(find "${BACKUP_DIR}/daily" -name "*.sql.gz" -mtime +${RETENTION_DAYS} 2>/dev/null | wc -l)
log "Deleted ${DELETED_COUNT} old backup files"

TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log "Total backup storage: ${TOTAL_SIZE}"

log "========================================="
log "Backup completed successfully!"
log "========================================="
