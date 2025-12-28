# CMS Webhook Integration Guide

## Overview

This guide explains how to configure the Laravel CMS (`cms.molochain.com`) to send webhooks to the Services Platform v1 API when services are created, updated, or deleted.

## Webhook Endpoint

**URL:** `https://molochain.com/api/platform/services/v1/webhooks/cms`  
**Method:** `POST`  
**Content-Type:** `application/json`

## Webhook Events

| Event | Description | Required Data |
|-------|-------------|---------------|
| `service.created` | New service added | `id` |
| `service.updated` | Service modified | `id` |
| `service.deleted` | Service removed | `id` |
| `services.bulk_update` | Multiple services changed | `action` (optional) |

## Service Identifiers

Services use `id` as the unique identifier (e.g., "container", "trucking", "airfreight").  
For backwards compatibility, `slug` is also accepted as an alias for `id`.

## Payload Format

```json
{
  "event": "service.updated",
  "timestamp": "2024-12-28T12:00:00Z",
  "data": {
    "id": "container"
  }
}
```

### Bulk Update Payload

```json
{
  "event": "services.bulk_update",
  "timestamp": "2024-12-28T12:00:00Z",
  "data": {
    "action": "import",
    "ids": ["container", "trucking", "airfreight"]
  }
}
```

## Security: Signature Verification

For production, all webhooks should include an HMAC-SHA256 signature in the `X-Signature` or `X-CMS-Signature` header.

### Generating the Signature (Laravel/PHP)

```php
<?php

$secret = env('CMS_WEBHOOK_SECRET');
$payload = json_encode($data);
$signature = hash_hmac('sha256', $payload, $secret);

// Send with header
Http::withHeaders([
    'Content-Type' => 'application/json',
    'X-Signature' => $signature,
])->post('https://molochain.com/api/platform/services/v1/webhooks/cms', $data);
```

### Laravel Event Listener Example

```php
<?php

namespace App\Listeners;

use App\Events\ServiceUpdated;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendServiceWebhook
{
    public function handle(ServiceUpdated $event)
    {
        $secret = env('CMS_WEBHOOK_SECRET');
        $payload = [
            'event' => 'service.updated',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'id' => $event->service->id,  // Use service ID (e.g., "container")
            ],
        ];

        $jsonPayload = json_encode($payload);
        $signature = hash_hmac('sha256', $jsonPayload, $secret);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-Signature' => $signature,
            ])->post('https://molochain.com/api/platform/services/v1/webhooks/cms', $payload);

            if ($response->successful()) {
                Log::info('Webhook sent successfully', ['id' => $event->service->id]);
            } else {
                Log::error('Webhook failed', ['status' => $response->status()]);
            }
        } catch (\Exception $e) {
            Log::error('Webhook error', ['message' => $e->getMessage()]);
        }
    }
}
```

### Laravel Model Observer Example

```php
<?php

namespace App\Observers;

use App\Models\Service;
use Illuminate\Support\Facades\Http;

class ServiceObserver
{
    private function sendWebhook(string $event, Service $service): void
    {
        $secret = env('CMS_WEBHOOK_SECRET');
        $payload = [
            'event' => $event,
            'timestamp' => now()->toIso8601String(),
            'data' => ['id' => $service->id],  // Use service ID
        ];

        $jsonPayload = json_encode($payload);
        $signature = hash_hmac('sha256', $jsonPayload, $secret);

        Http::withHeaders([
            'X-Signature' => $signature,
        ])->post('https://molochain.com/api/platform/services/v1/webhooks/cms', $payload);
    }

    public function created(Service $service): void
    {
        $this->sendWebhook('service.created', $service);
    }

    public function updated(Service $service): void
    {
        $this->sendWebhook('service.updated', $service);
    }

    public function deleted(Service $service): void
    {
        $this->sendWebhook('service.deleted', $service);
    }
}
```

## Environment Configuration

Add to your Laravel `.env` file:

```env
CMS_WEBHOOK_SECRET=your-shared-secret-here
```

The same secret must be configured on the Node.js application as `CMS_WEBHOOK_SECRET`.

## Testing the Webhook

### Quick Test (without signature)

```bash
curl -X POST 'https://molochain.com/api/platform/services/v1/webhooks/cms' \
  -H 'Content-Type: application/json' \
  -d '{"event": "service.updated", "timestamp": "2024-12-28T12:00:00Z", "data": {"id": "container"}}'
```

### Check Webhook Status

```bash
curl 'https://molochain.com/api/platform/services/v1/webhooks/status'
```

Response:
```json
{
  "stats": {
    "totalReceived": 1,
    "successRate": 100,
    "avgProcessingTime": 1,
    "secretConfigured": true
  },
  "recentLogs": [...]
}
```

## What Happens When Webhook is Received

1. **service.created / service.updated**: Invalidates that service's cache and the catalog cache
2. **service.deleted**: Invalidates that service's cache and the catalog cache
3. **services.bulk_update**: Triggers a full sync from CMS and invalidates all caches

## API Endpoints Reference

| Endpoint | Description |
|----------|-------------|
| `GET /catalog` | Get all services (paginated) |
| `GET /catalog/:id` | Get single service by ID |
| `GET /categories` | Get all categories |
| `GET /search?q=...` | Search services |
| `POST /webhooks/cms` | Receive CMS webhooks |
| `GET /webhooks/status` | Webhook processing status |

## Rate Limits

- Webhooks: 50 requests per minute per IP
- Status endpoint: 60 requests per minute per IP

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check if signature is correct or missing |
| 400 Bad Request | Verify payload format matches schema |
| 429 Too Many Requests | Rate limit exceeded, wait and retry |
| 500 Internal Error | Check server logs, contact admin |

## Contact

For webhook integration support, contact the Molochain development team.
