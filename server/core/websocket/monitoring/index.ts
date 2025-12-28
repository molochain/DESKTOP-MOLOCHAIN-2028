import { logger } from '../../../utils/logger';
import { periodicMetricsCollector } from './periodic-collector';
import { setupUnifiedWebSocket } from '../unified-setup';
import { Server } from 'http';

/**
 * Initialize WebSocket monitoring system
 */
export function initializeWebSocketMonitoring(server: Server) {
  logger.info('🔍 Initializing WebSocket monitoring system...');

  try {
    // Initialize the WebSocket manager first
    const wsManager = setupUnifiedWebSocket(server);
    
    // Start periodic metrics collection (5-minute intervals)
    periodicMetricsCollector.start(300000); // 5 minutes
    
    logger.info('✅ WebSocket monitoring system initialized successfully');
    
    // Log initial system status after 10 seconds to let everything settle
    setTimeout(() => {
      const latest = periodicMetricsCollector.getLatestMetrics();
      if (latest) {
        logger.info('📊 Initial WebSocket system status', {
          healthScore: latest.healthScore.toFixed(1),
          connections: latest.websockets.totalConnections,
          namespaces: Object.keys(latest.websockets.namespaceMetrics).length,
          memoryUsage: `${Math.round(latest.system.memory.heapUsed / 1024 / 1024)}MB`
        });
      }
    }, 10000);

    return wsManager;
  } catch (error) {
    logger.error('Failed to initialize WebSocket monitoring:', error);
    throw error;
  }
}

/**
 * Shutdown WebSocket monitoring
 */
export function shutdownWebSocketMonitoring() {
  logger.info('Shutting down WebSocket monitoring...');
  periodicMetricsCollector.stop();
}

/**
 * Get current monitoring status
 */
export function getMonitoringStatus() {
  const latest = periodicMetricsCollector.getLatestMetrics();
  const summary24h = periodicMetricsCollector.getMetricsSummary(24);
  
  return {
    isActive: latest !== null,
    latest,
    summary24h,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

// Export the collector for external use
export { periodicMetricsCollector };