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
- **Design System:** Monorepo using Turborepo and pnpm, publishing `@molochain/tokens` (design tokens), `@molochain/ui` (React components with CVA/Tailwind), `@molochain/i18n` (internationalization), and `@molochain/tsconfig` (shared TS config).
- **Internationalization (i18n):** Grade A++ multilingual support with HTTP-loaded translations:
  - **Languages:** English (EN), Arabic (AR), Persian/Farsi (FA), Turkish (TR), Spanish (ES), Russian (RU), Chinese (ZH)
  - **Features:** 14 departments fully translated, clean navigation (Home, Services, Ecosystem, Contact, Resources, Company)
  - **Translation Files:** `client/public/locales/{lang}/translation.json`
  - **Production Path:** `httpdocs/locales/{lang}/translation.json` on molochain.com
  - **RTL Support:** Automatic `dir` and `lang` attribute updates for Arabic and Persian
  - **Components:** Hero, Footer, Navigation, Home all use t() for translations
- **Admin Frontend:** Isolated React 18 + Vite + TypeScript + Tailwind CSS application for admin functionalities, including dynamic dashboards, container management, and system metrics.

### Technical Implementations
- **Backend:** Express.js with TypeScript.
- **Database:** PostgreSQL managed with Drizzle ORM.
- **Real-time:** `UnifiedWebSocketManager` for robust WebSocket handling.
- **AI Services:** OpenAI integration, controlled by the `FEATURE_AI_ENABLED` flag.
- **Security:** CSRF protection, rate limiting, file upload validation, authentication middleware, Zod schema validation, SHA-256 hashed refresh tokens with rotation, internal API key authentication for sidecar services.
- **Email System:** Comprehensive cross-subdomain email notification system with template-based sending, monitoring, dynamic rate limiting, and API key management.
- **Container Management:** Real-time monitoring of Docker microservices, container auto-recovery for unhealthy services, and bulk actions.
- **Automated Operations:** Automated database backups, automated alert rules engine with conditions/actions/approval gates, and one-click runbooks for infrastructure fixes with risk indicators.
- **Monitoring:** Real-time dashboard with embedded Grafana charts, centralized multi-service logs, SSL certificate monitoring, and historical resource trend analytics with anomaly detection.
- **Deployment Tracking:** CI/CD integration for deployment timeline visualization and status updates.
- **Audit Logging:** Comprehensive tracking of admin actions.

### Feature Specifications
- **Core Features:** Supply chain management, real-time collaboration, performance monitoring, secure user authentication/authorization, file management, API documentation, and a Communications Hub.
- **Authentication (SSO):** Cross-subdomain SSO architecture with Redis-backed session for `admin.molochain.com` and JWT-based cookie for other subdomains, managed by a standalone React SPA at `auth.molochain.com`.
- **Communications Hub Microservice:** Unified multi-channel communications (Email, SMS, WhatsApp, Push) with Plesk integration, Dockerized with Redis for message queuing, and PostgreSQL persistence.
- **External API Key System:** Enables third-party integrations with API key authentication, configurable rate limiting, IP whitelisting, scope-based permissions, key expiration, and usage logging.

### System Design Choices
- **Microservice Architecture:** Part of a larger digital logistics ecosystem with specialized subdomains.
- **Subdomain Routing:** Public routes on `molochain.com`, admin routes on `admin.molochain.com`, design system on `design.molochain.com`, auth on `auth.molochain.com`.
- **CMS Integration:** Consumes content from a centralized Laravel CMS (`cms.molochain.com`) via a `CMS Sync Service`.
- **Containerization (Docker):** Dockerfiles and `docker-compose.yml` for services (Admin, Main, Auth, PostgreSQL, Redis, sidecars) utilizing multi-stage builds, health checks, non-root users, and Nginx reverse proxy.
- **Shared Packages:** `packages/shared-permissions/` (RBAC), `packages/shared-auth/` (Auth types), `packages/shared-audit/` (Audit logging).
- **Unified API Gateway:** `services/api-gateway/` providing REST and WebSocket endpoints, JWT + API Key dual authentication, security features, caching, rate limiting, and routing to microservices.
- **Sidecar Services:** Dedicated Node.js services for PostgreSQL administration (`molochain-db-admin`), TLS checking (`ssl-checker`), container monitoring (`container-monitor`), and real-time notifications (`notification-service`).

