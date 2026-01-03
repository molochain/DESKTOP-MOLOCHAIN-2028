import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db';
import { 
  ecosystemServices, 
  ecosystemWebhooks, 
  ecosystemApiDocs,
  externalApiKeys,
  insertEcosystemServiceSchema,
  insertEcosystemWebhookSchema,
  insertEcosystemApiDocSchema
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';
import { logger } from '../utils/logger';

const router = Router();

const API_KEY_PREFIX = 'mk_eco_';
const API_SECRET_PREFIX = 'msk_eco_';

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return `${API_KEY_PREFIX}${randomBytes}`;
}

function generateApiSecret(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${API_SECRET_PREFIX}${randomBytes}`;
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  baseUrl: z.string().url().max(500),
  healthEndpoint: z.string().max(200).default('/health'),
  healthCheckInterval: z.number().min(30).max(3600).default(60),
  metadata: z.object({
    version: z.string().optional(),
    maintainer: z.string().optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    tags: z.array(z.string()).optional(),
    capabilities: z.array(z.string()).optional(),
  }).optional(),
});

const createWebhookSchema = z.object({
  serviceId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  targetUrl: z.string().url().max(500),
  events: z.array(z.string()).min(1),
  maxRetries: z.number().min(1).max(10).default(3),
});

const createApiDocSchema = z.object({
  serviceId: z.number().int().positive(),
  title: z.string().max(200).optional(),
  openApiSpecUrl: z.string().url().max(500).optional(),
  openApiSpec: z.any().optional(),
  version: z.string().max(20).default('1.0.0'),
  isPublished: z.boolean().default(false),
});

router.get('/services', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const servicesList = await db.select({
      id: ecosystemServices.id,
      name: ecosystemServices.name,
      slug: ecosystemServices.slug,
      description: ecosystemServices.description,
      baseUrl: ecosystemServices.baseUrl,
      healthEndpoint: ecosystemServices.healthEndpoint,
      status: ecosystemServices.status,
      lastHealthCheck: ecosystemServices.lastHealthCheck,
      healthCheckInterval: ecosystemServices.healthCheckInterval,
      metadata: ecosystemServices.metadata,
      createdAt: ecosystemServices.createdAt,
      updatedAt: ecosystemServices.updatedAt,
    }).from(ecosystemServices).orderBy(desc(ecosystemServices.createdAt));

    logger.info('Ecosystem services listed', { count: servicesList.length });

    res.json({
      success: true,
      services: servicesList,
    });
  } catch (error) {
    logger.error('Error listing ecosystem services:', error);
    res.status(500).json({ error: 'Failed to list ecosystem services' });
  }
});

router.post('/services', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createServiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }

    const data = validation.data;
    const webhookSecret = generateWebhookSecret();

    const [created] = await db.insert(ecosystemServices).values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      baseUrl: data.baseUrl,
      healthEndpoint: data.healthEndpoint,
      healthCheckInterval: data.healthCheckInterval,
      webhookSecret,
      status: 'inactive',
      metadata: data.metadata,
    }).returning();

    logger.info('Ecosystem service created', { serviceId: created.id, name: data.name, slug: data.slug });

    res.status(201).json({
      success: true,
      message: 'Ecosystem service registered successfully',
      service: {
        ...created,
        webhookSecret,
      },
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Service with this slug already exists' });
    }
    logger.error('Error creating ecosystem service:', error);
    res.status(500).json({ error: 'Failed to create ecosystem service' });
  }
});

router.get('/services/:slug', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const [service] = await db.select().from(ecosystemServices)
      .where(eq(ecosystemServices.slug, slug));

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const webhooks = await db.select().from(ecosystemWebhooks)
      .where(eq(ecosystemWebhooks.serviceId, service.id));

    const docs = await db.select().from(ecosystemApiDocs)
      .where(eq(ecosystemApiDocs.serviceId, service.id));

    res.json({
      success: true,
      service: {
        ...service,
        webhookSecret: undefined,
      },
      webhooks,
      docs,
    });
  } catch (error) {
    logger.error('Error getting ecosystem service:', error);
    res.status(500).json({ error: 'Failed to get ecosystem service' });
  }
});

router.get('/services/:slug/health', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const [service] = await db.select().from(ecosystemServices)
      .where(eq(ecosystemServices.slug, slug));

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const healthUrl = `${service.baseUrl}${service.healthEndpoint}`;
    let healthStatus: 'healthy' | 'unhealthy' | 'unknown' = 'unknown';
    let healthDetails: any = null;
    let responseTime = 0;

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      responseTime = Date.now() - startTime;

      if (response.ok) {
        healthStatus = 'healthy';
        try {
          healthDetails = await response.json();
        } catch {
          healthDetails = { status: 'ok' };
        }
      } else {
        healthStatus = 'unhealthy';
        healthDetails = { statusCode: response.status, statusText: response.statusText };
      }
    } catch (error: any) {
      healthStatus = 'unhealthy';
      healthDetails = { error: error.message };
    }

    await db.update(ecosystemServices)
      .set({ 
        lastHealthCheck: new Date(),
        status: healthStatus === 'healthy' ? 'active' : 'inactive',
        updatedAt: new Date(),
      })
      .where(eq(ecosystemServices.id, service.id));

    logger.info('Ecosystem service health check', { 
      slug, 
      status: healthStatus, 
      responseTime 
    });

    res.json({
      success: true,
      service: slug,
      health: {
        status: healthStatus,
        responseTime,
        checkedAt: new Date().toISOString(),
        details: healthDetails,
      },
    });
  } catch (error) {
    logger.error('Error checking ecosystem service health:', error);
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

router.post('/services/:slug/api-key', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const [service] = await db.select().from(ecosystemServices)
      .where(eq(ecosystemServices.slug, slug));

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();
    const keyHash = hashKey(apiKey);
    const secretHash = hashKey(apiSecret);
    const keyPrefix = apiKey.substring(0, 12);

    const userId = (req as any).user?.id;

    const [createdKey] = await db.insert(externalApiKeys).values({
      name: `${service.name} API Key`,
      description: `Auto-generated API key for ecosystem service: ${service.slug}`,
      keyHash,
      keyPrefix,
      secretHash,
      userId,
      scopes: ['ecosystem:read', 'ecosystem:write', `service:${slug}`],
      rateLimit: 10000,
      rateLimitWindow: 3600,
      isActive: true,
      metadata: {
        ecosystemServiceId: service.id,
        ecosystemSlug: slug,
        generatedFor: 'ecosystem-registry',
      },
    }).returning();

    await db.update(ecosystemServices)
      .set({ 
        apiKeyId: createdKey.id,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(ecosystemServices.id, service.id));

    logger.info('API key generated for ecosystem service', { 
      serviceId: service.id, 
      slug, 
      keyId: createdKey.id 
    });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully. Save these credentials securely - they will not be shown again.',
      apiKey: {
        id: createdKey.id,
        key: apiKey,
        secret: apiSecret,
        keyPrefix,
        scopes: createdKey.scopes,
        rateLimit: createdKey.rateLimit,
        createdAt: createdKey.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error generating API key for ecosystem service:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

router.get('/webhooks', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.query;

    let query = db.select({
      id: ecosystemWebhooks.id,
      serviceId: ecosystemWebhooks.serviceId,
      name: ecosystemWebhooks.name,
      targetUrl: ecosystemWebhooks.targetUrl,
      events: ecosystemWebhooks.events,
      isActive: ecosystemWebhooks.isActive,
      lastDelivery: ecosystemWebhooks.lastDelivery,
      lastDeliveryStatus: ecosystemWebhooks.lastDeliveryStatus,
      failureCount: ecosystemWebhooks.failureCount,
      maxRetries: ecosystemWebhooks.maxRetries,
      createdAt: ecosystemWebhooks.createdAt,
    }).from(ecosystemWebhooks);

    if (serviceId) {
      query = query.where(eq(ecosystemWebhooks.serviceId, parseInt(serviceId as string))) as any;
    }

    const webhooks = await query.orderBy(desc(ecosystemWebhooks.createdAt));

    res.json({
      success: true,
      webhooks,
    });
  } catch (error) {
    logger.error('Error listing webhooks:', error);
    res.status(500).json({ error: 'Failed to list webhooks' });
  }
});

router.post('/webhooks', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createWebhookSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }

    const data = validation.data;

    const [service] = await db.select().from(ecosystemServices)
      .where(eq(ecosystemServices.id, data.serviceId));

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const secret = generateWebhookSecret();

    const [created] = await db.insert(ecosystemWebhooks).values({
      serviceId: data.serviceId,
      name: data.name,
      targetUrl: data.targetUrl,
      events: data.events,
      secret,
      maxRetries: data.maxRetries,
      isActive: true,
    }).returning();

    logger.info('Webhook created', { 
      webhookId: created.id, 
      serviceId: data.serviceId, 
      events: data.events 
    });

    res.status(201).json({
      success: true,
      message: 'Webhook registered successfully',
      webhook: {
        ...created,
        secret,
      },
    });
  } catch (error) {
    logger.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

router.patch('/webhooks/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }

    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      targetUrl: z.string().url().max(500).optional(),
      events: z.array(z.string()).min(1).optional(),
      isActive: z.boolean().optional(),
      maxRetries: z.number().min(1).max(10).optional(),
    });

    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }

    const [updated] = await db.update(ecosystemWebhooks)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(ecosystemWebhooks.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    logger.info('Webhook updated', { webhookId: id });

    res.json({
      success: true,
      webhook: updated,
    });
  } catch (error) {
    logger.error('Error updating webhook:', error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

router.delete('/webhooks/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }

    const [deleted] = await db.delete(ecosystemWebhooks)
      .where(eq(ecosystemWebhooks.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    logger.info('Webhook deleted', { webhookId: id });

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

router.get('/docs', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { published } = req.query;

    let query = db.select({
      id: ecosystemApiDocs.id,
      serviceId: ecosystemApiDocs.serviceId,
      title: ecosystemApiDocs.title,
      openApiSpecUrl: ecosystemApiDocs.openApiSpecUrl,
      version: ecosystemApiDocs.version,
      lastSync: ecosystemApiDocs.lastSync,
      isPublished: ecosystemApiDocs.isPublished,
      createdAt: ecosystemApiDocs.createdAt,
      serviceName: ecosystemServices.name,
      serviceSlug: ecosystemServices.slug,
    })
      .from(ecosystemApiDocs)
      .leftJoin(ecosystemServices, eq(ecosystemApiDocs.serviceId, ecosystemServices.id));

    if (published === 'true') {
      query = query.where(eq(ecosystemApiDocs.isPublished, true)) as any;
    }

    const docs = await query.orderBy(desc(ecosystemApiDocs.createdAt));

    res.json({
      success: true,
      docs,
    });
  } catch (error) {
    logger.error('Error listing API docs:', error);
    res.status(500).json({ error: 'Failed to list API docs' });
  }
});

router.post('/docs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createApiDocSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }

    const data = validation.data;

    const [service] = await db.select().from(ecosystemServices)
      .where(eq(ecosystemServices.id, data.serviceId));

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const [created] = await db.insert(ecosystemApiDocs).values({
      serviceId: data.serviceId,
      title: data.title || `${service.name} API Documentation`,
      openApiSpecUrl: data.openApiSpecUrl,
      openApiSpec: data.openApiSpec,
      version: data.version,
      isPublished: data.isPublished,
      lastSync: new Date(),
    }).returning();

    logger.info('API documentation created', { 
      docId: created.id, 
      serviceId: data.serviceId 
    });

    res.status(201).json({
      success: true,
      message: 'API documentation registered successfully',
      doc: created,
    });
  } catch (error) {
    logger.error('Error creating API documentation:', error);
    res.status(500).json({ error: 'Failed to create API documentation' });
  }
});

router.get('/docs/:id/spec', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid documentation ID' });
    }

    const [doc] = await db.select().from(ecosystemApiDocs)
      .where(eq(ecosystemApiDocs.id, id));

    if (!doc) {
      return res.status(404).json({ error: 'Documentation not found' });
    }

    if (doc.openApiSpec) {
      res.json(doc.openApiSpec);
    } else if (doc.openApiSpecUrl) {
      try {
        const response = await fetch(doc.openApiSpecUrl);
        if (response.ok) {
          const spec = await response.json();
          res.json(spec);
        } else {
          res.status(502).json({ error: 'Failed to fetch OpenAPI spec from remote URL' });
        }
      } catch (error) {
        res.status(502).json({ error: 'Failed to fetch OpenAPI spec from remote URL' });
      }
    } else {
      res.status(404).json({ error: 'No OpenAPI spec available for this documentation' });
    }
  } catch (error) {
    logger.error('Error fetching API spec:', error);
    res.status(500).json({ error: 'Failed to fetch API spec' });
  }
});

router.get('/aggregate-docs', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const docs = await db.select({
      id: ecosystemApiDocs.id,
      serviceId: ecosystemApiDocs.serviceId,
      title: ecosystemApiDocs.title,
      openApiSpec: ecosystemApiDocs.openApiSpec,
      openApiSpecUrl: ecosystemApiDocs.openApiSpecUrl,
      version: ecosystemApiDocs.version,
      serviceName: ecosystemServices.name,
      serviceSlug: ecosystemServices.slug,
      serviceBaseUrl: ecosystemServices.baseUrl,
    })
      .from(ecosystemApiDocs)
      .leftJoin(ecosystemServices, eq(ecosystemApiDocs.serviceId, ecosystemServices.id))
      .where(eq(ecosystemApiDocs.isPublished, true));

    const aggregatedSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Molochain Ecosystem API',
        description: 'Aggregated API documentation for all Molochain ecosystem services',
        version: '1.0.0',
      },
      servers: docs.map(doc => ({
        url: doc.serviceBaseUrl,
        description: doc.serviceName,
      })),
      paths: {} as Record<string, any>,
      components: {
        schemas: {} as Record<string, any>,
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
          apiSecret: {
            type: 'apiKey',
            name: 'X-API-Secret',
            in: 'header',
          },
        },
      },
      tags: docs.map(doc => ({
        name: doc.serviceSlug,
        description: `${doc.serviceName} API endpoints`,
      })),
    };

    for (const doc of docs) {
      if (doc.openApiSpec && typeof doc.openApiSpec === 'object') {
        const spec = doc.openApiSpec as any;
        if (spec.paths) {
          for (const [path, methods] of Object.entries(spec.paths)) {
            const prefixedPath = `/${doc.serviceSlug}${path}`;
            aggregatedSpec.paths[prefixedPath] = methods;
          }
        }
        if (spec.components?.schemas) {
          for (const [name, schema] of Object.entries(spec.components.schemas)) {
            aggregatedSpec.components.schemas[`${doc.serviceSlug}_${name}`] = schema;
          }
        }
      }
    }

    res.json(aggregatedSpec);
  } catch (error) {
    logger.error('Error aggregating API docs:', error);
    res.status(500).json({ error: 'Failed to aggregate API docs' });
  }
});

export default router;
