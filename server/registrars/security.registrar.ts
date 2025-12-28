/**
 * Security Domain Registrar
 * Consolidates all security-related route registrations
 * 
 * Routes consolidated:
 * - twoFactorAuthRoutes: Two-factor authentication endpoints
 * - identitySecurityManagementRoutes: Identity and security management
 * - incidentManagementRoutes: Security incident tracking and management
 * - securityWidgetsRoutes: Security dashboard widgets and metrics
 * - notificationsRoutes: Security notifications and alerts
 */

import type { Express } from "express";
import twoFactorAuthRoutes from "../api/auth/two-factor-auth";
import identitySecurityManagementRoutes from "../api/identity-security-management";
import incidentManagementRoutes from "../api/incident-management";
import securityWidgetsRoutes from "../api/security-widgets";
import notificationsRoutes from "../api/notifications";

/**
 * Registers all security-related routes
 * @param app - Express application instance
 */
export function registerSecurityRoutes(app: Express): void {
  app.use("/api/auth", twoFactorAuthRoutes);
  app.use("/api", identitySecurityManagementRoutes);
  app.use("/api", incidentManagementRoutes);
  app.use("/api", securityWidgetsRoutes);
  app.use("/api", notificationsRoutes);
}
