/**
 * Admin Domain Registrar
 * Consolidates all admin-related route registrations
 * 
 * Routes consolidated:
 * - adminUsersRoutes: User management endpoints
 * - adminSecurityRoutes: Security configuration and monitoring
 * - memoryOptimizationRoutes: Memory and performance optimization
 * - trackingProvidersRoutes: Tracking provider management
 * - mediaRoutes: Media/content management (requires multer middleware)
 * - settingsRoutes: Application settings management
 * - brandingRoutes: Branding and customization settings
 * 
 * SECURITY: Authentication middleware (isAuthenticated, isAdmin) MUST be applied
 * BEFORE calling this registrar. This is done in routes.ts via:
 * 
 *   app.use("/api/admin/*", isAuthenticated, isAdmin);
 *   registerAdminRoutes(app, ...);
 * 
 * The wildcard middleware protects ALL routes registered by this function.
 * DO NOT move the registerAdminRoutes() call before the wildcard middleware.
 */

import type { Express, RequestHandler } from "express";
import adminUsersRoutes from "../api/admin/admin-users";
import adminSecurityRoutes from "../api/admin/admin-security";
import memoryOptimizationRoutes from "../routes/admin/memory-optimization";
import trackingProvidersRoutes from "../api/tracking/tracking-providers";
import mediaRoutes from "../routes/media";
import settingsRoutes from "../routes/settings";
import brandingRoutes from "../routes/branding";
import systemRoutes from "../routes/admin/system.routes";
import emailStatsRoutes from "../routes/admin/email-stats.routes";
import auditLogsRoutes from "../routes/admin/audit-logs";

/**
 * Registers all admin-related routes
 * @param app - Express application instance
 * @param uploadMiddleware - Optional multer middleware for media upload routes
 */
export function registerAdminRoutes(app: Express, uploadMiddleware?: RequestHandler): void {
  app.use("/api/admin/users", adminUsersRoutes);
  app.use("/api/admin/security", adminSecurityRoutes);
  app.use("/api/admin/memory", memoryOptimizationRoutes);
  app.use("/api/admin/tracking-providers", trackingProvidersRoutes);
  if (uploadMiddleware) {
    app.use("/api/admin/content/media", uploadMiddleware, mediaRoutes);
  } else {
    app.use("/api/admin/content/media", mediaRoutes);
  }
  app.use("/api/admin/settings", settingsRoutes);
  app.use("/api/admin/branding", brandingRoutes);
  app.use("/api/admin/email", emailStatsRoutes);
  app.use("/api/admin/audit-logs", auditLogsRoutes);
  app.use("/api/admin", systemRoutes);
}
