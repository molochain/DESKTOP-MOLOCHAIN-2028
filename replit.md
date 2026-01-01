# Rest Express - Full-Stack TypeScript Application

## Overview
Rest Express is a comprehensive Node.js/TypeScript full-stack application within Molochain's ecosystem, designed for business management.

## Admin System (Grade A++ Upgrade - Phase 5 Complete)
**URL:** https://admin.molochain.com (port 7001)

### Phase 1 Features (Complete):
1. **Real-Time Dashboard** - CPU/Memory/Disk/Network metrics via Prometheus, embedded Grafana charts
2. **Container Management** - 70 containers with bulk restart/stop, status filtering, health monitoring
3. **User Management** - Admin CRUD with role-based access (super_admin, admin, viewer)
4. **System Settings** - Alerts config, backup schedules, email notifications
5. **Alerts & Notifications** - Threshold-based alerts for CPU/memory/disk/container health
6. **Centralized Logs** - Multi-service aggregation with severity filtering, search, export
7. **SSL Monitoring** - Certificate expiration tracking with TLS validation, distinguishes valid/expiring/invalid
8. **Database Admin** - PostgreSQL management via sidecar (port 7003): table browsing, read-only SQL, backup/restore
9. **API Documentation** - OpenAPI 3.0 spec at /openapi.json, Swagger UI integration

### Phase 2 Features (Complete):
1. **Security Hardening** - Internal API key authentication for all sidecar services (SSL checker, DB admin, container monitor, notification service). Nginx injects API key via envsubst.
2. **Audit Logging System** - Complete admin action tracking with admin_audit_logs table. Tracks: action, category, user, IP, severity, success status. Searchable UI at /audit-logs.
3. **Automated Database Backups** - node-cron scheduler for daily PostgreSQL backups at 2:00 AM UTC with configurable retention (default 7 days). Manual trigger available.
4. **Container Auto-Recovery** - Health monitoring service that auto-restarts unhealthy/stopped containers. Configurable max restart attempts and cooldown periods.
5. **Real-Time WebSocket Notifications** - Socket.IO-based notification service for instant alerts. Broadcasts container failures, SSL warnings, backup status.
6. **Notification Preferences** - Per-user configurable alerts (container, SSL, backup, security). Adjustable thresholds for CPU/memory/disk warnings.

### Phase 3 Features (NEW - Complete):
1. **Grafana Dashboard Embedding** - Live CPU/Memory metrics embedded via secure HTTPS proxy (/grafana/). Anonymous viewer access configured. Direct link to full Grafana dashboard.
2. **Automated Runbooks System** - 9 one-click infrastructure fixes organized by category:
   - **Containers:** Restart Unhealthy, Clear Restart Counters, Restart Core Services (high-risk)
   - **Database:** Trigger Backup, Cleanup Old Backups
   - **Cache:** Flush Redis (medium-risk)
   - **Maintenance:** Rotate Logs, Full Health Check
   - **Security:** Refresh SSL Status
3. **Risk Level Indicators** - Each runbook displays Low/Medium/High risk with visual color coding
4. **Confirmation Dialogs** - High-risk actions require explicit user confirmation with warning messages
5. **Execution Feedback** - Real-time success/failure status with timestamps for all runbook executions
6. **Audit Integration** - All runbook executions logged to audit trail for accountability

