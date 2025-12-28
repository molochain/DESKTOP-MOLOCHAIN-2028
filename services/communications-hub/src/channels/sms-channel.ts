import { createLogger } from '../utils/logger.js';
import { ChannelInterface, ChannelStatus, SendResult } from './channel-manager.js';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('sms-channel');

interface TwilioClient {
  messages: {
    create(options: { body: string; from: string; to: string }): Promise<{ sid: string; status: string }>;
  };
}

export class SmsChannel implements ChannelInterface {
  name: 'sms' = 'sms';
  private client: TwilioClient | null = null;
  private fromNumber: string = '';
  private enabled: boolean = false;
  private stats = { sent: 0, failed: 0, pending: 0 };
  private lastCheck: Date = new Date();

  async initialize(): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

      if (!accountSid || !authToken || !this.fromNumber) {
        logger.warn('Twilio not configured, SMS channel disabled');
        this.enabled = false;
        return;
      }

      const twilio = await import('twilio');
      this.client = twilio.default(accountSid, authToken) as unknown as TwilioClient;
      this.enabled = true;
      logger.info('SMS channel initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SMS channel:', error);
      this.enabled = false;
    }
  }

  async send(
    recipient: string,
    subject: string | undefined,
    body: string,
    metadata?: Record<string, any>
  ): Promise<SendResult> {
    if (!this.client || !this.enabled) {
      return {
        success: false,
        error: 'SMS channel not initialized',
      };
    }

    const messageId = uuidv4();
    this.stats.pending++;

    try {
      const formattedRecipient = this.formatPhoneNumber(recipient);
      
      const message = await this.client.messages.create({
        body: body,
        from: this.fromNumber,
        to: formattedRecipient,
      });

      this.stats.pending--;
      this.stats.sent++;
      
      logger.info(`SMS sent to ${recipient}, sid: ${message.sid}`);
      
      return {
        success: true,
        messageId,
        providerResponse: {
          sid: message.sid,
          status: message.status,
        },
      };
    } catch (error: any) {
      this.stats.pending--;
      this.stats.failed++;
      
      logger.error(`Failed to send SMS to ${recipient}:`, error);
      
      return {
        success: false,
        messageId,
        error: error.message,
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    return cleaned;
  }

  getStatus(): ChannelStatus {
    this.lastCheck = new Date();
    return {
      name: this.name,
      enabled: this.enabled,
      healthy: this.enabled && this.client !== null,
      lastCheck: this.lastCheck,
      stats: { ...this.stats },
    };
  }
}
