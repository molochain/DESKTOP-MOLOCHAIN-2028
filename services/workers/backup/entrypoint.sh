#!/bin/bash
set -e

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [BACKUP] $1"; }

log "Starting backup worker..."
log "Schedule: ${BACKUP_SCHEDULE:-0 2 * * *}"
log "Retention: ${BACKUP_RETENTION_DAYS:-30} days"

touch /tmp/backup-healthy

run_backup() {
    log "Executing scheduled backup..."
    /app/scripts/backup.sh
    
    if [ -n "${SLACK_WEBHOOK_URL}" ]; then
        /app/scripts/notify.sh "Backup completed successfully"
    fi
}

parse_cron_time() {
    local schedule="${1:-0 2 * * *}"
    local minute=$(echo "$schedule" | awk '{print $1}')
    local hour=$(echo "$schedule" | awk '{print $2}')
    printf "%02d:%02d" "$hour" "$minute"
}

BACKUP_TIME=$(parse_cron_time "${BACKUP_SCHEDULE}")
log "Backup scheduled for: ${BACKUP_TIME}"

LAST_RUN_DATE=""

while true; do
    CURRENT_TIME=$(date +%H:%M)
    CURRENT_DATE=$(date +%Y-%m-%d)
    
    if [ "$CURRENT_TIME" = "$BACKUP_TIME" ] && [ "$CURRENT_DATE" != "$LAST_RUN_DATE" ]; then
        run_backup
        LAST_RUN_DATE="$CURRENT_DATE"
    fi
    
    touch /tmp/backup-healthy
    sleep 30
done
