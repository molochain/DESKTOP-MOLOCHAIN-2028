import axios, { AxiosInstance } from 'axios';
import { createLogger } from '../utils/logger.js';
import { ChannelInterface, ChannelStatus, SendResult } from './channel-manager.js';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('whatsapp-channel');

export class WhatsAppChannel implements ChannelInterface {
  name: 'whatsapp' = 'whatsapp';
  private client: AxiosInstance | null = null;
  private phoneNumberId: string = '';
  private enabled: boolean = false;
  private stats = { sent: 0, failed: 0, pending: 0 };
  private lastCheck: Date = new Date();

  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.WHATSAPP_API_KEY;
      this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

      if (!apiKey || !this.phoneNumberId) {
        logger.warn('WhatsApp API not configured, WhatsApp channel disabled');
        this.enabled = false;
        return;
      }

      this.client = axios.create({
        baseURL: `https://graph.facebook.com/v18.0/${this.phoneNumberId}`,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      this.enabled = true;
      logger.info('WhatsApp channel initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WhatsApp channel:', error);
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
        error: 'WhatsApp channel not initialized',
      };
    }

    const messageId = uuidv4();
    this.stats.pending++;

    try {
      const formattedRecipient = this.formatPhoneNumber(recipient);

      let payload: any;

      if (metadata?.templateName) {
        payload = {
          messaging_product: 'whatsapp',
          to: formattedRecipient,
          type: 'template',
          template: {
            name: metadata.templateName,
            language: { code: metadata.language || 'en' },
            components: metadata.components || [],
          },
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          to: formattedRecipient,
          type: 'text',
          text: {
            preview_url: false,
            body: body,
          },
        };
      }

      const response = await this.client.post('/messages', payload);

      this.stats.pending--;
      this.stats.sent++;

      logger.info(`WhatsApp message sent to ${recipient}`);

      return {
        success: true,
        messageId,
        providerResponse: {
          waMessageId: response.data.messages?.[0]?.id,
          contacts: response.data.contacts,
        },
      };
    } catch (error: any) {
      this.stats.pending--;
      this.stats.failed++;

      logger.error(`Failed to send WhatsApp message to ${recipient}:`, error.response?.data || error.message);

      return {
        success: false,
        messageId,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
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
