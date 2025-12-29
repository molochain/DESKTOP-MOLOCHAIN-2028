import { sendToUser, isUserConnected, getConnectedUserIds } from '../core/websocket/handlers/notification.handlers';
import { logger } from '../utils/logger';

export interface PushNotification {
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface PushResult {
  success: boolean;
  error?: string;
  delivered?: boolean;
}

export function sendPushNotification(
  userId: number,
  notification: PushNotification
): PushResult {
  try {
    const userIdStr = String(userId);
    
    if (!isUserConnected(userId)) {
      logger.debug(`Push notification: User ${userId} is not connected`);
      return {
        success: true,
        delivered: false,
        error: 'User is not connected'
      };
    }

    const message = {
      type: 'push-notification',
      payload: {
        title: notification.title,
        body: notification.body,
        metadata: notification.metadata || {},
        timestamp: new Date().toISOString(),
        source: 'communications-hub'
      }
    };

    const sent = sendToUser(userIdStr, message);

    if (sent) {
      logger.info(`Push notification sent to user ${userId}`, {
        title: notification.title
      });
      return { success: true, delivered: true };
    } else {
      logger.warn(`Failed to send push notification to user ${userId}`);
      return {
        success: false,
        delivered: false,
        error: 'Failed to send message to WebSocket'
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Push notification error for user ${userId}:`, error);
    return {
      success: false,
      delivered: false,
      error: errorMessage
    };
  }
}

export function broadcastPushNotification(
  userIds: number[],
  notification: PushNotification
): { sent: number; failed: number; notConnected: number } {
  let sent = 0;
  let failed = 0;
  let notConnected = 0;

  for (const userId of userIds) {
    const result = sendPushNotification(userId, notification);
    if (result.delivered) {
      sent++;
    } else if (result.success && !result.delivered) {
      notConnected++;
    } else {
      failed++;
    }
  }

  logger.info(`Broadcast push notification completed`, {
    title: notification.title,
    sent,
    failed,
    notConnected,
    total: userIds.length
  });

  return { sent, failed, notConnected };
}

export function getConnectionStatus(): {
  connectedUsers: string[];
  totalConnections: number;
} {
  const connectedUsers = getConnectedUserIds();
  return {
    connectedUsers,
    totalConnections: connectedUsers.length
  };
}
