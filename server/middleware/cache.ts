import { Request, Response, NextFunction } from 'express';
import { cacheService, CacheType } from '../core/cache/cache.service';
import { logger } from '../utils/logger';

/**
 * Cache key generator types
 */
type CacheKeyFn = (req: Request) => string;

/**
 * Cache middleware options
 */
interface CacheOptions {
  ttl?: number;                 // Time to live in seconds
  type: CacheType;              // Type of data being cached
  keyParam?: string;            // Request parameter to use as key
  keyFn?: CacheKeyFn;           // Custom function to generate cache key
  condition?: (req: Request) => boolean; // Optional condition to determine if caching should be applied
}

/**
 * Middleware to cache API responses
 * - Uses the cache service to store and retrieve cached data
 * - Supports custom key generation and conditional caching
 */
export function cacheMiddleware(options: CacheOptions) {
  const { ttl, type, keyParam, keyFn, condition } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Apply condition if provided
    if (condition && !condition(req)) {
      return next();
    }

    try {
      // Generate cache key based on options
      let cacheKey: string;
      
      if (keyFn) {
        // Use custom function to generate key
        cacheKey = keyFn(req);
      } else if (keyParam) {
        // Use specified parameter as key
        const paramValue = req.params[keyParam] || req.query[keyParam];
        cacheKey = typeof paramValue === 'string' ? paramValue : String(paramValue);
        
        if (!cacheKey) {
          logger.warn('Cache key parameter not found', { 
            type, 
            keyParam, 
            params: req.params, 
            query: req.query 
          });
          return next();
        }
      } else {
        // Default to URL path as key
        cacheKey = req.originalUrl || req.url;
      }

      // Check if we have cached data
      const cachedData = cacheService.getLegacy(type, cacheKey);
      
      if (cachedData !== undefined) {
        // Add cache header for debugging
        res.setHeader('X-Cache', 'HIT');
        
        // Return cached data
        return res.json(cachedData);
      }

      // Cache miss, continue to route handler
      res.setHeader('X-Cache', 'MISS');

      // Intercept the response to cache it before sending
      const originalJson = res.json;
      res.json = function(body) {
        // Store in cache if status is success
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.setLegacy(type, cacheKey, body, ttl);
        }
        
        // Restore original json method and call it
        res.json = originalJson;
        return res.json(body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error', { error, path: req.path });
      next();
    }
  };
}

/**
 * Middleware to invalidate cache for specific data types
 * - Used after POST/PUT/DELETE operations to keep cache fresh
 */
export function invalidateCacheMiddleware(type: CacheType, getId?: (req: Request) => string | number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original end/json methods
    const originalEnd = res.end;
    const originalJson = res.json;
    
    // Override end method to invalidate cache after response is sent
    res.end = function(this: Response, ...args: any[]) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // If getId function is provided, invalidate specific item
          if (getId) {
            const id = getId(req);
            if (id) {
              cacheService.deleteLegacy(type, id);
              logger.debug(`Invalidated cache for ${type}:${String(id)}`);
            }
          } else {
            // Otherwise, invalidate entire cache type
            cacheService.clearType(type);
            logger.debug(`Invalidated all ${type} cache`);
          }
        } catch (error) {
          logger.error('Error invalidating cache', { type, error });
        }
      }
      
      // Restore original end method and call it with the original arguments
      res.end = originalEnd;
      return originalEnd.apply(this, args);
    };
    
    // Override json method for the same reason
    res.json = function(this: Response, body: any) {
      // Restore original json method
      res.json = originalJson;
      return res.json(body);  // This will eventually call res.end
    };
    
    next();
  };
}