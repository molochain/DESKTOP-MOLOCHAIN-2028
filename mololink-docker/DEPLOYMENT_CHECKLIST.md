# Mololink Deployment Checklist

## Pre-Deployment Verification

### Files Required
- [x] `mololink-docker/Dockerfile` - Multi-stage build for Node.js 20
- [x] `mololink-docker/docker-compose.yml` - Container orchestration
- [x] `mololink-docker/server.js` - Backend with 27 API endpoints
- [x] `mololink-docker/package.json` - Dependencies
- [x] `mololink-docker/.env` - Environment variables
- [x] `mololink-docker/public/index.html` - Enhanced frontend v3
- [x] `mololink-docker/deploy-mololink.sh` - Deployment script
- [x] `mololink-docker/API_ENDPOINTS.md` - API documentation

### Frontend v3 Features Verified
- [x] SSO config loading on bootstrap
- [x] Token verification with authType tracking
- [x] Marketplace tabs (All/Listings/Auctions/Services)
- [x] Network tabs (Feed/Connections)
- [x] Connection request functionality
- [x] Suggested connections sidebar
- [x] 18+ API integrations

### Backend Features Verified
- [x] Hybrid JWT authentication (Central + Local)
- [x] 27 API endpoints
- [x] PostgreSQL database connection
- [x] Profile image upload
- [x] Health check endpoint
- [x] SSO configuration endpoint

---

## Deployment Steps

### Step 1: Transfer Files to Production Server

```bash
# From Replit or local machine
scp -r mololink-docker/* user@molochain-server:/var/www/vhosts/molochain.com/mololink-docker/
```

### Step 2: Deploy Frontend

```bash
# SSH to production server
ssh user@molochain-server

# Copy frontend to web root
cp /var/www/vhosts/molochain.com/mololink-docker/public/index.html \
   /var/www/vhosts/molochain.com/mololink.molochain.com/index.html

# Set permissions
chown nginx:nginx /var/www/vhosts/molochain.com/mololink.molochain.com/index.html
chmod 644 /var/www/vhosts/molochain.com/mololink.molochain.com/index.html
```

### Step 3: Rebuild Docker Container

```bash
cd /var/www/vhosts/molochain.com/mololink-docker

# Stop existing container
docker stop mololink-app 2>/dev/null || true
docker rm mololink-app 2>/dev/null || true

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d

# Verify
docker ps | grep mololink
docker logs mololink-app
```

### Step 4: Verify Deployment

```bash
# Check health
curl http://localhost:5001/health

# Check SSO config
curl http://localhost:5001/api/sso/config

# Check frontend
curl -I https://mololink.molochain.com/

# Verify v3 features in frontend
grep -c "activeTab" /var/www/vhosts/molochain.com/mololink.molochain.com/index.html
```

---

## Post-Deployment Verification

### API Endpoints Test
```bash
# Test each category
curl https://mololink.molochain.com/api/companies
curl https://mololink.molochain.com/api/jobs
curl https://mololink.molochain.com/api/marketplace/listings
curl https://mololink.molochain.com/api/marketplace/auctions
curl https://mololink.molochain.com/api/marketplace/services
curl https://mololink.molochain.com/api/posts
curl https://mololink.molochain.com/api/profiles
curl https://mololink.molochain.com/api/sso/config
```

### Frontend Features Test
1. [ ] Homepage loads with hero section
2. [ ] Navigation works (Companies, Jobs, Marketplace, Network)
3. [ ] Marketplace shows tabs (All/Listings/Auctions/Services)
4. [ ] Network page shows tabs (Feed/Connections)
5. [ ] Login/Register forms work
6. [ ] Profile page loads correctly
7. [ ] SSO indicator shows when applicable

### Container Health Check
```bash
# Check container logs
docker logs -f mololink-app

# Check container stats
docker stats mololink-app

# Health check
docker inspect --format='{{.State.Health.Status}}' mololink-app
```

---

## Rollback Procedure

If deployment fails:

```bash
# Stop new container
docker stop mololink-app

# Restore backup frontend
cp /var/www/vhosts/molochain.com/mololink.molochain.com/index.html.bak \
   /var/www/vhosts/molochain.com/mololink.molochain.com/index.html

# Restart old container from backup image
docker run -d --name mololink-app \
  --network molochain-core \
  -p 5001:5001 \
  mololink-service:backup
```

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://mololink.molochain.com |
| API Base | https://mololink.molochain.com/api |
| Health | https://mololink.molochain.com/health |
| SSO Config | https://mololink.molochain.com/api/sso/config |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2025-12-11 | Hybrid Auth + Marketplace/Network tabs |
| 2.0.0 | 2025-12-10 | Docker containerization |
| 1.0.0 | 2025-12-09 | Initial deployment |
