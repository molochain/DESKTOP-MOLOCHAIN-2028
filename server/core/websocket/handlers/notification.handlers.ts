import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

const userConnections = new Map<string, any>();

export function getUserConnection(userId: string | number): any | undefined {
  return userConnections.get(String(userId));
}

export function sendToUser(userId: string | number, message: { type: string; payload: any }): boolean {
  const ws = userConnections.get(String(userId));
  if (ws && ws.readyState === 1) {
    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`Failed to send message to user ${userId}:`, error);
      return false;
    }
  }
  return false;
}

export function getConnectedUserIds(): string[] {
  return Array.from(userConnections.keys());
}

export function isUserConnected(userId: string | number): boolean {
  const ws = userConnections.get(String(userId));
  return ws && ws.readyState === 1;
}

export function setupNotificationHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  manager.registerHandler('/ws/notifications', 'connection', (ws: any, request: any) => {
    logger.info('Notification WebSocket connected');
  });

  manager.registerHandler('/ws/notifications', 'subscribe', (ws: any, payload: any) => {
    const { userId } = payload;
    
    if (userId) {
      const userIdStr = String(userId);
      userConnections.set(userIdStr, ws);
      ws.userId = userIdStr;
      
      ws.send(JSON.stringify({
        type: 'subscribed',
        payload: {
          userId: userIdStr,
          message: 'Successfully subscribed to notifications'
        }
      }));
      
      logger.info(`User ${userIdStr} subscribed to notifications`);
    }
  });

  manager.registerHandler('/ws/notifications', 'unsubscribe', (ws: any, payload: any) => {
    const { userId } = payload;
    if (userId) {
      const userIdStr = String(userId);
      userConnections.delete(userIdStr);
      logger.info(`User ${userIdStr} unsubscribed from notifications`);
    }
  });

  manager.registerHandler('/ws/notifications', 'send-notification', (ws: any, payload: any) => {
    const { targetUserId, notification } = payload;
    
    const targetWs = userConnections.get(String(targetUserId));
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
    manager.broadcast('/ws/notifications', {
      type: 'notification',
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    });
  });

  manager.registerHandler('/ws/notifications', 'disconnect', (ws: any) => {
    if (ws.userId) {
      userConnections.delete(ws.userId);
      logger.info(`User ${ws.userId} disconnected from notifications`);
    }
  });
}
