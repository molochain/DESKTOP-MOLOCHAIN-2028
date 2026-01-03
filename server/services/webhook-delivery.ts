/**
 * Webhook Delivery System
 * Delivers webhooks with HMAC signatures and exponential backoff retry
 */

import { db } from '../db';
import { ecosystemWebhooks, ecosystemServices } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';
import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
  service?: {
    id: number;
    slug: string;
    name: string;
  };
}

interface DeliveryResult {
  webhookId: number;
  success: boolean;
  statusCode?: number;
  responseTime: number;
  attempts: number;
  error?: string;
}

interface DeliveryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

class WebhookDeliveryService {
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly INITIAL_DELAY_MS = 1000;
  private readonly MAX_DELAY_MS = 30000;
  private readonly DELIVERY_TIMEOUT = 10000;

  private deliveryQueue: Map<number, NodeJS.Timeout> = new Map();
  private deliveryStats = {
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    retries: 0
  };

  async triggerEvent(
    serviceSlug: string,
    event: string,
    data: Record<string, any>
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    try {
      const [service] = await db.select()
        .from(ecosystemServices)
        .where(eq(ecosystemServices.slug, serviceSlug));

      if (!service) {
        logger.warn(`[WebhookDelivery] Service not found: ${serviceSlug}`);
        return results;
      }

      const webhooks = await db.select()
        .from(ecosystemWebhooks)
        .where(
          and(
            eq(ecosystemWebhooks.serviceId, service.id),
            eq(ecosystemWebhooks.isActive, true)
          )
        );

      const matchingWebhooks = webhooks.filter(wh => 
        wh.events?.includes(event) || wh.events?.includes('*')
      );

      logger.info(`[WebhookDelivery] Triggering ${event} for ${serviceSlug}: ${matchingWebhooks.length} webhooks`);

      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        service: {
          id: service.id,
          slug: service.slug,
          name: service.name
        }
      };

      const deliveryPromises = matchingWebhooks.map(webhook =>
        this.deliverWebhook(webhook, payload)
      );

      const deliveryResults = await Promise.allSettled(deliveryPromises);

      for (const result of deliveryResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      }

    } catch (error) {
      logger.error('[WebhookDelivery] Error triggering event:', error);
    }

    return results;
  }

  async deliverWebhook(
    webhook: typeof ecosystemWebhooks.$inferSelect,
    payload: WebhookPayload,
    options?: DeliveryOptions
  ): Promise<DeliveryResult> {
    const maxRetries = options?.maxRetries ?? webhook.maxRetries ?? this.DEFAULT_MAX_RETRIES;
    const initialDelay = options?.initialDelayMs ?? this.INITIAL_DELAY_MS;
    const maxDelay = options?.maxDelayMs ?? this.MAX_DELAY_MS;

    let attempts = 0;
    let lastError: string | undefined;
    let lastStatusCode: number | undefined;
    const startTime = Date.now();

    while (attempts < maxRetries) {
      attempts++;
      this.deliveryStats.totalDeliveries++;

      try {
        const result = await this.attemptDelivery(webhook, payload);

        if (result.success) {
          this.deliveryStats.successfulDeliveries++;

          await db.update(ecosystemWebhooks)
            .set({
              lastDelivery: new Date(),
              lastDeliveryStatus: 'success',
              failureCount: 0,
              updatedAt: new Date()
            })
            .where(eq(ecosystemWebhooks.id, webhook.id));

          logger.info(`[WebhookDelivery] Success: ${webhook.name} (${attempts} attempts)`);

          return {
            webhookId: webhook.id,
            success: true,
            statusCode: result.statusCode,
            responseTime: Date.now() - startTime,
            attempts
          };
        }

        lastStatusCode = result.statusCode;
        lastError = result.error;

      } catch (error: any) {
        lastError = error.message;
      }

      if (attempts < maxRetries) {
        this.deliveryStats.retries++;
        const delay = Math.min(initialDelay * Math.pow(2, attempts - 1), maxDelay);
        logger.warn(`[WebhookDelivery] Retry ${attempts}/${maxRetries} for ${webhook.name} in ${delay}ms`);
        await this.sleep(delay);
      }
    }

    this.deliveryStats.failedDeliveries++;

    const currentWebhook = await db.select()
      .from(ecosystemWebhooks)
      .where(eq(ecosystemWebhooks.id, webhook.id))
      .limit(1);

    const failureCount = (currentWebhook[0]?.failureCount || 0) + 1;

    await db.update(ecosystemWebhooks)
      .set({
        lastDelivery: new Date(),
        lastDeliveryStatus: 'failed',
        failureCount,
        updatedAt: new Date()
      })
      .where(eq(ecosystemWebhooks.id, webhook.id));

    logger.error(`[WebhookDelivery] Failed: ${webhook.name} after ${attempts} attempts`);

    return {
      webhookId: webhook.id,
      success: false,
      statusCode: lastStatusCode,
      responseTime: Date.now() - startTime,
      attempts,
      error: lastError
    };
  }

  private async attemptDelivery(
    webhook: typeof ecosystemWebhooks.$inferSelect,
    payload: WebhookPayload
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body, webhook.secret);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.DELIVERY_TIMEOUT);

    try {
      const response = await fetch(webhook.targetUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Timestamp': payload.timestamp,
          'X-Webhook-Id': webhook.id.toString(),
          'User-Agent': 'Molochain-WebhookDelivery/1.0'
        },
        body
      });

      clearTimeout(timeoutId);

      return {
        success: response.ok,
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  }

  private generateSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret || !payload) {
      return false;
    }

    const expectedSignature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;

    if (signature.length !== expectedSignature.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  getStats() {
    return { ...this.deliveryStats };
  }

  resetStats(): void {
    this.deliveryStats = {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      retries: 0
    };
  }
}

export const webhookDeliveryService = new WebhookDeliveryService();
