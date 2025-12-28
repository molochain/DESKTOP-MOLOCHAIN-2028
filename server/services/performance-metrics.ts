import { EventEmitter } from 'events';
import os from 'os';
import { db } from '../core/database/db.service';
import { eq, desc, gte, sql } from 'drizzle-orm';

interface MetricSnapshot {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  database: {
    activeConnections: number;
    queryTime: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    keys: number;
    memory: number;
  };
  websocket: {
    connections: number;
    messagesPerSecond: number;
  };
}

class PerformanceMetricsService extends EventEmitter {
  private metrics: MetricSnapshot[] = [];
  private maxMetrics = 100; // Keep last 100 snapshots
  private collectInterval: NodeJS.Timeout | null = null;
  private apiMetrics = {
    requests: 0,
    totalResponseTime: 0,
    errors: 0,
    activeConnections: 0
  };
  private wsMetrics = {
    connections: 0,
    messages: 0
  };

  constructor() {
    super();
    this.startCollection();
  }

  private startCollection() {
    this.collectInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect every 5 seconds
  }

  private async collectMetrics() {
    const snapshot: MetricSnapshot = {
      timestamp: Date.now(),
      cpu: this.getCPUMetrics(),
      memory: this.getMemoryMetrics(),
      api: this.getAPIMetrics(),
      database: await this.getDatabaseMetrics(),
      cache: this.getCacheMetrics(),
      websocket: this.getWebSocketMetrics()
    };

    this.metrics.push(snapshot);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Emit for real-time updates
    this.emit('metrics', snapshot);

    // Store critical metrics in database
    await this.storeMetrics(snapshot);
  }

  private getCPUMetrics() {
    const cpus = os.cpus();
    const usage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total * 100);
    }, 0) / cpus.length;

    return {
      usage: Math.round(usage * 100) / 100,
      loadAverage: os.loadavg()
    };
  }

  private getMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100 * 100) / 100
    };
  }

  private getAPIMetrics() {
    const rpm = this.apiMetrics.requests;
    const avgResponse = this.apiMetrics.requests > 0 
      ? this.apiMetrics.totalResponseTime / this.apiMetrics.requests 
      : 0;
    const errorRate = this.apiMetrics.requests > 0
      ? (this.apiMetrics.errors / this.apiMetrics.requests) * 100
      : 0;

    // Reset counters
    const metrics = {
      requestsPerMinute: rpm * 12, // Convert 5-second window to per minute
      averageResponseTime: Math.round(avgResponse * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      activeConnections: this.apiMetrics.activeConnections
    };

    this.apiMetrics.requests = 0;
    this.apiMetrics.totalResponseTime = 0;
    this.apiMetrics.errors = 0;

    return metrics;
  }

  private async getDatabaseMetrics() {
    try {
      // Get active connections count
      const connectionResult = await db.execute(sql.raw(`
        SELECT count(*) as count FROM pg_stat_activity 
        WHERE state = 'active'
      `));
      
      // Get average query time from recent queries
      const queryTimeResult = await db.execute(sql.raw(`
        SELECT 
          COALESCE(AVG(mean_exec_time), 0) as avg_time,
          COUNT(*) FILTER (WHERE mean_exec_time > 100) as slow_queries
        FROM pg_stat_statements 
        WHERE query NOT LIKE '%pg_stat%'
        LIMIT 100
      `)).catch(() => ({ rows: [{ avg_time: 0, slow_queries: 0 }] }));

      return {
        activeConnections: Number(connectionResult.rows[0]?.count || 0),
        queryTime: Number(queryTimeResult.rows[0]?.avg_time || 0),
        slowQueries: Number(queryTimeResult.rows[0]?.slow_queries || 0)
      };
    } catch (error) {
      return {
        activeConnections: 0,
        queryTime: 0,
        slowQueries: 0
      };
    }
  }

  private getCacheMetrics() {
    // Get from global cache service if available
    const cacheService = (global as any).cacheService;
    if (cacheService) {
      const stats = cacheService.getStats();
      return {
        hitRate: stats.hitRate || 0,
        keys: stats.keys || 0,
        memory: stats.size || 0
      };
    }
    
    return {
      hitRate: 0,
      keys: 0,
      memory: 0
    };
  }

  private getWebSocketMetrics() {
    const mps = this.wsMetrics.messages * 12; // Convert to per second
    const metrics = {
      connections: this.wsMetrics.connections,
      messagesPerSecond: mps
    };
    
    this.wsMetrics.messages = 0;
    return metrics;
  }

  private async storeMetrics(snapshot: MetricSnapshot) {
    // Store metrics in memory only for now
    // Database storage can be added later if needed
  }

  // Public methods for updating metrics
  recordAPIRequest(responseTime: number, isError: boolean = false) {
    this.apiMetrics.requests++;
    this.apiMetrics.totalResponseTime += responseTime;
    if (isError) this.apiMetrics.errors++;
  }

  updateActiveConnections(count: number) {
    this.apiMetrics.activeConnections = count;
  }

  updateWebSocketConnections(count: number) {
    this.wsMetrics.connections = count;
  }

  recordWebSocketMessage() {
    this.wsMetrics.messages++;
  }

  // Get historical metrics
  getMetrics(duration: number = 300000) { // Default 5 minutes
    const cutoff = Date.now() - duration;
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  async getHistoricalMetrics(hours: number = 24) {
    // Return recent in-memory metrics for now
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  stop() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }
  }
}

export const performanceMetrics = new PerformanceMetricsService();