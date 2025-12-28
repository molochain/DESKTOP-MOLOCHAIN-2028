# Laravel CMS Webhook Setup Guide

## Quick Setup (3 Steps)

### Step 1: Add Environment Variable

Add to your Laravel `.env` file:

```env
CMS_WEBHOOK_SECRET=<obtain-from-admin>
```

**Important:** 
- Contact the Molochain admin team to obtain the CMS_WEBHOOK_SECRET value
- The secret is stored securely in the production server's environment
- This secret must match exactly with the production Node.js server
- Never commit the secret to version control

### Step 2: Copy Files to Laravel CMS

Copy these files to your Laravel CMS project:

| Source File | Destination |
|-------------|-------------|
| `app/Services/WebhookService.php` | `app/Services/WebhookService.php` |
| `app/Observers/ServiceObserver.php` | `app/Observers/ServiceObserver.php` |
| `config/webhooks.php` | `config/webhooks.php` |

### Step 3: Register Observer in AppServiceProvider

In `app/Providers/AppServiceProvider.php`, add:

```php
use App\Models\Service;
use App\Observers\ServiceObserver;

public function boot(): void
{
    Service::observe(ServiceObserver::class);
}
```

## Manual Usage (Alternative)

If you prefer manual control instead of observers:

```php
use App\Services\WebhookService;

// In your controller
$webhook = app(WebhookService::class);

// Single service update
$webhook->serviceUpdated('container');
$webhook->serviceCreated('new-service');
$webhook->serviceDeleted('old-service');

// Bulk update (triggers full cache refresh)
$webhook->bulkUpdate(['container', 'trucking']);
```

## Verification

After setup, test the webhook:

```bash
# Check webhook status
curl https://molochain.com/api/platform/services/v1/webhooks/status

# Should show:
# {
#   "stats": {
#     "secretConfigured": true,
#     "totalReceived": X,
#     "successRate": 100
#   }
# }
```

## Webhook Events

| Event | When Triggered | Effect |
|-------|----------------|--------|
| `service.created` | New service added | Cache invalidated for new service |
| `service.updated` | Service modified | Cache invalidated for that service |
| `service.deleted` | Service removed | Cache invalidated, service removed |
| `services.bulk_update` | Multiple changes | Full cache refresh + CMS sync |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check CMS_WEBHOOK_SECRET matches exactly |
| Connection timeout | Verify network access to molochain.com |
| No webhook received | Check Laravel logs for errors |

## Contact

For support, contact the Molochain development team.
