import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupMololinkHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  manager.registerHandler('/ws/mololink', 'connection', (ws: any) => {
    logger.info('MOLOLINK WebSocket connected');
    
    ws.send(JSON.stringify({
      type: 'welcome',
      payload: {
        message: 'Connected to MOLOLINK marketplace',
        timestamp: new Date().toISOString()
      }
    }));
  });

  // Handle marketplace updates
  manager.registerHandler('/ws/mololink', 'marketplace-update', (ws: any, payload: any) => {
    // Broadcast marketplace changes to all connected clients
    manager.broadcast('/ws/mololink', {
      type: 'marketplace-update',
      payload
    });
  });

  // Handle auction events
  manager.registerHandler('/ws/mololink', 'auction-bid', (ws: any, payload: any) => {
    logger.info(`New bid on auction ${payload.auctionId}: ${payload.amount}`);
    
    // Broadcast bid to all participants
    manager.broadcast('/ws/mololink', {
      type: 'auction-update',
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    });
  });

  // Handle company profile updates
  manager.registerHandler('/ws/mololink', 'company-update', (ws: any, payload: any) => {
    manager.broadcast('/ws/mololink', {
      type: 'company-update',
      payload
    });
  });
}