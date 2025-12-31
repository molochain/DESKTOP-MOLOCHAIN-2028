import { useState, useEffect, useCallback } from 'react';
import { AuthState, User } from '@/types';
import { login as apiLogin, logout as apiLogout, api } from '@/lib/api';

const STORAGE_KEY = 'molochain_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface StoredSession {
  user: User;
  expiresAt: number;
}

function isValidSession(session: StoredSession | null): session is StoredSession {
  if (!session) return false;
  if (!session.user || !session.expiresAt) return false;
  if (Date.now() > session.expiresAt) return false;
  if (session.user.role !== 'admin') return false;
  return true;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const session: StoredSession = JSON.parse(stored);
        
        if (!isValidSession(session)) {
          sessionStorage.removeItem(STORAGE_KEY);
          setState({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Verify session is still valid on backend
        try {
          await api.get('/api/auth/session');
          setState({ user: session.user, isAuthenticated: true, isLoading: false });
        } catch {
          // Session invalid on backend, clear local
          sessionStorage.removeItem(STORAGE_KEY);
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      
      if (data.authenticated) {
        // Verify user has admin role
        if (data.role !== 'admin') {
          return { success: false, error: 'Access denied. Admin privileges required.' };
        }

        const user: User = {
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
          permissions: data.permissions || [],
        };

        const session: StoredSession = {
          user,
          expiresAt: Date.now() + SESSION_DURATION,
        };

        // Use sessionStorage for better security (cleared on browser close)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setState({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      
      return { success: false, error: data.message || 'Invalid credentials' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Continue with local logout even if backend fails
    }
    
    sessionStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return state.user?.permissions?.includes(permission) ?? false;
  }, [state.user]);

  const isAdmin = useCallback(() => {
    return state.user?.role === 'admin';
  }, [state.user]);

  return { 
    ...state, 
    login, 
    logout, 
    hasPermission, 
    isAdmin 
  };
}
