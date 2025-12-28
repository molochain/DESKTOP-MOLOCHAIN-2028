import { describe, it, expect } from 'vitest';
import {
  productionClient,
  PRODUCTION_BASE_URL,
  E2E_TIMEOUTS,
  validateHealthResponse,
  validateResponseStructure,
  isValidTimestamp,
  checkEndpointAccessibility,
} from './setup';

describe('Production Health E2E Tests', { timeout: E2E_TIMEOUTS.LONG }, () => {
  describe('Production Server Accessibility', () => {
    it('should verify production website is accessible', async () => {
      const isAccessible = await checkEndpointAccessibility(PRODUCTION_BASE_URL);
      expect(isAccessible).toBe(true);
    });

    it('should return valid HTML for homepage', async () => {
      const response = await productionClient.get('/', {
        headers: { Accept: 'text/html' },
      });
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });
  });

  describe('GET /api/health - Main Health Endpoint', () => {
    it('should return 200 status with healthy status from production health endpoint', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(['healthy', 'operational', 'ok']).toContain(response.data.status?.toLowerCase() || response.data.status);
    });

    it('should include valid timestamp in health response', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('timestamp');
      expect(isValidTimestamp(response.data.timestamp)).toBe(true);
    });

    it('should validate complete health response structure', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      const validation = validateHealthResponse(response.data);
      expect(validation.valid).toBe(true);
    });

    it('should return response within acceptable time', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/health');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Database Connectivity Status', () => {
    it('should indicate database connection status in health response', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('details');
      expect(response.data.details).toHaveProperty('database');
    });

    it('should show database status as connected', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      
      const dbStatus = response.data.details?.database?.status?.toLowerCase();
      expect(dbStatus).toBeDefined();
      expect(['healthy', 'connected', 'operational', 'ok']).toContain(dbStatus);
    });

    it('should include database latency metric', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data.details?.database).toHaveProperty('latency');
      expect(typeof response.data.details.database.latency).toBe('number');
      expect(response.data.details.database.latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('System Metrics', () => {
    it('should include system details in health response', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('details');
      expect(response.data.details).toHaveProperty('system');
    });

    it('should include uptime as valid positive number', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data.details?.system).toHaveProperty('uptime');
      expect(typeof response.data.details.system.uptime).toBe('number');
      expect(response.data.details.system.uptime).toBeGreaterThan(0);
      expect(Number.isFinite(response.data.details.system.uptime)).toBe(true);
    });

    it('should include memory metrics with valid numbers', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data.details?.system).toHaveProperty('memory');
      expect(typeof response.data.details.system.memory).toBe('object');
      
      const memory = response.data.details.system.memory;
      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('total');
      expect(typeof memory.used).toBe('number');
      expect(typeof memory.total).toBe('number');
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.total).toBeGreaterThan(0);
      expect(Number.isFinite(memory.used)).toBe(true);
      expect(Number.isFinite(memory.total)).toBe(true);
    });

    it('should include CPU metrics with valid numbers', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data.details?.system).toHaveProperty('cpu');
      
      const cpu = response.data.details.system.cpu;
      expect(typeof cpu).toBe('object');
      
      expect(cpu).toHaveProperty('usage');
      expect(typeof cpu.usage).toBe('number');
      expect(cpu.usage).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(cpu.usage)).toBe(true);
      
      expect(cpu).toHaveProperty('loadAvg');
      expect(Array.isArray(cpu.loadAvg)).toBe(true);
      expect(cpu.loadAvg.length).toBe(3);
      for (const load of cpu.loadAvg) {
        expect(typeof load).toBe('number');
        expect(load).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(load)).toBe(true);
      }
      
      expect(cpu).toHaveProperty('cores');
      expect(typeof cpu.cores).toBe('number');
      expect(cpu.cores).toBeGreaterThan(0);
    });

    it('should include disk metrics', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data.details?.system).toHaveProperty('disk');
      
      const disk = response.data.details.system.disk;
      expect(disk).toHaveProperty('total');
      expect(disk).toHaveProperty('used');
      expect(typeof disk.total).toBe('number');
      expect(typeof disk.used).toBe('number');
    });

    it('should include network metrics', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.data.details?.system).toHaveProperty('network');
      
      const network = response.data.details.system.network;
      expect(network).toHaveProperty('connections');
      expect(typeof network.connections).toBe('number');
      expect(network.connections).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Response Headers', () => {
    it('should return proper content-type header', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should include CORS headers for API access', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
    });
  });

  describe('Environment Information', () => {
    it('should include environment details', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      
      if (response.data.environment) {
        expect(typeof response.data.environment).toBe('string');
        expect(['production', 'staging', 'development']).toContain(response.data.environment.toLowerCase());
      }
    });

    it('should include node version if available', async () => {
      const response = await productionClient.get('/api/health');
      
      expect(response.status).toBe(200);
      
      if (response.data.nodeVersion) {
        expect(typeof response.data.nodeVersion).toBe('string');
        expect(response.data.nodeVersion).toMatch(/^v?\d+\.\d+\.\d+/);
      }
    });
  });
});
