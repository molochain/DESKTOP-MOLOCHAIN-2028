# Molochain Email Notification System - Admin User Guide

**Version:** 2.0  
**Last Updated:** December 21, 2025  
**Audience:** Platform Administrators

---

## Overview

The Molochain Communications Hub is your central control panel for managing all email notifications across the platform ecosystem. This includes:

- Customer form submissions (Contact, Quote, Support, Feedback)
- Cross-subdomain integrations (OTMS, Mololink, CMS)
- Automated system alerts and notifications

**Access Path:** `https://admin.molochain.com/admin/communications`

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Accessing the Communications Hub](#accessing-the-communications-hub)
3. [Tab Guide](#tab-guide)
4. [Cross-Subdomain Integration](#cross-subdomain-integration)
5. [How Form Notifications Work](#how-form-notifications-work)
6. [Troubleshooting](#troubleshooting)
7. [Database Reference](#database-reference)
8. [Production Configuration](#production-configuration)
9. [Support](#support)

---

## Quick Start

### Current Configuration Status

| Form Type | Recipients | Status |
|-----------|------------|--------|
| Contact Form | doc@molochain.com | Ready |
| Quote Request | doc@molochain.com | Ready |
| Support Request | doc@molochain.com | Ready |
| Feedback | doc@molochain.com | Ready |
| Booking Confirmation (OTMS) | doc@molochain.com | Ready |
| Tracking Alert (OTMS) | doc@molochain.com | Ready |
| Bid Notification (Mololink) | doc@molochain.com | Ready |
| Auction Result (Mololink) | doc@molochain.com | Ready |

### Quick Health Check

```bash
# Check email system health
curl -s https://molochain.com/api/email/health | jq
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "email": {"success": true, "message": "Connection verified successfully"}
}
```

---

## Accessing the Communications Hub

1. Go to `https://admin.molochain.com`
2. Log in with your admin credentials
3. Navigate to **Operations** > **Communications Hub** in the sidebar
4. You'll see the main dashboard with multiple tabs

---

## Tab Guide

### 1. Submissions Tab

Shows all form submissions received from your website.

**Features:**
- View all submissions (Contact, Quote, Support, Feedback)
- Filter by form type, status, or date range
- Click any row to open submission details

**Status Management:**

| Status | Color | Description |
|--------|-------|-------------|
| Pending | Yellow | New submission, not yet reviewed |
| In Review | Blue | Currently being handled |
| Responded | Green | Reply sent to customer |
| Closed | Gray | Issue resolved |

**To Update Status:**
1. Click a submission row to open details
2. Use the "Status" dropdown
3. Changes save automatically

---

### 2. Statistics Tab

Visual dashboard showing submission analytics.

**Metrics Displayed:**
- Total Submissions (all-time count)
- Pending (awaiting review)
- In Review (currently processing)
- Responded (successfully replied)
- Bar chart by form type

---

### 3. Email Settings Tab

Configure your SMTP server for sending notifications.

**Configuration Fields:**

| Field | Description | Current Value |
|-------|-------------|---------------|
| SMTP Host | Mail server address | `localhost` (Postfix) |
| SMTP Port | Server port | `25` |
| From Name | Display name | `Molochain` |
| From Email | Sender address | `noreply@molochain.com` |
| Reply-To | Customer replies | `support@molochain.com` |
| Use TLS | Encryption | Off (local relay) |

**Actions:**
- **Test Connection** - Verify SMTP settings
- **Save Settings** - Save configuration

---

### 4. Templates & Recipients Tab

Manage email templates and notification recipients.

#### Email Templates

Templates define the notification email format. Each form type has its own template.

**Current Templates:**

| Template | Form Type | Status |
|----------|-----------|--------|
| contact-form-notification | Contact | Active |
| quote-request-notification | Quote | Active |
| support-request-notification | Support | Active |
| feedback-notification | Feedback | Active |
| booking-confirmation-template | Booking (OTMS) | Active |
| tracking-alert-template | Tracking (OTMS) | Active |
| bid-notification-template | Bid (Mololink) | Active |
| auction-result-template | Auction (Mololink) | Active |
| order-status-template | Order Status | Active |
| document-request-template | Document Request | Active |
| system-alert-template | System Alert | Active |

**Template Variables:**

| Variable | Description |
|----------|-------------|
| `{{name}}` | Submitter's name |
| `{{email}}` | Submitter's email |
| `{{subject}}` | Form subject |
| `{{message}}` | Form message |
| `{{date}}` | Submission date |
| `{{time}}` | Submission time |
| `{{tracking_number}}` | Tracking ID (OTMS) |
| `{{bid_amount}}` | Bid value (Mololink) |

#### Notification Recipients

Recipients receive email notifications when forms are submitted.

**To Add a Recipient:**
1. Click **Add Recipient**
2. Enter name and email
3. Select form type
4. Click **Add**

**To Enable/Disable:**
- Toggle the Status switch (green = active)

---

### 5. API Keys Tab

Manage API keys for cross-subdomain integrations.

**Current API Keys:**

| ID | Subdomain | Description | Status |
|----|-----------|-------------|--------|
| 1 | molochain-services | Internal platform | Active |
| 4 | cms | CMS integration | Active |
| 5 | opt | OTMS Platform | Active |
| 6 | mololink | Mololink Marketplace | Active |

**Creating an API Key:**
1. Click **Create API Key**
2. Enter subdomain name
3. Add description
4. Click **Create**
5. **IMPORTANT:** Copy the key immediately - shown once only!

**Security Notes:**
- Keys stored as SHA-256 hashes
- Deactivate unused keys
- Delete compromised keys immediately
- See [API Key Management SOP](./API_KEY_MANAGEMENT_SOP.md) for procedures

---

## Cross-Subdomain Integration

The email system supports integrations from multiple Molochain subdomains:

### Integrated Platforms

| Platform | Subdomain | Key ID | Form Types |
|----------|-----------|--------|------------|
| OTMS | opt.molochain.com | 5 | booking-confirmation, tracking-alert, order-status, document-request, system-alert |
| Mololink | mololink.molochain.com | 6 | bid-notification, auction-result, order-status, system-alert |
| CMS | cms.molochain.com | 4 | system-alert |

### Integration Flow

```
External Platform (OTMS/Mololink)
        |
        | POST /api/email/send
        | Headers: X-API-Key, X-Subdomain
        v
  molochain.com API
        |
        | Validates API key
        | Loads template
        v
  Email Service
        |
        | SMTP via Postfix
        v
  Recipient Inbox
```

### Documentation for Integration Teams

- [Quick Start Guide](./INTEGRATION_QUICKSTART.md) - For developers
- [Full Integration Guide](./CROSS_SUBDOMAIN_EMAIL_INTEGRATION.md) - Complete reference
- [API Key SOP](./API_KEY_MANAGEMENT_SOP.md) - Key management procedures

---

## How Form Notifications Work

### Customer Journey

```
Customer visits molochain.com
        |
        v
Fills out Contact/Quote form
        |
        v
Clicks "Submit"
        |
        v
Backend receives submission
        |
        v
Saves to database
        |
        v
Triggers email notification
        |
        v
Email sent to doc@molochain.com
        |
        v
Admin sees in Communications Hub
```

### Technical Flow

1. **Contact Form** (`/contact`) -> POST to `/api/contact/submit`
2. **Quote Form** (`/quote`) -> POST to `/api/quote`
3. Backend calls `emailService.notifyFormSubmission(formType, data)`
4. Email service fetches template and recipients from database
5. Sends email via Postfix SMTP
6. Logs delivery status

---

## Troubleshooting

### Emails Not Being Sent

**Checklist:**

1. **Verify SMTP Connection**
   - Go to Email Settings tab
   - Click "Test Connection"
   - Should show green "Verified" badge

2. **Check Recipients Are Active**
   - Go to Templates & Recipients tab
   - Verify recipient toggles are ON (green)

3. **Verify Email Health**
   ```bash
   curl -s https://molochain.com/api/email/health | jq
   ```

4. **Check Server Logs**
   ```bash
   # SSH to production
   ssh root@31.186.24.19
   
   # Check Postfix logs
   tail -f /var/log/mail.log
   
   # Check PM2 logs
   pm2 logs molochain-core --lines 50
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | Run `systemctl start postfix` |
| "Template not found" | Check template exists for form type |
| "No recipients" | Add active recipient for form type |
| "Rate limited" | Wait 1 minute between tests |
| "Invalid API key" | Verify X-API-Key header |

### API Key Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check key is active in database |
| Wrong subdomain | Match X-Subdomain to key's subdomain |
| Key not found | Generate new key via admin panel |

---

## Database Reference

### Tables

| Table | Purpose |
|-------|---------|
| `form_types` | Available form types (contact, quote, tracking-alert, etc.) |
| `email_templates` | Notification email templates |
| `notification_recipients` | Who receives notifications per form type |
| `email_settings` | SMTP configuration |
| `email_api_keys` | API keys for cross-subdomain access |
| `email_logs` | Delivery tracking and history |

### Useful Queries

```sql
-- List all active API keys
SELECT id, subdomain, is_active, created_at 
FROM email_api_keys WHERE is_active = true;

-- Recent email logs
SELECT template_slug, status, created_at 
FROM email_logs ORDER BY created_at DESC LIMIT 10;

-- Recipients by form type
SELECT ft.slug, nr.email, nr.is_active
FROM notification_recipients nr
JOIN form_types ft ON nr.form_type_id = ft.id
ORDER BY ft.id;
```

---

## Production Configuration

**Server:** 31.186.24.19  
**Application:** PM2 process `molochain-core`  
**Database:** PostgreSQL (localhost:5432/molochain_db)  
**SMTP:** Local Postfix relay (port 25)

### Form Types Configured

| ID | Slug | Recipients |
|----|------|------------|
| 1 | contact | doc@molochain.com |
| 2 | support | doc@molochain.com |
| 3 | quote | doc@molochain.com |
| 11 | feedback | doc@molochain.com |
| 12 | booking-confirmation | doc@molochain.com |
| 13 | bid-notification | doc@molochain.com |
| 14 | tracking-alert | doc@molochain.com |
| 15 | order-status | doc@molochain.com |
| 16 | auction-result | doc@molochain.com |
| 17 | document-request | doc@molochain.com |
| 18 | system-alert | doc@molochain.com |

---

## Support

| Channel | Contact |
|---------|---------|
| Technical Support | support@molochain.com |
| Documentation | doc@molochain.com |
| Platform Admin | admin@molochain.com |

---

## Related Documentation

- [Integration Quick Start](./INTEGRATION_QUICKSTART.md)
- [Full Integration Guide](./CROSS_SUBDOMAIN_EMAIL_INTEGRATION.md)
- [API Key Management SOP](./API_KEY_MANAGEMENT_SOP.md)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-21 | 2.0 | Added cross-subdomain section, updated form types, enhanced troubleshooting |
| 2025-12-20 | 1.0 | Initial admin guide |
