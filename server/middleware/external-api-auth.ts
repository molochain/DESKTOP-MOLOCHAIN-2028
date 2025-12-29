import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { externalApiKeys, apiKeyUsageLogs } from '@shared/schema';
import { eq, and, gt, isNull, or } from 'drizzle-orm';
import { logger } from '../utils/logger';

interface ApiKeyInfo {
  id: number;
  name: string;
  userId: number | null;
  scopes: string[];
  rateLimit: number;
  rateLimitWindow: number;
}

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKeyInfo;
    }
  }
}

const rateLimitCache = new Map<number, { count: number; resetAt: number }>();

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function extractCredentials(req: Request): { apiKey?: string; apiSecret?: string } {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const [key, secret] = token.split(':');
    return { apiKey: key, apiSecret: secret };
  }

  const apiKey = req.headers['x-api-key'] as string;
  const apiSecret = req.headers['x-api-secret'] as string;
  if (apiKey && apiSecret) {
    return { apiKey, apiSecret };
  }

  return {};
}

export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();
  const { apiKey, apiSecret } = extractCredentials(req);

  if (!apiKey || !apiSecret) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key and secret are required. Use Authorization: Bearer <key>:<secret> or X-API-Key and X-API-Secret headers.',
    });
    return;
  }

  try {
    const keyHash = hashKey(apiKey);
    const secretHash = hashKey(apiSecret);

    const [keyRecord] = await db.select().from(externalApiKeys)
      .where(and(
        eq(externalApiKeys.keyHash, keyHash),
        eq(externalApiKeys.secretHash, secretHash),
        eq(externalApiKeys.isActive, true),
        or(
          isNull(externalApiKeys.expiresAt),
          gt(externalApiKeys.expiresAt, new Date())
        )
      ));

    if (!keyRecord) {
      logger.warn('Invalid API key attempt', { keyPrefix: apiKey.substring(0, 12), ip: req.ip });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired API credentials',
      });
      return;
    }

    if (keyRecord.ipWhitelist && keyRecord.ipWhitelist.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress || '';
      if (!keyRecord.ipWhitelist.includes(clientIp)) {
        logger.warn('API key IP not whitelisted', { keyId: keyRecord.id, ip: clientIp });
        res.status(403).json({
          error: 'Forbidden',
          message: 'IP address not whitelisted for this API key',
        });
        return;
      }
    }

    const now = Date.now();
    let rateInfo = rateLimitCache.get(keyRecord.id);

    if (!rateInfo || now > rateInfo.resetAt) {
      rateInfo = {
        count: 0,
        resetAt: now + (keyRecord.rateLimitWindow || 3600) * 1000,
      };
    }

    rateInfo.count++;

    if (rateInfo.count > (keyRecord.rateLimit || 1000)) {
      const retryAfter = Math.ceil((rateInfo.resetAt - now) / 1000);
      res.setHeader('X-RateLimit-Limit', keyRecord.rateLimit || 1000);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateInfo.resetAt / 1000));
      res.setHeader('Retry-After', retryAfter);

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
        retryAfter,
      });
      return;
    }

    rateLimitCache.set(keyRecord.id, rateInfo);

    res.setHeader('X-RateLimit-Limit', keyRecord.rateLimit || 1000);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, (keyRecord.rateLimit || 1000) - rateInfo.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateInfo.resetAt / 1000));

    req.apiKey = {
      id: keyRecord.id,
      name: keyRecord.name,
      userId: keyRecord.userId,
      scopes: (keyRecord.scopes as string[]) || [],
      rateLimit: keyRecord.rateLimit || 1000,
      rateLimitWindow: keyRecord.rateLimitWindow || 3600,
    };

    db.update(externalApiKeys)
      .set({
        lastUsedAt: new Date(),
        usageCount: (keyRecord.usageCount || 0) + 1,
      })
      .where(eq(externalApiKeys.id, keyRecord.id))
      .execute()
      .catch(err => logger.error('Failed to update API key usage:', err));

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      db.insert(apiKeyUsageLogs).values({
        apiKeyId: keyRecord.id,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      }).execute().catch(err => logger.error('Failed to log API usage:', err));
    });

    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication service unavailable',
    });
  }
}

export function requireScope(...requiredScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key authentication required',
      });
    }

    const hasScope = requiredScopes.some(scope => 
      req.apiKey!.scopes.includes(scope) || req.apiKey!.scopes.includes('*')
    );

    if (!hasScope) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following scopes: ${requiredScopes.join(', ')}`,
      });
    }

    next();
  };
}

export function optionalApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { apiKey, apiSecret } = extractCredentials(req);

  if (apiKey && apiSecret) {
    authenticateApiKey(req, res, next);
  } else {
    next();
  }
}
