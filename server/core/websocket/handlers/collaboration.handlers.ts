import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupCollaborationHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  const activeRooms = new Map<string, Set<any>>();

  manager.registerHandler('/ws/collaboration', 'connection', (ws: any, request: any) => {
    logger.info('Collaboration WebSocket connected');
    ws.roomId = null;
  });

  manager.registerHandler('/ws/collaboration', 'join-room', (ws: any, payload: any) => {
    const { roomId, userId, username } = payload;
    
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    
    activeRooms.get(roomId)!.add(ws);
    ws.roomId = roomId;
    ws.userId = userId;
    ws.username = username;

    // Notify others in room
    manager.broadcast('/ws/collaboration', {
      type: 'user-joined',
      payload: { roomId, userId, username }
    });

    logger.info(`User ${username} joined collaboration room ${roomId}`);
  });

  manager.registerHandler('/ws/collaboration', 'message', (ws: any, payload: any) => {
    if (!ws.roomId) return;

    // Broadcast message to room
    manager.broadcast('/ws/collaboration', {
      type: 'message',
      payload: {
        ...payload,
        userId: ws.userId,
        username: ws.username,
        timestamp: new Date().toISOString()
      }
    });
  });

  manager.registerHandler('/ws/collaboration', 'leave-room', (ws: any) => {
    if (ws.roomId && activeRooms.has(ws.roomId)) {
      activeRooms.get(ws.roomId)!.delete(ws);
      
      manager.broadcast('/ws/collaboration', {
        type: 'user-left',
        payload: {
          roomId: ws.roomId,
          userId: ws.userId,
          username: ws.username
        }
      });
    }
  });
}