# Cross-Subdomain Email Notification Integration Guide

**Version:** 2.0  
**Last Updated:** December 21, 2025  
**Status:** Production Ready

This guide explains how to integrate **opt.molochain.com** (OTMS) and **mololink.molochain.com** with the centralized email notification system hosted on **molochain.com**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Why Centralized Email?](#why-centralized-email)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Available Form Types](#available-form-types)
6. [Code Examples](#code-examples)
7. [Template Variables](#template-variables)
8. [Rate Limits](#rate-limits)
9. [Error Handling](#error-handling)
10. [Security Best Practices](#security-best-practices)
11. [Monitoring & Logging](#monitoring--logging)
12. [Troubleshooting](#troubleshooting)
13. [Support](#support)

---

## Architecture Overview

```
+---------------------------------------------------------------------+
|                    MOLOCHAIN.COM (Central Hub)                       |
|                                                                       |
|  +---------------------------------------------------------------+   |
|  |           Centralized Email Notification System                |   |
|  |                                                                 |   |
|  |  - Email Templates (configurable per form type)               |   |
|  |  - Recipients Database (configurable per form type)           |   |
|  |  - API Key Management (SHA-256 hashed)                        |   |
|  |  - SMTP via Postfix (local relay)                             |   |
|  |  - Rate Limiting (3-tier: general, auth, password)            |   |
|  |  - Logging & Monitoring (Communications Hub)                   |   |
|  |  - Security: Cache bypass, CSRF protection                    |   |
|  +---------------------------------------------------------------+   |
|                              ^                                        |
|              Public API: POST /api/email/send                         |
|              Auth: X-API-Key + X-Subdomain headers                    |
+------------------------------+----------------------------------------+
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+      +---------------+      +---------------+
| OPT.MOLOCHAIN |      |   MOLOLINK    |      |     CMS       |
|  (OTMS)       |      |  Marketplace  |      |  (Laravel)    |
|               |      |               |      |               |
| - Bookings    |      | - Auctions    |      | - Content     |
| - Tracking    |      | - Bids        |      | - Alerts      |
| - Orders      |      | - Results     |      |               |
+---------------+      +---------------+      +---------------+
```

---

## Why Centralized Email?

A separate containerized email service is **not necessary** because:

| Benefit | Description |
|---------|-------------|
| **Already Centralized** | Email API publicly accessible at `https://molochain.com/api/email/send` |
| **Stateless Integration** | Each subdomain only needs an API key - no state management |
| **Single Source of Truth** | All templates, recipients, and logs managed centrally |
| **Consistent Branding** | All emails use unified Molochain branding |
| **Simplified Maintenance** | One system to update, one set of templates |
| **Security** | Centralized API key management with SHA-256 hashing |
| **Monitoring** | Single Communications Hub for all email logs |

---

## API Endpoints

### Base URL

```
https://molochain.com/api/email
```

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/send` | Send an email using a template | Yes |
| POST | `/notify-submission` | Send form submission notification | Yes |
| GET | `/form-types` | List available form types | Yes |
| GET | `/health` | Check email service health | No |

---

## Authentication

All API requests (except `/health`) require authentication headers:

```
X-API-Key: molo_your_api_key_here
X-Subdomain: opt  (or mololink, cms)
Content-Type: application/json
```

### API Key Security

| Aspect | Details |
|--------|---------|
| Format | `molo_` prefix + 64 hex characters |
| Storage | SHA-256 hashed in database (never plaintext) |
| Rotation | Every 90 days recommended |
| Distribution | Via secure channels only (see SOP) |

### Current API Keys

| Subdomain | Description | Environment Variable |
|-----------|-------------|---------------------|
| `opt` | OTMS Operations (opt.molochain.com) | `MOLOCHAIN_EMAIL_API_KEY` |
| `mololink` | Marketplace (mololink.molochain.com) | `MOLOCHAIN_EMAIL_API_KEY` |
| `cms` | Content Management (cms.molochain.com) | `MOLOCHAIN_EMAIL_API_KEY` |
| `molochain-services` | Internal platform services | `MOLOCHAIN_EMAIL_API_KEY` |

---

## Available Form Types

### Complete Form Type Reference

| ID | Slug | Description | Primary Use |
|----|------|-------------|-------------|
| 1 | `contact` | Contact Form | General inquiries |
| 2 | `support` | Support Request | Technical support |
| 3 | `quote` | Quote Request | Service quotes |
| 11 | `feedback` | Feedback | Customer feedback |
| 12 | `booking-confirmation` | Booking Confirmation | OTMS bookings |
| 13 | `bid-notification` | Bid Notification | Mololink auctions |
| 14 | `tracking-alert` | Tracking Alert | OTMS shipment updates |
| 15 | `order-status` | Order Status Update | Order changes |
| 16 | `auction-result` | Auction Result | Mololink auction outcomes |
| 17 | `document-request` | Document Request | Document requests |
| 18 | `system-alert` | System Alert | System notifications |

### Form Types by Subdomain

#### OTMS (opt.molochain.com)

- `booking-confirmation` - Confirm new shipment bookings
- `tracking-alert` - Shipment tracking updates
- `order-status` - Order lifecycle changes
- `document-request` - Request documents from customers
- `bid-notification` - Bid notifications for freight
- `auction-result` - Freight auction results
- `system-alert` - System notifications

#### Mololink (mololink.molochain.com)

- `bid-notification` - New bid received on marketplace listing
- `auction-result` - Auction ended, winner notification
- `order-status` - Marketplace order updates
- `system-alert` - Platform notifications

#### CMS (cms.molochain.com)

- `system-alert` - Content management alerts

---

## Code Examples

### Node.js / Express (OTMS)

```typescript
// services/emailNotification.ts
import axios from 'axios';

const EMAIL_API_URL = 'https://molochain.com/api/email';
const API_KEY = process.env.MOLOCHAIN_EMAIL_API_KEY;

interface EmailPayload {
  formType: string;
  recipientEmail?: string;
  variables: Record<string, string>;
}

export async function sendEmailNotification(payload: EmailPayload): Promise<boolean> {
  try {
    const response = await axios.post(`${EMAIL_API_URL}/send`, payload, {
      headers: {
        'X-API-Key': API_KEY,
        'X-Subdomain': 'opt',
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.success;
  } catch (error) {
    console.error('Email notification failed:', error);
    return false;
  }
}

// Usage: Tracking Alert
await sendEmailNotification({
  formType: 'tracking-alert',
  recipientEmail: 'customer@example.com',
  variables: {
    name: 'John Doe',
    tracking_number: 'MOLO-2025-12345',
    status: 'In Transit',
    location: 'Istanbul Hub',
    estimated_delivery: 'December 25, 2025'
  }
});

// Usage: Booking Confirmation
await sendEmailNotification({
  formType: 'booking-confirmation',
  recipientEmail: 'customer@example.com',
  variables: {
    name: 'Jane Smith',
    booking_id: 'BK-2025-789',
    service: 'Air Freight',
    origin: 'Los Angeles, USA',
    destination: 'Berlin, Germany',
    date: 'December 20, 2025'
  }
});
```

### PHP / Laravel (Mololink)

```php
<?php
// app/Services/EmailNotificationService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailNotificationService
{
    private string $apiUrl = 'https://molochain.com/api/email';
    private string $apiKey;
    private string $subdomain = 'mololink';

    public function __construct()
    {
        $this->apiKey = config('services.molochain.email_api_key');
    }

    public function send(string $formType, array $variables, ?string $recipientEmail = null): bool
    {
        try {
            $response = Http::withHeaders([
                'X-API-Key' => $this->apiKey,
                'X-Subdomain' => $this->subdomain,
            ])->post("{$this->apiUrl}/send", [
                'formType' => $formType,
                'recipientEmail' => $recipientEmail,
                'variables' => $variables,
            ]);

            return $response->json('success', false);
        } catch (\Exception $e) {
            Log::error('Email notification failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
    
    // Bid Notification
    public function notifyBid(string $email, array $bidDetails): bool
    {
        return $this->send('bid-notification', [
            'name' => $bidDetails['seller_name'],
            'auction_id' => $bidDetails['auction_id'],
            'bid_amount' => number_format($bidDetails['amount'], 2),
            'cargo_description' => $bidDetails['cargo'],
            'current_status' => $bidDetails['status'],
        ], $email);
    }
    
    // Auction Result
    public function notifyAuctionResult(string $email, array $auctionDetails): bool
    {
        return $this->send('auction-result', [
            'name' => $auctionDetails['winner_name'],
            'auction_id' => $auctionDetails['auction_id'],
            'winning_bid' => number_format($auctionDetails['final_amount'], 2),
            'cargo_description' => $auctionDetails['cargo'],
            'pickup_date' => $auctionDetails['pickup_date'],
            'delivery_date' => $auctionDetails['delivery_date'],
        ], $email);
    }
}

// Usage in Controller
$emailService = app(EmailNotificationService::class);
$emailService->notifyBid('carrier@example.com', [
    'seller_name' => 'Carrier Corp',
    'auction_id' => 'AUC-2025-456',
    'amount' => 5000.00,
    'cargo' => '20ft Container - Electronics',
    'status' => 'New Bid Received',
]);
```

### Python (Any Service)

```python
# services/email_notification.py
import os
import requests
from typing import Dict, Optional

EMAIL_API_URL = "https://molochain.com/api/email"
API_KEY = os.environ.get("MOLOCHAIN_EMAIL_API_KEY")
SUBDOMAIN = "opt"  # or "mololink", "cms"

def send_email_notification(
    form_type: str,
    variables: Dict[str, str],
    recipient_email: Optional[str] = None
) -> bool:
    """Send email notification via Molochain central hub."""
    try:
        response = requests.post(
            f"{EMAIL_API_URL}/send",
            json={
                "formType": form_type,
                "recipientEmail": recipient_email,
                "variables": variables
            },
            headers={
                "X-API-Key": API_KEY,
                "X-Subdomain": SUBDOMAIN,
                "Content-Type": "application/json"
            },
            timeout=10
        )
        return response.json().get("success", False)
    except Exception as e:
        print(f"Email notification failed: {e}")
        return False

# Usage: Order Status Update
send_email_notification(
    form_type="order-status",
    recipient_email="customer@example.com",
    variables={
        "name": "John Doe",
        "order_id": "ORD-2025-12345",
        "status": "Shipped",
        "carrier": "DHL Express",
        "tracking_url": "https://track.dhl.com/12345"
    }
)
```

---

## Template Variables

### Common Variables (Auto-injected)

| Variable | Description |
|----------|-------------|
| `{{subdomain}}` | Origin subdomain (auto-detected from X-Subdomain header) |
| `{{timestamp}}` | ISO timestamp |
| `{{date}}` | Formatted date (e.g., "December 21, 2025") |
| `{{time}}` | Formatted time (e.g., "3:45 PM") |

### Custom Variables by Form Type

| Form Type | Recommended Variables |
|-----------|----------------------|
| `tracking-alert` | `name`, `tracking_number`, `status`, `location`, `estimated_delivery` |
| `booking-confirmation` | `name`, `booking_id`, `service`, `origin`, `destination`, `date` |
| `bid-notification` | `name`, `auction_id`, `bid_amount`, `cargo_description`, `current_status` |
| `auction-result` | `name`, `auction_id`, `winning_bid`, `cargo_description`, `pickup_date`, `delivery_date` |
| `order-status` | `name`, `order_id`, `status`, `carrier`, `tracking_url` |
| `document-request` | `name`, `document_type`, `deadline`, `instructions` |
| `system-alert` | `title`, `message`, `priority`, `action_url` |

---

## Rate Limits

| Category | Limit | Description |
|----------|-------|-------------|
| General emails | 10 requests/minute | Standard notification limit |
| Auth emails | 5 requests/minute | Login/register emails |
| Password reset | 3 requests/15 minutes | Password recovery |

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1734825600
```

### Handling Rate Limits

```javascript
async function sendWithRateLimit(payload) {
  const response = await fetch(API_URL, { /* ... */ });
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitMs = (parseInt(resetTime) * 1000) - Date.now();
    
    console.log(`Rate limited. Waiting ${waitMs}ms...`);
    await new Promise(r => setTimeout(r, waitMs));
    
    return sendWithRateLimit(payload); // Retry
  }
  
  return response.json();
}
```

---

## Error Handling

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "subdomain": "opt",
  "formType": "tracking-alert"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Form type 'invalid-type' not found or inactive"
}
```

### HTTP Status Codes

| Code | Description | Action |
|------|-------------|--------|
| 200 | Success | Email queued/sent |
| 400 | Validation error | Check request body |
| 401 | Invalid/missing API key | Verify X-API-Key header |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | Internal server error | Retry with backoff |

---

## Security Best Practices

1. **Store API keys securely** - Use environment variables, never commit to git
2. **Use HTTPS only** - All requests must be over HTTPS
3. **Validate inputs** - Sanitize user data before passing to the API
4. **Handle errors gracefully** - Don't expose API errors to end users
5. **Monitor usage** - Check the Communications Hub for email logs
6. **Rotate keys regularly** - Every 90 days recommended
7. **Report compromises** - Contact admin@molochain.com immediately

---

## Monitoring & Logging

### Communications Hub

Access the monitoring dashboard at:
```
https://admin.molochain.com/admin/communications
```

Features:
- Real-time email delivery status
- Email logs with timestamps
- Failed delivery alerts
- Rate limit monitoring
- Template management

### Log Queries (Database)

```sql
-- Recent emails by subdomain
SELECT * FROM email_logs 
WHERE subdomain = 'opt' 
ORDER BY created_at DESC 
LIMIT 10;

-- Failed emails
SELECT * FROM email_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Email count by form type (last 24h)
SELECT template_slug, COUNT(*) 
FROM email_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY template_slug;
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/missing API key | Verify X-API-Key header |
| 401 Unauthorized | Key deactivated | Check is_active in database |
| 400 Bad Request | Invalid form type | Check form type slug |
| 429 Too Many Requests | Rate limit | Wait for reset window |
| 500 Server Error | SMTP issue | Check email health endpoint |

### Verification Commands

```bash
# Check email API health
curl -s 'https://molochain.com/api/email/health' | jq

# List available form types (requires API key)
curl -s 'https://molochain.com/api/email/form-types' \
  -H 'X-API-Key: YOUR_KEY' \
  -H 'X-Subdomain: opt' | jq

# Send test email
curl -X POST 'https://molochain.com/api/email/send' \
  -H 'X-API-Key: YOUR_KEY' \
  -H 'X-Subdomain: opt' \
  -H 'Content-Type: application/json' \
  -d '{
    "formType": "system-alert",
    "recipientEmail": "test@example.com",
    "variables": {
      "title": "Test",
      "message": "Integration test"
    }
  }' | jq
```

---

## Support

| Channel | Contact |
|---------|---------|
| Admin Panel | https://admin.molochain.com/admin/communications |
| Technical Support | support@molochain.com |
| Documentation | doc@molochain.com |
| Platform Admin | admin@molochain.com |

---

## Related Documentation

- [Quick Start Guide](./INTEGRATION_QUICKSTART.md)
- [Admin User Guide](./EMAIL_NOTIFICATION_GUIDE.md)
- [API Key Management SOP](./API_KEY_MANAGEMENT_SOP.md)

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2025-12-21 | 2.0 | Major update: Added troubleshooting, monitoring, complete form types |
| 2025-12-20 | 1.1 | Added API keys for opt, mololink, cms |
| 2025-12-20 | 1.0 | Initial integration documentation |