## External Dependencies

- **Core Frameworks**: Express, React, Vite, TypeScript
- **Database**: PostgreSQL, Drizzle ORM, `@neondatabase/serverless` (dev), `pg` (prod)
- **UI Libraries**: shadcn/ui, Tailwind CSS, Radix UI, recharts
- **Real-time**: Socket.IO, WebSockets
- **Authentication**: Passport.js, JWT
- **File Handling**: Multer, Sharp
- **AI**: OpenAI SDK
- **Payment**: Stripe
- **Monitoring/Logging**: Winston, Prometheus, Grafana
- **Email Notifications**: Nodemailer
- **Task Scheduling**: node-cron
- **Monorepo Tools**: Turborepo, pnpm
- **NPM Registry**: Verdaccio
- **External APIs**:
  - **CMS**: `https://cms.molochain.com/api`
  - **OTMS**: `https://opt.molochain.com/v1`
  - **Auth Service**: `http://172.22.0.1:7010` (internal)

## Recent Changes (January 2026)

### Production Deployment
- **Server:** 31.186.24.19 with Docker container "molochain-core"
- **Frontend:** Static files served from `/var/www/vhosts/molochain.com/httpdocs/`
- **Backend:** Node.js via PM2 on port 5000 with systemd auto-start configured
- **Status:** Production API healthy at `https://molochain.com/api/health`

### Cleanup & Fixes
- **Accessibility:** Added `aria-describedby={undefined}` to DialogContent, AlertDialogContent, and SheetContent components
- **Orphaned Files Removed:** DashboardNavigation.tsx, DashboardLayout.tsx, DashboardManager.tsx (unused components)
- **ESM Compatibility:** Fixed memory optimizer to remove CommonJS require.cache logic
- **Navigation:** Dashboard/Blockchain menu items removed from public navigation (protected portal routes remain for authenticated users)

## Ecosystem Service Registry (January 2026)

### Centralized Service Management
The platform now includes a centralized ecosystem registry for managing all microservices, API keys, webhooks, and documentation.

**Registry API:** `/api/ecosystem/registry/`
- **Services:** `/services` - Register, update, and monitor microservices
- **Webhooks:** `/webhooks` - Manage webhook subscriptions and delivery
- **Docs:** `/docs` - API documentation aggregation portal

### Registered Core Services (Phase 1)

| Service | Slug | Base URL | Status |
|---------|------|----------|--------|
| API Gateway | `api-gateway` | https://molochain.com/api | Active |
| Communications Hub | `communications-hub` | https://comms.molochain.com | Pending |
| Notification Service | `notification-service` | http://172.22.0.1:7020 | Internal |
| Container Monitor | `container-monitor` | http://172.22.0.1:7030 | Internal |
| SSL Checker | `ssl-checker` | http://172.22.0.1:7040 | Internal |
| CMS Sync Service | `cms-sync` | https://cms.molochain.com/api | Active |
| RAYANAVA AI Gateway | `rayanava` | http://localhost:5000/api/rayanava | Active |

### API Key Format
- **API Key Prefix:** `mk_eco_` (48 hex chars)
- **API Secret Prefix:** `msk_eco_` (64 hex chars)
- **Scopes:** `ecosystem:read`, `ecosystem:write`, `service:{slug}`

### Webhook Events
Each service registers 3 webhook events for lifecycle tracking:
- Gateway: `gateway.request.failed`, `gateway.rate_limit.exceeded`, `gateway.auth.failed`
- Communications: `comms.email.sent`, `comms.email.failed`, `comms.sms.delivered`
- Notifications: `notification.sent`, `notification.read`, `notification.failed`
- Containers: `container.unhealthy`, `container.recovered`, `container.stopped`
- SSL: `ssl.expiring_soon`, `ssl.expired`, `ssl.renewed`
- CMS: `cms.sync.started`, `cms.sync.completed`, `cms.sync.failed`

### Key Files
- **Schema:** `shared/schema.ts` (ecosystemServices, ecosystemWebhooks, ecosystemApiDocs)
- **Routes:** `server/routes/ecosystem-registry.ts`
- **Registrar:** `server/registrars/ecosystem.registrar.ts`
- **Seed Script:** `server/scripts/seed-ecosystem-services.ts`