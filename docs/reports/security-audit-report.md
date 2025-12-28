# Molochain Platform Security Audit Report

**Date:** December 15, 2025  
**Auditor:** Automated Security Review  
**Scope:** Server-side security layer including middleware, authentication, and configuration

---

## Executive Summary

The Molochain Platform demonstrates a generally robust security architecture with multiple layers of protection. However, several issues were identified ranging from critical to low severity that should be addressed.

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 4 |
| Medium | 5 |
| Low | 4 |

---

## Critical Findings

### 1. Hardcoded JWT Secret Fallback
**File:** `server/core/websocket/security/ws-auth.ts` (Line 34)  
**Severity:** CRITICAL  
**Description:** The WebSocket authenticator uses a hardcoded fallback secret when `JWT_SECRET` environment variable is not set.

```typescript
this.jwtSecret = process.env.JWT_SECRET || 'molochain-websocket-secret-2025';
```

**Risk:** Attackers can forge valid JWT tokens if the default secret is used in production.  
**Recommendation:** Remove the fallback and require `JWT_SECRET` environment variable in production. Throw an error if not set.

### 2. CSP Allows 'unsafe-inline' and 'unsafe-eval'
**File:** `server/index.ts` (Lines 51-52) and `config.ts` (Line 81)  
**Severity:** CRITICAL  
**Description:** Content Security Policy allows `'unsafe-inline'` and `'unsafe-eval'` for scripts.

```typescript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
```

**Risk:** Significantly weakens XSS protection. Attackers can execute inline scripts and eval-based attacks.  
**Recommendation:** Use nonces or hashes for inline scripts. Remove `'unsafe-eval'` unless absolutely required for third-party dependencies. Use CSP in report-only mode first to identify violations.

---

## High Severity Findings

### 3. CSRF Protection Conditionally Disabled
**File:** `server/index.ts` (Lines 211-245) and `server/middleware/csrf.ts`  
**Severity:** HIGH  
**Description:** CSRF protection is only enabled when `SECURITY_CONFIG.enforceCsrf` is true (production/staging only).

```typescript
if (SECURITY_CONFIG.enforceCsrf) {
  // CSRF protection applied
} else {
  logger.info('CSRF protection disabled (development mode)');
}
```

**Risk:** Development environments are vulnerable to CSRF attacks. Code may be accidentally deployed without CSRF protection.  
**Recommendation:** Enable CSRF protection in all environments with development-friendly error messages.

### 4. Session Secret Length Validation Too Weak
**File:** `server/core/auth/auth.service.ts` (Lines 312-319)  
**Severity:** HIGH  
**Description:** Production requires only 32 characters for session secret, and the check in `config.ts` warns for secrets shorter than 16 characters.

```typescript
if (sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long in production');
}
```

**Risk:** Short session secrets are vulnerable to brute-force attacks.  
**Recommendation:** Require minimum 64 characters and use cryptographically secure random values. Enforce entropy checks.

### 5. Rate Limit Skip for Internal IPs is Too Broad
**File:** `server/middleware/enhanced-rate-limiter.ts` (Lines 91-94)  
**Severity:** HIGH  
**Description:** Rate limiting is completely bypassed for internal IPs including common private IP ranges.

```typescript
if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || 
    ip.startsWith('192.168.') || ip.startsWith('172.')) {
  return true;
}
```

**Risk:** Attackers on the same network or using X-Forwarded-For header spoofing could bypass rate limits.  
**Recommendation:** Only skip rate limiting for verified trusted internal services using authentication tokens, not IP-based checks.

### 6. Sensitive Data in Login Response
**File:** `server/core/auth/auth.service.ts` (Lines 502-516)  
**Severity:** HIGH  
**Description:** The login response includes `refreshToken` directly in the JSON response body.

```typescript
if (refreshToken) {
  response.refreshToken = refreshToken;
}
```

**Risk:** Refresh tokens in response bodies are vulnerable to XSS attacks. If an XSS vulnerability exists, attackers can steal long-lived tokens.  
**Recommendation:** Store refresh tokens in HTTP-only, secure cookies instead of response bodies.

---

## Medium Severity Findings

### 7. SQL Injection Pattern Detection is Insufficient
**File:** `server/middleware/advanced-security.ts` (Lines 253-258)  
**Severity:** MEDIUM  
**Description:** SQL injection detection uses simple regex patterns that can be easily bypassed.

```typescript
const sqlPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
  /(--|\/\*|\*\/|;)/,
  // ...
];
```

**Risk:** Sophisticated SQL injection attacks using encoding, comments, or alternative syntax can bypass these checks.  
**Recommendation:** Use parameterized queries exclusively (which the codebase does with Drizzle ORM). Remove regex-based detection as it provides false security. Add WAF (Web Application Firewall) at infrastructure level.

### 8. XSS Detection Patterns are Incomplete
**File:** `server/middleware/advanced-security.ts` (Lines 262-266)  
**Severity:** MEDIUM  
**Description:** XSS detection patterns only check for common attack vectors.

```typescript
const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe[^>]*>.*?<\/iframe>/gi
];
```

