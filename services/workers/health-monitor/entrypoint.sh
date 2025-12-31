#!/bin/bash

LOG_FILE="/var/log/health-monitor/health.log"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
CONTAINERS="${CONTAINERS_TO_MONITOR:-molochain-admin,molochain-app,molochain-api-gateway}"

log() { 
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

alert() {
    local msg="$1"
    local severity="${2:-error}"
    log "ALERT [$severity]: $msg"
    /app/scripts/notify.sh "$msg" "$severity"
}

check_container() {
    local name="$1"
    local status=$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null)
    local health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$name" 2>/dev/null)
    
    if [ -z "$status" ]; then
        echo "not-found"
        return 1
    fi
    
    if [ "$status" != "running" ]; then
        echo "stopped"
        return 1
    fi
    
    if [ "$health" = "unhealthy" ]; then
        echo "unhealthy"
        return 1
    fi
    
    echo "healthy"
    return 0
}

push_metrics() {
    if [ -z "${PROMETHEUS_PUSHGATEWAY}" ]; then
        return
    fi
    
    local container="$1"
    local status="$2"
    local value=1
    [ "$status" != "healthy" ] && value=0
    
    cat <<EOF | curl -s --data-binary @- "${PROMETHEUS_PUSHGATEWAY}/metrics/job/health_monitor/instance/${container}" > /dev/null 2>&1
# TYPE container_health gauge
container_health{container="${container}"} ${value}
EOF
}

log "========================================="
log "Molochain Health Monitor Started"
log "========================================="
log "Check interval: ${CHECK_INTERVAL}s"
log "Monitoring: ${CONTAINERS}"
log ""

ALERT_STATE=()

while true; do
    touch /tmp/monitor-healthy
    
    IFS=',' read -ra CONTAINER_LIST <<< "$CONTAINERS"
    
    for container in "${CONTAINER_LIST[@]}"; do
        container=$(echo "$container" | xargs)
        status=$(check_container "$container")
        
        push_metrics "$container" "$status"
        
        if [ "$status" != "healthy" ]; then
            if [[ ! " ${ALERT_STATE[*]} " =~ " ${container} " ]]; then
                alert "Container ${container} is ${status}" "error"
                ALERT_STATE+=("$container")
            fi
        else
            if [[ " ${ALERT_STATE[*]} " =~ " ${container} " ]]; then
                alert "Container ${container} recovered" "info"
                ALERT_STATE=("${ALERT_STATE[@]/$container}")
            fi
        fi
    done
    
    sleep "$CHECK_INTERVAL"
done
