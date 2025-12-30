import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';

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

export function adminOnlyMiddleware(adminIPs: string[] = []) {
  const allowedIPs = new Set([
    '127.0.0.1',
    '::1',
    ...adminIPs,
    ...(process.env.ADMIN_IPS?.split(',') || [])
  ]);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    
    const isAdmin = (req as any).user?.role === 'admin' || 
                    (req as any).user?.role === 'superadmin';
    
    if (!isAdmin && !allowedIPs.has(clientIP)) {
      logger.warn('Admin access denied', {
        path: req.path,
        ip: clientIP,
        userId: (req as any).user?.id
      });
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    next();
  };
}

const protectedEndpoints = [
  { pattern: /^\/$/, require: 'admin' },
  { pattern: /^\/schema/, require: 'admin' },
  { pattern: /^\/docs/, require: 'admin' },
  { pattern: /^\/swagger/, require: 'admin' },
  { pattern: /^\/api-docs/, require: 'admin' },
  { pattern: /^\/openapi/, require: 'admin' },
  { pattern: /^\/debug/, require: 'admin' },
  { pattern: /^\/internal/, require: 'admin' },
  { pattern: /^\/metrics/, require: 'internal' },
  { pattern: /^\/health\/services/, require: 'internal' }
];

export function protectedEndpointMiddleware() {
  const internalIPs = new Set([
    '127.0.0.1',
    '::1',
    ...(process.env.INTERNAL_IPS?.split(',') || []),
    ...Array.from({ length: 256 }, (_, i) => `172.${16 + Math.floor(i / 16)}.${i % 16}.${i % 256}`).slice(0, 100),
    ...Array.from({ length: 256 }, (_, i) => `10.0.${Math.floor(i / 256)}.${i % 256}`).slice(0, 100)
  ]);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    const isInternalRequest = internalIPs.has(clientIP) || 
                               clientIP.startsWith('172.') || 
                               clientIP.startsWith('10.') ||
                               clientIP.startsWith('192.168.');
    
    for (const endpoint of protectedEndpoints) {
      if (endpoint.pattern.test(req.path)) {
        if (endpoint.require === 'admin') {
          const isAdmin = (req as any).user?.role === 'admin' || 
                          (req as any).user?.role === 'superadmin';
          
          if (!isAdmin && !isInternalRequest) {
            logger.warn('Protected endpoint access denied', {
              path: req.path,
              ip: clientIP,
              require: endpoint.require
            });
            
            return res.status(404).json({
              error: 'Not Found',
              message: 'The requested endpoint does not exist'
            });
          }
        }
        
        if (endpoint.require === 'internal' && !isInternalRequest) {
          logger.warn('Internal endpoint access denied', {
            path: req.path,
            ip: clientIP
          });
          
          return res.status(404).json({
            error: 'Not Found',
            message: 'The requested endpoint does not exist'
          });
        }
        
        break;
      }
    }
    
    next();
  };
}
