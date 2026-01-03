/**
 * Ecosystem Health Worker
 * Automated polling of all registered service health endpoints
 * with Prometheus-compatible metrics export
 */

import { db } from '../db';
import { ecosystemServices } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { webhookDeliveryService } from './webhook-delivery';

interface HealthCheckResult {
  serviceId: number;
  slug: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  statusCode?: number;
  error?: string;
  checkedAt: Date;
}

interface ServiceMetrics {
  slug: string;
  name: string;
  status: number;
  responseTime: number;
  lastCheck: number;
  checksTotal: number;
  checksSuccessful: number;
  checksFailed: number;
  uptimePercent: number;
}

class EcosystemHealthWorker {
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private metrics: Map<string, ServiceMetrics> = new Map();
  private readonly DEFAULT_POLL_INTERVAL = 60000;
  private readonly CHECK_TIMEOUT = 10000;

  async initialize(pollIntervalMs?: number): Promise<void> {
    if (this.isRunning) {
      logger.warn('[EcosystemHealth] Worker already running');
      return;
    }

    const interval = pollIntervalMs || this.DEFAULT_POLL_INTERVAL;
    logger.info(`[EcosystemHealth] Starting health worker (interval: ${interval}ms)`);

    await this.performHealthChecks();

    this.pollInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, interval);

