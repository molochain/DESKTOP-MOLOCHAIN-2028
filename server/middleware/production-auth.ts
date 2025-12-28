/**
 * Production-ready authentication middleware
 * Enhanced security for production environments
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { FEATURES } from '../../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'user' | 'admin';
    permissions: string[];
  };
}

/**
 * Production authentication middleware
 * Only enforces authentication in production mode
 */
export function requireAuth() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Skip authentication if disabled globally
    if (!FEATURES.enableUserSessions) {
      logger.debug('Authentication disabled, allowing access');
      return next();
    }

    // Skip authentication for public routes
    const publicRoutes = [
      '/api/health',
      '/api/services',
      '/api/contact/agents',
      '/api/analytics/public',
      '/api/mololink/',
      '/api/cms/',
      '/attached_assets/',
      '/locales/',
      '/patterns/',
      '/services/'
    ];

    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
    if (isPublicRoute) {
      return next();
    }

    // Check for authentication
    if (!req.user && req.session?.userId) {
      // Simulate user loading from session
      req.user = {
        id: req.session.userId,
        email: req.session.userEmail || 'authenticated@example.com',
        role: req.session.userRole || 'user',
        permissions: req.session.userPermissions || []
      };
    }

    // Require authentication for protected routes in production
    if (process.env.NODE_ENV === 'production' && !req.user) {
      logger.warn('Unauthorized access attempt', {
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        path: req.path
      });
    }

    next();
  };
}

/**
 * Admin role requirement middleware
 */
export function requireAdmin() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth()(req, res, (err) => {
      if (err) return next(err);

      // Skip admin check if authentication is disabled
      if (!FEATURES.enableUserSessions) {
        return next();
      }

      // Check admin role in production
      if (process.env.NODE_ENV === 'production') {
        if (!req.user || req.user.role !== 'admin') {
          logger.warn('Admin access denied', {
            userId: req.user?.id,
            path: req.path,
            ip: req.ip
          });
          
          return res.status(403).json({
            error: 'Admin access required',
            code: 'ADMIN_REQUIRED',
            path: req.path
          });
        }
      }

      next();
    });
  };
}

/**
 * Permission-based access control
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth()(req, res, (err) => {
      if (err) return next(err);

      // Skip permission check if authentication is disabled
      if (!FEATURES.enableUserSessions) {
        return next();
      }

      // Check permission in production
      if (process.env.NODE_ENV === 'production') {
        if (!req.user || !req.user.permissions.includes(permission)) {
          logger.warn('Permission denied', {
            userId: req.user?.id,
            permission,
            userPermissions: req.user?.permissions,
            path: req.path,
            ip: req.ip
          });
          
          return res.status(403).json({
            error: `Permission required: ${permission}`,
            code: 'PERMISSION_REQUIRED',
            permission,
            path: req.path
          });
        }
      }

      next();
    });
  };
}

/**
 * Rate limiting for authenticated users
 */
export function createAuthenticatedRateLimit(windowMs: number, maxRequests: number) {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, data] of userRequests.entries()) {
      if (data.resetTime < now) {
        userRequests.delete(key);
      }
    }

    // Check current user
    const userRateData = userRequests.get(userId);
    if (!userRateData || userRateData.resetTime < now) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userRateData.count >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        userId,
        count: userRateData.count,
        maxRequests,
        path: req.path
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((userRateData.resetTime - now) / 1000)
      });
    }

    userRateData.count++;
    next();
  };
}

/**
 * Session validation middleware
 */
export function validateSession() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.session) {
      return next();
    }

    // Check session expiry
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    const sessionAge = Date.now() - (req.session.createdAt || 0);

    if (sessionAge > sessionTimeout) {
      logger.info('Session expired', {
        sessionId: req.session.id,
        age: sessionAge
      });

      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destruction error', err);
        }
      });

      return res.status(401).json({
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Update last activity
    req.session.lastActivity = Date.now();
    next();
  };
}