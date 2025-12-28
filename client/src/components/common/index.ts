/**
 * Common Components Index
 * Unified exports for all common/shared components
 */

// UI Building Blocks (from shared/)
export { StatCard } from "./ui/StatCard";
export type { StatCardProps } from "./ui/StatCard";

export { PageShell } from "./ui/PageShell";
export type { PageShellProps, BreadcrumbItem } from "./ui/PageShell";

export { DataGrid } from "./ui/DataGrid";
export type { DataGridProps, ColumnDef } from "./ui/DataGrid";

export { EmptyState } from "./ui/EmptyState";
export type { EmptyStateProps } from "./ui/EmptyState";

export { SearchHeader } from "./ui/SearchHeader";
export type { SearchHeaderProps } from "./ui/SearchHeader";

export { ConfirmDialog } from "./ui/ConfirmDialog";
export type { ConfirmDialogProps } from "./ui/ConfirmDialog";

export { StatusBadge } from "./ui/StatusBadge";
export type { StatusBadgeProps, StatusVariant } from "./ui/StatusBadge";

export { FeatureCard } from "./ui/FeatureCard";
export type { FeatureCardProps, FeatureItem } from "./ui/FeatureCard";

// Status Components
export { default as ConnectionStatus } from "./status/ConnectionStatus";
export { WebSocketFloatingIndicator, WebSocketFullStatus, WebSocketDetailedDashboard } from "./status/WebSocketStatusIndicator";
export { ErrorBoundary } from "./status/ErrorBoundary";

// Session Management
export { default as SessionManager } from "./session/SessionManager";
export { default as LanguageSwitcher } from "./session/LanguageSwitcher";
export { default as NotificationDropdown } from "./session/NotificationDropdown";

// Feature Components
export { default as TokenPriceTicker } from "./features/TokenPriceTicker";
export { default as VoiceInput } from "./features/VoiceInput";
export { default as WhitepaperSection } from "./features/WhitepaperSection";
