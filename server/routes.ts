import type { Express } from "express";
import { createServer, type Server, IncomingMessage } from "http";
import express from "express";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { z } from "zod";
import fs from "fs/promises";
import { WebSocketServer } from "ws";
import { eq } from "drizzle-orm";
import { registerExternalStatusRoutes } from "./external-status";
// Data imports moved to dedicated route files (services-inline.routes.ts, partners.routes.ts)
// Import middleware and utilities
import { isAuthenticated, isAdmin, setupAuth } from "./core/auth/auth.service";
import { logger } from "./utils/logger";
// cacheMiddleware moved to dedicated route files
import {
  cacheService,
  enhancedCache,
  cacheResponse,
} from "./core/cache/cache.service";
import {
  createAdvancedCSP,
  createDynamicRateLimit,
  sanitizeInput,
  initializeSecurityMonitoring,
  getSecurityStats,
} from "./middleware/advanced-security";
import { validateRequest } from "./middleware/validate";

// Import database
import { db } from "./db";

// Import server setup functions
import { setupHealthMonitoring } from "./core/monitoring/monitoring.service";
// Old WebSocket imports removed - now using unified WebSocket system
// All WebSocket services are handled by server/websocket/UnifiedWebSocketManager.ts
// Import API documentation setup
import externalStatusRouter from "./routes/external-status";
import { setupApiDocs } from "./api-docs";

// Import route handlers
import apiKeysRoutes from "./routes/api-keys";
import driveRoutes from "./routes/driveRoutes";
import { contactAgentsRouter } from "./routes/contact-agents";
import apiDocumentationRoutes from "./routes/api-documentation";
// Conditionally import healthRecommendationsRoutes only if AI is enabled
// import healthRecommendationsRoutes from './api/health/health-recommendations';
import missingRoutes from "./routes/missing-routes";
// Conditionally import rayanavaRoutes only if AI is enabled
// import rayanavaRoutes from './routes/rayanava-routes';
import guidesRoutes from "./routes/guides";
// Import domain registrars
import { 
  registerServiceRoutes, 
  registerAdminRoutes, 
  registerCollaborationRoutes,
  registerAnalyticsRoutes,
  registerSecurityRoutes,
  registerEcosystemRoutes
} from './registrars';
import developerDepartmentRoutes from "./routes/developer-department";
import dashboardsRoutes from "./routes/dashboards"; // Centralized dashboard controller
// Investment routes - now enabled (database tables created)
import { setupInvestmentRoutes } from './api/investment/investment.routes';
// Page modules routes - now enabled (database tables created)
import pageModulesRoutes from './routes/page-modules';
import { performanceMetrics } from "./services/performance-metrics";
import WebSocket from "ws";
import supplyChainRoutes from "./routes/supply-chain";
import instagramRoutes from "./routes/instagram.routes";
import profileRoutes from "./routes/profile";
import secureSystemRoutes from "./routes/secure-system-routes";
import webSocketHealthRoutes from "./api/websocket/websocket-health.routes";
import projectsRoutes from "./api/projects/projects.routes";
import formSubmissionsRouter from "./routes/admin/form-submissions.routes";
import emailSettingsRouter from "./routes/admin/email-settings.routes";
import emailApiRouter from "./routes/email-api.routes";
import { subdomainMiddleware } from "./middleware/subdomain";
import { auditLogger } from "./middleware/auditLogger";
import { serviceRoutesV1 as servicesPlatformRouter } from "./platform/services/v1";

// Query parameter schemas
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// Configure file upload settings
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = "./attached_assets/uploads/";
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.",
        ),
      );
    }
  },
});

// Cache TTL constants moved to dedicated route files

// ═══════════════════════════════════════════════════════════════════════════
// SECTION: Core Initialization
// ═══════════════════════════════════════════════════════════════════════════

