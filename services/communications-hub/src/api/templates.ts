import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('templates-api');

interface MessageTemplate {
  id: string;
  slug: string;
  name: string;
  channelType: string;
  subject?: string;
  body: string;
  variables: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templates: Map<string, MessageTemplate> = new Map();

const createTemplateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-_]+$/),
  name: z.string().min(1).max(200),
  channelType: z.enum(['email', 'sms', 'whatsapp', 'push']),
  subject: z.string().optional(),
  body: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  active: z.boolean().optional().default(true),
});

const updateTemplateSchema = createTemplateSchema.partial().omit({ slug: true });

initDefaultTemplates();

function initDefaultTemplates() {
  const defaults: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      slug: 'welcome-email',
      name: 'Welcome Email',
      channelType: 'email',
      subject: 'Welcome to MoloChain, {{name}}!',
      body: `
        <h1>Welcome to MoloChain!</h1>
        <p>Hi {{name}},</p>
        <p>Thank you for joining MoloChain. We're excited to have you on board!</p>
        <p>Get started by exploring our services and features.</p>
        <p>Best regards,<br>The MoloChain Team</p>
      `,
      variables: ['name'],
      active: true,
    },
    {
      slug: 'password-reset',
      name: 'Password Reset',
      channelType: 'email',
      subject: 'Reset Your MoloChain Password',
      body: `
        <h1>Password Reset Request</h1>
        <p>Hi {{name}},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href="{{resetLink}}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      variables: ['name', 'resetLink'],
      active: true,
    },
    {
      slug: 'order-confirmation-sms',
      name: 'Order Confirmation SMS',
      channelType: 'sms',
      body: 'MoloChain: Your order #{{orderId}} has been confirmed. Track at {{trackingUrl}}',
      variables: ['orderId', 'trackingUrl'],
      active: true,
    },
    {
      slug: 'delivery-update-whatsapp',
      name: 'Delivery Update WhatsApp',
      channelType: 'whatsapp',
      body: '📦 MoloChain Delivery Update\n\nYour shipment #{{shipmentId}} is {{status}}.\n\nEstimated delivery: {{eta}}\n\nTrack: {{trackingUrl}}',
      variables: ['shipmentId', 'status', 'eta', 'trackingUrl'],
      active: true,
    },
  ];

  for (const template of defaults) {
    const id = `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    templates.set(template.slug, {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export function createTemplateRoutes(): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const { channelType, active } = req.query;
    
    let result = Array.from(templates.values());
    
    if (channelType) {
      result = result.filter(t => t.channelType === channelType);
    }
    
    if (active !== undefined) {
      result = result.filter(t => t.active === (active === 'true'));
    }

    res.json({
      templates: result,
      total: result.length,
    });
  });

  router.get('/:slug', (req: Request, res: Response) => {
    const template = templates.get(req.params.slug);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  });

  router.post('/', (req: Request, res: Response) => {
    try {
      const data = createTemplateSchema.parse(req.body);

      if (templates.has(data.slug)) {
        return res.status(409).json({ error: 'Template with this slug already exists' });
      }

      const id = `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const template: MessageTemplate = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      templates.set(data.slug, template);
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

  router.patch('/:slug', (req: Request, res: Response) => {
    try {
      const template = templates.get(req.params.slug);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const data = updateTemplateSchema.parse(req.body);
      const updated: MessageTemplate = {
        ...template,
        ...data,
        updatedAt: new Date(),
      };

      templates.set(req.params.slug, updated);
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

  router.delete('/:slug', (req: Request, res: Response) => {
    if (!templates.has(req.params.slug)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    templates.delete(req.params.slug);
    logger.info(`Template deleted: ${req.params.slug}`);

    res.status(204).send();
  });

  router.post('/:slug/render', (req: Request, res: Response) => {
    const template = templates.get(req.params.slug);
    
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
  });

  return router;
}
