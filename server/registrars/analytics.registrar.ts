/**
 * Analytics Domain Registrar
 * Consolidates all analytics and performance-related route registrations
 * 
 * Routes consolidated:
 * - analyticsRoutes: Business intelligence and analytics endpoints
 * - performanceRoutes: System performance monitoring and metrics
 * - carrierIntegrationRoutes: Carrier tracking integration endpoints
 */

import type { Express } from "express";
import analyticsRoutes from "../api/analytics/analytics";
import performanceRoutes from "../routes/performance";
import carrierIntegrationRoutes from "../api/tracking/carrier-integration";

/**
 * Registers all analytics-related routes
 * @param app - Express application instance
 */
export function registerAnalyticsRoutes(app: Express): void {
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/performance", performanceRoutes);
  app.use("/api/carriers", carrierIntegrationRoutes);
}
