# MoloChain Application Architecture Documentation

**Version:** 2.0 (Enhanced)
**Last Updated:** December 2025

This document provides a comprehensive technical overview of all frontend pages, URLs, backend routes, data models, middleware, business logic, and integrations for each module in the MoloChain platform.

---

## Table of Contents

1. [Module Status Matrix](#module-status-matrix)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Models](#data-models)
5. [Module Documentation](#module-documentation)
   - [Authentication Module](#1-authentication-module)
   - [Dashboard Module](#2-dashboard-module)
   - [Admin Module](#3-admin-module)
   - [Services Module](#4-services-module)
   - [Blockchain Module](#5-blockchain-module)
   - [Supply Chain Module](#6-supply-chain-module)
   - [Investment Module](#7-investment-module)
   - [Developer Module](#8-developer-module)
   - [AI Module](#9-ai-module)
   - [Departments Module](#10-departments-module)
   - [Projects Module](#11-projects-module)
   - [Partners Module](#12-partners-module)
   - [Guides Module](#13-guides-module)
   - [Transport Modules](#14-transport-modules)
   - [MOLOLINK Module](#15-mololink-module)
   - [General Pages](#16-general-pages)
   - [Profile Module](#17-profile-module)
   - [Marketing Module](#18-marketing-module)
   - [Analytics Module](#19-analytics-module)
   - [Commodities Module](#20-commodities-module)
   - [Tracking Module](#21-tracking-module)
   - [Collaboration Module](#22-collaboration-module)
   - [Notifications Module](#23-notifications-module)
   - [File Management Module](#24-file-management-module)
6. [WebSocket Architecture](#websocket-architecture)
7. [Security Architecture](#security-architecture)
8. [Error Handling](#error-handling)
9. [Caching Strategy](#caching-strategy)
10. [Environment Variables](#environment-variables)

---

## Module Status Matrix

| Module | Status | Data Source | Blockers | Required Work |
|--------|--------|-------------|----------|---------------|
| Authentication | **FULL** | PostgreSQL (users table) | None | - |
| Dashboard | **FULL** | Mixed (DB + static) | None | - |
| Admin | **FULL** | PostgreSQL + Cache | None | - |
| Services | **FULL** | PostgreSQL (services table) | None | - |
| Blockchain | **PARTIAL** | Frontend only | No Web3 backend | Implement smart contract integration |
| Supply Chain | **FULL** | PostgreSQL + WebSocket | None | - |
| Investment | **PARTIAL** | PostgreSQL (disabled) | Missing DB schema tables | Run migrations for investment tables |
| Developer | **FULL** | Static + API docs | None | - |
| AI (Rayanava) | **PARTIAL** | PostgreSQL + OpenAI | `FEATURE_AI_ENABLED=false` | Enable AI flag, configure OpenAI key |
| Departments | **FULL** | PostgreSQL | None | - |
| Projects | **FULL** | PostgreSQL + WebSocket | None | - |
| Partners | **FULL** | Static data in partners-data.ts | None | Consider DB migration |
| Guides | **FULL** | PostgreSQL | None | - |
| Transport | **FULL** | Frontend components | None | - |
| MOLOLINK | **PARTIAL** | WebSocket + API | Protocol incomplete | Implement full MOLOLINK protocol |
| General Pages | **FULL** | Mixed | None | - |
| Profile | **FULL** | PostgreSQL | None | - |
| Marketing/Instagram | **PARTIAL** | PostgreSQL | Missing Instagram API credentials | Configure Meta Graph API |
| Analytics | **FULL** | PostgreSQL + API | None | - |
| Commodities | **FULL** | PostgreSQL | None | - |
| Tracking | **FULL** | PostgreSQL + WebSocket | None | - |
| Collaboration | **FULL** | PostgreSQL + WebSocket | None | - |
| Notifications | **FULL** | PostgreSQL + WebSocket | None | - |
| File Management | **FULL** | PostgreSQL + Cloud Storage | None | - |

### Status Legend
- **FULL**: Complete implementation with DB persistence, API routes, and UI
- **PARTIAL**: Framework exists but missing backend integration, API keys, or DB tables
- **STUBBED**: Frontend complete, backend returns mock/static data

---

## Frontend Architecture

### Provider Tree Hierarchy

```
<ErrorBoundary>
  └── <QueryClientProvider>
      └── <ThemeProvider>
          └── <AuthProvider>
              └── <WalletProvider>
                  └── <WebSocketProvider>
                      └── <NotificationProvider>
                          └── <Router />
                          └── <Toaster />
                          └── <WebSocketFloatingIndicator />
```

### State Management

| Layer | Technology | Purpose |
|-------|------------|---------|
| Server State | TanStack Query v5 | API data fetching, caching, mutations |
| Auth State | React Context (`AuthProvider`) | User authentication status |
| WebSocket State | React Context (`WebSocketProvider`) | Real-time connection management |
| Theme State | React Context (`ThemeProvider`) | Dark/light mode |
| Notifications | React Context (`NotificationProvider`) | Toast notifications |
| Form State | react-hook-form + Zod | Form validation and submission |
| Wallet State | React Context (`WalletProvider`) | Web3 wallet connections |

### TanStack Query Configuration

**File:** `client/src/lib/queryClient.ts`

```typescript
// Default query configuration
{
  staleTime: 5 * 60 * 1000,        // 5 minutes
  refetchOnWindowFocus: false,
  refetchInterval: false,
  retry: (failureCount, error) => {
    if (error?.message?.includes('401')) return false;
    return failureCount < 2;
  },
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

**Query Pattern:**
```typescript
// Standard query (uses default queryFn)
const { data } = useQuery({
  queryKey: ['/api/endpoint', id],  // Hierarchical keys for cache invalidation
});

// Mutation with cache invalidation
const mutation = useMutation({
  mutationFn: (data) => apiRequest('POST', '/api/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/endpoint'] });
  }
});
```

### React Contexts

| Context | File | Purpose | Key Methods |
|---------|------|---------|-------------|
| `WebSocketContext` | `contexts/WebSocketContext.tsx` | Real-time connection | `sendMessage()`, `subscribe()`, `reconnect()` |
| `NotificationContext` | `contexts/NotificationContext.tsx` | Notification management | `addNotification()`, `removeNotification()` |
| `ProjectUpdateContext` | `contexts/ProjectUpdateContext.tsx` | Project real-time updates | `subscribeToProject()` |
| `CollaborationContext` | `contexts/CollaborationContext.tsx` | Collaborative editing | `joinSession()`, `syncChanges()` |

### Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `hooks/use-auth.tsx` | Authentication state and actions |
| `useUser` | `hooks/use-user.ts` | Current user data |
| `useWebSocket` | `hooks/use-websocket.tsx` | WebSocket connection |
| `useToast` | `hooks/use-toast.ts` | Toast notifications |
| `useTheme` | `hooks/use-theme.tsx` | Theme toggle |
| `useDashboard` | `hooks/use-dashboard.ts` | Dashboard data |
| `useCollaboration` | `hooks/use-collaboration.ts` | Collaboration features |
| `useHealthMonitoring` | `hooks/useHealthMonitoring.tsx` | System health data |

### Component Structure

```
client/src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── admin/                 # Admin-specific components
│   │   └── AdminLayout.tsx    # Admin navigation wrapper
│   ├── dashboard/             # Dashboard widgets
│   │   └── DashboardManager.tsx  # Role-based dashboard routing
│   ├── services/              # Service-related components
│   ├── tracking/              # Shipment tracking components
│   ├── ai/                    # AI assistant components
│   ├── collaboration/         # Real-time collaboration
│   ├── analytics/             # Analytics components
│   ├── commodities/           # Commodity components
│   ├── notifications/         # Notification components
│   ├── file-management/       # File management components
│   ├── Layout.tsx             # Main app layout
│   ├── Navigation.tsx         # Top navigation
│   └── ErrorBoundary.tsx      # Error boundary wrapper
├── pages/                     # Route pages (organized by module)
├── contexts/                  # React contexts
├── hooks/                     # Custom hooks
├── lib/                       # Utilities
│   ├── queryClient.ts         # TanStack Query setup
│   ├── realWebSocket.ts       # WebSocket client
│   └── errorHandler.ts        # Error handling utilities
└── services/                  # API service layers
```

---

## Backend Architecture

### Middleware Stack

Requests flow through middleware in this order (from `server/index.ts`):

```
Request →
  1. Helmet (security headers, CSP in production)
  2. Compression (gzip, threshold: 1KB, level: 6)
  3. Body Parser (express.json, express.urlencoded)
  4. Morgan (request logging)
  5. CORS (credentials: true, configurable origins)
  6. Rate Limiter (apiRateLimiter on /api/ routes)
  7. Cookie Parser
  8. Performance Middleware (request timing)
  9. Auto Cache Middleware (cacheInterceptor)
  10. Auth Setup (Passport.js, session management)
  11. Password Reset Setup
  12. CSRF Protection (POST/PUT/DELETE/PATCH on /api/*)
  13. Request Logging (with sensitive data filtering)
  14. Route Handler
→ Response
```

### Route Registrars

Routes are organized using domain registrars for better maintainability:

**File:** `server/registrars/`

| Registrar | File | Domains |
|-----------|------|---------|
| registerServiceRoutes | services.registrar.ts | Services, Partners, Quote, Regions, Tracking, Product Types |
| registerAdminRoutes | admin.registrar.ts | Users, Security, Memory, Settings, Branding, Media |
| registerCollaborationRoutes | collaboration.registrar.ts | Collaboration, Developer Workspace, Documents |

### Middleware Files

| File | Purpose | Key Functions |
|------|---------|---------------|
| `middleware/auth.ts` | Authentication | `requireAuth`, `requireAdmin`, `requireRole` |
| `middleware/validate.ts` | Request validation | `validateRequest({ body, query, params })` |
| `middleware/cache.ts` | Response caching | `cacheMiddleware`, `invalidateCacheMiddleware` |
| `middleware/advanced-security.ts` | Security measures | `createAdvancedCSP`, `createDynamicRateLimit` |
| `middleware/csrf.ts` | CSRF protection | CSRF token validation |
| `middleware/api-key-auth.ts` | API key auth | `apiKeyAuth({ scope: [...] })` |
| `middleware/enhanced-rate-limiter.ts` | Rate limiting | Per-route rate limits |

### Authentication Middleware

**File:** `server/middleware/auth.ts`

```typescript
// Check multiple auth sources
const token = req.headers.authorization?.replace('Bearer ', '') ||
              req.session?.token ||
              req.cookies?.token;

// JWT verification with fallback to session
if (token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = { id: decoded.userId };
}
```

**Available Auth Middleware:**
- `requireAuth` / `isAuthenticated` - Require any authenticated user
- `requireAdmin` / `isAdmin` - Require admin role
- `requireRole(['admin', 'moderator'])` - Require specific roles
- `requireOwnerOrAdmin('userId')` - Owner or admin access

### Validation Middleware

**File:** `server/middleware/validate.ts`

```typescript
// Usage in routes
app.post('/api/quote',
  validateRequest({ body: quoteSchema }),
  async (req, res) => { ... }
);

// Error response format
{
  "error": "Validation error",
  "message": "Invalid request data",
  "errors": [
    { "path": "email", "message": "Invalid email address" }
  ]
}
```

### File Upload Limits

**File:** `server/routes.ts`

| Upload Type | Max Size | Allowed Formats | Endpoint |
|-------------|----------|-----------------|----------|
| Images | 5 MB | JPEG, PNG, GIF, WebP | `/api/admin/content/media` |
| Projects | 50 MB | ZIP archives only | `/api/projects/upload` |
| Documents | 10 MB | PDF, DOCX, XLSX, PPTX | `/api/drive/upload` |

### Cache Middleware

**File:** `server/middleware/cache.ts`

```typescript
// Configuration options
interface CacheOptions {
  ttl?: number;           // Time to live in seconds
  type: CacheType;        // 'service' | 'tracking' | 'commodity' | 'region' | 'api'
  keyParam?: string;      // Request param to use as cache key
  keyFn?: (req) => string; // Custom key generator
  condition?: (req) => boolean; // Conditional caching
}

// Cache TTL constants
const CACHE_TTL = {
  SHORT: 60,          // 1 minute (tracking)
  MEDIUM: 5 * 60,     // 5 minutes (services)
  LONG: 30 * 60,      // 30 minutes (commodities)
  VERY_LONG: 24 * 60 * 60  // 1 day (regions)
};
```

---

## Data Models

**90+ PostgreSQL Tables** defined in `shared/schema.ts`:

| Category | Tables |
|----------|--------|
| **Core** | `users`, `projects`, `commodities`, `departments`, `analytics`, `regions`, `notifications` |
| **Services** | `services`, `serviceAvailability`, `serviceInquiries`, `serviceTestimonials`, `serviceFaqs`, `serviceBookings`, `serviceReviews`, `servicePricingTiers`, `serviceMetrics`, `serviceComparisons` |
| **Page/Module Mgmt** | `pageModules`, `moduleDependencies`, `moduleSettings`, `userModuleAccess`, `moduleActivityLogs` |
| **Security/API** | `apiKeys`, `apiKeyUsage`, `rateLimitOverrides`, `securityAudits`, `performanceMetrics`, `auditLogs`, `healthMetrics` |
| **Investment** | `investmentRounds`, `investors`, `investments`, `investmentTransactions`, `userWallets` |
| **Instagram/Marketing** | `instagramAccounts`, `instagramPosts`, `instagramAnalytics`, `instagramTemplates`, `instagramComments`, `instagramCampaigns`, `instagramStories`, `instagramReels`, `instagramInfluencers`, `instagramCompetitors`, `instagramABTests`, `instagramShoppingProducts` |
| **AI/Rayanava** | `rayanavaMemory`, `rayanavaConversations`, `rayanavaAnalytics`, `rayanavaLearning`, `rayanavaWorkflows`, `rayanavaKnowledgeBase` |
| **Collaboration** | `collaborationSessions`, `documentEdits`, `comments` |
| **File Management** | `files`, `folders`, `storageProviders` |
| **Tracking** | `shipments`, `trackingEvents`, `trackingProviders` |
| **Notifications** | `notificationTemplates`, `userNotifications`, `broadcastMessages` |

### Core Tables (PostgreSQL)

#### Users Table
```typescript
users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),  // bcrypt hashed
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  company: varchar("company", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).default("user"),  // 'admin' | 'user' | 'client'
  permissions: json("permissions").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  recoveryCodes: json("recovery_codes").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

#### Services Table
```typescript
services = pgTable("services", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon"),
  imageUrl: text("image_url"),
  features: jsonb("features").$type<string[]>(),
  benefits: jsonb("benefits").$type<string[]>(),
  pricing: text("pricing"),
  deliveryTime: text("delivery_time"),
  coverage: text("coverage"),
  tags: jsonb("tags").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  popularity: integer("popularity").default(0)
});
// Indexes: category, isActive
```

#### Projects Table
```typescript
projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("active"),  // 'active' | 'completed' | 'on-hold'
  clientId: integer("client_id").references(() => users.id),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  deadline: timestamp("deadline"),
  teamMembers: jsonb("team_members").$type<number[]>(),
  servicesUsed: jsonb("services_used").$type<string[]>()
});
```

#### Commodities Table
```typescript
commodities = pgTable("commodities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  unit: text("unit"),
  origin: text("origin"),
  specifications: jsonb("specifications"),
  availability: text("availability"),
  minOrder: decimal("min_order", { precision: 10, scale: 2 })
});
```

#### Analytics Table
```typescript
analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  data: jsonb("data")
});
```

#### Tracking Table
```typescript
tracking = pgTable("tracking", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number", { length: 100 }).unique().notNull(),
  carrier: varchar("carrier", { length: 100 }),
  service: varchar("service", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull(),
  originAddress: text("origin_address"),
  destinationAddress: text("destination_address"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

#### Files Table
```typescript
files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  folderId: integer("folder_id").references((): any => folders.id), // Self-referencing for folders
  userId: integer("user_id").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  storageProviderId: integer("storage_provider_id").references((): any => storageProviders.id)
});

folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentFolderId: integer("parent_folder_id").references((): any => folders.id), // Self-referencing for nested folders
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

storageProviders = pgTable("storage_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., 'S3', 'GoogleCloudStorage', 'Local'
  config: jsonb("config") // Specific configuration for each provider
});
```

### Security & API Tables

#### API Keys Table
```typescript
apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 64 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id),
  scopes: text("scopes").array(),  // ['read', 'write', 'admin']
  rateLimit: integer("rate_limit").default(1000),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true)
});
```

#### Security Audits Table
```typescript
securityAudits = pgTable("security_audits", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  requestPath: varchar("request_path", { length: 500 }),
  requestMethod: varchar("request_method", { length: 10 }),
  statusCode: integer("status_code"),
  details: text("details"),
  severity: varchar("severity", { length: 20 }).default('low')
});
```

### Investment Tables (PARTIAL - requires migration)

```typescript
investmentRounds = pgTable("investment_rounds", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount").notNull(),
  minimumInvestment: decimal("minimum_investment").notNull(),
  currentAmount: decimal("current_amount").default("0"),
  tokenPrice: decimal("token_price"),
  status: text("status").default("upcoming"),  // 'upcoming' | 'active' | 'closed'
  roundType: text("round_type").default("seed")  // 'pre-seed' | 'seed' | 'series-a'
});

investors = pgTable("investors", {
  id: varchar("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  kycStatus: text("kyc_status").default("pending"),
  totalInvested: decimal("total_invested").default("0"),
  walletAddresses: jsonb("wallet_addresses").$type<{address: string, chain: string}[]>()
});
```

### AI/Rayanava Tables

```typescript
rayanavaMemory = pgTable('rayanava_memory', {
  id: serial('id').primaryKey(),
  conversationId: text('conversation_id'),
  content: jsonb('content'),
  memoryType: text('memory_type'),  // 'short_term' | 'long_term' | 'episodic'
  importance: real('importance'),
  embedding: jsonb('embedding')
});

rayanavaConversations = pgTable('rayanava_conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  startedAt: timestamp('started_at'),
  context: jsonb('context'),
  status: text('status')  // 'active' | 'completed' | 'archived'
});
```

### Validation Schemas (Zod)

**File:** `server/validation/auth.schemas.ts`

```typescript
// Login validation
loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});

// Registration validation
registrationSchema = z.object({
  username: z.string()
    .min(3).max(50)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string()
    .min(8).max(100)
    .refine(val => /[A-Z]/.test(val))   // Uppercase
    .refine(val => /[a-z]/.test(val))   // Lowercase
    .refine(val => /[0-9]/.test(val))   // Number
    .refine(val => /[!@#$%^&*]/.test(val)), // Special char
  email: z.string().email().toLowerCase().trim(),
  fullName: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).optional(),
  role: z.enum(["admin", "user", "client"]).default("user")
});

// Profile update validation
profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.string().min(2).max(10).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional()
    }).optional()
  }).optional()
});
```

---

## Module Documentation

### 1. Authentication Module

#### Status: **FULL**

#### Data Model
- **Table:** `users`
- **Related Tables:** `apiKeys`, `securityAudits`

#### Business Logic Flow

```
Login Flow:
1. Client submits username/password
2. Validate with loginSchema (Zod)
3. Find user by username
4. Compare password with bcrypt
5. Check if user is active
6. If 2FA enabled → return partial session, require 2FA code
7. Create session with Passport.js
8. Return user data + session cookie

Registration Flow:
1. Validate with registrationSchema
2. Check username/email uniqueness
3. Hash password with bcrypt (12 rounds)
4. Create user record
5. Create initial session
6. Send welcome email (if configured)

2FA Flow:
1. User enables 2FA via /api/auth/2fa/enable
2. Generate TOTP secret with otplib
3. Return QR code for authenticator app
4. User submits verification code
5. If valid, store secret and enable 2FA
6. Generate recovery codes
```

#### Routes

| Method | Endpoint | Middleware | Handler | Description |
|--------|----------|------------|---------|-------------|
| POST | `/api/auth/login` | `validateRequest({ body: loginSchema })` | Passport local strategy | User login |
| POST | `/api/auth/register` | `validateRequest({ body: registrationSchema })` | `auth.service.ts` | User registration |
| POST | `/api/auth/logout` | `isAuthenticated` | Session destroy | User logout |
| GET | `/api/auth/me` | `isAuthenticated` | Return `req.user` | Get current user |
| POST | `/api/auth/2fa/enable` | `isAuthenticated` | `two-factor.service.ts` | Enable 2FA |
| POST | `/api/auth/2fa/verify` | Session required | TOTP verify | Verify 2FA code |
| POST | `/api/auth/2fa/disable` | `isAuthenticated` | Remove 2FA | Disable 2FA |
| POST | `/api/auth/request-reset` | `validateRequest` | `password-reset.service.ts` | Request password reset |
| POST | `/api/auth/reset-password` | Token validation | Update password | Reset password |

#### Frontend Pages

| Page | URL | Component | Protection |
|------|-----|-----------|------------|
| Login | `/login`, `/auth/login` | `Login.tsx` | Public |
| Register | `/register`, `/auth/register` | `Register.tsx` | Public |
| Request Reset | `/request-password-reset` | `RequestPasswordReset.tsx` | Public |
| Reset Password | `/reset-password` | `ResetPassword.tsx` | Token required |

#### Error Responses

```typescript
// 401 Unauthorized
{ error: 'Authentication required', code: 'NO_AUTH_TOKEN' }
{ error: 'Authentication failed', code: 'INVALID_CREDENTIALS' }

// 400 Bad Request (validation)
{ error: 'Validation error', message: 'Invalid request data', errors: [...] }

// 403 Forbidden
{ error: 'Forbidden' }  // Wrong role
{ error: 'Account is disabled' }  // Inactive user
```

#### Backend Files
- `server/core/auth/auth.service.ts` - Core auth logic, Passport setup
- `server/core/auth/password-reset.service.ts` - Password reset
- `server/core/auth/two-factor.service.ts` - 2FA implementation
- `server/api/auth/auth.routes.ts` - Auth route handlers
- `server/api/auth/two-factor-auth.ts` - 2FA endpoints
- `server/validation/auth.schemas.ts` - Validation schemas

---

### 2. Dashboard Module

#### Status: **FULL**

#### Data Flow

```
Dashboard Loading:
1. DashboardManager checks user role
2. Route to appropriate dashboard component
3. Parallel API calls for:
   - /api/dashboards/:role (role-specific data)
   - /api/analytics/* (analytics widgets)
   - /api/performance/metrics (performance data)
4. WebSocket subscription for real-time updates
5. Render widgets with loading states
```

#### Routes

| Method | Endpoint | Cache TTL | Description |
|--------|----------|-----------|-------------|
| GET | `/api/dashboards/:role` | 5 min | Role-specific dashboard data |
| GET | `/api/performance/metrics?range=5m` | None | Real-time performance |
| GET | `/api/performance/historical?hours=24` | 5 min | Historical metrics |
| GET | `/api/analytics/*` | 5 min | Various analytics |

#### Frontend Pages

| Page | URL | Component | Protection |
|------|-----|-----------|------------|
| Main Dashboard | `/dashboard` | `DashboardManager` | Auth required |
| Role Dashboard | `/dashboard/:role/*?` | `DashboardManager` | Auth required |
| Tracking | `/tracking` | `TrackingDashboard` | Public |
| Performance | `/performance` | `PerformanceDashboard` | Admin only |
| Advanced Analytics | `/advanced-analytics` | `AdvancedAnalytics` | Auth required |
| Portfolio | `/portfolio` | `PortfolioDashboard` | Auth required |
| Staking | `/staking` | `StakingDashboard` | Auth required |
| Reports | `/reports` | `ReportsDashboard` | Auth required |

#### Dashboard Role Routing

```typescript
// DashboardManager.tsx logic
switch (user.role) {
  case 'admin': → AdminDashboard
  case 'developer': → DeveloperDashboard
  case 'analyst': → AnalystDashboard
  case 'manager': → ManagerDashboard
  case 'moderator': → ModeratorDashboard
  default: → UserDashboard
}
```

---

### 3. Admin Module

#### Status: **FULL**

#### Routes

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/admin/stats` | `isAuthenticated`, `isAdmin` | System statistics |
| GET | `/api/admin/health` | `isAuthenticated`, `isAdmin` | System health |
| GET | `/api/admin/logs` | `isAuthenticated`, `isAdmin` | System logs |
| GET | `/api/admin/cache/stats` | `isAuthenticated`, `isAdmin` | Cache statistics |
| POST | `/api/admin/cache/clear` | `isAuthenticated`, `isAdmin` | Clear cache |
| GET | `/api/admin/websocket-health` | `isAuthenticated`, `isAdmin` | WebSocket health |
| GET | `/api/admin/users` | `isAuthenticated`, `isAdmin` | List users |
| POST | `/api/admin/users` | `isAuthenticated`, `isAdmin` | Create user |
| PUT | `/api/admin/users/:id` | `isAuthenticated`, `isAdmin` | Update user |
| DELETE | `/api/admin/users/:id` | `isAuthenticated`, `isAdmin` | Delete user |
| GET | `/api/admin/security/*` | `isAuthenticated`, `isAdmin` | Security management |
| GET | `/api/admin/branding` | `isAuthenticated`, `isAdmin` | Get branding |
| PUT | `/api/admin/branding` | `isAuthenticated`, `isAdmin` | Update branding |
| GET | `/api/admin/settings` | `isAuthenticated`, `isAdmin` | Get settings |
| PUT | `/api/admin/settings` | `isAuthenticated`, `isAdmin` | Update settings |
| GET | `/api/admin/tracking-providers` | `isAuthenticated`, `isAdmin` | Get providers |
| POST | `/api/admin/tracking-providers` | `isAuthenticated`, `isAdmin` | Add provider |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Admin Dashboard | `/admin/dashboard` | Overview with stats |
| User Management | `/admin/users` | CRUD for users |
| Content Manager | `/admin/content` | CMS interface |
| Activity Logs | `/admin/activity` | System activity |
| WebSocket Health | `/admin/websocket` | WS monitoring |
| Admin Settings | `/admin/settings` | System config |
| Security Settings | `/admin/security` | Security policies |
| Identity Security | `/admin/identity-security` | IAM dashboard |
| Health Monitoring | `/admin/health-monitoring` | Health dashboard |
| Cache Management | `/admin/cache` | Cache control |
| Tracking Providers | `/admin/tracking-providers` | Provider config |
| Page Modules | `/admin/page-modules` | Module management |
| Performance Monitor | `/admin/performance` | Performance metrics |
| Master Control | `/master-control` | Central control |
| Modular Control | `/admin/modular` | Modular config |
| System Dashboard | `/admin/system-dashboard` | System status |
| API Keys | `/admin/api-keys` | API key management |
| Reports | `/admin/reports` | Admin reports |
| Operations | `/admin/operations` | Operations control |
| Integration | `/admin/integration` | Integration management |
| Analytics | `/admin/analytics` | Analytics dashboard |
| Configuration | `/admin/configuration` | System configuration |
| Core System Control | `/admin/core-system-control` | Core system settings |
| Departments | `/admin/departments` | Departments management |
| Transport | `/admin/transport` | Transport configuration |
| MOLOLINK Admin | `/admin/mololink` | MOLOLINK management |
| Rayanava Admin | `/admin/rayanavabrain` | AI system admin |
| Tracking Admin | `/admin/tracking` | Tracking configuration |
| Services Admin | `/admin/services` | Services management |
| Missions | `/admin/missions` | Missions management |
| Visions Admin | `/admin/visions` | Visions management |
| Achievements Admin | `/admin/achievements` | Achievements admin |
| Health Recommendations | `/admin/health-recommendations` | AI health config |
| Database Admin | `/admin/database` | Database management |
| File Management Admin | `/admin/files` | File management |
| Notification Admin | `/admin/notifications` | Notification management |

#### Admin Stats Response

```typescript
{
  totalUsers: number,
  activeShipments: number,
  ongoingProjects: number,
  systemUptime: number,  // seconds
  averageResponseTime: string,
  databaseConnections: 'healthy' | 'degraded' | 'error',
  cacheStats: {
    hits: number,
    misses: number,
    hitRate: number,
    size: number
  },
  timestamp: string
}
```

---

### 4. Services Module

#### Status: **FULL**

#### Data Model
- **Table:** `services`
- **Related:** `serviceAvailability`, `serviceInquiries`, `serviceTestimonials`, `serviceFaqs`, `serviceBookings`, `serviceReviews`, `servicePricingTiers`, `serviceMetrics`

#### Routes

| Method | Endpoint | Cache | Description |
|--------|----------|-------|-------------|
| GET | `/api/services` | 5 min | List all services |
| GET | `/api/services/:id` | 5 min | Get service by ID |
| GET | `/api/services/:id/availability/:regionCode` | 1 min | Check availability |
| GET | `/api/logistics-services` | 5 min | Paginated services |
| POST | `/api/service-recommendations` | None | AI recommendations |
| GET | `/api/regions` | 24 hours | Available regions |
| GET | `/api/product-types` | 30 min | Product categories |

#### Service Categories

```
- Container Shipping
- Trucking / Road Transport
- Air Freight
- Rail Freight
- Transit Services
- Warehousing
- Customs Clearance
- Finance Services
- Blockchain Services
- Consultation
- Documentation
- Port Services
- Special Transport
```

#### Frontend Pages

35+ service-specific pages at `/services/:serviceType`:
- `/services/container`, `/services/trucking`, `/services/airfreight`, etc.
- Dynamic lazy loading based on service type
- `ServiceRecommender` at `/services/recommender`
- `ServicesHub` at `/services-hub`

---

### 5. Blockchain Module

#### Status: **PARTIAL**

#### Implementation Details

**What's Implemented:**
- Frontend UI for all blockchain features
- WalletConnect integration for wallet connections
- ethers.js for blockchain interactions
- React Context for wallet state

**What's Missing:**
- Backend Web3 provider integration
- Smart contract deployment/interaction backend
- Transaction processing API
- Token management backend

#### Frontend Pages

| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Blockchain Explorer | `/blockchain` | UI only | No backend data |
| Smart Contracts | `/smart-contracts` | UI only | Web3 frontend only |
| Smart Contracts Manager | `/smart-contracts-manager` | UI only | Contract CRUD UI |
| Governance | `/governance` | UI only | Voting UI, no DAO |
| Token Economics | `/token-economics` | UI only | Static tokenomics |
| Token Swap | `/token-swap` | UI only | DEX integration needed |
| Token Bridge | `/token-bridge` | UI only | Cross-chain UI |
| Token Burn | `/token-burn` | UI only | Burn mechanism UI |
| Token Launchpad | `/token-launchpad` | UI only | Launch UI |
| DeFi Integration | `/defi` | UI only | DeFi protocols |
| NFT Marketplace | `/nft-marketplace` | UI only | NFT trading UI |
| Cross-Chain Analytics | `/cross-chain-analytics` | UI only | Multi-chain UI |
| Wallet Integration | `/wallet-integration` | Partial | WalletConnect works |
| Liquidity Mining | `/liquidity-mining` | UI only | LP rewards UI |
| Yield Aggregator | `/yield-aggregator` | UI only | Yield optimization |
| DAO Treasury | `/dao-treasury` | UI only | Treasury management |
| Prediction Market | `/prediction-market` | UI only | Predictions UI |
| Insurance Protocol | `/insurance-protocol` | UI only | DeFi insurance |
| Perpetual Futures | `/perpetual-futures` | UI only | Derivatives UI |
| Lending Protocol | `/lending-protocol` | UI only | Lending UI |
| RWA Tokenization | `/rwa-tokenization` | UI only | Real-world assets |
| Smart Contract Payments | `/smart-contract-payments` | UI only | Payment automation |
| Blockchain Analytics | `/blockchain-analytics` | UI only | Analytics dashboard |

#### Required Implementation

```typescript
// Needed backend endpoints:
POST /api/blockchain/connect-wallet
POST /api/blockchain/sign-transaction
POST /api/blockchain/deploy-contract
GET  /api/blockchain/contract/:address
POST /api/blockchain/swap
POST /api/blockchain/stake
GET  /api/blockchain/portfolio/:address
```

---

### 6. Supply Chain Module

#### Status: **FULL**

#### Data Model
- **Table:** `commodities`
- **WebSocket:** Real-time tracking updates

#### Routes

| Method | Endpoint | Cache | Description |
|--------|----------|-------|-------------|
| GET | `/api/tracking/:trackingNumber` | 1 min | Track shipment |
| POST | `/api/tracking/bulk` | None | Bulk tracking |
| POST | `/api/tracking/subscribe` | None | Subscribe to updates |
| GET | `/api/commodities` | 30 min | List commodities |
| GET | `/api/commodities/:id` | 30 min | Commodity details |
| GET | `/api/commodities/:id/pricing` | 5 min | Pricing history |
| GET | `/api/supply-chain/heatmap` | 5 min | Heatmap data |
| GET | `/api/supply-chain/risk` | 5 min | Risk assessment |
| GET | `/api/supply-chain/fleet` | 5 min | Fleet status |
| GET | `/api/supply-chain/routes` | 5 min | Route optimization |

#### Tracking Response

```typescript
{
  trackingNumber: string,
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED',
  origin: string,
  destination: string,
  estimatedDelivery: string,  // ISO date
  lastUpdated: string,
  events: Array<{
    timestamp: string,
    location: string,
    status: string,
    description: string
  }>
}
```

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Supply Chain Analytics | `/supply-chain-analytics` | Analytics dashboard |
| Shipment Tracking | `/shipment-tracking` | Real-time tracking |
| Tracking Demo | `/tracking/demo` | Demo tracking |
| Route Optimization | `/route-optimization` | Route planning |
| Fleet Management | `/fleet-management` | Fleet operations |
| Predictive Maintenance | `/predictive-maintenance` | Maintenance predictions |
| Supply Chain Risk | `/supply-chain-risk` | Risk assessment |
| Supply Chain Heatmap | `/supply-chain-heatmap` | Geographic view |
| Warehouse Management | `/supply-chain/warehouse` | Warehouse ops |
| Commodities | `/commodities` | Commodity listing |
| Commodity Detail | `/commodities/:type` | Commodity details |

---

### 7. Investment Module

#### Status: **PARTIAL**

#### Blockers
- Database tables not migrated (`investmentRounds`, `investors`, `investments`, `investmentTransactions`, `userWallets`)
- Routes partially disabled in `server/routes.ts`

#### Routes (When Enabled)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investment/rounds` | List investment rounds |
| GET | `/api/investment/rounds/:id` | Round details |
| GET | `/api/investment/investor` | Investor profile |
| POST | `/api/investment/kyc` | Submit KYC |
| POST | `/api/investment/stripe/create-intent` | Payment intent |
| POST | `/api/investment/stripe/confirm` | Confirm payment |
| POST | `/api/investment/wallet/connect` | Connect wallet |
| POST | `/api/investment/crypto/create` | Crypto investment |
| GET | `/api/investment/my-investments` | User investments |

#### Required Migration

```sql
-- Run drizzle migration to create:
CREATE TABLE investment_rounds (...);
CREATE TABLE investors (...);
CREATE TABLE investments (...);
CREATE TABLE investment_transactions (...);
CREATE TABLE user_wallets (...);
```

---

### 8. Developer Module

#### Status: **FULL**

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/developer/*` | Developer resources |
| GET | `/api/collaboration/workspace/*` | Workspace collaboration |
| GET | `/api-docs/spec` | OpenAPI specification |
| GET | `/api-docs` | Swagger UI |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Developer Department | `/developer-department` | Developer hub |
| Developer Portal | `/developer` | Resources portal |
| Developer Workspace | `/developer/workspace` | Collaborative workspace |
| Developer Tools | `/tools` | Dev tools |
| WebSocket Guide | `/developer/websockets` | WS documentation |
| Authentication Guide | `/developer/auth` | Auth documentation |
| SDK Libraries | `/developer/sdks` | SDK docs |
| API Policies | `/developer/policies` | Usage policies |
| Developer Help | `/developer/help` | Help resources |
| Database Schema | `/database/schema` | Schema explorer |

---

### 9. AI Module (Rayanava)

#### Status: **PARTIAL**

#### Feature Toggle
```bash
FEATURE_AI_ENABLED=true  # Required to enable AI routes
```

#### Data Model
- **Tables:** `rayanavaMemory`, `rayanavaConversations`, `rayanavaAnalytics`, `rayanavaLearning`, `rayanavaWorkflows`, `rayanavaKnowledgeBase`

#### Routes (When Enabled)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rayanava/chat` | Chat with AI |
| POST | `/api/rayanava/analyze` | Analyze data |
| GET | `/api/rayanava/analytics` | AI usage analytics |
| GET | `/api/rayanava/conversations` | Conversation history |
| POST | `/api/health-recommendations` | Health recommendations |

#### When Disabled

```typescript
// Returns 503 for all AI endpoints
{
  message: "AI services are currently disabled. Set FEATURE_AI_ENABLED=true to enable."
}
```

#### Frontend Pages

| Page | URL | Status |
|------|-----|--------|
| AI Hub | `/ai` | UI ready |
| Rayanava AI | `/ai/rayanava` | UI ready |
| Rayanava Enhanced | `/ai/rayanava-enhanced` | UI ready |
| Rayanava Analytics | `/ai/analytics` | UI ready |
| AI Assistant Demo | `/ai-assistant` | UI ready |
| Rayanavabrain God Layer | `/rayanavabrain-god-layer` | UI ready |

---

### 10. Departments Module

#### Status: **FULL**

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | List departments |
| GET | `/api/departments/:id` | Department details |
| GET | `/api/departments/:id/users` | Department users |
| GET | `/api/ecosystem/departments` | Ecosystem departments |
| GET | `/api/ecosystem/divisions` | Department divisions |
| GET | `/api/ecosystem/teams` | Department teams |
| GET | `/api/ecosystem/modules` | Available modules |
| GET | `/api/ecosystem/status` | Ecosystem status |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Department Navigator | `/department-navigator` | Overview |
| Accounting | `/departments/accounting` | Accounting dashboard |
| HR | `/departments/hr` | Human resources |
| Operations | `/departments/operations` | Operations |
| Supply Chain | `/departments/supply-chain` | Supply chain dept |
| Management | `/departments/management` | Management |
| Technology | `/departments/technology` | Tech/engineering |
| Marketing | `/departments/marketing` | Marketing |
| Legal | `/departments/legal` | Legal/risk |
| Rayanavabrain | `/departments/rayanavabrain` | AI department |

---

### 11. Projects Module

#### Status: **FULL**

#### Data Model
- **Table:** `projects`
- **WebSocket:** Real-time collaboration

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| GET | `/api/projects/examples` | Example projects |
| GET | `/api/projects/:id` | Project details |
| GET | `/api/projects/:id/updates` | Project updates |
| POST | `/api/projects/:id/milestones` | Add milestone |
| POST | `/api/projects/upload` | Upload project |
| GET | `/api/collaboration/*` | Collaboration endpoints |
| GET | `/api/collaborative-documents/*` | Document operations |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Projects | `/projects` | Project listing |
| Project Detail | `/projects/:id` | Project details |
| Latest Projects | `/latest-projects` | Recent projects |
| Collaboration | `/projects/:projectId/collaboration` | Real-time collab |
| Collaboration Demo | `/collaboration/demo` | Demo |
| Collaborative Docs | `/collaborative-documents` | Shared docs |

---

### 12. Partners Module

#### Status: **FULL** (Static Data)

#### Data Source
Partner data is stored in `server/data/partners-data.ts`.

#### Routes

| Method | Endpoint | Cache | Description |
|--------|----------|-------|-------------|
| GET | `/api/partners` | None | List all partners |
| GET | `/api/partners/:id` | None | Partner details |
| GET | `/api/partners/:id/related` | None | Related partners |

#### Partner Data Structure

```typescript
{
  id: number,
  name: string,
  logo: string,
  country: string,
  tags: string[],
  description: string,
  contribution: string,
  industry: string,  // 'Technology' | 'Logistics' | 'Finance' | etc.
  collaborationType: string,  // 'Technical Integration' | 'Strategic Alliance' | etc.
  website: string,
  active: boolean,
  headquarters: string,
  foundedYear: number,
  keyStrengths: string[],
  collaborationAreas: string[],
  achievements: string[],
  timeline: Array<{ year: number, event: string }>,
  caseStudies: Array<{ title: string, description: string, url: string }>
}
```

---

### 13. Guides Module

#### Status: **FULL**

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guides` | List guides |
| GET | `/api/guides/:id` | Guide details |
| POST | `/api/guides` | Create guide (admin) |
| PUT | `/api/guides/:id` | Update guide (admin) |
| DELETE | `/api/guides/:id` | Delete guide (admin) |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Guides | `/guides` | Guides listing |
| Guide Detail | `/guides/:id` | Guide content |
| Guide Demo | `/guides/demo` | Demo |
| Admin Guides | `/admin/guides` | Manage guides |

---

### 14. Transport Modules

#### Status: **FULL** (Frontend Only)

#### Frontend Pages

| Page | URL | Component |
|------|-----|-----------|
| Transport Dashboard | `/modules/transport` | `TransportDashboard` |
| Air Transport | `/modules/air-transport` | `AirTransportModule` |
| Maritime Transport | `/modules/maritime-transport` | `MaritimeTransportModule` |
| Land Transport | `/modules/land-transport` | `LandTransportModule` |
| Rayanava Brain | `/modules/rayanavabrain` | `RayanavaBrainModule` |
| Marketplace | `/modules/marketplace` | `MarketplaceModule` |

---

### 15. MOLOLINK Module

#### Status: **PARTIAL**

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mololink/*` | MOLOLINK operations |

#### WebSocket
- Endpoint: `/ws/mololink`
- Handler: `server/core/websocket/handlers/mololink.handlers.ts`

#### Frontend
- Route: `/mololink/*?`
- Component: `MololinkWrapper`

---

### 16. General Pages

#### Status: **FULL**

| Page | URL | Backend | Description |
|------|-----|---------|-------------|
| Home | `/` | None | Landing page |
| About | `/about` | None | About page |
| Contact | `/contact` | `/api/contact/*` | Contact form |
| Quote | `/quote` | `/api/quote` | Quote request |
| Settings | `/settings` | `/api/settings` | User settings |
| Privacy Policy | `/privacy-policy` | None | Privacy policy |
| Terms of Service | `/terms-of-service` | None | Terms |
| Ecosystem | `/ecosystem` | `/api/ecosystem/*` | Ecosystem overview |
| Ecosystem Enhanced | `/ecosystem-enhanced` | `/api/ecosystem/*` | Enhanced ecosystem view |
| Customer Portal | `/customer-portal` | None | Customer interface |
| Carbon Footprint | `/carbon-footprint` | None | Carbon tracking |
| Document Processing | `/document-processing` | None | Document handling |
| Achievements | `/achievements` | None | Achievements display |
| Visions | `/visions` | None | Company visions |
| God Layer | `/god-layer` | None | Advanced view |
| Google Drive | `/drive` | `/api/drive/*` | Drive integration |
| File Management | `/file-management` | `/api/drive/*` | File operations |
| Performance Monitoring | `/performance-monitoring` | `/api/performance/*` | Performance |

---

### 17. Profile Module

#### Status: **FULL**

#### Routes

| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/api/profile` | `isAuthenticated` | Get profile |
| PUT | `/api/profile` | `isAuthenticated`, `validateRequest` | Update profile |
| GET | `/api/profile/settings` | `isAuthenticated` | Profile settings |
| GET | `/api/identity-security/*` | `isAuthenticated` | Identity operations |

#### Frontend Pages

| Page | URL | Protection |
|------|-----|------------|
| User Profile | `/profile` | Auth required |
| Admin Profile | `/admin/profile` | Admin only |
| Identity Management | `/identity-management` | Auth required |
| API Keys | `/api-keys` | Auth required |

---

### 18. Marketing Module (Instagram)

#### Status: **PARTIAL**

#### Blockers
- Instagram/Meta Graph API credentials not configured
- OAuth flow needs completion

#### Data Model
- **Tables:** `instagramAccounts`, `instagramPosts`, `instagramAnalytics`, `instagramTemplates`, `instagramComments`, `instagramCampaigns`, `instagramStories`, `instagramReels`, `instagramInfluencers`, `instagramCompetitors`, `instagramABTests`, `instagramShoppingProducts`

#### Routes (When Configured)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/instagram/auth` | Instagram OAuth |
| GET | `/api/instagram/callback` | OAuth callback |
| GET | `/api/instagram/demo` | Demo data |
| GET | `/api/instagram/accounts` | Connected accounts |
| GET | `/api/instagram/accounts/:id` | Account details |
| POST | `/api/instagram/accounts/:id/refresh` | Refresh token |
| GET | `/api/instagram/accounts/:id/media` | Account media |
| POST | `/api/instagram/accounts/:id/posts` | Create post |
| GET | `/api/instagram/posts` | List posts |
| PATCH | `/api/instagram/posts/:id` | Update post |
| DELETE | `/api/instagram/posts/:id` | Delete post |
| GET | `/api/instagram/accounts/:id/insights` | Account insights |
| GET | `/api/instagram/accounts/:id/analytics` | Analytics |
| POST | `/api/instagram/posts/schedule` | Schedule post |
| POST | `/api/instagram/content/generate` | AI content generation |
| GET | `/api/instagram/analytics/*` | Various analytics |
| GET | `/api/instagram/competitors/:id/insights` | Competitor analysis |

---

### 19. Analytics Module

#### Status: **FULL**

#### Data Model
- **Table:** `analytics`

#### Routes

| Method | Endpoint | Cache TTL | Description |
|--------|----------|-----------|-------------|
| GET | `/api/analytics/overview` | 5 min | General overview |
| GET | `/api/analytics/users` | 5 min | User analytics |
| GET | `/api/analytics/revenue` | 5 min | Revenue analytics |
| GET | `/api/analytics/performance` | 5 min | System performance analytics |
| GET | `/api/analytics/events` | 5 min | Event tracking |
| GET | `/api/analytics/reports/:reportType` | 30 min | Specific reports |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Analytics Dashboard | `/analytics` | Main analytics view |
| User Analytics | `/analytics/users` | User behavior |
| Revenue Analytics | `/analytics/revenue` | Financial data |
| Performance Analytics | `/analytics/performance` | System performance |
| Event Tracking | `/analytics/events` | Event logs |
| Custom Reports | `/analytics/reports` | Custom report generation |

---

### 20. Commodities Module

#### Status: **FULL**

#### Data Model
- **Table:** `commodities`

#### Routes

| Method | Endpoint | Cache TTL | Description |
|--------|----------|-----------|-------------|
| GET | `/api/commodities` | 30 min | List all commodities |
| GET | `/api/commodities/:id` | 30 min | Commodity details |
| GET | `/api/commodities/:id/price-history` | 5 min | Price history |
| POST | `/api/commodities` | None | Create commodity (Admin) |
| PUT | `/api/commodities/:id` | None | Update commodity (Admin) |
| DELETE | `/api/commodities/:id` | None | Delete commodity (Admin) |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Commodities List | `/commodities` | View all commodities |
| Commodity Detail | `/commodities/:id` | Specific commodity info |
| Commodity Pricing | `/commodities/:id/pricing` | Historical pricing |
| Admin Commodities | `/admin/commodities` | Manage commodities |

---

### 21. Tracking Module

#### Status: **FULL**

#### Data Model
- **Table:** `tracking`
- **Related:** `trackingEvents`, `trackingProviders`

#### Routes

| Method | Endpoint | Cache TTL | Description |
|--------|----------|-----------|-------------|
| GET | `/api/tracking` | 1 min | List all shipments |
| GET | `/api/tracking/:trackingNumber` | 1 min | Shipment by tracking number |
| POST | `/api/tracking` | None | Create shipment (Admin) |
| PUT | `/api/tracking/:id` | None | Update shipment (Admin) |
| DELETE | `/api/tracking/:id` | None | Delete shipment (Admin) |
| GET | `/api/tracking/providers` | 24 hours | List tracking providers |
| POST | `/api/tracking/providers` | None | Add tracking provider (Admin) |
| PUT | `/api/tracking/providers/:id` | None | Update tracking provider (Admin) |
| DELETE | `/api/tracking/providers/:id` | None | Delete tracking provider (Admin) |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Shipment Tracking | `/tracking` | Track shipments |
| Tracking Dashboard | `/tracking/dashboard` | Overview of shipments |
| Admin Tracking | `/admin/tracking` | Manage shipments and providers |

---

### 22. Collaboration Module

#### Status: **FULL**

#### Data Model
- **Tables:** `collaborationSessions`, `documentEdits`, `comments`

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/collaboration/sessions` | List active sessions |
| POST | `/api/collaboration/sessions` | Create session |
| GET | `/api/collaboration/sessions/:id` | Session details |
| POST | `/api/collaboration/sessions/:id/join` | Join session |
| POST | `/api/collaboration/sessions/:id/leave` | Leave session |
| POST | `/api/collaboration/documents/save` | Save document changes |
| GET | `/api/collaboration/documents/:docId/history` | Document edit history |
| POST | `/api/collaboration/comments` | Add comment |
| GET | `/api/collaboration/comments/:threadId` | List comments |

#### WebSocket

- **Endpoint:** `/ws/collaboration`
- **Purpose:** Real-time synchronization of edits, cursor positions, and comments.

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Collaborative Workspace | `/collaboration/workspace` | Main collaborative editor |
| Document Editor | `/documents/:docId` | Specific document editing |
| Session Management | `/collaboration/sessions` | Manage collaboration sessions |

---

### 23. Notifications Module

#### Status: **FULL**

#### Data Model
- **Tables:** `notificationTemplates`, `userNotifications`, `broadcastMessages`

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/mark-read` | Mark notifications as read |
| POST | `/api/notifications/broadcast` | Send broadcast message (Admin) |
| GET | `/api/notification-templates` | List notification templates (Admin) |
| POST | `/api/notification-templates` | Create notification template (Admin) |
| PUT | `/api/notification-templates/:id` | Update notification template (Admin) |
| DELETE | `/api/notification-templates/:id` | Delete notification template (Admin) |

#### WebSocket

- **Endpoint:** `/ws/notifications`
- **Purpose:** Real-time delivery of new notifications to connected users.

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Notification Center | `/notifications` | View all notifications |
| Notification Settings | `/settings/notifications` | Manage notification preferences |
| Admin Notification Templates | `/admin/notifications/templates` | Manage templates |

---

### 24. File Management Module

#### Status: **FULL**

#### Data Model
- **Tables:** `files`, `folders`, `storageProviders`

#### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List files (with folder filtering) |
| GET | `/api/files/:id` | Get file details |
| POST | `/api/files/upload` | Upload file(s) |
| PUT | `/api/files/:id` | Update file metadata |
| DELETE | `/api/files/:id` | Delete file |
| GET | `/api/folders` | List folders (with parent filtering) |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/:id` | Update folder metadata |
| DELETE | `/api/folders/:id` | Delete folder |
| GET | `/api/storage-providers` | List storage providers |
| POST | `/api/storage-providers` | Add storage provider (Admin) |
| PUT | `/api/storage-providers/:id` | Update storage provider (Admin) |
| DELETE | `/api/storage-providers/:id` | Delete storage provider (Admin) |

#### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| File Manager | `/files` | Browse and manage files/folders |
| Upload Page | `/files/upload` | Upload interface |
| Admin Storage | `/admin/storage` | Configure storage providers |

---

## WebSocket Architecture

### Unified WebSocket Manager

**File:** `server/core/websocket/UnifiedWebSocketManager.ts`

All WebSocket connections are managed centrally to prevent competing handlers.

### WebSocket Endpoints

**8 Active Namespaces** (defined in `server/core/websocket/unified-setup.ts`):

| Endpoint | Purpose | Handler File |
|----------|---------|--------------|
| `/ws/main` | Main platform connection, status, auth | `main.handlers.ts` |
| `/ws/collaboration` | Real-time project collaboration | `collaboration.handlers.ts` |
| `/ws/mololink` | MOLOLINK marketplace integration | `mololink.handlers.ts` |
| `/ws/notifications` | User notification subscriptions | `notification.handlers.ts` |
| `/ws/tracking` | Live shipment tracking updates | `tracking.handlers.ts` |
| `/ws/project-updates` | Project milestone broadcasts | `project.handlers.ts` |
| `/ws/activity-logs` | System activity logging | `activity.handlers.ts` |
| `/ws/commodity-chat` | Commodity chat rooms & price alerts | `commodity.handlers.ts` |

### Client WebSocket Usage

```typescript
// In component
const { isConnected, sendMessage, subscribe } = useWebSocket();

// Subscribe to channel
useEffect(() => {
  const unsubscribe = subscribe('tracking', (data) => {
    console.log('Tracking update:', data);
  });
  return unsubscribe;
}, []);

// Send message
sendMessage({ type: 'subscribe', channel: 'tracking', trackingNumber: 'ABC123' });
```

### Connection State

```typescript
interface ConnectionState {
  isConnecting: boolean;
  reconnectAttempts: number;
  maxAttempts: number;
  lastError?: string;
  isAuthenticated: boolean;
  lastHeartbeat?: number;
}
```

---

## Security Architecture

### Security Middleware

**File:** `server/middleware/advanced-security.ts`

#### Content Security Policy (CSP)

```typescript
directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "wss:", "https:"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"]
}
```

#### Rate Limiting

```typescript
// Dynamic rate limits
- Default: 100 requests/15 min
- Auth endpoints: 20 requests/15 min
- Admin endpoints: 30 requests/15 min
- Suspicious IPs: 50% of normal limit
```

#### Security Monitor

```typescript
// Tracks security events
interface SecurityEvent {
  type: 'rate_limit' | 'csp_violation' | 'suspicious_request' | 'auth_attempt';
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

// Methods
securityMonitor.logSecurityEvent(event);
securityMonitor.isSuspiciousIP(ip);
securityMonitor.getSecurityStats();
```

### Authentication Flow

```
1. Session-based (default)
   - express-session with MemoryStore
   - Passport.js local strategy
   - Secure HTTP-only cookies

2. JWT (optional)
   - Bearer token in Authorization header
   - Falls back to session if JWT fails

3. API Keys
   - For third-party integrations
   - Scoped permissions: ['read', 'write', 'admin']
   - Rate limited per key
```

### Password Security

```typescript
// bcrypt configuration
const SALT_ROUNDS = 12;

// Password requirements (registrationSchema)
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
```

### Admin Route Protection

**File:** `server/routes/admin-performance-metrics.ts`

All admin performance and monitoring endpoints are protected with `requireAdmin` middleware from `server/middleware/auth.ts`.

**Protected Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/performance/metrics` | GET | System performance metrics |
| `/api/admin/websocket/metrics` | GET | WebSocket connection stats |
| `/api/admin/api/metrics` | GET | API usage statistics |
| `/api/admin/database/metrics` | GET | Database performance |
| `/api/admin/security/metrics` | GET | Security audit events |
| `/api/admin/system/performance` | GET | Cache, memory, module status |
| `/api/admin/system/optimize` | POST | Trigger system optimization |

**Security Enforcement:**
```typescript
// requireAdmin middleware (server/middleware/auth.ts)
- Validates session via validateSession()
- Checks user.role === 'admin'
- Returns 401 for unauthenticated users
- Returns 403 for non-admin users
```

---

## Error Handling

### Backend Error Handler

**File:** `server/utils/global-error-handler.ts`

```typescript
// Handles:
- Unhandled Promise Rejections
- Uncaught Exceptions
- SIGTERM/SIGINT signals

// Safe async wrapper
GlobalErrorHandler.safeAsync(async () => {
  // Code that might throw
}, fallbackValue, 'context');
```

### API Error Responses

```typescript
// Validation Error (400)
{
  error: 'Validation error',
  message: 'Invalid request data',
  errors: [
    { path: 'email', message: 'Invalid email address' }
  ]
}

// Authentication Error (401)
{
  error: 'Authentication required',
  code: 'NO_AUTH_TOKEN'
}

// Authorization Error (403)
{
  error: 'Forbidden',
  message: 'Insufficient role privileges'
}

// Not Found (404)
{
  error: 'Resource not found'
}

// Rate Limit (429)
{
  error: 'Too many requests from this IP',
  retryAfter: 900,  // seconds
  type: 'rate_limit_exceeded'
}

// Server Error (500)
{
  error: 'Internal server error',
  message: 'Something went wrong'
}

// Service Unavailable (503)
{
  message: 'AI services are currently disabled.'
}
```

### Frontend Error Handling

```typescript
// ErrorBoundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['/api/endpoint'],
  // Returns null on 401 instead of throwing
});

// Mutation error handling
const mutation = useMutation({
  mutationFn: apiRequest,
  onError: (error) => {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }
});
```

---

## Caching Strategy

### Cache Types

```typescript
type CacheType =
  | 'service'     // Service data (5 min)
  | 'tracking'    // Tracking info (1 min)
  | 'commodity'   // Commodity data (30 min)
  | 'region'      // Region data (24 hours)
  | 'api'         // General API responses (varies)
  | 'user'        // User data (5 min)
  | 'analytics'   // Analytics data (5 min)
  | 'files'       // File metadata (5 min)
  | 'folders'     // Folder metadata (5 min)
  | 'notifications' // Notification data (1 min)
```

### Cache Headers

```typescript
// Cache hit
X-Cache: HIT

// Cache miss
X-Cache: MISS
```

### Cache Management

```typescript
// Admin endpoints
GET  /api/admin/cache/stats   // View cache stats
POST /api/admin/cache/clear   // Clear all cache
POST /api/admin/cache/clear   // Clear specific type
     body: { type: 'service' }
```

---

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://...          # PostgreSQL connection string
SESSION_SECRET=your-secret-key         # Session encryption key
JWT_SECRET=your-jwt-secret             # JWT signing key
```

### Optional

```bash
# Feature Flags
FEATURE_AI_ENABLED=true                # Enable AI/Rayanava features

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...                  # OpenAI API key

# Instagram/Meta (for marketing module)
INSTAGRAM_CLIENT_ID=...                # Meta App ID
INSTAGRAM_CLIENT_SECRET=...            # Meta App Secret
INSTAGRAM_REDIRECT_URI=...             # OAuth redirect

# Stripe (for investment module)
STRIPE_SECRET_KEY=sk_...               # Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_...          # Stripe publishable key

# Google Drive (for file management)
GOOGLE_CLIENT_ID=...                   # Google OAuth client ID
GOOGLE_CLIENT_SECRET=...               # Google OAuth secret

# AWS S3 (for file management)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...

# Performance
NODE_ENV=production                    # Enable production optimizations
LOG_LEVEL=info                         # Logging level
```

---

## API Documentation

Swagger/OpenAPI documentation available at:
- **Swagger UI:** `/api-docs`
- **OpenAPI Spec:** `/api-docs/spec`

**File:** `server/api-docs.ts`, `server/openapi.json`

---

## File Structure Summary

```
├── client/src/
│   ├── pages/              # Route pages (organized by module)
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (queryClient, WebSocket)
│   ├── services/           # API service layers
│   └── App.tsx             # Main app with routing
│
├── server/
│   ├── api/                # API route handlers (by module)
│   ├── core/               # Core services (auth, cache, websocket)
│   ├── middleware/         # Express middleware
│   ├── routes/             # Route definitions
│   ├── services/           # Business logic services
│   ├── utils/              # Utilities
│   ├── validation/         # Zod schemas
│   ├── routes.ts           # Main route registration
│   └── index.ts            # Server entry point
│
├── shared/
│   └── schema.ts           # Drizzle ORM schema (all tables)
│
└── drizzle.config.ts       # Drizzle configuration
```

---

*Document generated for MoloChain Platform v2.0*