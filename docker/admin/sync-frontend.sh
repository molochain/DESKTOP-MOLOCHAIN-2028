#!/bin/bash
# sync-frontend.sh - Automated frontend asset sync for admin-docker
# Location: /var/www/vhosts/molochain.com/admin-docker/sync-frontend.sh
# Usage: ./sync-frontend.sh [--dry-run]

set -e

SOURCE_DIR="/var/www/vhosts/molochain.com/httpdocs/dist"
TARGET_DIR="/var/www/vhosts/molochain.com/admin-docker/server/public"
BACKUP_DIR="/var/www/vhosts/molochain.com/admin-docker/backups/frontend"
LOG_FILE="/var/www/vhosts/molochain.com/admin-docker/logs/sync-frontend.log"

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo "[DRY RUN MODE]"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting frontend sync..."

# Check source exists
if [ ! -d "$SOURCE_DIR" ]; then
    log "ERROR: Source directory does not exist: $SOURCE_DIR"
    exit 1
fi

# Create backup
if [ "$DRY_RUN" == "false" ]; then
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="frontend-$(date '+%Y%m%d-%H%M%S').tar.gz"
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$TARGET_DIR" . 2>/dev/null || true
    log "Backup created: $BACKUP_NAME"
    
    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
fi

# Sync files
if [ "$DRY_RUN" == "true" ]; then
    log "Would sync from $SOURCE_DIR to $TARGET_DIR"
    rsync -avnc --delete "$SOURCE_DIR/" "$TARGET_DIR/" 2>/dev/null | head -20
else
    rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"
    log "Files synced successfully"
    
    # Restart container to pick up changes
    docker restart molochain-admin
    log "Container restarted"
    
    # Wait for health check
    sleep 5
    if curl -sf http://localhost:7000/api/health | grep -q 'healthy'; then
        log "Health check passed"
    else
        log "WARNING: Health check may have failed"
    fi
fi

log "Sync complete"
