import { test, expect } from '@playwright/test';

const ADMIN_URL = 'https://admin.molochain.com';

interface AdminPageConfig {
  path: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const ADMIN_PAGES: AdminPageConfig[] = [
  { path: '/admin', name: 'Admin Dashboard', priority: 'CRITICAL' },
  { path: '/admin/master', name: 'Master Control', priority: 'HIGH' },
  { path: '/admin/security', name: 'Security Center', priority: 'HIGH' },
  { path: '/admin/users', name: 'User Management', priority: 'HIGH' },
  { path: '/admin/health', name: 'Health Monitoring', priority: 'HIGH' },
  { path: '/admin/performance', name: 'Performance Monitor', priority: 'HIGH' },
  { path: '/admin/system', name: 'System Dashboard', priority: 'MEDIUM' },
  { path: '/admin/core-system', name: 'Core System Control', priority: 'MEDIUM' },
  { path: '/admin/operations', name: 'Operations Control', priority: 'MEDIUM' },
  { path: '/admin/activity', name: 'Activity Logs', priority: 'MEDIUM' },
  { path: '/admin/communications', name: 'Communications Hub', priority: 'MEDIUM' },
  { path: '/admin/integrations', name: 'Integrations', priority: 'MEDIUM' },
  { path: '/admin/analytics', name: 'Analytics Control', priority: 'MEDIUM' },
  { path: '/admin/configuration', name: 'Configuration', priority: 'MEDIUM' },
  { path: '/admin/settings', name: 'Admin Settings', priority: 'MEDIUM' },
  { path: '/admin/storage', name: 'Storage Settings', priority: 'LOW' },
  { path: '/admin/content', name: 'Content Manager', priority: 'LOW' },
  { path: '/admin/content/about', name: 'About Editor', priority: 'LOW' },
  { path: '/admin/content/services', name: 'Services Editor', priority: 'LOW' },
  { path: '/admin/content/branding', name: 'Branding Editor', priority: 'LOW' },
];

test.describe('Admin Portal Pages', () => {
  test.use({ storageState: 'e2e-tests/.auth/admin.json' });

  for (const page of ADMIN_PAGES) {
    test(`[${page.priority}] ${page.name} (${page.path})`, async ({ page: browserPage }) => {
      const url = `${ADMIN_URL}${page.path}`;
      const response = await browserPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      const status = response?.status() ?? 0;
      
      if (status === 401 || status === 403) {
        test.skip(true, 'Admin authentication required - skipping');
        return;
      }
      
      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(400);
      
      await browserPage.screenshot({ 
        path: `e2e-tests/screenshots/admin${page.path.replace(/\//g, '-')}.png`,
        fullPage: false 
      });
      
      const bodyText = await browserPage.locator('body').textContent();
      expect(bodyText?.toLowerCase()).not.toContain('internal server error');
      expect(bodyText?.toLowerCase()).not.toContain('something went wrong');
    });
  }
});
