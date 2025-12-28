import { Request, Response, NextFunction } from 'express';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions as checkAllPermissions,
  type Permission,
  isValidAdminRole,
  PERMISSIONS
} from '../../shared/permissions';
import { logger } from '../utils/logger';

export { PERMISSIONS } from '../../shared/permissions';
export type { Permission } from '../../shared/permissions';

interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  role?: string;
}

function getUserFromRequest(req: Request): AuthenticatedUser | null {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user || !user.id) {
    return null;
  }
  return user;
}

function getUserRole(user: AuthenticatedUser): string | null {
  if (!user.role) {
    return null;
  }
  return user.role;
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getUserFromRequest(req);
      
      if (!user) {
        logger.warn('Permission check failed: No authenticated user', { 
          path: req.path,
          permission 
        });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const role = getUserRole(user);
      
      if (!role) {
        logger.warn('Permission check failed: User has no role', { 
          userId: user.id,
          path: req.path,
          permission 
        });
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'User role not defined'
        });
      }

      if (!hasPermission(role, permission)) {
        logger.warn('Permission denied', { 
          userId: user.id,
          userRole: role,
          requiredPermission: permission,
          path: req.path
        });
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${permission}`
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to verify permissions'
      });
    }
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!permissions || permissions.length === 0) {
        logger.warn('requireAnyPermission called with empty permissions array');
        return next();
      }

      const user = getUserFromRequest(req);
      
      if (!user) {
        logger.warn('Permission check failed: No authenticated user', { 
          path: req.path,
          permissions 
        });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const role = getUserRole(user);
      
      if (!role) {
        logger.warn('Permission check failed: User has no role', { 
          userId: user.id,
          path: req.path,
          permissions 
        });
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'User role not defined'
        });
      }

      if (!hasAnyPermission(role, permissions)) {
        logger.warn('Permission denied - none of required permissions', { 
          userId: user.id,
          userRole: role,
          requiredPermissions: permissions,
          path: req.path
        });
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `Insufficient permissions. Required any of: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to verify permissions'
      });
    }
  };
}

export function requireAllPermissions(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!permissions || permissions.length === 0) {
        logger.warn('requireAllPermissions called with empty permissions array');
        return next();
      }

      const user = getUserFromRequest(req);
      
      if (!user) {
        logger.warn('Permission check failed: No authenticated user', { 
          path: req.path,
          permissions 
        });
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const role = getUserRole(user);
      
      if (!role) {
        logger.warn('Permission check failed: User has no role', { 
          userId: user.id,
          path: req.path,
          permissions 
        });
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'User role not defined'
        });
      }

      if (!checkAllPermissions(role, permissions)) {
        logger.warn('Permission denied - missing required permissions', { 
          userId: user.id,
          userRole: role,
          requiredPermissions: permissions,
          path: req.path
        });
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `Insufficient permissions. Required all: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to verify permissions'
      });
    }
  };
}
