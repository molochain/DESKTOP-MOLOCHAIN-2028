<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    private string $webhookUrl;
    private string $secret;

    public function __construct()
    {
        $this->webhookUrl = config('webhooks.molochain.url', 'https://molochain.com/api/platform/services/v1/webhooks/cms');
        $this->secret = env('CMS_WEBHOOK_SECRET', '');
    }

    public function send(string $event, array $data): bool
    {
        if (empty($this->secret)) {
            Log::warning('WebhookService: CMS_WEBHOOK_SECRET not configured');
            return false;
        }

        $payload = [
            'event' => $event,
            'timestamp' => now()->toIso8601String(),
            'data' => $data,
        ];

        $jsonPayload = json_encode($payload);
        $signature = hash_hmac('sha256', $jsonPayload, $this->secret);

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Signature' => $signature,
                ])
                ->post($this->webhookUrl, $payload);

            if ($response->successful()) {
                Log::info('WebhookService: Sent successfully', [
                    'event' => $event,
                    'data' => $data,
                ]);
                return true;
            }

            Log::error('WebhookService: Failed', [
                'event' => $event,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('WebhookService: Exception', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function serviceCreated(string $serviceId): bool
    {
        return $this->send('service.created', ['id' => $serviceId]);
    }

    public function serviceUpdated(string $serviceId): bool
    {
        return $this->send('service.updated', ['id' => $serviceId]);
    }

    public function serviceDeleted(string $serviceId): bool
    {
        return $this->send('service.deleted', ['id' => $serviceId]);
    }

    public function bulkUpdate(array $serviceIds = [], string $action = 'sync'): bool
    {
        $data = ['action' => $action];
        if (!empty($serviceIds)) {
            $data['ids'] = $serviceIds;
        }
        return $this->send('services.bulk_update', $data);
    }
}
