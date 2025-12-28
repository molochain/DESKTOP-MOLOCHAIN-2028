import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  renderTime: number;
  apiLatency: number;
  cacheHitRate: number;
  memoryUsage: number;
}

interface OptimizationConfig {
  enablePrefetch?: boolean;
  cacheStrategy?: 'aggressive' | 'conservative' | 'adaptive';
  preloadComponents?: string[];
  batchRequests?: boolean;
}

export function usePerformanceOptimization(config: OptimizationConfig = {}) {
  const queryClient = useQueryClient();
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    apiLatency: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });

  // Performance metrics collection
  const collectMetrics = useCallback(() => {
    const startTime = performance.now();
    
    return {
      measureRender: () => {
        const endTime = performance.now();
        metricsRef.current.renderTime = endTime - startTime;
      },
      measureAPI: (apiStartTime: number) => {
        const endTime = performance.now();
        metricsRef.current.apiLatency = endTime - apiStartTime;
      }
    };
  }, []);

  // Aggressive cache prefetching
  const prefetchCriticalData = useCallback(async () => {
    if (!config.enablePrefetch) return;

    const criticalQueries = [
      '/api/health/system',
      '/api/health/endpoints',
      '/api/services',
      '/api/auth/me'
    ];

    criticalQueries.forEach(query => {
      queryClient.prefetchQuery({
        queryKey: [query],
        queryFn: () => fetch(query).then(res => res.json()),
        staleTime: 30000, // 30 seconds
        gcTime: 300000 // 5 minutes
      });
    });
  }, [queryClient, config.enablePrefetch]);

  // Component preloading
  const preloadComponents = useCallback(async () => {
    if (!config.preloadComponents?.length) return;

    const componentLoaders = {
      'ArchitectureDocumentation': () => import('@/components/developer-portal/ArchitectureDocumentation'),
      'SystemHealthMonitor': () => import('@/components/developer-portal/SystemHealthMonitor'),
      'BrandProtection': () => import('@/components/developer-portal/BrandProtection'),
      'APITestingConsole': () => import('@/components/developer-portal/APITestingConsole')
    };

    config.preloadComponents.forEach(componentName => {
      const loader = componentLoaders[componentName as keyof typeof componentLoaders];
      if (loader) {
        loader().catch(err => {
          if (import.meta.env.DEV) {
            console.error(err);
          }
        });
      }
    });
  }, [config.preloadComponents]);

  // Batch API requests
  const createBatchedFetch = useCallback(() => {
    if (!config.batchRequests) return fetch;
    
    const requestQueue: Array<{
      url: string;
      options?: RequestInit;
      resolve: (value: Response) => void;
      reject: (reason: any) => void;
    }> = [];
    
    let batchTimeout: NodeJS.Timeout;

    return (url: string, options?: RequestInit): Promise<Response> => {
      return new Promise((resolve, reject) => {
        requestQueue.push({ url, options, resolve, reject });
        
        clearTimeout(batchTimeout);
        batchTimeout = setTimeout(() => {
          processBatch();
        }, 10); // Batch requests within 10ms
      });
    };

    function processBatch() {
      if (requestQueue.length === 0) return;
      
      // Group similar requests
      const batches = groupRequests(requestQueue);
      
      batches.forEach(batch => {
        if (batch.length === 1) {
          // Single request
          const { url, options, resolve, reject } = batch[0];
          fetch(url, options).then(resolve).catch(reject);
        } else {
          // Batch multiple requests
          Promise.all(
            batch.map(({ url, options }) => fetch(url, options))
          ).then(responses => {
            batch.forEach((req, index) => {
              req.resolve(responses[index]);
            });
          }).catch(error => {
            batch.forEach(req => req.reject(error));
          });
        }
      });
      
      requestQueue.length = 0;
    }

    function groupRequests(requests: typeof requestQueue) {
      const groups: typeof requestQueue[] = [];
      const healthRequests: typeof requestQueue = [];
      const apiRequests: typeof requestQueue = [];
      const otherRequests: typeof requestQueue = [];

      requests.forEach(req => {
        if (req.url.includes('/api/health/')) {
          healthRequests.push(req);
        } else if (req.url.includes('/api/')) {
          apiRequests.push(req);
        } else {
          otherRequests.push(req);
        }
      });

      if (healthRequests.length > 0) groups.push(healthRequests);
      if (apiRequests.length > 0) groups.push(apiRequests);
      otherRequests.forEach(req => groups.push([req]));

      return groups;
    }
  }, [config.batchRequests]);

  // Cache optimization
  const optimizeCache = useCallback(() => {
    const cacheKeys = queryClient.getQueryCache().getAll().map(query => query.queryKey);
    
    // Remove stale entries
    cacheKeys.forEach(key => {
      const query = queryClient.getQueryCache().find({ queryKey: key });
      if (query && query.isStale() && query.state.status !== 'pending') {
        queryClient.removeQueries({ queryKey: key });
      }
    });

    // Implement adaptive caching based on usage patterns
    if (config.cacheStrategy === 'adaptive') {
      const highUsageQueries = ['/api/health/system', '/api/services'];
      const mediumUsageQueries = ['/api/auth/me', '/api/health/endpoints'];
      
      highUsageQueries.forEach(queryKey => {
        queryClient.setQueryDefaults([queryKey], {
          staleTime: 60000, // 1 minute
          gcTime: 600000  // 10 minutes
        });
      });

      mediumUsageQueries.forEach(queryKey => {
        queryClient.setQueryDefaults([queryKey], {
          staleTime: 30000, // 30 seconds
          gcTime: 300000  // 5 minutes
        });
      });
    }
  }, [queryClient, config.cacheStrategy]);

  // Memory monitoring and cleanup
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metricsRef.current.memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      
      // Trigger cleanup if memory usage is high
      if (metricsRef.current.memoryUsage > 0.8) {
        queryClient.clear();
        if (global.gc) {
          global.gc();
        }
      }
    }
  }, [queryClient]);

  // Background optimization tasks
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache();
      monitorMemory();
    }, 60000); // Every minute

    // Initial optimizations
    prefetchCriticalData();
    preloadComponents();

    return () => clearInterval(interval);
  }, [optimizeCache, monitorMemory, prefetchCriticalData, preloadComponents]);

  // Performance monitoring query
  const { data: performanceData } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/performance/metrics');
      return response.json();
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000 // 15 seconds
  });

  return {
    metrics: metricsRef.current,
    performanceData,
    collectMetrics,
    batchedFetch: createBatchedFetch(),
    prefetchData: prefetchCriticalData,
    optimizeCache
  };
}