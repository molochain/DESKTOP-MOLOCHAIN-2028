<?php

namespace App\Observers;

use App\Models\Service;
use App\Services\WebhookService;

class ServiceObserver
{
    protected WebhookService $webhookService;

    public function __construct(WebhookService $webhookService)
    {
        $this->webhookService = $webhookService;
    }

    public function created(Service $service): void
    {
        $this->webhookService->serviceCreated($service->id);
    }

    public function updated(Service $service): void
    {
        $this->webhookService->serviceUpdated($service->id);
    }

    public function deleted(Service $service): void
    {
        $this->webhookService->serviceDeleted($service->id);
    }
}
