import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';
import type { OTMSOrder, OTMSOrderStatus, OTMSSearchResult } from '@shared/schema';

const OTMS_BASE_URL = process.env.OTMS_API_URL || 'https://opt.molochain.com/v1';

/**
 * OTMS (Order Tracking Management System) Client
 * 
 * API Base: https://opt.molochain.com/v1
 * 
 * This client provides methods to interact with the OTMS API for:
 * - Order tracking by tracking ID
 * - Order status history
 * - Order search functionality
 * 
 * Note: OTMS service may not be fully operational yet.
 * Graceful degradation and proper error handling are implemented.
 */

/**
 * Retry configuration for transient failures
 */
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
};

/**
 * HTTP methods that are safe to retry (idempotent)
 */
const RETRYABLE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * HTTP status codes that indicate transient failures worth retrying
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export interface OTMSHealthStatus {
  status: 'ok' | 'degraded' | 'offline';
  timestamp: string;
  version?: string;
  latencyMs?: number;
}

export interface OTMSClientStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestTime: Date | null;
  averageLatencyMs: number;
}

class OTMSClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;
  private stats: OTMSClientStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    lastRequestTime: null,
    averageLatencyMs: 0,
  };
  private latencies: number[] = [];

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;

    this.client = axios.create({
      baseURL: OTMS_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client': 'MoloChain-Platform',
      },
    });

    this.setupRetryInterceptor();
  }

  /**
   * Setup axios interceptor for automatic retry with exponential backoff
   * Only retries idempotent requests (GET, HEAD, OPTIONS) on transient failures
   */
  private setupRetryInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;

        if (!config) {
          return Promise.reject(error);
        }

        // Initialize retry count
        config.__retryCount = config.__retryCount || 0;

        const method = (config.method || 'GET').toUpperCase();
        const statusCode = error.response?.status;
        const isRetryable = RETRYABLE_METHODS.includes(method);
        const isTransientError = statusCode ? RETRYABLE_STATUS_CODES.includes(statusCode) : !error.response;
        const canRetry = config.__retryCount < this.retryConfig.maxRetries;

        // Only retry idempotent methods on transient failures
        if (isRetryable && isTransientError && canRetry) {
          config.__retryCount += 1;

          // Exponential backoff with jitter
          const delay = Math.min(
            this.retryConfig.baseDelayMs * Math.pow(2, config.__retryCount - 1) + Math.random() * 100,
            this.retryConfig.maxDelayMs
          );

          logger.warn('OTMS API retry attempt', {
            attempt: config.__retryCount,
            maxRetries: this.retryConfig.maxRetries,
            url: config.url,
            status: statusCode,
            delayMs: delay,
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client.request(config);
        }

        // Log error for non-retryable failures
        logger.error('OTMS API Error:', {
          status: statusCode,
          message: error.message,
          url: config.url,
          retryCount: config.__retryCount,
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * Record request metrics for monitoring
   */
  private recordMetrics(success: boolean, latencyMs: number): void {
    this.stats.totalRequests++;
    this.stats.lastRequestTime = new Date();
    
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // Keep last 100 latencies for average calculation
    this.latencies.push(latencyMs);
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
    this.stats.averageLatencyMs = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  /**
   * Get client statistics
   */
  getStats(): OTMSClientStats {
    return { ...this.stats };
  }

  /**
   * Health check for OTMS API
   */
  async healthCheck(): Promise<OTMSHealthStatus> {
    const startTime = Date.now();
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(true, latencyMs);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: response.data?.version,
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(false, latencyMs);

      // Try a secondary endpoint as fallback
      try {
        await this.client.get('/ping', { timeout: 3000 });
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
        };
      } catch {
        logger.warn('OTMS health check failed - service may be offline', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          status: 'offline',
          timestamp: new Date().toISOString(),
          latencyMs,
        };
      }
    }
  }

  /**
   * Get order by tracking ID
   */
  async getOrder(trackingId: string): Promise<OTMSOrder | null> {
    if (!trackingId || trackingId.trim() === '') {
      throw new Error('Tracking ID is required');
    }

    const startTime = Date.now();
    try {
      const response = await this.client.get(`/orders/${encodeURIComponent(trackingId)}`);
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(true, latencyMs);

      const data = response.data?.data || response.data;
      return this.normalizeOrder(data);
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(false, latencyMs);

      if (error.response?.status === 404) {
        logger.info('Order not found in OTMS', { trackingId });
        return null;
      }

      logger.error('Failed to fetch order from OTMS:', {
        trackingId,
        error: error.message,
        status: error.response?.status,
      });
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  /**
   * Get order status history by tracking ID
   */
  async getOrderStatus(trackingId: string): Promise<OTMSOrderStatus[]> {
    if (!trackingId || trackingId.trim() === '') {
      throw new Error('Tracking ID is required');
    }

    const startTime = Date.now();
    try {
      const response = await this.client.get(`/orders/${encodeURIComponent(trackingId)}/status`);
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(true, latencyMs);

      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.map(this.normalizeStatus) : [];
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(false, latencyMs);

      if (error.response?.status === 404) {
        logger.info('Order status not found in OTMS', { trackingId });
        return [];
      }

      logger.error('Failed to fetch order status from OTMS:', {
        trackingId,
        error: error.message,
        status: error.response?.status,
      });
      throw new Error(`Failed to fetch order status: ${error.message}`);
    }
  }

  /**
   * Search orders by query parameters
   */
  async searchOrders(query: {
    q?: string;
    status?: string;
    origin?: string;
    destination?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<OTMSSearchResult> {
    const startTime = Date.now();
    try {
      const params = new URLSearchParams();
      if (query.q) params.append('q', query.q);
      if (query.status) params.append('status', query.status);
      if (query.origin) params.append('origin', query.origin);
      if (query.destination) params.append('destination', query.destination);
      if (query.fromDate) params.append('from_date', query.fromDate);
      if (query.toDate) params.append('to_date', query.toDate);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', Math.min(query.limit, 100).toString());

      const response = await this.client.get(`/orders/search?${params.toString()}`);
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(true, latencyMs);

      const data = response.data;
      return {
        orders: (data.data || data.orders || []).map((o: any) => this.normalizeOrder(o)),
        total: data.total || data.meta?.total || 0,
        page: data.page || data.meta?.current_page || 1,
        limit: data.limit || data.meta?.per_page || 10,
        hasMore: data.has_more || (data.meta?.current_page < data.meta?.last_page) || false,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      this.recordMetrics(false, latencyMs);

      logger.error('Failed to search orders in OTMS:', {
        query,
        error: error.message,
        status: error.response?.status,
      });

      // Return empty result on error for graceful degradation
      return {
        orders: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 10,
        hasMore: false,
      };
    }
  }

  /**
   * Normalize order data from API response
   */
  private normalizeOrder(data: any): OTMSOrder {
    return {
      id: data.id?.toString() || data._id?.toString() || '',
      trackingId: data.tracking_id || data.trackingId || data.tracking_number || '',
      status: data.status || 'unknown',
      origin: data.origin || data.origin_location || '',
      destination: data.destination || data.destination_location || '',
      estimatedDelivery: data.estimated_delivery || data.estimatedDelivery || data.eta || null,
      actualDelivery: data.actual_delivery || data.actualDelivery || data.delivered_at || null,
      shipper: data.shipper || data.sender || null,
      recipient: data.recipient || data.receiver || null,
      weight: data.weight || null,
      dimensions: data.dimensions || null,
      serviceType: data.service_type || data.serviceType || null,
      carrier: data.carrier || null,
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
      metadata: data.metadata || data.extra || null,
    };
  }

  /**
   * Normalize status data from API response
   */
  private normalizeStatus(data: any): OTMSOrderStatus {
    return {
      status: data.status || 'unknown',
      location: data.location || data.current_location || '',
      timestamp: data.timestamp || data.created_at || data.event_time || new Date().toISOString(),
      description: data.description || data.message || data.details || '',
      code: data.code || data.status_code || null,
    };
  }

  /**
   * Get diagnostic summary for monitoring
   */
  async getDiagnosticSummary(): Promise<{
    healthy: boolean;
    status: OTMSHealthStatus;
    stats: OTMSClientStats;
    baseUrl: string;
  }> {
    const healthStatus = await this.healthCheck();
    return {
      healthy: healthStatus.status === 'ok',
      status: healthStatus,
      stats: this.getStats(),
      baseUrl: OTMS_BASE_URL,
    };
  }
}

export const otmsClient = new OTMSClient();
export default otmsClient;
