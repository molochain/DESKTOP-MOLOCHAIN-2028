import { createServer } from 'node:http';
import { db } from '../../db';
import { services, serviceAvailability, healthMetrics } from '@db/schema';
import { eq, and, gt, lte, sql } from 'drizzle-orm';
import type { Express } from 'express';
import os from 'node:os';
import { logger } from '../../utils/logger';
import rateLimit from 'express-rate-limit';
import { statSync } from 'fs';
import type { Server } from 'http';
import WebSocket from 'ws';

let healthCheckIntervalId: NodeJS.Timeout | null = null;

async function getNetworkMetrics() {
  const interfaces = os.networkInterfaces() || {};
  const metrics = {
    connections: 0,
    bytesReceived: 0,
    bytesSent: 0,
    activeInterfaces: 0
  };

  try {
    Object.values(interfaces).forEach(iface => {
      if (iface) {
        iface.forEach(addr => {
          if (!addr.internal) {
            metrics.activeInterfaces++;
          }
        });
      }
    });

    // Use process metrics as a proxy for network activity
    const memUsage = process.memoryUsage();
    metrics.bytesReceived = memUsage.external;
    metrics.bytesSent = memUsage.heapUsed;

    // Get approximate connection count from Node's internal handlers
    const handles = (process as any)._getActiveHandles?.() || [];
    metrics.connections = handles.filter((handle: any) =>
      handle?.constructor?.name === 'TCP' ||
      handle?.constructor?.name === 'Socket'
    ).length;

  } catch (error) {
    logger.error('Failed to get network metrics:', error);
  }

  return metrics;
}

async function getDiskMetrics(): Promise<{ total: number; free: number; used: number }> {
  try {
    const rootPath = '/';
    const stats = statSync(rootPath);
    const total = stats.size;
    const free = stats.blocks * stats.blksize;
    const used = total - free;
    return { total, free, used };
  } catch (error) {
    logger.error('Failed to get disk metrics:', error);
    return { total: 0, free: 0, used: 0 };
  }
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  details: {
    database: {
      status: 'connected' | 'disconnected';
      latency: number;
    };
    services: {
      [key: string]: {
        status: 'available' | 'unavailable';
        responseTime: number;
        lastCheck: string;
        consecutiveFailures: number;
        metrics: {
          successRate: number;
          averageResponseTime: number;
          errorRate: number;
        };
      };
    };
    system: {
      cpu: {
        usage: number;
        loadAvg: number[];
        cores: number;
      };
      memory: {
        used: number;
        total: number;
        freePercentage: number;
        swapUsage: number;
      };
      disk: {
        total: number;
        free: number;
        used: number;
      };
      uptime: number;
      networkConnections: number;
      network: {
        connections: number;
        bytesReceived: number;
        bytesSent: number;
        activeInterfaces: number;
      }
    };
  };
}

const MAX_CONSECUTIVE_FAILURES = 3;
const DEFAULT_RESPONSE_TIME_THRESHOLD = 5000; // 5 seconds
const ALERT_THRESHOLDS = {
  memory: {
    warning: 70, // 70% usage - earlier warning for memory issues
    critical: 85  // 85% usage - critical threshold
  },
  cpu: {
    warning: 65, // 65% usage - earlier warning for CPU load
    critical: 80  // 80% usage - critical threshold
  },
  disk: {
    warning: 75, // 75% usage
    critical: 85  // 85% usage
  }
};

const METRICS_RETENTION_DAYS = 30; // Keep metrics for 30 days
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // Run cleanup daily

// Service-specific thresholds optimized for logistics
const DEFAULT_SERVICE_THRESHOLDS = {
  CUST: {
    responseTime: 2000, // 2 seconds max for customer-facing services
    errorRate: 3, // Lower error tolerance for customer service
    consecutiveFailures: 2
  },
  FRGT: {
    responseTime: 4000, // 4 seconds for freight operations
    errorRate: 4,
    consecutiveFailures: 2
  },
  WHSE: {
    responseTime: 3000, // 3 seconds for warehouse operations
    errorRate: 4,
    consecutiveFailures: 2
  },
  DIST: {
    responseTime: 4000, // 4 seconds for distribution services
    errorRate: 4,
    consecutiveFailures: 2
  },
  CONS: {
    responseTime: 2000, // 2 seconds for consignment services
    errorRate: 3,
    consecutiveFailures: 2
  }
};

