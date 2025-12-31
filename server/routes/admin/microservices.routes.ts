import { Router } from "express";
import { logger } from "../../utils/logger";
import { isAuthenticated, isAdmin } from "../../core/auth/auth.service";
import { requirePermission, PERMISSIONS } from "../../middleware/requirePermission";

const router = Router();

router.use(isAuthenticated, isAdmin);

const PRODUCTION_HOST = "31.186.24.19";
const PRODUCTION_CORE_PORT = 5000;
const GRAFANA_URL = `http://${PRODUCTION_HOST}:3001`;

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
      memory: { used: number; total: number; freePercentage: number };
      uptime: number;
    };
  };
}

interface MicroserviceStatus {
  id: string;
  name: string;
  containerId: string | null;
  status: "healthy" | "unhealthy" | "not_found";
  uptime: string | null;
  responseTime: number | null;
  lastCheck: string;
  port: number | null;
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
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function buildMicroservicesFromHealth(healthData: EcosystemHealthResponse): MicroserviceStatus[] {
  const services: MicroserviceStatus[] = [];
  const systemUptime = healthData.details?.system?.uptime;
  const uptimeStr = systemUptime !== undefined ? formatUptime(systemUptime) : null;
  
  // Map service IDs to human-readable names (names only, no synthetic data)
  const serviceNames: Record<string, string> = {
    "blockchain-tracking": "Blockchain Tracking",
    "smart-contracts": "Smart Contracts",
    "document-auth": "Document Auth",
    "tokenized-assets": "Tokenized Assets",
    "AIR001": "Air Transport Service",
    "SEA001": "Sea Transport Service",
    "WRH001": "Warehouse Service"
  };

  // Only add services explicitly from /api/health response - no fabrication
  if (healthData.details?.services) {
    for (const [key, svc] of Object.entries(healthData.details.services)) {
      const name = serviceNames[key] || key;
      // Only include responseTime if explicitly provided by API
      const responseTime = svc.responseTime !== undefined 
        ? Math.round(svc.responseTime) 
        : (svc.metrics?.averageResponseTime !== undefined 
          ? Math.round(svc.metrics.averageResponseTime) 
          : null);
      
      services.push({
        id: key,
        name,
        containerId: null,
        status: svc.status === "available" ? "healthy" : "unhealthy",
        uptime: uptimeStr,
        responseTime,
        lastCheck: svc.lastCheck || healthData.timestamp,
        port: null
      });
    }
  }

  // Add database status as a service since it's in the health response
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
      port: null
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
        grafanaUrl: GRAFANA_URL
      });
    }

    const microservices = buildMicroservicesFromHealth(healthData);
    const healthyCount = microservices.filter(s => s.status === "healthy").length;
    const unhealthyCount = microservices.filter(s => s.status === "unhealthy").length;

    res.json({
      microservices,
      summary: {
        total: microservices.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount
      },
      grafanaUrl: GRAFANA_URL,
      systemMetrics: {
        cpu: healthData.details?.system?.cpu,
        memory: healthData.details?.system?.memory,
        uptime: healthData.details?.system?.uptime
      }
    });
  } catch (error) {
    logger.error("Error fetching microservices status:", error);
    res.status(500).json({ error: "Failed to fetch microservices status" });
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

export default router;
