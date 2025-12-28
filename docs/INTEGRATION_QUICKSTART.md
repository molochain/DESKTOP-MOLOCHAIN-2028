# Cross-Subdomain Email Integration - Quick Start Guide

**Version:** 2.0  
**Last Updated:** December 21, 2025  
**Status:** Production Ready

This guide provides everything the OTMS and Mololink teams need to integrate with the centralized email notification system.

---

## Table of Contents

1. [API Endpoint](#api-endpoint)
2. [Required Headers](#required-headers)
3. [Available Form Types](#available-form-types)
4. [Request Format](#request-format)
5. [Response Format](#response-format)
6. [Code Examples](#code-examples)
7. [Testing Your Integration](#testing-your-integration)
8. [Rate Limits](#rate-limits)
9. [Error Handling](#error-handling)
10. [Security Best Practices](#security-best-practices)
11. [Support](#support)

---

## API Endpoint

```
POST https://molochain.com/api/email/send
```

### Additional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/email/form-types` | List available form types |
| GET | `/api/email/health` | Check email service health |

---

## Required Headers

| Header | Value | Description |
|--------|-------|-------------|
| `X-API-Key` | Your API key | Provided by platform administrator |
| `X-Subdomain` | `opt` or `mololink` or `cms` | Your subdomain identifier |
| `Content-Type` | `application/json` | Required for all requests |

### Environment Variable Setup

```bash
# Add to your .env file
MOLOCHAIN_EMAIL_API_KEY=molo_your_api_key_here
```

---

## Available Form Types

### OTMS (opt.molochain.com)

| Form Type | ID | Use Case | Template Variables |
|-----------|-----|----------|-------------------|
| `booking-confirmation` | 12 | Confirm new shipment bookings | name, booking_id, origin, destination, date |
| `tracking-alert` | 14 | Shipment status updates | name, tracking_number, status, location, eta |
| `order-status` | 15 | Order lifecycle changes | name, order_id, status, carrier |
| `document-request` | 17 | Request documents from customers | name, document_type, deadline |
| `system-alert` | 18 | System notifications | title, message, priority |
| `bid-notification` | 13 | Bid notifications | name, bid_amount, listing_title |
| `auction-result` | 16 | Auction outcomes | name, winning_bid, auction_id |

### Mololink (mololink.molochain.com)

| Form Type | ID | Use Case | Template Variables |
|-----------|-----|----------|-------------------|
| `bid-notification` | 13 | New bid received on listing | name, bid_amount, listing_title, bidder_name |
| `auction-result` | 16 | Auction ended, winner notification | name, winning_bid, auction_id, pickup_date |
| `order-status` | 15 | Marketplace order updates | name, order_id, status |
| `system-alert` | 18 | Platform notifications | title, message, priority |

### CMS (cms.molochain.com)

| Form Type | ID | Use Case | Template Variables |
|-----------|-----|----------|-------------------|
| `system-alert` | 18 | Content management alerts | title, message, priority |

---

## Request Format

### Basic Request

```json
{
  "formType": "tracking-alert",
  "recipientEmail": "customer@example.com",
  "recipientName": "John Doe",
  "variables": {
    "name": "John Doe",
    "tracking_number": "MOLO-12345",
    "status": "In Transit",
    "location": "Rotterdam Port",
    "eta": "2025-12-25"
  },
  "priority": "normal"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `formType` | string | Yes | The form type slug (e.g., "tracking-alert") |
| `recipientEmail` | string | No* | Email address to send to (uses default recipients if omitted) |
| `recipientName` | string | No | Display name for the recipient |
| `variables` | object | Yes | Template variables to replace in the email |
| `priority` | string | No | Email priority: "low", "normal", "high" |

*If `recipientEmail` is omitted, the email is sent to the default recipients configured for that form type.

---

## Response Format

### Success (200)

```json
{
  "success": true,
  "message": "Email queued successfully",
  "data": {
    "emailId": "email_abc123",
    "status": "queued"
  },
  "subdomain": "opt",
  "formType": "tracking-alert"
}
```

### Error Responses

#### 401 - Invalid API Key

```json
{
  "success": false,
  "error": "Invalid or missing API key"
}
```

#### 400 - Invalid Form Type

```json
{
  "success": false,
  "error": "Form type 'unknown-type' not found or inactive"
}
```

#### 429 - Rate Limited

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## Code Examples

### Node.js / Express

```javascript
const axios = require('axios');

const MOLOCHAIN_EMAIL_API = 'https://molochain.com/api/email/send';
const API_KEY = process.env.MOLOCHAIN_EMAIL_API_KEY;
const SUBDOMAIN = 'opt'; // or 'mololink'

async function sendTrackingAlert(customerEmail, trackingNumber, status, location) {
  try {
    const response = await axios.post(MOLOCHAIN_EMAIL_API, {
      formType: 'tracking-alert',
      recipientEmail: customerEmail,
      variables: {
        name: 'Valued Customer',
        tracking_number: trackingNumber,
        status: status,
        location: location,
        eta: new Date(Date.now() + 86400000).toLocaleDateString()
      }
    }, {
      headers: {
        'X-API-Key': API_KEY,
        'X-Subdomain': SUBDOMAIN,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Email send failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
sendTrackingAlert('customer@example.com', 'MOLO-12345', 'In Transit', 'Rotterdam');
```

### TypeScript (with Types)

```typescript
import axios, { AxiosResponse } from 'axios';

interface EmailPayload {
  formType: string;
  recipientEmail?: string;
  recipientName?: string;
  variables: Record<string, string>;
  priority?: 'low' | 'normal' | 'high';
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    emailId: string;
    status: string;
  };
}

class MolochainEmailClient {
  private apiUrl = 'https://molochain.com/api/email/send';
  private apiKey: string;
  private subdomain: string;

  constructor(subdomain: 'opt' | 'mololink' | 'cms') {
    this.apiKey = process.env.MOLOCHAIN_EMAIL_API_KEY!;
    this.subdomain = subdomain;
  }

  async send(payload: EmailPayload): Promise<EmailResponse> {
    const response: AxiosResponse<EmailResponse> = await axios.post(
      this.apiUrl,
      payload,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'X-Subdomain': this.subdomain,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
}

// Usage
const emailClient = new MolochainEmailClient('opt');
await emailClient.send({
  formType: 'booking-confirmation',
  recipientEmail: 'customer@example.com',
  variables: {
    name: 'John Doe',
    booking_id: 'BK-2025-001',
    origin: 'Los Angeles',
    destination: 'Berlin',
    date: '2025-12-25'
  }
});
```

### PHP (Laravel)

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MolochainEmailService
{
    private string $apiUrl = 'https://molochain.com/api/email/send';
    private string $apiKey;
    private string $subdomain;

    public function __construct(string $subdomain = 'opt')
    {
        $this->apiKey = config('services.molochain.email_api_key');
        $this->subdomain = $subdomain;
    }

    public function send(string $formType, array $variables, ?string $recipientEmail = null): array
    {
        try {
            $response = Http::withHeaders([
                'X-API-Key' => $this->apiKey,
                'X-Subdomain' => $this->subdomain,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl, [
                'formType' => $formType,
                'recipientEmail' => $recipientEmail,
                'variables' => $variables,
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Molochain email failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function sendBookingConfirmation(string $email, array $booking): array
    {
        return $this->send('booking-confirmation', [
            'name' => $booking['customer_name'],
            'booking_id' => $booking['id'],
            'origin' => $booking['origin'],
            'destination' => $booking['destination'],
            'date' => $booking['date'],
        ], $email);
    }

    public function sendBidNotification(string $email, array $bid): array
    {
        return $this->send('bid-notification', [
            'name' => $bid['seller_name'],
            'listing_title' => $bid['listing_title'],
            'bid_amount' => number_format($bid['amount'], 2),
            'bidder_name' => $bid['bidder_name'],
        ], $email);
    }
}

// Usage in Controller
$emailService = app(MolochainEmailService::class);
$result = $emailService->sendBookingConfirmation('customer@example.com', [
    'customer_name' => 'Jane Doe',
    'id' => 'BK-2025-001',
    'origin' => 'Shanghai',
    'destination' => 'Hamburg',
    'date' => '2025-12-25',
]);
```

### Python

```python
import os
import requests
from typing import Dict, Optional
from datetime import datetime

class MolochainEmailClient:
    def __init__(self, subdomain: str = 'opt'):
        self.api_url = 'https://molochain.com/api/email/send'
        self.api_key = os.environ.get('MOLOCHAIN_EMAIL_API_KEY')
        self.subdomain = subdomain
    
    def send(self, form_type: str, variables: Dict[str, str], 
             recipient_email: Optional[str] = None,
             recipient_name: Optional[str] = None) -> dict:
        """Send email notification via Molochain API."""
        headers = {
            'X-API-Key': self.api_key,
            'X-Subdomain': self.subdomain,
            'Content-Type': 'application/json'
        }
        
        payload = {
            'formType': form_type,
            'variables': variables
        }
        
        if recipient_email:
            payload['recipientEmail'] = recipient_email
        if recipient_name:
            payload['recipientName'] = recipient_name
        
        try:
            response = requests.post(
                self.api_url, 
                json=payload, 
                headers=headers,
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_tracking_alert(self, email: str, tracking_number: str, 
                           status: str, location: str) -> dict:
        return self.send(
            form_type='tracking-alert',
            recipient_email=email,
            variables={
                'name': 'Valued Customer',
                'tracking_number': tracking_number,
                'status': status,
                'location': location,
                'eta': datetime.now().strftime('%Y-%m-%d')
            }
        )
    
    def send_auction_result(self, email: str, winner_name: str,
                           listing_title: str, winning_bid: float) -> dict:
        return self.send(
            form_type='auction-result',
            recipient_email=email,
            variables={
                'name': winner_name,
                'listing_title': listing_title,
                'winning_bid': f'${winning_bid:,.2f}',
                'auction_date': datetime.now().strftime('%Y-%m-%d')
            }
        )

# Usage
client = MolochainEmailClient(subdomain='mololink')
result = client.send_auction_result(
    email='winner@example.com',
    winner_name='Jane Smith',
    listing_title='Bulk Shipping Container',
    winning_bid=15000.00
)
print(result)
```

### Go

```go
package molochain

import (
    "bytes"
    "encoding/json"
    "net/http"
    "os"
)

type EmailClient struct {
    APIUrl    string
    APIKey    string
    Subdomain string
}

type EmailPayload struct {
    FormType       string            `json:"formType"`
    RecipientEmail string            `json:"recipientEmail,omitempty"`
    RecipientName  string            `json:"recipientName,omitempty"`
    Variables      map[string]string `json:"variables"`
}

type EmailResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message,omitempty"`
    Error   string `json:"error,omitempty"`
}

func NewEmailClient(subdomain string) *EmailClient {
    return &EmailClient{
        APIUrl:    "https://molochain.com/api/email/send",
        APIKey:    os.Getenv("MOLOCHAIN_EMAIL_API_KEY"),
        Subdomain: subdomain,
    }
}

func (c *EmailClient) Send(payload EmailPayload) (*EmailResponse, error) {
    jsonData, err := json.Marshal(payload)
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequest("POST", c.APIUrl, bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }

    req.Header.Set("X-API-Key", c.APIKey)
    req.Header.Set("X-Subdomain", c.Subdomain)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result EmailResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}

// Usage
// client := molochain.NewEmailClient("opt")
// result, _ := client.Send(molochain.EmailPayload{
//     FormType:       "tracking-alert",
//     RecipientEmail: "customer@example.com",
//     Variables: map[string]string{
//         "name":            "John Doe",
//         "tracking_number": "MOLO-12345",
//         "status":          "In Transit",
//     },
// })
```

---

## Testing Your Integration

### Step 1: Verify API Key

```bash
curl -s "https://molochain.com/api/email/form-types" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Subdomain: opt"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"id": 12, "slug": "booking-confirmation", "name": "Booking Confirmation"},
    {"id": 13, "slug": "bid-notification", "name": "Bid Notification"},
    ...
  ]
}
```

### Step 2: Check Health

```bash
curl -s "https://molochain.com/api/email/health"
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "email": {"success": true, "message": "Connection verified successfully"}
}
```

### Step 3: Send Test Email

```bash
curl -X POST "https://molochain.com/api/email/send" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Subdomain: opt" \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "system-alert",
    "recipientEmail": "your-test-email@example.com",
    "variables": {
      "title": "Integration Test",
      "message": "This is a test email from the integration setup.",
      "priority": "normal"
    }
  }'
```

---

## Rate Limits

| Tier | Limit | Reset |
|------|-------|-------|
| Standard | 10 requests/minute | Rolling window |
| Burst | 50 requests/minute | Contact admin for upgrade |

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1734825600
```

---

## Error Handling

### Best Practices

1. **Always check the `success` field** in responses
2. **Implement retry logic** with exponential backoff for 5xx errors
3. **Log failed emails** for manual review
4. **Validate email addresses** before sending
5. **Handle rate limits gracefully**

### Retry Logic Example (JavaScript)

```javascript
async function sendWithRetry(payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendEmail(payload);
      
      if (result.success) {
        return result;
      }
      
      // Don't retry client errors (4xx)
      if (result.error?.includes('Invalid') || result.error?.includes('not found')) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}
```

---

## Security Best Practices

1. **Store API keys in environment variables** - Never hardcode keys
2. **Never commit API keys to version control** - Use .env files
3. **Use HTTPS only** - All requests must be over HTTPS
4. **Validate user input** - Sanitize data before passing to the API
5. **Monitor usage** - Check the Communications Hub for email logs
6. **Rotate keys regularly** - Every 90 days recommended
7. **Report compromised keys immediately** - Contact admin@molochain.com

---

## Support

| Channel | Contact |
|---------|---------|
| Technical Support | support@molochain.com |
| Documentation | doc@molochain.com |
| Platform Admin | admin@molochain.com |
| Admin Panel | https://admin.molochain.com/admin/communications |

---

## Related Documentation

- [Full Integration Guide](./CROSS_SUBDOMAIN_EMAIL_INTEGRATION.md)
- [Admin User Guide](./EMAIL_NOTIFICATION_GUIDE.md)
- [API Key Management SOP](./API_KEY_MANAGEMENT_SOP.md)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-21 | 2.0 | Added TypeScript, Go examples; updated form types; enhanced security section |
| 2025-12-20 | 1.0 | Initial quick start guide |