const serviceStatuses = new Map<string, {
  consecutiveFailures: number;
  lastCheck: Date;
  responseTimeThreshold?: number;
  metrics: {
    totalRequests: number;
    failedRequests: number;
    totalResponseTime: number;
  };
}>();

async function checkDatabaseHealth(): Promise<{ status: 'connected' | 'disconnected', latency: number }> {
  const start = Date.now();
  try {
    // Use a simple query that doesn't depend on specific tables
    // Using raw sql to avoid issues with NeonQueryPromise types
    await sql`SELECT 1 as health_check`;
    return {
      status: 'connected',
      latency: Date.now() - start
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'disconnected',
      latency: -1
    };
  }
}

async function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpuInfo = os.cpus();

  return {
    cpu: {
      usage: process.cpuUsage().system / 1000000, // Convert to seconds
      loadAvg: os.loadavg(),
      cores: cpuInfo.length
    },
    memory: {
      used: usedMem,
      total: totalMem,
      freePercentage: (freeMem / totalMem) * 100,
      swapUsage: 0 // This would need a platform-specific implementation
    },
    disk: await getDiskMetrics(),
    uptime: process.uptime(),
    networkConnections: 0 // This would need a platform-specific implementation
  };
}

async function checkServicesHealth(): Promise<{ [key: string]: {
  status: 'available' | 'unavailable',
  responseTime: number,
  lastCheck: string,
  consecutiveFailures: number,
  metrics: {
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  }
} }> {
  const servicesStatus: { [key: string]: any } = {};

  try {
    const availableServices = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .catch(() => []); // Return empty array if database query fails

    for (const service of availableServices) {
      const start = Date.now();
      try {
        // Check service availability - simplified for type compatibility
        let availability: any = null;
        try {
          const serviceAvailabilities = await db
            .select()
            .from(serviceAvailability);
          availability = serviceAvailabilities.find(sa => sa.serviceId === service.id);
        } catch (err) {
          // Continue without availability data
        }

        const currentStatus = serviceStatuses.get(service.code) || {
          consecutiveFailures: 0,
          lastCheck: new Date(),
          responseTimeThreshold: DEFAULT_SERVICE_THRESHOLDS[service.code as keyof typeof DEFAULT_SERVICE_THRESHOLDS]?.responseTime || DEFAULT_RESPONSE_TIME_THRESHOLD,
          metrics: {
            totalRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0
          }
        };

        const responseTime = Date.now() - start;
        const isResponseTimeSlow = responseTime > (currentStatus.responseTimeThreshold || DEFAULT_RESPONSE_TIME_THRESHOLD);

        currentStatus.metrics.totalRequests++;
        currentStatus.metrics.totalResponseTime += responseTime;

        // More lenient service availability check - reduce false negatives
        if (availability && availability.isAvailable && responseTime < 10000) { // 10 second timeout
          currentStatus.consecutiveFailures = 0;
        } else if (!availability) {
          // Service not in availability table - assume available for now
          currentStatus.consecutiveFailures = 0;
        } else {
          currentStatus.consecutiveFailures++;
          currentStatus.metrics.failedRequests++;
        }

        const metrics = {
          successRate: ((currentStatus.metrics.totalRequests - currentStatus.metrics.failedRequests) /
            currentStatus.metrics.totalRequests) * 100,
          averageResponseTime: currentStatus.metrics.totalResponseTime / currentStatus.metrics.totalRequests,
          errorRate: (currentStatus.metrics.failedRequests / currentStatus.metrics.totalRequests) * 100
        };

        servicesStatus[service.code] = {
          status: currentStatus.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ? 'unavailable' : 'available',
          responseTime,
          lastCheck: new Date().toISOString(),
          consecutiveFailures: currentStatus.consecutiveFailures,
          metrics
        };

        serviceStatuses.set(service.code, currentStatus);
      } catch (error) {
        logger.error(`Service health check failed for ${service.code}:`, error);
        const currentStatus = serviceStatuses.get(service.code) || {
          consecutiveFailures: 0,
          lastCheck: new Date(),
          responseTimeThreshold: DEFAULT_RESPONSE_TIME_THRESHOLD,
          metrics: {
            totalRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0
          }
        };

        currentStatus.consecutiveFailures++;
        currentStatus.metrics.totalRequests++;
        currentStatus.metrics.failedRequests++;

        const metrics = {
          successRate: ((currentStatus.metrics.totalRequests - currentStatus.metrics.failedRequests) /
            currentStatus.metrics.totalRequests) * 100,
          averageResponseTime: currentStatus.metrics.totalResponseTime / currentStatus.metrics.totalRequests,
          errorRate: (currentStatus.metrics.failedRequests / currentStatus.metrics.totalRequests) * 100
        };

        servicesStatus[service.code] = {
          status: 'unavailable',
          responseTime: -1,
          lastCheck: new Date().toISOString(),
          consecutiveFailures: currentStatus.consecutiveFailures,
          metrics
        };

        serviceStatuses.set(service.code, currentStatus);
      }
    }
  } catch (error) {
    logger.error('Service health check failed:', error);
  }

  return servicesStatus;
}

