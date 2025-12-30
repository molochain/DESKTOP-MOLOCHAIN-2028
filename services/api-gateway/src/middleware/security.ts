import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';
import { AuthenticatedRequest } from './auth.js';

const logger = createLoggerWithContext('security');

const blockedPaths = [
  /^\/\.\./,
  /\.\.\//,
  /\/\.git/,
  /\/\.env/,
  /\/\.config/,
  /\/node_modules/,
  /\/package\.json$/,
  /\/tsconfig\.json$/,
  /\/\.ssh/,
  /\/etc\/passwd/,
  /\/proc\//,
  /eval\(/i,
  /<script/i
];

const suspiciousPatterns = [
  /union\s+select/i,
  /insert\s+into/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /update\s+.+\s+set/i,
  /'--/,
  /;\s*--/,
  /\bor\b\s+1\s*=\s*1/i,
  /\band\b\s+1\s*=\s*1/i,
  /<script[^>]*>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:\s*text\/html/i
];

export function securityMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const fullPath = req.path + (req.query ? JSON.stringify(req.query) : '');
    
    for (const pattern of blockedPaths) {
      if (pattern.test(fullPath)) {
        logger.warn('Blocked path access attempt', {
          path: req.path,
          ip: req.ip,
          pattern: pattern.toString()
        });
        
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied'
        });
      }
    }
    
    const bodyString = req.body ? JSON.stringify(req.body) : '';
    const queryString = JSON.stringify(req.query);
    const combinedInput = `${fullPath}${bodyString}${queryString}`;
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedInput)) {
        logger.warn('Suspicious request pattern detected', {
          path: req.path,
          ip: req.ip,
          pattern: pattern.toString(),
          userAgent: req.get('user-agent')
        });
        
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request'
        });
      }
    }
    
    next();
  };
}

const sensitiveEndpoints = [
  /^\/$/,
  /^\/schema/,
  /^\/docs/,
  /^\/swagger/,
  /^\/api-docs/,
  /^\/openapi/,
  /^\/debug/,
  /^\/internal/
];

export function protectedEndpointMiddleware() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const isSensitive = sensitiveEndpoints.some(pattern => pattern.test(req.path));
    
    if (!isSensitive) {
      return next();
    }
    
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isAdmin) {
      logger.warn('Sensitive endpoint access blocked', {
        path: req.path,
        ip: req.ip,
        userId: req.user?.id,
        hasAuth: !!req.user || !!req.apiKey
      });
      
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
      });
    }
    
    next();
  };
}

export function metricsProtectionMiddleware() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.path !== '/metrics') {
      return next();
    }
    
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    const hasMetricsScope = req.apiKey?.scopes?.includes('metrics') || req.apiKey?.scopes?.includes('*');
    
    if (!isAdmin && !hasMetricsScope) {
      logger.warn('Metrics endpoint access blocked', {
        path: req.path,
        ip: req.ip,
        userId: req.user?.id,
        apiKeyId: req.apiKey?.id
      });
      
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
      });
    }
    
    next();
  };
}

export function adminOnlyMiddleware() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
    
    if (!isAdmin) {
      logger.warn('Admin access denied', {
        path: req.path,
        ip: req.ip,
        userId: req.user?.id
      });
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    next();
  };
}
