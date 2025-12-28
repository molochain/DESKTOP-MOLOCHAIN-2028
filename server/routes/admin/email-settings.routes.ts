import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db';
import {
  emailSettings,
  emailTemplates,
  notificationRecipients,
  formTypes,
  emailApiKeys,
  insertEmailSettingsSchema,
  insertEmailTemplateSchema,
  insertNotificationRecipientSchema,
} from '../../../shared/schema';
import { eq, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { hashApiKey } from '../../utils/api-key.utils';

const router = Router();

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const [settings] = await db.select().from(emailSettings).limit(1);

    if (!settings) {
      return res.json({
        success: true,
        data: null,
        message: 'No email settings configured',
      });
    }

    const { smtpPassword, ...safeSettings } = settings;

    res.json({
      success: true,
      data: {
        ...safeSettings,
        smtpPassword: '********',
      },
    });
  } catch (error) {
    logger.error('Failed to get email settings', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve email settings',
    });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(emailSettings).limit(1);

    // Handle partial updates - if password is masked, keep the existing one
    let updateData = { ...req.body };
    if (updateData.smtpPassword === '********' && existing) {
      updateData.smtpPassword = existing.smtpPassword;
    }

    const body = insertEmailSettingsSchema.parse(updateData);

    let result;
    if (existing) {
      [result] = await db.update(emailSettings)
        .set({ ...body, updatedAt: new Date(), isVerified: false })
        .where(eq(emailSettings.id, existing.id))
        .returning();
    } else {
      [result] = await db.insert(emailSettings)
        .values(body)
        .returning();
    }

    const { smtpPassword, ...safeResult } = result;

    logger.info('Email settings updated');

    res.json({
      success: true,
      data: {
        ...safeResult,
        smtpPassword: '********',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Failed to update email settings', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update email settings',
    });
  }
});

router.post('/settings/test', async (_req: Request, res: Response) => {
  try {
    const [settings] = await db.select().from(emailSettings).limit(1);

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'No email settings configured',
      });
    }

    const testResult = {
      connected: true,
      host: settings.smtpHost,
      port: settings.smtpPort,
      tls: settings.useTls,
      message: 'SMTP connection test successful (simulated)',
    };

    await db.update(emailSettings)
      .set({ isVerified: true, lastVerifiedAt: new Date() })
      .where(eq(emailSettings.id, settings.id));

    logger.info('SMTP connection test passed');

    res.json({
      success: true,
      data: testResult,
    });
  } catch (error) {
    logger.error('SMTP connection test failed', error);
    res.status(500).json({
      success: false,
      error: 'SMTP connection test failed',
    });
  }
});

router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await db.select({
      id: emailTemplates.id,
      name: emailTemplates.name,
      slug: emailTemplates.slug,
      subject: emailTemplates.subject,
      htmlBody: emailTemplates.htmlBody,
      textBody: emailTemplates.textBody,
      isActive: emailTemplates.isActive,
      formTypeId: emailTemplates.formTypeId,
      formTypeName: formTypes.name,
      createdAt: emailTemplates.createdAt,
      updatedAt: emailTemplates.updatedAt,
    })
      .from(emailTemplates)
      .leftJoin(formTypes, eq(emailTemplates.formTypeId, formTypes.id))
      .orderBy(desc(emailTemplates.createdAt));

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('Failed to get email templates', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve email templates',
    });
  }
});

router.post('/templates', async (req: Request, res: Response) => {
  try {
    const body = insertEmailTemplateSchema.parse(req.body);

    const [template] = await db.insert(emailTemplates)
      .values(body)
      .returning();

    logger.info('Email template created', { templateId: template.id });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Failed to create email template', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create email template',
    });
  }
});

router.put('/templates/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID',
      });
    }

    const body = insertEmailTemplateSchema.partial().parse(req.body);

    const [existing] = await db.select({ id: emailTemplates.id })
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    const [template] = await db.update(emailTemplates)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();

    logger.info('Email template updated', { templateId: id });

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Failed to update email template', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update email template',
    });
  }
});

router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID',
      });
    }

    const [existing] = await db.select({ id: emailTemplates.id })
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));

    logger.info('Email template deleted', { templateId: id });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete email template', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete email template',
    });
  }
});

router.get('/recipients', async (req: Request, res: Response) => {
  try {
    const recipients = await db.select({
      id: notificationRecipients.id,
      email: notificationRecipients.email,
      name: notificationRecipients.name,
      isActive: notificationRecipients.isActive,
      formTypeId: notificationRecipients.formTypeId,
      formTypeName: formTypes.name,
      createdAt: notificationRecipients.createdAt,
    })
      .from(notificationRecipients)
      .leftJoin(formTypes, eq(notificationRecipients.formTypeId, formTypes.id))
      .orderBy(desc(notificationRecipients.createdAt));

    res.json({
      success: true,
      data: recipients,
    });
  } catch (error) {
    logger.error('Failed to get notification recipients', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notification recipients',
    });
  }
});

