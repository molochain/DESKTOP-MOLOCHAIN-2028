/**
 * Domain Registrars Index
 * Central export for all route domain registrars
 * 
 * Usage in routes.ts:
 *   import { 
 *     registerServiceRoutes, 
 *     registerAdminRoutes, 
 *     registerCollaborationRoutes,
 *     registerAnalyticsRoutes,
 *     registerSecurityRoutes,
 *     registerEcosystemRoutes
 *   } from './registrars';
 *   
 *   registerServiceRoutes(app);
 *   registerAdminRoutes(app);
 *   registerCollaborationRoutes(app);
 *   registerAnalyticsRoutes(app);
 *   registerSecurityRoutes(app);
 *   registerEcosystemRoutes(app);
 */

export { registerServiceRoutes } from "./services.registrar";
export { registerAdminRoutes } from "./admin.registrar";
export { registerCollaborationRoutes } from "./collaboration.registrar";
export { registerAnalyticsRoutes } from "./analytics.registrar";
export { registerSecurityRoutes } from "./security.registrar";
export { registerEcosystemRoutes } from "./ecosystem.registrar";