**Risk:** Many XSS vectors are missed (SVG, data URLs, event handlers, template injections, etc.).  
**Recommendation:** Use a proven sanitization library like DOMPurify for HTML content. Encode output contextually. Rely on CSP as primary defense.

### 9. User-Agent Based Rate Limit Bypass
**File:** `server/middleware/enhanced-rate-limiter.ts` (Lines 111-113)  
**Severity:** MEDIUM  
**Description:** Rate limiting is bypassed for requests with specific user-agent strings.

```typescript
if (userAgent.includes('health-check') || userAgent.includes('monitor') || 
    userAgent.includes('probe')) {
  return true;
}
```

**Risk:** Attackers can set their user-agent to include 'monitor' or 'health-check' to bypass rate limits.  
**Recommendation:** Use authentication tokens for monitoring services instead of user-agent checks.

### 10. CORS Configuration Allows Regex Patterns
**File:** `server/index.ts` (Lines 161-174)  
**Severity:** MEDIUM  
**Description:** CORS configuration uses regex patterns that could match unintended origins.

```typescript
origin: isProd
  ? SERVER_CONFIG.corsOrigins
  : [
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.replit\.app$/,
      // ...
    ],
```

**Risk:** In development, any subdomain of replit.dev/app is allowed, which could include malicious replits.  
**Recommendation:** Use explicit origin allowlists even in development. Implement origin validation at the infrastructure level.

### 11. Memory Store for Sessions in Production
**File:** `server/core/auth/auth.service.ts` (Lines 330-333)  
**Severity:** MEDIUM  
**Description:** Sessions use MemoryStore which doesn't persist across restarts and doesn't scale.

```typescript
const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000,
});
```

**Risk:** Sessions are lost on server restart. Not suitable for multi-instance deployments.  
**Recommendation:** Use Redis or PostgreSQL session store in production.

---

## Low Severity Findings

### 12. Password Minimum Length is Only 8 Characters
**File:** `server/validation/auth.schemas.ts` (Line 24)  
**Severity:** LOW  
**Description:** Password minimum length is set to 8 characters.

**Recommendation:** Increase to 12 characters minimum for stronger security.

### 13. Debug Logging of User Credentials
**File:** `server/core/auth/auth.service.ts` (Line 360)  
**Severity:** LOW  
**Description:** Email addresses are logged in debug mode during login attempts.

```typescript
logger.debug('Login attempt for email:', email);
```

**Recommendation:** Avoid logging email addresses. Use user IDs or anonymized identifiers.

### 14. Recovery Codes Not Rate Limited
**File:** `server/core/auth/two-factor.service.ts`  
**Severity:** LOW  
**Description:** Recovery code validation doesn't have explicit rate limiting.

**Recommendation:** Implement strict rate limiting on recovery code attempts (max 3-5 per hour).

### 15. Security Event Log Size Limit
**File:** `server/middleware/advanced-security.ts` (Lines 40-43)  
**Severity:** LOW  
**Description:** Security events are limited to 10,000 entries in memory.

```typescript
if (this.events.length > this.MAX_EVENTS) {
  this.events = this.events.slice(-this.MAX_EVENTS);
}
```

**Recommendation:** Persist security events to database or external logging service for compliance and forensics.

---

## Positive Findings

The following security measures are properly implemented:

1. **bcrypt Password Hashing** - Uses 12 rounds (12-14 recommended) with bcryptjs
2. **Refresh Token Rotation** - Tokens are rotated on use and old tokens are revoked
3. **Helmet.js Integration** - Provides HTTP security headers (HSTS, X-Frame-Options, etc.)
4. **Input Validation with Zod** - Strong schema validation for user input
5. **Session Cookie Security** - httpOnly, secure, and sameSite flags properly set
6. **Two-Factor Authentication** - TOTP-based 2FA with recovery codes
7. **Rate Limiting** - Multi-tier rate limiting for different endpoint types
8. **Sensitive Field Filtering** - Password, token, secret fields filtered from logs
9. **WebSocket Authentication** - JWT-based authentication for WebSocket connections
10. **Production Environment Validation** - Configuration validation at startup

---

## Recommendations Summary

### Immediate Actions (Critical/High)
1. Remove hardcoded JWT secret fallback
2. Implement proper CSP without unsafe-inline/unsafe-eval
3. Enable CSRF protection in all environments
4. Move refresh tokens to HTTP-only cookies
5. Replace IP-based rate limit bypass with token authentication

### Short-term Actions (Medium)
1. Implement Redis session store for production
2. Replace regex-based injection detection with proper sanitization
3. Audit and restrict CORS patterns
4. Implement proper WAF at infrastructure level

### Long-term Improvements (Low)
1. Increase password minimum length
2. Implement security event persistence
3. Add rate limiting to recovery code validation
4. Review debug logging for sensitive data

---

## Compliance Notes

- **OWASP Top 10:** Partial compliance - address injection detection and authentication issues
- **GDPR:** Review data logging practices for PII exposure
- **PCI DSS:** Not applicable unless handling payment card data directly

---

*This audit covers static code analysis. Penetration testing and dynamic analysis are recommended for comprehensive security assessment.*
