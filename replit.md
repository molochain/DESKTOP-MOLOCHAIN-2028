# Rest Express - Full-Stack TypeScript Application

## Overview
Rest Express is a comprehensive Node.js/TypeScript full-stack application within Molochain's ecosystem, designed for business management. It integrates a React frontend, an Express backend, AI capabilities, real-time WebSocket services, and PostgreSQL. The project supports supply chain management, real-time collaboration, performance monitoring, and secure user interactions, serving as a central hub for various Molochain services with a vision for extensive business management and market potential.

## User Preferences
- Prefers clean, minimal solutions
- Values stability and production-readiness
- Requires detailed technical feedback
- Incremental, reversible changes only
- No breaking changes to production
- Blockchain code removed: All blockchain conditionals and references removed (wallet system preserved)

## System Architecture

### UI/UX Decisions
- **Frontend:** React 18 with Vite, TypeScript, Tailwind CSS, and shadcn/ui for a responsive and modern user interface.
- **Branding:** Consistent design adhering to Molochain branding guidelines, with a `Portal Layout` for authenticated users.
- **Dashboards:** Configurable dashboards adaptable to user roles and departments.
- **Onboarding:** A 6-step onboarding wizard for new users.

### Technical Implementations
- **Backend:** Express.js with TypeScript.
- **Database:** PostgreSQL managed with Drizzle ORM.
- **Real-time:** `UnifiedWebSocketManager` for robust WebSocket handling.
- **AI Services:** OpenAI integration, controlled by the `FEATURE_AI_ENABLED` flag.
- **Security:** CSRF protection, rate limiting, file upload validation, authentication middleware, Zod schema validation, SHA-256 hashed refresh tokens with rotation.
- **Email System:** Comprehensive cross-subdomain email notification system with template-based sending, monitoring, dynamic rate limiting, and API key management.

### Feature Specifications
- **Core Features:** Supply chain management, real-time collaboration, performance monitoring, secure user authentication/authorization, file management, API documentation, and a Communications Hub.
- **Authentication (SSO):** Cross-subdomain SSO architecture with Redis-backed session for `admin.molochain.com` and JWT-based cookie for other subdomains. A standalone React SPA at `auth.molochain.com` handles login, registration, and password management.
- **Page Distribution:** Approximately 60 pages across various sections.
- **Route Protection:** Public, Auth Required, and Admin Required routes.
- **Communications Hub Microservice:** Unified multi-channel communications (Email, SMS, WhatsApp, Push) with Plesk integration, Docker containerized with Redis for message queuing, and PostgreSQL persistence. Includes API endpoints for sending messages, channel status, template management, and user preferences.
- **External API Key System:** Enables third-party integrations with API key authentication, configurable rate limiting, IP whitelisting, scope-based permissions, key expiration, and usage logging.

### Containerization (DEPLOYED)
The following containerized services are LIVE on production server (31.186.24.19):

- **Laravel CMS Containerization** (`services/cms-laravel/`):
  - **Status:** ✅ DEPLOYED - All 5 containers healthy
  - **Services:** cms-app (PHP 8.4-FPM), cms-nginx, cms-queue, cms-scheduler, cms-redis
  - **Database:** 26 tables in cmsdb (users, posts, pages, media_assets, etc.)
  - **Features:** Zero-downtime deployments, horizontal scaling, unified logging
  - **Port:** 8090 (localhost) - HTTP 200 verified
  - **Last Updated:** December 31, 2025

- **PostgreSQL 16 Cluster** (`services/postgres-cluster/`):
  - **Status:** ✅ DEPLOYED - PostgreSQL healthy, accepting connections
  - **Services:** molochain-postgres (PostgreSQL 16), postgres-backup, pgadmin
  - **Databases:** molochaindb, mololinkdb, cmsdb - all created with proper permissions
  - **Credentials:** Stored securely in server environment variables (see `/root/molochain-services/postgres-cluster/.env`)
  - **Features:** Automated daily backups, WAL archiving, 30-day retention
  - **Port:** 5433 (PostgreSQL), 5050 (pgAdmin)
  - **Last Updated:** December 31, 2025

- **Background Workers** (`services/workers/`):
  - **Status:** ✅ DEPLOYED - All 3 workers healthy
  - **Services:** backup-worker, health-monitor, log-aggregator (Promtail)
  - **Features:** Scheduled backups at 2 AM, container health monitoring, Slack/Email alerts
  - **Integration:** Prometheus metrics push, Loki log aggregation
  - **Last Updated:** December 31, 2025

