/**
 * Admin Pages Index
 * Organized exports for all admin pages
 * Updated: December 27, 2025 - Removed unused control center pages
 */

// Entry Point
export { default as AdminLandingPage } from "./AdminLandingPage";

// Dashboards & Monitoring
export { default as SystemDashboard } from "./dashboards/SystemDashboard";
export { default as PerformanceMonitor } from "./dashboards/PerformanceMonitor";
export { default as HealthMonitoringDashboard } from "./dashboards/HealthMonitoringDashboard";
export { default as WebSocketHealth } from "./dashboards/WebSocketHealth";

// Security & Access
export { default as IdentitySecurityDashboard } from "./security/IdentitySecurityDashboard";
export { default as SecuritySettings } from "./security/SecuritySettings";
export { default as AdminActivityDashboard } from "./security/AdminActivityDashboard";

// Management
export { default as UserManagement } from "./management/UserManagement";
export { default as PageModuleManager } from "./management/PageModuleManager";

// Operations
export { default as Activity } from "./operations/Activity";
export { default as CommunicationsHub } from "./operations/CommunicationsHub";
export { default as TrackingProviders } from "./operations/TrackingProviders";

// Intelligence
export { default as TranslationSuggestions } from "./intelligence/translation-suggestions";

// Settings
export { default as AdminSettings } from "./settings/AdminSettings";
export { default as StorageSettings } from "./settings/StorageSettings";

// Content Management
export { default as ContentManager } from "./content/ContentManager";
export { default as AboutEditor } from "./content/AboutEditor";
export { default as ServicesEditor } from "./content/ServicesEditor";
export { default as BrandingEditor } from "./content/BrandingEditor";
