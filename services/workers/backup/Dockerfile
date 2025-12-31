FROM postgres:16-alpine

LABEL maintainer="Molochain Ltd"
LABEL description="Backup worker for Molochain PostgreSQL databases"

RUN apk add --no-cache \
    bash \
    curl \
    jq \
    docker-cli \
    tzdata

ENV TZ=UTC

WORKDIR /app

COPY scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

RUN mkdir -p /backups/daily /backups/weekly /backups/wal

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD test -f /tmp/backup-healthy || exit 1
