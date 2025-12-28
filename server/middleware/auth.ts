import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { validateSession, getUserById } from '../core/auth/auth.service';

export { validateSession, getUserById } from '../core/auth/auth.service';

/**
 * Middleware to ensure a user is authenticated
 * Uses session-based authentication via Passport.js
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use session-based authentication (Passport.js)
    const user = await validateSession(req);

    if (user && user.id) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'NO_AUTH_TOKEN'
    });

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Middleware to ensure an authenticated user has admin role
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await validateSession(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Admin authorization error', { error });
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Alias for requireAuth for compatibility
 */
export const isAuthenticated = requireAuth;

/**
 * Alias for requireAdmin for compatibility
 */
export const isAdmin = requireAdmin;

/**
 * Middleware to ensure an authenticated user has one of the specified roles
 */
export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await validateSession(req);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role privileges' });
      }

      req.user = user;
      next();
    } catch (error) {
      logger.error('Role authorization error', { error });
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

/**
 * Middleware to check if a user owns a resource or is an admin
 */
export function requireOwnerOrAdmin(resourceIdParam: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await validateSession(req);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const resourceId = parseInt(req.params[resourceIdParam]);

      if (
        !isNaN(resourceId) &&
        (user.id === resourceId || user.role === 'admin')
      ) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      logger.error('Owner/admin authorization error', { error });
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}