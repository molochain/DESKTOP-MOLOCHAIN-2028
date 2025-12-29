import { Router, Request, Response } from 'express';
import { eq, and, count, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { deliveryLogs, messageQueue, messageTemplates } from '../db/schema.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('analytics-api');

interface ChannelMetrics {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export function createAnalyticsRoutes(): Router {
  const router = Router();

  router.get('/overview', async (req: Request, res: Response) => {
    try {
      const channels = ['email', 'sms', 'whatsapp', 'push'];
      
      const stats: ChannelMetrics[] = await Promise.all(
        channels.map(async (channel) => {
          const [totals] = await db
            .select({ sent: count() })
            .from(deliveryLogs)
            .where(eq(deliveryLogs.channelType, channel));

          const [delivered] = await db
            .select({ count: count() })
            .from(deliveryLogs)
            .where(and(
              eq(deliveryLogs.channelType, channel),
              eq(deliveryLogs.status, 'delivered')
            ));

          const [failed] = await db
            .select({ count: count() })
            .from(deliveryLogs)
            .where(and(
              eq(deliveryLogs.channelType, channel),
              eq(deliveryLogs.status, 'failed')
            ));

          const sent = totals?.sent || 0;
          const deliveredCount = delivered?.count || 0;
          const failedCount = failed?.count || 0;

          return {
            channel,
            sent,
            delivered: deliveredCount,
            failed: failedCount,
            bounced: 0,
            opened: 0,
            clicked: 0,
            deliveryRate: sent > 0 ? Math.round((deliveredCount / sent) * 100) : 0,
            openRate: 0,
            clickRate: 0,
          };
        })
      );

      const summary = {
        totalSent: stats.reduce((sum, s) => sum + s.sent, 0),
        totalDelivered: stats.reduce((sum, s) => sum + s.delivered, 0),
        totalFailed: stats.reduce((sum, s) => sum + s.failed, 0),
        deliveryRate: 0,
      };

      if (summary.totalSent > 0) {
        summary.deliveryRate = Math.round((summary.totalDelivered / summary.totalSent) * 100);
      }

      res.json({
        summary,
        byChannel: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  router.get('/channel/:channel', async (req: Request, res: Response) => {
    try {
      const channel = req.params.channel;
      
      const [totals] = await db
        .select({ sent: count() })
        .from(deliveryLogs)
        .where(eq(deliveryLogs.channelType, channel));

      const [delivered] = await db
        .select({ count: count() })
        .from(deliveryLogs)
        .where(and(
          eq(deliveryLogs.channelType, channel),
          eq(deliveryLogs.status, 'delivered')
        ));

      const [failed] = await db
        .select({ count: count() })
        .from(deliveryLogs)
        .where(and(
          eq(deliveryLogs.channelType, channel),
          eq(deliveryLogs.status, 'failed')
        ));

      const sent = totals?.sent || 0;
      const deliveredCount = delivered?.count || 0;
      const failedCount = failed?.count || 0;

      res.json({
        channel,
        sent,
        delivered: deliveredCount,
        failed: failedCount,
        bounced: 0,
        opened: 0,
        clicked: 0,
        deliveryRate: sent > 0 ? Math.round((deliveredCount / sent) * 100) : 0,
        openRate: 0,
        clickRate: 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to fetch channel analytics:', error);
      res.status(500).json({ error: 'Failed to fetch channel analytics' });
    }
  });

  router.get('/messages', async (req: Request, res: Response) => {
    try {
      const { status, channel, limit = '50', offset = '0' } = req.query;
      
      let conditions = [];
      
      if (status && typeof status === 'string') {
        conditions.push(eq(messageQueue.status, status));
      }
      
      if (channel && typeof channel === 'string') {
        conditions.push(eq(messageQueue.channelType, channel));
      }

      const messages = conditions.length > 0
        ? await db.select().from(messageQueue)
            .where(and(...conditions))
            .limit(parseInt(limit as string))
            .offset(parseInt(offset as string))
            .orderBy(desc(messageQueue.createdAt))
        : await db.select().from(messageQueue)
            .limit(parseInt(limit as string))
            .offset(parseInt(offset as string))
            .orderBy(desc(messageQueue.createdAt));

      const totalQuery = db.select({ count: count() }).from(messageQueue);
      const [total] = conditions.length > 0 
        ? await totalQuery.where(and(...conditions))
        : await totalQuery;

      res.json({
        messages,
        total: total?.count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
    } catch (error) {
      logger.error('Failed to fetch messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  router.get('/delivery-logs', async (req: Request, res: Response) => {
    try {
      const { messageId, channel, status, limit = '50', offset = '0' } = req.query;
      
      let conditions = [];
      
      if (messageId && typeof messageId === 'string') {
        conditions.push(eq(deliveryLogs.messageId, messageId));
      }
      
      if (channel && typeof channel === 'string') {
        conditions.push(eq(deliveryLogs.channelType, channel));
      }

      if (status && typeof status === 'string') {
        conditions.push(eq(deliveryLogs.status, status));
      }

      const logs = conditions.length > 0
        ? await db.select().from(deliveryLogs)
            .where(and(...conditions))
            .limit(parseInt(limit as string))
            .offset(parseInt(offset as string))
            .orderBy(desc(deliveryLogs.createdAt))
        : await db.select().from(deliveryLogs)
            .limit(parseInt(limit as string))
            .offset(parseInt(offset as string))
            .orderBy(desc(deliveryLogs.createdAt));

      const totalLogsQuery = db.select({ count: count() }).from(deliveryLogs);
      const [total] = conditions.length > 0 
        ? await totalLogsQuery.where(and(...conditions))
        : await totalLogsQuery;

      res.json({
        logs,
        total: total?.count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
    } catch (error) {
      logger.error('Failed to fetch delivery logs:', error);
      res.status(500).json({ error: 'Failed to fetch delivery logs' });
    }
  });

  router.get('/templates/usage', async (req: Request, res: Response) => {
    try {
      const templates = await db.select().from(messageTemplates);
      
      const usage = await Promise.all(
        templates.map(async (template) => {
          const [sent] = await db
            .select({ count: count() })
            .from(messageQueue)
            .where(eq(messageQueue.templateId, template.id));

          return {
            templateId: template.id,
            slug: template.slug,
            name: template.name,
            channelType: template.channelType,
            usageCount: sent?.count || 0,
          };
        })
      );

      res.json({
        templates: usage,
        total: usage.length,
      });
    } catch (error) {
      logger.error('Failed to fetch template usage:', error);
      res.status(500).json({ error: 'Failed to fetch template usage' });
    }
  });

  return router;
}
