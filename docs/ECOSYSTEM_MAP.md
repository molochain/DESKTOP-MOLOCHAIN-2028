# Molochain Ecosystem Map

> Last Updated: December 11, 2025

## Production Server Overview

- **Server IP**: 31.186.24.19
- **OS**: AlmaLinux (NixOS-based)
- **Disk Usage**: 70GB / 152GB (46%)
- **Hosting Panel**: Plesk

---

## Active Services

### Docker Containers (molochain-core network: 172.22.0.0/16)

| Container | IP | Port | Status | Description |
|-----------|-------|------|--------|-------------|
| mololink-app | 172.22.0.4 | 5001 | Healthy | B2B Logistics Network |
| auth-service | 172.22.0.3 | 7010→3002 | Running | Central Authentication |
| redis-session | 172.22.0.2 | 6379 | Running | Session Cache |
| otms-service | - | Internal | Running | Order Tracking Management |
| kong-gateway | - | 8000/8001 | Healthy | API Gateway |
| kong-database | - | 5432 | Running | Kong PostgreSQL |
| konga-admin | - | 1337 | Running | Kong Admin UI |
| molochain-prometheus | - | 9090 | Running | Metrics Collection |
| molochain-alertmanager | - | 9093 | Running | Alert Management |
| molochain-loki | - | 3100 | Running | Log Aggregation |
| molochain-promtail | - | - | Running | Log Shipping |
| plesk-portainer | - | 9000 | Running | Docker Management UI |

### PM2 Processes

| Process | Status | Description |
|---------|--------|-------------|
| pm2-logrotate | Online | Log rotation module |
| pm2-server-monit | Online | Server monitoring module |

---

## Subdomains

### Active (Production Use)

| Subdomain | Size | Backend | Description |
|-----------|------|---------|-------------|
| molochain.com | 78MB | Static SPA | Main website (React) |
| mololink.molochain.com | 904KB | Docker:5001 | B2B Logistics Network |
| opt.molochain.com | 20MB | PM2/Docker | Order Tracking (OTMS) |
| cms.molochain.com | 189MB | Laravel PHP | Content Management System |
| app.molochain.com | 85MB | Static | Mobile app assets |
| auth.molochain.com | 4KB | Docker:7010 | Authentication service |
| db.molochain.com | 476KB | - | Database admin interface |

### Placeholder (Future Use)

| Subdomain | Size | Status |
|-----------|------|--------|
| admin.molochain.com | 12KB | Placeholder |
| api.molochain.com | 12KB | Placeholder |
| ai.molochain.com | 16KB | Placeholder |
| cdn.molochain.com | 12KB | Placeholder |
| grafana.molochain.com | 12KB | Placeholder |
| server.molochain.com | 4KB | Empty |
| ws.molochain.com | 4KB | Empty |

---

## Architecture Diagram

```
                          ┌─────────────────────┐
                          │    Internet/DNS     │
                          │   *.molochain.com   │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Nginx/Apache      │
                          │   (Plesk Managed)   │
                          │   Port 80/443       │
                          └──────────┬──────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
     ┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
     │ Static Sites    │   │ Docker Services │   │ PHP/Laravel     │
     │                 │   │                 │   │                 │
     │ • molochain.com │   │ • mololink:5001 │   │ • cms.molochain │
     │ • app.molochain │   │ • auth:7010     │   │                 │
     │                 │   │ • otms (internal)│   │                 │
     └─────────────────┘   └────────┬────────┘   └─────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │  Docker Network   │
                          │  molochain-core   │
                          │  172.22.0.0/16    │
                          └─────────┬─────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
┌────────▼────────┐      ┌─────────▼─────────┐      ┌─────────▼─────────┐
│   Data Layer    │      │   API Gateway     │      │   Monitoring      │
│                 │      │                   │      │                   │
│ • Redis:6379    │      │ • Kong:8000/8001  │      │ • Prometheus:9090 │
│ • Kong-DB:5432  │      │ • Konga:1337      │      │ • Loki:3100       │
│                 │      │                   │      │ • Alertmanager    │
└─────────────────┘      └───────────────────┘      └───────────────────┘
```

---

## Key Folders

| Path | Size | Description |
|------|------|-------------|
| `/var/www/vhosts/molochain.com/httpdocs` | 78MB | Main website build |
| `/var/www/vhosts/molochain.com/molochain-core` | 3.3GB | Backend source + node_modules |
| `/var/www/vhosts/molochain.com/OTMS-DOCKER` | 894MB | OTMS Docker configuration |
| `/var/www/vhosts/molochain.com/mololink-docker` | 60KB | Mololink Docker configuration |
| `/var/www/vhosts/molochain.com/backups` | 150MB | Recent backups |
| `/var/www/vhosts/molochain.com/BACKUPS` | 506MB | Historical backups |
| `/var/www/vhosts/molochain.com/archives` | 2.7GB | Old archives (cleanup candidate) |

---

## SSO Architecture

All services share JWT authentication via:
- **Issuer**: auth.molochain.com
- **Cookie Domain**: .molochain.com (subdomain sharing)
- **JWT Secret**: Shared across all services

---

## Deployment Workflow

### Replit → Production

1. **Frontend Build**: `npm run build` creates `dist/public/`
2. **Deploy Frontend**: Sync `dist/public/*` to `/var/www/vhosts/molochain.com/httpdocs/`
3. **Backend Build**: `npm run build` creates `dist/index.js`
4. **Deploy Backend**: Sync to molochain-core and restart via Plesk

### Mololink (Docker)

1. Edit files in `mololink-docker/`
2. Sync to `/var/www/vhosts/molochain.com/mololink-docker/`
3. Run: `docker compose up -d --build`

---

## Cleanup History

| Date | Action | Space Freed |
|------|--------|-------------|
| 2025-12-11 | Removed old httpdocs backups, laravel package, stopped containers | ~4GB |

---

## Known Issues

1. **API /api/guides/categories**: Returns 500 when DB empty (fixed with fallback data)
2. **API /api/contact/agents**: Returns 401 in production (build sync issue - needs redeploy)
3. **WebSocket /ws/main**: Connection fails (WebSocket manager not initialized in production build)

---

## Next Steps

- [ ] Rebuild and redeploy molochain-core backend to fix auth issues
- [ ] Consider removing empty subdomains (server.molochain.com, ws.molochain.com)
- [ ] Archive or remove `/archives` folder (2.7GB) after review
- [ ] Set up automated backup rotation