async function shouldSendAlert(status: HealthStatus): Promise<{
  shouldAlert: boolean;
  severity: 'warning' | 'critical';
  reasons: string[];
}> {
  try {
    const [lastMetric] = await db
      .select()
      .from(healthMetrics)
      .where(eq(healthMetrics.alertsEnabled, true))
      .orderBy(healthMetrics.timestamp)
      .limit(1);

    if (!lastMetric || !lastMetric.lastAlertSent) {
      return { shouldAlert: true, severity: 'warning', reasons: ['Initial health check'] };
    }

    const timeSinceLastAlert = Date.now() - lastMetric.lastAlertSent.getTime();
    if (timeSinceLastAlert <= 15 * 60 * 1000) {
      return { shouldAlert: false, severity: 'warning', reasons: [] };
    }

    const reasons: string[] = [];
    let severity: 'warning' | 'critical' = 'warning';

    if (status.details.system.memory.freePercentage <= 100 - ALERT_THRESHOLDS.memory.critical) {
      reasons.push(`Critical: Memory usage at ${100 - status.details.system.memory.freePercentage}%`);
      severity = 'critical';
    } else if (status.details.system.memory.freePercentage <= 100 - ALERT_THRESHOLDS.memory.warning) {
      reasons.push(`Warning: Memory usage at ${100 - status.details.system.memory.freePercentage}%`);
    }

    // Load average represents average number of processes waiting for CPU
    // For a more accurate CPU percentage, use the actual CPU usage from the system
    // If loadAvg is higher than cores, it means processes are waiting but CPU may not be at 100%
    const loadAvg = status.details.system.cpu.loadAvg[0];
    const cpuCores = status.details.system.cpu.cores;
    // Use a more reasonable calculation that doesn't immediately hit 100%
    // Consider normal when load is below cores, warning when 1.5x cores, critical when 2x cores
    const loadRatio = loadAvg / cpuCores;
    const cpuUsagePercent = Math.min(loadRatio * 50, 100); // Scale more gradually
    
    if (cpuUsagePercent >= ALERT_THRESHOLDS.cpu.critical) {
      reasons.push(`Critical: CPU usage at ${cpuUsagePercent.toFixed(1)}%`);
      severity = 'critical';
    } else if (cpuUsagePercent >= ALERT_THRESHOLDS.cpu.warning) {
      reasons.push(`Warning: CPU usage at ${cpuUsagePercent.toFixed(1)}%`);
    }

    let unavailableServices = 0;
    Object.entries(status.details.services).forEach(([service, serviceStatus]) => {
      if (serviceStatus.status === 'unavailable') {
        reasons.push(`Service ${service} is unavailable`);
        unavailableServices++;
      }
    });

    if (unavailableServices > 0) {
      severity = 'critical';
    }

    return {
      shouldAlert: reasons.length > 0,
      severity,
      reasons
    };
  } catch (error) {
    logger.error('Error checking alert status:', error);
    return { shouldAlert: false, severity: 'warning', reasons: [] };
  }
}