### System Design Choices
- **Microservice Architecture:** Part of a larger digital logistics ecosystem with specialized subdomains.
- **Subdomain Routing:** Public routes on `molochain.com`, admin routes on `admin.molochain.com`.
- **CMS Integration:** Consumes content from a centralized Laravel CMS (`cms.molochain.com`) via a `CMS Sync Service` for periodic data synchronization and caching.
- **Mololink Microservice:** Independent Express microservice with its own PostgreSQL, React SPA, RESTful API, and hybrid JWT authentication.
- **Containerization (Docker):** Dockerfiles and `docker-compose.yml` for services (Admin, Main, Auth, PostgreSQL, Redis) utilizing multi-stage builds, health checks, non-root users, and Nginx reverse proxy.
- **Shared Packages:** `packages/shared-permissions/` (RBAC), `packages/shared-auth/` (Auth types), `packages/shared-audit/` (Audit logging).
- **Unified API Gateway:** `services/api-gateway/` - Grade A+ enterprise gateway for the Molochain ecosystem:
  - **Endpoints:** `https://api.molochain.com` (REST), `https://ws.molochain.com` (WebSocket)
  - **Authentication:** JWT + API Key dual authentication (401 on all routes without auth)
  - **Security:** Sensitive endpoints blocked (/, /schema, /docs, /internal → 404), /metrics blocked externally (403)
  - **Features:** Circuit breaker, Redis-backed caching with per-service TTLs, rate limiting, request/response logging, API versioning (v1/v2), WebSocket monitoring
  - **Services:** Routes to 10 microservices - all healthy:
    - `molochain-core` → `/api/v1` (port 5000)
    - `molochain-core-v2` → `/api/v2` (port 5000, v2 API)
    - `mololink` → `/api/mololink` (mololink-app:5001)
    - `rayanava-gateway` → `/api/rayanava` (port 5001)
    - `rayanava-ai` → `/api/ai` (port 5002)
    - `communications-hub` → `/api/comms` (port 7020)
    - `rayanava-workflows` → `/api/workflows` (port 5004)
    - `rayanava-voice` → `/api/voice` (port 5005)
    - `rayanava-notifications` → `/api/notifications` (port 5006)
    - `rayanava-monitoring` → `/api/monitoring` (port 5007)
  - **Caching:** Per-service TTLs (60s core, 120s mololink), cacheable paths for public/catalog/config endpoints
  - **Monitoring:** Prometheus metrics (286 lines), WebSocket connection/message tracking, Grafana dashboard
  - **Load Testing:** Artillery test scripts for REST, WebSocket, and stress testing
  - **Deployment:** Docker containerized at port 4000 (bound to 127.0.0.1), Redis for caching/rate-limiting
  - **Networks:** Connected to 13 Docker networks for full microservice connectivity
  - **SSL:** Valid certificate (Let's Encrypt, expires Mar 2026)
  - **Status:** ✅ LIVE and healthy on production server (31.186.24.19)
  - **Last Updated:** December 31, 2025

### Infrastructure Summary (December 31, 2025)
- **Total Containers:** 54 running
- **Healthy Containers:** 41 marked healthy
- **Key Services:** CMS (5), PostgreSQL (3), Workers (3), API Gateway (2), plus 41 other microservices
- **Networks:** cms-network, molochain-network, postgres-network, workers-network
- **Server Uptime:** 46+ days
- **Disk Usage:** 70% (47GB free)
- **Memory:** 4GB used, 3.5GB available

### Deployment & Sync Tools (scripts/)
- **check-production-server.ts:** SSH health check for production server status
- **quick-sync.ts:** Fast deployment sync to production (build + upload + restart)
- **sync-to-production.ts:** Full deployment with npm install and container restart
- **incremental-sync.ts:** Lightweight sync for changed files only (faster than full sync)
- **cleanup-workspaces.ts:** Clean old packages and logs on production
- **SSH Access:** root@31.186.24.19 (password in SERVER_SSH_PASSWORD secret)
- **Deploy Path:** /var/www/vhosts/molochain.com/molochain-core

### WebSocket Configuration
- **Client Heartbeat:** 30-second ping interval, 5-minute timeout before reconnect
- **Server Heartbeat:** 25-30 second interval, 35-45 second timeout
- **Auto-Reconnect:** Enabled with exponential backoff (max 5 attempts)
- **Status:** Stable - timeout warnings are expected behavior during idle periods

## External Dependencies

- **Core Frameworks**: Express, React, Vite, TypeScript
- **Database**: Drizzle ORM, `@neondatabase/serverless` (dev), `pg` (prod)
- **UI Libraries**: shadcn/ui, Tailwind CSS, Radix UI
- **Real-time**: Socket.IO, WebSockets
- **Authentication**: Passport.js, JWT
- **File Handling**: Multer, Sharp
- **AI**: OpenAI SDK
- **Payment**: Stripe
- **Monitoring/Logging**: Winston
- **Email Notifications**: Nodemailer
- **External APIs**:
  - **CMS**: `https://cms.molochain.com/api`
  - **OTMS**: `https://opt.molochain.com/v1`
  - **Auth Service**: `http://172.22.0.1:7010` (internal)