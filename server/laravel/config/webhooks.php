<?php

return [
    'molochain' => [
        'url' => env('MOLOCHAIN_WEBHOOK_URL', 'https://molochain.com/api/platform/services/v1/webhooks/cms'),
        'timeout' => 10,
        'retry_attempts' => 3,
    ],
];
