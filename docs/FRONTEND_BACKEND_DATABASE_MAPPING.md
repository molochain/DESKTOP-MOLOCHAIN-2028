# Frontend-Backend-Database Mapping

**Generated:** December 8, 2025  
**Version:** 1.1

This document provides a comprehensive mapping of how the frontend, backend, and database interact in the MoloChain platform.

---

## Summary

| Category | Count |
|----------|-------|
| Frontend Routes | 81+ |
| Backend API Endpoints | 624+ |
| Database Tables | 130 |
| Route Categories | 6 |

---

## 1. Frontend Route Categories

### 1.1 Main Routes (`main.routes.ts`)

| Frontend Route | Page Component | API Endpoints | Database Tables |
|----------------|----------------|---------------|-----------------|
| `/` | Home | `/api/services`, `/api/health` | services |
| `/about` | About | Static content | None |
| `/contact` | Contact | `/api/contact` | contactSubmissions |
| `/success` | Success | None | None |
| `/projects` | Projects | `/api/projects` | projects |
| `/projects/:id` | ProjectID | `/api/projects/:id` | projects |
| `/latest-projects` | LatestProjects | `/api/projects` | projects |
| `/partners` | Partners | `/api/partners` | Static data |
| `/partner/:id` | PartnerDetail | `/api/partners/:id` | Static data |
| `/tools` | Tools | Static content | None |
| `/quote` | Quote | `/api/quote` | serviceInquiries |
| `/tracking` | TrackingDashboard | `/api/tracking` | shipments |
| `/tracking-demo` | TrackingDemo | Demo data | None |
| `/commodities` | Commodities | `/api/commodities` | commodities |
| `/commodities/:id` | CommodityDetailPage | `/api/commodities/:id` | commodities |
| `/commodity-tags` | CommodityTags | `/api/commodities` | commodities |
| `/collaboration/:projectId` | CollaborationPage | `/api/collaboration` | collaborationSessions |
| `/collaboration-demo` | CollaborationDemoPage | Demo data | None |
| `/collaborative-documents` | CollaborativeDocumentsPage | `/api/collaborative-documents` | - |
| `/file-management` | FileManagementPage | `/api/drive` | mediaFiles |
| `/settings` | Settings | `/api/settings` | adminSettings |
| `/smart-dashboard` | SmartDashboardPage | `/api/dashboards` | - |
| `/guides` | GuidesPage | `/api/guides` | guides, guideCategories |
| `/guides/:id` | GuideDetailPage | `/api/guides/:id` | guides |

### 1.2 Auth Routes (`auth.routes.ts`)

| Frontend Route | Page Component | API Endpoints | Database Tables |
|----------------|----------------|---------------|-----------------|
| `/login` | Login | `/api/auth/login` | users |
| `/register` | Register | `/api/auth/register` | users |
| `/forgot-password` | RequestPasswordReset | `/api/auth/forgot-password` | passwordResetTokens |
| `/reset-password` | ResetPassword | `/api/auth/reset-password` | passwordResetTokens, users |
| `/profile` | UserProfile | `/api/profile` | users |
| `/authentication-guide` | AuthenticationGuide | Static content | None |

### 1.3 Admin Routes (`admin.routes.ts` via `adminPageRegistry.ts`)

