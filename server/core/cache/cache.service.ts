import NodeCache from 'node-cache';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { dbCache, apiCache, healthCache, sessionCache, OptimizedCacheManager } from '../../utils/cache-manager';

// Support both old and new cache type names for backward compatibility
export type CacheType = 'region' | 'service' | 'tracking' | 'project' | 'commodity' | 'partner';
export type CacheCategory = 'database' | 'api' | 'health' | 'session' | CacheType;

interface CacheConfig {
  ttl?: number;
  checkperiod?: number;
  useClones?: boolean;
  deleteOnExpire?: boolean;
}

class UnifiedCacheService {
  private caches: Map<CacheCategory, OptimizedCacheManager | NodeCache>;
  private hitRates: Map<CacheCategory, { hits: number; misses: number }>;
  
  // Legacy cache prefixes for backward compatibility
  public readonly prefixes: Record<CacheType, string> = {
    region: 'region:',
    service: 'service:',
    tracking: 'tracking:',
    project: 'project:',
    commodity: 'commodity:',
    partner: 'partner:',
  };

  private enabled: boolean;

  constructor() {
    this.caches = new Map();
    this.hitRates = new Map();
    this.enabled = process.env.CACHE_ENABLED !== 'false';
    
    // Use existing OptimizedCacheManager instances for core categories
    this.caches.set('database', dbCache);
    this.caches.set('api', apiCache);
    this.caches.set('health', healthCache);
    this.caches.set('session', sessionCache);
    
    // Initialize additional category-specific caches with optimized settings
    this.initializeCache('region', { ttl: 300, checkperiod: 60 });     // 5 min (legacy support)
    this.initializeCache('service', { ttl: 900, checkperiod: 90 });    // 15 min
    this.initializeCache('tracking', { ttl: 60, checkperiod: 20 });    // 1 min
    this.initializeCache('project', { ttl: 600, checkperiod: 60 });    // 10 min
    this.initializeCache('commodity', { ttl: 600, checkperiod: 60 });  // 10 min
    this.initializeCache('partner', { ttl: 600, checkperiod: 60 });    // 10 min (legacy support)
    
    // Start cache warming
    this.startCacheWarming();
  }
  
  private initializeCache(category: CacheCategory, config: CacheConfig) {
    const cache = new NodeCache({
      stdTTL: config.ttl || 300,
      checkperiod: config.checkperiod || 60,
      useClones: false,
      deleteOnExpire: true,
      maxKeys: 10000
    });
    
    this.caches.set(category, cache);
    this.hitRates.set(category, { hits: 0, misses: 0 });
    
    // Silent cache events
    cache.on('expired', (key) => {
      // Pre-warm expired keys
      this.warmKey(category, key);
    });
  }
  
  private async warmKey(category: CacheCategory, key: string) {
    // Cache warming is disabled to avoid placeholder data
    // Real implementation would require fetching actual data based on key pattern
    // Example: if (key.startsWith('/api/')) { fetch and cache real API response }
  }
  
  private startCacheWarming() {
    // Warm critical paths every 2 minutes
    setInterval(() => {
      this.warmCriticalPaths();
    }, 120000);
    
    // Initial warming
    setTimeout(() => this.warmCriticalPaths(), 1000);
  }
  