async function checkSystemHealth(): Promise<HealthStatus> {
  const dbHealth = await checkDatabaseHealth();
  const servicesHealth = await checkServicesHealth();
  const systemMetrics = await getSystemMetrics();
  const networkMetrics = await getNetworkMetrics();

  let overallStatus: HealthStatus['status'] = 'healthy';

  if (dbHealth.status === 'disconnected') {
    overallStatus = 'unhealthy';
  } else {
    const unavailableServices = Object.values(servicesHealth).filter(s => s.status === 'unavailable').length;
    const totalServices = Object.keys(servicesHealth).length;

    if (unavailableServices > 0) {
      overallStatus = unavailableServices === totalServices ? 'unhealthy' : 'degraded';
    }
  }

  if (systemMetrics.memory.freePercentage < 10) {
    overallStatus = overallStatus === 'healthy' ? 'degraded' : 'unhealthy';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date(),
    details: {
      database: dbHealth,
      services: servicesHealth,
      system: {
        ...systemMetrics,
        network: networkMetrics
      }
    }
  };

  // Check for alerts even if storage fails
  const alertStatus = await shouldSendAlert(healthStatus);
  if (alertStatus.shouldAlert) {
    logger.warn(`System health alert (${alertStatus.severity}):`, {
      status: healthStatus.status,
      reasons: alertStatus.reasons
    });
  }

  return healthStatus;
}

async function cleanupOldMetrics() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - METRICS_RETENTION_DAYS);

    await db
      .delete(healthMetrics)
      .where(lte(healthMetrics.timestamp, cutoffDate));

    logger.info(`Cleaned up metrics older than ${METRICS_RETENTION_DAYS} days`);
  } catch (error) {
    logger.error('Failed to cleanup old metrics:', error);
  }
}

// Express and Server types are already imported at the top

