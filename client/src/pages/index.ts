// Main page exports - organized by directory
// For detailed exports, import directly from subdirectory barrel files

// General pages (most commonly used)
export { Home, About, Contact, Partners, NotFound, Settings, Ecosystem } from "./general";

// Auth pages
export { Login, Register } from "./auth";

// Dashboard pages
export { MainDashboard, TrackingDashboard, PerformanceDashboard } from "./dashboard";

// Services pages
export { Services, ServicesHub, ServiceRecommender } from "./services";

// Developer pages
export { DeveloperPortal, DeveloperWorkspace, DeveloperDepartment } from "./developer";

// Profile pages
export { UserProfile, AdminProfile } from "./profile";

// Admin pages
export { SystemDashboard, UserManagement } from "./admin";

// Note: Removed exports (December 27, 2025):
// - Supply Chain (SupplyChainHeatmap) - available in separate OTMS service
// - AI pages (AIHub, Rayanava, RayanavaAnalytics) - available via Rayanava Docker agent
