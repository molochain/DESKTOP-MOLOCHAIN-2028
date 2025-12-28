# MoloChain Platform - Project Structure

## 📁 Root Directory Structure

```
molochain-platform/
├── client/              # Frontend React application
├── server/              # Backend Express application
├── shared/              # Shared types and schemas
├── db/                  # Database configuration
├── config/              # Application configuration
├── docs/                # Documentation
├── logs/                # Application logs
├── public/              # Public static assets
├── scripts/             # Utility scripts
└── attached_assets/     # User-uploaded assets
```

---

## 🎨 Frontend Structure (`client/`)

### Core Directories
- **`src/`** - Main source code
  - **`components/`** - Reusable React components
    - `ui/` - shadcn/ui components
    - `auth/` - Authentication components
    - `admin/` - Admin panel components
    - `dashboard/` - Dashboard components
    - `services/` - Service-related components
    - `tracking/` - Shipment tracking components
    - `contact/` - Contact & agent components
    - `collaboration/` - Real-time collaboration
    - `developer-portal/` - Developer tools
  - **`pages/`** - Page components (routes)
    - `admin/` - Admin pages
    - `services/` - Service pages
    - `auth/` - Authentication pages
  - **`hooks/`** - Custom React hooks
  - **`lib/`** - Utility libraries
  - **`contexts/`** - React context providers
  - **`types/`** - TypeScript type definitions
  - **`data/`** - Static data and configurations
  - **`departments/`** - Department-specific features

### Key Files
- `App.tsx` - Main application component
- `main.tsx` - Application entry point
- `index.css` - Global styles

---

## ⚙️ Backend Structure (`server/`)

### Core Directories
- **`routes/`** - API route handlers (72 files)
  - Core routes, admin routes, service routes
  - WebSocket routes, performance metrics
  - Authentication and authorization routes
- **`middleware/`** - Express middleware (15 files)
  - Authentication, security, caching
  - Rate limiting, compression, CSRF protection
- **`services/`** - Business logic services (17 files)
  - Instagram services, carrier integration
  - Performance monitoring, health checks
- **`utils/`** - Utility functions (30 files)
  - Database optimization, caching
  - Logging, performance monitoring
  - Error handling, validation
- **`core/`** - Core platform features
  - `auth/` - Authentication services
  - `database/` - Database utilities
  - `websocket/` - WebSocket management
  - `cache/` - Caching system
  - `monitoring/` - System monitoring
- **`api/`** - API modules
  - Ecosystem routes, investment routes
- **`scripts/`** - Database and setup scripts
  - Database initialization and seeding
  - Migration and backup utilities
- **`tests/`** - Server-side tests
- **`validation/`** - Request validation schemas

### Key Files
- `index.ts` - Server entry point
- `routes.ts` - Route registration
- `vite.ts` - Vite server integration
- `db.ts` - Database connection (Pool-based)
- `storage.ts` - Storage interface

---

## 🗄️ Database & Shared (`db/`, `shared/`)

### Database (`db/`)
- `index.ts` - Main database connection (neon-serverless)
- `schema.ts` - Database schema (deprecated, use shared/schema.ts)

### Shared (`shared/`)
- `schema.ts` - Main Drizzle ORM schema
- `achievements-schema.ts` - Achievements tables
- `ai-assistant-schema.ts` - AI features
- `health-schema.ts` - Health monitoring
- `organizational-schema.ts` - Organization structure
- `rayanava-schema.ts` - Rayanava AI features

---

## 📚 Documentation (`docs/`)

### Structure
- **`reports/`** - Technical reports and analysis (8 files)
- **`guides/`** - User and developer guides

### Key Documents
- `2fa-testing-report.md` - Two-factor auth testing
- `PROFILE_TEST_REPORT.md` - Profile functionality tests
- `RBAC_TEST_REPORT.md` - Role-based access control
- `session-management-test-report.md` - Session tests
- `QUICK_START.md` - Quick start guide

---

## 🔧 Configuration Files

### Root Config Files
- `config.ts` - Main application configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `vitest.config.ts` - Vitest testing configuration
- `postcss.config.js` - PostCSS configuration
- `theme.json` - Theme configuration
- `.replit` - Replit environment configuration
- `replit.nix` - Nix package configuration
- `.gitignore` - Git ignore rules

### Config Directory (`config/`)
- `cache-config.json` - Cache configuration
- `security-config.json` - Security settings
- `validation-rules.json` - Validation rules
- `module-production.ts` - Production modules

---

## 🛠️ Utility Scripts (`scripts/`)

### Active Scripts
All one-time utility scripts have been archived to `scripts/archive/`

### Server Scripts (`server/scripts/`)
- `complete-database-setup.ts` - Database initialization ✅ USED
- `database-backup.ts` - Backup utility
- `init-services.ts` - Service initialization
- `init-services-direct.ts` - Direct service init
- `seed-page-modules.ts` - Module seeding
- `fix-missing-tables.ts` - Table repair utility

---

## 📦 Dependencies

### Frontend Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query, React Hook Form
- **Routing:** Wouter
- **UI Components:** Radix UI

### Backend Stack
- **Runtime:** Node.js + Express
- **Database:** Neon PostgreSQL + Drizzle ORM
- **WebSocket:** Socket.IO
- **Authentication:** Passport.js + JWT
- **Security:** Helmet, CSRF protection, Rate limiting

### Development Tools
- **TypeScript** - Type safety
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🚀 Key Features

### Platform Capabilities
1. **Real-time Collaboration** - WebSocket-based features
2. **Supply Chain Management** - Comprehensive logistics
3. **Authentication System** - Multi-factor auth, RBAC
4. **Performance Monitoring** - Real-time metrics
5. **AI Integration** - Optional AI features (feature-flagged)
6. **Developer Portal** - API testing and documentation
7. **Admin Dashboard** - System management
8. **Multi-language Support** - i18n integration

### Database Features
- Neon serverless PostgreSQL
- Drizzle ORM with type safety
- Connection pooling
- Performance optimization
- Query caching
- Health monitoring

### Security Features
- CSRF protection
- Rate limiting
- Helmet security headers
- Session management
- API key authentication
- Role-based access control

---

## 📊 Project Statistics

- **Total TypeScript Files:** 864+ files
  - Server: 210 files
  - Client: 654 files
- **Routes:** 72 API route files
- **Middleware:** 15 middleware files
- **Services:** 17 service files
- **Utilities:** 30 utility files
- **Components:** 230 React components
- **Database Tables:** 130
- **Project Size:** 1.2GB (excluding node_modules)
- **Log Size:** ~22KB (optimized)

---

## 🔄 Workflow & Development

### Development Commands
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run db:push` - Push database schema changes

### Deployment
- **Type:** VM deployment (stateful services)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Port:** 5000
- **Environment:** Production-ready

---

## 📝 Notes

### Important Conventions
1. **Database:** Use `db/index.ts` for all queries
2. **Types:** Define in `shared/schema.ts` for consistency
3. **Routes:** Keep thin, use services for business logic
4. **Components:** Follow shadcn/ui patterns
5. **Imports:** Use `@` path aliases

### Maintenance
- Regular log rotation
- Database performance monitoring
- Security updates
- Dependency audits
- Code quality checks

---

*Last Updated: December 8, 2025*