| Frontend Route | Page Component | API Endpoints | Database Tables |
|----------------|----------------|---------------|-----------------|
| `/admin` | Dashboard | `/api/admin/stats` | Multiple |
| `/admin/master` | MasterControlCenter | `/api/admin/*` | Multiple |
| `/admin/modular` | ModularControlPanel | `/api/modules` | pageModules |
| `/admin/system` | SystemDashboard | `/api/admin/health` | healthMetrics |
| `/admin/page-modules` | PageModuleManager | `/api/page-modules` | pageModules |
| `/admin/users` | UserManagement | `/api/admin/users` | users |
| `/admin/identity-security` | IdentitySecurityDashboard | `/api/identity-security` | users, securityAudits |
| `/admin/activity` | Activity | `/api/activity/recent` | adminActivityLogs |
| `/admin/websocket-health` | WebSocketHealth | `/api/ws-health` | - |
| `/admin/security` | SecuritySettings | `/api/admin/security` | securityAudits |
| `/admin/performance` | PerformanceMonitor | `/api/admin/system/performance` | performanceMetrics |
| `/admin/health` | HealthMonitoringDashboard | `/api/health` | healthMetrics |
| `/admin/security-control` | SecurityControlCenter | `/api/admin/security` | securityAudits |
| `/admin/operations` | OperationsControlCenter | `/api/admin/stats` | - |
| `/admin/integrations` | IntegrationControlCenter | `/api/admin/*` | - |
| `/admin/analytics` | AnalyticsControlCenter | `/api/analytics` | analyticsSummary |
| `/admin/config` | ConfigurationControlCenter | `/api/admin/settings` | adminSettings |
| `/admin/core-system` | CoreSystemControlCenter | `/api/admin/health` | - |
| `/admin/content` | ContentManager | `/api/admin/content` | contentAssets |
| `/admin/content/about` | AboutEditor | `/api/admin/content/about` | - |
| `/admin/content/services` | ServicesEditor | `/api/admin/content/services` | services |
| `/admin/content/branding` | BrandingEditor | `/api/admin/branding` | - |
| `/admin/settings` | AdminSettings | `/api/admin/settings` | adminSettings |
| `/admin/settings/storage` | StorageSettings | `/api/admin/settings` | adminSettings |
| `/admin/tracking-providers` | TrackingProviders | `/api/admin/tracking-providers` | trackingProviders |
| `/admin/translations` | TranslationSuggestions | `/api/admin/*` | - |
| `/admin/profile` | AdminProfile | `/api/profile` | users |
| `/admin/communications` | CommunicationsHub | `/api/admin/submissions`, `/api/admin/email` | contactSubmissions, emailSettings |

### 1.4 Department Routes (`departments.routes.ts`)

| Frontend Route | Page Component | API Endpoints | Database Tables |
|----------------|----------------|---------------|-----------------|
| `/departments` | DepartmentNavigator | `/api/departments` | ecosystemDepartments |
| `/departments/accounting` | AccountingDashboard | Static content | None |
| `/departments/human-resources` | HRDashboard | Static content | None |
| `/departments/operations` | OperationsDashboard | Static content | None |
| `/departments/supply-chain` | SupplyChainDashboard | `/api/supply-chain` | - |
| `/departments/technology-engineering` | TechnologyDashboard | Static content | None |
| `/departments/marketing-branding` | MarketingDashboard | Static content | None |
| `/departments/legal-risk` | LegalDashboard | Static content | None |
| `/departments/management` | ManagementDashboard | Static content | None |
| `/departments/strategy-development` | StrategyDashboard | Static content | None |
| `/departments/network-partners` | NetworkPartnersDashboard | Static content | None |
| `/departments/learning-knowledge` | LearningKnowledgeDashboard | Static content | None |
| `/departments/documents-library` | DocumentsLibraryDashboard | Static content | None |
| `/departments/god-layer` | GodLayerDashboard | `/api/rayanava` | rayanava* tables |
| `/departments/rayanavabrain` | RayanavabrainDashboard | `/api/rayanava` | rayanava* tables |

### 1.5 Services Routes (`services.routes.ts`)

| Frontend Route | Page Component | API Endpoints | Database Tables |
|----------------|----------------|---------------|-----------------|
| `/services` | Services | `/api/services` | services |
| `/services-hub` | ServicesHub | `/api/services` | services |
| `/services-management` | ServiceManagement | `/api/services` | services, serviceBookings |
| `/service-recommender` | ServiceRecommender | `/api/service-recommendation` | services |
| `/services/:serviceId` | ServicePage | `/api/services/:id` | services, serviceFaqs, serviceTestimonials |

### 1.6 Ecosystem Routes (`ecosystem.routes.ts`)

