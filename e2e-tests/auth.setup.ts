import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_URL = 'https://auth.molochain.com';
const ADMIN_AUTH_FILE = path.join(__dirname, '.auth/admin.json');
const USER_AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authenticate as regular user', async ({ page }) => {
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;
  
  if (!testEmail || !testPassword) {
    console.log('Skipping user auth - TEST_USER_EMAIL and TEST_USER_PASSWORD not set');
    return;
  }

  await page.goto(`${AUTH_URL}/login`);
  
  await page.fill('input[name="email"], input[type="email"]', testEmail);
  await page.fill('input[name="password"], input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  
  await page.context().storageState({ path: USER_AUTH_FILE });
  console.log('User authentication successful');
});

setup('authenticate as admin', async ({ page }) => {
  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.log('Skipping admin auth - TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD not set');
    return;
  }

  await page.goto(`${AUTH_URL}/login`);
  
  await page.fill('input[name="email"], input[type="email"]', adminEmail);
  await page.fill('input[name="password"], input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
  console.log('Admin authentication successful');
});
