import { Server } from 'http';
import { logger } from '../utils/logger';
import { UnifiedWebSocketManager } from '../core/websocket/UnifiedWebSocketManager';

export function setupWebSocketRoutes(httpServer: Server) {
  try {
    // Initialize the Unified WebSocket Manager
    const wsManager = new UnifiedWebSocketManager(httpServer);
    
    // Initialize all WebSocket services through the unified system
    wsManager.initializeAllServices();
    
    logger.info('Unified WebSocket Manager initialized with all 8 services');
    logger.info('WebSocket services available at:');
    logger.info('  - /ws/main - Main platform WebSocket');
    logger.info('  - /ws/collaboration - Collaboration service');
    logger.info('  - /ws/mololink - MOLOLINK marketplace');
    logger.info('  - /ws/notifications - Real-time notifications');
    logger.info('  - /ws/tracking - Live tracking updates');
    logger.info('  - /ws/project-updates - Project updates');
    logger.info('  - /ws/activity-logs - Activity logging');
    logger.info('  - /ws/commodity-chat - Commodity chat');
    
  } catch (error) {
    logger.error('Error setting up WebSocket routes:', error);
    throw error;
  }
}