FROM alpine:3.19

LABEL maintainer="Molochain Ltd"
LABEL description="Container health monitor for Molochain ecosystem"

RUN apk add --no-cache \
    bash \
    curl \
    jq \
    docker-cli

WORKDIR /app

COPY scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

RUN mkdir -p /var/log/health-monitor

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD test -f /tmp/monitor-healthy || exit 1
