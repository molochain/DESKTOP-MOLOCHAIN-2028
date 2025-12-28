import { Request, Response, NextFunction } from 'express';
import { apiCache, dbCache, healthCache, sessionCache } from '../utils/cache-manager';
import { logger } from '../utils/logger';
import crypto from 'crypto';

type CacheType = 'api' | 'database' | 'health' | 'session';

interface CacheOptions {
  type: CacheType;
  ttl?: number;
  keyGenerator?: (req: Request) => string;
}

// Generate cache key from request
function generateCacheKey(req: Request): string {
  const { method, url, query, body } = req;
  const data = {
    method,
    url,
    query,
    body: method === 'POST' ? body : undefined
  };
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

// Get the appropriate cache based on type
function getCache(type: CacheType) {
  switch (type) {
    case 'api':
      return apiCache;
    case 'database':
      return dbCache;
    case 'health':
      return healthCache;
    case 'session':
      return sessionCache;
    default:
      return apiCache;
  }
}

// Cache interceptor middleware
export function cacheInterceptor(options: CacheOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests by default
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const cache = getCache(options.type);
    const key = options.keyGenerator ? options.keyGenerator(req) : req.originalUrl || req.url;
    const ttl = options.ttl || 60; // Default 60 seconds

    // Enhanced logging for debugging
    logger.info(`[CACHE] Checking ${options.type} cache for path: ${req.path}, key: ${key}`);

    try {
      // Try to get from cache
      const cachedData = cache.get(key);
      
      if (cachedData !== undefined && cachedData !== null) {
        // Cache hit!
        logger.info(`[CACHE] HIT for ${options.type}: ${key}`);
        
        // Send cached response
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Type', options.type);
        res.setHeader('X-Cache-Key', key);
        
        // Handle different data types
        if (typeof cachedData === 'string') {
          return res.send(cachedData);
        } else {
          return res.json(cachedData);
        }
      }

      // Cache miss
      logger.info(`[CACHE] MISS for ${options.type}: ${key}`);

      // Store original send methods
      const originalSend = res.send.bind(res);
      const originalJson = res.json.bind(res);
      const originalEnd = res.end.bind(res);
      
      // Track if we've already cached to avoid duplicates
      let hasCached = false;

      // Helper function to cache the response
      const cacheResponse = (data: any) => {
        if (!hasCached && res.statusCode >= 200 && res.statusCode < 300) {
          const success = cache.set(key, data, ttl);
          logger.info(`[CACHE] STORED ${options.type}: ${key} (TTL: ${ttl}s, success: ${success})`);
          hasCached = true;
          
          // Immediately verify the cache was stored
          const verification = cache.get(key);
          if (verification === undefined || verification === null) {
            logger.error(`[CACHE] VERIFICATION FAILED for ${key} - data not stored!`);
          } else {
            logger.info(`[CACHE] VERIFIED storage of ${key}`);
          }
        } else if (res.statusCode >= 400) {
          logger.debug(`[CACHE] Not caching error response (status: ${res.statusCode})`);
        }
      };

      // Override send method to cache the response
      res.send = function(data: any): Response {
        logger.debug(`[CACHE] res.send called for ${key}`);
        cacheResponse(data);
        // Only set headers if they haven't been sent yet
        if (!res.headersSent) {
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-Type', options.type);
          res.setHeader('X-Cache-Key', key);
        }
        return originalSend(data);
      };

      // Override json method to cache the response
      res.json = function(data: any): Response {
        logger.debug(`[CACHE] res.json called for ${key}`);
        cacheResponse(data);
        // Only set headers if they haven't been sent yet
        if (!res.headersSent) {
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-Type', options.type);
          res.setHeader('X-Cache-Key', key);
        }
        return originalJson(data);
      };
      
      // Override end method to catch other response types
      res.end = function(chunk?: any, encoding?: any): Response {
        logger.debug(`[CACHE] res.end called for ${key}`);
        // If chunk has data and we haven't cached yet, cache it
        if (chunk && !hasCached && res.statusCode >= 200 && res.statusCode < 300) {
          const success = cache.set(key, chunk, ttl);
          logger.info(`[CACHE] STORED via end() ${options.type}: ${key} (TTL: ${ttl}s, success: ${success})`);
          hasCached = true;
        }
        // Only set headers if they haven't been sent yet
        if (!res.headersSent) {
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('X-Cache-Type', options.type);
          res.setHeader('X-Cache-Key', key);
        }
        return originalEnd.call(res, chunk, encoding);
      };

      next();
    } catch (error) {
      logger.error(`[CACHE] Interceptor error for ${options.type}`, error);
      // Continue without caching on error
      next();
    }
  };
}

