import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { MessageQueue } from '../queue/message-queue.js';
import { ChannelManager, ChannelType } from '../channels/channel-manager.js';
import { createLogger } from '../utils/logger.js';
import { persistMessageToDb, recordDeliveryLog, updateMessageStatus } from '../db/operations.js';

const logger = createLogger('messages-api');

const sendMessageSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp', 'push']),
  recipient: z.string().min(1),
  subject: z.string().optional(),
  body: z.string().min(1),
  priority: z.number().min(1).max(10).optional().default(5),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

const sendBulkSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp', 'push']),
  recipients: z.array(z.string().min(1)).min(1).max(1000),
  subject: z.string().optional(),
  body: z.string().min(1),
  priority: z.number().min(1).max(10).optional().default(5),
  metadata: z.record(z.any()).optional(),
});

export function createMessageRoutes(queue: MessageQueue, channelManager: ChannelManager): Router {
  const router = Router();

  router.post('/send', async (req: Request, res: Response) => {
    try {
      const data = sendMessageSchema.parse(req.body);

      if (!channelManager.isChannelEnabled(data.channel)) {
        return res.status(400).json({
          success: false,
          error: `Channel ${data.channel} is not enabled`,
        });
      }

      const messageId = await queue.enqueue({
        channel: data.channel as ChannelType,
        recipient: data.recipient,
        subject: data.subject,
        body: data.body,
        priority: data.priority,
        maxAttempts: 3,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        metadata: data.metadata,
      });

      await persistMessageToDb(
        messageId,
        data.channel,
        data.recipient,
        data.subject,
        data.body,
        data.priority,
        data.scheduledAt ? 'scheduled' : 'queued',
        data.metadata,
        data.scheduledAt ? new Date(data.scheduledAt) : undefined
      );

      logger.info(`Message enqueued: ${messageId} to ${data.channel}`);

      res.status(201).json({
        success: true,
        messageId,
        status: data.scheduledAt ? 'scheduled' : 'queued',
        queuedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      logger.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to queue message',
      });
    }
  });

  router.post('/send-bulk', async (req: Request, res: Response) => {
    try {
      const data = sendBulkSchema.parse(req.body);

      if (!channelManager.isChannelEnabled(data.channel)) {
        return res.status(400).json({
          success: false,
          error: `Channel ${data.channel} is not enabled`,
        });
      }

      const messageIds: string[] = [];
      const errors: { recipient: string; error: string }[] = [];

      for (const recipient of data.recipients) {
        try {
          const messageId = await queue.enqueue({
            channel: data.channel as ChannelType,
            recipient,
            subject: data.subject,
            body: data.body,
            priority: data.priority,
            maxAttempts: 3,
            metadata: data.metadata,
          });
          messageIds.push(messageId);

          await persistMessageToDb(
            messageId,
            data.channel,
            recipient,
            data.subject,
            data.body,
            data.priority,
            'queued',
            data.metadata
          );
        } catch (err: any) {
          errors.push({ recipient, error: err.message });
        }
      }

      logger.info(`Bulk send: ${messageIds.length} queued, ${errors.length} failed`);

      res.status(201).json({
        success: true,
        queued: messageIds.length,
        failed: errors.length,
        messageIds,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }

      logger.error('Bulk send error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to queue bulk messages',
      });
    }
  });

  router.post('/send-direct', async (req: Request, res: Response) => {
    try {
      const data = sendMessageSchema.parse(req.body);

      if (!channelManager.isChannelEnabled(data.channel)) {
        return res.status(400).json({
          success: false,
          error: `Channel ${data.channel} is not enabled`,
        });
      }

      const messageId = `msg_${uuidv4().substring(0, 12)}`;

      await persistMessageToDb(
        messageId,
        data.channel,
        data.recipient,
        data.subject,
        data.body,
        data.priority,
        'processing',
        data.metadata
      );

      const result = await channelManager.send(
        data.channel as ChannelType,
        data.recipient,
        data.subject,
        data.body,
        data.metadata
      );

      if (result.success) {
        await updateMessageStatus(messageId, 'delivered', 1, new Date());
        
        await recordDeliveryLog(
          result.messageId || messageId,
          data.channel,
          data.recipient,
          'delivered',
          result.providerResponse
        );

        res.json({
          success: true,
          messageId: result.messageId || messageId,
          status: 'sent',
          providerResponse: result.providerResponse,
        });
      } else {
        await updateMessageStatus(messageId, 'failed', 1, new Date());
        
        await recordDeliveryLog(
          messageId,
          data.channel,
          data.recipient,
          'failed',
          undefined,
          result.error
        );

        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }

      logger.error('Direct send error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message',
      });
    }
  });

  router.get('/queue/stats', async (req: Request, res: Response) => {
    try {
      const stats = queue.getStats();
      const queueLength = await queue.getQueueLength();

      res.json({
        ...stats,
        queueLength,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Queue stats error:', error);
      res.status(500).json({ error: 'Failed to get queue stats' });
    }
  });

  return router;
}
