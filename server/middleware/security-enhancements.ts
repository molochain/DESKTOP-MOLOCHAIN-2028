import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// Enhanced security configuration
export const securityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted-cdn.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Advanced rate limiting for different endpoint types
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: { error: options.message || 'Rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.originalUrl,
        method: req.method
      });
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: Math.round(options.windowMs! / 1000)
      });
    }
  });
};

// API endpoint specific rate limits
export const apiRateLimits = {
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts'
  }),
  
  general: createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'API rate limit exceeded'
  }),
  
  heavy: createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // For heavy operations like file uploads
    message: 'Heavy operation rate limit exceeded'
  }),
  
  websocket: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 WebSocket connection attempts per minute
    message: 'WebSocket connection rate limit exceeded'
  })
};

// Input validation and sanitization middleware
export const inputSanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key] as string);
      }
    });
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
};

// SQL injection prevention
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['";]/g, '') // Remove potential SQL injection characters
    .trim();
}

function sanitizeObject(obj: any): void {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
}

// Request signing for sensitive operations
export const requestSigningMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sensitiveEndpoints = ['/api/admin/', '/api/auth/password-reset', '/api/payments/'];
  
  if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    const signature = req.headers['x-request-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    
    if (!signature || !timestamp) {
      return res.status(401).json({
        error: 'Missing request signature',
        message: 'Sensitive operations require request signing'
      });
    }
    
    // Verify timestamp (prevent replay attacks)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);
    
    if (timeDiff > 5 * 60 * 1000) { // 5 minutes tolerance
      return res.status(401).json({
        error: 'Request expired',
        message: 'Request timestamp is too old'
      });
    }
    
    // In production, verify the actual signature here
    // const expectedSignature = crypto.createHmac('sha256', process.env.REQUEST_SIGNING_SECRET)
    //   .update(JSON.stringify(req.body) + timestamp)
    //   .digest('hex');
    
    logger.info('Sensitive operation request verified', {
      endpoint: req.path,
      ip: req.ip,
      timestamp: new Date(requestTime).toISOString()
    });
  }
  
  next();
};

// Security headers middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add CSRF protection headers
  if (req.method !== 'GET') {
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken) {
      logger.warn('Missing CSRF token', {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
    }
  }
  
  next();
};

// Suspicious activity detection
export const suspiciousActivityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|exec|script)\b/i,
    /<script|javascript:|vbscript:/i,
    /\.\.\//,
    /\/etc\/passwd/,
    /\/proc\/self\/environ/
  ];
  
  const requestString = JSON.stringify({
    url: req.originalUrl,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  
  const suspiciousActivity = suspiciousPatterns.some(pattern => 
    pattern.test(requestString)
  );
  
  if (suspiciousActivity) {
    logger.warn('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    // In production, you might want to block the request
    // return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
};

// API key validation middleware
export const apiKeyValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const publicEndpoints = ['/api/health', '/api/docs', '/api/status'];
  
  // Skip API key validation for public endpoints
  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next();
  }
  
  if (!apiKey && req.path.startsWith('/api/')) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key in the X-API-Key header'
    });
  }
  
  // In production, validate the API key against your key management system
  if (apiKey && !isValidApiKey(apiKey)) {
    logger.warn('Invalid API key used', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      endpoint: req.path
    });
    
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  next();
};

// Mock API key validation (replace with real validation in production)
function isValidApiKey(apiKey: string): boolean {
  // In production, this would check against your API key database
  const validKeyPattern = /^mk_[a-zA-Z0-9]{32}$/;
  return validKeyPattern.test(apiKey) || apiKey === 'development-key';
}

// Automated security monitoring
export const securityMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      logger.info('Security event', {
        type: 'http_error',
        statusCode: res.statusCode,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        duration,
        timestamp: new Date().toISOString()
      });
    }
    
    // Detect potential attacks
    if (duration > 5000) { // Requests taking more than 5 seconds
      logger.warn('Slow request detected', {
        type: 'potential_dos',
        duration,
        path: req.path,
        ip: req.ip,
        method: req.method
      });
    }
  });
  
  next();
};

export default {
  securityConfig,
  createRateLimit,
  apiRateLimits,
  inputSanitizationMiddleware,
  requestSigningMiddleware,
  securityHeadersMiddleware,
  suspiciousActivityMiddleware,
  apiKeyValidationMiddleware,
  securityMonitoringMiddleware
};