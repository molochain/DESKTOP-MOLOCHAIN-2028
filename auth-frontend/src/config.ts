export const API_BASE_URL = 'https://mololink.molochain.com/api/auth';

export const TRUSTED_DOMAINS = [
  'molochain.com',
  'www.molochain.com',
  'mololink.molochain.com',
  'opt.molochain.com',
  'app.molochain.com',
  'admin.molochain.com',
  'auth.molochain.com'
];

export function isValidReturnUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return TRUSTED_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

export function getReturnUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');
  
  if (returnUrl && isValidReturnUrl(returnUrl)) {
    return returnUrl;
  }
  
  return null;
}
