# Mololink API Endpoints Documentation

## Version: 3.0.0 (Hybrid Auth)
## Base URL: https://mololink.molochain.com/api

---

## Authentication Endpoints (6)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes | Get current user info |
| GET | `/api/auth/verify` | Yes | Verify token and auth type |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Complete password reset |

## SSO Endpoints (1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sso/config` | No | Get SSO configuration |

## Company Endpoints (3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/companies` | No | List all companies |
| GET | `/api/companies/:id` | No | Get company by ID |
| POST | `/api/companies` | Yes | Create new company |

## Job Endpoints (3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/jobs` | No | List all jobs |
| GET | `/api/jobs/:id` | No | Get job by ID |
| POST | `/api/jobs` | Yes | Create new job |

## Marketplace Endpoints (4)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/marketplace/listings` | No | List all marketplace items |
| POST | `/api/marketplace/listings` | Yes | Create listing |
| GET | `/api/marketplace/auctions` | No | List auction items |
| GET | `/api/marketplace/services` | No | List service items |

## Post Endpoints (2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | No | List all posts |
| POST | `/api/posts` | Yes | Create new post |

## Connection Endpoints (2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/connections` | Yes | Get user connections |
| POST | `/api/connections` | Yes | Send connection request |

## Profile Endpoints (5)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profiles` | No | List all profiles |
| GET | `/api/profiles/me` | Yes | Get current user profile |
| GET | `/api/profiles/:id` | No | Get profile by ID |
| PATCH | `/api/profiles/:id` | Yes | Update profile |
| POST | `/api/profiles/:id/image` | Yes | Upload profile image |

## Health Endpoint (1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Service health check |

---

## Total Endpoints: 27

### Frontend Integration Status

| Endpoint Category | Endpoints | Frontend Integrated |
|-------------------|-----------|---------------------|
| Authentication | 6 | 6/6 (100%) |
| SSO | 1 | 1/1 (100%) |
| Companies | 3 | 2/3 (67%) |
| Jobs | 3 | 2/3 (67%) |
| Marketplace | 4 | 4/4 (100%) |
| Posts | 2 | 2/2 (100%) |
| Connections | 2 | 2/2 (100%) |
| Profiles | 5 | 5/5 (100%) |
| Health | 1 | 0/1 (0%) |

**Overall Coverage: 24/27 (89%)**

### Missing Frontend Integrations:
1. POST `/api/companies` - Company creation form
2. POST `/api/jobs` - Job posting form
3. GET `/health` - Health status display (optional)

---

## Request/Response Examples

### Login
```bash
curl -X POST https://mololink.molochain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Get SSO Config
```bash
curl https://mololink.molochain.com/api/sso/config
```

Response:
```json
{
  "success": true,
  "config": {
    "issuer": "auth.molochain.com",
    "audience": ["molochain.com", "mololink.molochain.com"],
    "loginUrl": "https://auth.molochain.com/login"
  }
}
```

### Create Connection
```bash
curl -X POST https://mololink.molochain.com/api/connections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": 123}'
```

---

## Hybrid Authentication

The API supports hybrid JWT authentication:

1. **Central SSO** (Primary): Tokens from `auth.molochain.com`
   - Shared JWT secret across all Molochain services
   - Cookie domain: `.molochain.com`

2. **Local Auth** (Fallback): Tokens issued by Mololink service
   - For backward compatibility
   - Migrating users to central SSO

Token verification order:
1. Try central SSO token verification
2. Fall back to local token verification
3. Return 401 if both fail
