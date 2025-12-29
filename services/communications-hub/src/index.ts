import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createLogger } from './utils/logger.js';
import { createMessageRoutes } from './api/messages.js';
import { createTemplateRoutes } from './api/templates.js';
import { createChannelRoutes } from './api/channels.js';
import { createAnalyticsRoutes } from './api/analytics.js';
import { MessageQueue } from './queue/message-queue.js';
import { ChannelManager } from './channels/channel-manager.js';
import { testConnection, closePool } from './db/index.js';

const logger = createLogger('main');
const PORT = process.env.PORT || 7020;

async function main() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.warn('Database connection failed - running with limited functionality');
  } else {
    logger.info('Database connected successfully');
  }

  const channelManager = new ChannelManager();
  await channelManager.initialize();

  const messageQueue = new MessageQueue(channelManager);
  await messageQueue.initialize();

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'molochain-communications-hub',
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      channels: channelManager.getChannelStatus(),
      queue: messageQueue.getStats(),
    });
  });

  app.use('/api/messages', createMessageRoutes(messageQueue, channelManager));
  app.use('/api/templates', createTemplateRoutes());
  app.use('/api/channels', createChannelRoutes(channelManager));
  app.use('/api/analytics', createAnalyticsRoutes());

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  const server = app.listen(PORT, () => {
    logger.info(`Communications Hub started on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    logger.info(`Database: ${dbConnected ? 'PostgreSQL connected' : 'Not connected'}`);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await messageQueue.shutdown();
    await closePool();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

main().catch((err) => {
  logger.error('Failed to start Communications Hub:', err);
  process.exit(1);
});
