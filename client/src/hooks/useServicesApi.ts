import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { 
  ServicePlatform, 
  ServiceListResponse, 
  ServiceDetailResponse,
  ServiceCategoriesResponse,
  ServiceSearchResponse 
} from '../../../server/platform/services/v1/types';

const API_BASE = '/api/platform/services/v1';

export function useServicesCatalog(): UseQueryResult<ServicePlatform[], Error> {
  return useQuery<ServicePlatform[], Error>({
    queryKey: [API_BASE, 'catalog'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/catalog`);
      if (!response.ok) {
        throw new Error('Failed to fetch services catalog');
      }
      const json: ServiceListResponse = await response.json();
      if (!json.success) {
        throw new Error('Failed to fetch services catalog');
      }
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useServicesCatalogWithMeta(): UseQueryResult<ServiceListResponse, Error> {
  return useQuery<ServiceListResponse, Error>({
    queryKey: [API_BASE, 'catalog', 'with-meta'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/catalog`);
      if (!response.ok) {
        throw new Error('Failed to fetch services catalog');
      }
      const json: ServiceListResponse = await response.json();
      if (!json.success) {
        throw new Error('Failed to fetch services catalog');
      }
      return json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useServiceDetail(slug: string): UseQueryResult<ServicePlatform | null, Error> {
  return useQuery<ServicePlatform | null, Error>({
    queryKey: [API_BASE, 'catalog', slug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/catalog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch service detail');
      }
      const json: ServiceDetailResponse = await response.json();
      if (!json.success) {
        return null;
      }
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
  });
}

export function useServicesCategories(): UseQueryResult<{ category: string; count: number }[], Error> {
  return useQuery<{ category: string; count: number }[], Error>({
    queryKey: [API_BASE, 'categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const json: ServiceCategoriesResponse = await response.json();
      if (!json.success) {
        throw new Error('Failed to fetch categories');
      }
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useServicesSearch(query: string): UseQueryResult<ServicePlatform[], Error> {
  return useQuery<ServicePlatform[], Error>({
    queryKey: [API_BASE, 'search', query],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search services');
      }
      const json: ServiceSearchResponse = await response.json();
      if (!json.success) {
        throw new Error('Failed to search services');
      }
      return json.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
    enabled: !!query && query.length >= 2,
  });
}

export type { ServicePlatform, ServiceListResponse, ServiceDetailResponse };
