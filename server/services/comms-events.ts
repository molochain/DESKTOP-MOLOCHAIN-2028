import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { sendPushNotification, broadcastPushNotification } from './push-websocket-bridge';

const commsEventEmitter = new EventEmitter();

export interface CommsEventConfig {
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
}

const defaultConfig: CommsEventConfig = {
  enabled: true,
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
  whatsappEnabled: false,
};

let eventConfig: CommsEventConfig = { ...defaultConfig };

export function setCommsEventConfig(config: Partial<CommsEventConfig>): void {
  eventConfig = { ...eventConfig, ...config };
  logger.info('Comms event config updated', eventConfig);
}

export function getCommsEventConfig(): CommsEventConfig {
  return { ...eventConfig };
}

export type AuthEventType = 'auth.login' | 'auth.register' | 'auth.password_reset';
export type OrderEventType = 'order.created' | 'order.status_changed';
export type SystemEventType = 'system.alert';
export type CommsEventType = AuthEventType | OrderEventType | SystemEventType;

export interface AuthEventPayload {
  type: AuthEventType;
  userId: number;
  userEmail: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface OrderEventPayload {
  type: OrderEventType;
  orderId: string;
  userId: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface SystemAlertPayload {
  type: 'system.alert';
  alertType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  affectedUserIds: number[];
  timestamp: Date;
}

function logEvent(eventType: string, payload: Record<string, any>): void {
  logger.info(`[CommsEvent] ${eventType}`, {
    eventType,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

commsEventEmitter.on('auth.login', async (payload: AuthEventPayload) => {
  if (!eventConfig.enabled) return;
  logEvent('auth.login', { userId: payload.userId, email: payload.userEmail });

  if (eventConfig.pushEnabled) {
    try {
      sendPushNotification(payload.userId, {
        title: 'Login Notification',
        body: `You logged in from ${payload.metadata?.ip_address || 'unknown location'}`,
        metadata: { eventType: 'auth.login', ...payload.metadata },
      });
    } catch (error) {
      logger.debug('Push notification failed for auth.login', error);
    }
  }
});

commsEventEmitter.on('auth.register', async (payload: AuthEventPayload) => {
  if (!eventConfig.enabled) return;
  logEvent('auth.register', { userId: payload.userId, email: payload.userEmail });

  if (eventConfig.pushEnabled) {
    try {
      sendPushNotification(payload.userId, {
        title: 'Welcome to MoloChain!',
        body: 'Your account has been created successfully.',
        metadata: { eventType: 'auth.register', ...payload.metadata },
      });
    } catch (error) {
      logger.debug('Push notification failed for auth.register', error);
    }
  }
});

commsEventEmitter.on('auth.password_reset', async (payload: AuthEventPayload) => {
  if (!eventConfig.enabled) return;
  logEvent('auth.password_reset', { userId: payload.userId, email: payload.userEmail });

  if (eventConfig.pushEnabled) {
    try {
      sendPushNotification(payload.userId, {
        title: 'Password Reset Requested',
        body: 'A password reset was requested for your account.',
        metadata: { eventType: 'auth.password_reset', ...payload.metadata },
      });
    } catch (error) {
      logger.debug('Push notification failed for auth.password_reset', error);
    }
  }
});

commsEventEmitter.on('order.created', async (payload: OrderEventPayload) => {
  if (!eventConfig.enabled) return;
  logEvent('order.created', { orderId: payload.orderId, userId: payload.userId });

  if (eventConfig.pushEnabled) {
    try {
      sendPushNotification(payload.userId, {
        title: 'Order Created',
        body: `Your order #${payload.orderId} has been created.`,
        metadata: { eventType: 'order.created', orderId: payload.orderId, ...payload.metadata },
      });
    } catch (error) {
      logger.debug('Push notification failed for order.created', error);
    }
  }
});

commsEventEmitter.on('order.status_changed', async (payload: OrderEventPayload) => {
  if (!eventConfig.enabled) return;
  logEvent('order.status_changed', { orderId: payload.orderId, userId: payload.userId, status: payload.metadata?.status });

  if (eventConfig.pushEnabled) {
    try {
      sendPushNotification(payload.userId, {
        title: 'Order Status Updated',
        body: `Order #${payload.orderId} status: ${payload.metadata?.status || 'updated'}`,
        metadata: { eventType: 'order.status_changed', orderId: payload.orderId, ...payload.metadata },
      });
    } catch (error) {
      logger.debug('Push notification failed for order.status_changed', error);
    }
  }
});

commsEventEmitter.on('system.alert', async (payload: SystemAlertPayload) => {
  if (!eventConfig.enabled) return;
  logEvent('system.alert', { alertType: payload.alertType, severity: payload.severity, affectedUsers: payload.affectedUserIds.length });

  if (eventConfig.pushEnabled && payload.affectedUserIds.length > 0) {
    try {
      broadcastPushNotification(payload.affectedUserIds, {
        title: `System Alert: ${payload.alertType}`,
        body: payload.message,
        metadata: { eventType: 'system.alert', severity: payload.severity, alertType: payload.alertType },
      });
    } catch (error) {
      logger.debug('Broadcast push notification failed for system.alert', error);
    }
  }
});

export function emitAuthEvent(
  type: 'login' | 'register' | 'password_reset',
  userId: number,
  userEmail: string,
  metadata?: Record<string, any>
): void {
  const eventType: AuthEventType = `auth.${type}` as AuthEventType;
  const payload: AuthEventPayload = {
    type: eventType,
    userId,
    userEmail,
    metadata,
    timestamp: new Date(),
  };

  setImmediate(() => {
    try {
      commsEventEmitter.emit(eventType, payload);
    } catch (error) {
      logger.error(`Failed to emit ${eventType} event`, error);
    }
  });
}

export function emitOrderEvent(
  type: 'created' | 'status_changed',
  orderId: string,
  userId: number,
  metadata?: Record<string, any>
): void {
  const eventType: OrderEventType = `order.${type}` as OrderEventType;
  const payload: OrderEventPayload = {
    type: eventType,
    orderId,
    userId,
    metadata,
    timestamp: new Date(),
  };

  setImmediate(() => {
    try {
      commsEventEmitter.emit(eventType, payload);
    } catch (error) {
      logger.error(`Failed to emit ${eventType} event`, error);
    }
  });
}

export function emitSystemAlert(
  alertType: string,
  severity: 'info' | 'warning' | 'error' | 'critical',
  message: string,
  affectedUserIds: number[]
): void {
  const payload: SystemAlertPayload = {
    type: 'system.alert',
    alertType,
    severity,
    message,
    affectedUserIds,
    timestamp: new Date(),
  };

  setImmediate(() => {
    try {
      commsEventEmitter.emit('system.alert', payload);
    } catch (error) {
      logger.error('Failed to emit system.alert event', error);
    }
  });
}

export { commsEventEmitter };
