/**
 * API Gateway Configuration
 * Environment-based configuration for the admin gateway layer
 * Prepares for future microservice architecture and containerization
 */

export interface GatewayConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  
  rateLimit: {
    windowMs: number;
    defaultMax: number;
    superAdminMax: number;
    adminMax: number;
    burstProtection: {
      enabled: boolean;
      sensitiveEndpoints: string[];
      maxBurst: number;
    };
  };
  
  circuitBreaker: {
    enabled: boolean;
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
  
  logging: {
    enabled: boolean;
    includeBody: boolean;
    maxBodyLength: number;
    sensitiveFields: string[];
  };
  
  security: {
    strictCSP: boolean;
    requireCorrelationId: boolean;
    validateSignatures: boolean;
  };
  
  upstream: UpstreamServiceConfig;
}

export interface UpstreamServiceConfig {
  adminService: ServiceEndpoint;
  authService: ServiceEndpoint;
  analyticsService: ServiceEndpoint;
  auditService: ServiceEndpoint;
  securityService: ServiceEndpoint;
  contentService: ServiceEndpoint;
  operationsService: ServiceEndpoint;
}

export interface ServiceEndpoint {
  name: string;
  baseUrl: string;
  healthCheck: string;
  timeout: number;
  retries: number;
  enabled: boolean;
}

export interface AdminEndpointCatalog {
  [key: string]: EndpointDefinition;
}

export interface EndpointDefinition {
  path: string;
  methods: string[];
  service: keyof UpstreamServiceConfig;
  rateLimit?: 'high' | 'standard' | 'low';
  sensitive?: boolean;
  requiredPermissions?: string[];
}

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';

const baseServiceUrl = process.env.INTERNAL_SERVICE_URL || 'http://localhost:5000';

export const GATEWAY_CONFIG: GatewayConfig = {
  version: '1.0.0',
  environment: isProduction ? 'production' : isStaging ? 'staging' : 'development',
  
  rateLimit: {
    windowMs: isProduction ? 60 * 1000 : 15 * 60 * 1000,
    defaultMax: isProduction ? 100 : 1000,
    superAdminMax: isProduction ? 500 : 5000,
    adminMax: isProduction ? 200 : 2000,
    burstProtection: {
      enabled: true,
      sensitiveEndpoints: [
        '/api/admin/users',
        '/api/admin/security',
        '/api/admin/settings',
        '/api/admin/audit',
        '/api/admin/system',
      ],
      maxBurst: isProduction ? 10 : 50,
    },
  },
  
  circuitBreaker: {
    enabled: isProduction,
    threshold: 5,
    timeout: 30000,
    resetTimeout: 60000,
  },
  
  logging: {
    enabled: true,
    includeBody: !isProduction,
    maxBodyLength: 1000,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'apiKey',
      'accessToken',
      'refreshToken',
      'twoFactorSecret',
      'recoveryCodes',
      'creditCard',
      'ssn',
    ],
  },
  
  security: {
    strictCSP: isProduction,
    requireCorrelationId: true,
    validateSignatures: isProduction,
  },
  
  upstream: {
    adminService: {
      name: 'admin-service',
      baseUrl: process.env.ADMIN_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 30000,
      retries: 3,
      enabled: true,
    },
    authService: {
      name: 'auth-service',
      baseUrl: process.env.AUTH_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 10000,
      retries: 2,
      enabled: true,
    },
    analyticsService: {
      name: 'analytics-service',
      baseUrl: process.env.ANALYTICS_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 60000,
      retries: 1,
      enabled: true,
    },
    auditService: {
      name: 'audit-service',
      baseUrl: process.env.AUDIT_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 30000,
      retries: 3,
      enabled: true,
    },
    securityService: {
      name: 'security-service',
      baseUrl: process.env.SECURITY_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 15000,
      retries: 2,
      enabled: true,
    },
    contentService: {
      name: 'content-service',
      baseUrl: process.env.CONTENT_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 30000,
      retries: 2,
      enabled: true,
    },
    operationsService: {
      name: 'operations-service',
      baseUrl: process.env.OPERATIONS_SERVICE_URL || baseServiceUrl,
      healthCheck: '/health',
      timeout: 45000,
      retries: 2,
      enabled: true,
    },
  },
};

