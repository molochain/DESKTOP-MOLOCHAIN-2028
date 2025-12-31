# Rest Express - Full-Stack TypeScript Application

## Overview
Rest Express is a comprehensive Node.js/TypeScript full-stack application within Molochain's ecosystem, designed for business management.

## Admin System (Grade A+ Upgrade - COMPLETE)
**URL:** https://admin.molochain.com (port 7001)

### Completed Features:
1. **Real-Time Dashboard** - CPU/Memory/Disk/Network metrics via Prometheus, embedded Grafana charts
2. **Container Management** - 66 containers with bulk restart/stop, status filtering, health monitoring
3. **User Management** - Admin CRUD with role-based access (super_admin, admin, viewer)
4. **System Settings** - Alerts config, backup schedules, email notifications
5. **Alerts & Notifications** - Threshold-based alerts for CPU/memory/disk/container health
6. **Centralized Logs** - Multi-service aggregation with severity filtering, search, export
7. **SSL Monitoring** - Certificate expiration tracking with TLS validation, distinguishes valid/expiring/invalid
8. **Database Admin** - PostgreSQL management via sidecar (port 7003): table browsing, read-only SQL, backup/restore
9. **API Documentation** - OpenAPI 3.0 spec at /openapi.json, Swagger UI integration

### Architecture:
- **Frontend:** React 18 + Vite + Tailwind + shadcn/ui (molochain-admin-frontend container)
- **Backend:** Pre-built Docker image at port 7000 (molochain-admin-backend)
- **Database Sidecar:** Node.js service at port 7003 (molochain-db-admin) for PostgreSQL admin
- **SSL Sidecar:** Node.js TLS checker at port 7002 (ssl-checker)
- **Networks:** molochain-core + rayanava-network (for Prometheus/Grafana access) It integrates a React frontend, an Express backend, AI capabilities, real-time WebSocket services, and PostgreSQL. The project supports supply chain management, real-time collaboration, performance monitoring, and secure user interactions, serving as a central hub for various Molochain services with a vision for extensive business management and market potential.

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