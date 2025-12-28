/**
 * Admin Gateway Rate Limiter
 * Tiered rate limiting based on admin roles with burst protection
 */

import { Request, Response, NextFunction } from 'express';
import { ADMIN_ROLES, type AdminRole } from '../../packages/shared-permissions';
import { GATEWAY_CONFIG, getEndpointConfig } from './gateway-config';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  burstCount: number;
  burstWindowStart: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class AdminRateLimiter {
  private store: RateLimitStore = {};
  private readonly cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }
  
  private getRateLimitForRole(role: AdminRole | string): number {
    const config = GATEWAY_CONFIG.rateLimit;
    
    switch (role) {
      case ADMIN_ROLES.SUPER_ADMIN:
        return config.superAdminMax;
      case ADMIN_ROLES.ADMIN:
      case ADMIN_ROLES.DEVELOPER:
        return config.adminMax;
      case ADMIN_ROLES.MANAGER:
      case ADMIN_ROLES.ANALYST:
      case ADMIN_ROLES.MODERATOR:
      case ADMIN_ROLES.EXECUTIVE:
        return Math.floor(config.adminMax * 0.75);
      default:
        return config.defaultMax;
    }
  }
  
  private getBurstLimit(path: string): number | null {
    const config = GATEWAY_CONFIG.rateLimit.burstProtection;
    
    if (!config.enabled) {
      return null;
    }
    
    const isSensitive = config.sensitiveEndpoints.some(
      endpoint => path.startsWith(endpoint)
    );
    
    return isSensitive ? config.maxBurst : null;
  }
  
  private getKey(ip: string, userId?: number): string {
    return userId ? `user:${userId}` : `ip:${ip}`;
  }
  
  checkLimit(
    ip: string, 
    path: string, 
    role: AdminRole | string, 
    userId?: number
  ): RateLimitResult {
    const key = this.getKey(ip, userId);
    const now = Date.now();
    const windowMs = GATEWAY_CONFIG.rateLimit.windowMs;
    const maxRequests = this.getRateLimitForRole(role);
    const burstLimit = this.getBurstLimit(path);
    
    let entry = this.store[key];
    
    if (!entry || now - entry.firstRequest > windowMs) {
      entry = {
        count: 0,
        firstRequest: now,
        burstCount: 0,
        burstWindowStart: now,
      };
      this.store[key] = entry;
    }
    
    const burstWindowMs = 1000;
    if (now - entry.burstWindowStart > burstWindowMs) {
      entry.burstCount = 0;
      entry.burstWindowStart = now;
    }
    
    if (burstLimit !== null && entry.burstCount >= burstLimit) {
      const retryAfter = Math.ceil((entry.burstWindowStart + burstWindowMs - now) / 1000);
      
      logger.warn('Burst limit exceeded', {
        key,
        path,
        burstCount: entry.burstCount,
        burstLimit,
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.burstWindowStart + burstWindowMs,
        retryAfter,
      };
    }
    
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
      
      logger.warn('Rate limit exceeded', {
        key,
        path,
        count: entry.count,
        maxRequests,
        role,
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.firstRequest + windowMs,
        retryAfter,
      };
    }
    
    entry.count++;
    entry.burstCount++;
    
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.firstRequest + windowMs,
    };
  }
  
  private cleanup(): void {
    const now = Date.now();
    const windowMs = GATEWAY_CONFIG.rateLimit.windowMs;
    
    for (const key of Object.keys(this.store)) {
      if (now - this.store[key].firstRequest > windowMs * 2) {
        delete this.store[key];
      }
    }
  }
  
  getStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    const windowMs = GATEWAY_CONFIG.rateLimit.windowMs;
    
    const totalEntries = Object.keys(this.store).length;
    const activeEntries = Object.values(this.store).filter(
      entry => now - entry.firstRequest <= windowMs
    ).length;
    
    return { totalEntries, activeEntries };
  }
  
  resetForKey(key: string): void {
    delete this.store[key];
  }
  
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store = {};
  }
}

export const adminRateLimiter = new AdminRateLimiter();

export function createAdminRateLimitMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/admin')) {
      return next();
    }
    
    const user = req.user as { id?: number; role?: string } | undefined;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const role = user?.role || 'guest';
    const userId = user?.id;
    
    const result = adminRateLimiter.checkLimit(ip, req.path, role, userId);
    
    res.setHeader('X-RateLimit-Limit', String(GATEWAY_CONFIG.rateLimit.adminMax));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
    
    if (!result.allowed) {
      res.setHeader('Retry-After', String(result.retryAfter || 60));
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded for admin API',
        retryAfter: result.retryAfter,
        code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      });
    }
    
    next();
  };
}

export function createEndpointSpecificRateLimiter(path: string) {
  const endpointConfig = getEndpointConfig(path);
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!endpointConfig) {
      return next();
    }
    
    const user = req.user as { id?: number; role?: string } | undefined;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const role = user?.role || 'guest';
    const userId = user?.id;
    
    let multiplier = 1;
    switch (endpointConfig.rateLimit) {
      case 'high':
        multiplier = 2;
        break;
      case 'low':
        multiplier = 0.5;
        break;
      case 'standard':
      default:
        multiplier = 1;
    }
    
    const result = adminRateLimiter.checkLimit(
      ip + ':' + endpointConfig.path, 
      req.path, 
      role, 
      userId
    );
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${endpointConfig.path}`,
        retryAfter: result.retryAfter,
        code: 'ENDPOINT_RATE_LIMIT_EXCEEDED',
      });
    }
    
    next();
  };
}

export function getRateLimiterStats() {
  return adminRateLimiter.getStats();
}
