import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';

import { gatewayConfig } from './config/services.js';
import { logger } from './utils/logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { initializeRateLimiter } from './middleware/rate-limit.js';
import { createProxyRouter } from './routes/proxy.js';
import { createHealthRouter } from './routes/health.js';
import { initializeWebSocketGateway } from './routes/websocket.js';
import { metricsMiddleware, getMetricsHandler } from './middleware/metrics.js';
import { initializeCache } from './middleware/cache.js';
import { securityMiddleware } from './middleware/security.js';
import { requestLoggerMiddleware, auditLogMiddleware } from './middleware/request-logger.js';
import { apiVersioningMiddleware } from './middleware/api-versioning.js';
import { validateRequestSize } from './middleware/request-validation.js';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth.js';

const sensitiveEndpoints = [
  /^\/$/,
  /^\/schema/,
  /^\/docs/,
  /^\/swagger/,
  /^\/api-docs/,
  /^\/openapi/,
  /^\/debug/,
  /^\/internal/
];

function isSensitivePath(path: string): boolean {
  return sensitiveEndpoints.some(pattern => pattern.test(path));
}

async function startGateway() {
  const app = express();
  
  app.set('trust proxy', true);
  
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  
  app.use(compression());
  
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    },
    skip: (req) => req.path === '/health/live' || req.path === '/health/ready'
  }));
  
  app.use(corsMiddleware);
  
  app.use(requestIdMiddleware as any);
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use(securityMiddleware());
  
  app.use(validateRequestSize());
  
  await initializeRateLimiter();
  await initializeCache();
  
  app.use(metricsMiddleware);
  
  app.use(requestLoggerMiddleware());
  
  app.get('/health/live', (_req, res) => {
    res.json({ status: 'live', timestamp: new Date().toISOString() });
  });
  
  app.get('/health/ready', (_req, res) => {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  });
  
  app.use(createHealthRouter());
  
  app.get('/version', (_req, res) => {
    res.json({
      gateway: '1.0.0',
      api: { current: 'v1', supported: ['v1', 'v2'] }
    });
  });
  
  app.get('/metrics', (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    
    if (!authHeader && !apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required for metrics endpoint'
      });
    }
    
    next();
  }, getMetricsHandler());
  
  app.use((req, res, next) => {
    if (isSensitivePath(req.path)) {
      logger.warn('Sensitive endpoint access blocked', {
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
      });
    }
    next();
  });
  
  app.use(auditLogMiddleware());
  
  app.use(apiVersioningMiddleware());
  
  app.use(createProxyRouter());
  
  app.use((_req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      gateway: 'molochain-api-gateway'
    });
  });
  
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
      });
    }
  });
  
  const server = createServer(app);
  
  initializeWebSocketGateway(server);
  
  server.listen(gatewayConfig.port, gatewayConfig.host, () => {
    logger.info('API Gateway started', {
      host: gatewayConfig.host,
      port: gatewayConfig.port,
      env: process.env.NODE_ENV || 'development',
      features: [
        'circuit-breaker',
        'rate-limiting',
        'caching',
        'request-logging',
        'security-middleware',
        'api-versioning',
        'request-validation'
      ]
    });
    
    logger.info('Registered services', {
      count: 9,
      services: [
        'molochain-core',
        'mololink', 
        'rayanava-gateway',
        'rayanava-ai',
        'communications-hub',
        'rayanava-workflows',
        'rayanava-voice',
        'rayanava-notifications',
        'rayanava-monitoring'
      ]
    });
  });
  
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

startGateway().catch((error) => {
  logger.error('Failed to start gateway', { error: error.message });
  process.exit(1);
});
