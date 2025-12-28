import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupNotificationHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  const userConnections = new Map<string, any>();

  manager.registerHandler('/ws/notifications', 'connection', (ws: any, request: any) => {
    logger.info('Notification WebSocket connected');
  });

  manager.registerHandler('/ws/notifications', 'subscribe', (ws: any, payload: any) => {
    const { userId } = payload;
    
    if (userId) {
      userConnections.set(userId, ws);
      ws.userId = userId;
      
      ws.send(JSON.stringify({
        type: 'subscribed',
        payload: {
          userId,
          message: 'Successfully subscribed to notifications'
        }
      }));
      
      logger.info(`User ${userId} subscribed to notifications`);
    }
  });

  manager.registerHandler('/ws/notifications', 'send-notification', (ws: any, payload: any) => {
    const { targetUserId, notification } = payload;
    
    // Send to specific user if connected
    const targetWs = userConnections.get(targetUserId);
    if (targetWs && targetWs.readyState === 1) {
      targetWs.send(JSON.stringify({
        type: 'notification',
        payload: {
          ...notification,
          timestamp: new Date().toISOString()
        }
      }));
    }
  });

  manager.registerHandler('/ws/notifications', 'broadcast-notification', (ws: any, payload: any) => {
    // Broadcast to all connected users
    manager.broadcast('/ws/notifications', {
      type: 'notification',
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    });
  });
}