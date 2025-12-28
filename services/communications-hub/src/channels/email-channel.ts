import nodemailer from 'nodemailer';
import { createLogger } from '../utils/logger.js';
import { ChannelInterface, ChannelStatus, SendResult } from './channel-manager.js';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('email-channel');

export class EmailChannel implements ChannelInterface {
  name: 'email' = 'email';
  private transporter: nodemailer.Transporter | null = null;
  private enabled: boolean = false;
  private stats = { sent: 0, failed: 0, pending: 0 };
  private lastCheck: Date = new Date();

  async initialize(): Promise<void> {
    try {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587');
      const username = process.env.SMTP_USERNAME;
      const password = process.env.SMTP_PASSWORD;

      if (!host) {
        logger.warn('SMTP not configured, email channel disabled');
        this.enabled = false;
        return;
      }

      const skipTlsVerify = process.env.SMTP_SKIP_TLS_VERIFY === 'true';
      
      if (skipTlsVerify) {
        logger.warn('TLS verification disabled for SMTP - use only in development');
      }

      const transportOptions: nodemailer.TransportOptions = {
        host,
        port,
        secure: port === 465,
        tls: {
          rejectUnauthorized: !skipTlsVerify,
        },
      } as nodemailer.TransportOptions;

      if (username && password) {
        (transportOptions as any).auth = {
          user: username,
          pass: password,
        };
      }

      this.transporter = nodemailer.createTransport(transportOptions);
      
      await this.transporter.verify();
      this.enabled = true;
      logger.info('Email channel initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email channel:', error);
      this.enabled = false;
    }
  }

  async send(
    recipient: string,
    subject: string | undefined,
    body: string,
    metadata?: Record<string, any>
  ): Promise<SendResult> {
    if (!this.transporter || !this.enabled) {
      return {
        success: false,
        error: 'Email channel not initialized',
      };
    }

    const messageId = uuidv4();
    this.stats.pending++;

    try {
      const fromEmail = process.env.FROM_EMAIL || 'noreply@molochain.com';
      const fromName = process.env.FROM_NAME || 'MoloChain';

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: recipient,
        subject: subject || 'Notification from MoloChain',
        html: body,
        headers: {
          'X-Message-ID': messageId,
        },
      };

      if (metadata?.attachments) {
        mailOptions.attachments = metadata.attachments;
      }

      if (metadata?.cc) {
        mailOptions.cc = metadata.cc;
      }

      if (metadata?.bcc) {
        mailOptions.bcc = metadata.bcc;
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      this.stats.pending--;
      this.stats.sent++;
      
      logger.info(`Email sent to ${recipient}, messageId: ${messageId}`);
      
      return {
        success: true,
        messageId,
        providerResponse: {
          accepted: result.accepted,
          rejected: result.rejected,
          response: result.response,
        },
      };
    } catch (error: any) {
      this.stats.pending--;
      this.stats.failed++;
      
      logger.error(`Failed to send email to ${recipient}:`, error);
      
      return {
        success: false,
        messageId,
        error: error.message,
      };
    }
  }

  getStatus(): ChannelStatus {
    this.lastCheck = new Date();
    return {
      name: this.name,
      enabled: this.enabled,
      healthy: this.enabled && this.transporter !== null,
      lastCheck: this.lastCheck,
      stats: { ...this.stats },
    };
  }
}
