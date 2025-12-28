/**
 * Admin Gateway Security Headers
 * Enhanced security headers specifically for admin routes
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { GATEWAY_CONFIG, getGatewayVersion } from './gateway-config';

export interface SecurityHeadersConfig {
  enableStrictCSP: boolean;
  enableCorrelationId: boolean;
  enableGatewayVersion: boolean;
  customHeaders?: Record<string, string>;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  enableStrictCSP: true,
  enableCorrelationId: true,
  enableGatewayVersion: true,
};

export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `admin-${timestamp}-${random}`;
}

export function getAdminCSPDirectives(): Record<string, string[]> {
  const isProduction = GATEWAY_CONFIG.environment === 'production';
  
  return {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isProduction ? [] : ["'unsafe-inline'"]),
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:',
    ],
    'connect-src': [
      "'self'",
      'wss:',
      ...(isProduction ? ['https:'] : ['ws:', 'http:', 'https:']),
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': isProduction ? [] : [],
  };
}

export function buildCSPString(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .filter(([_, values]) => values.length > 0 || _ === 'upgrade-insecure-requests')
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

export function createAdminSecurityHeaders(config: Partial<SecurityHeadersConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/admin')) {
      return next();
    }
    
    res.setHeader('X-Admin-Request', 'true');
    res.setHeader('X-Admin-Path', req.path);
    res.setHeader('X-Admin-Method', req.method);
    
    if (finalConfig.enableCorrelationId) {
      let correlationId = req.headers['x-correlation-id'] as string;
      
      if (!correlationId) {
        correlationId = generateCorrelationId();
      }
      
      res.setHeader('X-Correlation-ID', correlationId);
      (req as any).correlationId = correlationId;
    }
    
    if (finalConfig.enableGatewayVersion) {
      res.setHeader('X-Gateway-Version', getGatewayVersion());
    }
    
    res.setHeader('X-Gateway-Timestamp', new Date().toISOString());
    
    if (finalConfig.enableStrictCSP && GATEWAY_CONFIG.security.strictCSP) {
      const cspDirectives = getAdminCSPDirectives();
      const cspString = buildCSPString(cspDirectives);
      res.setHeader('Content-Security-Policy', cspString);
    }
    
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    if (GATEWAY_CONFIG.environment === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (finalConfig.customHeaders) {
      for (const [key, value] of Object.entries(finalConfig.customHeaders)) {
        res.setHeader(key, value);
      }
    }
    
    next();
  };
}

export function createAdminResponseHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      res.setHeader('X-Admin-Response-Type', 'json');
      res.setHeader('X-Admin-Response-Time', new Date().toISOString());
      
      return originalJson(body);
    };
    
    next();
  };
}

export function getSecurityHeadersForPath(path: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Admin-Request': 'true',
    'X-Admin-Path': path,
    'X-Gateway-Version': getGatewayVersion(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  
  const sensitivePaths = [
    '/api/admin/users',
    '/api/admin/security',
    '/api/admin/settings',
    '/api/admin/system',
  ];
  
  if (sensitivePaths.some(p => path.startsWith(p))) {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private';
    headers['X-Admin-Sensitive'] = 'true';
  }
  
  return headers;
}
