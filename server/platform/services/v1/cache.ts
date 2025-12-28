import { logger } from '../../../utils/logger';
import type { ServicePlatform, ServiceDeltaSync } from './types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  version: number;
}

interface CacheConfig {
  catalogTtl: number;
  serviceTtl: number;
  categoryTtl: number;
  maxEntries: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  catalogTtl: 5 * 60 * 1000,
  serviceTtl: 1 * 60 * 1000,
  categoryTtl: 5 * 60 * 1000,
  maxEntries: 1000,
};

export class ServiceCacheService {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private currentVersion: number = Date.now();
  private config: CacheConfig;
  private deltaLog: Map<number, { timestamp: Date; changes: string[] }> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupInterval();
  }

  get<T>(key: string): T | undefined {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.getTtlForKey(key);
    
    if (this.memoryCache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      version: this.currentVersion,
    });
  }

  invalidate(key: string): boolean {
    const deleted = this.memoryCache.delete(key);
    if (deleted) {
      this.recordDeltaChange(key);
    }
    return deleted;
  }

  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        this.recordDeltaChange(key);
        count++;
      }
    }
    
    return count;
  }

  invalidateAll(): void {
    this.memoryCache.clear();
    this.incrementVersion();
    logger.info('ServiceCacheService: All cache invalidated');
  }

  invalidateService(serviceId: string): void {
    this.invalidate(`service:${serviceId}`);
    logger.info('ServiceCacheService: Service cache invalidated', { serviceId });
  }

  invalidateCatalog(): void {
    this.invalidate('catalog:all');
    this.invalidate('categories:all');
    this.invalidatePattern('^catalog:page:');
    logger.info('ServiceCacheService: Catalog cache invalidated');
  }

  getCatalog(): ServicePlatform[] | undefined {
    return this.get<ServicePlatform[]>('catalog:all');
  }

  setCatalog(services: ServicePlatform[]): void {
    this.set('catalog:all', services, this.config.catalogTtl);
  }

  getService(slug: string): ServicePlatform | undefined {
    return this.get<ServicePlatform>(`service:${slug}`);
  }

  setService(slug: string, service: ServicePlatform): void {
    this.set(`service:${slug}`, service, this.config.serviceTtl);
  }

  getCategories(): { category: string; count: number }[] | undefined {
    return this.get<{ category: string; count: number }[]>('categories:all');
  }

  setCategories(categories: { category: string; count: number }[]): void {
    this.set('categories:all', categories, this.config.categoryTtl);
  }

  getCurrentVersion(): number {
    return this.currentVersion;
  }

  incrementVersion(): number {
    this.currentVersion = Date.now();
    return this.currentVersion;
  }

  getDeltaSince(sinceVersion: number): ServiceDeltaSync {
    const changes: string[] = [];
    
    for (const [version, log] of this.deltaLog.entries()) {
      if (version > sinceVersion) {
        changes.push(...log.changes);
      }
    }

    return {
      version: sinceVersion,
      timestamp: new Date(sinceVersion),
      services: {
        added: [],
        updated: [],
        deleted: changes,
      },
      nextVersion: this.currentVersion,
      hasMore: false,
    };
  }

  getStats(): {
    size: number;
    version: number;
    hitRate: number;
    memoryUsage: string;
  } {
    return {
      size: this.memoryCache.size,
      version: this.currentVersion,
      hitRate: 0,
      memoryUsage: `${Math.round(this.memoryCache.size * 0.1)}KB (estimated)`,
    };
  }

  private getTtlForKey(key: string): number {
    if (key.startsWith('catalog:')) {
      return this.config.catalogTtl;
    }
    if (key.startsWith('service:')) {
      return this.config.serviceTtl;
    }
    if (key.startsWith('categories:')) {
      return this.config.categoryTtl;
    }
    return this.config.serviceTtl;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt < oldestTime) {
        oldestTime = entry.expiresAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private recordDeltaChange(key: string): void {
    const version = this.incrementVersion();
    this.deltaLog.set(version, {
      timestamp: new Date(),
      changes: [key],
    });

    if (this.deltaLog.size > 100) {
      const oldestVersion = Math.min(...this.deltaLog.keys());
      this.deltaLog.delete(oldestVersion);
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now > entry.expiresAt) {
          this.memoryCache.delete(key);
        }
      }
    }, 60 * 1000);
  }
}

export const serviceCacheService = new ServiceCacheService();
