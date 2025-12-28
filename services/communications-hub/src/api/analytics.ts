import { Router, Request, Response } from 'express';
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

interface TimeSeriesData {
  timestamp: string;
  sent: number;
  delivered: number;
  failed: number;
}

const metricsStore: Map<string, ChannelMetrics> = new Map([
  ['email', { channel: 'email', sent: 0, delivered: 0, failed: 0, bounced: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }],
  ['sms', { channel: 'sms', sent: 0, delivered: 0, failed: 0, bounced: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }],
  ['whatsapp', { channel: 'whatsapp', sent: 0, delivered: 0, failed: 0, bounced: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }],
  ['push', { channel: 'push', sent: 0, delivered: 0, failed: 0, bounced: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }],
]);

export function recordMetric(channel: string, event: 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked'): void {
  const metrics = metricsStore.get(channel);
  if (metrics) {
    metrics[event]++;
    
    if (metrics.sent > 0) {
      metrics.deliveryRate = (metrics.delivered / metrics.sent) * 100;
      metrics.openRate = (metrics.opened / metrics.delivered) * 100 || 0;
      metrics.clickRate = (metrics.clicked / metrics.opened) * 100 || 0;
    }
  }
}

export function createAnalyticsRoutes(): Router {
  const router = Router();

  router.get('/overview', (req: Request, res: Response) => {
    const channels = Array.from(metricsStore.values());
    
    const totals = channels.reduce((acc, ch) => ({
      sent: acc.sent + ch.sent,
      delivered: acc.delivered + ch.delivered,
      failed: acc.failed + ch.failed,
      bounced: acc.bounced + ch.bounced,
      opened: acc.opened + ch.opened,
      clicked: acc.clicked + ch.clicked,
    }), { sent: 0, delivered: 0, failed: 0, bounced: 0, opened: 0, clicked: 0 });

    const overallDeliveryRate = totals.sent > 0 ? (totals.delivered / totals.sent) * 100 : 0;

    res.json({
      summary: {
        totalSent: totals.sent,
        totalDelivered: totals.delivered,
        totalFailed: totals.failed,
        deliveryRate: Math.round(overallDeliveryRate * 100) / 100,
      },
      byChannel: channels,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/channel/:channel', (req: Request, res: Response) => {
    const metrics = metricsStore.get(req.params.channel);
    
    if (!metrics) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/timeseries', (req: Request, res: Response) => {
    const { channel, period = '24h', interval = '1h' } = req.query;

    const now = new Date();
    const data: TimeSeriesData[] = [];
    
    const hours = period === '24h' ? 24 : period === '7d' ? 168 : 24;
    const step = interval === '1h' ? 1 : interval === '6h' ? 6 : 1;

    for (let i = hours; i >= 0; i -= step) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        sent: Math.floor(Math.random() * 100),
        delivered: Math.floor(Math.random() * 95),
        failed: Math.floor(Math.random() * 5),
      });
    }

    res.json({
      channel: channel || 'all',
      period,
      interval,
      data,
    });
  });

  router.get('/delivery-logs', (req: Request, res: Response) => {
    const { channel, status, limit = 50, offset = 0 } = req.query;

    const logs = [
      {
        id: '1',
        messageId: 'msg_abc123',
        channel: 'email',
        recipient: 'user@example.com',
        status: 'delivered',
        sentAt: new Date(Date.now() - 300000).toISOString(),
        deliveredAt: new Date(Date.now() - 295000).toISOString(),
      },
      {
        id: '2',
        messageId: 'msg_def456',
        channel: 'sms',
        recipient: '+1234567890',
        status: 'sent',
        sentAt: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: '3',
        messageId: 'msg_ghi789',
        channel: 'whatsapp',
        recipient: '+9876543210',
        status: 'failed',
        sentAt: new Date(Date.now() - 900000).toISOString(),
        error: 'Invalid phone number format',
      },
    ];

    let filtered = logs;
    if (channel) {
      filtered = filtered.filter(l => l.channel === channel);
    }
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }

    res.json({
      logs: filtered,
      total: filtered.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  });

  router.get('/top-recipients', (req: Request, res: Response) => {
    const { channel, limit = 10 } = req.query;

    const recipients = [
      { recipient: 'user1@example.com', channel: 'email', messageCount: 150, lastSent: new Date().toISOString() },
      { recipient: '+1234567890', channel: 'sms', messageCount: 85, lastSent: new Date().toISOString() },
      { recipient: 'user2@example.com', channel: 'email', messageCount: 72, lastSent: new Date().toISOString() },
    ];

    res.json({
      recipients: recipients.slice(0, Number(limit)),
      timestamp: new Date().toISOString(),
    });
  });

  router.post('/reset', (req: Request, res: Response) => {
    for (const [key, metrics] of metricsStore) {
      metrics.sent = 0;
      metrics.delivered = 0;
      metrics.failed = 0;
      metrics.bounced = 0;
      metrics.opened = 0;
      metrics.clicked = 0;
      metrics.deliveryRate = 0;
      metrics.openRate = 0;
      metrics.clickRate = 0;
    }

    logger.info('Analytics metrics reset');
    res.json({ success: true, message: 'Metrics reset successfully' });
  });

  return router;
}
