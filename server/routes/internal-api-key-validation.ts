import { Router, Request, Response } from 'express';
import { db } from '../db';
import { externalApiKeys } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

router.post('/validate-api-key', async (req: Request, res: Response) => {
  const gatewayHeader = req.headers['x-internal-gateway'];
  if (gatewayHeader !== 'true') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const rawIp = req.ip || req.socket.remoteAddress || '';
  const clientIp = rawIp.replace(/^::ffff:/, '');
  
  const isInternal = clientIp.startsWith('127.') || 
                     clientIp.startsWith('172.') || 
                     clientIp.startsWith('10.') ||
                     clientIp.startsWith('192.168.') ||
                     clientIp === '::1' ||
                     clientIp === 'localhost';
  
  if (!isInternal && process.env.NODE_ENV === 'production') {
    logger.warn('External access attempt to internal API key validation', { clientIp, rawIp });
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    const { keyHash, secretHash } = req.body;
    
    if (!keyHash || !secretHash) {
      return res.status(400).json({ error: 'Missing keyHash or secretHash' });
    }
    
    const [apiKey] = await db
      .select()
      .from(externalApiKeys)
      .where(
        and(
          eq(externalApiKeys.keyHash, keyHash),
          eq(externalApiKeys.secretHash, secretHash),
          eq(externalApiKeys.isActive, true)
        )
      )
      .limit(1);
    
    if (!apiKey) {
      return res.json({ valid: false });
    }
    
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return res.json({ valid: false, reason: 'expired' });
    }
    
    logger.debug('API key validated via internal endpoint', { keyId: apiKey.id });
    
    res.json({
      valid: true,
      id: apiKey.id,
      name: apiKey.name,
      scopes: apiKey.scopes || ['read'],
      rateLimit: apiKey.rateLimit,
      rateLimitWindow: apiKey.rateLimitWindow
    });
    
  } catch (error) {
    logger.error('Internal API key validation error', { error: (error as Error).message });
    res.status(500).json({ error: 'Validation failed' });
  }
});

export default router;