export async function registerRoutes(
  app: Express,
  httpServer: Server,
): Promise<void> {
  // Apply subdomain detection middleware first (before auth and static serving)
  app.use(subdomainMiddleware);

  // Setup investment routes early (before other routes)
  setupInvestmentRoutes(app);

  // Initialize core systems
  setupAuth(app);

  // Setup API documentation
  setupApiDocs(app);

  // Static file serving
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "attached_assets", "uploads")),
  );
  app.use(
    "/projects",
    express.static(path.join(process.cwd(), "attached_assets", "projects")),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Public API Routes (No Authentication Required)
  // ═══════════════════════════════════════════════════════════════════════════

  // Public routes - Domain registrars consolidate route registrations
  registerServiceRoutes(app);
  registerCollaborationRoutes(app);
  
  // Services Platform v1 API (unified services for all consumers: web, mobile, OPT, Mololink)
  app.use("/api/platform/services/v1", servicesPlatformRouter);
  registerSecurityRoutes(app);
  registerEcosystemRoutes(app);
  // app.use('/api', servicesEnhancedRoutes); // Disabled due to database timeout issues
  // Note: servicesManagementRoutes disabled due to timeout issues
  app.use("/api/contact", contactAgentsRouter);

  // Profile routes for user profile management
  app.use("/api", profileRoutes);

  // Instagram Marketing Module routes
  app.use("/api/instagram", instagramRoutes);

  // Google Drive integration routes
  // These routes handle file operations for Google Drive storage
  app.use("/api/drive", driveRoutes);

  // Collaborative Documents routes are handled by registerCollaborationRoutes

  // Settings routes - for application configuration
  app.use("/api/settings", apiKeysRoutes);

  // Centralized dashboard controller - role-based dashboards
  app.use("/api/dashboards", dashboardsRoutes);

  // WebSocket health and monitoring routes
  app.use("/api/websocket", webSocketHealthRoutes);
  
  // Alias for WebSocket health endpoint (used by admin diagnostics)
  app.get("/api/ws-health", async (req, res) => {
    try {
      const { wsHealthMonitor } = await import("./utils/websocket-health");
      const healthStatus = wsHealthMonitor.getHealthStatus();
      const metrics = wsHealthMonitor.getMetrics();
      
      res.json({
        success: true,
        metrics,
        status: healthStatus.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching WebSocket health status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch WebSocket health status'
      });
    }
  });

  // Page and Module Management routes
  app.use(pageModulesRoutes);

  // Supply Chain Heatmap routes
  app.use(supplyChainRoutes);

  // AI Health Recommendations routes (conditionally enabled)
  const FEATURE_AI_ENABLED = process.env.FEATURE_AI_ENABLED === "true";
  if (FEATURE_AI_ENABLED) {
    try {
      const { default: healthRecommendationsRoutes } = await import(
        "./api/health/health-recommendations"
      );
      app.use("/api/health-recommendations", healthRecommendationsRoutes);
    } catch (error) {
      logger.error("Failed to load health recommendations routes:", error);
      app.use("/api/health-recommendations", (_req, res) => {
        res.status(503).json({ message: "AI services failed to load." });
      });
    }
  } else {
    // Provide 503 for disabled AI routes
    app.use("/api/health-recommendations", (_req, res) => {
      res
        .status(503)
        .json({
          message:
            "AI services are currently disabled. Set FEATURE_AI_ENABLED=true to enable.",
        });
    });
  }

  // Integrate missing route handlers
  app.use(missingRoutes);

  // Integrate secure system routes (protected endpoints)
  app.use(secureSystemRoutes);

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Projects Domain (Extracted to server/api/projects/projects.routes.ts)
  // ═══════════════════════════════════════════════════════════════════════════
  app.use("/api/projects", projectsRoutes);

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Services, Partners & Tracking Domain
  // Routes extracted to dedicated route files and registered via services.registrar.ts:
  // - services-inline.routes.ts: /api/services, /api/services/:id, /api/services/:id/availability/:regionCode, /api/regions, /api/product-types
  // - partners.routes.ts: /api/partners, /api/partners/:id, /api/partners/:id/related
  // - tracking.routes.ts: /api/tracking/:trackingNumber (already exists)
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Admin Routes (Authentication Required)
  // ═══════════════════════════════════════════════════════════════════════════

  // Protected admin routes - auth middleware applied before registrar
  app.use("/api/admin/*", isAuthenticated, isAdmin);
  app.use(auditLogger);
  registerAdminRoutes(app, upload.single("file"));

  // Form submission management routes
  app.use("/api/admin/submissions", formSubmissionsRouter);

  // Email settings and template management routes
  app.use("/api/admin/email", emailSettingsRouter);

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Public Email API (Cross-Subdomain Access)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Public email API for cross-subdomain access (API key authenticated)
  app.use("/api/email", emailApiRouter);

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Analytics & AI Routes
  // ═══════════════════════════════════════════════════════════════════════════

  // API Documentation routes
  app.use("/api", apiDocumentationRoutes);

  // Analytics and Business Intelligence routes via registrar
  registerAnalyticsRoutes(app);

  // Rayanava AI Integration Routes (conditionally enabled)
  if (FEATURE_AI_ENABLED) {
    try {
      const { default: rayanavaRoutes } = await import(
        "./routes/rayanava-routes"
      );
      app.use("/api/rayanava", rayanavaRoutes);
    } catch (error) {
      logger.error("Failed to load rayanava routes:", error);
      app.use("/api/rayanava", (_req, res) => {
        res.status(503).json({ message: "AI services failed to load." });
      });
    }
  } else {
    // Provide 503 for disabled AI routes
    app.use("/api/rayanava", (_req, res) => {
      res
        .status(503)
        .json({
          message:
            "AI services are currently disabled. Set FEATURE_AI_ENABLED=true to enable.",
        });
    });
  }

  // Public health status endpoint (limited info for security)
  app.get("/api/health/websocket", (_req, res) => {
    const metricsArray: any[] = [];
    const totalConnections = metricsArray.reduce(
      (sum: number, metric: any) => sum + metric.activeConnections,
      0,
    );
    const overallStatus = metricsArray.every((m: any) => m.status === "healthy")
      ? "healthy"
      : metricsArray.some((m: any) => m.status === "degraded")
        ? "degraded"
        : "unhealthy";

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalConnections,
      services: metricsArray.map((metric) => ({
        name: metric.serviceName,
        status: metric.activeConnections > 0 ? "connected" : "disconnected",
      })),
    });
  });

  // WebSocket services are now handled by the unified WebSocket system
  // located in server/core/websocket/UnifiedWebSocketManager.ts
  // All WebSocket initialization has been moved to a centralized system

  logger.info("All WebSocket services initialized via UnifiedWebSocketManager");
  setupHealthMonitoring(app, httpServer);

  // LEGACY WebSocketServer instances removed - all namespaces handled by UnifiedWebSocketManager:
  // - /ws/commodity-chat
  // - /ws/developer-workspace
  // - /ws/performance
  // - /ws/supply-chain
  //
  // The UnifiedWebSocketManager in server/core/websocket/ handles ALL WebSocket connections
  // via a single upgrade handler to prevent competing handlers and connection failures

  // Performance metrics API endpoints
  app.get("/api/performance/metrics", async (req, res) => {
    const { range = "5m" } = req.query;
    const durations: Record<string, number> = {
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
    };
    const duration = durations[range as string] || durations["5m"];
    const metrics = performanceMetrics.getMetrics(duration);
    res.json(metrics);
  });

  app.get("/api/performance/historical", async (req, res) => {
    const { hours = 24 } = req.query;
    const historical = await performanceMetrics.getHistoricalMetrics(
      Number(hours),
    );
    res.json(historical);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: Additional Feature Routes
  // ═══════════════════════════════════════════════════════════════════════════

  // Additional feature-specific routes (non-duplicates only)
  // Note: developerWorkspaceRoutes now handled by registerCollaborationRoutes
  // Note: carrierIntegrationRoutes, mololinkRoutes, ecosystemRoutes now handled by registrars
  app.use("/api/missing-routes", missingRoutes);
  app.use("/api/guides", guidesRoutes);
  app.use("/api/developer", developerDepartmentRoutes);

  // Module API routes
  // app.use('/api/modules', moduleAPIRouter); // Removed - module doesn't exist
  // app.use('/api', moduleEndpointsRouter); // Disabled - conflicts with services-simple routes
}

// export { createActivityLog }; // Temporarily disabled - activity logs moved to unified system
