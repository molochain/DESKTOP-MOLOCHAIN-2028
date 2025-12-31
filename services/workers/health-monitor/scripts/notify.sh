#!/bin/bash

MESSAGE="${1:-Health notification}"
SEVERITY="${2:-info}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [NOTIFY] $1"; }

if [ -n "${SLACK_WEBHOOK_URL}" ]; then
    EMOJI=":white_check_mark:"
    COLOR="good"
    
    if [ "$SEVERITY" = "error" ]; then
        EMOJI=":rotating_light:"
        COLOR="danger"
    elif [ "$SEVERITY" = "warning" ]; then
        EMOJI=":warning:"
        COLOR="warning"
    fi
    
    PAYLOAD=$(cat <<EOF
{
    "attachments": [
        {
            "color": "${COLOR}",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "${EMOJI} *Molochain Health Monitor*\n${MESSAGE}"
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": "Server: $(hostname) | Time: $(date '+%Y-%m-%d %H:%M:%S UTC')"
                        }
                    ]
                }
            ]
        }
    ]
}
EOF
)
    
    curl -s -X POST -H 'Content-type: application/json' \
        --data "${PAYLOAD}" "${SLACK_WEBHOOK_URL}" > /dev/null
    
    log "Slack notification sent"
fi
