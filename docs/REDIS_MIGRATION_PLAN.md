# Redis Migration Plan: Rate Limiting for External API Keys

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Status | Proposed |
| Author | Platform Engineering |
| Created | December 2024 |
| Target Completion | Q1 2025 |

---

## Executive Summary

This document outlines the migration plan for transitioning the External API Key rate limiting system from an in-memory cache to Redis-backed storage. This migration addresses critical scalability and reliability issues in our current implementation.

---

## 1. Current State Analysis

### 1.1 Current Implementation

**File:** `server/middleware/external-api-auth.ts`

The current rate limiting implementation uses an in-memory `Map` object:

```typescript
// Current implementation
const rateLimitCache = new Map<number, { count: number; resetAt: number }>();

// Rate limit check in authenticateApiKey function
const now = Date.now();
let rateInfo = rateLimitCache.get(keyRecord.id);

if (!rateInfo || now > rateInfo.resetAt) {
  rateInfo = {
    count: 0,
    resetAt: now + (keyRecord.rateLimitWindow || 3600) * 1000,
  };
}

rateInfo.count++;

if (rateInfo.count > (keyRecord.rateLimit || 1000)) {
  // Return 429 Too Many Requests
}

rateLimitCache.set(keyRecord.id, rateInfo);
```

### 1.2 Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Current Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐         ┌──────────────┐                 │
│   │   Instance   │         │   Instance   │                 │
│   │      A       │         │      B       │                 │
│   │ ┌──────────┐ │         │ ┌──────────┐ │                 │
│   │ │ Memory   │ │         │ │ Memory   │ │                 │
│   │ │ Cache    │ │         │ │ Cache    │ │                 │
│   │ └──────────┘ │         │ └──────────┘ │                 │
│   └──────────────┘         └──────────────┘                 │
│          ↓                        ↓                          │
│   ┌──────────────────────────────────────────────┐          │
│   │                PostgreSQL                     │          │
│   │  (Usage logs only - no rate limit state)     │          │
│   └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Problem Statement

### 2.1 Critical Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| **Cache Not Shared** | Each instance maintains its own rate limit counter. An API key limited to 1000 req/hour could actually make 1000 × N requests where N = number of instances | Critical |
| **Lost on Restart** | Rate limit counters reset when the server restarts, allowing burst abuse | High |
| **No Horizontal Scaling** | Adding instances weakens rate limiting proportionally | Critical |
| **PM2 Cluster Issues** | PM2 cluster mode (multiple workers) creates multiple independent caches | High |

### 2.2 Risk Scenarios

1. **Abuse Vector**: An attacker can hit different instances to bypass rate limits
2. **Deploy Bypass**: Rate limits reset after every deployment
3. **Resource Exhaustion**: Uncontrolled API usage can overwhelm backend services
4. **Billing Issues**: Customers may exceed paid tiers without enforcement

---

## 3. Proposed Solution

### 3.1 Redis-Backed Rate Limiting

Replace the in-memory `Map` with Redis, using atomic operations for accurate counting across all instances.

### 3.2 Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Target Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐         ┌──────────────┐                 │
│   │   Instance   │         │   Instance   │                 │
│   │      A       │         │      B       │                 │
│   └──────┬───────┘         └──────┬───────┘                 │
│          │                        │                          │
│          └────────────┬───────────┘                          │
│                       ↓                                      │
│          ┌────────────────────────┐                          │
│          │        Redis           │                          │
│          │  (Shared Rate Limits)  │                          │
│          │                        │                          │
│          │  Key: ratelimit:123    │                          │
│          │  Val: {count, resetAt} │                          │
│          └────────────────────────┘                          │
│                       ↓                                      │
│   ┌──────────────────────────────────────────────┐          │
│   │                PostgreSQL                     │          │
│   │           (Usage logs, key metadata)          │          │
│   └──────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Algorithm: Sliding Window with Fixed Window Fallback

We'll implement a **sliding window** algorithm using Redis sorted sets for precision, with a **fixed window** fallback for simplicity:

**Option A: Fixed Window (Simpler)**
```
Key: ratelimit:{keyId}:{windowStart}
TTL: rateLimitWindow + 60 seconds
```

**Option B: Sliding Window Log (More Accurate)**
```
Key: ratelimit:{keyId}
Type: Sorted Set (ZSET)
Members: Request timestamps
```

Recommendation: Start with **Fixed Window** for simplicity, migrate to **Sliding Window** if needed.

---

## 4. Implementation Steps

### 4.1 Phase 1: Redis Setup (Week 1)

#### 4.1.1 Install Redis Dependency

```bash
npm install ioredis
npm install @types/ioredis --save-dev
```

#### 4.1.2 Create Redis Client Module

**File:** `server/core/cache/redis.ts`

```typescript
import Redis from 'ioredis';
import { logger } from '../../utils/logger';

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  await redisClient.connect();
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export { redisClient };
```

### 4.2 Phase 2: Rate Limiter Service (Week 1-2)

#### 4.2.1 Create Rate Limiter Service

**File:** `server/core/cache/rate-limiter.ts`

