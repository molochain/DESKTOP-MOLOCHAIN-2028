/**
 * Real Screenshot Capture Script
 * Captures actual screenshots of all key application pages using Playwright.
 * 
 * Prerequisites:
 *   - Chrome browser libraries must be available (libglib-2.0.so.0, etc.)
 *   - Run on production server or local machine with Chrome installed
 * 
 * Installation:
 *   npx playwright install chromium
 * 
 * Usage:
 *   npx tsx scripts/capture-real-screenshots.ts
 *   npx tsx scripts/capture-real-screenshots.ts --base-url=https://molochain.com
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = 'docs/assets/screenshots';
const DEFAULT_BASE_URL = 'http://127.0.0.1:5000';

interface PageInfo {
  path: string;
  name: string;
  waitFor?: string;
}

const pages: PageInfo[] = [
  { path: '/', name: '01-homepage' },
  { path: '/about', name: '02-about' },
  { path: '/services', name: '03-services' },
  { path: '/contact', name: '04-contact' },
  { path: '/login', name: '05-login' },
  { path: '/register', name: '06-register' },
  { path: '/faq', name: '07-faq' },
  { path: '/blog', name: '08-blog' },
  { path: '/team', name: '09-team' },
  { path: '/partners', name: '10-partners' },
  { path: '/brandbook', name: '11-brandbook' },
  { path: '/commodities', name: '12-commodities' },
  { path: '/tracking', name: '13-tracking' },
  { path: '/quote', name: '14-quote' },
  { path: '/service-recommender', name: '15-service-recommender' },
];

async function captureScreenshots() {
  const baseUrlArg = process.argv.find(arg => arg.startsWith('--base-url='));
  const baseUrl = baseUrlArg ? baseUrlArg.split('=')[1] : DEFAULT_BASE_URL;

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output directory: ${SCREENSHOTS_DIR}\n`);

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  let successCount = 0;
  let errorCount = 0;

  for (const pageInfo of pages) {
    const url = `${baseUrl}${pageInfo.path}`;
    const filename = `${pageInfo.name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    try {
      console.log(`Capturing ${pageInfo.name}...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000); // Wait for animations
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`  ✓ Saved: ${filepath}`);
      successCount++;
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
      errorCount++;
    }
  }

  await browser.close();
  
  console.log('\n' + '='.repeat(50));
  console.log(`Screenshot capture complete!`);
  console.log(`  Success: ${successCount}/${pages.length}`);
  console.log(`  Errors: ${errorCount}/${pages.length}`);
  console.log(`  Output: ${SCREENSHOTS_DIR}`);
}

captureScreenshots().catch(console.error);
