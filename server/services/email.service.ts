import nodemailer from 'nodemailer';
import { db } from '../db';
import { emailSettings, emailTemplates, notificationRecipients, formTypes, emailLogs, InsertEmailLog } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { createLoggerWithContext } from '../utils/logger';
import { emailMonitoringService } from './email-monitoring.service';

const log = createLoggerWithContext('EmailService');

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@unknown';
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

interface EmailLogContext {
  templateSlug?: string;
  formType?: string;
  subdomain?: string;
  metadata?: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private settingsCache: typeof emailSettings.$inferSelect | null = null;
  private settingsCacheTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private currentLogContext: EmailLogContext = {};

  async getSettings() {
    const now = Date.now();
    if (this.settingsCache && (now - this.settingsCacheTime) < this.CACHE_TTL) {
      return this.settingsCache;
    }

    try {
      const [settings] = await db.select().from(emailSettings).limit(1);
      
      if (settings) {
        this.settingsCache = settings;
        this.settingsCacheTime = now;
      }
      
      return settings || null;
    } catch (error) {
      log.error('Failed to fetch email settings', error);
      return null;
    }
  }

  async initTransporter() {
    try {
      const settings = await this.getSettings();
      
      if (!settings) {
        log.warn('No email settings configured');
        this.transporter = null;
        return false;
      }

      const transportOptions: nodemailer.TransportOptions = {
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpPort === 465,
        tls: {
          rejectUnauthorized: settings.useTls !== false,
        },
      } as nodemailer.TransportOptions;

      // Add auth only if credentials are provided
      if (settings.smtpUsername && settings.smtpPassword) {
        (transportOptions as any).auth = {
          user: settings.smtpUsername,
          pass: settings.smtpPassword,
        };
      }

      // Disable TLS only for local mail servers (localhost/127.0.0.1 on port 25) 
      // or when useTls is explicitly set to false
      const isLocalMailServer = 
        (settings.smtpHost === 'localhost' || settings.smtpHost === '127.0.0.1') && 
        settings.smtpPort === 25;
      
      if (settings.useTls === false || isLocalMailServer) {
        (transportOptions as any).ignoreTLS = true;
        (transportOptions as any).secure = false;
      }

      this.transporter = nodemailer.createTransport(transportOptions);

      log.info('Email transporter initialized', { host: settings.smtpHost, port: settings.smtpPort });
      return true;
    } catch (error) {
      log.error('Failed to initialize email transporter', error);
      this.transporter = null;
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.transporter) {
        const initialized = await this.initTransporter();
        if (!initialized) {
          return { success: false, message: 'No email settings configured' };
        }
      }

      await this.transporter!.verify();
      
      await db
        .update(emailSettings)
        .set({ isVerified: true, lastVerifiedAt: new Date() });
      
      log.info('Email connection test successful');
      return { success: true, message: 'Connection verified successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Email connection test failed', error);
      
      await db
        .update(emailSettings)
        .set({ isVerified: false });
      
      return { success: false, message: `Connection failed: ${errorMessage}` };
    }
  }

  async sendTemplateEmail(
    templateSlug: string,
    data: Record<string, string>,
    toEmail?: string,
    subdomain?: string
  ): Promise<boolean> {
    try {
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.slug, templateSlug),
          eq(emailTemplates.isActive, true)
        ))
        .limit(1);

      if (!template) {
        log.warn('Email template not found', { templateSlug });
        return false;
      }

      this.setLogContext({
        templateSlug,
        subdomain,
        metadata: { recipientCount: toEmail ? 1 : undefined },
      });

      const recipients = toEmail
        ? [toEmail]
        : await this.getRecipients(template.formTypeId || undefined);

      if (recipients.length === 0) {
        log.warn('No recipients found for template', { templateSlug });
        this.clearLogContext();
        return false;
      }

      const subject = this.replaceTemplateVariables(template.subject, data);
      const html = this.replaceTemplateVariables(template.htmlBody, data);
      const text = template.textBody 
        ? this.replaceTemplateVariables(template.textBody, data) 
        : undefined;

      let success = true;
      for (const recipient of recipients) {
        const sent = await this.sendEmail(recipient, subject, html, text);
        if (!sent) success = false;
      }

      this.clearLogContext();
      return success;
    } catch (error) {
      log.error('Failed to send template email', error, { templateSlug });
      this.clearLogContext();
      return false;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        const initialized = await this.initTransporter();
        if (!initialized) {
          log.error('Cannot send email: transporter not initialized');
          return false;
        }
      }

      const settings = await this.getSettings();
      if (!settings) {
        log.error('Cannot send email: no settings configured');
        return false;
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${settings.fromName}" <${settings.fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        replyTo: settings.replyToEmail || settings.fromEmail,
      };

      const info = await this.transporter!.sendMail(mailOptions);

      log.info('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
      });

      emailMonitoringService.recordSuccess(to);
      await this.logEmailAttempt(to, 'sent');

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Failed to send email', error, { to, subject });
      
      emailMonitoringService.recordFailure(to, errorMessage);
      await this.logEmailAttempt(to, 'failed', errorMessage);
      
      this.transporter = null;
      this.settingsCache = null;
      
      return false;
    }
  }

  async getRecipients(formTypeId?: number): Promise<string[]> {
    try {
      let query = db
        .select({ email: notificationRecipients.email })
        .from(notificationRecipients)
        .where(eq(notificationRecipients.isActive, true));

      if (formTypeId !== undefined) {
        query = db
          .select({ email: notificationRecipients.email })
          .from(notificationRecipients)
          .where(and(
            eq(notificationRecipients.isActive, true),
            eq(notificationRecipients.formTypeId, formTypeId)
          ));
      }

      const recipients = await query;
      return recipients.map(r => r.email);
    } catch (error) {
      log.error('Failed to fetch recipients', error, { formTypeId });
      return [];
    }
  }

  async notifyFormSubmission(
    formTypeSlug: string,
    submissionData: {
      name: string;
      email: string;
      subject?: string;
      message: string;
    },
    subdomain?: string
  ): Promise<boolean> {
    try {
      const [formType] = await db
        .select()
        .from(formTypes)
        .where(and(
          eq(formTypes.slug, formTypeSlug),
          eq(formTypes.isActive, true)
        ))
        .limit(1);

      if (!formType) {
        log.warn('Form type not found', { formTypeSlug });
        return false;
      }

      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.formTypeId, formType.id),
          eq(emailTemplates.isActive, true)
        ))
        .limit(1);

      if (!template) {
        log.warn('No email template found for form type', { formTypeSlug, formTypeId: formType.id });
        this.setLogContext({ formType: formTypeSlug, subdomain });
        const result = await this.sendDefaultNotification(formType.id, submissionData);
        this.clearLogContext();
        return result;
      }

      this.setLogContext({
        templateSlug: template.slug,
        formType: formTypeSlug,
        subdomain,
      });

      const data: Record<string, string> = {
        name: submissionData.name,
        email: submissionData.email,
        subject: submissionData.subject || 'No subject',
        message: submissionData.message,
        form_type: formType.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };

      const recipients = await this.getRecipients(formType.id);
      
      if (recipients.length === 0) {
        log.warn('No recipients for form type', { formTypeSlug });
        this.clearLogContext();
        return false;
      }

      const subject = this.replaceTemplateVariables(template.subject, data);
      const html = this.replaceTemplateVariables(template.htmlBody, data);
      const text = template.textBody 
        ? this.replaceTemplateVariables(template.textBody, data) 
        : undefined;

      let success = true;
      for (const recipient of recipients) {
        const sent = await this.sendEmail(recipient, subject, html, text);
        if (!sent) success = false;
      }

      log.info('Form submission notification sent', { 
        formTypeSlug, 
        recipientCount: recipients.length,
        success 
      });

      this.clearLogContext();
      return success;
    } catch (error) {
      log.error('Failed to send form submission notification', error, { formTypeSlug });
      this.clearLogContext();
      return false;
    }
  }

  private async sendDefaultNotification(
    formTypeId: number,
    data: { name: string; email: string; subject?: string; message: string }
  ): Promise<boolean> {
    const recipients = await this.getRecipients(formTypeId);
    
    if (recipients.length === 0) {
      return false;
    }

    const subject = `New Form Submission: ${data.subject || 'Contact Form'}`;
    const html = `
      <h2>New Form Submission</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <div style="padding: 15px; background: #f5f5f5; border-radius: 5px;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Sent on ${new Date().toLocaleString()}
      </p>
    `;

    let success = true;
    for (const recipient of recipients) {
      const sent = await this.sendEmail(recipient, subject, html);
      if (!sent) success = false;
    }

    return success;
  }

  private replaceTemplateVariables(
    template: string,
    data: Record<string, string>
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  clearCache() {
    this.settingsCache = null;
    this.settingsCacheTime = 0;
    this.transporter = null;
    log.info('Email service cache cleared');
  }

  private async logEmailAttempt(
    recipientEmail: string,
    status: 'sent' | 'failed' | 'pending',
    errorMessage?: string
  ): Promise<void> {
    try {
      const logEntry: InsertEmailLog = {
        templateSlug: this.currentLogContext.templateSlug || null,
        recipientEmail: maskEmail(recipientEmail),
        formType: this.currentLogContext.formType || null,
        status,
        errorMessage: errorMessage || null,
        metadata: this.currentLogContext.metadata || null,
        subdomain: this.currentLogContext.subdomain || null,
      };

      await db.insert(emailLogs).values(logEntry);
    } catch (error) {
      log.error('Failed to log email attempt', error);
    }
  }

  setLogContext(context: EmailLogContext): void {
    this.currentLogContext = context;
  }

  clearLogContext(): void {
    this.currentLogContext = {};
  }

  async sendAuthEmail(
    type: 'login' | 'register' | 'password-reset',
    userEmail: string,
    variables: Record<string, string>,
    subdomain?: string
  ): Promise<boolean> {
    try {
      const formTypeSlugMap: Record<string, string> = {
        'login': 'auth-login',
        'register': 'registration',
        'password-reset': 'auth-password-reset',
      };

      const templateSlugMap: Record<string, string> = {
        'login': 'auth-login-notification',
        'register': 'registration-notification',
        'password-reset': 'auth-password-reset-notification',
      };

      const formTypeSlug = formTypeSlugMap[type];
      const templateSlug = templateSlugMap[type];

      this.setLogContext({
        templateSlug,
        formType: formTypeSlug,
        subdomain,
      });

      const defaultVars: Record<string, string> = {
        email: userEmail,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
        time: new Date().toLocaleTimeString('en-US', { timeStyle: 'short' }),
        year: new Date().getFullYear().toString(),
        ...variables,
      };

      const success = await this.sendTemplateEmail(templateSlug, defaultVars, userEmail, subdomain);

      log.info('Auth email sent', {
        type,
        userEmail,
        success,
      });

      this.clearLogContext();
      return success;
    } catch (error) {
      log.error('Failed to send auth email', error, { type, userEmail });
      this.clearLogContext();
      return false;
    }
  }
}

export const emailService = new EmailService();
