# Admin Docker Deployment Notes

## Overview
The admin.molochain.com service runs as an independent Docker container (molochain-admin) on port 7000, separate from the PM2-managed main application.

## Deployment Date
December 26, 2025

## Architecture
```
Internet → Plesk Nginx → Docker Container (port 7000)
                              ↓
                         PostgreSQL (host)
```

## Key Configuration Changes

### 1. Nginx Configuration (Plesk)
**File:** `/var/www/vhosts/system/admin.molochain.com/conf/vhost_nginx.conf`

```nginx
location ~ ^/(.*)$ {
    proxy_pass http://127.0.0.1:7000/$1$is_args$args;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

**Note:** The regex location block `~ ^/(.*)$` is used instead of `location /` to avoid "duplicate location /" conflicts with Plesk's auto-generated configuration.

### 2. PostgreSQL Authentication
**File:** `/var/lib/pgsql/data/pg_hba.conf`

**Added at LINE 1 (MUST be first entry):**
```
host    all    all    172.22.0.0/16    trust
```

**Why first?** PostgreSQL uses first-match rule for pg_hba.conf. If the Docker network entry is not first, the default "reject" or password rules will match first and deny connection.

**Rollback:** Remove this line and reload PostgreSQL:
```bash
systemctl reload postgresql-13
```

### 3. Docker Configuration
**Location:** `/var/www/vhosts/molochain.com/admin-docker/`

**Key files:**
- `docker-compose.yml` - Container orchestration
- `.env` - Environment variables (DB connection, secrets)
- `docker/Dockerfile.admin` - Container build
- `docker/entrypoint-admin.sh` - Startup script

**Network:** `molochain-core` (172.22.0.0/16)
**Container IP:** 172.22.0.4

## Operational Commands

### Container Management
```bash
# View status
docker ps | grep molochain-admin

# View logs
docker logs molochain-admin --tail 100

# Restart container
docker restart molochain-admin

# Rebuild and restart
cd /var/www/vhosts/molochain.com/admin-docker
docker-compose up -d --build
```

### Health Check
```bash
curl http://localhost:7000/api/health
curl https://admin.molochain.com/api/health
```

### Frontend Asset Sync
When the main app frontend is rebuilt:
```bash
cd /var/www/vhosts/molochain.com/admin-docker
./sync-frontend.sh           # Full sync with backup
./sync-frontend.sh --dry-run # Preview changes only
```

## Rollback Procedure

### Rollback Container
```bash
cd /var/www/vhosts/molochain.com/admin-docker
docker-compose down
# Container is now stopped; PM2 main app can handle requests via main nginx
```

### Rollback Nginx
```bash
rm /var/www/vhosts/system/admin.molochain.com/conf/vhost_nginx.conf
/usr/local/psa/admin/bin/httpdmng --reconfigure-domain admin.molochain.com
```

### Rollback PostgreSQL
```bash
# Edit /var/lib/pgsql/data/pg_hba.conf
# Remove line: host    all    all    172.22.0.0/16    trust
systemctl reload postgresql-13
```

## Monitoring

### Logs Location
- Container logs: `docker logs molochain-admin`
- Application logs: `/var/www/vhosts/molochain.com/admin-docker/logs/`
- Nginx logs: `/var/www/vhosts/system/admin.molochain.com/logs/`

### Key Endpoints
- Health: `GET /api/health`
- CMS Data: `GET /api/cms/menu`
- System Status: `GET /api/system/status` (auth required)

## Security Notes

1. **pg_hba.conf trust entry:** Only allows connections from Docker network (172.22.0.0/16), not from external networks
2. **Container runs as non-root** user inside
3. **All secrets** are in `.env` file (not in docker-compose.yml)
4. **HTTPS termination** happens at Plesk nginx level

## Contact
For issues, check container logs first, then application logs.
