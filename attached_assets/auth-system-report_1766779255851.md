# MoloChain Authentication System Report

**Generated:** December 26, 2025  
**Platform:** MoloChain Microservices Architecture

---

## Table of Contents

1. [Overview](#overview)
2. [Frontend - Auth-Frontend SPA](#1-frontend---auth-frontend-spa-authmolochainccom)
3. [Frontend - Main App Auth Components](#2-frontend---main-app-auth-components-mololinkmolochainccom)
4. [Backend - Server Auth Files](#3-backend---server-auth-files)
5. [API Endpoints](#4-api-endpoints)
6. [Database Tables](#5-database-tables-auth-related)
7. [Production Infrastructure](#6-production-infrastructure)
8. [Shared Schema Types](#7-shared-schema-types)
9. [Summary](#8-summary)

---

## Overview

The MoloChain authentication system is designed as a microservices architecture with:

- **SSO Authentication** via `auth.molochain.com`
- **Session Management** via Redis
- **API Gateway** via Kong
- **Multi-App Support** across 6 subdomains

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    auth.molochain.com                            │
│                   (Auth Frontend SPA)                            │
│              Login | Register | Logout | Forgot                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    api.molochain.com                             │
│                      (Kong Gateway)                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 mololink.molochain.com/api                       │
│                    (Backend API Server)                          │
│                    server/auth.ts                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │   PostgreSQL     │    │  Redis Session   │
         │   (Users Table)  │    │     Storage      │
         └──────────────────┘    └──────────────────┘
```

---

## 1. Frontend - Auth-Frontend SPA (auth.molochain.com)

The dedicated authentication frontend for SSO login across all MoloChain apps.

| File | Purpose |
|------|---------|
| `auth-frontend/src/App.tsx` | Route definitions (Login, Register, Logout, ForgotPassword) |
| `auth-frontend/src/config.ts` | API endpoint configuration (`API_BASE_URL`) |
| `auth-frontend/src/pages/Login.tsx` | Login page with email/password form |
| `auth-frontend/src/pages/Register.tsx` | New user registration |
| `auth-frontend/src/pages/ForgotPassword.tsx` | Password reset request |
| `auth-frontend/src/pages/Logout.tsx` | Session termination handler |
| `auth-frontend/src/main.tsx` | React app entry point |

### Configuration

```typescript
// auth-frontend/src/config.ts
export const API_BASE_URL = 'https://mololink.molochain.com';

export const SUBDOMAINS = {
  mololink: 'https://mololink.molochain.com',
  admin: 'https://admin.molochain.com',
  auth: 'https://auth.molochain.com',
};
```

---

## 2. Frontend - Main App Auth Components (mololink.molochain.com)

Components used within the main marketplace application for auth state management.

| File | Purpose |
|------|---------|
| `client/src/hooks/use-auth.tsx` | Auth state management hook (session, user data) |
| `client/src/lib/authUtils.ts` | Auth utility functions (token handling) |
| `client/src/components/auth/RoleGuard.tsx` | Role-based access control wrapper |
| `client/src/components/security/ReAuthPrompt.tsx` | Re-authentication prompt for sensitive actions |
| `client/src/components/two-factor-auth/SetupTwoFactor.tsx` | 2FA setup wizard |
| `client/src/components/two-factor-auth/VerifyTwoFactor.tsx` | 2FA code verification |
| `client/src/modules/mololink/lib/auth.ts` | MOLOLINK-specific auth helpers |
| `client/src/config/api.ts` | Auth redirect and API configuration |

### API Configuration

```typescript
// client/src/config/api.ts
export const API_CONFIG = {
  baseUrl: isDevelopment ? '' : 'https://api.molochain.com',
  
  auth: {
    baseUrl: isDevelopment ? '' : 'https://auth.molochain.com',
    loginPath: '/auth/login',
    registerPath: '/auth/register',
    logoutPath: '/auth/logout',
    mePath: '/api/auth/me',
  },
};
```

---

## 3. Backend - Server Auth Files

Core authentication logic on the Express.js backend.

| File | Purpose |
|------|---------|
| `server/auth.ts` | **Main auth system** - Passport.js setup, session management, login/register/logout endpoints |
| `server/two-factor-auth.ts` | TOTP 2FA implementation using `otplib` |
| `server/middleware/auth.ts` | `isAuthenticated`, `isAdmin` middleware functions |
| `server/middleware/auth-rate-limit.ts` | Login attempt rate limiting (brute force protection) |
| `server/middleware/production-auth.ts` | Production-specific auth adjustments |
| `server/routes/auth-security.ts` | Security endpoints (password change, account lock) |
| `server/routes/two-factor-auth.ts` | 2FA enable/disable/verify API routes |
| `server/validation/auth.schemas.ts` | Zod validation schemas for auth requests |

### Key Functions in server/auth.ts

```typescript
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hash: string): Promise<boolean>
export async function getUserByEmail(email: string): Promise<PublicUser | null>
export async function getUserByUsername(username: string): Promise<PublicUser | null>
export function setupAuth(app: Express): void
export function isAuthenticated(req, res, next): void
export function isAdmin(req, res, next): void
```

---

## 4. API Endpoints

All authentication-related API endpoints.

### Core Auth Endpoints (server/auth.ts)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/me` | GET | Get current user session | No (returns null if not logged in) |
| `/api/auth/login` | POST | User login with email/password | No |
| `/api/auth/register` | POST | Create new user account | No |
| `/api/auth/logout` | POST | Terminate user session | Yes |
| `/api/auth/reauth` | POST | Re-authenticate for sensitive actions | Yes |
| `/api/auth/role-transition` | POST | Switch between user roles | Yes |
| `/api/auth/extend-session` | POST | Extend session timeout | Yes |
| `/api/users` | GET | List all users | Admin |

### Two-Factor Auth Endpoints (server/routes/two-factor-auth.ts)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/2fa/setup` | POST | Generate 2FA secret and QR code |
| `/api/auth/2fa/enable` | POST | Enable 2FA after verification |
| `/api/auth/2fa/disable` | POST | Disable 2FA |
| `/api/auth/2fa/verify` | POST | Verify 2FA code during login |

### Security Endpoints (server/routes/auth-security.ts)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/change-password` | POST | Change user password |
| `/api/auth/forgot-password` | POST | Request password reset email |
| `/api/auth/reset-password` | POST | Reset password with token |

---

## 5. Database Tables (Auth-related)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Core user accounts | id, email, password_hash, username, role, two_factor_enabled |
| `password_reset_tokens` | Password reset requests | id, user_id, token, expires_at |
| `collaboration_sessions` | Active work sessions | id, user_id, document_id, started_at |
| `user_achievements` | User accomplishments | id, user_id, achievement_id, earned_at |
| `ecosystem_user_achievements` | Cross-system achievements | id, user_id, ecosystem_id, achievement |
| `user_points` | Gamification points | id, user_id, points, category |
| `user_referrals` | Referral tracking | id, referrer_id, referred_id, status |
| `user_guide_progress` | Onboarding progress | id, user_id, step, completed |
| `social_user_blocks` | User blocking | id, blocker_id, blocked_id |

### Users Table Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(60) NOT NULL,  -- bcrypt hash
  role VARCHAR(50) DEFAULT 'user',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(32),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

---

## 6. Production Infrastructure

### Docker Containers

| Container | Purpose | Port |
|-----------|---------|------|
| `auth-service` | Auth microservice (minimal, for future expansion) | Internal |
| `redis-session` | Session storage (express-session) | 6379 |

### Hosting

| Subdomain | Host | Type |
|-----------|------|------|
| `auth.molochain.com` | Plesk/Apache | Static SPA |
| `api.molochain.com` | Kong Gateway | API Proxy |
| `mololink.molochain.com` | Docker (mololink-app) | Full Backend |

### Session Configuration

```typescript
// server/auth.ts - Session Setup
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    domain: '.molochain.com' // Shared across subdomains
  }
}));
```

---

## 7. Shared Schema Types

| Location | Contains |
|----------|----------|
| `shared/schema.ts` | User model, insertUserSchema, selectUserSchema |

### Type Definitions

```typescript
// shared/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique(),
  passwordHash: varchar("password_hash", { length: 60 }).notNull(),
  role: varchar("role", { length: 50 }).default("user"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  // ... additional fields
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
```

---

## 8. Summary

### File Counts

| Category | Count |
|----------|-------|
| Auth-Frontend Files | 7 files |
| Main App Auth Components | 7 files |
| Server Auth Files | 8 files |
| API Endpoints | 8+ endpoints |
| Database Tables | 9 tables |
| Production Containers | 2 containers |

### Technology Stack

| Component | Technology |
|-----------|------------|
| Password Hashing | bcrypt (60-char hashes) |
| Session Storage | Redis + express-session |
| Authentication | Passport.js (local strategy) |
| 2FA | TOTP via otplib |
| Rate Limiting | express-rate-limit |
| Validation | Zod schemas |
| Database | PostgreSQL with Drizzle ORM |

### Security Features

- Bcrypt password hashing (cost factor 10)
- Session-based authentication with Redis
- TOTP-based two-factor authentication
- Rate limiting on login attempts
- CSRF protection
- Secure cookie settings (httpOnly, secure, sameSite)
- Role-based access control (RBAC)
- Re-authentication for sensitive actions

---

## Known Issues (December 2025)

1. **Wrong Build Deployed**: auth.molochain.com has the main mololink app instead of auth-frontend
2. **WebSocket Errors**: Main app tries to connect to `wss://auth.molochain.com/ws/main` (not supported)
3. **404 on /api/auth/me**: Auth site is static, has no API endpoints

### Fix Required

Redeploy the correct auth-frontend build from `auth-frontend/dist/` to `auth.molochain.com`.

---

*Report generated by MoloChain Development Team*
