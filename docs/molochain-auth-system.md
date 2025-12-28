# Molochain Authentication System Documentation

**Version:** 1.0  
**Generated:** December 21, 2025

---

## Table of Contents

1. [System Architecture Diagram](#1-system-architecture-diagram)
2. [Authentication Flow Chart](#2-authentication-flow-chart)
3. [Auth URLs & Endpoints](#3-auth-urls--endpoints)
4. [Auth Database Schema](#4-auth-database-schema)
5. [Database Triggers](#5-database-triggers)
6. [Auth Mappings & Relationships](#6-auth-mappings--relationships)

---

## 1. System Architecture Diagram

### Overview

```
                                    +------------------+
                                    |   Client Apps    |
                                    | (Web/Mobile/API) |
                                    +--------+---------+
                                             |
                                             v
                              +------------------------------+
                              |     Nginx (SSL Termination)  |
                              |      :80 / :443              |
                              +-------------+----------------+
                                            |
                                            v
                              +------------------------------+
                              |     Kong API Gateway         |
                              |      :8000 (Proxy)           |
                              |      :8001 (Admin)           |
                              +-------------+----------------+
                                            |
                    +-----------------------+------------------------+
                    |                       |                        |
                    v                       v                        v
          +-----------------+    +------------------+     +-------------------+
          |  Auth Service   |    |   OTMS Service   |     | MoloLink Service  |
          |    :3002/7010   |    |      :3009       |     |      :5001        |
          +--------+--------+    +------------------+     +-------------------+
                   |
        +----------+----------+
        |                     |
        v                     v
+---------------+     +------------------+
| Redis Session |     |   PostgreSQL     |
|    :6379      |     |  molochaindb     |
+---------------+     |     :5432        |
                      +------------------+
```

### Key Components

| Component | Port | Description |
|-----------|------|-------------|
| Nginx | 80/443 | Reverse proxy, SSL termination |
| Kong Gateway | 8000-8001 | API gateway, routing, rate limiting |
| Auth Service | 3002 (7010 exposed) | Authentication microservice |
| Redis | 6379 | Session storage |
| PostgreSQL | 5432 | Primary database |

---

## 2. Authentication Flow Chart

### 2.1 User Login Flow

```
User Enters Credentials
         |
         v
    POST /auth/login
         |
         v
   +-------------+
   | Validate    |---> Invalid ---> Return 400 Error
   | Input       |
   +------+------+
          | Valid
          v
   Query users Table
          |
          v
   +-------------+
   | User        |---> No ---> Return 401 Unauthorized
   | Exists?     |
   +------+------+
          | Yes
          v
   Verify Password Hash
          |
          v
   +-------------+
   | Password    |---> No ---> Return 401 Unauthorized
   | Match?      |
   +------+------+
          | Yes
          v
   +-------------+
   | 2FA         |---> Yes ---> Verify TOTP ---> Invalid ---> 401
   | Enabled?    |                    |
   +------+------+                    | Valid
          | No                        v
          +------------> Generate Tokens <-+
                              |
                              v
                   Create Access Token (JWT)
                   Create Refresh Token
                              |
                              v
                   Store in refresh_tokens Table
                   Store Session in Redis
                              |
                              v
                   Update last_login_at
                              |
                              v
                   Return Tokens + User Data
```

### 2.2 Token Refresh Flow

```
Access Token Expired
         |
         v
    POST /auth/refresh
         |
         v
   Extract Refresh Token
         |
         v
   +----------------+
   | Token Valid?   |---> No ---> 401 Invalid Token
   +-------+--------+
           | Yes
           v
   Query refresh_tokens Table
           |
           v
   +-------------------+
   | Exists & Not      |---> No ---> 401 Invalid Token
   | Revoked?          |
   +--------+----------+
            | Yes
            v
   +----------------+
   | Token Expired? |---> Yes ---> 401 Token Expired
   +-------+--------+
           | No
           v
   Generate New Access Token
   Optionally Rotate Refresh Token
           |
           v
   Update Session in Redis
           |
           v
   Return New Tokens
```

### 2.3 Password Reset Flow

```
User Requests Reset ---> POST /auth/request-reset
                                    |
                                    v
                            Validate Email
                                    |
                                    v
                         +------------------+
                         | User Exists?     |---> No ---> Return Success (security)
                         +---------+--------+
                                   | Yes
                                   v
                         Generate Reset Token
                         Hash & Store in password_reset_tokens
                                   |
                                   v
                         Send Email with Link
                                   |
                                   v
                         Return Success
                         
User Clicks Link ---> Validate Token ---> Show Reset Form
                                              |
                                              v
                                    POST /auth/reset-password
                                              |
                                              v
                                    Validate New Password
                                    Hash & Update users Table
                                              |
                                              v
                                    Mark Token as Used
                                    Revoke All Refresh Tokens
                                              |
                                              v
                                    Return Success
```

---

## 3. Auth URLs & Endpoints

### 3.1 Public Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `https://auth.molochain.com/api/auth/register` | User registration | No |
| POST | `https://auth.molochain.com/api/auth/login` | User login | No |
| POST | `https://auth.molochain.com/api/auth/logout` | User logout | Yes |
| POST | `https://auth.molochain.com/api/auth/refresh` | Refresh access token | Refresh Token |
| POST | `https://auth.molochain.com/api/auth/request-reset` | Request password reset | No |
| POST | `https://auth.molochain.com/api/auth/reset-password` | Reset password | Reset Token |

> **Note:** Email verification endpoint (`/api/auth/verify-email`) is planned but not yet implemented.

### 3.2 Two-Factor Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/2fa/setup` | Generate 2FA secret and QR code |
| POST | `/api/auth/2fa/verify` | Verify and enable 2FA |
| POST | `/api/auth/2fa/disable` | Disable 2FA (requires code) |
| GET | `/api/auth/2fa/recovery-codes` | Get recovery codes |

### 3.3 API Key Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/api-keys` | List user's API keys |
| POST | `/api/auth/api-keys` | Create new API key |
| DELETE | `/api/auth/api-keys/:id` | Revoke API key |

### 3.4 Service URLs

- **Auth Subdomain:** https://auth.molochain.com
- **API Gateway:** https://api.molochain.com
- **Admin Panel:** https://admin.molochain.com
- **Kong Admin API:** http://localhost:8001 (internal)
- **Konga Dashboard:** http://localhost:1337 (internal)

---

## 4. Auth Database Schema

**Database:** PostgreSQL  
**Name:** molochaindb  
**Host:** 31.186.24.19:5432

### 4.1 Users Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NO | Primary key |
| email | varchar | NO | Unique email address |
| username | text | NO | Unique username |
| password | text | NO | Legacy password field |
| password_hash | text | YES | Bcrypt hashed password |
| full_name | text | YES | User's full name |
| role | varchar | NO | User role (user, admin, etc.) |
| is_active | boolean | NO | Account active status |
| permissions | json | YES | Custom permissions object |
| two_factor_enabled | boolean | NO | 2FA enabled flag |
| two_factor_secret | text | YES | TOTP secret (encrypted) |
| recovery_codes | json | YES | 2FA recovery codes |
| company | varchar | YES | Company name |
| phone | varchar | YES | Phone number |
| department | varchar | YES | Department |
| last_login | timestamp | YES | Legacy last login |
| last_login_at | timestamp | YES | Last login timestamp |
| created_at | timestamp | NO | Account creation time |
| updated_at | timestamp | NO | Last update time |

### 4.2 Refresh Tokens Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NO | Primary key |
| user_id | integer | NO | FK to users.id |
| token_hash | varchar | NO | Hashed token value |
| expires_at | timestamp | NO | Token expiration |
| is_revoked | boolean | NO | Revocation status |
| user_agent | text | YES | Client user agent |
| ip_address | varchar | YES | Client IP address |
| created_at | timestamp | NO | Token creation time |

### 4.3 Password Reset Tokens Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NO | Primary key |
| user_id | integer | NO | FK to users.id |
| token | text | NO | Hashed reset token |
| expires_at | timestamp | NO | Token expiration |
| used_at | timestamp | YES | When token was used |
| created_at | timestamp | NO | Token creation time |

### 4.4 API Keys Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NO | Primary key |
| name | varchar | NO | Key name/label |
| key_hash | varchar | NO | Hashed API key |
| user_id | integer | YES | FK to users.id |
| scopes | array | YES | Allowed scopes |
| rate_limit | integer | YES | Rate limit per hour |
| usage_count | integer | YES | Total usage count |
| last_used_at | timestamp | YES | Last usage time |
| expires_at | timestamp | NO | Key expiration |
| is_active | boolean | YES | Active status |
| metadata | text | YES | Additional metadata |
| created_at | timestamp | YES | Creation time |
| updated_at | timestamp | YES | Last update time |

### 4.5 Admins Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | integer | NO | Primary key |
| email | varchar | NO | Admin email |
| password | text | NO | Hashed password |
| role | varchar | NO | Admin role level |
| is_active | boolean | NO | Active status |
| last_login_at | timestamp | YES | Last login |
| created_at | timestamp | NO | Creation time |
| updated_at | timestamp | NO | Last update |

---

## 5. Database Triggers

### 5.1 Active Triggers

| Trigger Name | Event | Table | Action |
|--------------|-------|-------|--------|
| update_services_updated_at | UPDATE | services | EXECUTE FUNCTION update_updated_at_column() |

### 5.2 Recommended Auth Triggers (Not Implemented)

```sql
-- Trigger: Auto-update updated_at on users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Trigger: Log password changes
CREATE OR REPLACE FUNCTION log_password_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
        INSERT INTO audit_logs (user_id, action, details, created_at)
        VALUES (NEW.id, 'PASSWORD_CHANGED', '{}', CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Revoke tokens on password change
CREATE OR REPLACE FUNCTION revoke_tokens_on_password_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
        UPDATE refresh_tokens SET is_revoked = true 
        WHERE user_id = NEW.id AND is_revoked = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Auth Mappings & Relationships

### 6.1 Foreign Key Relationships

| Source Table | Column | Target Table | Target Column |
|--------------|--------|--------------|---------------|
| refresh_tokens | user_id | users | id |
| password_reset_tokens | user_id | users | id |
| admin_activity_logs | admin_id | users | id |
| user_guide_progress | user_id | users | id |
| ecosystem_user_achievements | user_id | users | id |
| ecosystem_user_achievements | achievement_id | ecosystem_achievements | id |
| user_achievements | customer_id | customers | id |
| user_points | customer_id | customers | id |

### 6.2 Kong Gateway Route Mappings

| Route Name | Path | Target Service | Port |
|------------|------|----------------|------|
| mololink-route | /api, / | mololink-service | 5001 |
| otms-route | /otms | otms-service | 3009 |
| otms-api-route-compat | /api | otms-service | 3009 |

### 6.3 Docker Network Mapping

| Network | Type | Connected Services |
|---------|------|-------------------|
| kong-stack_kong-net | bridge | Kong, Kong Admin, Kong DB |
| molochain-core | bridge | Auth Service, OTMS Service, Redis |
| monitoring_monitoring | bridge | Prometheus, Grafana, Loki |

### 6.4 Role Permission Mapping

| Role | Permissions | Access Level |
|------|-------------|--------------|
| user | read:own, write:own | Standard user access |
| moderator | read:all, write:own, moderate:content | Content moderation |
| admin | read:all, write:all, manage:users | Full system access |
| superadmin | *:* | Complete control |

---

## Appendix: Quick Reference

### Environment Variables (Auth Service)

```
PORT=3002
PLESK_DB_URL=postgresql://molodb:***@31.186.24.19:5432/molochaindb
REDIS_HOST=172.22.0.2
REDIS_PORT=6379
```

### Docker Container Status

| Container | Image | Status | Ports |
|-----------|-------|--------|-------|
| auth-service | microservices-auth-service:latest | Running 8 days | 7010 -> 3002 |
| redis-session | redis:7-alpine | Running 8 days | 6379 (internal) |
| kong-gateway | kong:3.7 | Healthy 7 days | 8000-8001 |
| kong-database | postgres:13 | Running 7 days | 5432 (internal) |

---

*Generated: December 21, 2025 | Molochain Authentication System Documentation v1.0*