  private async warmCriticalPaths() {
    const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}`;
    const warmingTasks = [
      { category: 'api' as CacheCategory, key: '/api/health', url: '/api/health' },
      { category: 'service' as CacheCategory, key: '/api/services', url: '/api/services' },
      { category: 'api' as CacheCategory, key: '/api/cms/menu', url: '/api/cms/menu' },
    ];
    
    await Promise.allSettled(warmingTasks.map(async task => {
      try {
        const response = await axios.get(`${baseUrl}${task.url}`, { timeout: 5000 });
        if (response.status === 200) {
          this.set(task.category, task.key, response.data, 600);
          logger.debug(`Cache warmed: ${task.key}`);
        }
      } catch (error) {
        logger.debug(`Cache warming skipped for ${task.key}`);
      }
    }));
  }
  
  get<T>(category: CacheCategory, key: string): T | undefined {
    const cache = this.caches.get(category);
    if (!cache) return undefined;
    
    // Handle OptimizedCacheManager instances
    if (cache instanceof OptimizedCacheManager) {
      const value = cache.get(key);
      const stats = this.hitRates.get(category);
      if (value !== undefined) {
        if (stats) stats.hits++;
      } else {
        if (stats) stats.misses++;
      }
      return value;
    }
    
    // Handle regular NodeCache instances
    const value = (cache as NodeCache).get<T>(key);
    const stats = this.hitRates.get(category);
    
    if (value !== undefined) {
      if (stats) stats.hits++;
      return value;
    } else {
      if (stats) stats.misses++;
      return undefined;
    }
  }
  
  set<T>(category: CacheCategory, key: string, value: T, ttl?: number): boolean {
    const cache = this.caches.get(category);
    if (!cache) return false;
    
    // Handle both OptimizedCacheManager and NodeCache
    return ttl ? cache.set(key, value, ttl) : cache.set(key, value);
  }
  
  del(category: CacheCategory, key: string): number {
    const cache = this.caches.get(category);
    if (!cache) return 0;
    
    // Handle both OptimizedCacheManager and NodeCache (both have del method)
    return cache.del(key);
  }
  
  flush(category: CacheCategory): void {
    const cache = this.caches.get(category);
    if (cache) {
      // Handle OptimizedCacheManager instances
      if (cache instanceof OptimizedCacheManager) {
        cache.flush();
      } else {
        // Handle regular NodeCache instances
        (cache as NodeCache).flushAll();
      }
    }
  }
  
  flushAll(): void {
    this.caches.forEach(cache => {
      if (cache instanceof OptimizedCacheManager) {
        cache.flush();
      } else {
        (cache as NodeCache).flushAll();
      }
    });
  }
  
  getStats(category: CacheCategory) {
    const cache = this.caches.get(category);
    
    if (!cache) return null;
    
    // Handle OptimizedCacheManager instances
    if (cache instanceof OptimizedCacheManager) {
      return cache.getStats();
    }
    
    // Handle regular NodeCache instances
    const hitRate = this.hitRates.get(category);
    if (!hitRate) return null;
    
    const total = hitRate.hits + hitRate.misses;
    const rate = total > 0 ? (hitRate.hits / total * 100).toFixed(2) : '0';
    
    return {
      ...(cache as NodeCache).getStats(),
      hitRate: `${rate}%`,
      hits: hitRate.hits,
      misses: hitRate.misses
    };
  }
  
  getAllStats() {
    const stats: any = {};
    this.caches.forEach((_, category) => {
      stats[category] = this.getStats(category);
    });
    return stats;
  }

  // Legacy method names for backward compatibility
  delete(category: CacheCategory, key: string): void {
    this.del(category, key);
  }

  clear(): void {
    this.flushAll();
  }

  clearType(category: CacheCategory): void {
    this.flush(category);
  }

  // Generate a cache key with appropriate prefix (legacy support)
  private generateKey(type: CacheType, id: string | number): string {
    return `${this.prefixes[type]}${id}`;
  }

  // Legacy get method with prefixed keys
  getLegacy<T>(type: CacheType, id: string | number): T | undefined {
    if (!this.enabled) return undefined;
    const key = this.generateKey(type, id);
    return this.get<T>(type, key);
  }

  // Legacy set method with prefixed keys
  setLegacy<T>(type: CacheType, id: string | number, data: T, ttl?: number): boolean {
    if (!this.enabled) return false;
    const key = this.generateKey(type, id);
    return this.set<T>(type, key, data, ttl);
  }

  // Legacy delete method with prefixed keys
  deleteLegacy(type: CacheType, id: string | number): void {
    if (!this.enabled) return;
    const key = this.generateKey(type, id);
    this.del(type, key);
  }

  // Wrap a function with caching logic (from the simple cache service)
  async withCache<T>(
    category: CacheCategory,
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // If caching is disabled, just execute the function
    if (!this.enabled) {
      return await fetchFn();
    }

    // Try to get data from cache
    const cachedData = this.get<T>(category, key);
    if (cachedData !== undefined) {
      return cachedData;
    }

    // If not cached, fetch data from source
    try {
      const data = await fetchFn();
      
      // Cache the result if it's not null/undefined
      if (data !== null && data !== undefined) {
        this.set(category, key, data, ttl);
      }
      
      return data;
    } catch (error) {
      logger.error('Error fetching data for caching', { category, key, error });
      throw error;
    }
  }
}

// Export singleton instance with multiple names for compatibility
const unifiedCacheInstance = new UnifiedCacheService();

// Export with new name
export const unifiedCache = unifiedCacheInstance;

// Export with old names for backward compatibility
export const enhancedCache = unifiedCacheInstance;
export const cacheService = unifiedCacheInstance;

// Middleware helper
export function cacheResponse(category: CacheCategory, keyGenerator?: (req: any) => string, ttl?: number) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') return next();
    
    const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
    const cached = enhancedCache.get(category, key);
    
    if (cached !== null && cached !== undefined) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Category', category);
      return res.json(cached);
    }
    
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Category', category);
    
    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        enhancedCache.set(category, key, data, ttl);
      }
      return originalJson(data);
    };
    
    next();
  };
}