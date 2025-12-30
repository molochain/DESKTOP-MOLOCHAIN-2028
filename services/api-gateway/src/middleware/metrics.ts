import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('metrics');

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
  name: 'gateway_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status', 'service'],
  registers: [registry]
});

export const httpRequestDuration = new Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry]
});

export const wsConnectionsActive = new Gauge({
  name: 'gateway_ws_connections_active',
  help: 'Number of active WebSocket connections',
  labelNames: ['service'],
  registers: [registry]
});

export const wsMessagesTotal = new Counter({
  name: 'gateway_ws_messages_total',
  help: 'Total WebSocket messages proxied',
  labelNames: ['service', 'direction'],
  registers: [registry]
});

export const rateLimitHits = new Counter({
  name: 'gateway_rate_limit_hits_total',
  help: 'Number of rate limit hits',
  labelNames: ['service'],
  registers: [registry]
});

export const serviceHealth = new Gauge({
  name: 'gateway_service_health',
  help: 'Service health status (1=healthy, 0=unhealthy)',
  labelNames: ['service'],
  registers: [registry]
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const path = req.route?.path || req.path.split('/').slice(0, 3).join('/');
    const service = extractServiceFromPath(req.path);
    
    httpRequestsTotal.inc({
      method: req.method,
      path,
      status: res.statusCode.toString(),
      service
    });
    
    httpRequestDuration.observe(
      { method: req.method, path, status: res.statusCode.toString(), service },
      duration
    );
  });
  
  next();
}

function extractServiceFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  
  if (segments[0] === 'api' && segments[1]) {
    switch (segments[1]) {
      case 'v1': return 'molochain-core';
      case 'mololink': return 'mololink';
      case 'rayanava': return 'rayanava-gateway';
      case 'ai': return 'rayanava-ai';
      case 'comms': return 'communications-hub';
      case 'workflows': return 'rayanava-workflows';
      case 'voice': return 'rayanava-voice';
      case 'notifications': return 'rayanava-notifications';
      case 'monitoring': return 'rayanava-monitoring';
    }
  }
  
  return 'gateway';
}

export function getMetricsHandler() {
  return async (_req: Request, res: Response) => {
    try {
      res.setHeader('Content-Type', registry.contentType);
      res.send(await registry.metrics());
    } catch (error) {
      logger.error('Failed to collect metrics', { error: (error as Error).message });
      res.status(500).send('Error collecting metrics');
    }
  };
}
