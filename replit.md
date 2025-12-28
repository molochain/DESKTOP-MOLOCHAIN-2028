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
- **Dashboards:** Configurable dashboards (`ConfigurableDashboard`, `ConfigurableDepartmentDashboard`) adaptable to user roles and departments.
- **Components:** Utilizes reusable shared components (e.g., `StatCard`, `PageShell`, `DataGrid`, `EmptyState`) for consistency.
- **Onboarding:** A 6-step onboarding wizard for new users, with progress persisted in `localStorage`.

**Technical Implementations:**
- **Backend:** Express.js with TypeScript, providing API services and WebSocket support.
- **Database:** PostgreSQL managed with Drizzle ORM (128 tables across 5 schema files, including core app, achievements, AI assistant, organizational, and Rayanava).
- **Real-time:** `UnifiedWebSocketManager` for robust WebSocket handling.
- **AI Services:** OpenAI integration, controlled by the `FEATURE_AI_ENABLED` flag.
- **Security:** Implements CSRF protection, rate limiting, file upload validation, authentication middleware, Zod schema validation, and SHA-256 hashed refresh tokens with rotation.
- **Email System:** A comprehensive cross-subdomain email notification system featuring template-based sending, monitoring, 3-tier dynamic rate limiting, and API key management with SHA-256 hashing.

**Feature Specifications:**
- **Core Features:** Supply chain management, real-time collaboration, performance monitoring, secure user authentication/authorization, file management, API documentation, and a Communications Hub.
- **Backend Routing:** Routes are organized into logical domain registrars (`admin`, `services`, `collaboration`, `analytics`, `security`, `ecosystem`).
- **Authentication (SSO):** Cross-subdomain SSO architecture with two systems: Redis-backed session for `admin.molochain.com` and JWT-based cookie for `mololink`, `opt`, `app` subdomains. A standalone React SPA at `auth.molochain.com` handles login, registration, and password management.
- **Mobile Apps:** Continue using JWT Bearer tokens (Authorization header).
- **Page Distribution:** Approximately 60 pages across Admin (30), General (12), Auth (4), Services (5), Dashboard (4), Profile (2), Brandbook (1), Projects (1).
- **Route Protection:** Public (15), Auth Required (28), Admin Required (29) routes are configured.

**Services Platform Architecture (v1):**
- **Location:** `server/platform/services/v1/`
- **Purpose:** Unified, versioned Services API decoupled from CMS dependency (CMS is canonical source)
- **Status:** Production-ready, deployed to molochain.com (Dec 28, 2025)
- **Core Endpoints:**
  - `GET /api/platform/services/v1/catalog` - Paginated service catalog (46 services, 19 categories)
  - `GET /api/platform/services/v1/catalog/:id` - Single service details by ID (e.g., "container", "trucking")
  - `GET /api/platform/services/v1/categories` - Service categories list
  - `GET /api/platform/services/v1/search?q=` - Full-text search
  - `GET /api/platform/services/v1/availability/:id` - Service availability
  - `GET /api/platform/services/v1/sync/delta?since=` - Delta sync for mobile
- **Admin Endpoints:**
  - `POST /api/platform/services/v1/admin/sync` - Force CMS sync
  - `POST /api/platform/services/v1/admin/cache/invalidate` - Clear all caches
  - `GET /api/platform/services/v1/admin/sync/status` - Sync status and stats
  - `GET /api/platform/services/v1/admin/logs` - Admin override action logs
  - `PATCH /api/platform/services/v1/admin/service/:id` - Update service (cache invalidation)
- **Webhook Endpoints:**
  - `POST /api/platform/services/v1/webhooks/cms` - Real-time CMS update notifications (HMAC-SHA256 verified)
  - `GET /api/platform/services/v1/webhooks/status` - Webhook processing status and logs
- **Architecture Layers (11 TypeScript files):**
  - `types.ts` - TypeScript interfaces and API contracts
  - `repository.ts` - CMS-integrated data layer (CMS as canonical source)
  - `cache.ts` - Multi-tier caching (5min catalog, 1min individual services)
  - `controller.ts` - Business logic and request handling
  - `routes.ts` - Express route definitions
  - `sync-worker.ts` - Scheduled CMS sync (every 5 minutes)
  - `sync-monitor.ts` - Sync health monitoring and metrics
  - `webhook-handler.ts` - Real-time CMS update handling with HMAC-SHA256 verification
  - `admin-override.ts` - Emergency admin capabilities
  - `rate-limiter.ts` - API rate limiting per endpoint
  - `index.ts` - Module exports
- **Data Flow:** CMS API → Repository → Cache → Controller → Client
- **Sync Schedule:** Every 5 minutes (validates 46 services from CMS)
- **Webhook Integration:** Real-time cache invalidation when CMS content changes

**Laravel CMS Webhook Integration:**
- **Location:** `server/laravel/` (reference files for production deployment)
- **Production Files:**
  - `app/Services/WebhookService.php` - HMAC-SHA256 signed webhook sender (2573B)
  - `app/Observers/ServiceObserver.php` - Auto-triggers webhooks on service CRUD (667B)
  - `routes/web.php` - Dashboard redirect to /admin
- **Configuration:**
  - `CMS_WEBHOOK_SECRET` - 64-char secret configured on both Node.js and Laravel
  - `MOLOCHAIN_WEBHOOK_URL` - Target endpoint for webhooks
- **Events:** service.created, service.updated, service.deleted, services.bulk_update
- **Status:** Fully operational (100% success rate, Dec 28, 2025)

**System Design Choices:**
- **Microservice Architecture:** Part of a larger digital logistics ecosystem with specialized subdomains like `mololink.molochain.com` (marketplace), `opt.molochain.com` (OTMS), and `cms.molochain.com` (content).
- **Subdomain Routing:** Public routes on `molochain.com`, admin routes on `admin.molochain.com`, with specific handling for authentication across subdomains.
- **CMS Integration:** Consumes content from a centralized Laravel CMS (`cms.molochain.com`) via read-only public endpoints, with a `CMS Sync Service` for periodic data synchronization and caching. Primary data source for Services Platform v1.
- **Mololink Microservice:** An independent Express microservice at `mololink.molochain.com` with its own PostgreSQL, React SPA, RESTful API, hybrid JWT authentication, and Docker containerization.
- **Containerization (Docker):** Dockerfiles and `docker-compose.yml` for services: Admin (port 7000), Main (port 5000), Auth (port 7010), PostgreSQL, Redis. Utilizes multi-stage builds, health checks, non-root users, and Nginx reverse proxy.
- **Shared Packages (Microservice-ready):** `packages/shared-permissions/` (RBAC), `packages/shared-auth/` (Auth types), `packages/shared-audit/` (Audit logging).
- **API Gateway (Prepared):** `server/gateway/` for admin gateway middleware (rate limiting, circuit breaker, correlation IDs).

### External Dependencies

- **Core Frameworks**: Express, React, Vite, TypeScript
- **Database**: Drizzle ORM, `@neondatabase/serverless`, `pg`
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