import { Router, Request, Response, raw } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { serviceRepository } from './repository';
import { serviceCacheService } from './cache';
import { createLoggerWithContext } from '../../../utils/logger';

const logger = createLoggerWithContext('services-v1-webhook');

// Webhook payload schema validation
// Note: Services use 'id' as identifier (e.g., "container", "trucking")
// Accept both 'id' and 'slug' for backwards compatibility, prefer 'id'
const webhookPayloadSchema = z.object({
  event: z.enum(['service.created', 'service.updated', 'service.deleted', 'services.bulk_update']),
  timestamp: z.string(),
  data: z.object({
    id: z.string().optional(),        // Preferred: service identifier (e.g., "container")
    slug: z.string().optional(),      // Legacy: alias for id
    ids: z.array(z.string()).optional(),   // For bulk operations
    slugs: z.array(z.string()).optional(), // Legacy: alias for ids
    action: z.string().optional(),
  }),
  signature: z.string().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

interface WebhookLog {
  id: string;
  event: string;
  timestamp: Date;
  success: boolean;
  processingTime: number;
  remoteIp?: string;
  error?: string;
}

class ServiceWebhookHandler {
  private static instance: ServiceWebhookHandler;
  private logs: WebhookLog[] = [];
  private maxLogs = 100;

  private constructor() {
    if (!this.getWebhookSecret() && process.env.NODE_ENV === 'production') {
      logger.warn('CMS_WEBHOOK_SECRET not configured - webhook signature verification disabled');
    }
  }

  private getWebhookSecret(): string {
    return process.env.CMS_WEBHOOK_SECRET || '';
  }

  static getInstance(): ServiceWebhookHandler {
    if (!ServiceWebhookHandler.instance) {
      ServiceWebhookHandler.instance = new ServiceWebhookHandler();
    }
    return ServiceWebhookHandler.instance;
  }

  private verifySignature(rawBody: Buffer | string, signature: string): boolean {
    const secret = this.getWebhookSecret();
    if (!secret) {
      // In development without secret, allow unsigned requests
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Signature verification skipped - no secret configured (development mode)');
        return true;
      }
      // In production without secret, reject all requests with signatures
      logger.error('Signature verification failed - CMS_WEBHOOK_SECRET not configured');
      return false;
    }

    const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    try {
      // Constant-time comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      
      if (sigBuffer.length !== expectedBuffer.length) {
        logger.debug('Signature length mismatch', { 
          receivedLength: sigBuffer.length, 
          expectedLength: expectedBuffer.length 
        });
        return false;
      }
      
      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (error) {
      logger.error('Signature comparison error', { error: error instanceof Error ? error.message : 'Unknown' });
      return false;
    }
  }

  private addLog(log: WebhookLog) {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  async handleWebhook(
    payload: WebhookPayload, 
    rawBody: Buffer | string,
    signatureHeader?: string,
    remoteIp?: string
  ): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now();
    const logId = crypto.randomUUID();

    // Get service identifier (prefer 'id' over 'slug' for compatibility)
    const serviceId = payload.data.id || payload.data.slug;
    const serviceIds = payload.data.ids || payload.data.slugs;

    logger.info('Webhook received', { 
      event: payload.event, 
      logId,
      hasSignature: !!signatureHeader,
      remoteIp: remoteIp || 'unknown',
      serviceId,
      serviceIdCount: serviceIds?.length
    });

    try {
      // Verify signature if provided or required
      if (signatureHeader) {
        if (!this.verifySignature(rawBody, signatureHeader)) {
          throw new Error('Invalid webhook signature');
        }
        logger.debug('Signature verified successfully', { logId });
      } else if (process.env.NODE_ENV === 'production' && this.webhookSecret) {
        // In production with secret configured, require signature
        throw new Error('Missing webhook signature header');
      }

      switch (payload.event) {
        case 'service.created':
        case 'service.updated':
          if (serviceId) {
            await this.handleServiceUpdate(serviceId);
          } else {
            logger.warn('service.updated event missing id/slug', { logId });
          }
          break;

        case 'service.deleted':
          if (serviceId) {
            await this.handleServiceDelete(serviceId);
          } else {
            logger.warn('service.deleted event missing id/slug', { logId });
          }
          break;

        case 'services.bulk_update':
          await this.handleBulkUpdate();
          break;

        default:
          logger.warn('Unknown webhook event', { event: (payload as any).event, logId });
      }

      const processingTime = Date.now() - startTime;
      this.addLog({
        id: logId,
        event: payload.event,
        timestamp: new Date(),
        success: true,
        processingTime,
        remoteIp,
      });

      logger.info('Webhook processed successfully', { 
        event: payload.event, 
        processingTime, 
        logId 
      });

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.addLog({
        id: logId,
        event: payload.event,
        timestamp: new Date(),
        success: false,
        processingTime,
        remoteIp,
        error: errorMessage,
      });

      logger.error('Webhook processing failed', { 
        event: payload.event, 
        error: errorMessage, 
        logId,
        serviceId,
        remoteIp
      });

      throw error;
    }
  }

  private async handleServiceUpdate(serviceId: string) {
    await serviceCacheService.invalidateService(serviceId);
    await serviceCacheService.invalidateCatalog();
    
    logger.info('Service cache invalidated after update', { serviceId });
  }

  private async handleServiceDelete(serviceId: string) {
    await serviceCacheService.invalidateService(serviceId);
    await serviceCacheService.invalidateCatalog();
    
    logger.info('Service cache invalidated after delete', { serviceId });
  }

  private async handleBulkUpdate() {
    await serviceRepository.syncFromCMS();
    await serviceCacheService.invalidateAll();
    
    logger.info('Bulk update: Full sync completed and cache invalidated');
  }

  getLogs(): WebhookLog[] {
    return [...this.logs];
  }

  getStats(): { 
    totalReceived: number; 
    successRate: number; 
    avgProcessingTime: number;
    secretConfigured: boolean;
  } {
    const total = this.logs.length;
    const successful = this.logs.filter(l => l.success).length;
    const avgTime = total > 0 
      ? this.logs.reduce((sum, l) => sum + l.processingTime, 0) / total 
      : 0;

    return {
      totalReceived: total,
      successRate: total > 0 ? (successful / total) * 100 : 100,
      avgProcessingTime: Math.round(avgTime),
      secretConfigured: !!this.getWebhookSecret(),
    };
  }
}

export const serviceWebhookHandler = ServiceWebhookHandler.getInstance();

const webhookRouter = Router();

// Capture raw body for signature verification
webhookRouter.use('/cms', raw({ type: 'application/json' }));

webhookRouter.post('/cms', async (req: Request, res: Response) => {
  try {
    // Get raw body (either from raw middleware or stringify parsed body as fallback)
    const rawBody = Buffer.isBuffer(req.body) 
      ? req.body 
      : JSON.stringify(req.body);
    
    // Parse body if it was captured as raw
    const parsedBody = Buffer.isBuffer(req.body) 
      ? JSON.parse(req.body.toString('utf8'))
      : req.body;

    // Validate payload schema
    const validationResult = webhookPayloadSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      logger.warn('Invalid webhook payload', { 
        errors: validationResult.error.issues,
        remoteIp: req.ip 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook payload',
        errors: validationResult.error.issues.map(i => i.message)
      });
    }

    const payload = validationResult.data;
    const signatureHeader = req.headers['x-signature'] as string | undefined 
      || req.headers['x-cms-signature'] as string | undefined;
    
    const result = await serviceWebhookHandler.handleWebhook(
      payload, 
      rawBody,
      signatureHeader,
      req.ip
    );
    
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
    logger.error('Webhook endpoint error', { 
      error: errorMessage,
      remoteIp: req.ip
    });
    res.status(400).json({ 
      success: false, 
      message: errorMessage
    });
  }
});

webhookRouter.get('/status', (_req: Request, res: Response) => {
  const stats = serviceWebhookHandler.getStats();
  const logs = serviceWebhookHandler.getLogs().slice(0, 10);
  res.json({ stats, recentLogs: logs });
});

// Test endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  webhookRouter.post('/test', async (req: Request, res: Response) => {
    try {
      const testPayload: WebhookPayload = {
        event: 'services.bulk_update',
        timestamp: new Date().toISOString(),
        data: { action: 'test' }
      };
      
      const result = await serviceWebhookHandler.handleWebhook(
        testPayload,
        JSON.stringify(testPayload),
        undefined,
        req.ip
      );
      
      res.json({ ...result, note: 'This is a test endpoint for development only' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Test failed' 
      });
    }
  });
}

export default webhookRouter;
