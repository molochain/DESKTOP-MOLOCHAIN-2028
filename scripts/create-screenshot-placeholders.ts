import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = 'docs/assets/screenshots';

const pages = [
  { name: '01-homepage', title: 'Homepage', desc: 'Main landing page with hero section, services overview, and CTA' },
  { name: '02-about', title: 'About Page', desc: 'Company information, mission, vision, and team highlights' },
  { name: '03-services', title: 'Services Page', desc: 'Logistics services catalog with categories and details' },
  { name: '04-contact', title: 'Contact Page', desc: 'Contact form, office locations map, and business hours' },
  { name: '05-login', title: 'Login Page', desc: 'User authentication with email/password and SSO options' },
  { name: '06-register', title: 'Register Page', desc: 'New user registration form with validation' },
  { name: '07-faq', title: 'FAQ Page', desc: 'Frequently asked questions with accordion layout' },
  { name: '08-blog', title: 'Blog Page', desc: 'News and articles with categories and search' },
  { name: '09-team', title: 'Team Page', desc: 'Team members grid with roles and bios' },
  { name: '10-partners', title: 'Partners Page', desc: 'Partner logos and collaboration information' },
  { name: '11-brandbook', title: 'Brandbook', desc: 'Brand guidelines, colors, typography, and assets' },
  { name: '12-commodities', title: 'Commodities', desc: 'Commodity listings with pricing and availability' },
  { name: '13-tracking', title: 'Tracking Page', desc: 'Shipment tracking with real-time status updates' },
  { name: '14-quote', title: 'Quote Request', desc: 'Service quote form with cargo and route details' },
  { name: '15-service-recommender', title: 'AI Service Recommender', desc: 'AI-powered service recommendations based on needs' },
];

async function createPlaceholders() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  for (const page of pages) {
    // Create a 1280x800 image with light gray background
    const img = new Jimp({ width: 1280, height: 800, color: 0xf0f4f8ff });
    
    // Header bar (white)
    for (let x = 0; x < 1280; x++) {
      for (let y = 0; y < 60; y++) {
        img.setPixelColor(0xffffffff, x, y);
      }
    }
    
    // Blue accent line
    for (let x = 0; x < 1280; x++) {
      for (let y = 60; y < 64; y++) {
        img.setPixelColor(0x3b82f6ff, x, y);
      }
    }
    
    // Center content area (white box)
    const boxX = 140, boxY = 150, boxW = 1000, boxH = 500;
    for (let x = boxX; x < boxX + boxW; x++) {
      for (let y = boxY; y < boxY + boxH; y++) {
        img.setPixelColor(0xffffffff, x, y);
      }
    }
    
    // Border
    for (let x = boxX; x < boxX + boxW; x++) {
      img.setPixelColor(0xe5e7ebff, x, boxY);
      img.setPixelColor(0xe5e7ebff, x, boxY + boxH - 1);
    }
    for (let y = boxY; y < boxY + boxH; y++) {
      img.setPixelColor(0xe5e7ebff, boxX, y);
      img.setPixelColor(0xe5e7ebff, boxX + boxW - 1, y);
    }
    
    // Add a logo placeholder circle
    const centerX = 640, centerY = 300, radius = 40;
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      for (let y = centerY - radius; y <= centerY + radius; y++) {
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (dist <= radius) {
          img.setPixelColor(0x3b82f6ff, x, y);
        }
      }
    }
    
    const filepath = path.join(SCREENSHOTS_DIR, `${page.name}.png`);
    await img.write(filepath as `${string}.${string}`);
    console.log(`Created: ${filepath} - ${page.title}`);
  }
  
  console.log('\nAll placeholder screenshots created!');
}

createPlaceholders().catch(console.error);
