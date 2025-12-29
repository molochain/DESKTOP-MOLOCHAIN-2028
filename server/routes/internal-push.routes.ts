import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendPushNotification, broadcastPushNotification, getConnectionStatus } from '../services/push-websocket-bridge';
import { logger } from '../utils/logger';

const router = Router();

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-comms-hub-key';

function validateInternalRequest(req: Request): { valid: boolean; error?: string } {
  const clientIP = req.ip || req.socket.remoteAddress || '';
  const forwardedFor = req.headers['x-forwarded-for'];
  
  const isLocalhost = 
    clientIP === '127.0.0.1' ||
    clientIP === '::1' ||
    clientIP === 'localhost' ||
    clientIP.includes('127.0.0.1') ||
    clientIP.includes('::ffff:127.0.0.1');
  
  const isInternalNetwork =
    clientIP.startsWith('10.') ||
    clientIP.startsWith('172.16.') ||
    clientIP.startsWith('172.17.') ||
    clientIP.startsWith('172.18.') ||
    clientIP.startsWith('172.19.') ||
    clientIP.startsWith('172.2') ||
    clientIP.startsWith('172.3') ||
    clientIP.startsWith('192.168.');
  
  const apiKey = req.headers['x-internal-api-key'] as string;
  const hasValidApiKey = apiKey === INTERNAL_API_KEY;
  
  if (isLocalhost || isInternalNetwork || hasValidApiKey) {
    return { valid: true };
  }
  
  logger.warn('Unauthorized internal API access attempt', {
    clientIP,
    forwardedFor,
    hasApiKey: !!apiKey
  });
  
  return {
    valid: false,
    error: 'Unauthorized: Request must come from localhost/internal network or include valid API key'
  };
}

const pushNotificationSchema = z.object({
  userId: z.number().int().positive(),
  notification: z.object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(2000),
    metadata: z.record(z.any()).optional()
  })
});

const broadcastSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1).max(1000),
  notification: z.object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(2000),
    metadata: z.record(z.any()).optional()
  })
});

router.post('/push-notification', async (req: Request, res: Response) => {
  const validation = validateInternalRequest(req);
  if (!validation.valid) {
    return res.status(403).json({
      success: false,
      error: validation.error
    });
  }

  const parseResult = pushNotificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request body',
      details: parseResult.error.errors
    });
  }

  const { userId, notification } = parseResult.data;
  
  const result = sendPushNotification(userId, notification);
  
  const statusCode = result.success ? 200 : 500;
  return res.status(statusCode).json(result);
});

router.post('/broadcast-notification', async (req: Request, res: Response) => {
  const validation = validateInternalRequest(req);
  if (!validation.valid) {
    return res.status(403).json({
      success: false,
      error: validation.error
    });
  }

  const parseResult = broadcastSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request body',
      details: parseResult.error.errors
    });
  }

  const { userIds, notification } = parseResult.data;
  
  const result = broadcastPushNotification(userIds, notification);
  
  return res.status(200).json({
    success: true,
    ...result
  });
});

router.get('/connection-status', async (req: Request, res: Response) => {
  const validation = validateInternalRequest(req);
  if (!validation.valid) {
    return res.status(403).json({
      success: false,
      error: validation.error
    });
  }

  const status = getConnectionStatus();
  
  return res.status(200).json({
    success: true,
    ...status
  });
});

export default router;
