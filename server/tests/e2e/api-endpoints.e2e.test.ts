import { describe, it, expect } from 'vitest';
import {
  productionClient,
  E2E_TIMEOUTS,
  validateArrayResponse,
  validateServiceData,
  validatePartnerData,
  validateRegionData,
  validateResponseStructure,
} from './setup';

describe('API Endpoints E2E Tests', { timeout: E2E_TIMEOUTS.LONG }, () => {
  describe('GET /api/services - Services Endpoint', () => {
    it('should return 200 status with services list from production', async () => {
      const response = await productionClient.get('/api/services');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should return at least 1 service in array format', async () => {
      const response = await productionClient.get('/api/services');
      
      expect(response.status).toBe(200);
      
      const services = Array.isArray(response.data) ? response.data : (response.data.data || response.data.services || []);
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThanOrEqual(1);
    });

    it('should return valid service data with required fields', async () => {
      const response = await productionClient.get('/api/services');
      
      expect(response.status).toBe(200);
      
      const services = Array.isArray(response.data) ? response.data : (response.data.data || response.data.services || []);
      expect(services.length).toBeGreaterThanOrEqual(1);
      
      const firstService = services[0];
      expect(firstService).toHaveProperty('id');
      expect(firstService.id).toBeDefined();
      expect(firstService).toHaveProperty('title');
      expect(typeof firstService.title).toBe('string');
      expect(firstService.title.length).toBeGreaterThan(0);
    });

    it('should include service details with valid types', async () => {
      const response = await productionClient.get('/api/services');
      
      expect(response.status).toBe(200);
      
      const services = Array.isArray(response.data) ? response.data : (response.data.data || response.data.services || []);
      expect(services.length).toBeGreaterThanOrEqual(1);
      
      const service = services[0];
      
      if (service.description !== undefined) {
        expect(typeof service.description).toBe('string');
      }
      
      if (service.features !== undefined) {
        expect(Array.isArray(service.features)).toBe(true);
      }
    });
  });

  describe('GET /api/partners - Partners Endpoint', () => {
    it('should return 200 status with partners list from production', async () => {
      const response = await productionClient.get('/api/partners');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should return at least 1 partner in expected format', async () => {
      const response = await productionClient.get('/api/partners');
      
      expect(response.status).toBe(200);
      
      const partners = Array.isArray(response.data) ? response.data : (response.data.data || response.data.partners || []);
      expect(Array.isArray(partners)).toBe(true);
      expect(partners.length).toBeGreaterThanOrEqual(1);
    });

    it('should return valid partner data with required fields', async () => {
      const response = await productionClient.get('/api/partners');
      
      expect(response.status).toBe(200);
      
      const partners = Array.isArray(response.data) ? response.data : (response.data.data || response.data.partners || []);
      expect(partners.length).toBeGreaterThanOrEqual(1);
      
      const firstPartner = partners[0];
      expect(firstPartner).toHaveProperty('id');
      expect(firstPartner.id).toBeDefined();
      expect(firstPartner).toHaveProperty('name');
      expect(typeof firstPartner.name).toBe('string');
      expect(firstPartner.name.length).toBeGreaterThan(0);
    });

    it('should include partner details with valid types', async () => {
      const response = await productionClient.get('/api/partners');
      
      expect(response.status).toBe(200);
      
      const partners = Array.isArray(response.data) ? response.data : (response.data.data || response.data.partners || []);
      expect(partners.length).toBeGreaterThanOrEqual(1);
      
      const partner = partners[0];
      
      if (partner.logo !== undefined) {
        expect(typeof partner.logo).toBe('string');
      }
    });
  });

  describe('GET /api/regions - Regions Endpoint', () => {
    it('should return 200 status with regions list from production', async () => {
      const response = await productionClient.get('/api/regions');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should return at least 1 region in expected format', async () => {
      const response = await productionClient.get('/api/regions');
      
      expect(response.status).toBe(200);
      
      const regions = Array.isArray(response.data) ? response.data : (response.data.data || response.data.regions || []);
      expect(Array.isArray(regions)).toBe(true);
      expect(regions.length).toBeGreaterThanOrEqual(1);
    });

    it('should return valid region data with required fields', async () => {
      const response = await productionClient.get('/api/regions');
      
      expect(response.status).toBe(200);
      
      const regions = Array.isArray(response.data) ? response.data : (response.data.data || response.data.regions || []);
      expect(regions.length).toBeGreaterThanOrEqual(1);
      
      const firstRegion = regions[0];
      expect(firstRegion).toHaveProperty('code');
      expect(firstRegion.code).toBeDefined();
      expect(firstRegion).toHaveProperty('name');
      expect(typeof firstRegion.name).toBe('string');
      expect(firstRegion.name.length).toBeGreaterThan(0);
    });

    it('should include region geographic data with valid types', async () => {
      const response = await productionClient.get('/api/regions');
      
      expect(response.status).toBe(200);
      
      const regions = Array.isArray(response.data) ? response.data : (response.data.data || response.data.regions || []);
      expect(regions.length).toBeGreaterThanOrEqual(1);
      
      const region = regions[0];
      
      if (region.code !== undefined) {
        expect(typeof region.code).toBe('string');
      }
    });
  });

  describe('GET /api/product-types - Product Types Endpoint', () => {
    it('should return 200 status with product types list from production', async () => {
      const response = await productionClient.get('/api/product-types');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should return at least 1 product type in expected format', async () => {
      const response = await productionClient.get('/api/product-types');
      
      expect(response.status).toBe(200);
      
      const productTypes = Array.isArray(response.data) ? response.data : (response.data.data || response.data.productTypes || []);
      expect(Array.isArray(productTypes)).toBe(true);
      expect(productTypes.length).toBeGreaterThanOrEqual(1);
    });

    it('should return valid product type data with required fields', async () => {
      const response = await productionClient.get('/api/product-types');
      
      expect(response.status).toBe(200);
      
      const productTypes = Array.isArray(response.data) ? response.data : (response.data.data || response.data.productTypes || []);
      expect(productTypes.length).toBeGreaterThanOrEqual(1);
      
      const firstType = productTypes[0];
      expect(firstType).toHaveProperty('id');
      expect(firstType.id).toBeDefined();
      expect(firstType).toHaveProperty('name');
      expect(typeof firstType.name).toBe('string');
      expect(firstType.name.length).toBeGreaterThan(0);
    });

    it('should include product type details with valid types', async () => {
      const response = await productionClient.get('/api/product-types');
      
      expect(response.status).toBe(200);
      
      const productTypes = Array.isArray(response.data) ? response.data : (response.data.data || response.data.productTypes || []);
      expect(productTypes.length).toBeGreaterThanOrEqual(1);
      
      const productType = productTypes[0];
      
      if (productType.category !== undefined) {
        expect(typeof productType.category).toBe('string');
      }
    });
  });

  describe('API Response Performance', () => {
    it('should return services with 200 status within acceptable time', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/services');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(10000);
    });

    it('should return partners with 200 status within acceptable time', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/partners');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(10000);
    });

    it('should return regions with 200 status within acceptable time', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/regions');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(10000);
    });

    it('should return product-types with 200 status within acceptable time', async () => {
      const startTime = Date.now();
      const response = await productionClient.get('/api/product-types');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('API Error Handling', () => {
    it('should handle non-existent endpoints gracefully', async () => {
      const response = await productionClient.get('/api/non-existent-endpoint');
      
      expect([200, 404, 401, 403]).toContain(response.status);
    });

    it('should return proper response for invalid service id requests', async () => {
      const response = await productionClient.get('/api/services/invalid-id-12345');
      
      expect([200, 400, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('Content Type Validation', () => {
    it('should return JSON content type for services with 200 status', async () => {
      const response = await productionClient.get('/api/services');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return JSON content type for partners with 200 status', async () => {
      const response = await productionClient.get('/api/partners');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return JSON content type for regions with 200 status', async () => {
      const response = await productionClient.get('/api/regions');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return JSON content type for product-types with 200 status', async () => {
      const response = await productionClient.get('/api/product-types');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
