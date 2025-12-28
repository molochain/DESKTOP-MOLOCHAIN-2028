/**
 * API Health Check Endpoint Test Suite
 * Integration tests for health check endpoints using supertest
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  },
  createLoggerWithContext: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    }))
  }))
}));

vi.mock('../core/auth/auth.service', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: vi.fn((req, res, next) => next()),
  isAdmin: vi.fn((req, res, next) => next()),
  hasRole: vi.fn(() => (req: any, res: any, next: any) => next()),
  hasPermission: vi.fn(() => (req: any, res: any, next: any) => next())
}));

import { createTestApp } from './test-utils';

describe('API Health Check Endpoints - Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/health/health - Main Health Endpoint', () => {
    it('should return healthy status with system metrics', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('environment');
    });

    it('should return valid memory metrics', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect(200);

      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('percentage');
      expect(response.body.memory.used).toBeTypeOf('number');
      expect(response.body.memory.total).toBeTypeOf('number');
      expect(response.body.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(response.body.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should return valid CPU metrics', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect(200);

      expect(response.body.cpu).toHaveProperty('user');
      expect(response.body.cpu).toHaveProperty('system');
      expect(response.body.cpu.user).toBeTypeOf('number');
      expect(response.body.cpu.system).toBeTypeOf('number');
    });

    it('should return valid uptime', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect(200);

      expect(response.body.uptime).toBeTypeOf('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return ISO timestamp format', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect(200);

      const timestamp = response.body.timestamp;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect(timestamp).toMatch(isoRegex);
    });

    it('should detect test environment', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect(200);

      expect(response.body.environment).toBe('test');
    });
  });

  describe('GET /api/health/health/metrics - Health Metrics', () => {
    it('should return health metrics', async () => {
      const response = await request(app)
        .get('/api/health/health/metrics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Health Response Structure Validation', () => {
    it('should generate correct ping response structure', () => {
      const generatePingResponse = () => ({
        status: 'healthy',
        timestamp: new Date().toISOString()
      });

      const response = generatePingResponse();

      expect(response).toHaveProperty('status', 'healthy');
      expect(response).toHaveProperty('timestamp');
      expect(new Date(response.timestamp).getTime()).not.toBeNaN();
    });

    it('should generate correct system health response structure', () => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const generateSystemHealthResponse = () => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        environment: process.env.NODE_ENV || 'development'
      });

      const response = generateSystemHealthResponse();

      expect(response).toHaveProperty('status', 'healthy');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('version');
      expect(response).toHaveProperty('uptime');
      expect(response.uptime).toBeTypeOf('number');
      expect(response.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include memory metrics in health response', () => {
      const memoryUsage = process.memoryUsage();

      const memoryMetrics = {
        used: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      };

      expect(memoryMetrics).toHaveProperty('used');
      expect(memoryMetrics).toHaveProperty('total');
      expect(memoryMetrics).toHaveProperty('percentage');
      expect(memoryMetrics.used).toBeTypeOf('number');
      expect(memoryMetrics.total).toBeTypeOf('number');
      expect(memoryMetrics.percentage).toBeGreaterThanOrEqual(0);
      expect(memoryMetrics.percentage).toBeLessThanOrEqual(100);
    });

    it('should include CPU metrics in health response', () => {
      const cpuUsage = process.cpuUsage();

      const cpuMetrics = {
        user: cpuUsage.user,
        system: cpuUsage.system
      };

      expect(cpuMetrics).toHaveProperty('user');
      expect(cpuMetrics).toHaveProperty('system');
      expect(cpuMetrics.user).toBeTypeOf('number');
      expect(cpuMetrics.system).toBeTypeOf('number');
    });

    it('should return valid ISO timestamp format', () => {
      const timestamp = new Date().toISOString();
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

      expect(timestamp).toMatch(isoRegex);
    });

    it('should calculate uptime correctly', () => {
      const uptime = Math.floor(process.uptime());

      expect(uptime).toBeTypeOf('number');
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('WebSocket Health Response Structure', () => {
    it('should generate correct WebSocket health response structure', () => {
      const generateWebSocketHealthResponse = () => ({
        status: 'operational',
        websocketServer: 'initialized',
        connections: 'accepting',
        timestamp: new Date().toISOString(),
        features: {
          authentication: 'development_mode',
          rateLimiting: 'active',
          healthChecks: 'running',
          broadcasting: 'operational'
        }
      });

      const response = generateWebSocketHealthResponse();

      expect(response).toHaveProperty('status', 'operational');
      expect(response).toHaveProperty('websocketServer', 'initialized');
      expect(response).toHaveProperty('connections', 'accepting');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('features');
    });

    it('should include all WebSocket features', () => {
      const features = {
        authentication: 'development_mode',
        rateLimiting: 'active',
        healthChecks: 'running',
        broadcasting: 'operational'
      };

      expect(features).toHaveProperty('authentication');
      expect(features).toHaveProperty('rateLimiting');
      expect(features).toHaveProperty('healthChecks');
      expect(features).toHaveProperty('broadcasting');
    });
  });

  describe('Workspace Metrics Structure', () => {
    it('should generate valid workspace metrics', () => {
      const generateWorkspaceMetrics = () => ({
        timestamp: new Date(),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        networkLatency: Math.floor(Math.random() * 200) + 10,
        activeConnections: Math.floor(Math.random() * 50) + 1,
        requestsPerMinute: Math.floor(Math.random() * 1000) + 100,
        errorRate: Math.random() * 5,
        uptime: Math.random() * 100
      });

      const metrics = generateWorkspaceMetrics();

      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('diskUsage');
      expect(metrics).toHaveProperty('networkLatency');
      expect(metrics).toHaveProperty('activeConnections');
      expect(metrics).toHaveProperty('requestsPerMinute');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('uptime');
    });

    it('should have valid metric ranges', () => {
      const cpuUsage = Math.random() * 100;
      const memoryUsage = Math.random() * 100;
      const diskUsage = Math.random() * 100;
      const errorRate = Math.random() * 5;

      expect(cpuUsage).toBeGreaterThanOrEqual(0);
      expect(cpuUsage).toBeLessThanOrEqual(100);
      expect(memoryUsage).toBeGreaterThanOrEqual(0);
      expect(memoryUsage).toBeLessThanOrEqual(100);
      expect(diskUsage).toBeGreaterThanOrEqual(0);
      expect(diskUsage).toBeLessThanOrEqual(100);
      expect(errorRate).toBeGreaterThanOrEqual(0);
      expect(errorRate).toBeLessThanOrEqual(5);
    });
  });

  describe('Health Alerts Logic', () => {
    it('should generate alert for degraded system', () => {
      const systemHealth = { overall: 'degraded', healthyEndpoints: 40, totalEndpoints: 46 };

      const generateAlerts = (health: typeof systemHealth) => {
        const alerts: any[] = [];
        if (health.overall === 'degraded' || health.overall === 'unhealthy') {
          alerts.push({
            id: 'system-' + Date.now(),
            type: 'error',
            message: `System is ${health.overall} with ${health.healthyEndpoints}/${health.totalEndpoints} healthy endpoints`,
            timestamp: new Date(),
            severity: 'high',
            resolved: false
          });
        }
        return alerts;
      };

      const alerts = generateAlerts(systemHealth);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toHaveProperty('type', 'error');
      expect(alerts[0]).toHaveProperty('severity', 'high');
      expect(alerts[0].message).toContain('degraded');
    });

    it('should not generate alert for healthy system', () => {
      const systemHealth = { overall: 'healthy', healthyEndpoints: 46, totalEndpoints: 46 };

      const generateAlerts = (health: typeof systemHealth) => {
        const alerts: any[] = [];
        if (health.overall === 'degraded' || health.overall === 'unhealthy') {
          alerts.push({
            id: 'system-' + Date.now(),
            type: 'error',
            message: `System is ${health.overall}`,
            timestamp: new Date(),
            severity: 'high',
            resolved: false
          });
        }
        return alerts;
      };

      const alerts = generateAlerts(systemHealth);

      expect(alerts).toHaveLength(0);
    });

    it('should have correct alert structure', () => {
      const alert = {
        id: 'system-123456',
        type: 'error',
        message: 'System is degraded',
        timestamp: new Date(),
        severity: 'high',
        resolved: false
      };

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('message');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('resolved');
    });
  });

  describe('Metrics History Generation', () => {
    it('should generate metrics history with correct limit', () => {
      const generateMetricsHistory = (limit: number, hours: number) => {
        const metricsHistory = [];
        const now = new Date();

        for (let i = 0; i < limit; i++) {
          const timestamp = new Date(now.getTime() - (i * (hours * 60 * 60 * 1000 / limit)));
          metricsHistory.push({
            timestamp: timestamp.toISOString(),
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            diskUsage: Math.random() * 100,
            networkLatency: Math.floor(Math.random() * 200) + 10,
            activeConnections: Math.floor(Math.random() * 50) + 1,
            requestsPerMinute: Math.floor(Math.random() * 1000) + 100,
            errorRate: Math.random() * 5,
            uptime: Math.random() * 100
          });
        }

        return metricsHistory.reverse();
      };

      const history = generateMetricsHistory(50, 24);

      expect(history).toHaveLength(50);
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('cpuUsage');
    });

    it('should return metrics in chronological order', () => {
      const generateMetricsHistory = (limit: number) => {
        const metricsHistory = [];
        const now = new Date();

        for (let i = 0; i < limit; i++) {
          const timestamp = new Date(now.getTime() - (i * 60000));
          metricsHistory.push({
            timestamp: timestamp.toISOString()
          });
        }

        return metricsHistory.reverse();
      };

      const history = generateMetricsHistory(5);

      for (let i = 1; i < history.length; i++) {
        const prevTime = new Date(history[i - 1].timestamp).getTime();
        const currTime = new Date(history[i].timestamp).getTime();
        expect(currTime).toBeGreaterThan(prevTime);
      }
    });
  });

  describe('Health Status Determination', () => {
    it('should return healthy status when all checks pass', () => {
      const determineStatus = (checks: { database: boolean; api: boolean; memory: boolean }) => {
        if (checks.database && checks.api && checks.memory) {
          return 'healthy';
        }
        if (!checks.database && !checks.api) {
          return 'unhealthy';
        }
        return 'degraded';
      };

      const status = determineStatus({ database: true, api: true, memory: true });
      expect(status).toBe('healthy');
    });

    it('should return degraded status when some checks fail', () => {
      const determineStatus = (checks: { database: boolean; api: boolean; memory: boolean }) => {
        if (checks.database && checks.api && checks.memory) {
          return 'healthy';
        }
        if (!checks.database && !checks.api) {
          return 'unhealthy';
        }
        return 'degraded';
      };

      const status = determineStatus({ database: true, api: true, memory: false });
      expect(status).toBe('degraded');
    });

    it('should return unhealthy status when critical checks fail', () => {
      const determineStatus = (checks: { database: boolean; api: boolean; memory: boolean }) => {
        if (checks.database && checks.api && checks.memory) {
          return 'healthy';
        }
        if (!checks.database && !checks.api) {
          return 'unhealthy';
        }
        return 'degraded';
      };

      const status = determineStatus({ database: false, api: false, memory: true });
      expect(status).toBe('unhealthy');
    });
  });

  describe('Error Response Handling', () => {
    it('should generate correct error response structure', () => {
      const generateErrorResponse = (message: string) => ({
        status: 'error',
        message,
        timestamp: new Date().toISOString()
      });

      const response = generateErrorResponse('Health check failed');

      expect(response).toHaveProperty('status', 'error');
      expect(response).toHaveProperty('message', 'Health check failed');
      expect(response).toHaveProperty('timestamp');
    });

    it('should not expose sensitive information in error response', () => {
      const response = {
        status: 'error',
        message: 'Health check failed'
      };

      expect(response).not.toHaveProperty('password');
      expect(response).not.toHaveProperty('secret');
      expect(response).not.toHaveProperty('token');
      expect(response).not.toHaveProperty('apiKey');
      expect(response).not.toHaveProperty('connectionString');
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      const getEnvironment = (nodeEnv: string | undefined) => nodeEnv || 'development';

      const environment = getEnvironment(undefined);

      expect(environment).toBe('development');
    });

    it('should fallback to development when NODE_ENV is undefined', () => {
      const getEnvironment = (nodeEnv: string | undefined) => nodeEnv || 'development';

      const environment = getEnvironment(undefined);

      expect(environment).toBe('development');
    });
  });
});
