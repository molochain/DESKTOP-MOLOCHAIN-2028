# MoloChain Production Deployment Guide

## Overview
Deploy the Replit project to molochain.com production server.

## Server Details
- **Server**: AlmaLinux with Plesk at molochain.com (31.186.24.19)
- **Node.js**: v20.19.6
- **Database**: PostgreSQL 13.22
- **Process Manager**: PM2
- **Web Server**: Nginx

## Pre-Deployment Checklist

### On Your Local/Replit Environment:
```bash
# Build production assets
npm run build

# Verify build output
ls -la dist/
ls -la dist/public/
```

### Expected Build Output:
```
dist/
├── index.js          # Express server bundle
└── public/           # React frontend assets
    ├── index.html
    └── assets/
        ├── js/
        ├── css/
        └── images/
```

## Step-by-Step Deployment

### Step 1: SSH into Server
```bash
ssh root@molochain.com
# or
ssh root@31.186.24.19
```

### Step 2: Navigate to Project Directory
```bash
cd /var/www/vhosts/molochain.com/molochain-core
```

### Step 3: Backup Current Deployment
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf ../BACKUPS/molochain-backup-${TIMESTAMP}.tar.gz dist/ package.json
```

### Step 4: Upload New Files (from your local machine)
```bash
# From your Replit/local machine, upload the built files:
scp -r dist/ root@molochain.com:/var/www/vhosts/molochain.com/molochain-core/
scp package.json package-lock.json root@molochain.com:/var/www/vhosts/molochain.com/molochain-core/
scp ecosystem.config.production.cjs root@molochain.com:/var/www/vhosts/molochain.com/molochain-core/
scp -r db/ root@molochain.com:/var/www/vhosts/molochain.com/molochain-core/
scp -r shared/ root@molochain.com:/var/www/vhosts/molochain.com/molochain-core/
```

### Step 5: Install Dependencies (on server)
```bash
cd /var/www/vhosts/molochain.com/molochain-core
npm ci --production
```

### Step 6: Setup Environment File
```bash
# Copy the production environment file from the extracted deploy folder
cp deploy/.env.production .env

# Or use the one that was already on the server
# If .env.production doesn't exist in deploy/, create it manually:
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DATABASE_URL=postgresql://molodb:Passwd1122%%@127.0.0.1:5432/molochaindb
VITE_API_CMS_BASE_URL=https://cms.molochain.com/api
VITE_API_OTMS_BASE_URL=https://opt.molochain.com/v1
VITE_API_GODLAYER_BASE_URL=https://molochain.com/api
SESSION_SECRET=your_64_char_random_session_secret_here_replace_with_real_one
JWT_SECRET=your_64_char_random_jwt_secret_here_replace_with_real_value
CORS_ORIGINS=https://molochain.com,https://www.molochain.com,https://cms.molochain.com
FEATURE_AI_ENABLED=false
LOG_LEVEL=info
EOF
```

### Step 7: Restart PM2 Service
```bash
pm2 restart molochain-core --update-env
pm2 status
pm2 logs molochain-core --lines 50
```

### Step 8: Verify Deployment
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Check PM2 status
pm2 status molochain-core

# Check logs for errors
pm2 logs molochain-core --lines 100
```

## Nginx Configuration

If nginx is not configured for SPA routing, update the config:

```bash
# Edit the molochain.com nginx config
nano /etc/nginx/conf.d/molochain.com.conf

# Add/update these settings:
location / {
    root /var/www/vhosts/molochain.com/molochain-core/dist/public;
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Test and reload nginx
nginx -t
systemctl reload nginx
```

## Rollback Procedure

If something goes wrong:
```bash
cd /var/www/vhosts/molochain.com/molochain-core

# Find latest backup
ls -lt ../BACKUPS/

# Restore from backup
BACKUP_FILE="../BACKUPS/molochain-backup-YYYYMMDD_HHMMSS.tar.gz"
tar -xzf ${BACKUP_FILE}

# Restart
pm2 restart molochain-core
```

## Verification Checklist

After deployment, verify:
- [ ] `https://molochain.com` loads the React frontend
- [ ] `https://molochain.com/api/health` returns OK
- [ ] Login/authentication works
- [ ] CMS integration works (menu, services load from cms.molochain.com)
- [ ] WebSocket connections work
- [ ] No errors in PM2 logs: `pm2 logs molochain-core`

## Monitoring

```bash
# Real-time logs
pm2 logs molochain-core

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart molochain-core

# Full status
pm2 status
```
