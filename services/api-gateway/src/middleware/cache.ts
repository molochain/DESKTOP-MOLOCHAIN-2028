import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { gatewayConfig } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('cache');

let redis: Redis | null = null;

export async function initializeCache(): Promise<void> {
  try {
    redis = new Redis(gatewayConfig.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      lazyConnect: true
    });
    
    await redis.connect();
    logger.info('Cache initialized', { redis: gatewayConfig.redisUrl });
  } catch (error) {
    logger.warn('Cache initialization failed, running without cache', { 
      error: (error as Error).message 
    });
    redis = null;
  }
}

interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  methods?: string[];
  paths?: RegExp[];
}

const defaultOptions: CacheOptions = {
  ttl: 60,
  keyPrefix: 'gateway:cache:',
  methods: ['GET'],
  paths: []
};

function generateCacheKey(req: Request, prefix: string): string {
  const userId = (req as any).user?.id || 'anon';
  return `${prefix}${userId}:${req.method}:${req.originalUrl}`;
}

export function cacheMiddleware(options: CacheOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis || !opts.methods?.includes(req.method)) {
      return next();
    }
    
    if (opts.paths && opts.paths.length > 0) {
      const shouldCache = opts.paths.some(pattern => pattern.test(req.path));
      if (!shouldCache) {
        return next();
      }
    }
    
    const cacheKey = generateCacheKey(req, opts.keyPrefix!);
    
    try {
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        const data = JSON.parse(cached);
        logger.debug('Cache hit', { key: cacheKey });
        
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-TTL', String(await redis.ttl(cacheKey)));
        return res.status(data.status).json(data.body);
      }
      
      logger.debug('Cache miss', { key: cacheKey });
      res.set('X-Cache', 'MISS');
      
      const originalJson = res.json.bind(res);
      res.json = function(body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            status: res.statusCode,
            body
          };
          
          redis!.setex(cacheKey, opts.ttl!, JSON.stringify(cacheData)).catch((err: Error) => {
            logger.error('Cache write failed', { error: err.message });
          });
        }
        
        return originalJson(body);
      };
      
      next();
    } catch (error) {
      logger.error('Cache error', { error: (error as Error).message });
      next();
    }
  };
}

export async function invalidateCache(pattern: string): Promise<number> {
  if (!redis) return 0;
  
  try {
    const keys = await redis.keys(`${defaultOptions.keyPrefix}*${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info('Cache invalidated', { pattern, count: keys.length });
    }
    return keys.length;
  } catch (error) {
    logger.error('Cache invalidation failed', { error: (error as Error).message });
    return 0;
  }
}

export function getCacheStats(): { connected: boolean } {
  return {
    connected: redis !== null && redis.status === 'ready'
  };
}
