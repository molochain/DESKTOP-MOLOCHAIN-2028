import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        if (!url || typeof url !== 'string') {
          throw new Error('Invalid query key');
        }

        const res = await fetch(url, {
          credentials: "include",
        });

        if (!res.ok) {
          // Handle authentication errors gracefully - return null
          if (res.status === 401) {
            return null;
          }
          
          // For other errors, throw properly so React Query can handle them
          const errorText = await res.text().catch(() => res.statusText);
          throw new Error(`Request failed (${res.status}): ${errorText}`);
        }

        return await res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry auth errors or network errors
        if (error?.message?.includes('401') || error?.message?.includes('fetch')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      throwOnError: false,
      onError: (error: any) => {
        // Silently handle mutation errors to prevent console noise
        // Mutation error handled silently
      }
    }
  },
});

// Optional configuration for the query function
interface QueryFnOptions {
  on401?: 'throw' | 'returnNull';
}

// Get function for queries with options
export const getQueryFn = (options: QueryFnOptions = {}) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const res = await fetch(queryKey[0], {
      credentials: "include",
    });

    if (!res.ok) {
      // Special handling for 401 Unauthorized
      if (res.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      
      // Error handling for other status codes
      if (res.status >= 500) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      throw new Error(`${res.status}: ${await res.text()}`);
    }

    return res.json();
  };
};

// Generic function for making API requests
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
  };

  // Add body for non-GET requests
  if (method !== 'GET' && data !== undefined) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Handle HTTP errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status code ${response.status}`);
  }
  
  return response;
}
