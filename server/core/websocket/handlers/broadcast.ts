/**
 * WebSocket Broadcast Helper Functions
 * Provides utilities for broadcasting messages to specific user groups
 */

import { UnifiedWebSocketManager } from '../UnifiedWebSocketManager';
import { logger } from '../../../utils/logger';
import { db } from '../../database/db.service';
import { users } from '@db/schema';
import { eq, or, inArray } from 'drizzle-orm';

// Get the WebSocket manager instance
let wsManager: UnifiedWebSocketManager | null = null;

/**
 * Initialize the broadcast helper with WebSocket manager
 */
export function initializeBroadcast(manager: UnifiedWebSocketManager) {
  wsManager = manager;
  logger.info('Broadcast helper initialized');
}

/**
 * Broadcast a message to all administrators
 * @param eventType The type of event being broadcast
 * @param data The data to broadcast
 */
export async function broadcastToAdmins(eventType: string, data: any): Promise<void> {
  try {
    // Get all admin users
    const adminUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(
        or(
          eq(users.role, 'admin'),
          eq(users.role, 'superadmin'),
          eq(users.role, 'security')
        )
      );

    const adminIds = adminUsers.map(u => u.id.toString());

    // Broadcast to admin users via notifications channel
    if (wsManager) {
      wsManager.broadcast('/ws/notifications', {
        type: 'security_alert',
        eventType,
        payload: {
          ...data,
          timestamp: new Date().toISOString(),
          targetUsers: adminIds
        }
      });

      logger.info(`Broadcast ${eventType} to ${adminIds.length} admins`);
    } else {
      logger.warn('WebSocket manager not initialized, cannot broadcast');
    }
  } catch (error) {
    logger.error(`Failed to broadcast to admins: ${error}`);
  }
}

/**
 * Broadcast a message to specific users
 * @param userIds Array of user IDs to broadcast to
 * @param eventType The type of event being broadcast
 * @param data The data to broadcast
 */
export async function broadcastToUsers(
  userIds: number[],
  eventType: string,
  data: any
): Promise<void> {
  try {
    if (!wsManager) {
      logger.warn('WebSocket manager not initialized, cannot broadcast');
      return;
    }

    const userIdStrings = userIds.map(id => id.toString());

    wsManager.broadcast('/ws/notifications', {
      type: 'notification',
      eventType,
      payload: {
        ...data,
        timestamp: new Date().toISOString(),
        targetUsers: userIdStrings
      }
    });

    logger.info(`Broadcast ${eventType} to ${userIds.length} users`);
  } catch (error) {
    logger.error(`Failed to broadcast to users: ${error}`);
  }
}

/**
 * Broadcast an incident alert to relevant security personnel
 * @param incident The incident data
 * @param alertLevel The alert level (info, warning, critical)
 */
export async function broadcastIncidentAlert(
  incident: {
    id: string;
    title: string;
    severity: string;
    type: string;
    status?: string;
    [key: string]: any;
  },
  alertLevel: 'info' | 'warning' | 'critical' = 'warning'
): Promise<void> {
  try {
    // Get security and admin users
    const securityUsers = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(
        or(
          eq(users.role, 'admin'),
          eq(users.role, 'superadmin'),
          eq(users.role, 'security')
        )
      );

    if (!wsManager) {
      logger.warn('WebSocket manager not initialized, cannot broadcast incident alert');
      return;
    }

    // Broadcast the incident alert
    wsManager.broadcast('/ws/notifications', {
      type: 'incident_alert',
      alertLevel,
      payload: {
        incident: {
          id: incident.id,
          title: incident.title,
          severity: incident.severity,
          type: incident.type,
          status: incident.status || 'open'
        },
        timestamp: new Date().toISOString(),
        targetUsers: securityUsers.map(u => u.id.toString()),
        requiresAction: alertLevel === 'critical'
      }
    });

    logger.info(
      `Broadcast incident alert (${alertLevel}) for incident ${incident.id} to ${securityUsers.length} security personnel`
    );
  } catch (error) {
    logger.error(`Failed to broadcast incident alert: ${error}`);
  }
}

/**
 * Broadcast a threat detection alert
 * @param threat The threat data
 */
export async function broadcastThreatAlert(threat: {
  id: string;
  type: string;
  severity: string;
  description: string;
  userId?: number;
  [key: string]: any;
}): Promise<void> {
  try {
    await broadcastToAdmins('threat_detected', {
      threat: {
        id: threat.id,
        type: threat.type,
        severity: threat.severity,
        description: threat.description,
        affectedUser: threat.userId
      },
      requiresAction: threat.severity === 'critical' || threat.severity === 'high'
    });
  } catch (error) {
    logger.error(`Failed to broadcast threat alert: ${error}`);
  }
}

/**
 * Broadcast a system security event
 * @param eventType The type of security event
 * @param details Event details
 */
export async function broadcastSecurityEvent(
  eventType: string,
  details: any
): Promise<void> {
  try {
    await broadcastToAdmins('security_event', {
      eventType,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to broadcast security event: ${error}`);
  }
}

/**
 * Broadcast an investigation update
 * @param incidentId The incident ID
 * @param update The investigation update
 */
export async function broadcastInvestigationUpdate(
  incidentId: string,
  update: {
    type: string;
    description: string;
    investigatorId?: number;
    [key: string]: any;
  }
): Promise<void> {
  try {
    await broadcastToAdmins('investigation_update', {
      incidentId,
      update: {
        type: update.type,
        description: update.description,
        investigator: update.investigatorId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Failed to broadcast investigation update: ${error}`);
  }
}

/**
 * Broadcast a compliance notification
 * @param notification The compliance notification data
 */
export async function broadcastComplianceNotification(notification: {
  framework: string;
  type: string;
  message: string;
  deadline?: Date;
  [key: string]: any;
}): Promise<void> {
  try {
    await broadcastToAdmins('compliance_notification', {
      framework: notification.framework,
      type: notification.type,
      message: notification.message,
      deadline: notification.deadline?.toISOString(),
      requiresAction: true
    });
  } catch (error) {
    logger.error(`Failed to broadcast compliance notification: ${error}`);
  }
}