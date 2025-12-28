import { describe, it, expect } from 'vitest';
import {
  productionClient,
  cmsClient,
  CMS_BASE_URL,
  E2E_TIMEOUTS,
  validateArrayResponse,
  validateResponseStructure,
  checkEndpointAccessibility,
} from './setup';

describe('CMS Sync E2E Tests', { timeout: E2E_TIMEOUTS.LONG }, () => {
  describe('CMS Server Accessibility', () => {
    it('should verify CMS server is accessible', async () => {
      const isAccessible = await checkEndpointAccessibility(CMS_BASE_URL);
      expect(isAccessible).toBe(true);
    });
  });

  describe('CMS API Endpoints', () => {
    describe('GET /api/menu - Menu Data', () => {
      it('should return 200 status with menu data from CMS', async () => {
        const response = await cmsClient.get('/api/menu');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });

      it('should return menu items with required fields', async () => {
        const response = await cmsClient.get('/api/menu');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThanOrEqual(1);
        
        const firstItem = response.data[0];
        expect(firstItem).toHaveProperty('id');
        expect(firstItem.id).toBeDefined();
      });
    });

    describe('GET /api/settings - Settings Data', () => {
      it('should return 200 status with settings data from CMS', async () => {
        const response = await cmsClient.get('/api/settings');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(typeof response.data).toBe('object');
      });

      it('should include site configuration', async () => {
        const response = await cmsClient.get('/api/settings');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(Object.keys(response.data).length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('GET /api/services - Services Data', () => {
      it('should return 200 status with services list from CMS', async () => {
        const response = await cmsClient.get('/api/services');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });

      it('should return services with required fields', async () => {
        const response = await cmsClient.get('/api/services');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThanOrEqual(1);
        
        const firstService = response.data[0];
        expect(firstService).toHaveProperty('id');
        expect(firstService.id).toBeDefined();
        expect(firstService).toHaveProperty('name');
        expect(typeof firstService.name).toBe('string');
      });
    });

    describe('GET /api/home-sections - Home Sections', () => {
      it('should return 200 status with home sections from CMS', async () => {
        const response = await cmsClient.get('/api/home-sections');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });

    describe('GET /api/pages - Pages Data', () => {
      it('should return 200 status with pages data from CMS', async () => {
        const response = await cmsClient.get('/api/pages');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });

    describe('GET /api/testimonials - Testimonials', () => {
      it('should return 200 status with testimonials from CMS', async () => {
        const response = await cmsClient.get('/api/testimonials');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });
  });

  describe('Production CMS Sync Endpoints', () => {
    describe('GET /api/cms/sync/status - Sync Status', () => {
      it('should return 200 status with CMS sync status from production', async () => {
        const response = await productionClient.get('/api/cms/sync/status');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });

      it('should include sync timing information', async () => {
        const response = await productionClient.get('/api/cms/sync/status');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        
        if (response.data.lastSync) {
          expect(typeof response.data.lastSync).toBe('string');
          const timestamp = new Date(response.data.lastSync);
          expect(timestamp.getTime()).not.toBeNaN();
        }
      });
    });

    describe('GET /api/cms/menu - Cached Menu Data', () => {
      it('should return 200 status with cached menu data from production', async () => {
        const response = await productionClient.get('/api/cms/menu');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });

    describe('GET /api/cms/settings - Cached Settings', () => {
      it('should return 200 status with cached settings from production', async () => {
        const response = await productionClient.get('/api/cms/settings');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });

    describe('GET /api/cms/services - Cached Services', () => {
      it('should return 200 status with cached services from production', async () => {
        const response = await productionClient.get('/api/cms/services');
        
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });
  });

  describe('CMS Data Validation - Deep Comparison', () => {
    it('should have consistent services data between CMS and production cache', async () => {
      const [cmsResponse, prodResponse] = await Promise.all([
        cmsClient.get('/api/services'),
        productionClient.get('/api/cms/services'),
      ]);

      expect(cmsResponse.status).toBe(200);
      expect(prodResponse.status).toBe(200);
      
      const cmsData = Array.isArray(cmsResponse.data) ? cmsResponse.data : cmsResponse.data?.data || [];
      const prodData = Array.isArray(prodResponse.data) ? prodResponse.data : prodResponse.data?.data || [];
      
      expect(Array.isArray(cmsData)).toBe(true);
      expect(Array.isArray(prodData)).toBe(true);
      
      expect(cmsData.length).toBeGreaterThanOrEqual(1);
      expect(prodData.length).toBeGreaterThanOrEqual(1);
      
      expect(prodData.length).toBe(cmsData.length);
      
      const cmsServiceIds = cmsData.map((s: any) => s.id).sort();
      const prodServiceIds = prodData.map((s: any) => s.id).sort();
      expect(prodServiceIds).toEqual(cmsServiceIds);
    });

    it('should have consistent menu data between CMS and production cache', async () => {
      const [cmsResponse, prodResponse] = await Promise.all([
        cmsClient.get('/api/menu'),
        productionClient.get('/api/cms/menu'),
      ]);

      expect(cmsResponse.status).toBe(200);
      expect(prodResponse.status).toBe(200);
      
      const cmsData = Array.isArray(cmsResponse.data) ? cmsResponse.data : cmsResponse.data?.data || [];
      const prodData = Array.isArray(prodResponse.data) ? prodResponse.data : prodResponse.data?.data || [];
      
      expect(Array.isArray(cmsData)).toBe(true);
      expect(Array.isArray(prodData)).toBe(true);
      
      expect(cmsData.length).toBeGreaterThanOrEqual(1);
      expect(prodData.length).toBe(cmsData.length);
    });

    it('should have consistent settings between CMS and production cache', async () => {
      const [cmsResponse, prodResponse] = await Promise.all([
        cmsClient.get('/api/settings'),
        productionClient.get('/api/cms/settings'),
      ]);

      expect(cmsResponse.status).toBe(200);
      expect(prodResponse.status).toBe(200);
      
      const cmsData = cmsResponse.data?.data || cmsResponse.data;
      const prodData = prodResponse.data?.data || prodResponse.data;
      
      expect(typeof cmsData).toBe('object');
      expect(typeof prodData).toBe('object');
      
      const cmsKeys = Object.keys(cmsData).sort();
      const prodKeys = Object.keys(prodData).sort();
      expect(prodKeys).toEqual(cmsKeys);
    });
  });

  describe('CMS Response Field Validation', () => {
    it('should have valid menu item fields', async () => {
      const response = await cmsClient.get('/api/menu');
      
      expect(response.status).toBe(200);
      
      const menuData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      expect(menuData.length).toBeGreaterThanOrEqual(1);
      
      for (const item of menuData) {
        expect(item).toHaveProperty('id');
        expect(item.id).toBeDefined();
        
        if (item.label !== undefined) {
          expect(typeof item.label).toBe('string');
        }
        if (item.href !== undefined) {
          expect(typeof item.href).toBe('string');
        }
      }
    });

    it('should have valid service fields', async () => {
      const response = await cmsClient.get('/api/services');
      
      expect(response.status).toBe(200);
      
      const servicesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      expect(servicesData.length).toBeGreaterThanOrEqual(1);
      
      for (const service of servicesData) {
        expect(service).toHaveProperty('id');
        expect(service.id).toBeDefined();
        expect(service).toHaveProperty('name');
        expect(typeof service.name).toBe('string');
        expect(service.name.length).toBeGreaterThan(0);
        
        if (service.slug !== undefined) {
          expect(typeof service.slug).toBe('string');
        }
        if (service.short_description !== undefined) {
          expect(typeof service.short_description).toBe('string');
        }
      }
    });
  });

  describe('Response Performance', () => {
    it('should return CMS data with 200 status within acceptable time', async () => {
      const startTime = Date.now();
      const response = await cmsClient.get('/api/settings');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(10000);
    });

    it('should return cached production data with 200 status quickly', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/cms/settings');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });
});
