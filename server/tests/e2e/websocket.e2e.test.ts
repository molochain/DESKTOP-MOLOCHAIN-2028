import { describe, it, expect } from 'vitest';
import {
  productionClient,
  E2E_TIMEOUTS,
  validateResponseStructure,
} from './setup';

const EXPECTED_NAMESPACES = [
  '/ws/main',
  '/ws/collaboration',
  '/ws/mololink',
  '/ws/notifications',
  '/ws/tracking',
  '/ws/project-updates',
  '/ws/activity-logs',
  '/ws/commodity-chat',
];

describe('WebSocket E2E Tests', { timeout: E2E_TIMEOUTS.LONG }, () => {
  describe('GET /api/websocket/health - WebSocket Health Endpoint', () => {
    it('should return 200 status with WebSocket health status', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should indicate operational status', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(['operational', 'healthy', 'active', 'ok']).toContain(
        response.data.status.toLowerCase()
      );
    });

    it('should include valid timestamp', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('timestamp');
      
      const timestamp = new Date(response.data.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('WebSocket Namespaces Validation', () => {
    it('should have exactly 8 operational namespaces', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('services');
      expect(Array.isArray(response.data.services)).toBe(true);
      expect(response.data.services.length).toBe(8);
    });

    it('should have all expected namespace names present', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('services');
      
      const namespaceNames = response.data.services.map((svc: any) => svc.namespace);
      
      for (const expected of EXPECTED_NAMESPACES) {
        expect(namespaceNames).toContain(expected);
      }
    });

    it('should have main namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasMain = response.data.services.some((svc: any) => svc.namespace === '/ws/main');
      expect(hasMain).toBe(true);
    });

    it('should have collaboration namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasCollaboration = response.data.services.some((svc: any) => svc.namespace === '/ws/collaboration');
      expect(hasCollaboration).toBe(true);
    });

    it('should have tracking namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasTracking = response.data.services.some((svc: any) => svc.namespace === '/ws/tracking');
      expect(hasTracking).toBe(true);
    });

    it('should have mololink namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasMololink = response.data.services.some((svc: any) => svc.namespace === '/ws/mololink');
      expect(hasMololink).toBe(true);
    });

    it('should have notifications namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasNotifications = response.data.services.some((svc: any) => svc.namespace === '/ws/notifications');
      expect(hasNotifications).toBe(true);
    });

    it('should have project-updates namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasProjectUpdates = response.data.services.some((svc: any) => svc.namespace === '/ws/project-updates');
      expect(hasProjectUpdates).toBe(true);
    });

    it('should have activity-logs namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasActivityLogs = response.data.services.some((svc: any) => svc.namespace === '/ws/activity-logs');
      expect(hasActivityLogs).toBe(true);
    });

    it('should have commodity-chat namespace', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      const hasCommodityChat = response.data.services.some((svc: any) => svc.namespace === '/ws/commodity-chat');
      expect(hasCommodityChat).toBe(true);
    });
  });

  describe('WebSocket Connection Metrics', () => {
    it('should include connection metrics', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      
      const hasMetrics = response.data.metrics !== undefined || 
                         response.data.connections !== undefined ||
                         response.data.activeConnections !== undefined;
      expect(hasMetrics).toBe(true);
    });

    it('should have valid active connections count', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      
      let activeConnections: number | undefined;
      
      if (response.data.activeConnections !== undefined) {
        activeConnections = response.data.activeConnections;
      } else if (response.data.connections?.active !== undefined) {
        activeConnections = response.data.connections.active;
      } else if (response.data.metrics?.activeConnections !== undefined) {
        activeConnections = response.data.metrics.activeConnections;
      }
      
      if (activeConnections !== undefined) {
        expect(typeof activeConnections).toBe('number');
        expect(activeConnections).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have valid total connections count', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      
      let totalConnections: number | undefined;
      
      if (response.data.totalConnections !== undefined) {
        totalConnections = response.data.totalConnections;
      } else if (response.data.metrics?.totalConnections !== undefined) {
        totalConnections = response.data.metrics.totalConnections;
      }
      
      if (totalConnections !== undefined) {
        expect(typeof totalConnections).toBe('number');
        expect(totalConnections).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have valid message metrics if available', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      
      if (response.data.metrics) {
        if (response.data.metrics.messagesReceived !== undefined) {
          expect(typeof response.data.metrics.messagesReceived).toBe('number');
          expect(response.data.metrics.messagesReceived).toBeGreaterThanOrEqual(0);
        }
        
        if (response.data.metrics.messagesSent !== undefined) {
          expect(typeof response.data.metrics.messagesSent).toBe('number');
          expect(response.data.metrics.messagesSent).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('WebSocket Feature Status', () => {
    it('should indicate feature statuses when available', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      
      if (response.data.features) {
        expect(typeof response.data.features).toBe('object');
        
        if (response.data.features.authentication !== undefined) {
          expect(typeof response.data.features.authentication).toBe('boolean');
        }
        
        if (response.data.features.rateLimiting !== undefined) {
          expect(typeof response.data.features.rateLimiting).toBe('boolean');
        }
        
        if (response.data.features.broadcasting !== undefined) {
          expect(typeof response.data.features.broadcasting).toBe('boolean');
        }
      }
    });
  });

  describe('WebSocket Server Info', () => {
    it('should indicate WebSocket server is operational', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(['healthy', 'operational', 'active', 'ok']).toContain(
        response.data.status.toLowerCase()
      );
    });

    it('should have healthScore metric', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('healthScore');
      expect(typeof response.data.healthScore).toBe('number');
      expect(response.data.healthScore).toBeGreaterThanOrEqual(0);
      expect(response.data.healthScore).toBeLessThanOrEqual(100);
    });

    it('should include security metrics', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('security');
      expect(response.data.security).toHaveProperty('totalConnections');
      expect(typeof response.data.security.totalConnections).toBe('number');
    });
  });

  describe('Response Performance', () => {
    it('should return WebSocket health with 200 status within acceptable time', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/websocket/health');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Content Type Validation', () => {
    it('should return JSON content type with 200 status', async () => {
      const response = await productionClient.get('/api/websocket/health');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