```typescript
import { getRedisClient } from './redis';
import { logger } from '../../utils/logger';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  current: number;
  limit: number;
}

export async function checkRateLimit(
  keyId: number,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redis = await getRedisClient();
  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / windowSeconds) * windowSeconds;
  const redisKey = `ratelimit:${keyId}:${windowStart}`;

  try {
    // Atomic increment with TTL
    const multi = redis.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, windowSeconds + 60); // Extra 60s buffer
    const results = await multi.exec();

    const count = results?.[0]?.[1] as number || 0;
    const resetAt = (windowStart + windowSeconds) * 1000;

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt,
      current: count,
      limit,
    };
  } catch (error) {
    logger.error('Redis rate limit check failed:', error);
    // Fallback: allow request but log warning
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowSeconds * 1000,
      current: 0,
      limit,
    };
  }
}

export async function getRateLimitInfo(
  keyId: number,
  windowSeconds: number
): Promise<RateLimitResult | null> {
  const redis = await getRedisClient();
  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / windowSeconds) * windowSeconds;
  const redisKey = `ratelimit:${keyId}:${windowStart}`;

  try {
    const count = await redis.get(redisKey);
    if (!count) return null;

    return {
      allowed: true,
      remaining: 0,
      resetAt: (windowStart + windowSeconds) * 1000,
      current: parseInt(count),
      limit: 0,
    };
  } catch (error) {
    logger.error('Failed to get rate limit info:', error);
    return null;
  }
}

export async function resetRateLimit(keyId: number): Promise<void> {
  const redis = await getRedisClient();
  const pattern = `ratelimit:${keyId}:*`;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Failed to reset rate limit:', error);
  }
}
```

### 4.3 Phase 3: Middleware Migration (Week 2)

#### 4.3.1 Update External API Auth Middleware

**File:** `server/middleware/external-api-auth.ts` (modified sections)

```typescript
import { checkRateLimit } from '../core/cache/rate-limiter';
import { logger } from '../utils/logger';

// Feature flag for gradual rollout
const USE_REDIS_RATE_LIMIT = process.env.FEATURE_REDIS_RATE_LIMIT === 'true';

// Keep in-memory cache as fallback
const rateLimitCache = new Map<number, { count: number; resetAt: number }>();

async function checkRateLimitWithFallback(
  keyId: number,
  limit: number,
  windowSeconds: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  if (USE_REDIS_RATE_LIMIT) {
    try {
      const result = await checkRateLimit(keyId, limit, windowSeconds);
      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetAt: result.resetAt,
      };
    } catch (error) {
      logger.warn('Redis rate limit failed, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const now = Date.now();
  let rateInfo = rateLimitCache.get(keyId);

  if (!rateInfo || now > rateInfo.resetAt) {
    rateInfo = {
      count: 0,
      resetAt: now + windowSeconds * 1000,
    };
  }

  rateInfo.count++;
  rateLimitCache.set(keyId, rateInfo);

  return {
    allowed: rateInfo.count <= limit,
    remaining: Math.max(0, limit - rateInfo.count),
    resetAt: rateInfo.resetAt,
  };
}

// In authenticateApiKey function, replace rate limit logic:
export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // ... existing code up to rate limit check ...

  // NEW: Use checkRateLimitWithFallback
  const rateCheck = await checkRateLimitWithFallback(
    keyRecord.id,
    keyRecord.rateLimit || 1000,
    keyRecord.rateLimitWindow || 3600
  );

  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
    res.setHeader('X-RateLimit-Limit', keyRecord.rateLimit || 1000);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateCheck.resetAt / 1000));
    res.setHeader('Retry-After', retryAfter);

    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
      retryAfter,
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', keyRecord.rateLimit || 1000);
  res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(rateCheck.resetAt / 1000));

  // ... rest of function ...
}
```

### 4.4 Phase 4: Testing & Validation (Week 2-3)

#### 4.4.1 Unit Tests

```typescript
// server/tests/rate-limiter.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../core/cache/rate-limiter';

describe('Redis Rate Limiter', () => {
  const testKeyId = 99999;

  beforeEach(async () => {
    await resetRateLimit(testKeyId);
  });

  afterEach(async () => {
    await resetRateLimit(testKeyId);
  });

  it('should allow requests within limit', async () => {
    const result = await checkRateLimit(testKeyId, 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should block requests exceeding limit', async () => {
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(testKeyId, 10, 60);
    }
    const result = await checkRateLimit(testKeyId, 10, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should share limit across calls', async () => {
    await checkRateLimit(testKeyId, 10, 60);
    await checkRateLimit(testKeyId, 10, 60);
    const result = await checkRateLimit(testKeyId, 10, 60);
    expect(result.current).toBe(3);
    expect(result.remaining).toBe(7);
  });
});
```

#### 4.4.2 Integration Tests

