# External API Key Administration Runbook

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Last Updated | December 2024 |
| Audience | System Administrators, DevOps |
| Classification | Internal |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Creating API Keys](#2-creating-api-keys)
3. [Viewing Key Usage & Analytics](#3-viewing-key-usage--analytics)
4. [Regenerating Compromised Keys](#4-regenerating-compromised-keys)
5. [Revoking & Deleting Keys](#5-revoking--deleting-keys)
6. [Troubleshooting Common Issues](#6-troubleshooting-common-issues)
7. [Security Best Practices](#7-security-best-practices)

---

## 1. Overview

### 1.1 System Description

The External API Key System enables third-party integrations to authenticate with the Molochain platform. Each API key consists of:

- **Key**: Public identifier (prefix: `mk_live_`)
- **Secret**: Private credential (prefix: `msk_`)
- **Scopes**: Permission levels (`read`, `write`, `*`, custom)
- **Rate Limit**: Requests per window (default: 1000/hour)

### 1.2 Key Components

| Component | Location |
|-----------|----------|
| Auth Middleware | `server/middleware/external-api-auth.ts` |
| API Routes | `server/routes/external-api-keys.ts` |
| Database Tables | `external_api_keys`, `api_key_usage_logs` |
| Admin UI | `/admin/api-keys` |

### 1.3 Authentication Methods

API keys can be provided via:

```bash
# Method 1: Bearer token
Authorization: Bearer mk_live_xxx:msk_xxx

# Method 2: Custom headers
X-API-Key: mk_live_xxx
X-API-Secret: msk_xxx
```

---

## 2. Creating API Keys

### 2.1 Via Admin UI (Recommended)

1. Navigate to `https://admin.molochain.com/admin/api-keys`
2. Click **"Create New API Key"**
3. Fill in the form:
   - **Name**: Descriptive identifier (e.g., "Partner XYZ Integration")
   - **Description**: Purpose and owner details
   - **Scopes**: Select required permissions
   - **Rate Limit**: Requests per window (100-100,000)
   - **Rate Limit Window**: Window duration in seconds (60-86400)
   - **Expires At**: Optional expiration date
   - **IP Whitelist**: Optional allowed IP addresses
4. Click **"Create"**
5. **IMMEDIATELY** copy and securely store the displayed credentials

> ⚠️ **WARNING**: The secret is displayed only once. It cannot be retrieved later.

### 2.2 Via API (curl)

#### Prerequisites
- Admin authentication cookie or session token
- Admin role permissions

#### Create API Key Request

```bash
curl -X POST 'https://molochain.com/api/admin/api-keys' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE' \
  -d '{
    "name": "Partner Integration - Production",
    "description": "API access for Partner XYZ",
    "scopes": ["read", "write"],
    "rateLimit": 5000,
    "rateLimitWindow": 3600,
    "expiresAt": "2025-12-31T23:59:59Z",
    "ipWhitelist": ["192.168.1.100", "10.0.0.0/8"]
  }'
```

#### Successful Response

```json
{
  "success": true,
  "message": "API key created successfully. Save these credentials securely - they will not be shown again.",
  "apiKey": {
    "id": 42,
    "name": "Partner Integration - Production",
    "key": "mk_live_a1b2c3d4e5f6...",
    "secret": "msk_x9y8z7w6v5u4...",
    "keyPrefix": "mk_live_a1b2",
    "scopes": ["read", "write"],
    "rateLimit": 5000,
    "rateLimitWindow": 3600,
    "createdAt": "2024-12-29T10:30:00.000Z"
  }
}
```

### 2.3 Scope Reference

| Scope | Description | Endpoints |
|-------|-------------|-----------|
| `read` | Read-only access | GET requests |
| `write` | Write access | POST, PUT, PATCH requests |
| `delete` | Delete access | DELETE requests |
| `admin` | Administrative access | Admin endpoints |
| `*` | Full access | All endpoints |
| `services:read` | Read services | `/api/v1/services/*` |
| `tracking:write` | Create tracking | `/api/tracking/*` |

---

## 3. Viewing Key Usage & Analytics

### 3.1 Via Admin UI

1. Navigate to `/admin/api-keys`
2. Click on any API key row to view details
3. View:
   - Last used timestamp
   - Total usage count
   - Recent usage logs (last 10 requests)
   - Rate limit status

### 3.2 Via API

#### List All API Keys

```bash
curl -X GET 'https://molochain.com/api/admin/api-keys' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE'
```

**Response:**
```json
{
  "success": true,
  "apiKeys": [
    {
      "id": 1,
      "name": "Mobile App - iOS",
      "keyPrefix": "mk_live_a1b2",
      "keyPreview": "mk_live_a1b2••••••••",
      "scopes": ["read", "write"],
      "rateLimit": 1000,
      "isActive": true,
      "lastUsedAt": "2024-12-29T09:15:00.000Z",
      "usageCount": 15420,
      "createdAt": "2024-06-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single API Key Details

```bash
curl -X GET 'https://molochain.com/api/admin/api-keys/42' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE'
```

**Response includes:**
- Key metadata
- Recent 10 usage logs with endpoints, status codes, response times

#### Get Paginated Usage History

```bash
# Get usage with pagination
curl -X GET 'https://molochain.com/api/admin/api-keys/42/usage?limit=50&offset=0' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE'
```

**Response:**
```json
{
  "success": true,
  "usage": [
    {
      "id": 1234,
      "apiKeyId": 42,
      "endpoint": "/api/v1/services",
      "method": "GET",
      "statusCode": 200,
      "responseTime": 45,
      "ipAddress": "192.168.1.100",
      "userAgent": "PartnerApp/2.1",
      "createdAt": "2024-12-29T10:00:00.000Z"
    }
  ],
  "total": 15420,
  "limit": 50,
  "offset": 0
}
```

### 3.3 Database Queries

```sql
-- Total requests by API key (last 24 hours)
SELECT 
  k.name,
  COUNT(*) as request_count,
  ROUND(AVG(l.response_time)::numeric, 2) as avg_response_ms
FROM api_key_usage_logs l
JOIN external_api_keys k ON l.api_key_id = k.id
WHERE l.created_at > NOW() - INTERVAL '24 hours'
GROUP BY k.id, k.name
ORDER BY request_count DESC;

-- Error rate by API key
SELECT 
  k.name,
  COUNT(*) FILTER (WHERE l.status_code >= 400) as errors,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE l.status_code >= 400) / COUNT(*)::numeric, 2) as error_rate
FROM api_key_usage_logs l
JOIN external_api_keys k ON l.api_key_id = k.id
WHERE l.created_at > NOW() - INTERVAL '24 hours'
GROUP BY k.id, k.name
HAVING COUNT(*) > 100
ORDER BY error_rate DESC;

-- Rate limit violations
SELECT 
  k.name,
  COUNT(*) as violations,
  MAX(l.created_at) as last_violation
FROM api_key_usage_logs l
JOIN external_api_keys k ON l.api_key_id = k.id
WHERE l.status_code = 429
  AND l.created_at > NOW() - INTERVAL '24 hours'
GROUP BY k.id, k.name
ORDER BY violations DESC;
```

---

## 4. Regenerating Compromised Keys

### 4.1 When to Regenerate

- Key credentials exposed in logs, code, or public repositories
- Suspected unauthorized access
- Regular rotation (recommended every 90 days)
- Employee with key access leaves organization

### 4.2 Regeneration Process

#### Step 1: Notify Key Owner

Contact the integration owner about planned regeneration:
- Scheduled downtime window
- New credentials distribution method
- Update timeline

#### Step 2: Regenerate via Admin UI

1. Go to `/admin/api-keys`
2. Find the key to regenerate
3. Click **"Regenerate"** button
4. Confirm the action
5. **IMMEDIATELY** copy new credentials

#### Step 3: Regenerate via API

```bash
curl -X POST 'https://molochain.com/api/admin/api-keys/42/regenerate' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE'
```

**Response:**
```json
{
  "success": true,
  "message": "API key regenerated successfully. Save these credentials securely.",
  "credentials": {
    "key": "mk_live_newkey123...",
    "secret": "msk_newsecret456..."
  }
}
```

#### Step 4: Distribute New Credentials

Use secure distribution channels:
1. **Password Manager** (Bitwarden, 1Password) - Preferred
2. **One-Time Secret** (onetimesecret.com)
3. **PGP Encrypted Email**
4. **In-Person Transfer**

#### Step 5: Monitor for Issues

After distribution:
```bash
# Watch for 401 errors (old key usage)
grep "401" /root/.pm2/logs/rest-express-out.log | tail -50

# Verify new key is working
curl -X GET 'https://molochain.com/api/v1/services' \
  -H 'Authorization: Bearer NEW_KEY:NEW_SECRET'
```

---

## 5. Revoking & Deleting Keys

### 5.1 Deactivate vs Delete

| Action | Effect | Reversible | Use Case |
|--------|--------|------------|----------|
| Deactivate | Key rejected, data retained | Yes | Temporary suspension, investigation |
| Delete | Key removed permanently | No | Permanent removal, cleanup |

### 5.2 Deactivate API Key

#### Via API

```bash
# Deactivate (set isActive to false)
curl -X PATCH 'https://molochain.com/api/admin/api-keys/42' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE' \
  -d '{"isActive": false}'
```

#### Reactivate

```bash
curl -X PATCH 'https://molochain.com/api/admin/api-keys/42' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE' \
  -d '{"isActive": true}'
```

### 5.3 Delete API Key

#### Via Admin UI

1. Go to `/admin/api-keys`
2. Find the key
3. Click **"Delete"** (trash icon)
4. Confirm deletion

#### Via API

```bash
curl -X DELETE 'https://molochain.com/api/admin/api-keys/42' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE'
```

**Response:**
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

> ⚠️ **Note**: Usage logs are retained even after key deletion for audit purposes.

### 5.4 Bulk Operations

```sql
-- Deactivate all keys for a specific user
UPDATE external_api_keys 
SET is_active = false, updated_at = NOW()
WHERE user_id = 123;

-- Delete expired keys older than 90 days
DELETE FROM external_api_keys 
WHERE expires_at < NOW() - INTERVAL '90 days'
  AND is_active = false;
```

---

## 6. Troubleshooting Common Issues

### 6.1 401 Unauthorized Errors

#### Symptoms
- API returns `{"error": "Unauthorized", "message": "..."}`
- Status code 401

#### Causes & Solutions

| Cause | Diagnosis | Solution |
|-------|-----------|----------|
| Missing credentials | Check request headers | Add `Authorization` or `X-API-Key`/`X-API-Secret` headers |
| Invalid key format | Key doesn't start with `mk_live_` | Verify key format |
| Wrong secret | Hash mismatch | Regenerate key |
| Key deactivated | Check `is_active` in DB | Reactivate or regenerate |
| Key expired | Check `expires_at` | Update expiration or regenerate |

#### Debug Commands

```bash
# Test authentication
curl -v 'https://molochain.com/api/v1/services' \
  -H 'Authorization: Bearer mk_live_xxx:msk_xxx' 2>&1 | grep -E "(HTTP|error|message)"

# Check key in database
PGPASSWORD='xxx' psql -h localhost -U molochain -d molochain_db -c "
SELECT id, name, is_active, expires_at, key_prefix 
FROM external_api_keys 
WHERE key_prefix LIKE 'mk_live_a1b2%';"
```

### 6.2 403 Forbidden Errors

#### Symptoms
- API returns `{"error": "Forbidden", "message": "..."}`
- Status code 403

#### Causes & Solutions

| Cause | Diagnosis | Solution |
|-------|-----------|----------|
| Missing scope | Check required scopes | Update key scopes |
| IP not whitelisted | Check `ip_whitelist` | Add IP or remove whitelist |
| Endpoint restricted | Check endpoint docs | Request appropriate scope |

#### Debug Commands

```bash
# Check key scopes
PGPASSWORD='xxx' psql -h localhost -U molochain -d molochain_db -c "
SELECT name, scopes, ip_whitelist 
FROM external_api_keys 
WHERE id = 42;"
```

### 6.3 429 Too Many Requests

#### Symptoms
- API returns `{"error": "Too Many Requests", "message": "...", "retryAfter": N}`
- Status code 429
- `X-RateLimit-Remaining: 0`

#### Response Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1703851200
Retry-After: 3600
```

#### Solutions

1. **Wait for window reset**: Honor `Retry-After` header
2. **Increase rate limit**: Update key settings
3. **Implement backoff**: Add exponential backoff in client
4. **Check for bugs**: Verify no request loops

#### Increase Rate Limit

```bash
curl -X PATCH 'https://molochain.com/api/admin/api-keys/42' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=YOUR_SESSION_COOKIE' \
  -d '{"rateLimit": 5000}'
```

### 6.4 500 Internal Server Errors

#### Symptoms
- Intermittent 500 errors
- `Authentication service unavailable`

#### Diagnosis

```bash
# Check PM2 logs
pm2 logs rest-express --lines 100 | grep -i "error\|api.key"

# Check database connection
PGPASSWORD='xxx' psql -h localhost -U molochain -d molochain_db -c "SELECT 1;"

# Check server resources
free -h
df -h
```

#### Solutions

1. **Database connection**: Restart database or application
2. **Memory exhaustion**: Scale server or optimize queries
3. **Rate limiter failure**: Check Redis/memory cache

---

## 7. Security Best Practices

### 7.1 Key Management

| Practice | Implementation |
|----------|----------------|
| **Unique keys per integration** | Never share keys between different integrations |
| **Minimum scopes** | Grant only required permissions |
| **Short expiration** | Set 90-day expiration, rotate regularly |
| **IP whitelisting** | Restrict to known IP ranges when possible |
| **Secure storage** | Use secrets management (Vault, AWS Secrets) |

### 7.2 Monitoring & Alerting

Set up alerts for:

```yaml
# Example alert rules
- name: High Error Rate
  condition: error_rate > 10%
  for: 5m
  action: notify_admin

- name: Rate Limit Abuse
  condition: rate_limit_violations > 100
  for: 1h
  action: review_key

- name: Unusual Activity
  condition: usage_spike > 500%
  for: 15m
  action: investigate
```

### 7.3 Audit Checklist

Weekly security review:

- [ ] Review new API keys created
- [ ] Check for inactive keys (no usage > 30 days)
- [ ] Verify no keys with `*` scope unless necessary
- [ ] Review keys expiring within 30 days
- [ ] Check for rate limit violations
- [ ] Audit high-error-rate keys

### 7.4 Incident Response

If key compromise is suspected:

1. **Immediate**: Deactivate the key
   ```bash
   curl -X PATCH 'https://molochain.com/api/admin/api-keys/42' \
     -H 'Cookie: session=YOUR_SESSION_COOKIE' \
     -d '{"isActive": false}'
   ```

2. **Investigate**: Review usage logs
   ```sql
   SELECT * FROM api_key_usage_logs 
   WHERE api_key_id = 42 
   ORDER BY created_at DESC 
   LIMIT 100;
   ```

3. **Notify**: Contact key owner

4. **Regenerate**: Create new credentials

5. **Document**: Log incident details

### 7.5 Compliance

Ensure API key practices comply with:

- **Data Protection**: GDPR, CCPA requirements for logging
- **Access Control**: Principle of least privilege
- **Audit Trail**: Maintain usage logs for required retention period
- **Key Rotation**: Implement regular rotation policy

---

## Appendix A: Quick Reference

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/api-keys` | Create new key |
| `GET` | `/api/admin/api-keys` | List all keys |
| `GET` | `/api/admin/api-keys/:id` | Get key details |
| `PATCH` | `/api/admin/api-keys/:id` | Update key |
| `DELETE` | `/api/admin/api-keys/:id` | Delete key |
| `POST` | `/api/admin/api-keys/:id/regenerate` | Regenerate credentials |
| `GET` | `/api/admin/api-keys/:id/usage` | Get usage history |

### Rate Limit Headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |
| `Retry-After` | Seconds to wait (on 429 only) |

### Key Prefixes

| Prefix | Type |
|--------|------|
| `mk_live_` | Production API key |
| `msk_` | API secret |

---

## Appendix B: Contact & Escalation

| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 | Platform Support | 4 hours |
| L2 | DevOps Team | 2 hours |
| L3 | Security Team | 1 hour |
| Emergency | On-call Engineer | 15 minutes |

---

*End of Runbook*
