import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';

export function setupTrackingHandlers(manager: UnifiedWebSocketManager, namespace: any) {
  const trackingSubscriptions = new Map<string, Set<any>>();

  manager.registerHandler('/ws/tracking', 'connection', (ws: any) => {
    logger.info('Tracking WebSocket connected');
  });

  manager.registerHandler('/ws/tracking', 'subscribe-tracking', (ws: any, payload: any) => {
    const { trackingNumber } = payload;
    
    if (!trackingSubscriptions.has(trackingNumber)) {
      trackingSubscriptions.set(trackingNumber, new Set());
    }
    
    trackingSubscriptions.get(trackingNumber)!.add(ws);
    ws.trackingNumbers = ws.trackingNumbers || new Set();
    ws.trackingNumbers.add(trackingNumber);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      payload: {
        trackingNumber,
        message: `Subscribed to tracking updates for ${trackingNumber}`
      }
    }));
    
    logger.info(`Client subscribed to tracking: ${trackingNumber}`);
  });

  manager.registerHandler('/ws/tracking', 'location-update', (ws: any, payload: any) => {
    const { trackingNumber, location, status } = payload;
    
    // Broadcast update to all subscribers of this tracking number
    const subscribers = trackingSubscriptions.get(trackingNumber);
    if (subscribers) {
      subscribers.forEach((subscriber: any) => {
        if (subscriber.readyState === 1) {
          subscriber.send(JSON.stringify({
            type: 'tracking-update',
            payload: {
              trackingNumber,
              location,
              status,
              timestamp: new Date().toISOString()
            }
          }));
        }
      });
    }
  });

  manager.registerHandler('/ws/tracking', 'unsubscribe-tracking', (ws: any, payload: any) => {
    const { trackingNumber } = payload;
    
    const subscribers = trackingSubscriptions.get(trackingNumber);
    if (subscribers) {
      subscribers.delete(ws);
    }
    
    if (ws.trackingNumbers) {
      ws.trackingNumbers.delete(trackingNumber);
    }
  });
}