```typescript
// server/tests/e2e/rate-limit-redis.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Redis Rate Limiting E2E', () => {
  it('should enforce rate limits across multiple requests', async () => {
    const apiKey = 'test_key';
    const apiSecret = 'test_secret';

    // Make requests up to the limit
    for (let i = 0; i < 100; i++) {
      const res = await request(app)
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${apiKey}:${apiSecret}`);
      
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    }

    // Next request should be rate limited
    const limitedRes = await request(app)
      .get('/api/v1/services')
      .set('Authorization', `Bearer ${apiKey}:${apiSecret}`);

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.headers['retry-after']).toBeDefined();
  });
});
```

### 4.5 Phase 5: Deployment (Week 3)

#### 4.5.1 Environment Configuration

```bash
# Production environment variables
REDIS_URL=redis://localhost:6379
FEATURE_REDIS_RATE_LIMIT=true
```

#### 4.5.2 Deployment Checklist

- [ ] Redis service running on production server
- [ ] `REDIS_URL` environment variable configured
- [ ] Feature flag `FEATURE_REDIS_RATE_LIMIT=false` (initial)
- [ ] Deploy new code
- [ ] Monitor error rates for 24 hours
- [ ] Enable feature flag: `FEATURE_REDIS_RATE_LIMIT=true`
- [ ] Monitor Redis metrics for 48 hours
- [ ] Remove fallback code after 2 weeks stability

---

## 5. Rollback Strategy

### 5.1 Immediate Rollback (< 1 minute)

Set environment variable and restart:

```bash
# Via PM2
pm2 set FEATURE_REDIS_RATE_LIMIT false
pm2 restart all

# Or direct
export FEATURE_REDIS_RATE_LIMIT=false
pm2 restart rest-express
```

### 5.2 Code Rollback

```bash
# Revert to previous version
git revert HEAD
npm run build
pm2 restart rest-express
```

### 5.3 Rollback Indicators

Trigger rollback if any of these occur:
- Redis connection errors > 1% of requests
- 5xx error rate increases by > 50%
- Average response time increases by > 200ms
- Redis memory usage > 80%

---

## 6. Testing Checklist

### 6.1 Pre-Deployment

- [ ] Unit tests pass for rate-limiter service
- [ ] Integration tests pass in staging
- [ ] Redis connection resilience tested (disconnect/reconnect)
- [ ] Fallback to in-memory verified
- [ ] Load testing completed (1000 req/s)
- [ ] Memory profiling shows no leaks

### 6.2 Post-Deployment (Feature Flag OFF)

- [ ] Application starts without errors
- [ ] In-memory rate limiting still works
- [ ] Redis connection established (check logs)
- [ ] No increase in error rates

### 6.3 Post-Deployment (Feature Flag ON)

- [ ] Rate limits enforced correctly
- [ ] X-RateLimit headers present
- [ ] 429 responses for exceeded limits
- [ ] Counters shared across instances
- [ ] Counters persist across restarts
- [ ] Redis memory usage acceptable

### 6.4 Stress Testing

- [ ] 100 concurrent requests to same API key
- [ ] Multiple API keys simultaneously
- [ ] Redis failover scenario
- [ ] PM2 cluster mode with 4 workers

---

## 7. Monitoring & Alerts

### 7.1 Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Redis connection success rate | > 99.9% | < 99% |
| Redis operation latency (p99) | < 5ms | > 20ms |
| Rate limit checks/second | Varies | N/A |
| Fallback to memory rate | 0% | > 1% |
| 429 response rate | Varies | > 10% |

### 7.2 Grafana Dashboard Queries

```promql
# Redis connection status
redis_connected_clients{instance="production"}

# Rate limit operations per second
rate(rate_limit_checks_total[5m])

# Fallback rate
rate(rate_limit_fallback_total[5m]) / rate(rate_limit_checks_total[5m])
```

---

## 8. Future Improvements

After successful migration, consider:

1. **Sliding Window Algorithm**: More accurate rate limiting at window boundaries
2. **Distributed Rate Limiting**: Consider Redis Cluster for high availability
3. **Dynamic Rate Limits**: Adjust limits based on load
4. **Rate Limit Dashboard**: Real-time visibility into rate limit usage
5. **Quota Alerts**: Notify API key owners when approaching limits

---

## 9. Appendix

### 9.1 Redis Commands Reference

```bash
# Check rate limit keys
redis-cli KEYS "ratelimit:*"

# Get specific key value
redis-cli GET "ratelimit:123:1703980800"

# Check TTL
redis-cli TTL "ratelimit:123:1703980800"

# Monitor rate limit operations
redis-cli MONITOR | grep ratelimit

# Flush all rate limits (emergency)
redis-cli KEYS "ratelimit:*" | xargs redis-cli DEL
```

### 9.2 Troubleshooting

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| Rate limits not enforced | Feature flag off | Check `FEATURE_REDIS_RATE_LIMIT` |
| All requests allowed | Redis connection failed | Check logs, verify `REDIS_URL` |
| Inconsistent counts | Clock skew between instances | Sync NTP, use Redis server time |
| High latency | Network issues | Check Redis ping latency |

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author | Platform Engineering | Dec 2024 | ✓ |
| Reviewer | | | |
| Approver | | | |
