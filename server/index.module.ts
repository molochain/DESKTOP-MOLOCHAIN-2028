/**
 * MoloChain Server Module Index
 * Central registry for all server-side modules and services
 */

// Core Modules
export * from './core';
export * from './db';
export * from './routes';

// AI & Automation
export * from './ai/rayanava/logic-engine';
export * from './ai/rayanava/memory-manager';

// API Endpoints
export * from './api/commodities';
export * from './api/guides';
export * from './api/instagram';
export * from './api/marketplace';
export * from './api/transport';

// Services
export * from './services/ai-service';
export * from './services/auth-service';
// Cache service now unified in core/cache/cache.service
export * from './services/content-generation';
export * from './services/database-service';
export * from './services/email-service';
export * from './services/health-service';
export * from './services/instagram-service';
export * from './services/notification-service';
export * from './services/sales-automation';
export * from './services/sms-service';
export * from './services/websocket-service';

// Middleware
export * from './middleware/auth';
export * from './middleware/cors';
export * from './middleware/error-handler';
export * from './middleware/performance';
export * from './middleware/rate-limiter';
export * from './middleware/security';
export * from './middleware/validation';

// Integrations
export * from './integrations/tracking/TrackingManager';
export * from './integrations/tracking/types';

// Performance & Monitoring
export * from './performance/cache';
export * from './performance/monitoring';
export * from './performance/optimization';

// Utilities
export * from './utils/crypto';
export * from './utils/date';
export * from './utils/logger';
export * from './utils/validation';

// Types & Interfaces
export * from './types';

/**
 * Module Configuration
 */
export const ServerModules = {
  // Core Configuration
  core: {
    name: 'Core Server',
    version: '2.0.0',
    status: 'active',
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // AI Configuration
  ai: {
    rayanava: {
      enabled: true,
      version: '1.0.0',
      endpoints: 9,
      model: 'gpt-4'
    }
  },
  
  // Database Configuration
  database: {
    type: 'PostgreSQL',
    provider: 'Neon',
    tables: 70,
    optimized: true
  },
  
  // WebSocket Configuration
  websocket: {
    enabled: true,
    services: 8,
    manager: 'UnifiedWebSocketManager'
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    type: 'multi-layer',
    ttl: 3600,
    optimized: true
  },
  
  // Security Configuration
  security: {
    jwt: true,
    twoFactor: true,
    rbac: true,
    encryption: 'AES-256',
    cors: true,
    helmet: true
  },
  
  // Monitoring Configuration
  monitoring: {
    health: true,
    metrics: true,
    logging: true,
    analytics: true
  }
};

/**
 * Module Initialization Order
 */
export const InitializationOrder = [
  'database',
  'cache',
  'authentication',
  'middleware',
  'services',
  'ai',
  'websocket',
  'routes',
  'monitoring'
];

/**
 * Module Dependencies
 */
export const ModuleDependencies = {
  ai: ['database', 'cache', 'authentication'],
  websocket: ['authentication', 'database'],
  services: ['database', 'cache'],
  routes: ['services', 'middleware', 'authentication'],
  monitoring: ['database', 'cache']
};

/**
 * Export main server configuration
 */
export default {
  modules: ServerModules,
  initOrder: InitializationOrder,
  dependencies: ModuleDependencies
};