export const ADMIN_ENDPOINTS_CATALOG: AdminEndpointCatalog = {
  users: {
    path: '/api/admin/users',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    service: 'adminService',
    rateLimit: 'standard',
    sensitive: true,
    requiredPermissions: ['users.view', 'users.manage'],
  },
  security: {
    path: '/api/admin/security',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    service: 'securityService',
    rateLimit: 'low',
    sensitive: true,
    requiredPermissions: ['security.view', 'security.manage'],
  },
  auditLogs: {
    path: '/api/admin/audit-logs',
    methods: ['GET'],
    service: 'auditService',
    rateLimit: 'standard',
    sensitive: false,
    requiredPermissions: ['audit.view'],
  },
  settings: {
    path: '/api/admin/settings',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    service: 'adminService',
    rateLimit: 'low',
    sensitive: true,
    requiredPermissions: ['settings.view', 'settings.manage'],
  },
  branding: {
    path: '/api/admin/branding',
    methods: ['GET', 'PUT', 'PATCH'],
    service: 'adminService',
    rateLimit: 'low',
    sensitive: false,
    requiredPermissions: ['settings.manage'],
  },
  memory: {
    path: '/api/admin/memory',
    methods: ['GET', 'POST'],
    service: 'adminService',
    rateLimit: 'low',
    sensitive: true,
    requiredPermissions: ['infrastructure.view', 'infrastructure.manage'],
  },
  trackingProviders: {
    path: '/api/admin/tracking-providers',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    service: 'operationsService',
    rateLimit: 'standard',
    sensitive: false,
    requiredPermissions: ['operations.view', 'operations.manage'],
  },
  contentMedia: {
    path: '/api/admin/content/media',
    methods: ['GET', 'POST', 'DELETE'],
    service: 'contentService',
    rateLimit: 'standard',
    sensitive: false,
    requiredPermissions: ['content.view', 'content.manage'],
  },
  email: {
    path: '/api/admin/email',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    service: 'adminService',
    rateLimit: 'low',
    sensitive: true,
    requiredPermissions: ['settings.manage'],
  },
  submissions: {
    path: '/api/admin/submissions',
    methods: ['GET', 'PATCH', 'DELETE'],
    service: 'contentService',
    rateLimit: 'standard',
    sensitive: false,
    requiredPermissions: ['content.view'],
  },
  analytics: {
    path: '/api/admin/analytics',
    methods: ['GET'],
    service: 'analyticsService',
    rateLimit: 'high',
    sensitive: false,
    requiredPermissions: ['analytics.view'],
  },
  content: {
    path: '/api/admin/content',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    service: 'contentService',
    rateLimit: 'standard',
    sensitive: false,
    requiredPermissions: ['content.view', 'content.manage'],
  },
  operations: {
    path: '/api/admin/operations',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    service: 'operationsService',
    rateLimit: 'standard',
    sensitive: false,
    requiredPermissions: ['operations.view', 'operations.manage'],
  },
  dashboard: {
    path: '/api/admin/dashboard',
    methods: ['GET'],
    service: 'adminService',
    rateLimit: 'high',
    sensitive: false,
    requiredPermissions: ['dashboard.access'],
  },
  cacheStats: {
    path: '/api/admin/cache',
    methods: ['GET', 'POST'],
    service: 'adminService',
    rateLimit: 'low',
    sensitive: true,
    requiredPermissions: ['infrastructure.view', 'infrastructure.manage'],
  },
  stats: {
    path: '/api/admin/stats',
    methods: ['GET'],
    service: 'adminService',
    rateLimit: 'high',
    sensitive: false,
    requiredPermissions: ['dashboard.view'],
  },
  health: {
    path: '/api/admin/health',
    methods: ['GET'],
    service: 'adminService',
    rateLimit: 'high',
    sensitive: false,
    requiredPermissions: ['infrastructure.view'],
  },
  system: {
    path: '/api/admin/system',
    methods: ['GET', 'POST', 'PUT'],
    service: 'adminService',
    rateLimit: 'low',
    sensitive: true,
    requiredPermissions: ['system.admin'],
  },
};

export function getEndpointConfig(path: string): EndpointDefinition | null {
  for (const [key, config] of Object.entries(ADMIN_ENDPOINTS_CATALOG)) {
    if (path.startsWith(config.path)) {
      return config;
    }
  }
  return null;
}

export function getServiceConfig(serviceName: keyof UpstreamServiceConfig): ServiceEndpoint {
  return GATEWAY_CONFIG.upstream[serviceName];
}

export function isProductionMode(): boolean {
  return GATEWAY_CONFIG.environment === 'production';
}

export function getGatewayVersion(): string {
  return GATEWAY_CONFIG.version;
}
