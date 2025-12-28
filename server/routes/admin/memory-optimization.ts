/**
 * Memory Optimization Admin Routes
 * API endpoints for monitoring and controlling memory optimization
 */

import { Router } from 'express';
import { unifiedMemoryOptimizer } from '../../core/monitoring/unified-memory-optimizer';
import { logger } from '../../utils/logger';
import os from 'os';

const router = Router();

// Get memory optimization status
router.get('/status', (req, res) => {
  try {
    const memoryStats = unifiedMemoryOptimizer.getStatus();

    res.json({
      success: true,
      data: {
        memory: {
          currentUsage: memoryStats.percentage,
          heapUsed: memoryStats.heapUsed,
          heapTotal: memoryStats.heapTotal,
          rss: memoryStats.rss,
          status: memoryStats.percentage > 85 ? 'critical' : 'healthy'
        },
        optimizerStatus: 'unified-system-active',
        message: 'Using consolidated memory optimization system'
      }
    });
  } catch (error) {
    logger.error('Failed to get memory optimization status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve memory optimization status'
    });
  }
});

// Trigger manual optimization
router.post('/optimize', async (req, res) => {
  try {
    const { type = 'standard', force = false } = req.body;

    let result;
    switch (type) {
      case 'emergency':
        result = await advancedMemoryOptimizer['emergencyOptimization']();
        break;
      case 'websocket':
        result = await webSocketOptimizer['performCleanup']();
        break;
      default:
        result = await advancedMemoryOptimizer['runOptimizationCycle']();
    }

    const afterStatus = advancedMemoryOptimizer.getOptimizationReport();
    
    res.json({
      success: true,
      data: {
        type,
        optimization: 'completed',
        currentUsage: afterStatus.currentUsage,
        status: afterStatus.status
      }
    });

    logger.info('Manual memory optimization triggered', { 
      type, 
      newUsage: afterStatus.currentUsage.toFixed(2) 
    });

  } catch (error) {
    logger.error('Manual optimization failed', error);
    res.status(500).json({
      success: false,
      error: 'Memory optimization failed'
    });
  }
});

// Get memory performance history
router.get('/performance', (req, res) => {
  try {
    const report = memoryPerformanceMonitor.getDetailedReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Failed to get performance data', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance data'
    });
  }
});

// Update WebSocket optimizer configuration
router.put('/websocket-config', (req, res) => {
  try {
    const config = req.body;
    webSocketOptimizer.updateConfiguration(config);
    
    res.json({
      success: true,
      data: {
        message: 'WebSocket optimizer configuration updated',
        config
      }
    });

    logger.info('WebSocket optimizer configuration updated', config);
  } catch (error) {
    logger.error('Failed to update WebSocket config', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration'
    });
  }
});

// Get system memory metrics
router.get('/metrics', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const metrics = {
      process: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), 
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      system: {
        total: Math.round(totalMem / 1024 / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024 / 1024),
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      optimization: {
        active: usedMem / totalMem > 0.75,
        threshold: '75%',
        status: usedMem / totalMem > 0.85 ? 'critical' : usedMem / totalMem > 0.75 ? 'active' : 'normal'
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get memory metrics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve memory metrics'
    });
  }
});

export default router;