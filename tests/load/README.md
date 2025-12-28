# Molochain Services Platform - Load Testing

Artillery-based load testing configuration for the Molochain Services Platform API.

## Prerequisites

Artillery is already installed as a project dependency. No additional installation required.

## Test Scenarios

### 1. Service Catalog Load
- **Endpoints**: `/api/platform/services/v1/catalog`, `/api/platform/services/v1/categories`, `/api/platform/services/v1/search`
- **Load Profile**: Ramp from 1 to 10 users over 60 seconds, then sustain 10 users for 2 minutes
- **Purpose**: Test the core service catalog browsing experience

### 2. Pricing Calculator Load
- **Endpoints**: `/api/services/container/pricing`, `/api/services/calculate-price`
- **Load Profile**: 3/10 weight of total traffic
- **Purpose**: Test pricing calculation under load

### 3. Webhook Resilience
- **Endpoint**: `/api/platform/services/v1/webhooks/cms`
- **Load Profile**: 2/10 weight of total traffic
- **Purpose**: Test webhook endpoint reliability

## Running the Tests

### Local Development
```bash
npx artillery run tests/load/services-load-test.yml
```

### Against Production
```bash
TARGET_URL=https://api.molochain.com npx artillery run tests/load/services-load-test.yml
```

### With HTML Report
```bash
npx artillery run tests/load/services-load-test.yml --output report.json
npx artillery report report.json --output report.html
```

### Quick Test (Reduced Load)
```bash
npx artillery run tests/load/services-load-test.yml --count 5
```

## Performance Thresholds

| Metric | Threshold |
|--------|-----------|
| p99 Response Time | < 2000ms |
| Error Rate | < 1% |

Tests will fail if these thresholds are exceeded.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TARGET_URL` | Base URL for API endpoints | `http://localhost:5000` |

## Interpreting Results

- **http.request_rate**: Requests per second being sent
- **http.response_time.p99**: 99th percentile response time
- **http.codes.2xx**: Successful responses
- **http.codes.4xx/5xx**: Error responses
- **vusers.completed**: Virtual users that completed their scenario

## Troubleshooting

### Connection Errors
Ensure the target server is running and accessible from your machine.

### High Error Rates
Check server logs for specific error details. May indicate rate limiting or server capacity issues.

### Slow Response Times
Consider scaling server resources or optimizing database queries.