// Database query cache helper
export function cacheQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cache = dbCache;
  const key = `query:${queryName}`;
  
  // Check cache first
  const cached = cache.get(key) as T | undefined;
  if (cached !== undefined && cached !== null) {
    // The get() method already tracked the hit internally
    logger.debug(`Database query cache HIT: ${queryName}`);
    return Promise.resolve(cached);
  }
  
  // Cache miss - the get() method already tracked the miss internally
  logger.debug(`Database query cache MISS: ${queryName}`);
  
  // Execute query and cache result
  return queryFn().then(result => {
    cache.set(key, result, ttl);
    return result;
  });
}

// Clear cache for specific patterns
export function invalidateCache(pattern: string, type: CacheType = 'api') {
  const cache = getCache(type);
  let count = 0;
  
  // Get all keys and remove matching ones
  const stats = cache.getStats();
  logger.info(`Invalidating cache for pattern: ${pattern} in ${type} cache`);
  
  // Since we can't iterate keys directly, we'll need to track them separately
  // For now, just clear the specific key if it's an exact match
  if (cache.get(pattern) !== undefined) {
    cache.delete(pattern);
    count++;
  }
  
  logger.info(`Invalidated ${count} cache entries`);
  return count;
}

// Middleware to automatically cache common endpoints
export function autoCacheMiddleware() {
  const cacheConfigs: { [key: string]: CacheOptions } = {
    // Core API endpoints
    '/api': { type: 'api', ttl: 30 },
    '/api/health': { type: 'health', ttl: 10 },
    
    // Services - high traffic, stable data
    '/api/services': { type: 'api', ttl: 300 },
    '/api/services/count': { type: 'api', ttl: 300 },
    '/api/modules/count': { type: 'api', ttl: 300 },
    
    // CMS endpoints - frequently accessed
    '/api/cms': { type: 'api', ttl: 120 },
    '/api/cms/menu': { type: 'api', ttl: 300 },
    '/api/cms/home-sections': { type: 'api', ttl: 120 },
    '/api/cms/settings': { type: 'api', ttl: 300 },
    '/api/cms/services': { type: 'api', ttl: 300 },
    '/api/cms/pages': { type: 'api', ttl: 120 },
    
    // Supply chain - moderate TTL
    '/api/supply-chain/metrics': { type: 'api', ttl: 60 },
    '/api/supply-chain/heatmap': { type: 'api', ttl: 30 },
    
    // Page modules - long TTL
    '/api/page-modules': { type: 'api', ttl: 600 },
    
    // Analytics - cache for performance
    '/api/instagram/analytics': { type: 'api', ttl: 120 },
    '/api/blockchain/metrics': { type: 'api', ttl: 60 },
    
    // External status - frequently polled
    '/api/external-status': { type: 'api', ttl: 30 },
    
    // Guides and documentation - public endpoints only
    '/api/guides': { type: 'api', ttl: 600 },
    
    // NOTE: DO NOT cache /api/projects or /api/partners - these are authenticated 
    // endpoints that return user-specific data. Caching them would cause data leakage.
  };
  
  // Auth and API key protected endpoints should NEVER be cached - authentication state can change at any time
  // These endpoints return user-specific data or modify state
  const noCacheEndpoints = [
    '/api/auth/me', '/api/auth/login', '/api/auth/logout', '/api/auth/register',
    '/api/email/send', '/api/email/form-types', '/api/email/notify-submission',
    '/api/admin/email',
    '/api/projects', // User-specific project data
    '/api/partners', // User-specific partner data  
    '/api/admin',    // All admin routes
    '/api/user',     // User profile data
    '/api/dashboard' // User-specific dashboard data
  ];
  
  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    
    // Log every /api request to understand what's happening
    if (path.startsWith('/api')) {
      logger.debug(`[AutoCache] Request for path: ${path}`);
    }
    
    // Skip caching for authentication endpoints - auth state can change at any time
    if (noCacheEndpoints.some(endpoint => path === endpoint || path.startsWith(endpoint + '/'))) {
      logger.debug(`[AutoCache] Skipping cache for auth endpoint: ${path}`);
      return next();
    }
    
    // Check for exact match first
    if (cacheConfigs[path]) {
      logger.info(`[AutoCache] Exact match found for ${path}`);
      return cacheInterceptor(cacheConfigs[path])(req, res, next);
    }
    
    // Then check for prefix matches (longest match first)
    const sortedPatterns = Object.keys(cacheConfigs)
      .filter(pattern => pattern !== path && path.startsWith(pattern))
      .sort((a, b) => b.length - a.length);
    
    if (sortedPatterns.length > 0) {
      const pattern = sortedPatterns[0];
      logger.info(`[AutoCache] Prefix match found for ${path} using pattern ${pattern}`);
      return cacheInterceptor(cacheConfigs[pattern])(req, res, next);
    }
    
    // No caching for this path
    if (path.startsWith('/api')) {
      logger.debug(`[AutoCache] No cache config for ${path}`);
    }
    next();
  };
}