    this.isRunning = true;
    logger.info('[EcosystemHealth] Worker started successfully');
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    logger.info('[EcosystemHealth] Worker stopped');
  }

  async performHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    try {
      const services = await db.select().from(ecosystemServices);
      logger.info(`[EcosystemHealth] Checking ${services.length} services`);

      const checkPromises = services.map(service => this.checkServiceHealth(service));
      const checkResults = await Promise.allSettled(checkPromises);

      for (const result of checkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      }

      logger.info(`[EcosystemHealth] Completed checks: ${results.filter(r => r.status === 'healthy').length}/${results.length} healthy`);
    } catch (error) {
      logger.error('[EcosystemHealth] Error during health checks:', error);
    }

    return results;
  }

  private async checkServiceHealth(service: typeof ecosystemServices.$inferSelect): Promise<HealthCheckResult> {
    const healthUrl = `${service.baseUrl}${service.healthEndpoint}`;
    const startTime = Date.now();
    let status: 'healthy' | 'unhealthy' | 'unknown' = 'unknown';
    let statusCode: number | undefined;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.CHECK_TIMEOUT);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Molochain-EcosystemHealthWorker/1.0'
        }
      });

      clearTimeout(timeoutId);
      statusCode = response.status;
      status = response.ok ? 'healthy' : 'unhealthy';

    } catch (err: any) {
      status = 'unhealthy';
      error = err.name === 'AbortError' ? 'Timeout' : err.message;
    }

    const responseTime = Date.now() - startTime;
    const checkedAt = new Date();
    const previousStatus = service.status;
    const newStatus = status === 'healthy' ? 'active' : 'inactive';

    await db.update(ecosystemServices)
      .set({
        lastHealthCheck: checkedAt,
        status: newStatus,
        updatedAt: checkedAt
      })
      .where(eq(ecosystemServices.id, service.id));

    this.updateMetrics(service.slug, service.name, status, responseTime);

    if (previousStatus !== newStatus) {
      logger.warn(`[EcosystemHealth] Status change: ${service.slug} ${previousStatus} → ${newStatus}`);
      this.emitStatusChangeEvent(service.slug, previousStatus || 'unknown', newStatus);
    }

    return {
      serviceId: service.id,
      slug: service.slug,
      status,
      responseTime,
      statusCode,
      error,
      checkedAt
    };
  }

  private updateMetrics(slug: string, name: string, status: 'healthy' | 'unhealthy' | 'unknown', responseTime: number): void {
    const existing = this.metrics.get(slug) || {
      slug,
      name,
      status: 0,
      responseTime: 0,
      lastCheck: 0,
      checksTotal: 0,
      checksSuccessful: 0,
      checksFailed: 0,
      uptimePercent: 100
    };

    existing.checksTotal++;
    if (status === 'healthy') {
      existing.checksSuccessful++;
      existing.status = 1;
    } else {
      existing.checksFailed++;
      existing.status = 0;
    }

    existing.responseTime = responseTime;
    existing.lastCheck = Date.now();
    existing.uptimePercent = (existing.checksSuccessful / existing.checksTotal) * 100;

    this.metrics.set(slug, existing);
  }

  private async emitStatusChangeEvent(slug: string, oldStatus: string, newStatus: string): Promise<void> {
    const eventType = newStatus === 'active' ? 'service.recovered' : 'service.degraded';
    logger.info(`[EcosystemHealth] Event: ${eventType} for ${slug}`);

    try {
      const results = await webhookDeliveryService.triggerEvent(slug, eventType, {
        previousStatus: oldStatus,
        currentStatus: newStatus,
        changedAt: new Date().toISOString(),
        slug
      });

      if (results.length > 0) {
        const successful = results.filter(r => r.success).length;
        logger.info(`[EcosystemHealth] Webhooks delivered: ${successful}/${results.length} for ${eventType}`);
      }
    } catch (error) {
      logger.error(`[EcosystemHealth] Failed to trigger webhooks for ${eventType}:`, error);
    }
  }

  getPrometheusMetrics(): string {
    const lines: string[] = [];

    lines.push('# HELP ecosystem_service_up Service health status (1=up, 0=down)');
    lines.push('# TYPE ecosystem_service_up gauge');

    lines.push('# HELP ecosystem_service_response_time_ms Response time in milliseconds');
    lines.push('# TYPE ecosystem_service_response_time_ms gauge');

    lines.push('# HELP ecosystem_service_checks_total Total number of health checks');
    lines.push('# TYPE ecosystem_service_checks_total counter');

    lines.push('# HELP ecosystem_service_checks_successful_total Successful health checks');
    lines.push('# TYPE ecosystem_service_checks_successful_total counter');

    lines.push('# HELP ecosystem_service_checks_failed_total Failed health checks');
    lines.push('# TYPE ecosystem_service_checks_failed_total counter');

    lines.push('# HELP ecosystem_service_uptime_percent Uptime percentage');
    lines.push('# TYPE ecosystem_service_uptime_percent gauge');

    for (const [slug, metrics] of this.metrics) {
      const labels = `service="${slug}",name="${metrics.name.replace(/"/g, '\\"')}"`;

      lines.push(`ecosystem_service_up{${labels}} ${metrics.status}`);
      lines.push(`ecosystem_service_response_time_ms{${labels}} ${metrics.responseTime}`);
      lines.push(`ecosystem_service_checks_total{${labels}} ${metrics.checksTotal}`);
      lines.push(`ecosystem_service_checks_successful_total{${labels}} ${metrics.checksSuccessful}`);
      lines.push(`ecosystem_service_checks_failed_total{${labels}} ${metrics.checksFailed}`);
      lines.push(`ecosystem_service_uptime_percent{${labels}} ${metrics.uptimePercent.toFixed(2)}`);
    }

    lines.push('');
    lines.push('# HELP ecosystem_health_worker_running Health worker status');
    lines.push('# TYPE ecosystem_health_worker_running gauge');
    lines.push(`ecosystem_health_worker_running ${this.isRunning ? 1 : 0}`);

    lines.push('');
    lines.push('# HELP ecosystem_services_total Total registered services');
    lines.push('# TYPE ecosystem_services_total gauge');
    lines.push(`ecosystem_services_total ${this.metrics.size}`);

    const healthyCount = Array.from(this.metrics.values()).filter(m => m.status === 1).length;
    lines.push('');
    lines.push('# HELP ecosystem_services_healthy Number of healthy services');
    lines.push('# TYPE ecosystem_services_healthy gauge');
    lines.push(`ecosystem_services_healthy ${healthyCount}`);

    return lines.join('\n');
  }

  getMetricsJson(): ServiceMetrics[] {
    return Array.from(this.metrics.values());
  }

  async getServiceStatus(slug: string): Promise<ServiceMetrics | null> {
    return this.metrics.get(slug) || null;
  }

  isWorkerRunning(): boolean {
    return this.isRunning;
  }
}

export const ecosystemHealthWorker = new EcosystemHealthWorker();
