# Frontend-Backend Architecture Mapping

> **Generated**: December 24, 2025  
> **Purpose**: Mapping of React pages to Express API endpoints  
> **Maintainer**: Molochain Development Team  
> **Note**: This document maps verified, working integrations. Static pages without API dependencies are marked accordingly.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer Structure](#layer-structure)
3. [Frontend Route Categories](#frontend-route-categories)
4. [Backend Route Registrars](#backend-route-registrars)
5. [Complete Page-to-API Mapping](#complete-page-to-api-mapping)
6. [Shared Types & Schemas](#shared-types--schemas)
7. [WebSocket Namespaces](#websocket-namespaces)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MOLOCHAIN PLATFORM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      FRONTEND (React 18 + Vite)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │  Pages   │ │Components│ │  Hooks   │ │ Contexts │            │   │
│  │  │(131 TSX) │ │ (UI/UX)  │ │(Auth,API)│ │(WS,Theme)│            │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │   │
│  │       │            │            │            │                   │   │
│  │       └────────────┴────────────┴────────────┘                   │   │
│  │                          │                                        │   │
│  │              ┌───────────▼───────────┐                           │   │
│  │              │   TanStack Query      │                           │   │
│  │              │   (API Client Layer)  │                           │   │
│  │              └───────────┬───────────┘                           │   │
│  └──────────────────────────┼───────────────────────────────────────┘   │
│                             │                                           │
│  ┌──────────────────────────▼───────────────────────────────────────┐   │
│  │                      BACKEND (Express + TypeScript)               │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │                    API GATEWAY (routes.ts)                  │  │   │
│  │  └────────────────────────────┬───────────────────────────────┘  │   │
│  │                               │                                   │   │
│  │  ┌───────────┬───────────┬────┴────┬───────────┬───────────┐    │   │
│  │  │  Admin    │ Services  │Analytics│ Security  │ Ecosystem │    │   │
│  │  │Registrar  │Registrar  │Registrar│Registrar  │Registrar  │    │   │
│  │  └─────┬─────┴─────┬─────┴────┬────┴─────┬─────┴─────┬─────┘    │   │
│  │        │           │          │          │           │           │   │
│  │  ┌─────▼───────────▼──────────▼──────────▼───────────▼─────┐    │   │
│  │  │              Route Handlers (30 files)                   │    │   │
│  │  └─────────────────────────┬───────────────────────────────┘    │   │
│  │                            │                                     │   │
│  │  ┌─────────────────────────▼───────────────────────────────┐    │   │
│  │  │         Services Layer (Business Logic)                  │    │   │
│  │  └─────────────────────────┬───────────────────────────────┘    │   │
│  └────────────────────────────┼─────────────────────────────────────┘   │
│                               │                                         │
│  ┌────────────────────────────▼─────────────────────────────────────┐   │
│  │                    DATABASE (PostgreSQL via Drizzle)              │   │
│  │                    SHARED TYPES (shared/schema.ts)                │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Structure

### Frontend Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **Pages** | `client/src/pages/` | 131 React page components |
| **Routes** | `client/src/routes/` | 9 route registration modules |
| **Components** | `client/src/components/` | Reusable UI components |
| **Hooks** | `client/src/hooks/` | Custom React hooks |
| **Contexts** | `client/src/contexts/` | Global state providers |
| **Modules** | `client/src/modules/` | Feature modules (Mololink) |
| **Lib** | `client/src/lib/` | Utilities, API client |

### Backend Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **Entry Point** | `server/routes.ts` | Main route registration |
| **Registrars** | `server/registrars/` | Domain-specific route groups |
| **Routes** | `server/routes/` | 30 route handler files |
| **API** | `server/api/` | Additional API endpoints |
| **Core** | `server/core/` | Auth, cache, monitoring |
| **Services** | `server/services/` | Business logic |
| **Middleware** | `server/middleware/` | Request processing |

---

## Frontend Route Categories

### Route Registration Files

| File | Category | Pages | Auth Required |
|------|----------|-------|---------------|
| `main.routes.ts` | General Public | Home, About, Contact, FAQ | No |
| `auth.routes.ts` | Authentication | Login, Register, Reset | No |
| `portal.routes.ts` | User Portal | Dashboard, Settings | Yes |
| `admin.routes.ts` | Administration | All /admin/* pages | Yes + Admin |
| `departments.routes.ts` | Departments | Department-specific pages | Yes |
| `services.routes.ts` | Services | Service catalog, management | Mixed |
| `ecosystem.routes.ts` | Ecosystem | Partners, integrations | Mixed |
| `mololink.routes.ts` | Mololink | Marketplace, network | Mixed |
| `brandbook.routes.ts` | Branding | Style guides | No |

---

## Backend Route Registrars

### Registrar Mapping

| Registrar | File | API Prefix | Routes Registered |
|-----------|------|------------|-------------------|
| **Admin** | `admin.registrar.ts` | `/api/admin/*` | Users, Security, Memory, Tracking, Content, Settings, Branding, Email |
| **Services** | `services.registrar.ts` | `/api/*` | Services, Quote, Partners, Recommendations |
| **Analytics** | `analytics.registrar.ts` | `/api/*` | Analytics, Performance, Carriers |
| **Collaboration** | `collaboration.registrar.ts` | `/api/*` | Collaboration, Documents, Workspace |
| **Security** | `security.registrar.ts` | `/api/*` | Auth, 2FA, Identity, Incidents, Notifications |
| **Ecosystem** | `ecosystem.registrar.ts` | `/api/*` | CMS, OTMS, Ecosystem, Mololink |

---

## Complete Page-to-API Mapping

### Admin Pages (28 pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **Dashboard** | `admin/Dashboard.tsx` | `/api/admin/analytics/dashboard` | Admin |
| **UserManagement** | `admin/UserManagement.tsx` | `/api/admin/users`, `/api/admin/users/stats` | Admin |
| **SecuritySettings** | `admin/SecuritySettings.tsx` | `/api/admin/security/settings`, `/api/admin/security/stats`, `/api/admin/security/audit-logs`, `/api/admin/security/scan` | Admin |
| **HealthMonitoringDashboard** | `admin/HealthMonitoringDashboard.tsx` | `/api/health/detailed` | Admin |
| **IdentitySecurityDashboard** | `admin/IdentitySecurityDashboard.tsx` | `/api/identity/users`, `/api/access/roles`, `/api/audit/logs`, `/api/audit/statistics`, `/api/compliance/reports`, `/api/security/rules`, `/api/security/metrics` | Admin |
| **CommunicationsHub** | `admin/CommunicationsHub.tsx` | `/api/admin/email/api-keys`, `/api/admin/email/recipients`, `/api/admin/email/settings`, `/api/admin/email/templates`, `/api/admin/submissions`, `/api/admin/submissions/stats` | Admin |
| **PageModuleManager** | `admin/PageModuleManager.tsx` | `/api/admin/page-modules`, `/api/admin/page-modules/tree` | Admin |
| **TrackingProviders** | `admin/TrackingProviders.tsx` | `/api/admin/tracking-providers` | Admin |
| **PerformanceMonitor** | `admin/PerformanceMonitor.tsx` | `/api/performance/metrics`, `/api/performance/optimize/cache`, `/api/performance/optimize/memory` | Admin |
| **WebSocketHealth** | `admin/WebSocketHealth.tsx` | `/api/ws-health` | Admin |
| **SystemDashboard** | `admin/SystemDashboard.tsx` | `/api/ecosystem/status`, `/api/performance/metrics` | Admin |
| **ModularControlPanel** | `admin/ModularControlPanel.tsx` | `/api/ecosystem/status` | Admin |
| **Activity** | `admin/Activity.tsx` | (Static/Component-based) | Admin |
| **AdminLandingPage** | `admin/AdminLandingPage.tsx` | (Static) | Admin |
| **AnalyticsControlCenter** | `admin/AnalyticsControlCenter.tsx` | (Component-based) | Admin |
| **ConfigurationControlCenter** | `admin/ConfigurationControlCenter.tsx` | (Component-based) | Admin |
| **CoreSystemControlCenter** | `admin/CoreSystemControlCenter.tsx` | (Component-based) | Admin |
| **IntegrationControlCenter** | `admin/IntegrationControlCenter.tsx` | `/api/auth/login`, `/api/projects`, `/api/tracking/:id` | Admin |
| **MasterControlCenter** | `admin/MasterControlCenter.tsx` | (Component-based) | Admin |
| **OperationsControlCenter** | `admin/OperationsControlCenter.tsx` | (Component-based) | Admin |
| **SecurityControlCenter** | `admin/SecurityControlCenter.tsx` | (Uses internal query key) | Admin |

### AI Pages (4 pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **Rayanava** | `ai/Rayanava.tsx` | `/api/rayanava/chat` | Yes |
| **RayanavaAnalytics** | `ai/RayanavaAnalytics.tsx` | `/api/rayanava/analytics`, `/api/rayanava/conversations/metrics`, `/api/rayanava/learning/metrics` | Yes |
| **AIHub** | `ai/AIHub.tsx` | (Static navigation) | Yes |
| **RayanavaAI** | `ai/RayanavaAI.tsx` | (Uses Rayanava component) | Yes |

### Auth Pages (6 pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **Login** | `auth/Login.tsx` | `/api/auth/login` | No |
| **Register** | `auth/Register.tsx` | (Uses auth hook) | No |
| **RequestPasswordReset** | `auth/RequestPasswordReset.tsx` | `/api/auth/request-reset` | No |
| **ResetPassword** | `auth/ResetPassword.tsx` | `/api/auth/reset-password` | No |
| **APIKeysManagement** | `auth/api-keys-management.tsx` | `/api/api-keys` | Yes |
| **IdentityManagement** | `auth/identity-management.tsx` | `/api/identity/documents` | Yes |

### Dashboard Pages (8 pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **MainDashboard** | `dashboard/MainDashboard.tsx` | `/api/dashboards/stats` | Yes |
| **PerformanceDashboard** | `dashboard/PerformanceDashboard.tsx` | `/api/performance/metrics` | Yes |
| **ReportsDashboard** | `dashboard/reports-dashboard.tsx` | `/api/departments`, `/api/divisions`, `/api/reports/department`, `/api/reports/division`, `/api/reports/organization`, `/api/bulk/export`, `/api/bulk/import` | Yes |
| **TrackingDashboard** | `dashboard/TrackingDashboard.tsx` | `/api/tracking` | Yes |
| **AdvancedAnalytics** | `dashboard/AdvancedAnalytics.tsx` | (Component-based) | Yes |
| **PortfolioDashboard** | `dashboard/PortfolioDashboard.tsx` | (Component-based) | Yes |
| **SmartDashboardPage** | `dashboard/SmartDashboardPage.tsx` | (Component-based) | Yes |
| **StakingDashboard** | `dashboard/StakingDashboard.tsx` | (Blockchain - disabled) | Yes |

### General/Public Pages (35+ pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **Home** | `general/Home.tsx` | (CMS via components) | No |
| **About** | `general/About.tsx` | (Static) | No |
| **Contact** | `general/Contact.tsx` | `/api/contact/submit` | No |
| **Partners** | `general/Partners.tsx` | `/api/partners` | No |
| **Ecosystem** | `general/Ecosystem.tsx` | `/api/ecosystem/departments`, `/api/ecosystem/status` | No |
| **EcosystemControlPanel** | `general/EcosystemControlPanel.tsx` | `/api/ecosystem/achievements/user`, `/api/ecosystem/alerts`, `/api/ecosystem/departments`, `/api/ecosystem/status` | Yes |
| **Achievements** | `general/Achievements.tsx` | `/api/achievements/achievements`, `/api/achievements/badges`, `/api/achievements/leaderboard`, `/api/achievements/user-progress`, `/api/achievements/user-stats` | Yes |
| **GoogleDrivePage** | `general/GoogleDrivePage.tsx` | `/api/drive/files`, `/api/drive/folders`, `/api/drive/download`, `/api/drive/move`, `/api/drive/batch-delete`, `/api/drive/auto-organize`, `/api/drive/archive-old`, `/api/drive/create-quick-folders` | Yes |
| **GoogleDriveSetup** | `general/GoogleDriveSetup.tsx` | `/api/drive/test-connection`, `/api/settings/storage` | Yes |
| **Settings** | `general/Settings.tsx` | `/api/settings`, `/api/settings/features`, `/api/settings/api-keys` | Yes |
| **GodLayer** | `general/GodLayer.tsx` | `/api/god-layer/initialize`, `/api/god-layer/roles`, `/api/god/compliance-status`, `/api/god/performance-overview`, `/api/god/policy-framework`, `/api/god/strategic-vision` | Admin |
| **RayanavabrainGodLayer** | `general/RayanavabrainGodLayer.tsx` | `/api/rayanavabrain/commands`, `/api/rayanavabrain/settings`, `/api/rayanavabrain/sync`, `/api/rayanavabrain/layer-status`, `/api/rayanavabrain/sync-history` | Admin |
| **PerformanceMonitoring** | `general/PerformanceMonitoring.tsx` | `/api/admin/api/metrics`, `/api/admin/database/metrics`, `/api/admin/performance/metrics`, `/api/admin/security/metrics`, `/api/admin/system/metrics`, `/api/admin/websocket/metrics` | Admin |
| **VisionsManagement** | `general/VisionsManagement.tsx` | `/api/visions` | Yes |

### Services Pages (5 pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **Services** | `services/Services.tsx` | `/api/services` | No |
| **ServiceManagement** | `services/ServiceManagement.tsx` | `/api/services`, `/api/services/stats/summary` | Admin |
| **ServicePage** | `services/ServicePage.tsx` | (Dynamic via params) | No |
| **ServiceRecommender** | `services/ServiceRecommender.tsx` | (Component-based) | No |
| **ServicesHub** | `services/ServicesHub.tsx` | (Navigation) | No |

### Mololink Pages (15 pages)

| Page | File | API Endpoints | Auth |
|------|------|---------------|------|
| **MololinkMain** | `modules/mololink/MololinkMain.tsx` | (Navigation hub) | No |
| **MololinkHome** | `modules/mololink/pages/home.tsx` | `/api/mololink/posts`, `/api/mololink/companies` | Yes |
| **MololinkMarketplace** | `modules/mololink/pages/marketplace.tsx` | `/api/mololink/marketplace/listings`, `/api/mololink/marketplace/auctions` | Yes |
| **MololinkCompanies** | `modules/mololink/pages/companies.tsx` | `/api/mololink/companies` | No |
| **MololinkCompanyProfile** | `modules/mololink/pages/company-profile.tsx` | `/api/mololink/companies/:id` | No |
| **MololinkJobs** | `modules/mololink/pages/jobs.tsx` | (Static/placeholder) | No |
| **MololinkNetwork** | `modules/mololink/pages/network.tsx` | `/api/mololink/connections` | Yes |
| **MololinkMessaging** | `modules/mololink/pages/messaging.tsx` | (WebSocket-based) | Yes |
| **MololinkProfile** | `modules/mololink/pages/profile.tsx` | `/api/mololink/profile` | Yes |
| **MololinkExplorer** | `modules/mololink/pages/explorer.tsx` | `/api/mololink/companies`, `/api/mololink/posts` | Yes |
| **MololinkSearch** | `modules/mololink/pages/search.tsx` | `/api/mololink/search` | No |
| **MololinkNotifications** | `modules/mololink/pages/notifications.tsx` | (WebSocket-based) | Yes |
| **MololinkSolutions** | `modules/mololink/pages/solutions.tsx` | (Static) | No |
| **MololinkResources** | `modules/mololink/pages/resources.tsx` | (Static) | No |
| **MololinkPricing** | `modules/mololink/pages/pricing.tsx` | (Static) | No |

---

## Shared Types & Schemas

### Location: `shared/schema.ts`

The shared schema provides type definitions used by both frontend and backend:

| Entity | Insert Schema | Select Type | Used By |
|--------|---------------|-------------|---------|
| `users` | `insertUserSchema` | `User` | Auth, Admin |
| `services` | `insertServiceSchema` | `Service` | Services pages |
| `projects` | `insertProjectSchema` | `Project` | Dashboard |
| `partners` | `insertPartnerSchema` | `Partner` | Partners page |
| `mololinkProfiles` | `insertMololinkProfileSchema` | `MololinkProfile` | Mololink |
| `mololinkCompanies` | `insertMololinkCompanySchema` | `MololinkCompany` | Mololink |
| `mololinkPosts` | `insertMololinkPostSchema` | `MololinkPost` | Mololink |
| `marketplaceListings` | `insertMarketplaceListingSchema` | `MarketplaceListing` | Mololink Marketplace |
| `marketplaceAuctions` | `insertMarketplaceAuctionSchema` | `MarketplaceAuction` | Mololink Auctions |
| `marketplaceBids` | `insertMarketplaceBidSchema` | `MarketplaceBid` | Mololink Bidding |

---

## WebSocket Namespaces

### Available Namespaces

| Namespace | Purpose | Auth Required |
|-----------|---------|---------------|
| `/ws/main` | General real-time updates | No |
| `/ws/collaboration` | Document collaboration | Yes |
| `/ws/mololink` | Mololink network updates | Yes |
| `/ws/notifications` | User notifications | Yes |
| `/ws/tracking` | Shipment tracking | No |
| `/ws/project-updates` | Project status | Yes |
| `/ws/activity-logs` | Activity streams | Yes |
| `/ws/commodity-chat` | Commodity discussions | Yes |
| `/ws/health` | System health monitoring | No |
| `/ws/dedicated-health` | Detailed health stats | No |

---

## API Documentation

- **Swagger UI**: `/api/docs` (Protected - requires authentication in production)
- **OpenAPI Spec**: `/api/openapi.json` (Protected)
- **Postman Collection**: `/api/postman-collection` (Protected)

---

## Quick Reference

### Finding Which API a Page Uses

1. Open the page file in `client/src/pages/`
2. Search for `useQuery`, `useMutation`, or `/api/`
3. The `queryKey` array contains the API endpoint

### Finding Which Pages Use an API

1. Use grep: `grep -r "/api/endpoint" client/src/pages/`
2. Check the route registrar for the domain

### Adding New Page-API Relationships

1. Create page in `client/src/pages/{category}/`
2. Register route in `client/src/routes/{category}.routes.ts`
3. Create backend route in `server/routes/`
4. Register in appropriate registrar in `server/registrars/`
5. Update this document

---

*Last Updated: December 24, 2025*
