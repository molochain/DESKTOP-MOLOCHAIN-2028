import { eq, and } from 'drizzle-orm';
import { db } from './index.js';
import { messageQueue, deliveryLogs, userNotificationPreferences, type UserNotificationPreference } from './schema.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('db-operations');

export type MessageStatus = 
  | 'pending'
  | 'queued'
  | 'scheduled'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'retry_pending'
  | 'cancelled';

export type DeliveryStatus = 
  | 'delivered'
  | 'failed'
  | 'retry'
  | 'bounced'
  | 'rejected';

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus,
  attempts?: number,
  processedAt?: Date
): Promise<void> {
  try {
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };
    
    if (attempts !== undefined) {
      updateData.attempts = attempts;
    }
    
    if (processedAt) {
      updateData.processedAt = processedAt;
    }

    await db.update(messageQueue)
      .set(updateData)
      .where(eq(messageQueue.messageId, messageId));
    
    logger.debug(`Message ${messageId} status updated to: ${status}`);
  } catch (error) {
    logger.error(`Failed to update message status for ${messageId}:`, error);
  }
}

export async function recordDeliveryLog(
  messageId: string,
  channelType: string,
  recipient: string,
  status: DeliveryStatus | string,
  providerResponse?: Record<string, any>,
  errorMessage?: string
): Promise<void> {
  try {
    await db.insert(deliveryLogs).values({
      messageId,
      channelType,
      recipient,
      status,
      providerResponse,
      errorMessage,
      deliveredAt: status === 'delivered' ? new Date() : undefined,
    });
    logger.debug(`Delivery log recorded: ${messageId} - ${status}`);
  } catch (error) {
    logger.error('Failed to record delivery log:', error);
  }
}

export async function persistMessageToDb(
  messageId: string,
  channelType: string,
  recipient: string,
  subject: string | undefined,
  body: string,
  priority: number,
  status: MessageStatus,
  metadata?: Record<string, any>,
  scheduledAt?: Date
): Promise<void> {
  try {
    await db.insert(messageQueue).values({
      messageId,
      channelType,
      recipient,
      subject,
      body,
      priority,
      status,
      attempts: 0,
      maxAttempts: 3,
      metadata,
      scheduledAt,
    });
    logger.debug(`Message persisted to DB: ${messageId}`);
  } catch (error) {
    logger.error('Failed to persist message to DB:', error);
  }
}

export async function getUserPreferences(userId: number): Promise<UserNotificationPreference[]> {
  try {
    const prefs = await db.select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));
    return prefs;
  } catch (error) {
    logger.error(`Failed to get preferences for user ${userId}:`, error);
    return [];
  }
}

export async function getUserChannelPreference(
  userId: number,
  channelType: string
): Promise<UserNotificationPreference | null> {
  try {
    const [pref] = await db.select()
      .from(userNotificationPreferences)
      .where(and(
        eq(userNotificationPreferences.userId, userId),
        eq(userNotificationPreferences.channelType, channelType)
      ))
      .limit(1);
    return pref || null;
  } catch (error) {
    logger.error(`Failed to get ${channelType} preference for user ${userId}:`, error);
    return null;
  }
}

export async function upsertUserPreference(
  userId: number,
  channelType: string,
  enabled: boolean,
  address?: string,
  preferences?: Record<string, any>
): Promise<UserNotificationPreference | null> {
  try {
    const existing = await getUserChannelPreference(userId, channelType);
    
    if (existing) {
      const [updated] = await db.update(userNotificationPreferences)
        .set({
          enabled,
          address: address ?? existing.address,
          preferences: preferences ?? existing.preferences,
          updatedAt: new Date(),
        })
        .where(eq(userNotificationPreferences.id, existing.id))
        .returning();
      logger.debug(`Updated preference for user ${userId}: ${channelType} = ${enabled}`);
      return updated;
    } else {
      const [created] = await db.insert(userNotificationPreferences)
        .values({
          userId,
          channelType,
          enabled,
          address,
          preferences,
        })
        .returning();
      logger.debug(`Created preference for user ${userId}: ${channelType} = ${enabled}`);
      return created;
    }
  } catch (error) {
    logger.error(`Failed to upsert preference for user ${userId}:`, error);
    return null;
  }
}

export async function isChannelEnabledForUser(
  userId: number,
  channelType: string
): Promise<boolean> {
  const pref = await getUserChannelPreference(userId, channelType);
  return pref?.enabled ?? true;
}
