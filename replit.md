# Rest Express - Full-Stack TypeScript Application

### Overview
Rest Express is a comprehensive Node.js/TypeScript full-stack application within Molochain's ecosystem, designed for business management. It integrates a React frontend, an Express backend, AI capabilities, real-time WebSocket services, and PostgreSQL. The project supports supply chain management, real-time collaboration, performance monitoring, and secure user interactions, serving as a central hub for various Molochain services with a vision for extensive business management and market potential.

### User Preferences
- Prefers clean, minimal solutions
- Values stability and production-readiness
- Requires detailed technical feedback
- Incremental, reversible changes only
- No breaking changes to production
- Blockchain code removed: All blockchain conditionals and references removed (wallet system preserved)

### System Architecture

**UI/UX Decisions:**
- **Frontend:** React 18 with Vite, TypeScript, Tailwind CSS, and shadcn/ui for a responsive and modern user interface.
- **Branding:** Consistent design adhering to Molochain branding guidelines, with a `Portal Layout` for authenticated users, featuring a collapsible sidebar and user-specific navigation.
- **Dashboards:** Configurable dashboards adaptable to user roles and departments.
- **Components:** Utilizes reusable shared components for consistency.
- **Onboarding:** A 6-step onboarding wizard for new users.

**Technical Implementations:**
- **Backend:** Express.js with TypeScript, providing API services and WebSocket support.
- **Database:** PostgreSQL managed with Drizzle ORM (128 tables across 5 schema files).
- **Real-time:** `UnifiedWebSocketManager` for robust WebSocket handling.
- **AI Services:** OpenAI integration, controlled by the `FEATURE_AI_ENABLED` flag.
- **Security:** Implements CSRF protection, rate limiting, file upload validation, authentication middleware, Zod schema validation, and SHA-256 hashed refresh tokens with rotation.
- **Email System:** A comprehensive cross-subdomain email notification system featuring template-based sending, monitoring, 3-tier dynamic rate limiting, and API key management.

**Feature Specifications:**
- **Core Features:** Supply chain management, real-time collaboration, performance monitoring, secure user authentication/authorization, file management, API documentation, and a Communications Hub.
- **Backend Routing:** Routes are organized into logical domain registrars.
- **Authentication (SSO):** Cross-subdomain SSO architecture with Redis-backed session for `admin.molochain.com` and JWT-based cookie for other subdomains. A standalone React SPA at `auth.molochain.com` handles login, registration, and password management. Mobile apps use JWT Bearer tokens.
- **Page Distribution:** Approximately 60 pages across Admin, General, Auth, Services, Dashboard, Profile, Brandbook, and Projects sections.
- **Route Protection:** Public, Auth Required, and Admin Required routes are configured.

**Services Platform Architecture (v1):**
- **Purpose:** Unified, versioned Services API decoupled from CMS dependency.
- **Core Endpoints:** Catalog listing, single service details, categories, full-text search, service availability, delta sync, booking API, pricing API, and favorites API.
- **Admin Endpoints:** Force CMS sync, cache invalidation, sync status, and service updates.
- **Webhook Endpoints:** Real-time CMS update notifications with HMAC-SHA256 verification.
- **Architecture Layers:** Includes types, repository, cache, controller, routes, sync-worker, sync-monitor, webhook-handler, admin-override, and rate-limiter.
- **Data Flow:** CMS API → Repository → Cache → Controller → Client.
- **Sync Schedule:** Every 5 minutes.
- **Webhook Integration:** Real-time cache invalidation when CMS content changes.

**System Design Choices:**
- **Microservice Architecture:** Part of a larger digital logistics ecosystem with specialized subdomains like `mololink.molochain.com`, `opt.molochain.com`, and `cms.molochain.com`.
- **Subdomain Routing:** Public routes on `molochain.com`, admin routes on `admin.molochain.com`, with specific authentication handling.
- **CMS Integration:** Consumes content from a centralized Laravel CMS (`cms.molochain.com`) via read-only public endpoints, with a `CMS Sync Service` for periodic data synchronization and caching.
- **Mololink Microservice:** An independent Express microservice with its own PostgreSQL, React SPA, RESTful API, hybrid JWT authentication, and Docker containerization.
- **Containerization (Docker):** Dockerfiles and `docker-compose.yml` for services (Admin, Main, Auth, PostgreSQL, Redis) utilizing multi-stage builds, health checks, non-root users, and Nginx reverse proxy.
- **Shared Packages (Microservice-ready):** `packages/shared-permissions/` (RBAC), `packages/shared-auth/` (Auth types), `packages/shared-audit/` (Audit logging).
- **API Gateway (Prepared):** `server/gateway/` for admin gateway middleware (rate limiting, circuit breaker, correlation IDs).

**Production Build Pipeline:**
- **Purpose:** Custom esbuild configuration for production deployments.
- **Key Features:** esbuild plugin redirects `server/db` imports to `server/db.prod.ts` (uses `pg` driver for local PostgreSQL), static assets copying.
- **Database Driver Strategy:** `@neondatabase/serverless` for Neon cloud PostgreSQL (development), standard `pg` driver for local PostgreSQL (production).
- **Deployment Process:** Frontend build, server build, tarball creation, upload, extraction, and PM2 deployment.

**Communications Hub Microservice:**
- **Purpose:** Unified multi-channel communications (Email, SMS, WhatsApp, Push) with Plesk integration.
- **Architecture:** Docker containerized with Redis for message queue, Channel Manager (Email, SMS, WhatsApp, Push), Message Queue with priority and retry logic, Template System, PostgreSQL persistence layer (Drizzle ORM).
- **Database Tables:** `message_channels`, `message_templates`, `message_queue`, `delivery_logs`, `user_notification_preferences`.
- **Channel Status (Production):** Email, WhatsApp, Push enabled and healthy; SMS disabled (needs Twilio credentials).
- **API Endpoints:** Send messages, bulk send, channel status, list templates, delivery analytics, create Plesk mail account.
- **Admin Dashboard:** Component and page for multi-channel communications management.
- **Proxy Route:** `server/routes/communications-proxy.ts` forwards requests to the microservice.

**Server Management Scripts:**
- **Purpose:** Production server monitoring, analysis, and maintenance.
- **Scripts:** `server-health-check.ts`, `server-deep-scan.ts`, `cleanup-old-backups.ts`, `deploy-communications-hub.ts`, `configure-communications-nginx.ts`, `set-comms-env-production.ts`.
- **Requirements:** `SERVER_SSH_PASSWORD` secret must be set.

### External Dependencies

- **Core Frameworks**: Express, React, Vite, TypeScript
- **Database**: Drizzle ORM, `@neondatabase/serverless` (dev), `pg` (prod)
- **UI Libraries**: shadcn/ui, Tailwind CSS, Radix UI
- **Real-time**: Socket.IO, WebSockets
- **Authentication**: Passport.js, JWT
- **File Handling**: Multer, Sharp
- **AI**: OpenAI SDK
- **Payment**: Stripe
- **Monitoring/Logging**: Winston, `winston-daily-rotate-file`
- **Email Notifications**: Nodemailer (with local Postfix relay)
- **External APIs**:
  - **CMS**: `https://cms.molochain.com/api`
  - **OTMS**: `https://opt.molochain.com/v1`
  - **Auth Service**: `http://172.22.0.1:7010` (internal)
```