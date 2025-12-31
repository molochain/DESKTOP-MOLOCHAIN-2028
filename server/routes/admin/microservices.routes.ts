import { Router } from "express";
import { Client } from "ssh2";
import { logger } from "../../utils/logger";
import { isAuthenticated, isAdmin } from "../../core/auth/auth.service";
import { requirePermission, PERMISSIONS } from "../../middleware/requirePermission";

const router = Router();

router.use(isAuthenticated, isAdmin);

const PRODUCTION_HOST = "31.186.24.19";
const PRODUCTION_CORE_PORT = 5000;
const SSH_USER = "root";
const SSH_PASSWORD = process.env.SERVER_SSH_PASSWORD;

const CONTAINER_NAME_MAP: Record<string, string> = {
  "molochain-core": "molochain-core",
  "molochain-admin": "molochain-admin",
  "molochain-admin-service": "molochain-admin-service",
  "molochain-api-gateway": "molochain-api-gateway",
  "molochain-communications-hub": "molochain-communications-hub",
  "communications-hub": "molochain-communications-hub",
  "workflow-orchestrator": "molochain-workflow-orchestrator",
  "molochain-workflow-orchestrator": "molochain-workflow-orchestrator",
  "mololink": "mololink-app",
  "mololink-app": "mololink-app",
  "cms": "molochain-cms-app",
  "molochain-cms": "molochain-cms-app",
  "database": "molochain-postgres",
  "molochain-postgres": "molochain-postgres",
  "blockchain-tracking": "molochain-blockchain-tracking",
  "smart-contracts": "molochain-smart-contracts",
  "document-auth": "molochain-document-auth",
  "tokenized-assets": "molochain-tokenized-assets",
  "AIR001": "molochain-air-transport",
  "SEA001": "molochain-sea-transport",
  "WRH001": "molochain-warehouse",
  "rayanava-ai": "rayanava-ai-agents",
  "rayanava-gateway": "rayanava-gateway",
  "rayanava-workflows": "rayanava-workflows",
  "rayanava-voice": "rayanava-voice",
  "rayanava-notifications": "rayanava-notifications",
  "rayanava-monitoring": "rayanava-monitoring",
  "auth-service": "auth-service",
  "kong-gateway": "kong-gateway",
  "molochain-loki": "molochain-loki",
  "molochain-promtail": "molochain-promtail",
  "molochain-alertmanager": "molochain-alertmanager",
  "rayanava-prometheus": "rayanava-prometheus",
  "rayanava-grafana": "rayanava-grafana"
};

function executeSSHCommand(command: string, timeout = 30000): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    if (!SSH_PASSWORD) {
      resolve({ success: false, output: "", error: "SSH password not configured" });
      return;
    }

    const conn = new Client();
    let output = "";
    let errorOutput = "";
    let resolved = false;

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        conn.end();
        resolve({ success: false, output, error: "Command timeout exceeded" });
      }
    }, timeout);

    conn.on("ready", () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timeoutId);
          resolved = true;
          conn.end();
          resolve({ success: false, output: "", error: err.message });
          return;
        }

        stream.on("close", (code: number) => {
          clearTimeout(timeoutId);
          if (!resolved) {
            resolved = true;
            conn.end();
            resolve({ 
              success: code === 0, 
              output: output.trim(), 
              error: code !== 0 ? errorOutput.trim() || `Exit code: ${code}` : undefined 
            });
          }
        });

        stream.on("data", (data: Buffer) => {
          output += data.toString();
        });

        stream.stderr.on("data", (data: Buffer) => {
          errorOutput += data.toString();
        });
      });
    });

    conn.on("error", (err) => {
      clearTimeout(timeoutId);
      if (!resolved) {
        resolved = true;
        resolve({ success: false, output: "", error: err.message });
      }
    });

    conn.connect({
      host: PRODUCTION_HOST,
      port: 22,
      username: SSH_USER,
      password: SSH_PASSWORD,
      readyTimeout: 10000
    });
  });
}
const GRAFANA_URL = `http://${PRODUCTION_HOST}:3001`;
const PROMETHEUS_URL = `http://${PRODUCTION_HOST}:9090`;

interface EcosystemHealthResponse {
  status: string;
  timestamp: string;
  details: {
    database: { status: string; latency: number };
    services: Record<string, {
      status: string;
      responseTime: number;
      lastCheck: string;
      consecutiveFailures: number;
      metrics: {
        successRate: number;
        averageResponseTime: number;
        errorRate: number;
      };
    }>;
    system: {
      cpu: { usage: number; loadAvg: number[]; cores: number };
      memory: { used: number; total: number; freePercentage: number; swapUsage?: number };
      disk?: { total: number; free: number; used: number };
      network?: { connections: number; bytesReceived: number; bytesSent: number };
      uptime: number;
    };
  };
}

