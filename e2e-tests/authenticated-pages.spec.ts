import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://molochain.com';

interface AuthPageConfig {
  path: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const PORTAL_PAGES: AuthPageConfig[] = [
  { path: '/dashboard', name: 'Dashboard', priority: 'CRITICAL' },
  { path: '/profile', name: 'Profile', priority: 'CRITICAL' },
  { path: '/tracking', name: 'Tracking Dashboard', priority: 'HIGH' },
  { path: '/analytics', name: 'Advanced Analytics', priority: 'HIGH' },
  { path: '/smart-dashboard', name: 'Smart Dashboard', priority: 'MEDIUM' },
  { path: '/performance', name: 'Performance Dashboard', priority: 'MEDIUM' },
  { path: '/portfolio', name: 'Portfolio Dashboard', priority: 'MEDIUM' },
  { path: '/reports', name: 'Reports Dashboard', priority: 'MEDIUM' },
  { path: '/staking', name: 'Staking Dashboard', priority: 'MEDIUM' },
  { path: '/settings', name: 'Settings', priority: 'HIGH' },
  { path: '/files', name: 'File Management', priority: 'HIGH' },
  { path: '/documents', name: 'Documents', priority: 'HIGH' },
];

const ECOSYSTEM_PAGES: AuthPageConfig[] = [
  { path: '/ecosystem', name: 'Ecosystem Control Panel', priority: 'MEDIUM' },
  { path: '/developer', name: 'Developer Portal', priority: 'MEDIUM' },
  { path: '/api-keys', name: 'API Keys Management', priority: 'MEDIUM' },
  { path: '/achievements', name: 'Achievements', priority: 'LOW' },
  { path: '/visions', name: 'Visions Management', priority: 'LOW' },
  { path: '/performance-monitoring', name: 'Performance Monitoring', priority: 'LOW' },
];

const DEPARTMENT_PAGES: AuthPageConfig[] = [
  { path: '/departments', name: 'Department Navigator', priority: 'HIGH' },
  { path: '/departments/accounting', name: 'Accounting', priority: 'MEDIUM' },
  { path: '/departments/human-resources', name: 'Human Resources', priority: 'MEDIUM' },
  { path: '/departments/operations', name: 'Operations', priority: 'MEDIUM' },
  { path: '/departments/supply-chain', name: 'Supply Chain', priority: 'MEDIUM' },
  { path: '/departments/technology-engineering', name: 'Technology & Engineering', priority: 'MEDIUM' },
  { path: '/departments/marketing-branding', name: 'Marketing & Branding', priority: 'MEDIUM' },
  { path: '/departments/legal-risk', name: 'Legal & Risk', priority: 'MEDIUM' },
  { path: '/departments/management', name: 'Management', priority: 'MEDIUM' },
  { path: '/departments/strategy-development', name: 'Strategy & Development', priority: 'MEDIUM' },
  { path: '/departments/network-partners', name: 'Network & Partners', priority: 'MEDIUM' },
  { path: '/departments/learning-knowledge', name: 'Learning & Knowledge', priority: 'MEDIUM' },
  { path: '/departments/documents-library', name: 'Documents Library', priority: 'MEDIUM' },
  { path: '/departments/god-layer', name: 'God Layer', priority: 'LOW' },
  { path: '/departments/rayanavabrain', name: 'Rayanavabrain', priority: 'LOW' },
];

async function verifyAuthenticatedPage(browserPage: any, url: string, expectedPath: string) {
  const response = await browserPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  const status = response?.status() ?? 0;
  const finalUrl = browserPage.url();
  
  const wasRedirectedToLogin = finalUrl.includes('/login');
  if (wasRedirectedToLogin) {
    return { status: 401, finalUrl, authenticated: false };
  }
  
  expect(status, `Got server error ${status}`).toBeLessThan(500);
  
  const bodyText = await browserPage.locator('body').textContent();
  expect(bodyText?.toLowerCase()).not.toContain('internal server error');
  expect(bodyText?.toLowerCase()).not.toContain('something went wrong');
  expect(bodyText?.toLowerCase()).not.toContain('phusion passenger');
  
  return { status, finalUrl, authenticated: true };
}

test.describe('Portal Pages (Authenticated)', () => {
  for (const page of PORTAL_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${PRODUCTION_URL}${page.path}`;
      const result = await verifyAuthenticatedPage(browserPage, url, page.path);
      
      if (!result.authenticated) {
        test.skip(true, 'Not authenticated - redirected to login');
        return;
      }
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/portal${page.path.replace(/\//g, '-')}.png`,
        fullPage: false 
      });
    });
  }
});

test.describe('Ecosystem Pages (Authenticated)', () => {
  for (const page of ECOSYSTEM_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${PRODUCTION_URL}${page.path}`;
      const result = await verifyAuthenticatedPage(browserPage, url, page.path);
      
      if (!result.authenticated) {
        test.skip(true, 'Not authenticated - redirected to login');
        return;
      }
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/ecosystem${page.path.replace(/\//g, '-')}.png`,
        fullPage: false 
      });
    });
  }
});

test.describe('Department Dashboard Pages (Authenticated)', () => {
  for (const page of DEPARTMENT_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${PRODUCTION_URL}${page.path}`;
      const result = await verifyAuthenticatedPage(browserPage, url, page.path);
      
      if (!result.authenticated) {
        test.skip(true, 'Not authenticated - redirected to login');
        return;
      }
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/dept${page.path.replace(/\//g, '-')}.png`,
        fullPage: false 
      });
    });
  }
});
