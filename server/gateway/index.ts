/**
 * Admin API Gateway
 * Central export point for gateway components
 * 
 * This module provides a complete API gateway layer for admin routes,
 * preparing the system for future containerization and microservice architecture.
 */

export {
  GATEWAY_CONFIG,
  ADMIN_ENDPOINTS_CATALOG,
  getEndpointConfig,
  getServiceConfig,
  isProductionMode,
  getGatewayVersion,
  type GatewayConfig,
  type UpstreamServiceConfig,
  type ServiceEndpoint,
  type AdminEndpointCatalog,
  type EndpointDefinition,
} from './gateway-config';

export {
  adminRateLimiter,
  createAdminRateLimitMiddleware,
  createEndpointSpecificRateLimiter,
  getRateLimiterStats,
} from './rate-limiter';

export {
  generateCorrelationId,
  getAdminCSPDirectives,
  buildCSPString,
  createAdminSecurityHeaders,
  createAdminResponseHeaders,
  getSecurityHeadersForPath,
  type SecurityHeadersConfig,
} from './security-headers';

export {
  circuitBreaker,
  metricsCollector,
  createRequestLogger,
  createResponseTimeTracker,
  createCircuitBreakerMiddleware,
  createRequestValidator,
  createAdminGateway,
  getGatewayStatus,
  resetGatewayMetrics,
} from './admin-gateway';