### Phase 4 Features (Complete):
1. **Database Persistence for Settings** - All admin settings stored in PostgreSQL via admin_settings table
2. **Alert Acknowledgements** - Persistent alert acknowledgement tracking with admin_alert_acknowledgements table
3. **Unified Services Page** - Category filtering for all microservices with health status display
4. **Nginx Dual-Path Routing** - /api/database/* and /api/admin/database/* for frontend compatibility

### Phase 5 Features (NEW - Complete):
1. **Intelligent Incident Orchestration** - Automated alert rules engine with:
   - Condition types: cpu_threshold, memory_threshold, disk_threshold, container_down
   - Action types: restart_container, send_notification, run_runbook
   - Approval gates for high-risk actions with approve/reject workflow
   - Cooldown periods to prevent alert storms
   - Execution history tracking
2. **Resource Trend Analytics** - Historical metrics visualization:
   - Hourly metrics collection (CPU, Memory, Disk, Containers)
   - 30-day retention with automatic cleanup
   - Trend charts with recharts for 24h/7d/30d periods
   - Anomaly detection highlighting values above 90%
   - Min/max/average statistics per metric type
3. **Deployment Timeline** - CI/CD integration and release tracking:
   - Webhook endpoint for CI/CD pipelines (POST /api/admin/database/deployments)
   - Service name, version, commit hash, environment tracking
   - Status workflow: pending → in_progress → completed/failed/rolled_back
   - Timeline visualization with filtering by service/status
   - Quick status updates for failed deployments

### Phase 5 Database Tables:
- `admin_alert_rules` - Automated alert rule definitions with conditions and actions
- `admin_metrics_history` - Historical CPU/Memory/Disk snapshots (hourly)
- `admin_deployments` - Deployment tracking with CI/CD metadata
- `admin_incident_executions` - Runbook execution history with approval workflow

### Phase 5 API Endpoints:
- Alert Rules: GET/POST/PUT/DELETE /api/admin/database/alert-rules
- Metrics: GET /api/admin/database/metrics/history, GET /api/admin/database/metrics/trends
- Deployments: GET/POST/PUT /api/admin/database/deployments
- Incidents: GET/POST /api/admin/database/incidents, PUT /incidents/:id/approve, PUT /incidents/:id/reject

### Monitoring Schedules (Updated):
- **Metrics Collection**: Hourly (via database-admin cron)
- **Metrics Retention Cleanup**: Hourly (30-day retention)

### Architecture:
- **Frontend:** React 18 + Vite + Tailwind + shadcn/ui (molochain-admin-frontend container)
- **Backend:** Pre-built Docker image at port 7000 (molochain-admin-backend)
- **Database Sidecar:** Node.js service at port 7003 (molochain-db-admin) for PostgreSQL admin
- **SSL Sidecar:** Node.js TLS checker at port 7002 (ssl-checker)
- **Container Monitor:** Node.js health checker at port 7004 (container-monitor) - auto-recovery
- **Notification Service:** Node.js + Socket.IO at port 7005 (notification-service) - real-time alerts
- **Networks:** molochain-core + rayanava-network (for Prometheus/Grafana access)

### Phase 2 Service Details:
- **INTERNAL_API_KEY**: Environment variable required by all sidecars. Injected by nginx via envsubst.
- **Audit Log Table**: `admin_audit_logs` with indexes on timestamp, action, category
- **Notification Preferences Table**: `admin_notification_preferences` with per-user alert settings
- **Backup Location**: `/var/backups/postgres` (Docker volume: postgres_backups)

### Monitoring Schedules:
- **Container Auto-Recovery**: 30-second interval (fast detection via container-monitor)
- **Container Alert Notifications**: Every 5 minutes (user alerts via notification-service)
- **SSL Certificate Checks**: Every 6 hours (via notification-service)
- **Database Backups**: Daily at 2:00 AM UTC (via database-admin) It integrates a React frontend, an Express backend, AI capabilities, real-time WebSocket services, and PostgreSQL. The project supports supply chain management, real-time collaboration, performance monitoring, and secure user interactions, serving as a central hub for various Molochain services with a vision for extensive business management and market potential.

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
- **Microservices Control Panel:** Real-time monitoring of all Docker microservices, displaying health, response times, and system uptime.
- **Authentication (SSO):** Cross-subdomain SSO architecture with Redis-backed session for `admin.molochain.com` and JWT-based cookie for other subdomains. A standalone React SPA at `auth.molochain.com` handles login, registration, and password management.
- **Communications Hub Microservice:** Unified multi-channel communications (Email, SMS, WhatsApp, Push) with Plesk integration, Docker containerized with Redis for message queuing, and PostgreSQL persistence. Includes API endpoints for sending messages, channel status, template management, and user preferences.
- **External API Key System:** Enables third-party integrations with API key authentication, configurable rate limiting, IP whitelisting, scope-based permissions, key expiration, and usage logging.

### System Design Choices
- **Microservice Architecture:** Part of a larger digital logistics ecosystem with specialized subdomains.
- **Subdomain Routing:** Public routes on `molochain.com`, admin routes on `admin.molochain.com`.
- **CMS Integration:** Consumes content from a centralized Laravel CMS (`cms.molochain.com`) via a `CMS Sync Service` for periodic data synchronization and caching.
- **Mololink Microservice:** Independent Express microservice with its own PostgreSQL, React SPA, RESTful API, and hybrid JWT authentication.
- **Containerization (Docker):** Dockerfiles and `docker-compose.yml` for services (Admin, Main, Auth, PostgreSQL, Redis) utilizing multi-stage builds, health checks, non-root users, and Nginx reverse proxy.
- **Shared Packages:** `packages/shared-permissions/` (RBAC), `packages/shared-auth/` (Auth types), `packages/shared-audit/` (Audit logging).
- **Unified API Gateway:** `services/api-gateway/` - Grade A+ enterprise gateway for the Molochain ecosystem providing REST and WebSocket endpoints, JWT + API Key dual authentication, security features, caching, rate limiting, and routing to 11 microservices.
- **Admin Standalone Frontend:** Isolated React 18 + Vite + TypeScript + Tailwind CSS application for admin functionalities, including dynamic dashboards, container management, and system metrics.

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