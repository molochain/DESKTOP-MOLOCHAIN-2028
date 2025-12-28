import { Router, Request, Response } from 'express';
import { ChannelManager, ChannelType } from '../channels/channel-manager.js';
import { pleskClient } from '../plesk/plesk-client.js';
import { createLogger } from '../utils/logger.js';
import { z } from 'zod';

const logger = createLogger('channels-api');

const testChannelSchema = z.object({
  recipient: z.string().min(1),
  subject: z.string().optional(),
  body: z.string().optional(),
});

const createMailAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  mailbox: z.boolean().default(true),
  quota: z.number().positive().optional(),
});

export function createChannelRoutes(channelManager: ChannelManager): Router {
  const router = Router();

  router.get('/status', (req: Request, res: Response) => {
    const status = channelManager.getChannelStatus();
    const available = channelManager.getAvailableChannels();

    res.json({
      channels: status,
      available,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/:channel/status', (req: Request, res: Response) => {
    const channelType = req.params.channel as ChannelType;
    const channel = channelManager.getChannel(channelType);

    if (!channel) {
      return res.status(404).json({ error: `Channel ${channelType} not found` });
    }

    res.json(channel.getStatus());
  });

  router.post('/:channel/test', async (req: Request, res: Response) => {
    try {
      const channelType = req.params.channel as ChannelType;
      
      if (!channelManager.isChannelEnabled(channelType)) {
        return res.status(400).json({
          success: false,
          error: `Channel ${channelType} is not enabled`,
        });
      }

      const data = testChannelSchema.parse(req.body);

      const testBody = data.body || `This is a test message from MoloChain Communications Hub sent at ${new Date().toISOString()}`;
      const testSubject = data.subject || 'MoloChain Test Message';

      const result = await channelManager.send(
        channelType,
        data.recipient,
        testSubject,
        testBody,
        { isTest: true }
      );

      res.json({
        channel: channelType,
        recipient: data.recipient,
        ...result,
        testedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      logger.error('Test channel error:', error);
      res.status(500).json({ error: 'Failed to test channel' });
    }
  });

  router.get('/plesk/connection', async (req: Request, res: Response) => {
    try {
      const connected = await pleskClient.testConnection();
      res.json({
        connected,
        pleskUrl: process.env.PLESK_API_URL || 'not configured',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        connected: false,
        error: error.message,
      });
    }
  });

  router.get('/plesk/domains', async (req: Request, res: Response) => {
    try {
      const domains = await pleskClient.listDomains();
      res.json({ domains });
    } catch (error: any) {
      logger.error('List domains error:', error);
      res.status(500).json({ error: 'Failed to list domains' });
    }
  });

  router.post('/plesk/mail', async (req: Request, res: Response) => {
    try {
      const data = createMailAccountSchema.parse(req.body);
      const result = await pleskClient.createMailAccount(data);

      res.status(201).json({
        success: result.code === 0,
        message: result.stdout,
        email: data.email,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      logger.error('Create mail account error:', error);
      res.status(500).json({ error: 'Failed to create mail account' });
    }
  });

  router.delete('/plesk/mail/:email', async (req: Request, res: Response) => {
    try {
      const result = await pleskClient.deleteMailAccount(req.params.email);

      res.json({
        success: result.code === 0,
        message: result.stdout,
      });
    } catch (error: any) {
      logger.error('Delete mail account error:', error);
      res.status(500).json({ error: 'Failed to delete mail account' });
    }
  });

  router.get('/plesk/mail/:email', async (req: Request, res: Response) => {
    try {
      const result = await pleskClient.getMailAccountInfo(req.params.email);

      res.json({
        email: req.params.email,
        info: result.stdout,
      });
    } catch (error: any) {
      logger.error('Get mail account error:', error);
      res.status(500).json({ error: 'Failed to get mail account info' });
    }
  });

  return router;
}
