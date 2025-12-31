import { Redis } from 'ioredis';
import { Logger } from 'winston';

interface EventBusConfig {
  redisUrl: string;
  logger: Logger;
}

export interface WorkflowEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  source: string;
}

export class EventBus {
  private redis: Redis | null = null;
  private subscriber: Redis | null = null;
  private config: EventBusConfig;
  private handlers: Map<string, ((event: WorkflowEvent) => Promise<void>)[]> = new Map();

  constructor(config: EventBusConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.redis = new Redis(this.config.redisUrl);
      this.subscriber = new Redis(this.config.redisUrl);

      this.subscriber.on('message', async (channel: string, message: string) => {
        try {
          const event = JSON.parse(message) as WorkflowEvent;
          const handlers = this.handlers.get(channel) || [];
          for (const handler of handlers) {
            await handler(event);
          }
        } catch (error) {
          this.config.logger.error('Failed to process event', { channel, error });
        }
      });

      this.config.logger.info('Event bus connected to Redis');
    } catch (error) {
      this.config.logger.warn('Redis not available, using in-memory event bus');
      this.redis = null;
      this.subscriber = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) await this.redis.quit();
    if (this.subscriber) await this.subscriber.quit();
  }

  async publish(eventType: string, payload: any, source: string = 'orchestrator'): Promise<void> {
    const event: WorkflowEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      source
    };

    if (this.redis) {
      await this.redis.publish(`workflow:${eventType}`, JSON.stringify(event));
      await this.redis.lpush('workflow:events:recent', JSON.stringify(event));
      await this.redis.ltrim('workflow:events:recent', 0, 999);
    }

    const handlers = this.handlers.get(`workflow:${eventType}`) || [];
    for (const handler of handlers) {
      await handler(event);
    }

    this.config.logger.debug('Event published', { eventType, eventId: event.id });
  }

  subscribe(eventType: string, handler: (event: WorkflowEvent) => Promise<void>): void {
    const channel = `workflow:${eventType}`;
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      if (this.subscriber) {
        this.subscriber.subscribe(channel);
      }
    }
    this.handlers.get(channel)!.push(handler);
  }

  async getRecentEvents(limit: number = 50): Promise<WorkflowEvent[]> {
    if (!this.redis) return [];
    const events = await this.redis.lrange('workflow:events:recent', 0, limit - 1);
    return events.map((e: string) => JSON.parse(e));
  }
}
