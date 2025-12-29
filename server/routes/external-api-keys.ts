import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { externalApiKeys, apiKeyUsageLogs } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';
import { logger } from '../utils/logger';

const router = Router();

const API_KEY_PREFIX = 'mk_live_';
const API_SECRET_PREFIX = 'msk_';

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${API_KEY_PREFIX}${randomBytes}`;
}

function generateApiSecret(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${API_SECRET_PREFIX}${randomBytes}`;
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function maskKey(key: string): string {
  if (key.length < 12) return '••••••••';
  return `${key.substring(0, 8)}••••••••${key.substring(key.length - 4)}`;
}

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  scopes: z.array(z.string()).default(['read']),
  rateLimit: z.number().min(100).max(100000).default(1000),
  rateLimitWindow: z.number().min(60).max(86400).default(3600),
  expiresAt: z.string().datetime().optional(),
  ipWhitelist: z.array(z.string()).optional(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  rateLimit: z.number().min(100).max(100000).optional(),
  rateLimitWindow: z.number().min(60).max(86400).optional(),
  isActive: z.boolean().optional(),
  ipWhitelist: z.array(z.string()).optional(),
});

router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createApiKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }

    const data = validation.data;
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    const keyHash = hashKey(apiKey);
    const secretHash = hashKey(apiSecret);
    const keyPrefix = apiKey.substring(0, 12);

    const userId = (req as any).user?.id;

    const [created] = await db.insert(externalApiKeys).values({
      name: data.name,
      description: data.description,
      keyHash,
      keyPrefix,
      secretHash,
      userId,
      scopes: data.scopes,
      rateLimit: data.rateLimit,
      rateLimitWindow: data.rateLimitWindow,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      ipWhitelist: data.ipWhitelist,
      isActive: true,
    }).returning();

    logger.info('API key created', { keyId: created.id, name: data.name, userId });

    res.status(201).json({
      success: true,
      message: 'API key created successfully. Save these credentials securely - they will not be shown again.',
      apiKey: {
        id: created.id,
        name: created.name,
        key: apiKey,
        secret: apiSecret,
        keyPrefix: created.keyPrefix,
        scopes: created.scopes,
        rateLimit: created.rateLimit,
        rateLimitWindow: created.rateLimitWindow,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.get('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const keys = await db.select({
      id: externalApiKeys.id,
      name: externalApiKeys.name,
      description: externalApiKeys.description,
      keyPrefix: externalApiKeys.keyPrefix,
      scopes: externalApiKeys.scopes,
      rateLimit: externalApiKeys.rateLimit,
      rateLimitWindow: externalApiKeys.rateLimitWindow,
      isActive: externalApiKeys.isActive,
      lastUsedAt: externalApiKeys.lastUsedAt,
      usageCount: externalApiKeys.usageCount,
      expiresAt: externalApiKeys.expiresAt,
      ipWhitelist: externalApiKeys.ipWhitelist,
      createdAt: externalApiKeys.createdAt,
    }).from(externalApiKeys).orderBy(desc(externalApiKeys.createdAt));

    res.json({
      success: true,
      apiKeys: keys.map(k => ({
        ...k,
        keyPreview: `${k.keyPrefix}••••••••`,
      })),
    });
  } catch (error) {
    logger.error('Error listing API keys:', error);
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

router.get('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }

    const [key] = await db.select({
      id: externalApiKeys.id,
      name: externalApiKeys.name,
      description: externalApiKeys.description,
      keyPrefix: externalApiKeys.keyPrefix,
      scopes: externalApiKeys.scopes,
      rateLimit: externalApiKeys.rateLimit,
      rateLimitWindow: externalApiKeys.rateLimitWindow,
      isActive: externalApiKeys.isActive,
      lastUsedAt: externalApiKeys.lastUsedAt,
      usageCount: externalApiKeys.usageCount,
      expiresAt: externalApiKeys.expiresAt,
      ipWhitelist: externalApiKeys.ipWhitelist,
      createdAt: externalApiKeys.createdAt,
      updatedAt: externalApiKeys.updatedAt,
    }).from(externalApiKeys).where(eq(externalApiKeys.id, id));

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const recentUsage = await db.select().from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.apiKeyId, id))
      .orderBy(desc(apiKeyUsageLogs.createdAt))
      .limit(10);

    res.json({
      success: true,
      apiKey: {
        ...key,
        keyPreview: `${key.keyPrefix}••••••••`,
      },
      recentUsage,
    });
  } catch (error) {
    logger.error('Error getting API key:', error);
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

router.patch('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }

    const validation = updateApiKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }

    const data = validation.data;

    const [updated] = await db.update(externalApiKeys)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(externalApiKeys.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'API key not found' });
    }

    logger.info('API key updated', { keyId: id });
    res.json({ success: true, message: 'API key updated successfully' });
  } catch (error) {
    logger.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }

    const [deleted] = await db.delete(externalApiKeys)
      .where(eq(externalApiKeys.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'API key not found' });
    }

    logger.info('API key deleted', { keyId: id });
    res.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    logger.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

router.post('/:id/regenerate', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }

    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    const keyHash = hashKey(apiKey);
    const secretHash = hashKey(apiSecret);
    const keyPrefix = apiKey.substring(0, 12);

    const [updated] = await db.update(externalApiKeys)
      .set({
        keyHash,
        keyPrefix,
        secretHash,
        updatedAt: new Date(),
      })
      .where(eq(externalApiKeys.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'API key not found' });
    }

    logger.info('API key regenerated', { keyId: id });

    res.json({
      success: true,
      message: 'API key regenerated successfully. Save these credentials securely.',
      credentials: {
        key: apiKey,
        secret: apiSecret,
      },
    });
  } catch (error) {
    logger.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

router.get('/:id/usage', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const usage = await db.select().from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.apiKeyId, id))
      .orderBy(desc(apiKeyUsageLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.apiKeyId, id));

    res.json({
      success: true,
      usage,
      total: countResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error getting API key usage:', error);
    res.status(500).json({ error: 'Failed to get API key usage' });
  }
});

export default router;
