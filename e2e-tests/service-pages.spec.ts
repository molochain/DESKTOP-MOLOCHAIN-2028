import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://molochain.com';

const SERVICE_SLUGS = [
  'container', 'trucking', 'airfreight', 'rail', 'warehousing', 'bulk',
  'special-transport', 'customs', 'drop-shipping', 'port-services',
  'supply-chain', 'groupage', 'finance', 'documentation', 'consultation',
  'online-shopping', 'transit', 'cross-staffing', 'agency', 'tranship',
  'post', 'third-party', 'auction', 'blockchain', 'business', 'certificates',
  'chartering', 'companies', 'cooperation', 'distribution', 'ecosystem',
  'education', 'events', 'export', 'growth', 'help-develop', 'investing',
  'knowledge', 'logistics-market', 'modernization', 'network', 'organizations',
  'partnership', 'project', 'shopping', 'trading'
];

async function verifyServicePage(page: any, url: string, slug: string) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  const status = response?.status() ?? 0;
  const finalUrl = page.url();
  
  expect(status, `Expected status 2xx-3xx but got ${status}`).toBeGreaterThanOrEqual(200);
  expect(status, `Got server error ${status}`).toBeLessThan(500);
  
  const wasRedirectedToLogin = finalUrl.includes('/login');
  expect(wasRedirectedToLogin, `Service page redirected to login: ${finalUrl}`).toBe(false);
  
  const bodyText = await page.locator('body').textContent();
  expect(bodyText?.toLowerCase()).not.toContain('internal server error');
  expect(bodyText?.toLowerCase()).not.toContain('502 bad gateway');
  expect(bodyText?.toLowerCase()).not.toContain('something went wrong');
  expect(bodyText?.toLowerCase()).not.toContain('phusion passenger');
  
  return { status, finalUrl };
}

test.describe('Service Detail Pages (46 services)', () => {
  for (const slug of SERVICE_SLUGS) {
    test(`Service: ${slug}`, async ({ page }) => {
      const url = `${PRODUCTION_URL}/services/${slug}`;
      
      await verifyServicePage(page, url, slug);
      
      await page.screenshot({ 
        path: `e2e-tests/screenshots/service-${slug}.png`,
        fullPage: false 
      });
    });
  }
});
