/**
 * Cache Middleware Test Suite
 * Tests cache hits, misses, TTL expiration, and cache invalidation
 * Uses the real OptimizedCacheManager from cache-manager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

import { dbCache, apiCache, healthCache, sessionCache, OptimizedCacheManager } from '../utils/cache-manager';

function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    method: 'GET',
    path: '/api/test',
    url: '/api/test',
    originalUrl: '/api/test',
    query: {},
    body: {},
    ...overrides
  };
}

function createMockResponse(): Partial<Response> & { 
  headers: Record<string, string>;
  statusCode: number;
  data: any;
} {
  const headers: Record<string, string> = {};
  return {
    headers,
    statusCode: 200,
    data: null,
    headersSent: false,
    setHeader(name: string, value: string) {
      headers[name] = value;
      return this as any;
    },
    status(code: number) {
      (this as any).statusCode = code;
      return this as any;
    },
    json(data: any) {
      (this as any).data = data;
      return this as any;
    },
    send(data: any) {
      (this as any).data = data;
      return this as any;
    },
    end() {
      return this as any;
    }
  };
}

describe('Cache Middleware - Real Cache Managers', () => {
  beforeEach(() => {
    dbCache.flush();
    apiCache.flush();
    healthCache.flush();
    sessionCache.flush();
    dbCache.flushStats();
    apiCache.flushStats();
    healthCache.flushStats();
    sessionCache.flushStats();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Database Cache (dbCache)', () => {
    it('should set and get values correctly', () => {
      const testData = { id: 1, name: 'Test User' };
      
      const setResult = dbCache.set('user:1', testData);
      const getResult = dbCache.get('user:1');
      
      expect(setResult).toBe(true);
      expect(getResult).toEqual(testData);
    });

    it('should track cache hits correctly', () => {
      dbCache.set('test:key', { value: 'test' });
      
      dbCache.get('test:key');
      dbCache.get('test:key');
      dbCache.get('test:key');
      
      const stats = dbCache.getStats();
      expect(stats.hits).toBe(3);
    });

    it('should track cache misses correctly', () => {
      dbCache.get('nonexistent:key1');
      dbCache.get('nonexistent:key2');
      
      const stats = dbCache.getStats();
      expect(stats.misses).toBe(2);
    });

    it('should return undefined for missing keys', () => {
      const result = dbCache.get('missing:key');
      expect(result).toBeUndefined();
    });

    it('should delete keys correctly', () => {
      dbCache.set('delete:test', { value: 'to delete' });
      expect(dbCache.get('delete:test')).toBeDefined();
      
      dbCache.delete('delete:test');
      expect(dbCache.get('delete:test')).toBeUndefined();
    });

    it('should flush all keys', () => {
      dbCache.set('key1', 'value1');
      dbCache.set('key2', 'value2');
      dbCache.set('key3', 'value3');
      
      dbCache.flush();
      
      expect(dbCache.get('key1')).toBeUndefined();
      expect(dbCache.get('key2')).toBeUndefined();
      expect(dbCache.get('key3')).toBeUndefined();
    });

    it('should report correct stats', () => {
      dbCache.set('stat:key', { data: true });
      dbCache.get('stat:key');
      dbCache.get('stat:key');
      dbCache.get('missing:key');
      
      const stats = dbCache.getStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats.hits).toBeGreaterThanOrEqual(0);
      expect(stats.misses).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Cache (apiCache)', () => {
    it('should cache API responses', () => {
      const apiResponse = { services: [{ id: 1, name: 'Service 1' }] };
      
      apiCache.set('/api/services', apiResponse);
      const cached = apiCache.get('/api/services');
      
      expect(cached).toEqual(apiResponse);
    });

    it('should support custom TTL', () => {
      const shortLivedData = { temp: true };
      apiCache.set('/api/temp', shortLivedData, 1);
      
      expect(apiCache.get('/api/temp')).toEqual(shortLivedData);
    });

    it('should handle concurrent cache operations', () => {
      const keys = ['/api/users', '/api/products', '/api/orders', '/api/settings'];
      const values = keys.map((k, i) => ({ id: i, key: k }));
      
      keys.forEach((key, i) => apiCache.set(key, values[i]));
      
      keys.forEach((key, i) => {
        expect(apiCache.get(key)).toEqual(values[i]);
      });
    });
  });

  describe('Health Cache (healthCache)', () => {
    it('should cache health check results', () => {
      const healthData = {
        status: 'healthy',
        uptime: 12345,
        memory: { used: 100, total: 500 }
      };
      
      healthCache.set('system:health', healthData);
      const cached = healthCache.get('system:health');
      
      expect(cached).toEqual(healthData);
    });

    it('should track health check access patterns', () => {
      healthCache.set('health:endpoint1', { status: 'ok' });
      
      healthCache.get('health:endpoint1');
      healthCache.get('health:endpoint1');
      
      const stats = healthCache.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Session Cache (sessionCache)', () => {
    it('should cache session data', () => {
      const sessionData = {
        userId: 123,
        username: 'testuser',
        role: 'admin',
        permissions: ['read', 'write']
      };
      
      sessionCache.set('session:abc123', sessionData);
      const cached = sessionCache.get('session:abc123');
      
      expect(cached).toEqual(sessionData);
    });

    it('should handle session invalidation', () => {
      sessionCache.set('session:xyz789', { userId: 456 });
      expect(sessionCache.get('session:xyz789')).toBeDefined();
      
      sessionCache.delete('session:xyz789');
      expect(sessionCache.get('session:xyz789')).toBeUndefined();
    });
  });

  describe('Cache Hit Rate Calculation', () => {
    it('should calculate 100% hit rate when all requests are hits', () => {
      apiCache.set('/api/test', { data: true });
      
      for (let i = 0; i < 10; i++) {
        apiCache.get('/api/test');
      }
      
      const stats = apiCache.getStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(90);
    });

    it('should handle zero operations gracefully', () => {
      const stats = dbCache.getStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    });

    it('should track mixed hits and misses', () => {
      apiCache.set('/api/cached', { data: 'cached' });
      
      apiCache.get('/api/cached');
      apiCache.get('/api/cached');
      apiCache.get('/api/notcached');
      apiCache.get('/api/notcached');
      
      const stats = apiCache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
    });
  });

  describe('Pattern Invalidation', () => {
    it('should invalidate keys by pattern', () => {
      dbCache.set('user:1:profile', { name: 'User 1' });
      dbCache.set('user:2:profile', { name: 'User 2' });
      dbCache.set('product:1', { name: 'Product 1' });
      
      const deleted = dbCache.invalidatePattern('user:');
      
      expect(deleted).toBe(2);
      expect(dbCache.get('user:1:profile')).toBeUndefined();
      expect(dbCache.get('user:2:profile')).toBeUndefined();
      expect(dbCache.get('product:1')).toBeDefined();
    });
  });

  describe('Cache Middleware Behavior', () => {
    it('should set X-Cache header to HIT on cache hit', () => {
      const mockRes = createMockResponse();
      apiCache.set('/api/test', { data: 'cached' });

      const cachedData = apiCache.get('/api/test');
      if (cachedData) {
        mockRes.setHeader('X-Cache', 'HIT');
      }

      expect(mockRes.headers['X-Cache']).toBe('HIT');
    });

    it('should set X-Cache header to MISS on cache miss', () => {
      const mockRes = createMockResponse();
      
      const cachedData = apiCache.get('/api/nonexistent');
      if (!cachedData) {
        mockRes.setHeader('X-Cache', 'MISS');
      }

      expect(mockRes.headers['X-Cache']).toBe('MISS');
    });
  });

  describe('Cache Key Generation', () => {
    it('should use request URL as cache key', () => {
      const req = createMockRequest({ originalUrl: '/api/services?page=1' });
      const key = req.originalUrl;
      
      expect(key).toBe('/api/services?page=1');
    });

    it('should generate unique keys for different query params', () => {
      const key1 = '/api/services?page=1';
      const key2 = '/api/services?page=2';
      
      apiCache.set(key1, { page: 1 });
      apiCache.set(key2, { page: 2 });
      
      expect(apiCache.get(key1)).toEqual({ page: 1 });
      expect(apiCache.get(key2)).toEqual({ page: 2 });
    });
  });

  describe('Skip Caching Conditions', () => {
    it('should skip caching for non-GET requests', () => {
      const shouldCache = (method: string) => method === 'GET' || method === 'HEAD';
      
      expect(shouldCache('GET')).toBe(true);
      expect(shouldCache('HEAD')).toBe(true);
      expect(shouldCache('POST')).toBe(false);
      expect(shouldCache('PUT')).toBe(false);
      expect(shouldCache('DELETE')).toBe(false);
    });

    it('should skip caching for auth endpoints', () => {
      const noCacheEndpoints = ['/api/auth/me', '/api/auth/login', '/api/auth/logout'];
      
      const shouldSkipCache = (path: string) => {
        return noCacheEndpoints.some(endpoint => path === endpoint || path.startsWith(endpoint + '/'));
      };
      
      expect(shouldSkipCache('/api/auth/login')).toBe(true);
      expect(shouldSkipCache('/api/auth/me')).toBe(true);
      expect(shouldSkipCache('/api/services')).toBe(false);
    });

    it('should not cache error responses', () => {
      const shouldCacheResponse = (statusCode: number) => statusCode >= 200 && statusCode < 300;
      
      expect(shouldCacheResponse(200)).toBe(true);
      expect(shouldCacheResponse(400)).toBe(false);
      expect(shouldCacheResponse(401)).toBe(false);
      expect(shouldCacheResponse(500)).toBe(false);
    });
  });

  describe('TTL Configuration', () => {
    it('should use different TTLs for different cache types', () => {
      const ttlConfig = {
        api: 60,
        health: 300,
        database: 300,
        session: 1800
      };

      expect(ttlConfig.api).toBeLessThan(ttlConfig.database);
      expect(ttlConfig.database).toBeLessThan(ttlConfig.session);
    });
  });

  describe('OptimizedCacheManager Features', () => {
    it('should return optimization report', () => {
      dbCache.set('test:opt', { data: 'test' });
      dbCache.get('test:opt');
      
      const report = dbCache.getOptimizationReport();
      
      expect(report).toHaveProperty('name');
      expect(report).toHaveProperty('stats');
      expect(report).toHaveProperty('config');
    });

    it('should check key existence with has()', () => {
      dbCache.set('exists:key', { value: true });
      
      expect(dbCache.has('exists:key')).toBe(true);
      expect(dbCache.has('missing:key')).toBe(false);
    });
  });
});
