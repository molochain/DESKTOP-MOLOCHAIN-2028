/**
 * Advanced Security Middleware for MOLOCHAIN Platform
 * Implements OWASP security standards and enterprise-grade protection
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';
import { logger } from '../utils/logger';

interface SecurityConfig {
  enableStrictCSP: boolean;
  enableHSTS: boolean;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  enableRequestSigning: boolean;
  trustedProxies: string[];
}

interface SecurityEvent {
  type: 'rate_limit' | 'csp_violation' | 'suspicious_request' | 'auth_attempt';
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private suspiciousIPs = new Set<string>();
  private readonly MAX_EVENTS = 10000;

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: new Date()
    });

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Flag suspicious IPs
    if (event.type === 'rate_limit' || event.type === 'suspicious_request') {
      this.suspiciousIPs.add(event.ip);
    }

    logger.warn(`Security event: ${event.type}`, event);
  }

  isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip);
  }

  getSecurityStats() {
    const recentEvents = this.events.filter(
      event => Date.now() - event.timestamp.getTime() < 60 * 60 * 1000
    );

    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      suspiciousIPs: Array.from(this.suspiciousIPs),
      eventsByType: recentEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  clearOldEvents() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.events = this.events.filter(event => event.timestamp.getTime() > oneHourAgo);
    
    // Clear suspicious IPs older than 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentSuspiciousEvents = this.events.filter(
      event => event.timestamp.getTime() > oneDayAgo &&
      (event.type === 'rate_limit' || event.type === 'suspicious_request')
    );
    
    this.suspiciousIPs.clear();
    recentSuspiciousEvents.forEach(event => this.suspiciousIPs.add(event.ip));
  }
}

export const securityMonitor = new SecurityMonitor();

/**
 * Enhanced Content Security Policy
 */
export function createAdvancedCSP() {
  return helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite HMR in development
        "https://trusted-cdn.com",
        "https://apis.google.com",
        "https://www.googletagmanager.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "wss:",
        "https:",
        ...(process.env.NODE_ENV === 'development' ? ['ws://localhost:*'] : [])
      ],
      mediaSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      ...(process.env.NODE_ENV === 'production' ? { upgradeInsecureRequests: [] } : {})
    },
    reportOnly: false
  });
}

/**
 * Advanced rate limiting with dynamic thresholds
 */
export function createDynamicRateLimit(config: SecurityConfig) {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: (req: Request) => {
      const ip = req.ip || '0.0.0.0';
      
      // Stricter limits for suspicious IPs
      if (securityMonitor.isSuspiciousIP(ip)) {
        return Math.floor(config.rateLimitMax * 0.5);
      }
      
      // Different limits based on endpoint
      if (req.path.startsWith('/api/auth')) {
        return Math.floor(config.rateLimitMax * 0.2); // 20% for auth endpoints
      }
      
      if (req.path.startsWith('/api/admin')) {
        return Math.floor(config.rateLimitMax * 0.3); // 30% for admin endpoints
      }
      
      return config.rateLimitMax;
    },
    message: {
      error: 'Too many requests from this IP',
      retryAfter: config.rateLimitWindowMs / 1000,
      type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      securityMonitor.logSecurityEvent({
        type: 'rate_limit',
        ip: req.ip || '0.0.0.0',
        userAgent: req.get('User-Agent') || 'unknown',
        details: {
          path: req.path,
          method: req.method
        }
      });
      res.status(429).json({
        error: 'Too many requests from this IP',
        retryAfter: config.rateLimitWindowMs / 1000,
        type: 'rate_limit_exceeded'
      });
    }
  });
}

/**
 * Request signature validation for sensitive operations
 */
export function validateRequestSignature(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only validate signatures for POST/PUT/DELETE on sensitive endpoints
    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
      return next();
    }

    if (!req.path.includes('/admin') && !req.path.includes('/auth')) {
      return next();
    }

    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;

    if (!signature || !timestamp) {
      securityMonitor.logSecurityEvent({
        type: 'suspicious_request',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: { reason: 'Missing signature or timestamp', path: req.path }
      });
      return res.status(401).json({ error: 'Request signature required' });
    }

    // Check timestamp to prevent replay attacks
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);

    if (timeDiff > 300000) { // 5 minutes
      return res.status(401).json({ error: 'Request timestamp too old' });
    }

    // Validate signature
    const payload = JSON.stringify(req.body) + timestamp;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
      securityMonitor.logSecurityEvent({
        type: 'suspicious_request',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        details: { reason: 'Invalid signature', path: req.path }
      });
      return res.status(401).json({ error: 'Invalid request signature' });
    }

    next();
  };
}

/**
 * Enhanced input validation and sanitization
 */
export function sanitizeInput() {
  return (req: Request & { ip?: string }, res: Response, next: NextFunction) => {
    // Detect potential SQL injection attempts
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\bOR\b.*=.*\bOR\b)/i,
      /(\bAND\b.*=.*\bAND\b)/i
    ];

    // Detect XSS attempts
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ];

    const checkForMaliciousInput = (obj: any, path = ''): boolean => {
      if (typeof obj === 'string') {
        const isSQLInjection = sqlPatterns.some(pattern => pattern.test(obj));
        const isXSS = xssPatterns.some(pattern => pattern.test(obj));
        
        if (isSQLInjection || isXSS) {
          securityMonitor.logSecurityEvent({
            type: 'suspicious_request',
            ip: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            details: {
              reason: isSQLInjection ? 'SQL injection attempt' : 'XSS attempt',
              path: req.path,
              field: path,
              value: obj.substring(0, 100)
            }
          });
          return true;
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          if (checkForMaliciousInput(value, `${path}.${key}`)) {
            return true;
          }
        }
      }
      return false;
    };

    // Check request body
    if (req.body && checkForMaliciousInput(req.body)) {
      return res.status(400).json({ 
        error: 'Invalid input detected',
        code: 'MALICIOUS_INPUT'
      });
    }

    // Check query parameters
    if (req.query && checkForMaliciousInput(req.query)) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        code: 'MALICIOUS_INPUT'
      });
    }

    next();
  };
}

/**
 * Initialize security monitoring cleanup
 */
export function initializeSecurityMonitoring() {
  // Clean up old security events every hour
  setInterval(() => {
    securityMonitor.clearOldEvents();
  }, 60 * 60 * 1000);

  logger.info('Advanced security monitoring initialized');
}

/**
 * Get security statistics endpoint
 */
export function getSecurityStats() {
  return securityMonitor.getSecurityStats();
}