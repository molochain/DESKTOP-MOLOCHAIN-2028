import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupMainHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  // Handle main platform connections
  manager.registerHandler('/ws/main', 'connection', (ws: any, request: any) => {
    logger.info('Main platform WebSocket connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      payload: {
        message: 'Connected to MoloChain main platform',
        timestamp: new Date().toISOString()
      }
    }));
  });

  // Handle platform status requests
  manager.registerHandler('/ws/main', 'status', (ws: any, payload: any) => {
    ws.send(JSON.stringify({
      type: 'status',
      payload: {
        status: 'operational',
        services: {
          database: 'connected',
          cache: 'active',
          websocket: 'running'
        }
      }
    }));
  });

  // Handle ping/pong for keep-alive
  manager.registerHandler('/ws/main', 'ping', (ws: any) => {
    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
  });

  // Handle authentication
  manager.registerHandler('/ws/main', 'auth', (ws: any, payload: any) => {
    logger.info('WebSocket authentication request received', { token: payload.token ? 'present' : 'missing' });
    
    // For now, accept all auth requests (Phase 4 will add proper validation)
    ws.send(JSON.stringify({
      type: 'auth_success',
      payload: {
        authenticated: true,
        timestamp: new Date().toISOString()
      }
    }));
  });
}