import { Server } from 'http';
import { UnifiedWebSocketManager } from './UnifiedWebSocketManager';
import { logger } from '../../utils/logger';

// Import existing handlers
import { setupMainHandlers } from './handlers/main.handlers';
import { setupCollaborationHandlers } from './handlers/collaboration.handlers';
import { setupMololinkHandlers } from './handlers/mololink.handlers';
import { setupNotificationHandlers } from './handlers/notification.handlers';
import { setupTrackingHandlers } from './handlers/tracking.handlers';
import { setupProjectHandlers } from './handlers/project.handlers';
import { setupActivityHandlers } from './handlers/activity.handlers';
import { setupCommodityHandlers } from './handlers/commodity.handlers';
import { initializeBroadcast } from './handlers/broadcast';

let wsManager: UnifiedWebSocketManager | null = null;

export function setupUnifiedWebSocket(server: Server): UnifiedWebSocketManager {
  logger.info('🚀 Starting WebSocket setup...');
  
  if (wsManager) {
    logger.warn('WebSocket manager already initialized');
    return wsManager;
  }

  logger.info('📡 Creating UnifiedWebSocketManager...');
  wsManager = new UnifiedWebSocketManager(server);
  
  // Initialize the broadcast helper
  initializeBroadcast(wsManager);

  // Create namespaces for each WebSocket service
  const namespaces = [
    { path: '/ws/main', name: 'Main Platform', setup: setupMainHandlers },
    { path: '/ws/collaboration', name: 'Collaboration', setup: setupCollaborationHandlers },
    { path: '/ws/mololink', name: 'MOLOLINK', setup: setupMololinkHandlers },
    { path: '/ws/notifications', name: 'Notifications', setup: setupNotificationHandlers },
    { path: '/ws/tracking', name: 'Live Tracking', setup: setupTrackingHandlers },
    { path: '/ws/project-updates', name: 'Project Updates', setup: setupProjectHandlers },
    { path: '/ws/activity-logs', name: 'Activity Logs', setup: setupActivityHandlers },
    { path: '/ws/commodity-chat', name: 'Commodity Chat', setup: setupCommodityHandlers }
  ];

  // Initialize all namespaces
  namespaces.forEach(({ path, name, setup }) => {
    const namespace = wsManager!.createNamespace(path, name);
    
    // Setup specific handlers for each namespace
    if (setup) {
      setup(wsManager!, namespace);
    }
    
    logger.info(`WebSocket namespace initialized: ${name} on ${path}`);
  });

  // Initialize the HTTP upgrade handler for all services
  wsManager.initializeAllServices();
  logger.info('✅ WebSocket upgrade handler registered for all services');
  
  // Log consolidated metrics periodically
  setInterval(() => {
    const metrics = wsManager!.getMetrics();
    const totalConnections = Object.values(metrics).reduce((sum: number, ns: any) => sum + ns.connections, 0);
    
    if (totalConnections > 0) {
      logger.info(`WebSocket Manager: ${totalConnections} total connections across ${Object.keys(metrics).length} namespaces`);
    }
  }, 60000); // Every minute

  logger.info('Unified WebSocket Manager initialized with all namespaces');
  
  return wsManager;
}

export function getWebSocketManager(): UnifiedWebSocketManager | null {
  return wsManager;
}

export function broadcastToNamespace(namespacePath: string, message: any) {
  if (!wsManager) {
    logger.error('WebSocket manager not initialized');
    return;
  }
  
  wsManager.broadcast(namespacePath, message);
}

export function broadcastGlobal(message: any) {
  if (!wsManager) {
    logger.error('WebSocket manager not initialized');
    return;
  }
  
  wsManager.broadcastToAll(message);
}

export function getWebSocketMetrics() {
  if (!wsManager) {
    return {};
  }
  
  return wsManager.getMetrics();
}