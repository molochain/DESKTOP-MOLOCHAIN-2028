import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { CMSMenuItem, CMSHomeSection, CMSSettings, CMSService, CMSPage } from '@shared/schema';

interface CMSArrayResponse<T> {
  data: T[];
}

interface CMSObjectResponse<T> {
  data: T;
}

function isActive(item: { is_active: number | boolean }): boolean {
  return item.is_active === 1 || item.is_active === true;
}

function extractArrayData<T>(response: unknown): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object' && 'data' in response) {
    const data = (response as CMSArrayResponse<T>).data;
    return Array.isArray(data) ? data : [];
  }
  return [];
}

function extractObjectData<T>(response: unknown, fallback: T): T {
  if (!response) return fallback;
  if (typeof response === 'object' && 'data' in response) {
    return (response as CMSObjectResponse<T>).data || fallback;
  }
  return response as T;
}

export function useCMSMenu(): UseQueryResult<CMSMenuItem[], Error> {
  return useQuery<CMSMenuItem[], Error>({
    queryKey: ['/api/cms/menu'],
    select: (response) => {
      const data = extractArrayData<CMSMenuItem>(response);
      return data
        .filter(isActive)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCMSHomeSections(): UseQueryResult<CMSHomeSection[], Error> {
  return useQuery<CMSHomeSection[], Error>({
    queryKey: ['/api/cms/home-sections'],
    select: (response) => {
      const data = extractArrayData<CMSHomeSection>(response);
      return data
        .filter(isActive)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCMSHomeSection(key: string): {
  data: CMSHomeSection | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const { data: sections, isLoading, isError, error } = useCMSHomeSections();
  return {
    data: sections?.find((s) => s.key === key),
    isLoading,
    isError,
    error,
  };
}

export function useCMSSettings(): UseQueryResult<CMSSettings, Error> {
  return useQuery<CMSSettings, Error>({
    queryKey: ['/api/cms/settings'],
    select: (response) => {
      return extractObjectData<CMSSettings>(response, {} as CMSSettings);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCMSServices(): UseQueryResult<CMSService[], Error> {
  return useQuery<CMSService[], Error>({
    queryKey: ['/api/cms/services'],
    select: (response) => {
      return extractArrayData<CMSService>(response);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCMSPages(): UseQueryResult<CMSPage[], Error> {
  return useQuery<CMSPage[], Error>({
    queryKey: ['/api/cms/pages'],
    select: (response) => {
      const data = extractArrayData<CMSPage>(response);
      return data.filter((page) => page.status === 'published');
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useCMSPage(slug: string): UseQueryResult<CMSPage | null, Error> {
  return useQuery<CMSPage | null, Error>({
    queryKey: ['/api/cms/pages', slug],
    queryFn: async () => {
      const response = await fetch(`/api/cms/pages/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch page');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
  });
}
