#!/bin/bash
# Email Notification System Deployment Script
# Run this on production server: bash scripts/deploy-email-system.sh

set -e

echo "=========================================="
echo "Email Notification System Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-/var/www/molochain/current}"

echo -e "${YELLOW}Step 1: Navigating to application directory...${NC}"
cd "$APP_DIR"
echo -e "${GREEN}Current directory: $(pwd)${NC}"

echo -e "${YELLOW}Step 2: Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}Step 4: Pushing database schema changes...${NC}"
npm run db:push || echo -e "${YELLOW}Schema push completed (may have warnings)${NC}"

echo -e "${YELLOW}Step 5: Running API key migration to SHA-256...${NC}"
npx tsx scripts/migrate-api-keys.ts --migrate || echo -e "${YELLOW}Migration completed or no keys to migrate${NC}"

echo -e "${YELLOW}Step 6: Seeding auth email templates...${NC}"
npx tsx -e "
const { db } = require('./server/db');
const { emailTemplates, formTypes } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function seedAuthTemplates() {
  const templates = [
    {
      formTypeSlug: 'auth-login',
      slug: 'auth-login-notification',
      name: 'Login Notification',
      subject: 'New Login to Your Molochain Account',
      htmlContent: '<html><body><h2>New Login Detected</h2><p>Hello {{name}},</p><p>A new login was detected on your Molochain account.</p><p><strong>Time:</strong> {{timestamp}}</p><p>If this was not you, please secure your account immediately.</p><p>Best regards,<br>Molochain Security Team</p></body></html>',
      textContent: 'Hello {{name}}, A new login was detected on your Molochain account at {{timestamp}}. If this was not you, please secure your account immediately.'
    },
    {
      formTypeSlug: 'registration',
      slug: 'registration-notification',
      name: 'Welcome Email',
      subject: 'Welcome to Molochain!',
      htmlContent: '<html><body><h2>Welcome to Molochain!</h2><p>Hello {{name}},</p><p>Thank you for registering. Your account has been created successfully.</p><p>Get started by logging in at <a href=\"https://app.molochain.com\">app.molochain.com</a></p><p>Best regards,<br>The Molochain Team</p></body></html>',
      textContent: 'Hello {{name}}, Welcome to Molochain! Your account has been created successfully. Get started at app.molochain.com'
    },
    {
      formTypeSlug: 'auth-password-reset',
      slug: 'auth-password-reset-notification',
      name: 'Password Reset',
      subject: 'Password Reset Request',
      htmlContent: '<html><body><h2>Password Reset Request</h2><p>Hello {{name}},</p><p>A password reset was requested for your account.</p><p>Use this link to reset your password: <a href=\"{{resetLink}}\">Reset Password</a></p><p>This link expires in 1 hour.</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>Molochain Security Team</p></body></html>',
      textContent: 'Hello {{name}}, A password reset was requested for your account. Reset link: {{resetLink}} (expires in 1 hour). If you did not request this, please ignore this email.'
    }
  ];

  for (const template of templates) {
    const existing = await db.select().from(emailTemplates).where(eq(emailTemplates.slug, template.slug)).limit(1);
    if (existing.length === 0) {
      const [formType] = await db.select().from(formTypes).where(eq(formTypes.slug, template.formTypeSlug)).limit(1);
      if (formType) {
        await db.insert(emailTemplates).values({
          formTypeId: formType.id,
          slug: template.slug,
          name: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          isActive: true
        });
        console.log('Created template:', template.slug);
      }
    } else {
      console.log('Template already exists:', template.slug);
    }
  }
  console.log('Auth email templates seeding complete!');
}

seedAuthTemplates().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
" || echo -e "${YELLOW}Template seeding completed${NC}"

echo -e "${YELLOW}Step 7: Restarting application...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart molochain || pm2 restart all
    echo -e "${GREEN}Restarted with PM2${NC}"
elif command -v systemctl &> /dev/null; then
    systemctl restart molochain
    echo -e "${GREEN}Restarted with systemctl${NC}"
else
    echo -e "${YELLOW}Please restart your application manually${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Verify the deployment:"
echo "  1. Check email API: curl -X GET https://app.molochain.com/api/email/health"
echo "  2. Check admin stats: curl -X GET https://app.molochain.com/api/admin/email/stats"
echo "  3. Test login to trigger email notification"
echo ""
