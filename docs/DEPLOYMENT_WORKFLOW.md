# Deployment Workflow

**Last Updated:** 2025-12-08

## Overview

This document defines the deployment workflow for the MoloChain platform, establishing Replit as the canonical source of truth for all code.

## Architecture Principle

> **Replit is the canonical source of truth. Server code is legacy reference only.**

All development, testing, and code changes happen in the Replit project. The production server at molochain.com receives deployments from Replit, never the other way around.

## Environment Tiers

### 1. Development (Replit)

- **URL:** `https://<repl-slug>.repl.co`
- **Purpose:** Active development, feature testing
- **Database:** Neon PostgreSQL (development instance)
- **APIs:** Can use local mocks or production APIs

Environment variables:
```
VITE_APP_ENV=development
VITE_API_CMS_BASE_URL=http://localhost:8000/api  # or production URL
VITE_API_OTMS_BASE_URL=http://localhost:3000/v1  # or production URL
```

### 2. Production (molochain.com)

- **Server:** AlmaLinux with Plesk
- **IP:** 31.186.24.19
- **Process Manager:** PM2 (user: afsadm)
- **Database:** PostgreSQL at 127.0.0.1:5432

Services:
| Service | Domain | Technology |
|---------|--------|------------|
| Main App | molochain.com | Node.js/PM2 |
| CMS | cms.molochain.com | Laravel 12/PHP 8.4 |
| OTMS | opt.molochain.com | Docker (port 7020) |

## Deployment Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Replit    │────▶│   GitHub    │────▶│ Production  │
│ Development │     │  (optional) │     │   Server    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │  1. Code changes                       │
      │  2. Test in Replit                     │
      │  3. Commit to Git                      │
      │                                        │
      └────────────────────────────────────────┘
                        4. Deploy via SSH/SFTP
```

## Deployment Steps

### Step 1: Pre-Deployment Checklist

- [ ] All tests passing in Replit
- [ ] No LSP errors in critical files
- [ ] Workflow running without errors
- [ ] Environment variables documented
- [ ] Database migrations ready (if any)

### Step 2: Build for Production

```bash
# In Replit
npm run build
```

This creates optimized bundles in `dist/` directory.

### Step 3: Deploy to Production Server

**Option A: Direct Copy (Recommended for now)**

```bash
# SSH to server
ssh afsadm@molochain.com

# Navigate to app directory
cd /var/www/vhosts/molochain.com/molochain-core/

# Pull latest code (if using Git)
git pull origin main

# Install dependencies
npm ci --production

# Build if not pre-built
npm run build

# Restart PM2
pm2 restart molochain-prod
```

**Option B: Automated Deployment (Future)**

Set up GitHub Actions or similar CI/CD:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: molochain.com
          username: afsadm
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/vhosts/molochain.com/molochain-core/
            git pull
            npm ci --production
            pm2 restart molochain-prod
```

### Step 4: Post-Deployment Verification

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs molochain-prod --lines 50

# Verify endpoints
curl https://molochain.com/api/health
curl https://cms.molochain.com/api/health
curl https://opt.molochain.com/v1/
```

## Database Migrations

### Drizzle ORM Migrations

```bash
# Generate migration
npm run db:generate

# Apply migration (development)
npm run db:migrate

# For production, apply carefully:
NODE_ENV=production npm run db:migrate
```

**Important:** Always backup production database before migrations.

## Rollback Procedure

### Application Rollback

```bash
# SSH to server
ssh afsadm@molochain.com
cd /var/www/vhosts/molochain.com/molochain-core/

# Revert to previous commit
git log --oneline -5  # Find target commit
git checkout <previous-commit-hash>

# Reinstall and restart
npm ci --production
pm2 restart molochain-prod
```

### Database Rollback

Use Replit's checkpoint system for development database rollback.

For production, restore from PostgreSQL backup:

```bash
pg_restore -d molochain_prod backup_YYYYMMDD.dump
```

## Environment Variables

### Required for Production

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secure random string for sessions |
| `LARAVEL_CMS_URL` | `https://cms.molochain.com/api` |

### Frontend (Vite)

All frontend env vars must be prefixed with `VITE_`:

| Variable | Production Value |
|----------|------------------|
| `VITE_APP_ENV` | `production` |
| `VITE_API_CMS_BASE_URL` | `https://cms.molochain.com/api` |
| `VITE_API_OTMS_BASE_URL` | `https://opt.molochain.com/v1` |
| `VITE_API_GODLAYER_BASE_URL` | `https://molochain.com/api` |

## Server Services Reference

### PM2 Services (afsadm user)

```bash
# List all services
pm2 list

# Active services:
# - molochain-prod (main application)
# - membership-service

# Note: 'cms-service' in PM2 is legacy/orphaned
# Real CMS is Laravel via Plesk
```

### Laravel CMS (Plesk-managed)

- Domain: cms.molochain.com
- PHP: 8.4.15 (plesk-php84-fpm)
- Framework: Laravel 12.40.2
- Location: `/var/www/vhosts/molochain.com/cms.molochain.com/`

### OTMS Docker

- Domain: opt.molochain.com
- Port: 7020 (internal)
- Nginx proxy: vhost_nginx.conf routes /v1 to Docker

## Troubleshooting

### PM2 Services Not Running

```bash
su - afsadm
pm2 start ecosystem.config.cjs
```

### Laravel CMS 500 Errors

```bash
cd /var/www/vhosts/molochain.com/cms.molochain.com/
/opt/plesk/php/8.4/bin/php artisan config:clear
/opt/plesk/php/8.4/bin/php artisan cache:clear
tail -50 storage/logs/laravel.log
```

### OTMS 503 Errors

Check if Docker container is running and nginx config is correct.

## Security Notes

1. Never commit secrets to Git
2. Use environment variables for all credentials
3. SSH keys should be managed securely
4. Production database should have restricted access
5. Enable rate limiting on all public APIs
