import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { messageQueue, deliveryLogs } from './schema.js';
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
