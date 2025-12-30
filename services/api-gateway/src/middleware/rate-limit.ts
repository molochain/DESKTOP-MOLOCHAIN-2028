import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory, RateLimiterAbstract } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { gatewayConfig, ServiceConfig } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';
import { AuthenticatedRequest } from './auth.js';

const logger = createLoggerWithContext('rate-limit');

let redis: Redis | null = null;
const rateLimiters: Map<string, RateLimiterAbstract> = new Map();

export async function initializeRateLimiter(): Promise<void> {
  try {
    redis = new Redis(gatewayConfig.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
      lazyConnect: true
    });
    
    await redis.connect();
    logger.info('Redis connected for rate limiting');
  } catch (error) {
    logger.warn('Redis connection failed, using in-memory rate limiting', {
      error: (error as Error).message
    });
    redis = null;
  }
}

export function createRateLimiter(service: ServiceConfig): RateLimiterAbstract {
  const existing = rateLimiters.get(service.name);
  if (existing) return existing;
  
  const config = {
    points: service.rateLimit?.points || 1000,
    duration: service.rateLimit?.duration || 3600,
    keyPrefix: `rl:${service.name}`
  };
  
  let limiter: RateLimiterAbstract;
  
  if (redis) {
    limiter = new RateLimiterRedis({
      storeClient: redis,
      ...config
    });
  } else {
    limiter = new RateLimiterMemory(config);
  }
  
  rateLimiters.set(service.name, limiter);
  return limiter;
}

export function rateLimitMiddleware(service: ServiceConfig) {
  const limiter = createRateLimiter(service);
  
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.apiKey?.id?.toString() || 
                req.user?.id?.toString() || 
                req.ip || 
                'anonymous';
    
    try {
      const result = await limiter.consume(key, 1);
      
      res.setHeader('X-RateLimit-Limit', service.rateLimit?.points || 1000);
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.msBeforeNext / 1000));
      
      next();
    } catch (error: any) {
      if (error.remainingPoints !== undefined) {
        res.setHeader('X-RateLimit-Limit', service.rateLimit?.points || 1000);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(error.msBeforeNext / 1000));
        res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000));
        
        logger.warn('Rate limit exceeded', {
          service: service.name,
          key,
          path: req.path
        });
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil(error.msBeforeNext / 1000)
        });
      }
      
      logger.error('Rate limiter error', { error: error.message });
      next();
    }
  };
}
