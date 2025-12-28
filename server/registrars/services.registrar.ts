/**
 * Services Domain Registrar
 * Consolidates all service-related route registrations
 * 
 * Routes consolidated:
 * - serviceRecommendationRoutes: AI-powered service recommendations
 * - optimizedServicesRoutes: High-performance endpoints with pagination/caching
 * - cachedServicesRoutes: Static cached services data
 * - servicesInlineRoutes: Core services, regions, product-types endpoints
 * - partnersRoutes: Partner management endpoints
 */

import type { Express } from "express";
import serviceRecommendationRoutes from "../routes/service-recommendation";
import optimizedServicesRoutes from "../api/services/optimized-services";
import cachedServicesRoutes from "../api/services/cached-services";
import quoteRoutes from "../api/services/quote.routes";
import servicesInlineRoutes from "../api/services/services-inline.routes";
import partnersRoutes from "../api/partners/partners.routes";

/**
 * Registers all service-related routes
 * @param app - Express application instance
 */
export function registerServiceRoutes(app: Express): void {
  app.use("/api", serviceRecommendationRoutes);
  app.use("/api", optimizedServicesRoutes);
  app.use("/api", cachedServicesRoutes);
  app.use("/api/quote", quoteRoutes);
  app.use("/api", servicesInlineRoutes);
  app.use("/api/partners", partnersRoutes);
}
