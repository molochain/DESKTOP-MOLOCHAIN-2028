import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

interface ChatMessage {
  id: string;
  commodityId: number;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export function setupCommodityHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  const commodityRooms = new Map<number, Set<any>>();
  const messageHistory = new Map<number, ChatMessage[]>();
  const MAX_HISTORY = 50;

  manager.registerHandler('/ws/commodity-chat', 'connection', (ws: any) => {
    logger.info('Commodity chat WebSocket connected');
  });

  manager.registerHandler('/ws/commodity-chat', 'join-commodity', (ws: any, payload: any) => {
    const { commodityId, userId, username } = payload;
    
    if (!commodityRooms.has(commodityId)) {
      commodityRooms.set(commodityId, new Set());
      messageHistory.set(commodityId, []);
    }
    
    commodityRooms.get(commodityId)!.add(ws);
    ws.commodityId = commodityId;
    ws.userId = userId;
    ws.username = username;
    
    // Send chat history
    const history = messageHistory.get(commodityId) || [];
    ws.send(JSON.stringify({
      type: 'chat-history',
      payload: {
        commodityId,
        messages: history
      }
    }));
    
    // Notify others
    manager.broadcast('/ws/commodity-chat', {
      type: 'user-joined',
      payload: {
        commodityId,
        userId,
        username,
        timestamp: new Date().toISOString()
      }
    });
    
    logger.info(`User ${username} joined commodity ${commodityId} chat`);
  });

  manager.registerHandler('/ws/commodity-chat', 'send-message', (ws: any, payload: any) => {
    if (!ws.commodityId) return;
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      commodityId: ws.commodityId,
      userId: ws.userId,
      username: ws.username,
      message: payload.message,
      timestamp: new Date().toISOString()
    };
    
    // Store in history
    const history = messageHistory.get(ws.commodityId) || [];
    history.push(message);
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    messageHistory.set(ws.commodityId, history);
    
    // Broadcast to room members
    const room = commodityRooms.get(ws.commodityId);
    if (room) {
      room.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'new-message',
            payload: message
          }));
        }
      });
    }
    
    logger.info(`Message sent in commodity ${ws.commodityId} chat`);
  });

  manager.registerHandler('/ws/commodity-chat', 'price-alert', (ws: any, payload: any) => {
    const { commodityId, currentPrice, change } = payload;
    
    // Broadcast price update to commodity room
    const room = commodityRooms.get(commodityId);
    if (room) {
      room.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'price-update',
            payload: {
              commodityId,
              currentPrice,
              change,
              timestamp: new Date().toISOString()
            }
          }));
        }
      });
    }
  });

  manager.registerHandler('/ws/commodity-chat', 'leave-commodity', (ws: any) => {
    if (ws.commodityId && commodityRooms.has(ws.commodityId)) {
      commodityRooms.get(ws.commodityId)!.delete(ws);
      
      manager.broadcast('/ws/commodity-chat', {
        type: 'user-left',
        payload: {
          commodityId: ws.commodityId,
          userId: ws.userId,
          username: ws.username,
          timestamp: new Date().toISOString()
        }
      });
    }
  });
}