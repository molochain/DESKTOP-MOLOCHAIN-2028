import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupActivityHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  const activityBuffer: any[] = [];
  const MAX_BUFFER_SIZE = 100;

  manager.registerHandler('/ws/activity-logs', 'connection', (ws: any) => {
    logger.info('Activity logs WebSocket connected');
    
    // Send recent activity on connection
    ws.send(JSON.stringify({
      type: 'activity-history',
      payload: {
        activities: activityBuffer.slice(-20)
      }
    }));
  });

  manager.registerHandler('/ws/activity-logs', 'log-activity', (ws: any, payload: any) => {
    const activity = {
      ...payload,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    // Add to buffer
    activityBuffer.push(activity);
    if (activityBuffer.length > MAX_BUFFER_SIZE) {
      activityBuffer.shift();
    }
    
    // Broadcast to all connected clients
    manager.broadcast('/ws/activity-logs', {
      type: 'new-activity',
      payload: activity
    });
    
    logger.info(`Activity logged: ${activity.type} - ${activity.description}`);
  });

  manager.registerHandler('/ws/activity-logs', 'filter-activities', (ws: any, payload: any) => {
    const { type, userId, dateFrom, dateTo } = payload;
    
    let filtered = activityBuffer;
    
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (userId) {
      filtered = filtered.filter(a => a.userId === userId);
    }
    if (dateFrom) {
      filtered = filtered.filter(a => new Date(a.timestamp) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(a => new Date(a.timestamp) <= new Date(dateTo));
    }
    
    ws.send(JSON.stringify({
      type: 'filtered-activities',
      payload: {
        activities: filtered
      }
    }));
  });

  // Periodically clean up old activities
  setInterval(() => {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    const beforeLength = activityBuffer.length;
    
    while (activityBuffer.length > 0 && activityBuffer[0].id < cutoffTime) {
      activityBuffer.shift();
    }
    
    if (beforeLength !== activityBuffer.length) {
      logger.debug(`Cleaned up ${beforeLength - activityBuffer.length} old activities`);
    }
  }, 60 * 60 * 1000); // Every hour
}