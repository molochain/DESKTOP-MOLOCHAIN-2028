import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import cmsPublicRoutes from '../cms-public.routes';

vi.mock('../../../services/laravel-cms-client', () => ({
  laravelCMS: {
    healthCheck: vi.fn(),
    getPages: vi.fn(),
    getPage: vi.fn(),
    getServices: vi.fn(),
    getService: vi.fn(),
    getMenu: vi.fn(),
    getSettings: vi.fn(),
    getHomeSections: vi.fn(),
    getDiagnosticSummary: vi.fn(),
  },
}));

import { laravelCMS } from '../../../services/laravel-cms-client';

describe('CMS Public Routes', () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/cms', cmsPublicRoutes);
  });

  describe('GET /api/cms/health', () => {
    it('should return connected status when CMS is healthy', async () => {
      (laravelCMS.healthCheck as Mock).mockResolvedValue(true);

      const response = await request(app).get('/api/cms/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'connected',
        service: 'laravel-cms',
        baseUrl: expect.any(String),
      });
    });

    it('should return disconnected status when CMS is not healthy', async () => {
      (laravelCMS.healthCheck as Mock).mockResolvedValue(false);

      const response = await request(app).get('/api/cms/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'disconnected',
        service: 'laravel-cms',
        baseUrl: expect.any(String),
      });
    });

    it('should return error status when health check throws', async () => {
      (laravelCMS.healthCheck as Mock).mockRejectedValue(new Error('Connection failed'));

      const response = await request(app).get('/api/cms/health');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        error: 'Connection failed',
      });
    });
  });

  describe('GET /api/cms/menu', () => {
    it('should return menu items successfully', async () => {
      const mockMenu = [
        { id: 1, label: 'Home', url: '/', sort_order: 1, is_active: true },
        { id: 2, label: 'About', url: '/about', sort_order: 2, is_active: true },
      ];
      (laravelCMS.getMenu as Mock).mockResolvedValue(mockMenu);

      const response = await request(app).get('/api/cms/menu');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockMenu });
    });

    it('should return 500 when fetching menu fails', async () => {
      (laravelCMS.getMenu as Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await request(app).get('/api/cms/menu');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch menu from CMS' });
    });
  });

  describe('GET /api/cms/settings', () => {
    it('should return settings successfully', async () => {
      const mockSettings = {
        site_name: 'MoloChain',
        site_description: 'Logistics Platform',
        contact_email: 'info@molochain.com',
      };
      (laravelCMS.getSettings as Mock).mockResolvedValue(mockSettings);

      const response = await request(app).get('/api/cms/settings');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockSettings });
    });

    it('should return 500 when fetching settings fails', async () => {
      (laravelCMS.getSettings as Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await request(app).get('/api/cms/settings');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch settings from CMS' });
    });
  });

  describe('GET /api/cms/services', () => {
    it('should return services with count', async () => {
      const mockServices = [
        { id: 1, title: 'Shipping', slug: 'shipping', is_active: true },
        { id: 2, title: 'Warehousing', slug: 'warehousing', is_active: true },
      ];
      (laravelCMS.getServices as Mock).mockResolvedValue(mockServices);

      const response = await request(app).get('/api/cms/services');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: mockServices,
        count: 2,
      });
    });

    it('should return empty array when no services', async () => {
      (laravelCMS.getServices as Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/cms/services');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return 500 when fetching services fails', async () => {
      (laravelCMS.getServices as Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await request(app).get('/api/cms/services');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch services from CMS' });
    });
  });

  describe('GET /api/cms/pages', () => {
    it('should return pages with count', async () => {
      const mockPages = [
        { id: 1, title: 'About Us', slug: 'about', status: 'published' },
        { id: 2, title: 'Contact', slug: 'contact', status: 'published' },
      ];
      (laravelCMS.getPages as Mock).mockResolvedValue(mockPages);

      const response = await request(app).get('/api/cms/pages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: mockPages,
        count: 2,
      });
    });

    it('should return empty array when no pages', async () => {
      (laravelCMS.getPages as Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/cms/pages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return 500 when fetching pages fails', async () => {
      (laravelCMS.getPages as Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await request(app).get('/api/cms/pages');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch pages from CMS' });
    });
  });

  describe('GET /api/cms/pages/:slug', () => {
    it('should return a page by slug', async () => {
      const mockPage = {
        id: 1,
        title: 'About Us',
        slug: 'about',
        body: '<p>About us content</p>',
        status: 'published',
      };
      (laravelCMS.getPage as Mock).mockResolvedValue(mockPage);

      const response = await request(app).get('/api/cms/pages/about');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockPage });
      expect(laravelCMS.getPage).toHaveBeenCalledWith('about');
    });

    it('should return 404 when page not found', async () => {
      (laravelCMS.getPage as Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/cms/pages/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Page not found' });
    });

    it('should return 500 when fetching page fails', async () => {
      (laravelCMS.getPage as Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await request(app).get('/api/cms/pages/about');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch page from CMS' });
    });
  });

  describe('GET /api/cms/home-sections', () => {
    it('should return home sections with count', async () => {
      const mockSections = [
        { id: 1, key: 'hero', title: 'Hero Section', sort_order: 1, is_active: 1 },
        { id: 2, key: 'services', title: 'Services', sort_order: 2, is_active: 1 },
      ];
      (laravelCMS.getHomeSections as Mock).mockResolvedValue(mockSections);

      const response = await request(app).get('/api/cms/home-sections');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: mockSections,
        count: 2,
      });
    });

    it('should return empty array when no sections', async () => {
      (laravelCMS.getHomeSections as Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/cms/home-sections');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [], count: 0 });
    });

    it('should return 500 when fetching sections fails', async () => {
      (laravelCMS.getHomeSections as Mock).mockRejectedValue(new Error('Failed to fetch'));

      const response = await request(app).get('/api/cms/home-sections');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch home sections from CMS' });
    });
  });

  describe('GET /api/cms/diagnostics', () => {
    it('should return diagnostic summary', async () => {
      const mockDiagnostics = {
        healthy: true,
        workingEndpoints: ['/health', '/services', '/pages'],
        brokenEndpoints: [],
        cmsVersion: 'Laravel 12.40.2 / PHP 8.4.15',
      };
      (laravelCMS.getDiagnosticSummary as Mock).mockResolvedValue(mockDiagnostics);

      const response = await request(app).get('/api/cms/diagnostics');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDiagnostics);
    });

    it('should return 500 when diagnostics fail', async () => {
      (laravelCMS.getDiagnosticSummary as Mock).mockRejectedValue(new Error('Failed'));

      const response = await request(app).get('/api/cms/diagnostics');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to get diagnostics' });
    });
  });
});
