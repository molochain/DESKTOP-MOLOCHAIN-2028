/**
 * Auth Redirect Utility
 * Handles production redirection to auth.molochain.com for SSO
 */

const AUTH_SUBDOMAIN = 'auth.molochain.com';
const PRODUCTION_DOMAIN = 'molochain.com';

export function shouldRedirectToAuthPortal(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // In development (localhost, replit), don't redirect
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('replit.dev') ||
    hostname.includes('replit.app')
  ) {
    return false;
  }
  
  // Admin subdomain uses its own secure authentication - no SSO redirect
  // This ensures admin access is isolated and more controlled
  if (hostname.startsWith('admin.')) {
    return false;
  }
  
  // In production, redirect if we're NOT on auth.molochain.com
  if (hostname.endsWith(PRODUCTION_DOMAIN) && !hostname.startsWith('auth.')) {
    return true;
  }
  
  return false;
}

export function getAuthPortalUrl(path: string, returnUrl?: string): string {
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  let url = `${protocol}//${AUTH_SUBDOMAIN}${path}`;
  
  if (returnUrl) {
    url += `?returnUrl=${encodeURIComponent(returnUrl)}`;
  }
  
  return url;
}

export function redirectToAuthPortal(path: string = '/login'): void {
  if (typeof window === 'undefined') return;
  
  // Build return URL to redirect back after auth
  const currentUrl = window.location.href;
  const returnUrl = currentUrl.includes('/login') || currentUrl.includes('/register')
    ? window.location.origin + '/dashboard'
    : currentUrl;
  
  const authUrl = getAuthPortalUrl(path, returnUrl);
  window.location.href = authUrl;
}

export function checkAndRedirectToAuth(pagePath: string): boolean {
  if (shouldRedirectToAuthPortal()) {
    redirectToAuthPortal(pagePath);
    return true;
  }
  return false;
}
