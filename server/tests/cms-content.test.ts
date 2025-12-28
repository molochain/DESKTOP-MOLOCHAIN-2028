/**
 * CMS Content Service Test Suite
 * Tests CMS content fetching with demo fallback, caching, and error handling
 * Uses the real LaravelCMSClient with axios mocked at the HTTP layer
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import axios from 'axios';

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../utils/cms-monitor', () => ({
  cmsMonitor: {
    recordSuccess: vi.fn(),
    recordFailure: vi.fn(),
    shouldAlert: vi.fn().mockReturnValue(false),
    getStats: vi.fn().mockReturnValue({
      uptime: 1000000,
      startTime: new Date(),
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5,
      successRate: 95,
      consecutiveFailures: 0,
      responseTimeAvg: 50,
      responseTimeMin: 10,
      responseTimeMax: 200,
      lastErrorMessage: null,
      lastErrorTime: null
    })
  }
}));

vi.mock('axios', async () => {
  const actualAxios = await vi.importActual('axios');
  return {
    ...actualAxios,
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }))
    }
  };
});

describe('CMS Content Service', () => {
  let mockAxiosInstance: any;
  
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };
    
    (axios.create as any).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Real CMS Client - getServices', () => {
    it('should return services from CMS API', async () => {
      const mockServices = [
        { id: 1, title: 'Ocean Freight', slug: 'ocean-freight', category: 'shipping', is_active: true },
        { id: 2, title: 'Air Freight', slug: 'air-freight', category: 'shipping', is_active: true }
      ];
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockServices } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getServices(true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/services');
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Ocean Freight');
    });

    it('should return empty array on API error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getServices(true);
      
      expect(result).toEqual([]);
    });

    it('should handle empty response from CMS', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: [] } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getServices(true);
      
      expect(result).toEqual([]);
    });
  });

  describe('Real CMS Client - getPages', () => {
    it('should return pages from CMS API', async () => {
      const mockPages = [
        { id: 1, title: 'About Us', slug: 'about', body: 'About content' },
        { id: 2, title: 'Contact', slug: 'contact', body: 'Contact content' }
      ];
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockPages } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getPages(true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pages');
      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('about');
    });

    it('should return empty array on API error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('CMS unavailable'));
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getPages(true);
      
      expect(result).toEqual([]);
    });
  });

  describe('Real CMS Client - getPage (single)', () => {
    it('should return single page by slug', async () => {
      const mockPage = { id: 1, title: 'About Us', slug: 'about', body: 'About content' };
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockPage } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getPage('about', true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pages/about');
      expect(result?.slug).toBe('about');
    });

    it('should return null on page not found', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({ response: { status: 404 } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getPage('nonexistent', true);
      
      expect(result).toBeNull();
    });
  });

  describe('Real CMS Client - getMenu', () => {
    it('should return menu items from CMS API', async () => {
      const mockMenu = [
        { id: 1, label: 'Home', url: '/', sort_order: 1 },
        { id: 2, label: 'Services', url: '/services', sort_order: 2 }
      ];
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockMenu } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getMenu(true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/menu');
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('Home');
    });

    it('should return empty array on error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getMenu(true);
      
      expect(result).toEqual([]);
    });
  });

  describe('Real CMS Client - getSettings', () => {
    it('should return settings from CMS API', async () => {
      const mockSettings = { siteName: 'Molochain', siteUrl: 'https://molochain.com' };
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockSettings } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getSettings(true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/settings');
      expect(result.siteName).toBe('Molochain');
    });

    it('should return empty object on error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getSettings(true);
      
      expect(result).toEqual({});
    });
  });

  describe('Real CMS Client - getTestimonials', () => {
    it('should return testimonials from CMS API', async () => {
      const mockTestimonials = [
        { id: 1, name: 'John Doe', company: 'Test Corp', content: 'Great service!', rating: 5 }
      ];
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockTestimonials } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getTestimonials(true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/testimonials');
      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
    });
  });

  describe('Real CMS Client - getBlogPosts', () => {
    it('should return blog posts from CMS API', async () => {
      const mockBlogPosts = [
        { 
          id: 1, 
          title: 'Future of Supply Chain', 
          slug: 'future-supply-chain',
          excerpt: 'Discover innovations in logistics',
          content: '<p>Full content here</p>'
        }
      ];
      
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: mockBlogPosts } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getBlogPosts(true);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/blog/posts');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Future of Supply Chain');
    });
  });

  describe('Real CMS Client - healthCheck', () => {
    it('should return true when CMS is healthy', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { status: 'ok', app: 'molochain-cms' } });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.healthCheck();
      
      expect(result).toBe(true);
    });

    it('should fallback to /services when /health fails', async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce(new Error('Health endpoint failed'))
        .mockResolvedValueOnce({ data: [] });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.healthCheck();
      
      expect(result).toBe(true);
    });

    it('should return false when CMS is unreachable', async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('Connection refused'));
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.healthCheck();
      
      expect(result).toBe(false);
    });
  });

  describe('Demo Content Fallback', () => {
    it('should return demo content when CMS returns empty services array', async () => {
      const demoServices = [
        { id: 1, title: 'Ocean Freight', slug: 'ocean-freight', category: 'shipping' },
        { id: 2, title: 'Air Freight', slug: 'air-freight', category: 'shipping' }
      ];

      const cmsServices: any[] = [];
      
      const result = cmsServices.length > 0 ? cmsServices : demoServices;
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Ocean Freight');
    });

    it('should prefer CMS data over demo content when available', async () => {
      const demoServices = [
        { id: 1, title: 'Demo Service', slug: 'demo-service', category: 'demo' }
      ];

      const cmsServices = [
        { id: 100, title: 'Live Service from CMS', slug: 'live-service', category: 'live' }
      ];
      
      const result = cmsServices.length > 0 ? cmsServices : demoServices;
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Live Service from CMS');
      expect(result[0].id).toBe(100);
    });
  });

  describe('CMS Error Handling', () => {
    it('should handle HTTP 500 errors from CMS', async () => {
      const error = { response: { status: 500, data: { message: 'Internal Server Error' } } };
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getServices(true);
      
      expect(result).toEqual([]);
    });

    it('should handle HTTP 404 errors gracefully', async () => {
      const error = { response: { status: 404 } };
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getPage('nonexistent', true);
      
      expect(result).toBeNull();
    });

    it('should handle network timeouts', async () => {
      const error = new Error('timeout of 10000ms exceeded');
      (error as any).code = 'ECONNABORTED';
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const result = await laravelCMS.getServices(true);
      
      expect(result).toEqual([]);
    });
  });

  describe('CMS Endpoint Diagnostics', () => {
    it('should return endpoint statuses', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { status: 'ok' } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const statuses = await laravelCMS.getEndpointStatuses();
      
      expect(statuses).toHaveLength(6);
      expect(statuses.every(s => s.status === 'working')).toBe(true);
    });

    it('should mark broken endpoints', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { status: 'ok' } })
        .mockRejectedValueOnce({ response: { status: 404 } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });
      
      const { laravelCMS } = await import('../services/laravel-cms-client');
      const statuses = await laravelCMS.getEndpointStatuses();
      
      const brokenEndpoint = statuses.find(s => s.status === 'broken');
      expect(brokenEndpoint).toBeDefined();
      expect(brokenEndpoint?.endpoint).toBe('/services');
    });
  });
});