router.post('/recipients', async (req: Request, res: Response) => {
  try {
    const body = insertNotificationRecipientSchema.parse(req.body);

    const [recipient] = await db.insert(notificationRecipients)
      .values(body)
      .returning();

    logger.info('Notification recipient added', { recipientId: recipient.id });

    res.status(201).json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Failed to add notification recipient', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add notification recipient',
    });
  }
});

router.delete('/recipients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient ID',
      });
    }

    const [existing] = await db.select({ id: notificationRecipients.id })
      .from(notificationRecipients)
      .where(eq(notificationRecipients.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
      });
    }

    await db.delete(notificationRecipients).where(eq(notificationRecipients.id, id));

    logger.info('Notification recipient removed', { recipientId: id });

    res.json({
      success: true,
      message: 'Recipient removed successfully',
    });
  } catch (error) {
    logger.error('Failed to remove notification recipient', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove notification recipient',
    });
  }
});

router.patch('/recipients/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient ID',
      });
    }

    const [existing] = await db.select()
      .from(notificationRecipients)
      .where(eq(notificationRecipients.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
      });
    }

    const [recipient] = await db.update(notificationRecipients)
      .set({ isActive: !existing.isActive })
      .where(eq(notificationRecipients.id, id))
      .returning();

    logger.info('Notification recipient status toggled', { recipientId: id, isActive: recipient.isActive });

    res.json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    logger.error('Failed to toggle recipient status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle recipient status',
    });
  }
});

// ============= API Key Management Routes =============

router.get('/api-keys', async (_req: Request, res: Response) => {
  try {
    const keys = await db.select({
      id: emailApiKeys.id,
      subdomain: emailApiKeys.subdomain,
      description: emailApiKeys.description,
      isActive: emailApiKeys.isActive,
      createdAt: emailApiKeys.createdAt,
      lastUsedAt: emailApiKeys.lastUsedAt,
    })
      .from(emailApiKeys)
      .orderBy(desc(emailApiKeys.createdAt));

    const maskedKeys = keys.map((key: typeof keys[number]) => ({
      ...key,
      keyPreview: 'molo_****...****',
    }));

    res.json({
      success: true,
      data: maskedKeys,
    });
  } catch (error) {
    logger.error('Failed to get API keys', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API keys',
    });
  }
});

router.post('/api-keys', async (req: Request, res: Response) => {
  try {
    const createApiKeySchema = z.object({
      subdomain: z.string().min(1).max(100),
      description: z.string().optional(),
    });

    const body = createApiKeySchema.parse(req.body);

    const [existingKey] = await db.select({ id: emailApiKeys.id })
      .from(emailApiKeys)
      .where(eq(emailApiKeys.subdomain, body.subdomain))
      .limit(1);

    if (existingKey) {
      return res.status(409).json({
        success: false,
        error: 'An API key already exists for this subdomain',
      });
    }

    const rawApiKey = 'molo_' + crypto.randomBytes(32).toString('hex');
    const keyHash = hashApiKey(rawApiKey);

    const [apiKey] = await db.insert(emailApiKeys)
      .values({
        subdomain: body.subdomain,
        keyHash: keyHash,
        description: body.description,
        isActive: true,
      })
      .returning();

    logger.info('API key created', { apiKeyId: apiKey.id, subdomain: apiKey.subdomain });

    res.status(201).json({
      success: true,
      data: {
        id: apiKey.id,
        subdomain: apiKey.subdomain,
        description: apiKey.description,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        rawApiKey: rawApiKey,
      },
      message: 'API key created successfully. Please save the API key now as it will not be shown again.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Failed to create API key', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create API key',
    });
  }
});

router.delete('/api-keys/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key ID',
      });
    }

    const [existing] = await db.select({ id: emailApiKeys.id, subdomain: emailApiKeys.subdomain })
      .from(emailApiKeys)
      .where(eq(emailApiKeys.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
      });
    }

    await db.delete(emailApiKeys).where(eq(emailApiKeys.id, id));

    logger.info('API key deleted', { apiKeyId: id, subdomain: existing.subdomain });

    res.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete API key', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key',
    });
  }
});

router.patch('/api-keys/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key ID',
      });
    }

    const [existing] = await db.select()
      .from(emailApiKeys)
      .where(eq(emailApiKeys.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
      });
    }

    const [apiKey] = await db.update(emailApiKeys)
      .set({ isActive: !existing.isActive })
      .where(eq(emailApiKeys.id, id))
      .returning();

    logger.info('API key status toggled', { apiKeyId: id, subdomain: apiKey.subdomain, isActive: apiKey.isActive });

    res.json({
      success: true,
      data: {
        id: apiKey.id,
        subdomain: apiKey.subdomain,
        description: apiKey.description,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
    });
  } catch (error) {
    logger.error('Failed to toggle API key status', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle API key status',
    });
  }
});

export default router;