| Frontend Route | Page Component | API Endpoints | Database Tables |
|----------------|----------------|---------------|-----------------|
| `/ecosystem` | EcosystemControlPanel | `/api/ecosystem` | ecosystemDepartments |
| `/ecosystem-enhanced` | Ecosystem | `/api/ecosystem` | ecosystemDepartments |
| `/developer` | DeveloperPortal | Static content | None |
| `/developer-workspace` | DeveloperWorkspace | `/api/collaboration/workspace` | - |
| `/developer-help` | DeveloperHelp | Static content | None |
| `/developer-department` | DeveloperDepartment | `/api/developer-department` | - |
| `/database-schema` | DatabaseSchemaExplorer | `/api/schema` | - |
| `/api-keys` | APIKeysManagement | `/api/settings/api-keys` | apiKeys |
| `/identity-management` | IdentityManagement | `/api/identity-security` | users |
| `/sdk-libraries` | SDKLibraries | Static content | None |
| `/websocket-guide` | WebSocketGuide | Static content | None |
| `/api-documentation` | APIDocumentation | `/api/docs` | - |
| `/guide-integration` | GuideIntegrationDemo | Static content | None |
| `/dashboard` | MainDashboard | `/api/dashboards/*` | Multiple |
| `/god-layer` | GodLayer | `/api/rayanava` | rayanava* tables |
| `/rayanavabrain-god` | RayanavabrainGodLayer | `/api/rayanava` | rayanava* tables |
| `/achievements` | Achievements | `/api/achievements` | ecosystemAchievements |
| `/visions` | VisionsManagement | `/api/visions` | - |
| `/performance` | PerformanceMonitoring | `/api/performance` | performanceMetrics |
| `/health-recommendations` | HealthRecommendations | `/api/health-recommendations` | - |
| `/reports` | ReportsDashboard | `/api/analytics` | analyticsSummary |
| `/ai-assistant` | AIAssistantDemo | `/api/ai-chat` | - |
| `/google-drive-setup` | GoogleDriveSetup | `/api/drive` | - |
| `/google-drive` | GoogleDrivePage | `/api/drive` | - |
| `/terms` | TermsOfService | Static content | None |
| `/privacy` | PrivacyPolicy | Static content | None |
| `/ai` | AIHub | `/api/rayanava` | rayanava* tables |
| `/ai/rayanava` | Rayanava | `/api/rayanava` | rayanava* tables |
| `/ai/rayanava-enhanced` | RayanavaAI | `/api/rayanava` | rayanava* tables |
| `/ai/analytics` | RayanavaAnalytics | `/api/rayanava/analytics` | rayanavaAnalytics |

---

## 2. Backend API Routes Summary

### 2.1 Public Routes (No Authentication)

| Route File/Registrar | Base Path | Endpoints |
|---------------------|-----------|-----------|
| services.registrar | `/api/services` | GET /api/services, GET /api/services/:id |
| services.registrar | `/api/partners` | GET /api/partners, GET /api/partners/:id |
| services.registrar | `/api/quote` | POST /api/quote |
| contactAgentsRouter | `/api/contact` | POST /api/contact |
| healthRoutes | `/api/health` | GET /api/health |
| guidesRoutes | `/api/guides` | GET /api/guides, GET /api/guides/:id |

### 2.2 Protected Routes (Authentication Required)

