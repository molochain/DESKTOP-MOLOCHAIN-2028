/**
 * Services Platform v1 Rate Limiter
 * Endpoint-specific rate limiting with tiered limits
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../../../utils/logger';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}

function createRateLimitHandler(limitType: string) {
  return (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const user = req.user as { id?: number } | undefined;
    
    logger.warn('Rate limit exceeded', {
      context: 'services-v1-rate-limiter',
      limitType,
      ip,
      userId: user?.id,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded for ${limitType}`,
      code: 'SERVICES_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    });
  };
}

function createRateLimiter(config: RateLimitConfig, limitType: string) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: config.keyGenerator || ((req: Request) => {
      return req.ip || req.socket.remoteAddress || 'unknown';
    }),
    handler: createRateLimitHandler(limitType),
    skip: (req: Request) => {
      return req.path === '/health' || req.path === '/ready';
    },
  });
}

/**
 * Public endpoints rate limiter
 * Applies to: catalog, categories, search
 * Limit: 100 requests per minute per IP
 */
export const publicEndpointsLimiter = createRateLimiter(
  {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 100,
    message: 'Too many requests to public endpoints',
  },
  'public-endpoints'
);

/**
 * Single service endpoint rate limiter
 * Applies to: individual service lookup
 * Limit: 200 requests per minute per IP
 */
export const singleServiceLimiter = createRateLimiter(
  {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 200,
    message: 'Too many requests for service details',
  },
  'single-service'
);

/**
 * Delta sync rate limiter (mobile)
 * Applies to: sync/delta endpoint
 * Limit: 30 requests per minute per IP
 */
export const deltaSyncLimiter = createRateLimiter(
  {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 30,
    message: 'Too many sync requests',
  },
  'delta-sync'
);

/**
 * Admin endpoints rate limiter
 * Applies to: admin override endpoints
 * Limit: 20 requests per minute per user
 */
export const adminEndpointsLimiter = createRateLimiter(
  {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 20,
    message: 'Too many admin requests',
    keyGenerator: (req: Request) => {
      const user = req.user as { id?: number } | undefined;
      if (user?.id) {
        return `user:${user.id}`;
      }
      return req.ip || req.socket.remoteAddress || 'unknown';
    },
  },
  'admin-endpoints'
);

/**
 * Availability check rate limiter
 * Applies to: availability endpoint
 * Limit: 60 requests per minute per IP
 */
export const availabilityLimiter = createRateLimiter(
  {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 60,
    message: 'Too many availability check requests',
  },
  'availability'
);

/**
 * Webhook endpoints rate limiter
 * Applies to: webhook handlers
 * Limit: 50 requests per minute per IP
 */
export const webhookLimiter = createRateLimiter(
  {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 50,
    message: 'Too many webhook requests',
  },
  'webhooks'
);

export const servicesRateLimiters = {
  public: publicEndpointsLimiter,
  singleService: singleServiceLimiter,
  deltaSync: deltaSyncLimiter,
  admin: adminEndpointsLimiter,
  availability: availabilityLimiter,
  webhooks: webhookLimiter,
};
