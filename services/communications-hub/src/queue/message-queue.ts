import Redis from 'ioredis';
import { createLogger } from '../utils/logger.js';
import { ChannelManager, ChannelType, SendResult } from '../channels/channel-manager.js';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('message-queue');

export interface QueuedMessage {
  id: string;
  channel: ChannelType;
  recipient: string;
  subject?: string;
  body: string;
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  scheduled: number;
}

export class MessageQueue {
  private redis: Redis | null = null;
  private channelManager: ChannelManager;
  private processing: boolean = false;
  private stats: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    scheduled: 0,
  };
  private processInterval: NodeJS.Timeout | null = null;

  private readonly QUEUE_KEY = 'comms:queue';
  private readonly PROCESSING_KEY = 'comms:processing';
  private readonly SCHEDULED_KEY = 'comms:scheduled';
  private readonly DEAD_LETTER_KEY = 'comms:dead-letter';

  constructor(channelManager: ChannelManager) {
    this.channelManager = channelManager;
  }

  async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl);
      
      this.redis.on('error', (err) => {
        logger.error('Redis connection error:', err);
      });

      this.redis.on('connect', () => {
        logger.info('Connected to Redis');
      });

      this.startProcessing();
      this.startScheduledCheck();
      
      logger.info('Message queue initialized');
    } catch (error) {
      logger.error('Failed to initialize message queue:', error);
      throw error;
    }
  }

  async enqueue(message: Omit<QueuedMessage, 'id' | 'attempts' | 'createdAt'>): Promise<string> {
    if (!this.redis) {
      throw new Error('Message queue not initialized');
    }

    const id = uuidv4();
    const queuedMessage: QueuedMessage = {
      ...message,
      id,
      attempts: 0,
      maxAttempts: message.maxAttempts || 3,
      createdAt: new Date(),
    };

    if (message.scheduledAt && new Date(message.scheduledAt) > new Date()) {
      await this.redis.zadd(
        this.SCHEDULED_KEY,
        new Date(message.scheduledAt).getTime(),
        JSON.stringify(queuedMessage)
      );
      this.stats.scheduled++;
      logger.info(`Message ${id} scheduled for ${message.scheduledAt}`);
    } else {
      const score = Date.now() - (message.priority || 5) * 1000;
      await this.redis.zadd(this.QUEUE_KEY, score, JSON.stringify(queuedMessage));
      this.stats.pending++;
      logger.info(`Message ${id} enqueued for channel ${message.channel}`);
    }

    return id;
  }

  private startProcessing(): void {
    this.processInterval = setInterval(() => this.processQueue(), 1000);
  }

  private startScheduledCheck(): void {
    setInterval(() => this.checkScheduled(), 10000);
  }

  private async processQueue(): Promise<void> {
    if (!this.redis || this.processing) return;

    this.processing = true;

    try {
      const messages = await this.redis.zpopmin(this.QUEUE_KEY, 5);
      
      if (!messages || messages.length === 0) {
        this.processing = false;
        return;
      }

      for (let i = 0; i < messages.length; i += 2) {
        const messageStr = messages[i];
        if (typeof messageStr !== 'string') continue;

        try {
          const message: QueuedMessage = JSON.parse(messageStr);
          await this.processMessage(message);
        } catch (err) {
          logger.error('Failed to parse message:', err);
        }
      }
    } catch (error) {
      logger.error('Queue processing error:', error);
    } finally {
      this.processing = false;
    }
  }

  private async processMessage(message: QueuedMessage): Promise<void> {
    this.stats.pending--;
    this.stats.processing++;

    try {
      message.attempts++;

      const result: SendResult = await this.channelManager.send(
        message.channel,
        message.recipient,
        message.subject,
        message.body,
        message.metadata
      );

      if (result.success) {
        this.stats.processing--;
        this.stats.completed++;
        logger.info(`Message ${message.id} delivered successfully`);
      } else {
        await this.handleFailure(message, result.error || 'Unknown error');
      }
    } catch (error: any) {
      await this.handleFailure(message, error.message);
    }
  }

  private async handleFailure(message: QueuedMessage, error: string): Promise<void> {
    this.stats.processing--;

    if (message.attempts < message.maxAttempts) {
      const delay = Math.pow(2, message.attempts) * 1000;
      const retryAt = Date.now() + delay;
      
      await this.redis!.zadd(this.QUEUE_KEY, retryAt, JSON.stringify(message));
      this.stats.pending++;
      
      logger.warn(`Message ${message.id} failed, retry ${message.attempts}/${message.maxAttempts} in ${delay}ms`);
    } else {
      await this.redis!.lpush(this.DEAD_LETTER_KEY, JSON.stringify({
        ...message,
        error,
        failedAt: new Date().toISOString(),
      }));
      this.stats.failed++;
      
      logger.error(`Message ${message.id} moved to dead letter queue after ${message.maxAttempts} attempts`);
    }
  }

  private async checkScheduled(): Promise<void> {
    if (!this.redis) return;

    try {
      const now = Date.now();
      const messages = await this.redis.zrangebyscore(this.SCHEDULED_KEY, 0, now);

      for (const messageStr of messages) {
        const message: QueuedMessage = JSON.parse(messageStr);
        
        await this.redis.zrem(this.SCHEDULED_KEY, messageStr);
        this.stats.scheduled--;
        
        const score = Date.now() - (message.priority || 5) * 1000;
        await this.redis.zadd(this.QUEUE_KEY, score, JSON.stringify(message));
        this.stats.pending++;
        
        logger.info(`Scheduled message ${message.id} moved to queue`);
      }
    } catch (error) {
      logger.error('Error checking scheduled messages:', error);
    }
  }

  getStats(): QueueStats {
    return { ...this.stats };
  }

  async getQueueLength(): Promise<number> {
    if (!this.redis) return 0;
    return await this.redis.zcard(this.QUEUE_KEY);
  }

  async shutdown(): Promise<void> {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }
    
    if (this.redis) {
      await this.redis.quit();
    }
    
    logger.info('Message queue shut down');
  }
}
