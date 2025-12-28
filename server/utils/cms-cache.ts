import NodeCache from 'node-cache';
import { logger } from './logger';

export interface CacheStats {
  keys: number;
  hits: number;
  misses: number;
  hitRate: number;
  ksize: number;
  vsize: number;
}

export interface CacheTTLConfig {
  menu: number;
  settings: number;
  services: number;
  servicesSlug: number;
  pages: number;
  pagesSlug: number;
  homeSections: number;
}

const DEFAULT_TTL_CONFIG: CacheTTLConfig = {
  menu: 60,
  settings: 60,
  services: 30,
  servicesSlug: 30,
  pages: 30,
  pagesSlug: 30,
  homeSections: 60,
};

class CMSCache {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;
  private ttlConfig: CacheTTLConfig;

  constructor(ttlConfig: CacheTTLConfig = DEFAULT_TTL_CONFIG) {
    this.ttlConfig = ttlConfig;
    this.cache = new NodeCache({
      stdTTL: 30,
      checkperiod: 60,
      useClones: true,
      deleteOnExpire: true,
    });

    this.cache.on('expired', (key: string) => {
      logger.debug(`CMS cache key expired: ${key}`, { context: 'cms-cache' });
    });

    this.cache.on('del', (key: string) => {
      logger.debug(`CMS cache key deleted: ${key}`, { context: 'cms-cache' });
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hits++;
      logger.debug(`CMS cache hit: ${key}`, { context: 'cms-cache' });
      return value;
    }
    this.misses++;
    logger.debug(`CMS cache miss: ${key}`, { context: 'cms-cache' });
    return undefined;
  }

  set<T>(key: string, data: T, ttl?: number): boolean {
    const success = this.cache.set(key, data, ttl || this.getDefaultTTL(key));
    if (success) {
      logger.debug(`CMS cache set: ${key} (TTL: ${ttl || this.getDefaultTTL(key)}s)`, { context: 'cms-cache' });
    }
    return success;
  }

  del(key: string): number {
    const count = this.cache.del(key);
    logger.debug(`CMS cache deleted: ${key} (${count} keys)`, { context: 'cms-cache' });
    return count;
  }

  delPattern(pattern: string): number {
    const keys = this.cache.keys().filter(key => key.startsWith(pattern));
    const count = this.cache.del(keys);
    logger.debug(`CMS cache pattern delete: ${pattern} (${count} keys)`, { context: 'cms-cache' });
    return count;
  }

  flush(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
    logger.info('CMS cache flushed', { context: 'cms-cache' });
  }

  getStats(): CacheStats {
    const stats = this.cache.getStats();
    const totalRequests = this.hits + this.misses;
    return {
      keys: this.cache.keys().length,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalRequests > 0 ? Math.round((this.hits / totalRequests) * 10000) / 100 : 0,
      ksize: stats.ksize,
      vsize: stats.vsize,
    };
  }

  getKeys(): string[] {
    return this.cache.keys();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getTTL(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  private getDefaultTTL(key: string): number {
    if (key === 'cms:menu') return this.ttlConfig.menu;
    if (key === 'cms:settings') return this.ttlConfig.settings;
    if (key === 'cms:services') return this.ttlConfig.services;
    if (key.startsWith('cms:services:')) return this.ttlConfig.servicesSlug;
    if (key === 'cms:pages') return this.ttlConfig.pages;
    if (key.startsWith('cms:pages:')) return this.ttlConfig.pagesSlug;
    if (key === 'cms:home-sections') return this.ttlConfig.homeSections;
    return 30;
  }

  getTTLConfig(): CacheTTLConfig {
    return { ...this.ttlConfig };
  }
}

export const cmsCache = new CMSCache();
export default cmsCache;
