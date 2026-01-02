import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'moderator' | 'manager' | 'analyst';
  permissions: string[];
  isActive: boolean;
  authenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutMutation: any;
  refetch: () => void;
  registerMutation: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Manual fetch function to avoid useQuery issues
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Only set user if they are actually authenticated
        // The API returns { authenticated: false, user: null } for unauthenticated requests
        if (userData && userData.authenticated === true) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // Silently handle errors
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchUser().catch(error => {
      console.warn('Initial auth check failed:', error.message);
    });
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(() => {
      fetchUser().catch(error => {
        console.warn('Periodic auth check failed:', error.message);
      });
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchUser]);

  const refetch = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      fetchUser(); // Refresh user data after successful login
    },
    onError: (error) => {
      // Silently handle errors to prevent console noise
      if (import.meta.env.DEV) {
        console.debug('Login error:', error);
      }
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; fullName: string; company: string; phone: string }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          company: userData.company,
          phone: userData.phone
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      return response.json();
    },
    onError: (error) => {
      // Silently handle errors to prevent console noise  
      if (import.meta.env.DEV) {
        console.debug('Registration error:', error);
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      // Clear any cached data after logout
    },
    onError: (error) => {
      // Silently handle errors to prevent console noise
      if (import.meta.env.DEV) {
        console.debug('Logout error:', error);
      }
    }
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAuthenticated = !!user?.authenticated;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      logoutMutation,
      refetch,
      registerMutation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}