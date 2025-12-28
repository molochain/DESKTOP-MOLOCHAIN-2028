import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupProjectHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  const projectSubscriptions = new Map<number, Set<any>>();

  manager.registerHandler('/ws/project-updates', 'connection', (ws: any) => {
    logger.info('Project updates WebSocket connected');
  });

  manager.registerHandler('/ws/project-updates', 'subscribe-project', (ws: any, payload: any) => {
    const { projectId } = payload;
    
    if (!projectSubscriptions.has(projectId)) {
      projectSubscriptions.set(projectId, new Set());
    }
    
    projectSubscriptions.get(projectId)!.add(ws);
    ws.projectIds = ws.projectIds || new Set();
    ws.projectIds.add(projectId);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      payload: {
        projectId,
        message: `Subscribed to project ${projectId} updates`
      }
    }));
    
    logger.info(`Client subscribed to project ${projectId}`);
  });

  manager.registerHandler('/ws/project-updates', 'project-update', (ws: any, payload: any) => {
    const { projectId, update } = payload;
    
    // Broadcast to project subscribers
    const subscribers = projectSubscriptions.get(projectId);
    if (subscribers) {
      subscribers.forEach((subscriber: any) => {
        if (subscriber.readyState === 1) {
          subscriber.send(JSON.stringify({
            type: 'project-update',
            payload: {
              projectId,
              ...update,
              timestamp: new Date().toISOString()
            }
          }));
        }
      });
    }
  });

  manager.registerHandler('/ws/project-updates', 'milestone-update', (ws: any, payload: any) => {
    const { projectId, milestone } = payload;
    
    const subscribers = projectSubscriptions.get(projectId);
    if (subscribers) {
      subscribers.forEach((subscriber: any) => {
        if (subscriber.readyState === 1) {
          subscriber.send(JSON.stringify({
            type: 'milestone-update',
            payload: {
              projectId,
              milestone,
              timestamp: new Date().toISOString()
            }
          }));
        }
      });
    }
  });
}