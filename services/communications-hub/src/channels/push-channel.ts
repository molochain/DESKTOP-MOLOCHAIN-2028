import { createLogger } from '../utils/logger.js';
import { ChannelInterface, ChannelStatus, SendResult } from './channel-manager.js';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('push-channel');

interface PushSubscription {
  userId: number;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushChannel implements ChannelInterface {
  name: 'push' = 'push';
  private enabled: boolean = false;
  private subscriptions: Map<number, PushSubscription[]> = new Map();
  private stats = { sent: 0, failed: 0, pending: 0 };
  private lastCheck: Date = new Date();
  private wsConnections: Map<number, any[]> = new Map();

  async initialize(): Promise<void> {
    try {
      this.enabled = true;
      logger.info('Push notification channel initialized (WebSocket-based)');
    } catch (error) {
      logger.error('Failed to initialize Push channel:', error);
      this.enabled = false;
    }
  }

  registerWebSocketConnection(userId: number, ws: any): void {
    const connections = this.wsConnections.get(userId) || [];
    connections.push(ws);
    this.wsConnections.set(userId, connections);
    logger.info(`WebSocket registered for user ${userId}`);
  }

  unregisterWebSocketConnection(userId: number, ws: any): void {
    const connections = this.wsConnections.get(userId) || [];
    const filtered = connections.filter(c => c !== ws);
    if (filtered.length > 0) {
      this.wsConnections.set(userId, filtered);
    } else {
      this.wsConnections.delete(userId);
    }
  }

  async send(
    recipient: string,
    subject: string | undefined,
    body: string,
    metadata?: Record<string, any>
  ): Promise<SendResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Push channel not initialized',
      };
    }

    const messageId = uuidv4();
    this.stats.pending++;

    try {
      const userId = parseInt(recipient);
      
      if (isNaN(userId)) {
        throw new Error('Invalid user ID for push notification');
      }

      const connections = this.wsConnections.get(userId) || [];
      
      if (connections.length === 0) {
        this.stats.pending--;
        return {
          success: false,
          messageId,
          error: 'No active WebSocket connections for user',
        };
      }

      const notification = {
        type: 'notification',
        payload: {
          id: messageId,
          title: subject || 'Notification',
          body: body,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      };

      let successCount = 0;
      let failCount = 0;

      for (const ws of connections) {
        try {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify(notification));
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      }

      this.stats.pending--;
      
      if (successCount > 0) {
        this.stats.sent++;
        logger.info(`Push notification sent to user ${userId} via ${successCount} connections`);
        
        return {
          success: true,
          messageId,
          providerResponse: {
            successCount,
            failCount,
          },
        };
      } else {
        this.stats.failed++;
        return {
          success: false,
          messageId,
          error: 'All WebSocket connections failed',
        };
      }
    } catch (error: any) {
      this.stats.pending--;
      this.stats.failed++;
      
      logger.error(`Failed to send push notification:`, error);
      
      return {
        success: false,
        messageId,
        error: error.message,
      };
    }
  }

  getStatus(): ChannelStatus {
    this.lastCheck = new Date();
    return {
      name: this.name,
      enabled: this.enabled,
      healthy: this.enabled,
      lastCheck: this.lastCheck,
      stats: { ...this.stats },
    };
  }

  getActiveConnections(): number {
    let total = 0;
    for (const connections of this.wsConnections.values()) {
      total += connections.length;
    }
    return total;
  }
}
