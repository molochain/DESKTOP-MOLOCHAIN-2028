import { Router } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { services, ServiceConfig } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';

const logger = createLoggerWithContext('proxy');

export function createProxyRouter(): Router {
  const router = Router();
  
  for (const service of services) {
    const proxyOptions: Options = {
      target: service.target,
      changeOrigin: true,
      pathRewrite: {
        [`^${service.pathPrefix}`]: ''
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          proxyReq.setHeader('X-Request-ID', req.requestId || '');
          proxyReq.setHeader('X-Correlation-ID', req.correlationId || '');
          proxyReq.setHeader('X-Forwarded-For', req.ip || '');
          proxyReq.setHeader('X-Gateway-Time', Date.now().toString());
          
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.id.toString());
            proxyReq.setHeader('X-User-Email', req.user.email);
            proxyReq.setHeader('X-User-Role', req.user.role);
          }
          
          if (req.apiKey) {
            proxyReq.setHeader('X-API-Key-ID', req.apiKey.id.toString());
            proxyReq.setHeader('X-API-Key-Name', req.apiKey.name);
          }
          
          logger.debug('Proxying request', {
            service: service.name,
            path: req.path,
            target: service.target
          });
        },
        proxyRes: (proxyRes, req: any) => {
          const duration = Date.now() - (parseInt(req.headers['x-gateway-time'] as string) || Date.now());
          logger.info('Request proxied', {
            service: service.name,
            path: req.path,
            status: proxyRes.statusCode,
            duration
          });
        },
        error: (err, req: any, res: any) => {
          logger.error('Proxy error', {
            service: service.name,
            path: req?.path,
            error: err.message
          });
          
          if (res && !res.headersSent) {
            res.status(503).json({
              error: 'Service Unavailable',
              message: `${service.name} is temporarily unavailable`,
              service: service.name
            });
          }
        }
      }
    };
    
    const proxy = createProxyMiddleware(proxyOptions);
    
    router.use(
      service.pathPrefix,
      authMiddleware(service.authentication || 'both'),
      rateLimitMiddleware(service),
      proxy
    );
    
    logger.info('Proxy route registered', {
      service: service.name,
      prefix: service.pathPrefix,
      target: service.target,
      auth: service.authentication
    });
  }
  
  return router;
}

export function getProxiesForWebSocket(): Map<string, { service: ServiceConfig; target: string }> {
  const wsProxies = new Map<string, { service: ServiceConfig; target: string }>();
  
  for (const service of services) {
    if (service.wsEnabled && service.wsPath) {
      wsProxies.set(service.wsPath, {
        service,
        target: service.target.replace('http://', 'ws://').replace('https://', 'wss://')
      });
    }
  }
  
  return wsProxies;
}
