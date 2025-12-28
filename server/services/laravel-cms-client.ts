import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { cmsMonitor } from '../utils/cms-monitor';
import { cmsCache } from '../utils/cms-cache';

const CMS_BASE_URL = process.env.LARAVEL_CMS_URL || 'https://cms.molochain.com/api';

/**
 * CMS Endpoint Status Tracking
 * 
 * ALL WORKING ENDPOINTS (verified 2025-12-08):
 * - GET /api/health - Returns {status: "ok", app: "molochain-cms"}
 * - GET /api/services - Returns array of services with id, slug, name, etc.
 * - GET /api/pages - Returns array of pages
 * - GET /api/settings - Returns settings object
 * - GET /api/menu - Returns menu items array
 * - GET /api/home-sections - Returns homepage sections (hero, services, ecosystem, cta)
 * 
 * Admin Panels (authenticated):
 * - /admin/menu - Menu Editor
 * - /admin/settings - Settings Manager
 * - /admin/home-sections - Home Sections Editor
 * 
 * The server runs Laravel 12.40.2 on PHP 8.4.15 (cms.molochain.com)
 */
export interface CMSEndpointStatus {
  endpoint: string;
  status: 'working' | 'broken' | 'unknown';
  lastChecked?: Date;
  error?: string;
}

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  body: string;
  description?: string;
  metadata?: Record<string, any>;
  updated_at: string;
}

export interface CMSService {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  category: string;
  icon?: string;
  image_url?: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface CMSMenuItem {
  id: number;
  label: string;
  url: string;
  sort_order: number;
}

export interface CMSSettings {
  [key: string]: any;
}

export interface CMSAuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

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

class LaravelCMSClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private retryConfig: RetryConfig;

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
    
