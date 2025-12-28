import { Router, Request, Response } from 'express';
import { db } from '../db';
import { emailApiKeys, formTypes, emailTemplates, notificationRecipients } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { emailService } from '../services/email.service';
import { hashApiKey, verifyApiKey } from '../utils/api-key.utils';
import { 
  emailSendLimiter, 
  authEmailLimiter, 
  passwordResetEmailLimiter,
  addRateLimitHeaders,
  getEmailLimiterByFormType,
  dynamicEmailRateLimiter
} from '../middleware/email-rate-limit';

const router = Router();

const sendEmailSchema = z.object({
  formType: z.string().min(1),
  recipientEmail: z.string().email().optional(),
  variables: z.record(z.string()).default({}),
  subdomain: z.string().optional(),
});

async function validateApiKey(req: Request): Promise<{ valid: boolean; subdomain?: string }> {
  const apiKey = req.headers['x-api-key'] as string;
  const originSubdomain = req.headers['x-subdomain'] as string;

  logger.info('API key validation attempt', { 
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 10) : 'none',
    keyLength: apiKey ? apiKey.length : 0,
    originSubdomain 
  });

  if (!apiKey) {
    logger.info('No API key in request headers');
    return { valid: false };
  }

  try {
    const activeKeys = await db
      .select()
      .from(emailApiKeys)
      .where(eq(emailApiKeys.isActive, true));

    logger.info('Active API keys found', { count: activeKeys.length });

    for (const keyRecord of activeKeys) {
      let isValid = false;
      
      if (keyRecord.keyHash) {
        isValid = verifyApiKey(apiKey, keyRecord.keyHash);
        logger.info('Hash verification', { 
          subdomain: keyRecord.subdomain, 
          isValid,
          hasKeyHash: true,
          storedHashPrefix: keyRecord.keyHash.substring(0, 10)
        });
      } else if (keyRecord.apiKey) {
        isValid = keyRecord.apiKey === apiKey;
        if (isValid) {
          logger.warn('Plaintext API key used - migration recommended', { 
            subdomain: keyRecord.subdomain,
            keyId: keyRecord.id 
          });
        }
      }
      
      if (isValid) {
        await db
          .update(emailApiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(emailApiKeys.id, keyRecord.id));

        logger.info('API key validated successfully', { subdomain: keyRecord.subdomain });
        return { valid: true, subdomain: originSubdomain || keyRecord.subdomain };
      }
    }

    logger.warn('API key validation failed - no matching key found');
    return { valid: false };
  } catch (error) {
    logger.error('API key validation failed', error);
    return { valid: false };
  }
}

router.post('/send', dynamicEmailRateLimiter, async (req: Request, res: Response) => {
  try {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing API key',
      });
    }

    const body = sendEmailSchema.parse(req.body);

    const [formType] = await db
      .select()
      .from(formTypes)
      .where(and(
        eq(formTypes.slug, body.formType),
        eq(formTypes.isActive, true)
      ))
      .limit(1);

    if (!formType) {
      return res.status(400).json({
        success: false,
        error: `Form type '${body.formType}' not found or inactive`,
      });
    }

    const variables = {
      ...body.variables,
      subdomain: auth.subdomain || 'unknown',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
      time: new Date().toLocaleTimeString('en-US', { timeStyle: 'short' }),
    };

    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(and(
        eq(emailTemplates.formTypeId, formType.id),
        eq(emailTemplates.isActive, true)
      ))
      .limit(1);

    if (!template) {
      return res.status(400).json({
        success: false,
        error: `No active template found for form type '${body.formType}'`,
      });
    }

    const templateSlug = template.slug;
    const success = await emailService.sendTemplateEmail(
      templateSlug,
      variables,
      body.recipientEmail
    );

    logger.info('Cross-subdomain email request', {
      subdomain: auth.subdomain,
      formType: body.formType,
      recipientEmail: body.recipientEmail ? 'custom' : 'configured',
      success,
    });

    res.json({
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email',
      subdomain: auth.subdomain,
      formType: body.formType,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Public email API error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/form-types', async (req: Request, res: Response) => {
  try {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing API key',
      });
    }

    const types = await db
      .select({
        id: formTypes.id,
        name: formTypes.name,
        slug: formTypes.slug,
      })
      .from(formTypes)
      .where(eq(formTypes.isActive, true));

    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    logger.error('Failed to get form types', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/notify-submission', dynamicEmailRateLimiter, async (req: Request, res: Response) => {
  try {
    const auth = await validateApiKey(req);
    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing API key',
      });
    }

    const schema = z.object({
      formType: z.string(),
      name: z.string(),
      email: z.string().email(),
      subject: z.string().optional(),
      message: z.string(),
    });

    const body = schema.parse(req.body);

    const success = await emailService.notifyFormSubmission(body.formType, {
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    });

    logger.info('Cross-subdomain form submission notification', {
      subdomain: auth.subdomain,
      formType: body.formType,
      success,
    });

    res.json({
      success,
      message: success ? 'Notification sent' : 'Failed to send notification',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error('Notify submission API error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const connectionTest = await emailService.testConnection();
    
    res.json({
      success: true,
      status: 'healthy',
      email: connectionTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Email service check failed',
    });
  }
});

export default router;
