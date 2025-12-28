import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://molochain.com';
const ADMIN_URL = 'https://admin.molochain.com';
const AUTH_URL = 'https://auth.molochain.com';
const MOLOLINK_URL = 'https://mololink.molochain.com';

interface PageTestConfig {
  path: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requiresAuth: boolean;
  subdomain: 'public' | 'admin' | 'auth' | 'mololink';
}

const PUBLIC_PAGES: PageTestConfig[] = [
  { path: '/', name: 'Homepage', priority: 'CRITICAL', requiresAuth: false, subdomain: 'public' },
  { path: '/about', name: 'About', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/contact', name: 'Contact', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/services', name: 'Services', priority: 'CRITICAL', requiresAuth: false, subdomain: 'public' },
  { path: '/quote', name: 'Quote', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/careers', name: 'Careers', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/partners', name: 'Partners', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/projects', name: 'Projects', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/commodities', name: 'Commodities', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/tracking', name: 'Tracking', priority: 'HIGH', requiresAuth: false, subdomain: 'public' },
  { path: '/blog', name: 'Blog', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/faq', name: 'FAQ', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/team', name: 'Team', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/terms', name: 'Terms of Service', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/privacy', name: 'Privacy Policy', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/guides', name: 'Guides', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/tracking-demo', name: 'Tracking Demo', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/shipment-tracking', name: 'Shipment Tracking', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/supply-chain-heatmap', name: 'Supply Chain Heatmap', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/carbon-footprint', name: 'Carbon Footprint', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/services-hub', name: 'Services Hub', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/service-recommender', name: 'Service Recommender', priority: 'MEDIUM', requiresAuth: false, subdomain: 'public' },
  { path: '/collaboration-demo', name: 'Collaboration Demo', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/document-processing', name: 'Document Processing', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/latest-projects', name: 'Latest Projects', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/tools', name: 'Developer Tools', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/commodity-tags', name: 'Commodity Tags', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/success', name: 'Success Page', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/developer-help', name: 'Developer Help', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/sdk-libraries', name: 'SDK Libraries', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/websocket-guide', name: 'WebSocket Guide', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/guide-integration', name: 'Guide Integration', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/ai-assistant', name: 'AI Assistant', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/ai', name: 'AI Hub', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/ai/rayanava', name: 'Rayanava AI', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/ai/rayanava-enhanced', name: 'Rayanava Enhanced', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/authentication-guide', name: 'Authentication Guide', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/mololink', name: 'Mololink Main', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/mololink/companies', name: 'Mololink Companies', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/mololink/jobs', name: 'Mololink Jobs', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/mololink/search', name: 'Mololink Search', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
];

const AUTH_PAGES: PageTestConfig[] = [
  { path: '/login', name: 'Login', priority: 'CRITICAL', requiresAuth: false, subdomain: 'auth' },
  { path: '/register', name: 'Register', priority: 'CRITICAL', requiresAuth: false, subdomain: 'auth' },
  { path: '/forgot-password', name: 'Forgot Password', priority: 'MEDIUM', requiresAuth: false, subdomain: 'auth' },
];

const ADMIN_LANDING: PageTestConfig[] = [
  { path: '/', name: 'Admin Landing', priority: 'CRITICAL', requiresAuth: false, subdomain: 'admin' },
];

const MOLOLINK_PAGES: PageTestConfig[] = [
  { path: '/solutions', name: 'Solutions', priority: 'CRITICAL', requiresAuth: false, subdomain: 'mololink' },
  { path: '/resources', name: 'Resources', priority: 'HIGH', requiresAuth: false, subdomain: 'mololink' },
  { path: '/pricing', name: 'Pricing', priority: 'HIGH', requiresAuth: false, subdomain: 'mololink' },
];

const BRANDBOOK_PAGES: PageTestConfig[] = [
  { path: '/brandbook', name: 'Brandbook Home', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/brandbook/colors', name: 'Brand Colors', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/brandbook/typography', name: 'Brand Typography', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/brandbook/logos', name: 'Brand Logos', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/brandbook/components', name: 'Brand Components', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/brandbook/tokens', name: 'Design Tokens', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
  { path: '/brandbook/guidelines', name: 'Brand Guidelines', priority: 'LOW', requiresAuth: false, subdomain: 'public' },
];

function getBaseUrl(subdomain: string): string {
  switch (subdomain) {
    case 'admin': return ADMIN_URL;
    case 'auth': return AUTH_URL;
    case 'mololink': return MOLOLINK_URL;
    default: return PRODUCTION_URL;
  }
}

async function verifyPageLoads(browserPage: any, url: string, expectedPath: string) {
  const response = await browserPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  const status = response?.status() ?? 0;
  const finalUrl = browserPage.url();
  
  expect(status, `Expected status 2xx-3xx but got ${status}`).toBeGreaterThanOrEqual(200);
  expect(status, `Got server error ${status}`).toBeLessThan(500);
  
  const wasRedirectedToLogin = finalUrl.includes('/login') && !expectedPath.includes('/login');
  expect(wasRedirectedToLogin, `Page redirected to login unexpectedly: ${finalUrl}`).toBe(false);
  
  const bodyText = await browserPage.locator('body').textContent();
  expect(bodyText?.toLowerCase()).not.toContain('internal server error');
  expect(bodyText?.toLowerCase()).not.toContain('502 bad gateway');
  expect(bodyText?.toLowerCase()).not.toContain('something went wrong');
  expect(bodyText?.toLowerCase()).not.toContain('phusion passenger');
  
  return { status, finalUrl, bodyText };
}

test.describe('molochain.com - Public Pages', () => {
  for (const page of PUBLIC_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${getBaseUrl(page.subdomain)}${page.path}`;
      
      await verifyPageLoads(browserPage, url, page.path);
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/public${page.path.replace(/\//g, '-') || '-home'}.png`,
        fullPage: false 
      });
      
      const title = await browserPage.title();
      expect(title).toBeTruthy();
    });
  }
});

test.describe('auth.molochain.com - Auth Pages', () => {
  for (const page of AUTH_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${AUTH_URL}${page.path}`;
      
      await verifyPageLoads(browserPage, url, page.path);
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/auth${page.path.replace(/\//g, '-') || '-home'}.png`,
        fullPage: false 
      });
    });
  }
});

test.describe('admin.molochain.com - Admin Landing', () => {
  for (const page of ADMIN_LANDING) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${ADMIN_URL}${page.path}`;
      
      await verifyPageLoads(browserPage, url, page.path);
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/admin-landing.png`,
        fullPage: false 
      });
    });
  }
});

test.describe('mololink.molochain.com - Mololink Pages', () => {
  for (const page of MOLOLINK_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${MOLOLINK_URL}${page.path}`;
      
      await verifyPageLoads(browserPage, url, page.path);
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/mololink${page.path.replace(/\//g, '-') || '-home'}.png`,
        fullPage: false 
      });
    });
  }
});

test.describe('molochain.com - Brandbook Pages', () => {
  for (const page of BRANDBOOK_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${PRODUCTION_URL}${page.path}`;
      
      await verifyPageLoads(browserPage, url, page.path);
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/brandbook${page.path.replace(/\//g, '-') || '-home'}.png`,
        fullPage: false 
      });
    });
  }
});