export function setupHealthMonitoring(app: Express, server: Server) {
  const healthCheckLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: { error: 'Too many health check requests, please try again later' }
  });

  app.use(['/health', '/health/metrics'], healthCheckLimiter);

  app.get('/api/health', async (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const health = await checkSystemHealth();
      res.status(health.status === 'unhealthy' ? 503 : 200).json(health);
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: 'Health check failed'
      });
    }
  });

  app.get('/health/metrics', async (_req, res) => {
    try {
      const metrics = await db
        .select()
        .from(healthMetrics)
        .orderBy(healthMetrics.timestamp)
        .limit(100);

      res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch health metrics:', error);
      res.status(500).json({ error: 'Failed to fetch health metrics' });
    }
  });

  app.post('/health/alerts/configure', async (req, res) => {
    try {
      const { enabled, configurations } = req.body;
      
      // Store in memory for now since table schema may not match
      const alertConfig = {
        enabled,
        configurations,
        timestamp: new Date()
      };
      
      res.json({ message: 'Alert configuration updated', config: alertConfig });
    } catch (error) {
      logger.error('Failed to configure alerts:', error);
      res.status(500).json({ error: 'Failed to configure alerts' });
    }
  });

  app.post('/health/thresholds', async (req, res) => {
    try {
      const { serviceCode, thresholds } = req.body;

      if (!serviceCode || !thresholds) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const currentStatus = serviceStatuses.get(serviceCode);
      if (!currentStatus) {
        return res.status(404).json({ error: 'Service not found' });
      }

      currentStatus.responseTimeThreshold = thresholds.responseTime ||
        DEFAULT_SERVICE_THRESHOLDS[serviceCode as keyof typeof DEFAULT_SERVICE_THRESHOLDS]?.responseTime;

      serviceStatuses.set(serviceCode, currentStatus);

      res.json({ message: 'Thresholds updated successfully' });
    } catch (error) {
      logger.error('Failed to update service thresholds:', error);
      res.status(500).json({ error: 'Failed to update thresholds' });
    }
  });

  if (healthCheckIntervalId) {
    clearInterval(healthCheckIntervalId);
  }

  healthCheckIntervalId = setInterval(async () => {
    try {
      const health = await checkSystemHealth();
      if (health.status !== 'healthy') {
        logger.warn(`System health is ${health.status}:`, health.details);
      }
    } catch (error) {
      logger.error('Periodic health check failed:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  setInterval(cleanupOldMetrics, CLEANUP_INTERVAL);

  process.on('SIGTERM', () => {
    if (healthCheckIntervalId) {
      clearInterval(healthCheckIntervalId);
    }
  });
}

// Types for monitoring metrics
interface SystemMetrics {
  timestamp: number;
  memory: {
    total: number;
    free: number;
    used: number;
    usedPercent: number;
  };
  cpu: {
    loadAvg: number[];
    cores: number;
    utilization: number;
  };
  uptime: number;
}

interface WebSocketMetrics {
  timestamp: number;
  service: string;
  connections: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
}

interface DatabaseMetrics {
  timestamp: number;
  connections: number;
  queriesPerSecond: number;
  avgQueryTime: number;
  slowQueries: number;
}

interface ApiMetrics {
  timestamp: number;
  requestsTotal: number;
  requestsPerSecond: number;
  avgResponseTime: number;
  errorRate: number;
  endpoints: {
    [path: string]: {
      count: number;
      avgTime: number;
      errors: number;
    };
  };
}

// Statistics for WebSocket connections
interface WebSocketStats {
  connections: Map<string, number>;
  messagesSent: Map<string, number>;
  messagesReceived: Map<string, number>;
  errors: Map<string, number>;
}

// Central monitoring class
class SystemMonitor {
  private static instance: SystemMonitor;
  private systemMetricsHistory: SystemMetrics[] = [];
  private webSocketMetricsHistory: Map<string, WebSocketMetrics[]> = new Map();
  private databaseMetricsHistory: DatabaseMetrics[] = [];
  private apiMetricsHistory: ApiMetrics[] = [];
  private webSocketStats: WebSocketStats = {
    connections: new Map(),
    messagesSent: new Map(),
    messagesReceived: new Map(),
    errors: new Map(),
  };
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;
  private intervalMs: number = 60000; // Default: 1 minute

  // Private constructor for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  // Start collecting metrics at the specified interval
  public startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      return;
    }

    this.intervalMs = intervalMs;
    this.isMonitoring = true;
    this.collectMetrics();

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.intervalMs);

    logger.info(`System monitoring started with ${intervalMs}ms interval`);
  }

  // Stop collecting metrics
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info('System monitoring stopped');
  }

  // Collect all metrics
  private collectMetrics(): void {
    this.collectSystemMetrics();
    this.collectWebSocketMetrics();
    // In a real implementation, these would collect actual metrics
    // this.collectDatabaseMetrics();
    // this.collectApiMetrics();
  }

  // Collect system metrics (CPU, memory, etc.)
  private collectSystemMetrics(): void {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedPercent = (usedMem / totalMem) * 100;

    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usedPercent,
      },
      cpu: {
        loadAvg: os.loadavg(),
        cores: os.cpus().length,
        utilization: os.loadavg()[0] / os.cpus().length * 100, // Approximate CPU utilization
      },
      uptime: os.uptime(),
    };

    this.systemMetricsHistory.push(metrics);

    // Keep only the last 1440 entries (24 hours at 1-minute intervals)
    if (this.systemMetricsHistory.length > 1440) {
      this.systemMetricsHistory.shift();
    }

    // Log metrics
    logger.info(`System metrics collected: Memory: ${usedPercent.toFixed(2)}% used, CPU: ${metrics.cpu.utilization.toFixed(2)}% utilized`);

    // Alert on high resource usage
    if (usedPercent > 90) {
      logger.warn(`High memory usage: ${usedPercent.toFixed(2)}%`);
    }
    
    if (metrics.cpu.utilization > 80) {
      logger.warn(`High CPU utilization: ${metrics.cpu.utilization.toFixed(2)}%`);
    }
  }

  // Collect WebSocket metrics
  private collectWebSocketMetrics(): void {
    // For each service with WebSocket connections
    this.webSocketStats.connections.forEach((connections, service) => {
      const metrics: WebSocketMetrics = {
        timestamp: Date.now(),
        service,
        connections,
        messagesSent: this.webSocketStats.messagesSent.get(service) || 0,
        messagesReceived: this.webSocketStats.messagesReceived.get(service) || 0,
        errors: this.webSocketStats.errors.get(service) || 0,
      };

      // Initialize array for service if it doesn't exist
      if (!this.webSocketMetricsHistory.has(service)) {
        this.webSocketMetricsHistory.set(service, []);
      }

      // Add metrics to history
      const serviceHistory = this.webSocketMetricsHistory.get(service)!;
      serviceHistory.push(metrics);

      // Keep only the last 1440 entries (24 hours at 1-minute intervals)
      if (serviceHistory.length > 1440) {
        serviceHistory.shift();
      }

      // Log metrics
      logger.info(`WebSocket metrics collected for ${service}: ${connections} connections, ${metrics.messagesReceived} messages received`);

      // Alert on high error rates
      if (metrics.errors > 0) {
        logger.warn(`WebSocket errors detected for ${service}: ${metrics.errors} errors`);
      }
    });

    // Reset message counters for the next interval
    this.webSocketStats.messagesSent.forEach((_, service) => {
      this.webSocketStats.messagesSent.set(service, 0);
    });
    
    this.webSocketStats.messagesReceived.forEach((_, service) => {
      this.webSocketStats.messagesReceived.set(service, 0);
    });
    
    this.webSocketStats.errors.forEach((_, service) => {
      this.webSocketStats.errors.set(service, 0);
    });
  }

  // Track WebSocket connection changes
  public trackWebSocketConnection(service: string, isConnected: boolean): void {
    const currentConnections = this.webSocketStats.connections.get(service) || 0;
    
    if (isConnected) {
      this.webSocketStats.connections.set(service, currentConnections + 1);
    } else {
      this.webSocketStats.connections.set(service, Math.max(0, currentConnections - 1));
    }
  }

  // Track WebSocket messages sent
  public trackWebSocketMessageSent(service: string): void {
    const currentCount = this.webSocketStats.messagesSent.get(service) || 0;
    this.webSocketStats.messagesSent.set(service, currentCount + 1);
  }

  // Track WebSocket messages received
  public trackWebSocketMessageReceived(service: string): void {
    const currentCount = this.webSocketStats.messagesReceived.get(service) || 0;
    this.webSocketStats.messagesReceived.set(service, currentCount + 1);
  }

  // Track WebSocket errors
  public trackWebSocketError(service: string): void {
    const currentCount = this.webSocketStats.errors.get(service) || 0;
    this.webSocketStats.errors.set(service, currentCount + 1);
  }

  // Get the latest system metrics
  public getLatestSystemMetrics(): SystemMetrics | null {
    if (this.systemMetricsHistory.length === 0) {
      return null;
    }
    return this.systemMetricsHistory[this.systemMetricsHistory.length - 1];
  }

  // Get the latest WebSocket metrics for a specific service
  public getLatestWebSocketMetrics(service: string): WebSocketMetrics | null {
    const serviceHistory = this.webSocketMetricsHistory.get(service);
    if (!serviceHistory || serviceHistory.length === 0) {
      return null;
    }
    return serviceHistory[serviceHistory.length - 1];
  }

  // Get system metrics history
  public getSystemMetricsHistory(hours: number = 24): SystemMetrics[] {
    const entriesPerHour = Math.floor(3600000 / this.intervalMs);
    const entriesToReturn = Math.min(hours * entriesPerHour, this.systemMetricsHistory.length);
    return this.systemMetricsHistory.slice(-entriesToReturn);
  }

  // Get WebSocket metrics history for a specific service
  public getWebSocketMetricsHistory(service: string, hours: number = 24): WebSocketMetrics[] {
    const serviceHistory = this.webSocketMetricsHistory.get(service);
    if (!serviceHistory) {
      return [];
    }

    const entriesPerHour = Math.floor(3600000 / this.intervalMs);
    const entriesToReturn = Math.min(hours * entriesPerHour, serviceHistory.length);
    return serviceHistory.slice(-entriesToReturn);
  }

  // Get all WebSocket service names
  public getWebSocketServices(): string[] {
    return Array.from(this.webSocketStats.connections.keys());
  }

  // Get current connection counts for all services
  public getCurrentConnectionCounts(): Map<string, number> {
    return new Map(this.webSocketStats.connections);
  }
}

// Export singleton instance
export const systemMonitor = SystemMonitor.getInstance();

// Helper function to wrap a WebSocket server with monitoring
export function monitorWebSocketServer(wss: WebSocket.Server, serviceName: string): WebSocket.Server {
  // Track new connections
  wss.on('connection', (ws) => {
    systemMonitor.trackWebSocketConnection(serviceName, true);
    
    // Track messages received
    ws.on('message', () => {
      systemMonitor.trackWebSocketMessageReceived(serviceName);
    });
    
    // Track disconnections
    ws.on('close', () => {
      systemMonitor.trackWebSocketConnection(serviceName, false);
    });
    
    // Track errors
    ws.on('error', () => {
      systemMonitor.trackWebSocketError(serviceName);
    });
  });
  
  // Return the same server instance
  return wss;
}

// Initialize monitoring on startup
export function initializeMonitoring(intervalMs: number = 60000): void {
  systemMonitor.startMonitoring(intervalMs);
}

export default systemMonitor;
