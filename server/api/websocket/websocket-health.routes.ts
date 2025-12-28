import { Router } from 'express';
import { getWebSocketManager } from '../../core/websocket/unified-setup';
import { wsAuditLogger } from '../../core/websocket/security/audit-logger';
import { wsHealthMonitor } from '../../utils/websocket-health';
import { isAdmin, isAuthenticated } from '../../core/auth/auth.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/websocket/health
 * Get overall WebSocket system health
 */
router.get('/health', (req, res) => {
  try {
    const manager = getWebSocketManager();
    if (!manager) {
      return res.status(503).json({
        status: 'unavailable',
        message: 'WebSocket manager not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const metrics = manager.getEnhancedMetrics();
    const healthStatus = wsHealthMonitor.getHealthStatus();
    
    // Calculate health score (0-100)
    const totalConnections = metrics.overall.totalConnections;
    const errorRate = metrics.overall.totalErrors > 0 
      ? (metrics.overall.totalErrors / Math.max(metrics.overall.totalMessages, 1)) * 100 
      : 0;
    
    const healthScore = Math.max(0, Math.min(100, 
      100 - (errorRate * 10) + (totalConnections > 0 ? 10 : 0)
    ));

    const overallStatus = healthScore >= 95 ? 'healthy' : 
                         healthScore >= 80 ? 'warning' : 
                         'unhealthy';

    res.json({
      status: overallStatus,
      healthScore,
      metrics: {
        connections: totalConnections,
        messages: metrics.overall.totalMessages,
        errors: metrics.overall.totalErrors,
        errorRate: `${errorRate.toFixed(2)}%`
      },
      services: Object.keys(metrics.namespaces).map(path => ({
        namespace: path,
        name: metrics.namespaces[path].name,
        status: metrics.namespaces[path].connections > 0 ? 'active' : 'idle',
        connections: metrics.namespaces[path].connections,
        uptime: healthStatus.status
      })),
      security: {
        totalConnections: metrics.security.totalConnections,
        activeConnections: metrics.security.activeConnections,
        authFailures: metrics.security.authFailures,
        rateLimitHits: metrics.security.rateLimitHits
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/websocket/metrics
 * Get detailed WebSocket metrics (admin only)
 */
router.get('/metrics', isAuthenticated, isAdmin, (req, res) => {
  try {
    const manager = getWebSocketManager();
    if (!manager) {
      return res.status(503).json({
        error: 'WebSocket manager not initialized'
      });
    }

    const metrics = manager.getEnhancedMetrics();
    const securitySummary = wsAuditLogger.getSecuritySummary();

    res.json({
      ...metrics,
      security: securitySummary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * GET /api/websocket/namespaces
 * Get status of all WebSocket namespaces
 */
router.get('/namespaces', isAuthenticated, (req, res) => {
  try {
    const manager = getWebSocketManager();
    if (!manager) {
      return res.status(503).json({
        error: 'WebSocket manager not initialized'
      });
    }

    const metrics = manager.getMetrics();
    const namespaces = Object.keys(metrics).map(path => ({
      path,
      name: metrics[path].name,
      connections: metrics[path].connections,
      messagesReceived: metrics[path].messagesReceived,
      messagesSent: metrics[path].messagesSent,
      errors: metrics[path].errors,
      status: metrics[path].connections > 0 ? 'active' : 'idle'
    }));

    res.json({
      namespaces,
      total: namespaces.length,
      active: namespaces.filter(ns => ns.status === 'active').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket namespaces error:', error);
    res.status(500).json({
      error: 'Failed to retrieve namespace information'
    });
  }
});

/**
 * GET /api/websocket/connections
 * Get active connection details (admin only)
 */
router.get('/connections', isAuthenticated, isAdmin, (req, res) => {
  try {
    const manager = getWebSocketManager();
    if (!manager) {
      return res.status(503).json({
        error: 'WebSocket manager not initialized'
      });
    }

    const metrics = manager.getEnhancedMetrics();
    const connections: any[] = [];

    Object.keys(metrics.namespaces).forEach(path => {
      const namespace = metrics.namespaces[path];
      namespace.connectionDetails.forEach((conn: any) => {
        connections.push({
          ...conn,
          namespacePath: path,
          namespaceName: namespace.name
        });
      });
    });

    res.json({
      connections,
      total: connections.length,
      byNamespace: Object.keys(metrics.namespaces).reduce((acc: any, path) => {
        acc[path] = metrics.namespaces[path].connections;
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket connections error:', error);
    res.status(500).json({
      error: 'Failed to retrieve connection details'
    });
  }
});

/**
 * POST /api/websocket/disconnect
 * Force disconnect a user or session (admin only)
 */
router.post('/disconnect', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { sessionId, userId, reason } = req.body;

    if (!sessionId && !userId) {
      return res.status(400).json({
        error: 'Either sessionId or userId is required'
      });
    }

    const manager = getWebSocketManager();
    if (!manager) {
      return res.status(503).json({
        error: 'WebSocket manager not initialized'
      });
    }

    const disconnectedCount = manager.forceDisconnect(sessionId, userId, reason || 'Administrative disconnect');

    logger.info('Admin force disconnect executed', {
      adminUserId: (req.user as any)?.id,
      targetSessionId: sessionId,
      targetUserId: userId,
      disconnectedCount,
      reason
    });

    res.json({
      success: true,
      disconnectedCount,
      sessionId,
      userId,
      reason: reason || 'Administrative disconnect',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket force disconnect error:', error);
    res.status(500).json({
      error: 'Failed to disconnect user/session'
    });
  }
});

/**
 * GET /api/websocket/security
 * Get security audit information (admin only)
 */
router.get('/security', isAuthenticated, isAdmin, (req, res) => {
  try {
    const securitySummary = wsAuditLogger.getSecuritySummary();
    const recentEvents = wsAuditLogger.getRecentEvents(20);

    res.json({
      ...securitySummary,
      recentEvents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket security audit error:', error);
    res.status(500).json({
      error: 'Failed to retrieve security information'
    });
  }
});

/**
 * GET /api/websocket/security/events
 * Get security events with filtering (admin only)
 */
router.get('/security/events', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 200);

    let events;
    if (type && typeof type === 'string') {
      events = wsAuditLogger.getEventsByType(type as any, limitNum);
    } else {
      events = wsAuditLogger.getRecentEvents(limitNum);
    }

    res.json({
      events,
      total: events.length,
      type: type || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WebSocket security events error:', error);
    res.status(500).json({
      error: 'Failed to retrieve security events'
    });
  }
});

/**
 * GET /api/websocket/diagnostics
 * Get comprehensive diagnostic information (admin only)
 */
router.get('/diagnostics', isAuthenticated, isAdmin, (req, res) => {
  try {
    const manager = getWebSocketManager();
    if (!manager) {
      return res.status(503).json({
        error: 'WebSocket manager not initialized'
      });
    }

    const metrics = manager.getEnhancedMetrics();
    const healthStatus = wsHealthMonitor.getHealthStatus();
    const securitySummary = wsAuditLogger.getSecuritySummary();

    // Calculate comprehensive diagnostics
    const diagnostics = {
      system: {
        status: healthStatus.status,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      },
      websockets: {
        totalNamespaces: Object.keys(metrics.namespaces).length,
        totalConnections: metrics.overall.totalConnections,
        totalMessages: metrics.overall.totalMessages,
        totalErrors: metrics.overall.totalErrors,
        averageConnectionsPerNamespace: metrics.overall.totalConnections / Object.keys(metrics.namespaces).length,
        errorRate: metrics.overall.totalMessages > 0 
          ? (metrics.overall.totalErrors / metrics.overall.totalMessages * 100).toFixed(2) + '%'
          : '0%'
      },
      security: {
        authFailureRate: securitySummary.metrics.totalConnections > 0
          ? (securitySummary.metrics.authFailures / securitySummary.metrics.totalConnections * 100).toFixed(2) + '%'
          : '0%',
        rateLimitRate: securitySummary.metrics.totalConnections > 0
          ? (securitySummary.metrics.rateLimitHits / securitySummary.metrics.totalConnections * 100).toFixed(2) + '%'
          : '0%',
        recentThreats: securitySummary.topThreats.length,
        lastSecurityIncident: securitySummary.metrics.lastSecurityIncident
      },
      namespaceDetails: Object.keys(metrics.namespaces).map(path => {
        const ns = metrics.namespaces[path];
        return {
          path,
          name: ns.name,
          connections: ns.connections,
          health: ns.errors === 0 ? 'healthy' : ns.errors < 5 ? 'warning' : 'unhealthy',
          messagesReceived: ns.messagesReceived,
          messagesSent: ns.messagesSent,
          errors: ns.errors
        };
      }),
      recommendations: []
    };

    // Generate recommendations
    if (metrics.overall.totalErrors > 10) {
      diagnostics.recommendations.push('High error count detected. Review application logs for issues.');
    }
    if (securitySummary.metrics.authFailures > 5) {
      diagnostics.recommendations.push('Multiple authentication failures detected. Consider reviewing security policies.');
    }
    if (metrics.overall.totalConnections === 0) {
      diagnostics.recommendations.push('No active connections. Verify client connectivity and authentication.');
    }

    res.json(diagnostics);
  } catch (error) {
    logger.error('WebSocket diagnostics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve diagnostic information'
    });
  }
});

export default router;