/**
 * Authentication Rate Limiting Middleware
 * 
 * This middleware protects authentication-related endpoints from brute force attacks
 * by limiting the number of requests that can be made from a single IP address
 * in a defined time window.
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '../../config';
import { logger } from '../utils/logger';

// Export loginLimiter as authLimiter for backward compatibility
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: SECURITY_CONFIG.maxLoginAttempts || 5, // limit each IP to 5 login attempts per window
  standardHeaders: true, // Send standard rate limiting headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many login attempts',
    message: 'Too many failed login attempts from this IP. Please try again later.',
  },
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn('Rate limit exceeded for login', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});

// General login rate limiting - prevents brute force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: SECURITY_CONFIG.maxLoginAttempts || 5, // limit each IP to 5 login attempts per window
  standardHeaders: true, // Send standard rate limiting headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many login attempts',
    message: 'Too many failed login attempts from this IP. Please try again later.',
  },
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn('Rate limit exceeded for login', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});

// Password reset request rate limiting - prevents enumeration attacks
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: SECURITY_CONFIG.maxPasswordResetAttempts || 3, // limit each IP to 3 password reset requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password reset requests',
    message: 'Too many password reset requests from this IP. Please try again later.',
  },
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn('Rate limit exceeded for password reset', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});

// Registration rate limiting - prevents mass account creation
export const registrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: SECURITY_CONFIG.maxRegistrationsPerDay || 5, // limit each IP to 5 registrations per day
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts from this IP. Please try again later.',
  },
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn('Rate limit exceeded for registration', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});