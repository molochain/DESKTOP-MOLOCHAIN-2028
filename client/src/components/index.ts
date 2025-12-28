/**
 * Components Index
 * Organized exports for commonly used components
 */

// Layout components
export { default as Layout } from './layout/Layout';
export { default as Navigation } from './layout/Navigation';
export { default as Footer } from './layout/Footer';
export { default as Hero } from './layout/Hero';

// Form components
export { default as QuoteForm } from './services/QuoteForm';

// Status components
export { default as ConnectionStatus } from './common/status/ConnectionStatus';
export { WebSocketFloatingIndicator, WebSocketFullStatus, WebSocketDetailedDashboard } from './common/status/WebSocketStatusIndicator';
export { ErrorBoundary } from './common/status/ErrorBoundary';

// Session management
export { default as SessionManager } from './common/session/SessionManager';
export { default as LanguageSwitcher } from './common/session/LanguageSwitcher';
export { default as NotificationDropdown } from './common/session/NotificationDropdown';

// Feature components
export { default as ServiceCard } from './services/ServiceCard';
export { default as TokenPriceTicker } from './common/features/TokenPriceTicker';
export { default as VoiceInput } from './common/features/VoiceInput';
export { default as WhitepaperSection } from './common/features/WhitepaperSection';

// Re-export all common components
export * from './common';

// CMS components
export { default as CMSPage } from './cms/CMSPage';

// AI/Rayanava components
export { RayanavaChat } from './rayanava/RayanavaChat';
export { RayanavaContentGenerator } from './rayanava/RayanavaContentGenerator';
export { RayanavaAdvancedFeatures } from './rayanava/RayanavaAdvancedFeatures';

// Re-export from subdirectories
export * from './ai';
