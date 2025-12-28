/**
 * Admin API Gateway Middleware
 * Main gateway layer for admin route isolation and future containerization
 * 
 * Features:
 * - Request logging with correlation IDs
 * - Response time tracking
 * - Circuit breaker pattern for downstream services
 * - Request validation layer
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { GATEWAY_CONFIG, getEndpointConfig, getServiceConfig, UpstreamServiceConfig } from './gateway-config';
import { createAdminRateLimitMiddleware, getRateLimiterStats } from './rate-limiter';
import { createAdminSecurityHeaders, generateCorrelationId } from './security-headers';
import { logger } from '../utils/logger';

interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  successCount: number;
}

interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByMethod: Record<string, number>;
}

interface ExtendedRequest extends Request {
  correlationId?: string;
  gatewayStartTime?: number;
  gatewayMetadata?: {
    service: string;
    endpoint: string;
    method: string;
  };
}

class CircuitBreaker {
  private circuits: Map<string, CircuitState> = new Map();
  private readonly config = GATEWAY_CONFIG.circuitBreaker;
  
  getState(serviceName: string): CircuitState {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        failures: 0,
        lastFailure: 0,
        state: 'closed',
        successCount: 0,
      });
    }
    return this.circuits.get(serviceName)!;
  }
  
  recordSuccess(serviceName: string): void {
    const state = this.getState(serviceName);
    
    if (state.state === 'half-open') {
      state.successCount++;
      if (state.successCount >= 3) {
        state.state = 'closed';
        state.failures = 0;
        state.successCount = 0;
        logger.info(`Circuit breaker closed for service: ${serviceName}`);
      }
    } else {
      state.failures = Math.max(0, state.failures - 1);
    }
  }
  
  recordFailure(serviceName: string): void {
    const state = this.getState(serviceName);
    state.failures++;
    state.lastFailure = Date.now();
    state.successCount = 0;
    
    if (state.failures >= this.config.threshold) {
      state.state = 'open';
      logger.warn(`Circuit breaker opened for service: ${serviceName}`, {
        failures: state.failures,
        threshold: this.config.threshold,
      });
    }
  }
  
  canProceed(serviceName: string): boolean {
    if (!this.config.enabled) {
      return true;
    }
    
    const state = this.getState(serviceName);
    
    if (state.state === 'closed') {
      return true;
    }
    
    if (state.state === 'open') {
      const timeSinceFailure = Date.now() - state.lastFailure;
      
      if (timeSinceFailure >= this.config.resetTimeout) {
        state.state = 'half-open';
        logger.info(`Circuit breaker half-open for service: ${serviceName}`);
        return true;
      }
      
      return false;
    }
    
    return true;
  }
  
  getStats(): Record<string, CircuitState> {
    const stats: Record<string, CircuitState> = {};
    for (const [name, state] of this.circuits) {
      stats[name] = { ...state };
    }
    return stats;
  }
}

class GatewayMetricsCollector {
  private metrics: GatewayMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    requestsByEndpoint: {},
    requestsByMethod: {},
  };
  private responseTimes: number[] = [];
  private readonly maxResponseTimeSamples = 1000;
  
  recordRequest(path: string, method: string): void {
    this.metrics.totalRequests++;
    this.metrics.requestsByEndpoint[path] = 
      (this.metrics.requestsByEndpoint[path] || 0) + 1;
    this.metrics.requestsByMethod[method] = 
      (this.metrics.requestsByMethod[method] || 0) + 1;
  }
  
  recordResponse(statusCode: number, responseTime: number): void {
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimeSamples) {
      this.responseTimes.shift();
    }
    
    this.metrics.avgResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }
  
  getMetrics(): GatewayMetrics {
    return { ...this.metrics };
  }
  
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      requestsByEndpoint: {},
      requestsByMethod: {},
    };
    this.responseTimes = [];
  }
}

export const circuitBreaker = new CircuitBreaker();
export const metricsCollector = new GatewayMetricsCollector();

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sensitiveFields = GATEWAY_CONFIG.logging.sensitiveFields;
  const sanitized: any = Array.isArray(body) ? [] : {};
  
  for (const [key, value] of Object.entries(body)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeBody(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export function createRequestLogger(): RequestHandler {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/admin')) {
      return next();
    }
    
    if (!GATEWAY_CONFIG.logging.enabled) {
      return next();
    }
    
    const correlationId = (req as any).correlationId || generateCorrelationId();
    req.correlationId = correlationId;
    req.gatewayStartTime = Date.now();
    
    const user = req.user as { id?: number; role?: string; email?: string } | undefined;
    
    const logData: any = {
      correlationId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: user?.id,
      userRole: user?.role,
      timestamp: new Date().toISOString(),
    };
    
    if (GATEWAY_CONFIG.logging.includeBody && req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = sanitizeBody(req.body);
      const bodyStr = JSON.stringify(sanitizedBody);
      logData.body = bodyStr.length > GATEWAY_CONFIG.logging.maxBodyLength
        ? bodyStr.substring(0, GATEWAY_CONFIG.logging.maxBodyLength) + '...'
        : sanitizedBody;
    }
    
    logger.info('Admin Gateway Request', logData);
    
    metricsCollector.recordRequest(req.path, req.method);
    
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      const responseTime = Date.now() - (req.gatewayStartTime || Date.now());
      
      metricsCollector.recordResponse(res.statusCode, responseTime);
      
      logger.info('Admin Gateway Response', {
        correlationId,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        path: req.path,
        method: req.method,
      });
      
      return originalJson(body);
    };
    
    next();
  };
}

export function createResponseTimeTracker(): RequestHandler {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/admin')) {
      return next();
    }
    
    const startTime = process.hrtime.bigint();
    
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const responseTimeNs = endTime - startTime;
      const responseTimeMs = Number(responseTimeNs) / 1_000_000;
      
      res.setHeader('X-Response-Time', `${responseTimeMs.toFixed(2)}ms`);
      res.setHeader('Server-Timing', `total;dur=${responseTimeMs.toFixed(2)}`);
    });
    
    next();
  };
}

export function createCircuitBreakerMiddleware(): RequestHandler {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/admin')) {
      return next();
    }
    
    const endpointConfig = getEndpointConfig(req.path);
    if (!endpointConfig) {
      return next();
    }
    
    const serviceName = endpointConfig.service;
    const serviceConfig = getServiceConfig(serviceName);
    
    if (!circuitBreaker.canProceed(serviceName)) {
      logger.warn('Circuit breaker preventing request', {
        service: serviceName,
        path: req.path,
        correlationId: req.correlationId,
      });
      
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'The admin service is temporarily unavailable. Please try again later.',
        code: 'CIRCUIT_BREAKER_OPEN',
        retryAfter: Math.ceil(GATEWAY_CONFIG.circuitBreaker.resetTimeout / 1000),
      });
    }
    
    req.gatewayMetadata = {
      service: serviceName,
      endpoint: endpointConfig.path,
      method: req.method,
    };
    
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      if (res.statusCode >= 500) {
        circuitBreaker.recordFailure(serviceName);
      } else {
        circuitBreaker.recordSuccess(serviceName);
      }
      return originalJson(body);
    };
    
    next();
  };
}

export function createRequestValidator(): RequestHandler {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/admin')) {
      return next();
    }
    
    if (!req.headers['content-type'] && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && Object.keys(req.body).length > 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Content-Type header is required for requests with body',
          code: 'MISSING_CONTENT_TYPE',
        });
      }
    }
    
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data') &&
        !contentType.includes('application/x-www-form-urlencoded')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Only JSON, form-data, and URL-encoded content types are supported',
        code: 'UNSUPPORTED_CONTENT_TYPE',
      });
    }
    
    const maxBodySize = 10 * 1024 * 1024;
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBodySize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'Request body exceeds maximum allowed size',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: maxBodySize,
      });
    }
    
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];
    
    const checkForDangerousContent = (obj: any): boolean => {
      if (typeof obj === 'string') {
        return dangerousPatterns.some(pattern => pattern.test(obj));
      }
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).some(checkForDangerousContent);
      }
      return false;
    };
    
    if (req.body && checkForDangerousContent(req.body)) {
      logger.warn('Potentially malicious content detected', {
        correlationId: req.correlationId,
        path: req.path,
        ip: req.ip,
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request contains potentially malicious content',
        code: 'MALICIOUS_CONTENT_DETECTED',
      });
    }
    
    next();
  };
}

export function createAdminGateway(): RequestHandler[] {
  return [
    createAdminSecurityHeaders(),
    createAdminRateLimitMiddleware(),
    createRequestLogger(),
    createResponseTimeTracker(),
    createCircuitBreakerMiddleware(),
    createRequestValidator(),
  ];
}

export function getGatewayStatus(): {
  healthy: boolean;
  version: string;
  environment: string;
  metrics: GatewayMetrics;
  rateLimiter: { totalEntries: number; activeEntries: number };
  circuitBreakers: Record<string, CircuitState>;
} {
  return {
    healthy: true,
    version: GATEWAY_CONFIG.version,
    environment: GATEWAY_CONFIG.environment,
    metrics: metricsCollector.getMetrics(),
    rateLimiter: getRateLimiterStats(),
    circuitBreakers: circuitBreaker.getStats(),
  };
}

export function resetGatewayMetrics(): void {
  metricsCollector.reset();
}
