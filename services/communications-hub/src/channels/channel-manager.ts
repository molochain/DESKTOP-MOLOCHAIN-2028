import { createLogger } from '../utils/logger.js';
import { EmailChannel } from './email-channel.js';
import { SmsChannel } from './sms-channel.js';
import { WhatsAppChannel } from './whatsapp-channel.js';
import { PushChannel } from './push-channel.js';

const logger = createLogger('channel-manager');

export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'push';

export interface ChannelInterface {
  name: ChannelType;
  initialize(): Promise<void>;
  send(recipient: string, subject: string | undefined, body: string, metadata?: Record<string, any>): Promise<SendResult>;
  getStatus(): ChannelStatus;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  providerResponse?: any;
  error?: string;
}

export interface ChannelStatus {
  name: ChannelType;
  enabled: boolean;
  healthy: boolean;
  lastCheck: Date;
  stats: {
    sent: number;
    failed: number;
    pending: number;
  };
}

export class ChannelManager {
  private channels: Map<ChannelType, ChannelInterface> = new Map();

  async initialize(): Promise<void> {
    logger.info('Initializing channel manager...');

    const emailChannel = new EmailChannel();
    await emailChannel.initialize();
    this.channels.set('email', emailChannel);

    const smsChannel = new SmsChannel();
    await smsChannel.initialize();
    this.channels.set('sms', smsChannel);

    const whatsappChannel = new WhatsAppChannel();
    await whatsappChannel.initialize();
    this.channels.set('whatsapp', whatsappChannel);

    const pushChannel = new PushChannel();
    await pushChannel.initialize();
    this.channels.set('push', pushChannel);

    logger.info(`Initialized ${this.channels.size} channels`);
  }

  getChannel(type: ChannelType): ChannelInterface | undefined {
    return this.channels.get(type);
  }

  async send(
    channelType: ChannelType,
    recipient: string,
    subject: string | undefined,
    body: string,
    metadata?: Record<string, any>
  ): Promise<SendResult> {
    const channel = this.channels.get(channelType);
    
    if (!channel) {
      return {
        success: false,
        error: `Channel ${channelType} not found`,
      };
    }

    try {
      return await channel.send(recipient, subject, body, metadata);
    } catch (error: any) {
      logger.error(`Failed to send via ${channelType}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getChannelStatus(): Record<ChannelType, ChannelStatus> {
    const status: Record<string, ChannelStatus> = {};
    
    for (const [type, channel] of this.channels) {
      status[type] = channel.getStatus();
    }
    
    return status as Record<ChannelType, ChannelStatus>;
  }

  getAvailableChannels(): ChannelType[] {
    return Array.from(this.channels.keys());
  }

  isChannelEnabled(type: ChannelType): boolean {
    const channel = this.channels.get(type);
    return channel ? channel.getStatus().enabled : false;
  }
}