| Route File/Registrar | Base Path | Endpoints |
|---------------------|-----------|-----------|
| profileRoutes | `/api/profile` | GET /api/profile, PUT /api/profile |
| dashboardsRoutes | `/api/dashboards` | GET /api/dashboards/* |
| projectsRoutes | `/api/projects` | CRUD /api/projects |
| collaborationRoutes | `/api/collaboration` | CRUD /api/collaboration/* |
| instagramRoutes | `/api/instagram` | CRUD /api/instagram/* |

### 2.3 Admin Routes (Admin Role Required)

| Route File/Registrar | Base Path | Endpoints |
|---------------------|-----------|-----------|
| admin.registrar | `/api/admin/users` | CRUD user management |
| admin.registrar | `/api/admin/security` | Security configuration |
| admin.registrar | `/api/admin/settings` | Application settings |
| admin.registrar | `/api/admin/branding` | Branding configuration |
| admin.registrar | `/api/admin/tracking-providers` | Tracking provider management |
| formSubmissionsRouter | `/api/admin/submissions` | Form submission management |
| emailSettingsRouter | `/api/admin/email` | Email configuration |

---

## 3. Database Tables by Domain

### 3.1 Core Tables
- `users` - User accounts and authentication
- `services` - Service catalog
- `projects` - Project management
- `commodities` - Commodity tracking

### 3.2 Service Tables
- `serviceAvailability` - Service availability by region
- `serviceInquiries` - Service inquiry submissions
- `serviceTestimonials` - Customer testimonials
- `serviceFaqs` - Frequently asked questions
- `serviceBookings` - Service bookings
- `serviceReviews` - Customer reviews
- `servicePricingTiers` - Pricing tiers
- `serviceMetrics` - Service analytics
- `serviceComparisons` - Service comparison tracking

### 3.3 Module/Page Management Tables
- `pageModules` - Page and module registry
- `moduleDependencies` - Module dependency tracking
- `moduleSettings` - Module-specific settings
- `userModuleAccess` - User access to modules
- `moduleActivityLogs` - Module activity tracking

### 3.4 Security & Audit Tables
- `apiKeys` - API key management
- `apiKeyUsage` - API usage tracking
- `rateLimitOverrides` - Rate limit configuration
- `securityAudits` - Security audit logs
- `adminActivityLogs` - Admin activity tracking
- `passwordResetTokens` - Password reset tokens

### 3.5 Investment Tables
- `investmentRounds` - Investment round management
- `investors` - Investor profiles
- `investments` - Investment records
- `investmentTransactions` - Payment transactions
- `userWallets` - Crypto wallet management

### 3.6 Instagram Marketing Tables
- `instagramAccounts` - Connected accounts
- `instagramPosts` - Post management
- `instagramAnalytics` - Analytics data
- `instagramTemplates` - Content templates
- `instagramComments` - Comment management
- `instagramCampaigns` - Campaign tracking
- `instagramStories` - Story management
- `instagramReels` - Reels management
- `instagramInfluencers` - Influencer tracking
- `instagramCompetitors` - Competitor monitoring
- `instagramABTests` - A/B testing
- `instagramShoppingProducts` - Shopping integration

### 3.7 AI/Rayanava Tables
- `rayanavaMemory` - AI memory storage
- `rayanavaConversations` - Conversation history
- `rayanavaAnalytics` - AI usage analytics
- `rayanavaLearning` - Learning data
- `rayanavaWorkflows` - AI workflow definitions
- `rayanavaKnowledgeBase` - Knowledge base entries

### 3.8 Ecosystem Tables
- `ecosystemDepartments` - Department definitions
- `ecosystemSubDepartments` - Sub-departments
- `ecosystemUnits` - Organizational units
- `ecosystemSubUnits` - Sub-units
- `ecosystemDivisions` - Divisions
- `ecosystemModules` - Ecosystem modules
- `ecosystemTeams` - Team management
- `ecosystemHealthMetrics` - Health monitoring
- `ecosystemAlerts` - Alert management
- `ecosystemAiConversations` - AI chat history
- `ecosystemAiMessages` - AI messages
- `ecosystemAchievements` - Achievement definitions
- `ecosystemUserAchievements` - User achievements
- `ecosystemApiKeys` - Ecosystem API keys

### 3.9 MOLOLINK Tables
- `mololinkProfiles` - Professional profiles
- `mololinkCompanies` - Company profiles
- `mololinkCompanyEmployees` - Employee records
- `mololinkPosts` - User posts
- `mololinkCompanyPosts` - Company posts
- `mololinkComments` - Comments
- `mololinkConnections` - Network connections
- `mololinkSkills` - User skills

### 3.10 Marketplace Tables
- `marketplaceListings` - Product listings
- `marketplaceAuctions` - Auction management
- `marketplaceBids` - Bid tracking
- `marketplaceServicePosts` - Service postings

### 3.11 Collaboration Tables
- `collaborationSessions` - Session management
- `collaborationParticipants` - Participant tracking
- `collaborationMessages` - Chat messages

### 3.12 Content & Media Tables
- `mediaFiles` - Uploaded files
- `contentAssets` - Content assets
- `guides` - User guides
- `guideCategories` - Guide categories
- `guideDocuments` - Guide attachments
- `guideSearchIndex` - Search indexing
- `userGuideProgress` - User progress

### 3.13 Configuration Tables
- `adminSettings` - Admin configuration
- `emailSettings` - Email/SMTP settings
- `emailTemplates` - Email templates
- `notificationRecipients` - Notification config
- `trackingProviders` - Carrier configuration

### 3.14 Analytics Tables
- `performanceMetrics` - Performance data
- `healthMetrics` - Health monitoring
- `auditLogs` - General audit logs
- `analyticsSummary` - Analytics summaries

### 3.15 Form/Contact Tables
- `formTypes` - Form type definitions
- `contactSubmissions` - Form submissions

### 3.16 Tracking/Shipment Tables
- `shipments` - Shipment tracking

---

## 4. Frontend Pages Without Backend Calls

These pages use static content or demo data:

1. `/about` - Static About page
2. `/success` - Static success page
3. `/tracking-demo` - Demo tracking data
4. `/collaboration-demo` - Demo collaboration
5. `/authentication-guide` - Static documentation
6. `/terms` - Terms of Service (static)
7. `/privacy` - Privacy Policy (static)
8. `/developer` - Developer portal (static docs)
9. `/developer-help` - Help documentation
10. `/sdk-libraries` - SDK documentation
11. `/websocket-guide` - WebSocket documentation
12. `/guide-integration` - Integration demo
13. Most department dashboards (static frontend components)

---

## 5. Backend Endpoints Not Used by Frontend

These endpoints exist but may not have corresponding frontend consumers:

1. Storage layer methods for services/projects/commodities (CRUD methods in `server/storage.ts`)
2. Some analytics aggregation endpoints
3. Carrier integration routes (`/api/carriers`)
4. Some admin performance optimization endpoints

---

## 6. Proposed Database Schema for Mapping

```sql
CREATE TABLE api_route_mappings (
  id SERIAL PRIMARY KEY,
  frontend_route TEXT NOT NULL,
  page_component TEXT NOT NULL,
  route_category TEXT NOT NULL,
  query_keys JSONB,
  http_methods JSONB,
  api_endpoints JSONB,
  storage_method TEXT,
  database_tables JSONB,
  requires_auth BOOLEAN DEFAULT FALSE,
  requires_admin BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  last_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX api_route_mappings_frontend_idx ON api_route_mappings(frontend_route);
CREATE INDEX api_route_mappings_category_idx ON api_route_mappings(route_category);
CREATE INDEX api_route_mappings_status_idx ON api_route_mappings(status);
```

This table has been added to `shared/schema.ts` as `apiRouteMappings`.

---

## 7. Recommendations

1. **Add API endpoints for static department dashboards** - Consider connecting department dashboards to real data from `ecosystemDepartments` tables

2. **Wire storage layer to routes** - The `server/storage.ts` has CRUD methods for services/projects/commodities that aren't fully wired to routes

3. **Consolidate tracking providers** - Both `/api/carriers` and `/api/admin/tracking-providers` exist; consider consolidation

4. **Enable AI features** - Set `FEATURE_AI_ENABLED=true` to activate Rayanava AI routes

5. **Complete investment module** - Investment routes are enabled but may need database table migrations

---

*This mapping was generated through static analysis of the codebase. For the most accurate results, run the application and trace actual API calls.*
