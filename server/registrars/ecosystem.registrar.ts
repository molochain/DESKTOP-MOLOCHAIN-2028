/**
 * Ecosystem Domain Registrar
 * Consolidates all ecosystem and integration-related route registrations
 * 
 * Routes consolidated:
 * - cmsPublicRoutes: Laravel CMS integration public endpoints
 * - otmsPublicRoutes: Order Tracking Management System public endpoints
 * - ecosystemRoutes: Ecosystem management and integration endpoints
 * - ecosystemRegistryRoutes: Centralized ecosystem API registry management
 * - ecosystemMetricsRoutes: Prometheus metrics and health worker management
 * - mololinkRoutes: MoloLink professional network integration endpoints
 */

import type { Express } from "express";
import cmsPublicRoutes from "../api/cms/cms-public.routes";
import otmsPublicRoutes from "../api/otms/otms-public.routes";
import ecosystemRoutes from "../api/ecosystem/ecosystem";
import ecosystemRegistryRoutes from "../routes/ecosystem-registry";
import ecosystemMetricsRoutes from "../routes/ecosystem-metrics";
import mololinkRoutes from "../routes/mololink";
import { ecosystemHealthWorker } from "../services/ecosystem-health-worker";
import { logger } from "../utils/logger";

/**
 * Registers all ecosystem-related routes
 * @param app - Express application instance
 */
export function registerEcosystemRoutes(app: Express): void {
  app.use("/api/cms", cmsPublicRoutes);
  app.use("/api/otms", otmsPublicRoutes);
  app.use("/api/ecosystem", ecosystemRoutes);
  app.use("/api/ecosystem/registry", ecosystemRegistryRoutes);
  app.use("/api/ecosystem/metrics", ecosystemMetricsRoutes);
  app.use("/api/mololink", mololinkRoutes);

  setTimeout(async () => {
    try {
      await ecosystemHealthWorker.initialize(120000);
      logger.info('[Ecosystem] Health worker initialized (2 min interval)');
    } catch (error) {
      logger.warn('[Ecosystem] Health worker failed to start:', error);
    }
  }, 10000);
}
