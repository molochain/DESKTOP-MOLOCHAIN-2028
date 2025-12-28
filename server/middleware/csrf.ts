/**
 * CSRF Protection Middleware
 * 
 * Implements CSRF protection using the Double Submit Cookie pattern:
 * 1. A CSRF token is generated and stored in a cookie
 * 2. The same token is expected to be sent in the X-CSRF-Token header for
 *    state-changing requests (POST, PUT, DELETE, PATCH)
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { SECURITY_CONFIG } from '../../config';
import { logger } from '../utils/logger';

// Generate a new CSRF token
const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to set a CSRF token cookie
export const setCsrfCookie = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only bypass CSRF in development mode, NEVER in production
    if (!SECURITY_CONFIG.enforceCsrf && process.env.NODE_ENV !== 'production') {
      logger.debug('CSRF check bypassed in development mode');
      return next();
    }
    
    // In production, CSRF should always be enforced regardless of config
    if (process.env.NODE_ENV === 'production' && !SECURITY_CONFIG.enforceCsrf) {
      logger.warn('Attempting to bypass CSRF in production. This is not allowed for security reasons.');
    }

    // Generate a new token
    const csrfToken = generateCsrfToken();

    // Set the token in a cookie with stronger protections for production
    res.cookie('csrf_token', csrfToken, {
      httpOnly: true,
      secure: SECURITY_CONFIG.secureCookies,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    next();
  } catch (error) {
    logger.error('Error in CSRF token middleware:', error);
    next(error);
  }
};

// Middleware to refresh a CSRF token cookie if one doesn't exist
export const refreshCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only bypass CSRF in development mode, NEVER in production
    if (!SECURITY_CONFIG.enforceCsrf && process.env.NODE_ENV !== 'production') {
      logger.debug('CSRF check bypassed in development mode');
      return next();
    }
    
    // In production, CSRF should always be enforced regardless of config
    if (process.env.NODE_ENV === 'production' && !SECURITY_CONFIG.enforceCsrf) {
      logger.warn('Attempting to bypass CSRF in production. This is not allowed for security reasons.');
    }

    // Check if a CSRF token cookie already exists
    if (!req.cookies.csrf_token) {
      // Generate a new token
      const csrfToken = generateCsrfToken();

      // Set the token in a cookie with stronger protections for production
      res.cookie('csrf_token', csrfToken, {
        httpOnly: true,
        secure: SECURITY_CONFIG.secureCookies,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });
    }

    next();
  } catch (error) {
    logger.error('Error in CSRF refresh middleware:', error);
    next(error);
  }
};

// Middleware to verify CSRF token for state-changing requests
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only bypass CSRF in development mode, NEVER in production
    if (!SECURITY_CONFIG.enforceCsrf && process.env.NODE_ENV !== 'production') {
      logger.debug('CSRF check bypassed in development mode');
      return next();
    }
    
    // In production, CSRF should always be enforced regardless of config
    if (process.env.NODE_ENV === 'production' && !SECURITY_CONFIG.enforceCsrf) {
      logger.warn('Attempting to bypass CSRF in production. This is not allowed for security reasons.');
    }

    // Only check CSRF token for state-changing methods
    const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
    
    if (isStateChangingMethod) {
      // Get token from cookie
      const cookieToken = req.cookies.csrf_token;
      
      // Get token from header
      const headerToken = req.headers['x-csrf-token'] as string;

      // Validate that both tokens exist and match
      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        logger.warn('CSRF token validation failed', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          hasHeaderToken: !!headerToken,
          hasCookieToken: !!cookieToken,
        });
        
        return res.status(403).json({
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token',
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error in CSRF validation middleware:', error);
    next(error);
  }
};