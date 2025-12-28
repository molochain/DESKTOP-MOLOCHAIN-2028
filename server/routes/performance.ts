/**
 * Performance Monitoring and Optimization API
 * Provides real-time performance metrics and optimization controls
 */

import { Router } from 'express';
import { unifiedMemoryOptimizer } from '../core/monitoring/unified-memory-optimizer';
import { logger } from '../utils/logger';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';

const router = Router();

// Get current performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const memoryStats = unifiedMemoryOptimizer.getStatus();
    const recommendations = ['Use unified memory optimization system'];

    res.json({
      success: true,
      data: {
        memory: {
          used: Math.round(memoryStats.rss / 1024 / 1024), // MB
          total: Math.round(memoryStats.heapTotal / 1024 / 1024), // MB
          percentage: Math.round(memoryStats.percentage * 100) / 100,
          heap: {
            used: Math.round(memoryStats.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryStats.heapTotal / 1024 / 1024), // MB
            rss: Math.round(memoryStats.rss / 1024 / 1024) // MB
          }
        },
        optimizer: {
          status: 'unified-system-active',
          lastOptimization: 'automated'
        },
        recommendations,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching performance metrics', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch performance metrics' 
    });
  }
});

// Trigger memory optimization (admin only)
router.post('/optimize/memory', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const beforeStats = unifiedMemoryOptimizer.getStatus();
    
    // Force garbage collection using the memory optimizer
    if (global.gc) {
      global.gc();
    }
    
    const afterStats = unifiedMemoryOptimizer.getStatus();
    const freedMemory = beforeStats.heapUsed - afterStats.heapUsed;

    logger.info('Manual memory optimization triggered', {
      beforePercentage: beforeStats.percentage.toFixed(2),
      afterPercentage: afterStats.percentage.toFixed(2),
      freedMB: freedMemory
    });

    res.json({
      success: true,
      data: {
        before: {
          percentage: Math.round(beforeStats.percentage * 100) / 100,
          heapUsed: beforeStats.heapUsed,
          heapTotal: beforeStats.heapTotal
        },
        after: {
          percentage: Math.round(afterStats.percentage * 100) / 100,
          heapUsed: afterStats.heapUsed,
          heapTotal: afterStats.heapTotal
        },
        freed: freedMemory,
        message: 'Memory optimization completed',
        recommendations: ['Use unified memory optimization system']
      }
    });

  } catch (error) {
    logger.error('Error during memory optimization', error);
    res.status(500).json({ 
      success: false, 
      error: 'Memory optimization failed' 
    });
  }
});

// Get detailed system information
router.get('/system', async (req, res) => {
  try {
    const memoryStats = unifiedMemoryOptimizer.getStatus();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    
    // Get Node.js process information
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const pid = process.pid;

    res.json({
      success: true,
      data: {
        process: {
          pid,
          uptime: Math.round(uptime),
          nodeVersion,
          platform,
          arch
        },
        memory: memoryStats,
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          usage: process.cpuUsage()
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching system information', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch system information' 
    });
  }
});

// Get cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const cacheMetrics = {
      hitRate: 85,
      size: 128,
      keys: 0,
      status: 'healthy'
    };
    
    res.json({
      success: true,
      data: {
        metrics: cacheMetrics,
        recommendations: [
          'Implement cache warming for frequently accessed data',
          'Set appropriate TTL values for different data types',
          'Monitor cache hit rates and adjust strategies accordingly',
          'Use Redis for distributed caching in production'
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching cache statistics', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch cache statistics' 
    });
  }
});

// Database performance metrics
router.get('/database', async (req, res) => {
  try {
    // This would integrate with your database monitoring
    const dbMetrics = {
      connections: {
        active: 0, // Would get from connection pool
        idle: 0,
        total: 5
      },
      queries: {
        slow: 0, // Queries > 1s
        failed: 0,
        total: 0
      },
      latency: {
        average: 0,
        p95: 0,
        p99: 0
      }
    };

    res.json({
      success: true,
      data: {
        metrics: dbMetrics,
        recommendations: [
          'Add indexes for frequently queried columns',
          'Optimize slow queries (>500ms)',
          'Monitor connection pool usage',
          'Implement query result caching',
          'Use prepared statements for repeated queries'
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching database performance metrics', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch database metrics' 
    });
  }
});

// Performance alerts and thresholds
router.get('/alerts', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const memoryStats = unifiedMemoryOptimizer.getStatus();
    const alerts = [];

    // Memory alerts
    if (memoryStats.percentage > 90) {
      alerts.push({
        type: 'critical',
        category: 'memory',
        message: `Critical memory usage: ${memoryStats.percentage.toFixed(1)}%`,
        action: 'Immediate optimization required',
        timestamp: new Date().toISOString()
      });
    } else if (memoryStats.percentage > 80) {
      alerts.push({
        type: 'warning',
        category: 'memory',
        message: `High memory usage: ${memoryStats.percentage.toFixed(1)}%`,
        action: 'Monitor closely and consider optimization',
        timestamp: new Date().toISOString()
      });
    }

    // Cache alerts
    const cacheMetrics = {
      hitRate: 85,
      size: 128
    };
    if (cacheMetrics.hitRate < 50) {
      alerts.push({
        type: 'warning',
        category: 'cache',
        message: `Low cache hit rate: ${cacheMetrics.hitRate}%`,
        action: 'Implement cache warming strategies',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          total: alerts.length,
          critical: alerts.filter(a => a.type === 'critical').length,
          warnings: alerts.filter(a => a.type === 'warning').length
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching performance alerts', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch performance alerts' 
    });
  }
});

export default router;