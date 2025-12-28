export type SubdomainRole = 'admin' | 'app' | 'auth' | 'public';

const PRODUCTION_DOMAIN = 'molochain.com';

const SUBDOMAIN_PREFIXES: Record<string, SubdomainRole> = {
  'admin': 'admin',
  'auth': 'auth', 
  'app': 'app'
} as const;

let cachedSubdomain: SubdomainRole | null = null;

function detectSubdomainFromHostname(): SubdomainRole {
  if (typeof window === 'undefined') {
    return 'public';
  }

  const hostname = String(window.location.hostname || '');
  
  for (const [prefix, role] of Object.entries(SUBDOMAIN_PREFIXES)) {
    const prefixWithDot = prefix + '.';
    if (hostname.indexOf(prefixWithDot) === 0) {
      return role;
    }
  }

  return 'public';
}

export function getActiveSubdomain(): SubdomainRole {
  if (cachedSubdomain === null) {
    cachedSubdomain = detectSubdomainFromHostname();
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[Subdomain] Detected:', cachedSubdomain, 'from hostname:', window.location.hostname);
    }
  }
  return cachedSubdomain;
}

export function resetSubdomainCache(): void {
  cachedSubdomain = null;
}

export function isAdminSubdomain(): boolean {
  return getActiveSubdomain() === 'admin';
}

export function isAppSubdomain(): boolean {
  return getActiveSubdomain() === 'app';
}

export function isAuthSubdomain(): boolean {
  return getActiveSubdomain() === 'auth';
}

export function isPublicSubdomain(): boolean {
  return getActiveSubdomain() === 'public';
}

function getSubdomainBaseUrl(subdomain: SubdomainRole): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (hostname === 'localhost' || hostname.endsWith('.replit.dev') || hostname.endsWith('.replit.app')) {
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
  }

  const baseDomain = hostname.replace(/^(admin|app|auth|www)\./, '');

  let targetHost = baseDomain;
  if (subdomain === 'admin') {
    targetHost = `admin.${baseDomain}`;
  } else if (subdomain === 'app') {
    targetHost = `app.${baseDomain}`;
  } else if (subdomain === 'auth') {
    targetHost = `auth.${baseDomain}`;
  }

  return `${protocol}//${targetHost}${port ? ':' + port : ''}`;
}

export function shouldRedirectRoute(
  path: string,
  routeSubdomain?: SubdomainRole | SubdomainRole[]
): { shouldRedirect: boolean; targetUrl?: string } {
  const currentSubdomain = getActiveSubdomain();
  
  if (routeSubdomain) {
    const allowedSubdomains = getSubdomainForRoute(routeSubdomain);
    
    if (!allowedSubdomains.includes(currentSubdomain)) {
      const targetSubdomain = allowedSubdomains[0];
      const targetBaseUrl = getSubdomainBaseUrl(targetSubdomain);
      return {
        shouldRedirect: true,
        targetUrl: `${targetBaseUrl}${path}`
      };
    }
  }

  if (path.startsWith('/admin')) {
    if (currentSubdomain !== 'admin') {
      const targetBaseUrl = getSubdomainBaseUrl('admin');
      return {
        shouldRedirect: true,
        targetUrl: `${targetBaseUrl}${path}`
      };
    }
  }

  if (path.startsWith('/dashboard') || path.startsWith('/profile')) {
    if (currentSubdomain !== 'public' && currentSubdomain !== 'admin') {
      const targetBaseUrl = getSubdomainBaseUrl('public');
      return {
        shouldRedirect: true,
        targetUrl: `${targetBaseUrl}${path}`
      };
    }
  }

  return { shouldRedirect: false };
}

export function getSubdomainForRoute(routeSubdomain?: SubdomainRole | SubdomainRole[]): SubdomainRole[] {
  if (!routeSubdomain) {
    return ['admin', 'app', 'auth', 'public'];
  }
  return Array.isArray(routeSubdomain) ? routeSubdomain : [routeSubdomain];
}

export function isRouteAllowedOnSubdomain(
  routeSubdomain: SubdomainRole | SubdomainRole[] | undefined,
  currentSubdomain: SubdomainRole
): boolean {
  const allowedSubdomains = getSubdomainForRoute(routeSubdomain);
  return allowedSubdomains.includes(currentSubdomain);
}
