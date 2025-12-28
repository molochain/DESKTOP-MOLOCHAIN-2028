import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { db } from '../db';
import { apiKeys, rateLimitOverrides, securityAudits } from '@db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';

// Store for tracking rate limits per user and IP
const userRateLimitStore = new Map<string, { count: number; resetTime: number }>();
const ipRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// API Key rate limit store
const apiKeyRateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
  skip?: (req: Request) => boolean;
}

// Enhanced key generator that considers user ID, IP, and API key
export const enhancedKeyGenerator = (req: Request): string => {
  const user = (req as any).user;
  const apiKey = req.headers['x-api-key'] as string;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (apiKey) return `api:${apiKey}`;
  if (user?.id) return `user:${user.id}:${ip}`;
  return `ip:${ip}`;
};

// Check for custom rate limit overrides from database
export const checkRateLimitOverrides = async (key: string): Promise<number | null> => {
  try {
    const [override] = await db
      .select()
      .from(rateLimitOverrides)
      .where(
        and(
          eq(rateLimitOverrides.identifier, key),
          eq(rateLimitOverrides.isActive, true),
          gt(rateLimitOverrides.expiresAt, new Date())
        )
      )
      .limit(1);
    
    return override?.maxRequests || null;
  } catch (error) {
    logger.error('Error checking rate limit overrides:', error);
    return null;
  }
};

// Log security events to audit table
export const logSecurityAudit = async (
  eventType: string,
  userId: number | null,
  ip: string,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
) => {
  try {
    await db.insert(securityAudits).values({
      eventType,
      userId,
      ipAddress: ip,
      userAgent: details.userAgent || null,
      requestPath: details.path || null,
      requestMethod: details.method || null,
      statusCode: details.statusCode || null,
      details: JSON.stringify(details),
      severity,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error logging security audit:', error);
  }
};

// Skip function for internal and health check requests
const skipInternalRequests = (req: Request): boolean => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const path = req.path || req.url || '';
  const method = req.method || '';
  const userAgent = req.headers['user-agent'] || '';
  
  // Skip for localhost/internal IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
    return true;
  }
  
  // Skip for health checks and system endpoints
  if (path === '/health' || path === '/api/health' || path === '/status' || path === '/metrics') {
    return true;
  }
  
  // Skip for WebSocket upgrade requests
  if (req.headers.upgrade === 'websocket' || path.startsWith('/ws/')) {
    return true;
  }
  
  // Skip for HEAD requests that look like health checks
  if (method === 'HEAD' && (path === '/' || path === '/api' || path.startsWith('/api/'))) {
    return true;
  }
  
  // Skip for internal monitoring tools
  if (userAgent.includes('health-check') || userAgent.includes('monitor') || userAgent.includes('probe')) {
    return true;
  }
  
  return false;
};

// Create enhanced rate limiter with user/IP tracking
export const createEnhancedRateLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs || 60000, // 1 minute default
    max: async (req: Request) => {
      const key = config.keyGenerator ? config.keyGenerator(req) : enhancedKeyGenerator(req);
      
      // Check for custom overrides
      const override = await checkRateLimitOverrides(key);
      if (override !== null) return override;
      
      // Different limits based on user type
      const user = (req as any).user;
      if (user?.role === 'admin') return config.maxRequests * 3;
      if (user?.role === 'premium') return config.maxRequests * 2;
      
      return config.maxRequests;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: config.keyGenerator || enhancedKeyGenerator,
    skip: (req: Request) => {
      // Use custom skip function if provided, otherwise use internal skip logic
      if (config.skip && config.skip(req)) return true;
      return skipInternalRequests(req);
    },
    handler: async (req: Request, res: Response) => {
      const user = (req as any).user;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Log rate limit violation
      await logSecurityAudit(
        'RATE_LIMIT_EXCEEDED',
        user?.id || null,
        ip,
        {
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
          statusCode: 429
        },
        'medium'
      );
      
      if (config.handler) {
        config.handler(req, res);
      } else {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
      }
    },
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skipFailedRequests: config.skipFailedRequests || false
  });
};

// Specific rate limiters for different endpoint types
export const authRateLimiter = createEnhancedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  skipSuccessfulRequests: true
});

export const apiRateLimiter = createEnhancedRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100
});

export const strictApiRateLimiter = createEnhancedRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10
});

export const searchRateLimiter = createEnhancedRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30
});

export const uploadRateLimiter = createEnhancedRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5
});

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean user rate limit store
  for (const [key, value] of userRateLimitStore.entries()) {
    if (value.resetTime < now) {
      userRateLimitStore.delete(key);
    }
  }
  
  // Clean IP rate limit store
  for (const [key, value] of ipRateLimitStore.entries()) {
    if (value.resetTime < now) {
      ipRateLimitStore.delete(key);
    }
  }
  
  // Clean API key rate limit store
  for (const [key, value] of apiKeyRateLimitStore.entries()) {
    if (value.resetTime < now) {
      apiKeyRateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute