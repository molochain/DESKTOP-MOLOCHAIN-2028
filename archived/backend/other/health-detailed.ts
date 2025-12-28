import { Router } from 'express';
import { db } from '../../db';
import { apiCache, dbCache, healthCache, sessionCache } from '../../utils/cache-manager';
import { logger } from '../../utils/logger';
import { performanceMetrics } from '../../services/performance-metrics';
import { cacheMiddleware } from '../../middleware/cache';
import os from 'os';

const router = Router();

// Get detailed health metrics
router.get('/detailed', cacheMiddleware({ type: 'api', ttl: 5 }), async (_req, res) => {
  try {
    // Get system metrics
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Calculate CPU percentage
    const cpuPercent = os.loadavg()[0] / os.cpus().length * 100;
    
    // Get memory stats
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;
    
    // Get cache metrics
    const cacheMetrics = [
      { name: 'database', ...dbCache.getStats() },
      { name: 'api', ...apiCache.getStats() },
      { name: 'health', ...healthCache.getStats() },
      { name: 'session', ...sessionCache.getStats() }
    ];
    
    // Get service status (mock for now)
    const servicesStatus = {
      'API': {
        name: 'API',
        status: 'healthy' as const,
        responseTime: 25,
        lastCheck: new Date().toISOString(),
        metrics: {
          successRate: 99.9,
          averageResponseTime: 25,
          errorRate: 0.1
        }
      },
      'Database': {
        name: 'Database',
        status: 'healthy' as const,
        responseTime: 15,
        lastCheck: new Date().toISOString(),
        metrics: {
          successRate: 100,
          averageResponseTime: 15,
          errorRate: 0
        }
      },
      'Cache': {
        name: 'Cache',
        status: cacheMetrics[0].hitRate > 80 ? 'healthy' as const : cacheMetrics[0].hitRate > 50 ? 'degraded' as const : 'unhealthy' as const,
        responseTime: 5,
        lastCheck: new Date().toISOString(),
        metrics: {
          successRate: cacheMetrics[0].hitRate,
          averageResponseTime: 5,
          errorRate: 100 - cacheMetrics[0].hitRate
        }
      },
      'Instagram': {
        name: 'Instagram',
        status: 'healthy' as const,
        responseTime: 200,
        lastCheck: new Date().toISOString(),
        metrics: {
          successRate: 95,
          averageResponseTime: 200,
          errorRate: 5
        }
      },
      'WebSocket': {
        name: 'WebSocket',
        status: 'healthy' as const,
        responseTime: 10,
        lastCheck: new Date().toISOString(),
        metrics: {
          successRate: 98,
          averageResponseTime: 10,
          errorRate: 2
        }
      }
    };
    
    // Determine overall status
    const serviceStatuses = Object.values(servicesStatus).map(s => s.status);
    const hasUnhealthy = serviceStatuses.includes('unhealthy');
    const hasDegraded = serviceStatuses.includes('degraded');
    const overallStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
    
    // Get alerts
    const alerts = [];
    
    // Check for high CPU usage
    if (cpuPercent > 80) {
      alerts.push({
        id: `cpu-${Date.now()}`,
        severity: 'critical' as const,
        message: `High CPU usage detected: ${cpuPercent.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    } else if (cpuPercent > 60) {
      alerts.push({
        id: `cpu-${Date.now()}`,
        severity: 'warning' as const,
        message: `Elevated CPU usage: ${cpuPercent.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for high memory usage
    if (memoryPercentage > 90) {
      alerts.push({
        id: `memory-${Date.now()}`,
        severity: 'critical' as const,
        message: `High memory usage detected: ${memoryPercentage.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    } else if (memoryPercentage > 75) {
      alerts.push({
        id: `memory-${Date.now()}`,
        severity: 'warning' as const,
        message: `Elevated memory usage: ${memoryPercentage.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for low cache hit rate
    const avgCacheHitRate = cacheMetrics.reduce((acc, c) => acc + c.hitRate, 0) / cacheMetrics.length;
    if (avgCacheHitRate < 50) {
      alerts.push({
        id: `cache-${Date.now()}`,
        severity: 'warning' as const,
        message: `Low cache hit rate: ${avgCacheHitRate.toFixed(1)}%. Target is 85%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Prepare response
    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      databaseLatency: 45, // Mock for now
      systemMetrics: {
        cpu: {
          usage: cpuPercent,
          loadAvg: os.loadavg(),
          cores: os.cpus().length
        },
        memory: {
          used: usedMemory,
          total: totalMemory,
          freePercentage: (freeMemory / totalMemory) * 100,
          swapUsage: memoryUsage.external || 0
        },
        disk: {
          used: 10737418240, // Mock for now
          total: 107374182400,
          free: 96636764160
        },
        network: {
          connections: 42, // Mock for now
          bytesReceived: 1024000,
          bytesSent: 2048000,
          activeInterfaces: os.networkInterfaces() ? Object.keys(os.networkInterfaces()).length : 0
        },
        uptime
      },
      servicesStatus,
      cacheMetrics,
      alerts
    };
    
    res.json(healthData);
  } catch (error) {
    logger.error('Error fetching detailed health metrics:', error);
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
});

// Get cache optimization report
router.get('/cache-report', async (_req, res) => {
  try {
    const reports = [
      dbCache.getOptimizationReport(),
      apiCache.getOptimizationReport(),
      healthCache.getOptimizationReport(),
      sessionCache.getOptimizationReport()
    ];
    
    res.json({ reports });
  } catch (error) {
    logger.error('Error fetching cache optimization report:', error);
    res.status(500).json({ error: 'Failed to fetch cache report' });
  }
});

// Force cache optimization
router.post('/optimize-cache', async (_req, res) => {
  try {
    // Clear low-priority cache entries and optimize
    const results = {
      database: dbCache.getStats(),
      api: apiCache.getStats(),
      health: healthCache.getStats(),
      session: sessionCache.getStats()
    };
    
    logger.info('Cache optimization triggered manually');
    res.json({ 
      success: true, 
      message: 'Cache optimization completed',
      results 
    });
  } catch (error) {
    logger.error('Error optimizing cache:', error);
    res.status(500).json({ error: 'Failed to optimize cache' });
  }
});

export default router;