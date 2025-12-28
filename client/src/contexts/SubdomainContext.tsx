import { createContext, useContext, useMemo, ReactNode } from 'react';
import { getActiveSubdomain, SubdomainRole } from '@/lib/subdomain';

interface SubdomainContextValue {
  subdomain: SubdomainRole;
  isAdmin: boolean;
  isApp: boolean;
  isAuth: boolean;
  isPublic: boolean;
}

export const SubdomainContext = createContext<SubdomainContextValue | null>(null);

interface SubdomainProviderProps {
  children: ReactNode;
}

export function SubdomainProvider({ children }: SubdomainProviderProps) {
  const value = useMemo<SubdomainContextValue>(() => {
    const subdomain = getActiveSubdomain();
    return {
      subdomain,
      isAdmin: subdomain === 'admin',
      isApp: subdomain === 'app',
      isAuth: subdomain === 'auth',
      isPublic: subdomain === 'public'
    };
  }, []);

  return (
    <SubdomainContext.Provider value={value}>
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomain(): SubdomainContextValue {
  const context = useContext(SubdomainContext);
  if (!context) {
    throw new Error('useSubdomain must be used within a SubdomainProvider');
  }
  return context;
}