    this.client = axios.create({
      baseURL: CMS_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
          
          logger.warn('CMS API retry attempt', {
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
        logger.error('Laravel CMS API Error:', {
          status: statusCode,
          message: error.message,
          url: config.url,
          retryCount: config.__retryCount,
        });
        
        return Promise.reject(error);
      }
    );
  }

  private getAuthHeaders() {
    if (!this.authToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.authToken}`,
    };
  }

  async authenticate(email: string, password: string): Promise<CMSAuthResponse> {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      this.authToken = response.data.token;
      return response.data;
    } catch (error) {
      logger.error('CMS Authentication failed:', error);
      throw new Error('Failed to authenticate with Laravel CMS');
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout', {}, { headers: this.getAuthHeaders() });
      this.authToken = null;
    } catch (error) {
      logger.error('CMS Logout failed:', error);
    }
  }

  private async monitoredRequest<T>(
    requestFn: () => Promise<T>,
    fallback: T
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await requestFn();
      const responseTime = Date.now() - startTime;
      cmsMonitor.recordSuccess(responseTime);
      return result;
    } catch (error) {
      cmsMonitor.recordFailure(error instanceof Error ? error : String(error));
      if (cmsMonitor.shouldAlert()) {
        logger.warn('CMS health degraded - alerting threshold reached', {
          context: 'cms-client',
          stats: cmsMonitor.getStats(),
        });
      }
      throw error;
    }
  }

  async getPages(skipCache: boolean = false): Promise<CMSPage[]> {
    const cacheKey = 'cms:pages';
    if (!skipCache) {
      const cached = cmsCache.get<CMSPage[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/pages');
        return response.data.data || response.data;
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch pages from CMS:', error);
      return [];
    }
  }

  async getPage(slug: string, skipCache: boolean = false): Promise<CMSPage | null> {
    const cacheKey = `cms:pages:${slug}`;
    if (!skipCache) {
      const cached = cmsCache.get<CMSPage>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get(`/pages/${slug}`);
        return response.data.data || response.data;
      }, null);
      if (result) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error(`Failed to fetch page ${slug} from CMS:`, error);
      return null;
    }
  }

  async createPage(page: Partial<CMSPage>): Promise<CMSPage> {
    const response = await this.client.post('/pages', page, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data || response.data;
  }

  async updatePage(id: number, page: Partial<CMSPage>): Promise<CMSPage> {
    const response = await this.client.put(`/pages/${id}`, page, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data || response.data;
  }

  async deletePage(id: number): Promise<void> {
    await this.client.delete(`/pages/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async getServices(skipCache: boolean = false): Promise<CMSService[]> {
    const cacheKey = 'cms:services';
    if (!skipCache) {
      const cached = cmsCache.get<CMSService[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/services');
        return response.data.data || response.data;
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch services from CMS:', error);
      return [];
    }
  }

  async getService(slug: string, skipCache: boolean = false): Promise<CMSService | null> {
    const cacheKey = `cms:services:${slug}`;
    if (!skipCache) {
      const cached = cmsCache.get<CMSService>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get(`/services/${slug}`);
        return response.data.data || response.data;
      }, null);
      if (result) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error(`Failed to fetch service ${slug} from CMS:`, error);
      return null;
    }
  }

  async createService(service: Partial<CMSService>): Promise<CMSService> {
    const response = await this.client.post('/services', service, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data || response.data;
  }

  async updateService(id: number, service: Partial<CMSService>): Promise<CMSService> {
    const response = await this.client.put(`/services/${id}`, service, {
      headers: this.getAuthHeaders(),
    });
    return response.data.data || response.data;
  }

  async deleteService(id: number): Promise<void> {
    await this.client.delete(`/services/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async getMenu(skipCache: boolean = false): Promise<CMSMenuItem[]> {
    const cacheKey = 'cms:menu';
    if (!skipCache) {
      const cached = cmsCache.get<CMSMenuItem[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/menu');
        return response.data.data || response.data;
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch menu from CMS:', error);
      return [];
    }
  }

  async getSettings(skipCache: boolean = false): Promise<CMSSettings> {
    const cacheKey = 'cms:settings';
    if (!skipCache) {
      const cached = cmsCache.get<CMSSettings>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/settings');
        return response.data.data || response.data;
      }, {});
      if (Object.keys(result).length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch settings from CMS:', error);
      return {};
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use /health endpoint which is verified working (not /settings which is 404)
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.data?.status === 'ok';
    } catch {
      // Fallback: try /services which is also verified working
      try {
        await this.client.get('/services', { timeout: 5000 });
        return true;
      } catch {
        return false;
      }
    }
  }

  async getHomeSections(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:home-sections';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/home-sections');
        return response.data.data || response.data;
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch home sections from CMS:', error);
      return [];
    }
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
      cmsCache.delPattern(pattern);
    } else {
      cmsCache.flush();
    }
  }

  // Blog Posts
  async getBlogPosts(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:blog:posts';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/blog/posts');
        return response.data.data || response.data || [];
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch blog posts from CMS:', error);
      return [];
    }
  }

  async getBlogPost(slug: string, skipCache: boolean = false): Promise<any | null> {
    const cacheKey = `cms:blog:posts:${slug}`;
    if (!skipCache) {
      const cached = cmsCache.get<any>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get(`/blog/posts/${slug}`);
        return response.data.data || response.data;
      }, null);
      if (result) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error(`Failed to fetch blog post ${slug} from CMS:`, error);
      return null;
    }
  }

  async getBlogCategories(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:blog:categories';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/blog/categories');
        return response.data.data || response.data || [];
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch blog categories from CMS:', error);
      return [];
    }
  }

  // Testimonials
  async getTestimonials(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:testimonials';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/testimonials');
        return response.data.data || response.data || [];
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch testimonials from CMS:', error);
      return [];
    }
  }

  // FAQs
  async getFAQs(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:faqs';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/faqs');
        return response.data.data || response.data || [];
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch FAQs from CMS:', error);
      return [];
    }
  }

  async getFAQsGrouped(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:faqs:grouped';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/faqs/grouped');
        return response.data.data || response.data || [];
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch grouped FAQs from CMS:', error);
      return [];
    }
  }

  // Team Members
  async getTeamMembers(skipCache: boolean = false): Promise<any[]> {
    const cacheKey = 'cms:team';
    if (!skipCache) {
      const cached = cmsCache.get<any[]>(cacheKey);
      if (cached !== undefined) return cached;
    }
    try {
      const result = await this.monitoredRequest(async () => {
        const response = await this.client.get('/team');
        return response.data.data || response.data || [];
      }, []);
      if (result.length > 0) {
        cmsCache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      logger.error('Failed to fetch team members from CMS:', error);
      return [];
    }
  }

  /**
   * Get detailed status of all CMS endpoints
   * Useful for diagnostics and monitoring
   */
  async getEndpointStatuses(): Promise<CMSEndpointStatus[]> {
    const endpoints = [
      { path: '/health', name: 'health' },
      { path: '/services', name: 'services' },
      { path: '/pages', name: 'pages' },
      { path: '/settings', name: 'settings' },
      { path: '/menu', name: 'menu' },
      { path: '/home-sections', name: 'home-sections' },
    ];

    const statuses: CMSEndpointStatus[] = [];

    for (const ep of endpoints) {
      try {
        await this.client.get(ep.path, { timeout: 5000 });
        statuses.push({
          endpoint: ep.path,
          status: 'working',
          lastChecked: new Date(),
        });
      } catch (error: any) {
        const status = error.response?.status;
        const errorMsg = status === 404 
          ? 'Route/controller not found' 
          : status === 500 
            ? 'Controller method missing or server error'
            : error.message;
        
        statuses.push({
          endpoint: ep.path,
          status: 'broken',
          lastChecked: new Date(),
          error: `${status || 'network'}: ${errorMsg}`,
        });
      }
    }

    return statuses;
  }

  /**
   * Get a summary of what's working vs broken
   */
  async getDiagnosticSummary(): Promise<{
    healthy: boolean;
    workingEndpoints: string[];
    brokenEndpoints: { endpoint: string; error: string }[];
    cmsVersion?: string;
  }> {
    const statuses = await this.getEndpointStatuses();
    const working = statuses.filter(s => s.status === 'working');
    const broken = statuses.filter(s => s.status === 'broken');

    return {
      healthy: working.length > 0,
      workingEndpoints: working.map(s => s.endpoint),
      brokenEndpoints: broken.map(s => ({ endpoint: s.endpoint, error: s.error || 'Unknown' })),
      cmsVersion: 'Laravel 12.40.2 / PHP 8.4.15',
    };
  }
}

export const laravelCMS = new LaravelCMSClient();
export default laravelCMS;
