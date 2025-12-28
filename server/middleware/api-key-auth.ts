import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { apiKeys, apiKeyUsage } from '@db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { logSecurityAudit } from './enhanced-rate-limiter';

export interface ApiKeyConfig {
  required?: boolean;
  allowUserAuth?: boolean;
  scope?: string[];
}

// Cache for API keys to reduce database queries
const apiKeyCache = new Map<string, { key: any; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Generate a new API key
export const generateApiKey = (): string => {
  const prefix = 'mk_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
};

// Hash API key for storage
export const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Validate and retrieve API key from database
export const validateApiKey = async (key: string): Promise<any | null> => {
  try {
    // Check cache first
    const cached = apiKeyCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.key;
    }
    
    const hashedKey = hashApiKey(key);
    
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyHash, hashedKey),
          eq(apiKeys.isActive, true),
          gt(apiKeys.expiresAt, new Date())
        )
      )
      .limit(1);
    
    if (apiKey) {
      // Update last used timestamp
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, apiKey.id));
      
      // Cache the result
      apiKeyCache.set(key, {
        key: apiKey,
        expiresAt: Date.now() + CACHE_TTL
      });
      
      return apiKey;
    }
    
    return null;
  } catch (error) {
    logger.error('Error validating API key:', error);
    return null;
  }
};

// Track API key usage
export const trackApiKeyUsage = async (
  apiKeyId: number,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number
) => {
  try {
    await db.insert(apiKeyUsage).values({
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: new Date()
    });
    
    // Update usage count
    await db
      .update(apiKeys)
      .set({ 
        usageCount: sql`${apiKeys.usageCount} + 1`
      })
      .where(eq(apiKeys.id, apiKeyId));
  } catch (error) {
    logger.error('Error tracking API key usage:', error);
  }
};

// Middleware for API key authentication
export const apiKeyAuth = (config: ApiKeyConfig = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const apiKeyHeader = req.headers['x-api-key'] as string;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // If user is already authenticated and user auth is allowed, skip API key check
    if (config.allowUserAuth && (req as any).user) {
      return next();
    }
    
    // If API key is not required and not provided, continue
    if (!config.required && !apiKeyHeader) {
      return next();
    }
    
    // If API key is required but not provided
    if (config.required && !apiKeyHeader) {
      await logSecurityAudit(
        'API_KEY_MISSING',
        null,
        ip,
        {
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
          statusCode: 401
        },
        'medium'
      );
      
      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key in the x-api-key header'
      });
    }
    
    // Validate the API key
    const apiKey = await validateApiKey(apiKeyHeader);
    
    if (!apiKey) {
      await logSecurityAudit(
        'API_KEY_INVALID',
        null,
        ip,
        {
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
          apiKey: apiKeyHeader.substring(0, 10) + '...',
          statusCode: 401
        },
        'high'
      );
      
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or expired'
      });
    }
    
    // Check scope permissions if specified
    if (config.scope && config.scope.length > 0) {
      const keyScopes = apiKey.scopes || [];
      const hasPermission = config.scope.some(scope => keyScopes.includes(scope));
      
      if (!hasPermission) {
        await logSecurityAudit(
          'API_KEY_INSUFFICIENT_SCOPE',
          apiKey.userId,
          ip,
          {
            path: req.path,
            method: req.method,
            requiredScopes: config.scope,
            keyScopes: keyScopes,
            statusCode: 403
          },
          'medium'
        );
        
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'Your API key does not have the required permissions for this endpoint'
        });
      }
    }
    
    // Attach API key info to request
    (req as any).apiKey = apiKey;
    
    // Track usage after response
    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      await trackApiKeyUsage(
        apiKey.id,
        req.path,
        req.method,
        res.statusCode,
        responseTime
      );
    });
    
    next();
  };
};

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiKeyCache.entries()) {
    if (value.expiresAt < now) {
      apiKeyCache.delete(key);
    }
  }
}, 60000); // Clean every minute