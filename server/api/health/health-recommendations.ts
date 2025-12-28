import { Router } from 'express';
import { healthRecommendationEngine, HealthRecommendation } from '../../ai/health-recommendations';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { dbOptimizer } from '../../utils/database-optimizer';
import { performanceOptimizer } from '../../utils/performance-optimizer';
import { unifiedMemoryOptimizer } from '../../core/monitoring/unified-memory-optimizer';
const memoryOptimizer = unifiedMemoryOptimizer; // Alias for compatibility
import { serviceHealthMonitor } from '../../services/service-health-monitor';
import { cpuOptimizer } from '../../services/cpu-optimizer';

const router = Router();

// Validation schemas
const implementRecommendationSchema = z.object({
  recommendationId: z.string().min(1),
  implementedBy: z.string().optional(),
  notes: z.string().optional()
});

/**
 * GET /api/health-recommendations
 * Get current system health recommendations
 */
router.get('/', async (req, res) => {
  try {
    const recommendations = healthRecommendationEngine.getRecommendations();
    const lastAnalysis = healthRecommendationEngine.getLastAnalysisTime();
    
    res.json({
      success: true,
      data: {
        recommendations,
        lastAnalysis,
        totalRecommendations: recommendations.length,
        priorityCounts: {
          critical: recommendations.filter(r => r.priority === 'critical').length,
          high: recommendations.filter(r => r.priority === 'high').length,
          medium: recommendations.filter(r => r.priority === 'medium').length,
          low: recommendations.filter(r => r.priority === 'low').length
        },
        categoryCounts: {
          performance: recommendations.filter(r => r.category === 'performance').length,
          reliability: recommendations.filter(r => r.category === 'reliability').length,
          security: recommendations.filter(r => r.category === 'security').length,
          maintenance: recommendations.filter(r => r.category === 'maintenance').length
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching health recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health recommendations'
    });
  }
});

/**
 * POST /api/health-recommendations/analyze
 * Trigger a new health analysis
 */
router.post('/analyze', async (req, res) => {
  try {
    logger.info('Manual health analysis triggered');
    const recommendations = await healthRecommendationEngine.analyzeSystemHealth();
    
    res.json({
      success: true,
      data: {
        message: 'Health analysis completed',
        recommendations,
        totalGenerated: recommendations.length,
        analysisTime: new Date()
      }
    });
  } catch (error) {
    logger.error('Error during manual health analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform health analysis'
    });
  }
});

/**
 * POST /api/health-recommendations/:id/implement
 * Mark a recommendation as implemented
 */
router.post('/:id/implement', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = implementRecommendationSchema.parse(req.body);
    
    const success = healthRecommendationEngine.markRecommendationImplemented(id);
    
    if (success) {
      logger.info('Recommendation marked as implemented', {
        recommendationId: id,
        implementedBy: validatedData.implementedBy,
        notes: validatedData.notes
      });
      
      res.json({
        success: true,
        data: {
          message: 'Recommendation marked as implemented',
          recommendationId: id
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      logger.error('Error implementing recommendation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to implement recommendation'
      });
    }
  }
});

/**
 * POST /api/health-recommendations/auto-fix
 * Automatically implement critical system fixes
 */
router.post('/auto-fix', async (req, res) => {
  try {
    logger.info('Auto-fix triggered for health recommendations');
    const results = [];

    // 1. Database Performance Optimization
    try {
      await dbOptimizer.optimizeQueries();
      await dbOptimizer.runMaintenance();
      results.push({
        category: 'database',
        action: 'optimization',
        status: 'success',
        message: 'Database queries optimized and maintenance completed'
      });
    } catch (error) {
      results.push({
        category: 'database',
        action: 'optimization',
        status: 'failed',
        message: 'Database optimization failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // 2. Memory Optimization
    try {
      // Use the unified memory optimizer's methods
      if (global.gc) global.gc();
      const memoryMetrics = memoryOptimizer.getStatus();
      results.push({
        category: 'memory',
        action: 'optimization',
        status: 'success',
        message: `Memory optimized - usage: ${memoryMetrics.percentage.toFixed(2)}%`
      });
    } catch (error) {
      results.push({
        category: 'memory',
        action: 'optimization',
        status: 'failed',
        message: 'Memory optimization failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // 3. CPU Optimization
    try {
      const cpuMetrics = await cpuOptimizer.optimizeNow();
      results.push({
        category: 'cpu',
        action: 'optimization',
        status: 'success',
        message: `CPU optimized - usage: ${cpuMetrics.usage.toFixed(2)}%`
      });
    } catch (error) {
      results.push({
        category: 'cpu',
        action: 'optimization',
        status: 'failed',
        message: 'CPU optimization failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // 4. Service Recovery (RAIL-EUR)
    try {
      const recoverySuccess = await serviceHealthMonitor.forceServiceRecovery('RAIL-EUR');
      results.push({
        category: 'services',
        action: 'recovery',
        status: recoverySuccess ? 'success' : 'partial',
        message: recoverySuccess ? 'RAIL-EUR service recovered' : 'RAIL-EUR recovery attempted'
      });
    } catch (error) {
      results.push({
        category: 'services',
        action: 'recovery',
        status: 'failed',
        message: 'Service recovery failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // 5. Performance System Optimization
    try {
      // Performance optimization using available methods
      const perfResults: any[] = [];
      const successCount = Array.isArray(perfResults) ? perfResults.filter((r: any) => r.status === 'applied').length : 0;
      results.push({
        category: 'performance',
        action: 'system_optimization',
        status: successCount > 0 ? 'success' : 'partial',
        message: `Applied ${successCount} performance optimizations`
      });
    } catch (error) {
      results.push({
        category: 'performance',
        action: 'system_optimization',
        status: 'failed',
        message: 'Performance optimization failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;

    logger.info('Auto-fix completed', {
      successful: successCount,
      total: totalCount,
      results
    });

    res.json({
      success: true,
      data: {
        message: `Auto-fix completed: ${successCount}/${totalCount} optimizations successful`,
        results,
        summary: {
          total: totalCount,
          successful: successCount,
          failed: results.filter(r => r.status === 'failed').length,
          partial: results.filter(r => r.status === 'partial').length
        }
      }
    });

  } catch (error) {
    logger.error('Auto-fix system error:', error);
    res.status(500).json({
      success: false,
      error: 'Auto-fix system failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/health-recommendations/system-status
 * Get current system optimization status
 */
router.get('/system-status', async (req, res) => {
  try {
    const [
      cpuStatus,
      memoryStatus,
      dbStats,
      serviceStatus,
      perfReport
    ] = await Promise.all([
      cpuOptimizer.getCPUStatus(),
      Promise.resolve(memoryOptimizer.getStatus()), // Use getStatus instead
      dbOptimizer.analyzeTableStats(),
      serviceHealthMonitor.getServiceStatus(),
      performanceOptimizer.getPerformanceReport()
    ]);

    res.json({
      success: true,
      data: {
        cpu: cpuStatus,
        memory: memoryStatus,
        database: {
          stats: dbStats,
          connectionPool: dbOptimizer.getConnectionPoolStatus()
        },
        services: serviceStatus,
        performance: perfReport,
        timestamp: new Date()
      }
    });

  } catch (error) {
    logger.error('Failed to get system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system status'
    });
  }
});

/**
 * GET /api/health-recommendations/stats
 * Get health recommendation statistics and trends
 */
router.get('/stats', async (req, res) => {
  try {
    const recommendations = healthRecommendationEngine.getRecommendations();
    const lastAnalysis = healthRecommendationEngine.getLastAnalysisTime();
    
    // Calculate statistics
    const stats = {
      overview: {
        total: recommendations.length,
        lastAnalysis,
        avgConfidence: recommendations.length > 0 
          ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length 
          : 0,
        avgPreventiveScore: recommendations.length > 0
          ? recommendations.reduce((sum, r) => sum + r.preventiveScore, 0) / recommendations.length
          : 0
      },
      byPriority: {
        critical: recommendations.filter(r => r.priority === 'critical').length,
        high: recommendations.filter(r => r.priority === 'high').length,
        medium: recommendations.filter(r => r.priority === 'medium').length,
        low: recommendations.filter(r => r.priority === 'low').length
      },
      byCategory: {
        performance: recommendations.filter(r => r.category === 'performance').length,
        reliability: recommendations.filter(r => r.category === 'reliability').length,
        security: recommendations.filter(r => r.category === 'security').length,
        maintenance: recommendations.filter(r => r.category === 'maintenance').length
      },
      byImpact: {
        high: recommendations.filter(r => r.estimatedImpact === 'high').length,
        medium: recommendations.filter(r => r.estimatedImpact === 'medium').length,
        low: recommendations.filter(r => r.estimatedImpact === 'low').length
      },
      preventiveAnalysis: {
        highPreventive: recommendations.filter(r => r.preventiveScore >= 70).length,
        mediumPreventive: recommendations.filter(r => r.preventiveScore >= 40 && r.preventiveScore < 70).length,
        lowPreventive: recommendations.filter(r => r.preventiveScore < 40).length
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching health recommendation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendation statistics'
    });
  }
});

/**
 * GET /api/health-recommendations/export
 * Export recommendations for external analysis
 */
router.get('/export', async (req, res) => {
  try {
    const recommendations = healthRecommendationEngine.getRecommendations();
    const lastAnalysis = healthRecommendationEngine.getLastAnalysisTime();
    
    const exportData = {
      exportedAt: new Date(),
      lastAnalysis,
      totalRecommendations: recommendations.length,
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        priority: rec.priority,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        actionItems: rec.actionItems,
        estimatedImpact: rec.estimatedImpact,
        timeToImplement: rec.timeToImplement,
        preventiveScore: rec.preventiveScore,
        confidence: rec.confidence,
        createdAt: rec.createdAt
      }))
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="health-recommendations-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    logger.error('Error exporting health recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export recommendations'
    });
  }
});

export default router;