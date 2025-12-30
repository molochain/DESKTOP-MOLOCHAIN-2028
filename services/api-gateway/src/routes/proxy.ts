import { Router, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { services, ServiceConfig } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.js';
import { circuitBreakerMiddleware, recordSuccess, recordFailure, RequestWithTiming } from '../middleware/circuit-breaker.js';
import { cacheMiddleware } from '../middleware/cache.js';

const logger = createLoggerWithContext('proxy');

const cacheableServices = new Set(['molochain-core', 'mololink']);
const cacheablePaths = [
  /\/api\/v1\/public\//,
  /\/api\/v1\/catalog\//,
  /\/api\/v1\/config\//
];

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
          proxyReq.setHeader('X-Gateway-Version', '1.0.0');
          
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.id.toString());
            proxyReq.setHeader('X-User-Email', req.user.email);
            proxyReq.setHeader('X-User-Role', req.user.role);
          }
          
          if (req.apiKey) {
            proxyReq.setHeader('X-API-Key-ID', req.apiKey.id.toString());
            proxyReq.setHeader('X-API-Key-Name', req.apiKey.name);
            proxyReq.setHeader('X-API-Key-Scopes', req.apiKey.scopes.join(','));
          }
          
          if (req.apiVersion) {
            proxyReq.setHeader('X-API-Version', req.apiVersion);
          }
          
          logger.debug('Proxying request', {
            service: service.name,
            path: req.path,
            target: service.target
          });
        },
        proxyRes: (proxyRes, req: any) => {
          const startTime = (req as RequestWithTiming).gatewayStartTime || Date.now();
          const duration = Date.now() - startTime;
          
          if (proxyRes.statusCode && proxyRes.statusCode < 500) {
            recordSuccess(service.name);
          } else {
            recordFailure(service.name);
          }
          
          logger.info('Request proxied', {
            service: service.name,
            path: req.path,
            status: proxyRes.statusCode,
            duration
          });
        },
        error: (err, req: any, res: any) => {
          recordFailure(service.name);
          
          logger.error('Proxy error', {
            service: service.name,
            path: req?.path,
            error: err.message
          });
          
          if (res && !res.headersSent) {
            res.status(503).json({
              error: 'Service Unavailable',
              message: `${service.name} is temporarily unavailable`,
              service: service.name,
              retryAfter: 30
            });
          }
        }
      }
    };
    
    const proxy = createProxyMiddleware(proxyOptions);
    
    const middlewares: any[] = [
      circuitBreakerMiddleware(service.name),
      authMiddleware(service.authentication || 'both'),
      rateLimitMiddleware(service)
    ];
    
    if (cacheableServices.has(service.name)) {
      middlewares.push(cacheMiddleware({
        ttl: 60,
        methods: ['GET'],
        paths: cacheablePaths
      }));
    }
    
    middlewares.push(proxy);
    
    router.use(service.pathPrefix, ...middlewares);
    
    logger.info('Proxy route registered', {
      service: service.name,
      prefix: service.pathPrefix,
      target: service.target,
      auth: service.authentication,
      circuitBreaker: true,
      cache: cacheableServices.has(service.name)
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
