
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthResponse {
  ok: boolean;
  user?: User;
  message?: string;
}

export function useUser() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return { ok: false, message: 'Not authenticated' };
          }
          return { ok: false, message: 'Authentication check failed' };
        }
        
        const result = await response.json();
        return { ok: true, user: result };
      } catch (err) {
        // Silently handle errors to prevent console noise
        return { ok: false, message: 'Authentication check failed' };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false,
    enabled: true,
    gcTime: 0 // Don't cache failed auth attempts
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Login failed with status ${response.status}`);
        }
        
        return response.json();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Login failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Logout failed');
        }
        
        return response.json();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    }
  });

  return {
    user: data?.user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