interface MicroserviceStatus {
  id: string;
  name: string;
  containerId: string | null;
  status: "healthy" | "unhealthy" | "not_found" | "starting";
  uptime: string | null;
  responseTime: number | null;
  lastCheck: string;
  port: number | null;
  category?: string;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    loadAvg: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    freePercentage: number;
    usedGB: string;
    totalGB: string;
  };
  disk: {
    used: number;
    total: number;
    freePercentage: number;
    usedGB: string;
    totalGB: string;
  };
  network: {
    connections: number;
    bytesReceived: string;
    bytesSent: string;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
}

let cachedEcosystemData: EcosystemHealthResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10000;

async function fetchProductionHealth(): Promise<EcosystemHealthResponse | null> {
  const now = Date.now();
  if (cachedEcosystemData && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedEcosystemData;
  }

  const endpoints = [
    `http://${PRODUCTION_HOST}:${PRODUCTION_CORE_PORT}/api/health`,
    "http://localhost:5000/api/health"
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        cachedEcosystemData = data;
        cacheTimestamp = now;
        logger.debug(`Fetched ecosystem health from ${url}`);
        return data;
      }
    } catch (error) {
      logger.debug(`Failed to fetch from ${url}:`, error);
    }
  }
  return null;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function bytesToGB(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function buildSystemMetrics(healthData: EcosystemHealthResponse): SystemMetrics {
  const system = healthData.details?.system;
  
  return {
    cpu: {
      usage: system?.cpu?.usage || 0,
      loadAvg: system?.cpu?.loadAvg || [0, 0, 0],
      cores: system?.cpu?.cores || 1
    },
    memory: {
      used: system?.memory?.used || 0,
      total: system?.memory?.total || 0,
      freePercentage: system?.memory?.freePercentage || 0,
      usedGB: bytesToGB(system?.memory?.used || 0),
      totalGB: bytesToGB(system?.memory?.total || 0)
    },
    disk: {
      used: system?.disk?.used || 0,
      total: system?.disk?.total || 0,
      freePercentage: system?.disk?.free && system?.disk?.total 
        ? (system.disk.free / system.disk.total) * 100 
        : 0,
      usedGB: bytesToGB((system?.disk?.used || 0) * 1024 * 1024),
      totalGB: bytesToGB((system?.disk?.total || 0) * 1024 * 1024)
    },
    network: {
      connections: system?.network?.connections || 0,
      bytesReceived: formatBytes(system?.network?.bytesReceived || 0),
      bytesSent: formatBytes(system?.network?.bytesSent || 0)
    },
    uptime: {
      seconds: system?.uptime || 0,
      formatted: formatUptime(system?.uptime || 0)
    }
  };
}

function buildMicroservicesFromHealth(healthData: EcosystemHealthResponse): MicroserviceStatus[] {
  const services: MicroserviceStatus[] = [];
  const systemUptime = healthData.details?.system?.uptime;
  const uptimeStr = systemUptime !== undefined ? formatUptime(systemUptime) : null;
  
  const serviceConfig: Record<string, { name: string; category: string }> = {
    "blockchain-tracking": { name: "Blockchain Tracking", category: "Blockchain" },
    "smart-contracts": { name: "Smart Contracts", category: "Blockchain" },
    "document-auth": { name: "Document Auth", category: "Security" },
    "tokenized-assets": { name: "Tokenized Assets", category: "Blockchain" },
    "AIR001": { name: "Air Transport Service", category: "Transport" },
    "SEA001": { name: "Sea Transport Service", category: "Transport" },
    "WRH001": { name: "Warehouse Service", category: "Storage" },
    "molochain-core": { name: "Core Platform", category: "Core" },
    "molochain-admin": { name: "Admin Portal", category: "Core" },
    "molochain-api-gateway": { name: "API Gateway", category: "Infrastructure" },
    "molochain-communications-hub": { name: "Communications Hub", category: "Services" },
    "workflow-orchestrator": { name: "Workflow Orchestrator", category: "Automation" }
  };

  if (healthData.details?.services) {
    for (const [key, svc] of Object.entries(healthData.details.services)) {
      const config = serviceConfig[key] || { name: key, category: "Other" };
      const responseTime = svc.responseTime !== undefined 
        ? Math.round(svc.responseTime) 
        : (svc.metrics?.averageResponseTime !== undefined 
          ? Math.round(svc.metrics.averageResponseTime) 
          : null);
      
      services.push({
        id: key,
        name: config.name,
        containerId: null,
        status: svc.status === "available" ? "healthy" : "unhealthy",
        uptime: uptimeStr,
        responseTime,
        lastCheck: svc.lastCheck || healthData.timestamp,
        port: null,
        category: config.category
      });
    }
  }

  if (healthData.details?.database) {
    const dbLatency = healthData.details.database.latency !== undefined 
      ? healthData.details.database.latency 
      : null;
    
    services.push({
      id: "database",
      name: "PostgreSQL Database",
      containerId: null,
      status: healthData.details.database.status === "connected" ? "healthy" : "unhealthy",
      uptime: uptimeStr,
      responseTime: dbLatency,
      lastCheck: healthData.timestamp,
      port: 5432,
      category: "Database"
    });
  }

  return services;
}

router.get("/", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (_req, res) => {
  try {
    const healthData = await fetchProductionHealth();
    
    if (!healthData) {
      return res.status(503).json({ 
        error: "Unable to fetch ecosystem health",
        microservices: [],
        summary: { total: 0, healthy: 0, unhealthy: 0 },
        systemMetrics: null,
        grafanaUrl: GRAFANA_URL,
        prometheusUrl: PROMETHEUS_URL
      });
    }

    const microservices = buildMicroservicesFromHealth(healthData);
    const systemMetrics = buildSystemMetrics(healthData);
    const healthyCount = microservices.filter(s => s.status === "healthy").length;
    const unhealthyCount = microservices.filter(s => s.status === "unhealthy").length;

    const categories = [...new Set(microservices.map(s => s.category))].filter(Boolean);

    res.json({
      microservices,
      summary: {
        total: microservices.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
        healthPercentage: microservices.length > 0 
          ? Math.round((healthyCount / microservices.length) * 100) 
          : 0
      },
      systemMetrics,
      categories,
      grafanaUrl: GRAFANA_URL,
      prometheusUrl: PROMETHEUS_URL,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error fetching microservices status:", error);
    res.status(500).json({ error: "Failed to fetch microservices status" });
  }
});

router.get("/stats", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (_req, res) => {
  try {
    const healthData = await fetchProductionHealth();
    
    if (!healthData) {
      return res.status(503).json({ error: "Unable to fetch ecosystem health" });
    }

    const systemMetrics = buildSystemMetrics(healthData);
    
    res.json({
      systemMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error fetching system stats:", error);
    res.status(500).json({ error: "Failed to fetch system stats" });
  }
});

router.get("/:serviceId/health", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const healthData = await fetchProductionHealth();
    
    if (!healthData) {
      return res.status(503).json({ error: "Unable to fetch ecosystem health" });
    }

    const microservices = buildMicroservicesFromHealth(healthData);
    const service = microservices.find(s => s.id === serviceId);
    
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    
    res.json(service);
  } catch (error) {
    logger.error("Error checking service health:", error);
    res.status(500).json({ error: "Failed to check service health" });
  }
});

router.post("/:serviceId/restart", requirePermission(PERMISSIONS.INFRASTRUCTURE_MANAGE), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userEmail = (req as any).user?.email || "unknown";
    
    logger.info(`Container restart requested for: ${serviceId}`, {
      user: userEmail,
      timestamp: new Date().toISOString()
    });

    const containerName = CONTAINER_NAME_MAP[serviceId] || `molochain-${serviceId}`;
    
    if (serviceId === "database") {
      return res.status(400).json({
        success: false,
        error: "Database restart not allowed via this interface for safety reasons"
      });
    }

    const checkResult = await executeSSHCommand(`docker ps -q -f name=^${containerName}$`);
    
    if (!checkResult.success || !checkResult.output) {
      logger.warn(`Container not found: ${containerName}`);
      return res.status(404).json({
        success: false,
        error: `Container '${containerName}' not found or not running`
      });
    }

    const restartResult = await executeSSHCommand(`docker restart ${containerName}`, 60000);
    
    if (restartResult.success) {
      logger.info(`Container restarted successfully: ${containerName}`, {
        user: userEmail,
        output: restartResult.output
      });
      
      res.json({ 
        success: true, 
        message: `Container '${containerName}' restarted successfully`,
        containerId: restartResult.output
      });
    } else {
      logger.error(`Failed to restart container: ${containerName}`, {
        error: restartResult.error
      });
      
      res.status(500).json({
        success: false,
        error: `Failed to restart container: ${restartResult.error}`
      });
    }
  } catch (error) {
    logger.error("Error restarting service:", error);
    res.status(500).json({ error: "Failed to restart service" });
  }
});

router.get("/:serviceId/logs", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const lines = Math.min(parseInt(req.query.lines as string) || 50, 200);
    
    logger.info(`Log request for: ${serviceId}, lines: ${lines}`);
    
    const containerName = CONTAINER_NAME_MAP[serviceId] || `molochain-${serviceId}`;
    
    const logsResult = await executeSSHCommand(
      `docker logs ${containerName} --tail ${lines} 2>&1`,
      15000
    );
    
    if (logsResult.success && logsResult.output) {
      const logLines = logsResult.output.split('\n').filter(line => line.trim());
      
      res.json({
        serviceId,
        containerName,
        logs: logLines,
        lineCount: logLines.length,
        grafanaUrl: `${GRAFANA_URL}/explore`,
        note: "Live container logs fetched successfully"
      });
    } else {
      res.json({
        serviceId,
        containerName,
        logs: [
          `Unable to fetch live logs: ${logsResult.error || 'Unknown error'}`,
          `View logs in Grafana: ${GRAFANA_URL}/explore`,
          `Or SSH and run: docker logs ${containerName} --tail ${lines}`
        ],
        grafanaUrl: `${GRAFANA_URL}/explore`,
        note: "Fallback to Grafana for log viewing"
      });
    }
  } catch (error) {
    logger.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

router.get("/prometheus/metrics", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (_req, res) => {
  try {
    const queries = [
      { name: 'cpu_usage', query: '100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)' },
      { name: 'memory_usage', query: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100' },
      { name: 'disk_usage', query: '(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100' },
      { name: 'gateway_connections', query: 'gateway_active_connections' },
      { name: 'workflow_runs', query: 'sum(workflow_runs_total)' },
      { name: 'http_request_rate', query: 'sum(rate(gateway_http_request_duration_seconds_count[5m]))' },
      { name: 'alerts_total', query: 'sum(alerts_by_severity_total)' },
    ];

    const results: Record<string, number | null> = {};

    for (const { name, query } of queries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data?.result?.[0]?.value) {
            results[name] = parseFloat(data.data.result[0].value[1]);
          } else {
            results[name] = null;
          }
        } else {
          results[name] = null;
        }
      } catch (error) {
        logger.debug(`Failed to fetch metric ${name}:`, error);
        results[name] = null;
      }
    }

    res.json({
      metrics: results,
      prometheusUrl: PROMETHEUS_URL,
      grafanaUrl: GRAFANA_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error fetching Prometheus metrics:", error);
    res.status(500).json({ error: "Failed to fetch Prometheus metrics" });
  }
});

router.get("/prometheus/query", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (req, res) => {
  try {
    const { metric, range = '1h', step = '60' } = req.query;
    
    if (!metric) {
      return res.status(400).json({ error: "Metric query parameter is required" });
    }

    const rangeMap: Record<string, number> = {
      '1h': 3600,
      '6h': 21600,
      '24h': 86400,
      '7d': 604800,
    };

    const rangeSeconds = rangeMap[range as string] || 3600;
    const end = Math.floor(Date.now() / 1000);
    const start = end - rangeSeconds;

    const metricQueries: Record<string, string> = {
      'cpu': '100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
      'memory': '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
      'disk': '(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100',
      'network_in': 'rate(node_network_receive_bytes_total{device!="lo"}[5m])',
      'network_out': 'rate(node_network_transmit_bytes_total{device!="lo"}[5m])',
      'gateway_connections': 'gateway_active_connections',
      'http_requests': 'sum(rate(gateway_http_request_duration_seconds_count[5m]))',
      'workflow_runs': 'sum(increase(workflow_runs_total[5m]))',
      'container_cpu': 'sum by(name) (rate(container_cpu_usage_seconds_total[5m])) * 100',
      'container_memory': 'sum by(name) (container_memory_usage_bytes) / 1024 / 1024',
    };

    const query = metricQueries[metric as string] || metric;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `${PROMETHEUS_URL}/api/v1/query_range?query=${encodeURIComponent(query as string)}&start=${start}&end=${end}&step=${step}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error(`Prometheus query failed: ${response.status}`);
      return res.status(502).json({ error: "Prometheus query failed" });
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      return res.status(502).json({ error: data.error || "Prometheus query failed" });
    }

    const chartData = data.data.result.map((result: { metric: Record<string, string>; values: [number, string][] }) => ({
      metric: result.metric,
      values: result.values.map(([timestamp, value]: [number, string]) => ({
        timestamp: timestamp * 1000,
        value: parseFloat(value),
      })),
    }));

    res.json({
      metric: metric,
      range: range,
      data: chartData,
      prometheusUrl: PROMETHEUS_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error querying Prometheus:", error);
    res.status(500).json({ error: "Failed to query Prometheus" });
  }
});

router.get("/prometheus/available-metrics", requirePermission(PERMISSIONS.INFRASTRUCTURE_VIEW), async (_req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `${PROMETHEUS_URL}/api/v1/label/__name__/values`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch available metrics" });
    }

    const data = await response.json();
    
    res.json({
      metrics: data.data || [],
      count: (data.data || []).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error fetching available metrics:", error);
    res.status(500).json({ error: "Failed to fetch available metrics" });
  }
});

export default router;
