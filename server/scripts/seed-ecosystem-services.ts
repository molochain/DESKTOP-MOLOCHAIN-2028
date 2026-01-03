/**
 * Ecosystem Services Seed Script
 * Registers all 6 core platform services with proper credentials, webhooks, and documentation
 * 
 * Services:
 * 1. API Gateway - Central routing and authentication
 * 2. Communications Hub - Email, SMS, WhatsApp, Push notifications
 * 3. Notification Service - Real-time alerts
 * 4. Container Monitor - Docker health tracking
 * 5. SSL Checker - Certificate expiration monitoring
 * 6. CMS Sync Service - Laravel CMS integration
 */

import { db } from '../db';
import { 
  ecosystemServices, 
  ecosystemWebhooks, 
  ecosystemApiDocs,
  externalApiKeys 
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const API_KEY_PREFIX = 'mk_eco_';
const API_SECRET_PREFIX = 'msk_eco_';

function generateApiKey(): string {
  return `${API_KEY_PREFIX}${crypto.randomBytes(24).toString('hex')}`;
}

function generateApiSecret(): string {
  return `${API_SECRET_PREFIX}${crypto.randomBytes(32).toString('hex')}`;
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

interface ServiceDefinition {
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  healthEndpoint: string;
  healthCheckInterval: number;
  metadata: {
    version: string;
    maintainer: string;
    environment: 'development' | 'staging' | 'production';
    tags: string[];
    capabilities: string[];
    tier: 'core' | 'satellite' | 'integration';
    department: string;
  };
  webhookEvents: string[];
  openApiSpec?: {
    title: string;
    version: string;
    specUrl?: string;
  };
}

const CORE_SERVICES: ServiceDefinition[] = [
  {
    name: 'API Gateway',
    slug: 'api-gateway',
    description: 'Central routing, authentication, rate limiting, and request orchestration for all Molochain microservices',
    baseUrl: 'https://molochain.com/api',
    healthEndpoint: '/health',
    healthCheckInterval: 30,
    metadata: {
      version: '2.0.0',
      maintainer: 'Platform Team',
      environment: 'production',
      tags: ['core', 'routing', 'authentication', 'rate-limiting'],
      capabilities: ['JWT Authentication', 'API Key Validation', 'Rate Limiting', 'Request Routing', 'Load Balancing'],
      tier: 'core',
      department: 'Platform Engineering'
    },
    webhookEvents: ['gateway.request.failed', 'gateway.rate_limit.exceeded', 'gateway.auth.failed'],
    openApiSpec: {
      title: 'Molochain API Gateway',
      version: '2.0.0',
      specUrl: 'https://molochain.com/api/docs/openapi.json'
    }
  },
  {
    name: 'Communications Hub',
    slug: 'communications-hub',
    description: 'Unified multi-channel communications platform handling Email, SMS, WhatsApp, and Push notifications with Plesk integration',
    baseUrl: 'https://comms.molochain.com',
    healthEndpoint: '/health',
    healthCheckInterval: 60,
    metadata: {
      version: '1.5.0',
      maintainer: 'Communications Team',
      environment: 'production',
      tags: ['communications', 'email', 'sms', 'whatsapp', 'push'],
      capabilities: ['Email Delivery', 'SMS Gateway', 'WhatsApp Business API', 'Push Notifications', 'Template Management', 'Delivery Tracking'],
      tier: 'core',
      department: 'Communications'
    },
    webhookEvents: ['comms.email.sent', 'comms.email.failed', 'comms.sms.delivered'],
    openApiSpec: {
      title: 'Molochain Communications Hub API',
      version: '1.5.0'
    }
  },
  {
    name: 'Notification Service',
    slug: 'notification-service',
    description: 'Real-time notification delivery system with WebSocket support for instant alerts and user notifications',
    baseUrl: 'http://172.22.0.1:7020',
    healthEndpoint: '/health',
    healthCheckInterval: 30,
    metadata: {
      version: '1.2.0',
      maintainer: 'Platform Team',
      environment: 'production',
      tags: ['notifications', 'realtime', 'websocket', 'alerts'],
      capabilities: ['WebSocket Delivery', 'Push Notifications', 'In-App Alerts', 'Notification Preferences', 'Batch Processing'],
      tier: 'core',
      department: 'Platform Engineering'
    },
    webhookEvents: ['notification.sent', 'notification.read', 'notification.failed'],
    openApiSpec: {
      title: 'Molochain Notification Service API',
      version: '1.2.0'
    }
  },
  {
    name: 'Container Monitor',
    slug: 'container-monitor',
    description: 'Docker container health tracking, auto-recovery for unhealthy services, and bulk container management',
    baseUrl: 'http://172.22.0.1:7030',
    healthEndpoint: '/health',
    healthCheckInterval: 30,
    metadata: {
      version: '1.0.0',
      maintainer: 'DevOps Team',
      environment: 'production',
      tags: ['monitoring', 'docker', 'containers', 'health', 'devops'],
      capabilities: ['Container Health Checks', 'Auto-Recovery', 'Bulk Actions', 'Resource Metrics', 'Log Aggregation'],
      tier: 'core',
      department: 'DevOps'
    },
    webhookEvents: ['container.unhealthy', 'container.recovered', 'container.stopped'],
    openApiSpec: {
      title: 'Molochain Container Monitor API',
      version: '1.0.0'
    }
  },
  {
    name: 'SSL Checker',
    slug: 'ssl-checker',
    description: 'SSL/TLS certificate expiration monitoring and alerting for all Molochain subdomains',
    baseUrl: 'http://172.22.0.1:7040',
    healthEndpoint: '/health',
    healthCheckInterval: 300,
    metadata: {
      version: '1.0.0',
      maintainer: 'Security Team',
      environment: 'production',
      tags: ['security', 'ssl', 'tls', 'certificates', 'monitoring'],
      capabilities: ['Certificate Monitoring', 'Expiration Alerts', 'Chain Validation', 'Multi-Domain Support'],
      tier: 'core',
      department: 'Security'
    },
    webhookEvents: ['ssl.expiring_soon', 'ssl.expired', 'ssl.renewed'],
    openApiSpec: {
      title: 'Molochain SSL Checker API',
      version: '1.0.0'
    }
  },
  {
    name: 'CMS Sync Service',
    slug: 'cms-sync',
    description: 'Laravel CMS integration service for synchronizing content, services, and metadata from cms.molochain.com',
    baseUrl: 'https://cms.molochain.com/api',
    healthEndpoint: '/health',
    healthCheckInterval: 300,
    metadata: {
      version: '1.1.0',
      maintainer: 'Content Team',
      environment: 'production',
      tags: ['cms', 'content', 'sync', 'laravel', 'integration'],
      capabilities: ['Content Sync', 'Service Import', 'Media Management', 'Version Control', 'Scheduled Sync'],
      tier: 'integration',
      department: 'Content Management'
    },
    webhookEvents: ['cms.sync.started', 'cms.sync.completed', 'cms.sync.failed'],
    openApiSpec: {
      title: 'Molochain CMS Sync API',
      version: '1.1.0',
      specUrl: 'https://cms.molochain.com/api/docs'
    }
  }
];

interface SeedResult {
  services: Array<{ id: number; name: string; slug: string; apiKey?: string; apiSecret?: string }>;
  webhooks: Array<{ id: number; name: string; serviceSlug: string; secret: string }>;
  docs: Array<{ id: number; title: string; serviceSlug: string }>;
  errors: string[];
}

async function seedEcosystemServices(): Promise<SeedResult> {
  const result: SeedResult = {
    services: [],
    webhooks: [],
    docs: [],
    errors: []
  };

  console.log('🚀 Starting ecosystem services seed...\n');

  for (const serviceDef of CORE_SERVICES) {
    try {
      console.log(`📦 Registering service: ${serviceDef.name}`);

      const existingService = await db.select()
        .from(ecosystemServices)
        .where(eq(ecosystemServices.slug, serviceDef.slug))
        .limit(1);

      let serviceId: number;
      let webhookSecret: string;

      if (existingService.length > 0) {
        console.log(`  ⚠️  Service ${serviceDef.slug} already exists, updating...`);
        serviceId = existingService[0].id;
        webhookSecret = existingService[0].webhookSecret;

        await db.update(ecosystemServices)
          .set({
            name: serviceDef.name,
            description: serviceDef.description,
            baseUrl: serviceDef.baseUrl,
            healthEndpoint: serviceDef.healthEndpoint,
            healthCheckInterval: serviceDef.healthCheckInterval,
            metadata: serviceDef.metadata,
            updatedAt: new Date()
          })
          .where(eq(ecosystemServices.id, serviceId));

        result.services.push({
          id: serviceId,
          name: serviceDef.name,
          slug: serviceDef.slug
        });
      } else {
        webhookSecret = generateWebhookSecret();

        const [created] = await db.insert(ecosystemServices).values({
          name: serviceDef.name,
          slug: serviceDef.slug,
          description: serviceDef.description,
          baseUrl: serviceDef.baseUrl,
          healthEndpoint: serviceDef.healthEndpoint,
          healthCheckInterval: serviceDef.healthCheckInterval,
          webhookSecret,
          status: 'inactive',
          metadata: serviceDef.metadata
        }).returning();

        serviceId = created.id;

        const apiKey = generateApiKey();
        const apiSecret = generateApiSecret();
        const keyHash = hashKey(apiKey);
        const secretHash = hashKey(apiSecret);
        const keyPrefix = apiKey.substring(0, 12);

        const [createdKey] = await db.insert(externalApiKeys).values({
          name: `${serviceDef.name} API Key`,
          description: `Auto-generated API key for ecosystem service: ${serviceDef.slug}`,
          keyHash,
          keyPrefix,
          secretHash,
          scopes: ['ecosystem:read', 'ecosystem:write', `service:${serviceDef.slug}`],
          rateLimit: 10000,
          rateLimitWindow: 3600,
          isActive: true,
          metadata: {
            ecosystemServiceId: serviceId,
            ecosystemSlug: serviceDef.slug,
            generatedFor: 'ecosystem-registry',
            tier: serviceDef.metadata.tier
          }
        }).returning();

        await db.update(ecosystemServices)
          .set({ 
            apiKeyId: createdKey.id,
            status: 'active',
            updatedAt: new Date()
          })
          .where(eq(ecosystemServices.id, serviceId));

        console.log(`  ✅ Service created with API key: ${keyPrefix}...`);

        result.services.push({
          id: serviceId,
          name: serviceDef.name,
          slug: serviceDef.slug,
          apiKey,
          apiSecret
        });
      }

      for (const event of serviceDef.webhookEvents) {
        const existingWebhook = await db.select()
          .from(ecosystemWebhooks)
          .where(eq(ecosystemWebhooks.serviceId, serviceId))
          .limit(100);

        const webhookExists = existingWebhook.some(w => w.events?.includes(event));

        if (!webhookExists) {
          const secret = generateWebhookSecret();
          const webhookName = `${serviceDef.name} - ${event.split('.').slice(1).join(' ').replace(/_/g, ' ')}`;

          const [createdWebhook] = await db.insert(ecosystemWebhooks).values({
            serviceId,
            name: webhookName,
            targetUrl: `${serviceDef.baseUrl}/webhooks/receive`,
            events: [event],
            secret,
            maxRetries: 3,
            isActive: true
          }).returning();

          console.log(`  🔗 Webhook registered: ${event}`);

          result.webhooks.push({
            id: createdWebhook.id,
            name: webhookName,
            serviceSlug: serviceDef.slug,
            secret
          });
        }
      }

      if (serviceDef.openApiSpec) {
        const existingDoc = await db.select()
          .from(ecosystemApiDocs)
          .where(eq(ecosystemApiDocs.serviceId, serviceId))
          .limit(1);

        if (existingDoc.length === 0) {
          const [createdDoc] = await db.insert(ecosystemApiDocs).values({
            serviceId,
            title: serviceDef.openApiSpec.title,
            openApiSpecUrl: serviceDef.openApiSpec.specUrl,
            version: serviceDef.openApiSpec.version,
            isPublished: true,
            lastSync: new Date()
          }).returning();

          console.log(`  📄 API documentation registered`);

          result.docs.push({
            id: createdDoc.id,
            title: serviceDef.openApiSpec.title,
            serviceSlug: serviceDef.slug
          });
        }
      }

      console.log('');
    } catch (error: any) {
      const errorMsg = `Failed to register ${serviceDef.name}: ${error.message}`;
      console.error(`  ❌ ${errorMsg}`);
      result.errors.push(errorMsg);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  ECOSYSTEM SEED SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📦 Services registered: ${result.services.length}`);
  console.log(`🔗 Webhooks created: ${result.webhooks.length}`);
  console.log(`📄 Docs entries: ${result.docs.length}`);
  console.log(`❌ Errors: ${result.errors.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (result.services.some(s => s.apiKey)) {
    console.log('🔐 NEW API CREDENTIALS (save securely - shown once):');
    console.log('─────────────────────────────────────────────────────────────');
    for (const service of result.services) {
      if (service.apiKey) {
        console.log(`\n${service.name} (${service.slug}):`);
        console.log(`  API Key:    ${service.apiKey}`);
        console.log(`  API Secret: ${service.apiSecret}`);
      }
    }
    console.log('\n─────────────────────────────────────────────────────────────\n');
  }

  return result;
}

async function verifyHealthEndpoints(): Promise<void> {
  console.log('\n🏥 Verifying health endpoints...\n');

  const services = await db.select().from(ecosystemServices);

  for (const service of services) {
    const healthUrl = `${service.baseUrl}${service.healthEndpoint}`;
    console.log(`Checking ${service.name}: ${healthUrl}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const startTime = Date.now();
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const status = response.ok ? '✅ Healthy' : `⚠️ Unhealthy (${response.status})`;
      console.log(`  ${status} - ${responseTime}ms`);

      await db.update(ecosystemServices)
        .set({
          lastHealthCheck: new Date(),
          status: response.ok ? 'active' : 'inactive',
          updatedAt: new Date()
        })
        .where(eq(ecosystemServices.id, service.id));

    } catch (error: any) {
      console.log(`  ❌ Unreachable - ${error.message}`);

      await db.update(ecosystemServices)
        .set({
          lastHealthCheck: new Date(),
          status: 'inactive',
          updatedAt: new Date()
        })
        .where(eq(ecosystemServices.id, service.id));
    }
  }
}

async function main() {
  try {
    const result = await seedEcosystemServices();
    await verifyHealthEndpoints();
    
    console.log('\n✨ Ecosystem seed completed successfully!\n');
    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during seed:', error);
    process.exit(1);
  }
}

main();
