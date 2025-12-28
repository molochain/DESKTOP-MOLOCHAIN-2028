/**
 * Email API Rate Limiting Middleware
 * 
 * Protects email API endpoints from abuse and spam by limiting
 * the number of requests per IP/API key combination.
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit, { Options } from 'express-rate-limit';
import { logger } from '../utils/logger';

// Environment variable configuration with sensible defaults
const EMAIL_RATE_LIMIT_GENERAL = parseInt(process.env.EMAIL_RATE_LIMIT_GENERAL || '10', 10);
const EMAIL_RATE_LIMIT_AUTH = parseInt(process.env.EMAIL_RATE_LIMIT_AUTH || '5', 10);
const EMAIL_RATE_LIMIT_PASSWORD_RESET = parseInt(process.env.EMAIL_RATE_LIMIT_PASSWORD_RESET || '3', 10);
const EMAIL_RATE_LIMIT_WINDOW_MS = parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute default
const EMAIL_RATE_LIMIT_PASSWORD_RESET_WINDOW_MS = parseInt(process.env.EMAIL_RATE_LIMIT_PASSWORD_RESET_WINDOW_MS || '900000', 10); // 15 minutes

// Whitelisted IPs and API keys for internal services
const WHITELISTED_IPS = (process.env.EMAIL_RATE_LIMIT_WHITELIST_IPS || '').split(',').filter(Boolean);
const WHITELISTED_API_KEYS = (process.env.EMAIL_RATE_LIMIT_WHITELIST_API_KEYS || '').split(',').filter(Boolean);

/**
 * Custom key generator based on API key + IP combination
 * Provides more granular rate limiting per client
 */
const keyGenerator = (req: Request): string => {
  const apiKey = req.headers['x-api-key'] as string || 'anonymous';
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `${apiKey}:${ip}`;
};

/**
 * Skip rate limiting for whitelisted IPs and API keys
 */
const skipWhitelisted = (req: Request): boolean => {
  const ip = req.ip || req.socket.remoteAddress || '';
  const apiKey = req.headers['x-api-key'] as string || '';
  
  if (WHITELISTED_IPS.includes(ip)) {
    logger.debug('Rate limit skipped - whitelisted IP', { ip });
    return true;
  }
  
  if (WHITELISTED_API_KEYS.includes(apiKey)) {
    logger.debug('Rate limit skipped - whitelisted API key', { apiKey: apiKey.substring(0, 8) + '...' });
    return true;
  }
  
  return false;
};

/**
 * Common handler for rate limit exceeded
 */
const createRateLimitHandler = (operationType: string) => {
  return (req: Request, res: Response, _next: NextFunction, options: any) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    
    logger.warn('Email rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      operationType,
      apiKey: req.headers['x-api-key'] ? 'present' : 'missing',
    });
    
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit exceeded for ${operationType}. Please try again later.`,
      retryAfter,
    });
  };
};

/**
 * Common options for all email rate limiters
 */
const baseOptions: Partial<Options> = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Also send `X-RateLimit-*` headers for compatibility
  keyGenerator,
  skip: skipWhitelisted,
};

/**
 * General email send rate limiter
 * 10 requests per minute per IP/API key combination
 */
export const emailSendLimiter = rateLimit({
  ...baseOptions,
  windowMs: EMAIL_RATE_LIMIT_WINDOW_MS,
  max: EMAIL_RATE_LIMIT_GENERAL,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many email requests. Please try again later.',
  },
  handler: createRateLimitHandler('email send'),
});

/**
 * Auth email rate limiter (login/register confirmation emails)
 * 5 requests per minute per IP/API key combination
 */
export const authEmailLimiter = rateLimit({
  ...baseOptions,
  windowMs: EMAIL_RATE_LIMIT_WINDOW_MS,
  max: EMAIL_RATE_LIMIT_AUTH,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many authentication email requests. Please try again later.',
  },
  handler: createRateLimitHandler('authentication email'),
});

/**
 * Password reset email rate limiter (stricter)
 * 3 requests per 15 minutes per IP/API key combination
 */
export const passwordResetEmailLimiter = rateLimit({
  ...baseOptions,
  windowMs: EMAIL_RATE_LIMIT_PASSWORD_RESET_WINDOW_MS,
  max: EMAIL_RATE_LIMIT_PASSWORD_RESET,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many password reset requests. Please try again later.',
  },
  handler: createRateLimitHandler('password reset email'),
});

/**
 * Middleware to add custom rate limit headers to all responses
 * This ensures headers are present even when not rate limited
 */
export const addRateLimitHeaders = (limiterType: 'general' | 'auth' | 'password-reset') => {
  return (req: Request, res: Response, next: NextFunction) => {
    let limit: number;
    let windowMs: number;
    
    switch (limiterType) {
      case 'auth':
        limit = EMAIL_RATE_LIMIT_AUTH;
        windowMs = EMAIL_RATE_LIMIT_WINDOW_MS;
        break;
      case 'password-reset':
        limit = EMAIL_RATE_LIMIT_PASSWORD_RESET;
        windowMs = EMAIL_RATE_LIMIT_PASSWORD_RESET_WINDOW_MS;
        break;
      default:
        limit = EMAIL_RATE_LIMIT_GENERAL;
        windowMs = EMAIL_RATE_LIMIT_WINDOW_MS;
    }
    
    const resetTime = Math.ceil((Date.now() + windowMs) / 1000);
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Reset', resetTime);
    
    next();
  };
};

/**
 * Determine email type from form type slug for applying appropriate rate limiter
 */
export const getEmailLimiterByFormType = (formType: string): typeof emailSendLimiter => {
  const authFormTypes = ['login', 'register', 'signup', 'signin', 'verify-email', 'verification'];
  const passwordResetFormTypes = ['password-reset', 'forgot-password', 'reset-password'];
  
  const normalizedType = formType.toLowerCase();
  
  if (authFormTypes.some(type => normalizedType.includes(type))) {
    return authEmailLimiter;
  }
  
  if (passwordResetFormTypes.some(type => normalizedType.includes(type))) {
    return passwordResetEmailLimiter;
  }
  
  return emailSendLimiter;
};

/**
 * Dynamic rate limiter that selects appropriate limiter based on request content
 * Useful when the form type is in the request body
 */
export const dynamicEmailRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const formType = req.body?.formType || '';
  const limiter = getEmailLimiterByFormType(formType);
  
  return limiter(req, res, next);
};
