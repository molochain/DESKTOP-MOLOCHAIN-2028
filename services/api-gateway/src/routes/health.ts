import { Router, Request, Response } from 'express';
import { services } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';
import { getWebSocketStats } from './websocket.js';
import { getCircuitStats } from '../middleware/circuit-breaker.js';
import { getCacheStats } from '../middleware/cache.js';
import { getVersionInfo } from '../middleware/api-versioning.js';

const logger = createLoggerWithContext('health');

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

const serviceHealth: Map<string, ServiceHealth> = new Map();

async function checkServiceHealth(service: typeof services[0]): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const healthUrl = `${service.target}${service.healthCheck || '/health'}`;
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    const responseTime = Date.now() - startTime;
    
    return {
      name: service.name,
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: (error as Error).message
    };
  }
}

async function checkAllServices(): Promise<ServiceHealth[]> {
  const checks = await Promise.all(
    services.map(async (service) => {
      const health = await checkServiceHealth(service);
      serviceHealth.set(service.name, health);
      return health;
    })
  );
  
  return checks;
}

setInterval(() => {
  checkAllServices().catch(err => {
    logger.error('Health check cycle failed', { error: err.message });
  });
}, 30000);

export function createHealthRouter(): Router {
  const router = Router();
  
  router.get('/health', async (_req: Request, res: Response) => {
    const wsStats = getWebSocketStats();
    const circuitStats = getCircuitStats();
    const cacheStats = getCacheStats();
    
    const cachedHealth = Array.from(serviceHealth.values());
    const allHealthy = cachedHealth.length === 0 || 
                       cachedHealth.every(h => h.status === 'healthy');
    
    const openCircuits = Object.values(circuitStats).filter(c => c.state === 'open').length;
    
    res.status(allHealthy && openCircuits === 0 ? 200 : 503).json({
      status: allHealthy && openCircuits === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      gateway: {
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        features: ['circuit-breaker', 'rate-limiting', 'caching', 'security']
      },
      circuits: circuitStats,
      cache: cacheStats,
      websocket: wsStats,
      services: cachedHealth.length > 0 ? cachedHealth : 'checking...'
    });
  });
  
  router.get('/health/services', async (_req: Request, res: Response) => {
    try {
      const health = await checkAllServices();
      const circuitStats = getCircuitStats();
      
      res.json({
        timestamp: new Date().toISOString(),
        services: health.map(h => ({
          ...h,
          circuit: circuitStats[h.name] || { state: 'closed', failures: 0 }
        }))
      });
    } catch (error) {
      res.status(500).json({
        error: 'Health check failed',
        message: (error as Error).message
      });
    }
  });
  
  router.get('/health/ready', (_req: Request, res: Response) => {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  });
  
  router.get('/health/live', (_req: Request, res: Response) => {
    res.json({ status: 'live', timestamp: new Date().toISOString() });
  });
  
  router.get('/version', (_req: Request, res: Response) => {
    const versionInfo = getVersionInfo();
    res.json({
      gateway: '1.0.0',
      api: versionInfo
    });
  });
  
  return router;
}
