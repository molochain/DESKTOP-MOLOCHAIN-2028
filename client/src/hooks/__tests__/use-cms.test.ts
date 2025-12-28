/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  useCMSMenu,
  useCMSSettings,
  useCMSServices,
  useCMSPages,
  useCMSPage,
  useCMSHomeSections,
} from '../use-cms';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('CMS Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('isActive helper (tested through useCMSMenu)', () => {
    it('should filter items where is_active is 1 (number)', async () => {
      const mockResponse = {
        data: [
          { id: 1, label: 'Active Item', url: '/', sort_order: 1, is_active: 1 },
          { id: 2, label: 'Inactive Item', url: '/inactive', sort_order: 2, is_active: 0 },
        ],
      };

      queryClient.setQueryData(['/api/cms/menu'], mockResponse);

      const { result } = renderHook(() => useCMSMenu(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].label).toBe('Active Item');
    });

    it('should filter items where is_active is true (boolean)', async () => {
      const mockResponse = {
        data: [
          { id: 1, label: 'Active', url: '/', sort_order: 1, is_active: true },
          { id: 2, label: 'Inactive', url: '/inactive', sort_order: 2, is_active: false },
        ],
      };

      queryClient.setQueryData(['/api/cms/menu'], mockResponse);

      const { result } = renderHook(() => useCMSMenu(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].label).toBe('Active');
    });
  });

  describe('useCMSMenu', () => {
    it('should return filtered and sorted menu items', async () => {
      const mockResponse = {
        data: [
          { id: 3, label: 'Contact', url: '/contact', sort_order: 3, is_active: 1 },
          { id: 1, label: 'Home', url: '/', sort_order: 1, is_active: 1 },
          { id: 2, label: 'About', url: '/about', sort_order: 2, is_active: 1 },
          { id: 4, label: 'Hidden', url: '/hidden', sort_order: 4, is_active: 0 },
        ],
      };

      queryClient.setQueryData(['/api/cms/menu'], mockResponse);

      const { result } = renderHook(() => useCMSMenu(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(3);
      expect(result.current.data?.[0].label).toBe('Home');
      expect(result.current.data?.[1].label).toBe('About');
      expect(result.current.data?.[2].label).toBe('Contact');
    });

    it('should handle empty menu', async () => {
      queryClient.setQueryData(['/api/cms/menu'], { data: [] });

      const { result } = renderHook(() => useCMSMenu(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle response without data wrapper', async () => {
      const menuItems = [
        { id: 1, label: 'Home', url: '/', sort_order: 1, is_active: 1 },
      ];

      queryClient.setQueryData(['/api/cms/menu'], menuItems);

      const { result } = renderHook(() => useCMSMenu(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
    });
  });

  describe('useCMSSettings', () => {
    it('should return settings object', async () => {
      const mockSettings = {
        data: {
          site_name: 'MoloChain',
          site_description: 'Logistics Platform',
          contact_email: 'info@molochain.com',
          social_links: {
            twitter: 'https://twitter.com/molochain',
            linkedin: 'https://linkedin.com/company/molochain',
          },
        },
      };

      queryClient.setQueryData(['/api/cms/settings'], mockSettings);

      const { result } = renderHook(() => useCMSSettings(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSettings.data);
      expect(result.current.data?.site_name).toBe('MoloChain');
    });

    it('should handle response without data wrapper', async () => {
      const settings = {
        site_name: 'Test Site',
      };

      queryClient.setQueryData(['/api/cms/settings'], settings);

      const { result } = renderHook(() => useCMSSettings(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.site_name).toBe('Test Site');
    });

    it('should return empty object when settings are empty', async () => {
      queryClient.setQueryData(['/api/cms/settings'], { data: {} });

      const { result } = renderHook(() => useCMSSettings(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({});
    });
  });

  describe('useCMSServices', () => {
    it('should return services array', async () => {
      const mockServices = {
        data: [
          { id: 1, title: 'Shipping', slug: 'shipping', is_active: true },
          { id: 2, title: 'Warehousing', slug: 'warehousing', is_active: true },
          { id: 3, title: 'Customs', slug: 'customs', is_active: false },
        ],
      };

      queryClient.setQueryData(['/api/cms/services'], mockServices);

      const { result } = renderHook(() => useCMSServices(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(3);
      expect(result.current.data?.[0].title).toBe('Shipping');
    });

    it('should handle empty services', async () => {
      queryClient.setQueryData(['/api/cms/services'], { data: [] });

      const { result } = renderHook(() => useCMSServices(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCMSPages', () => {
    it('should filter published pages only', async () => {
      const mockPages = {
        data: [
          { id: 1, title: 'About', slug: 'about', status: 'published' },
          { id: 2, title: 'Draft Page', slug: 'draft', status: 'draft' },
          { id: 3, title: 'Contact', slug: 'contact', status: 'published' },
          { id: 4, title: 'Archived', slug: 'archived', status: 'archived' },
        ],
      };

      queryClient.setQueryData(['/api/cms/pages'], mockPages);

      const { result } = renderHook(() => useCMSPages(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.every((p) => p.status === 'published')).toBe(true);
    });

    it('should return empty array when no published pages', async () => {
      const mockPages = {
        data: [
          { id: 1, title: 'Draft', slug: 'draft', status: 'draft' },
        ],
      };

      queryClient.setQueryData(['/api/cms/pages'], mockPages);

      const { result } = renderHook(() => useCMSPages(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCMSPage', () => {
    it('should fetch page by slug successfully', async () => {
      const mockPage = {
        id: 1,
        title: 'About Us',
        slug: 'about',
        body: '<p>Content</p>',
        status: 'published',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockPage }),
      });

      const { result } = renderHook(() => useCMSPage('about'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPage);
    });

    it('should return null for 404 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useCMSPage('nonexistent'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should throw error for non-404 failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const { result } = renderHook(() => useCMSPage('error-page'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(result.current.error?.message).toBe('Failed to fetch page');
    });

    it('should not fetch when slug is empty', async () => {
      const { result } = renderHook(() => useCMSPage(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isFetching).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle response without data wrapper', async () => {
      const mockPage = {
        id: 1,
        title: 'Direct Page',
        slug: 'direct',
        body: '<p>Content</p>',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPage),
      });

      const { result } = renderHook(() => useCMSPage('direct'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPage);
    });
  });

  describe('useCMSHomeSections', () => {
    it('should return filtered and sorted home sections', async () => {
      const mockSections = {
        data: [
          { id: 3, key: 'cta', title: 'CTA', sort_order: 3, is_active: 1 },
          { id: 1, key: 'hero', title: 'Hero', sort_order: 1, is_active: 1 },
          { id: 2, key: 'services', title: 'Services', sort_order: 2, is_active: 1 },
          { id: 4, key: 'hidden', title: 'Hidden', sort_order: 4, is_active: 0 },
        ],
      };

      queryClient.setQueryData(['/api/cms/home-sections'], mockSections);

      const { result } = renderHook(() => useCMSHomeSections(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(3);
      expect(result.current.data?.[0].key).toBe('hero');
      expect(result.current.data?.[1].key).toBe('services');
      expect(result.current.data?.[2].key).toBe('cta');
    });

    it('should handle boolean is_active values', async () => {
      const mockSections = {
        data: [
          { id: 1, key: 'hero', title: 'Hero', sort_order: 1, is_active: true },
          { id: 2, key: 'inactive', title: 'Inactive', sort_order: 2, is_active: false },
        ],
      };

      queryClient.setQueryData(['/api/cms/home-sections'], mockSections);

      const { result } = renderHook(() => useCMSHomeSections(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].key).toBe('hero');
    });
  });
});
