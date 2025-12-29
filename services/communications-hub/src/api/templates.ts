import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { messageTemplates, MessageTemplate } from '../db/schema.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('templates-api');

const createTemplateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-_]+$/),
  name: z.string().min(1).max(200),
  channelType: z.enum(['email', 'sms', 'whatsapp', 'push']),
  subject: z.string().optional(),
  body: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional(),
  active: z.boolean().optional().default(true),
});

const updateTemplateSchema = createTemplateSchema.partial().omit({ slug: true });

export function createTemplateRoutes(): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    try {
      const { channelType, active } = req.query;
      
      let conditions = [];
      
      if (channelType && typeof channelType === 'string') {
        conditions.push(eq(messageTemplates.channelType, channelType));
      }
      
      if (active !== undefined) {
        conditions.push(eq(messageTemplates.active, active === 'true'));
      }

      const result = conditions.length > 0
        ? await db.select().from(messageTemplates).where(and(...conditions))
        : await db.select().from(messageTemplates);

      res.json({
        templates: result,
        total: result.length,
      });
    } catch (error) {
      logger.error('Failed to fetch templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const [template] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.slug, req.params.slug))
        .limit(1);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Failed to fetch template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const data = createTemplateSchema.parse(req.body);

      const [existing] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.slug, data.slug))
        .limit(1);

      if (existing) {
        return res.status(409).json({ error: 'Template with this slug already exists' });
      }

      const [template] = await db
        .insert(messageTemplates)
        .values({
          slug: data.slug,
          name: data.name,
          channelType: data.channelType,
          subject: data.subject,
          body: data.body,
          variables: data.variables,
          metadata: data.metadata,
          active: data.active,
        })
        .returning();

      logger.info(`Template created: ${data.slug}`);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      logger.error('Create template error:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  router.patch('/:slug', async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.slug, req.params.slug))
        .limit(1);
      
      if (!existing) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const data = updateTemplateSchema.parse(req.body);
      
      const [updated] = await db
        .update(messageTemplates)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(messageTemplates.slug, req.params.slug))
        .returning();

      logger.info(`Template updated: ${req.params.slug}`);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      logger.error('Update template error:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  });

  router.delete('/:slug', async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.slug, req.params.slug))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await db
        .delete(messageTemplates)
        .where(eq(messageTemplates.slug, req.params.slug));

      logger.info(`Template deleted: ${req.params.slug}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Delete template error:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });

  router.post('/:slug/render', async (req: Request, res: Response) => {
    try {
      const [template] = await db
        .select()
        .from(messageTemplates)
        .where(eq(messageTemplates.slug, req.params.slug))
        .limit(1);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const variables = req.body.variables || {};
      let renderedBody = template.body;
      let renderedSubject = template.subject || '';

      for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        renderedBody = renderedBody.replace(placeholder, String(value));
        renderedSubject = renderedSubject.replace(placeholder, String(value));
      }

      res.json({
        slug: template.slug,
        channelType: template.channelType,
        subject: renderedSubject || undefined,
        body: renderedBody,
      });
    } catch (error) {
      logger.error('Render template error:', error);
      res.status(500).json({ error: 'Failed to render template' });
    }
  });

  return router;
}
