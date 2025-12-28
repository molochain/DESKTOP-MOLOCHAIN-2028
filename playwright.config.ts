import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_URL = 'https://molochain.com';
const ADMIN_URL = 'https://admin.molochain.com';
const AUTH_URL = 'https://auth.molochain.com';
const MOLOLINK_URL = 'https://mololink.molochain.com';

const authDir = path.join(__dirname, 'e2e-tests/.auth');
const userAuthFile = path.join(authDir, 'user.json');
const adminAuthFile = path.join(authDir, 'admin.json');

const hasUserAuth = fs.existsSync(userAuthFile) && fs.statSync(userAuthFile).size > 10;
const hasAdminAuth = fs.existsSync(adminAuthFile) && fs.statSync(adminAuthFile).size > 10;
const hasCredentials = process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD;

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    ...(hasCredentials ? [{
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    }] : []),
    {
      name: 'public-pages',
      testMatch: /production-pages\.spec\.ts|service-pages\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: PRODUCTION_URL,
      },
    },
    ...(hasUserAuth || hasCredentials ? [{
      name: 'authenticated-pages',
      testMatch: /authenticated-pages\.spec\.ts/,
      dependencies: hasCredentials ? ['setup'] : [],
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: PRODUCTION_URL,
        storageState: userAuthFile,
      },
    }] : []),
    ...(hasAdminAuth || hasCredentials ? [{
      name: 'admin-pages',
      testMatch: /admin-pages\.spec\.ts/,
      dependencies: hasCredentials ? ['setup'] : [],
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: ADMIN_URL,
        storageState: adminAuthFile,
      },
    }] : []),
    {
      name: 'molochain-mobile',
      testMatch: /production-pages\.spec\.ts/,
      use: { 
        ...devices['iPhone 13'],
        baseURL: PRODUCTION_URL,
      },
    },
  ],
  outputDir: 'test-results/',
});
