import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { logSecurityAudit } from './enhanced-rate-limiter';

// CSRF token storage for validation
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>();

// Enhanced CSRF protection with custom error handling
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Custom CSRF error handler
export const csrfErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  const user = (req as any).user;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Log CSRF violation
  await logSecurityAudit(
    'CSRF_TOKEN_INVALID',
    user?.id || null,
    ip,
    {
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'],
      statusCode: 403,
      referer: req.headers['referer']
    },
    'high'
  );
  
  logger.warn('CSRF token validation failed', {
    ip,
    path: req.path,
    method: req.method,
    referer: req.headers['referer']
  });
  
  res.status(403).json({
    error: 'Invalid CSRF token',
    message: 'The security token for this request is invalid or expired. Please refresh the page and try again.'
  });
};

// Middleware to generate and inject CSRF token
export const injectCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    const token = req.csrfToken();
    res.locals.csrfToken = token;
    
    // Store token for validation
    const sessionId = (req as any).sessionID || req.ip;
    csrfTokenStore.set(sessionId, {
      token,
      expiresAt: Date.now() + 3600000 // 1 hour
    });
  }
  next();
};

// Validate CSRF token from various sources
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for certain paths
  const skipPaths = ['/api/health', '/api/webhook', '/api/tracking/update'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Skip for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Apply CSRF protection
  csrfProtection(req, res, next);
};

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokenStore.entries()) {
    if (value.expiresAt < now) {
      csrfTokenStore.delete(key);
    }
  }
}, 600000); // Clean every 10 minutes

export default {
  csrfProtection,
  csrfErrorHandler,
  injectCsrfToken,
  validateCsrfToken
};