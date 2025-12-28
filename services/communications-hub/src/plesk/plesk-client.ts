import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('plesk-client');

export interface PleskMailAccount {
  email: string;
  password?: string;
  mailbox: boolean;
  quota?: number;
}

export interface PleskApiResponse {
  code: number;
  stdout: string;
  stderr: string;
}

export class PleskClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PLESK_API_URL || 'https://localhost:8443';
    const skipTlsVerify = process.env.PLESK_SKIP_TLS_VERIFY === 'true';
    
    if (skipTlsVerify) {
      logger.warn('TLS verification disabled for Plesk API - use only in development');
    }
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v2`,
      headers: {
        'X-API-Key': process.env.PLESK_API_KEY || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: !skipTlsVerify,
      }),
      timeout: 30000,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/server');
      logger.info('Plesk API connection successful');
      return true;
    } catch (error) {
      logger.error('Plesk API connection failed:', error);
      return false;
    }
  }

  async createMailAccount(account: PleskMailAccount): Promise<PleskApiResponse> {
    try {
      const params = [
        '--create',
        account.email,
        '-mailbox',
        account.mailbox ? 'true' : 'false',
      ];

      if (account.password) {
        params.push('-passwd', account.password);
      }

      if (account.quota) {
        params.push('-mbox_quota', account.quota.toString());
      }

      const response = await this.client.post('/cli/mail/call', { params });
      logger.info(`Created mail account: ${account.email}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to create mail account ${account.email}:`, error.message);
      throw error;
    }
  }

  async updateMailAccount(email: string, updates: Partial<PleskMailAccount>): Promise<PleskApiResponse> {
    try {
      const params = ['--update', email];

      if (updates.password) {
        params.push('-passwd', updates.password);
      }

      if (updates.quota !== undefined) {
        params.push('-mbox_quota', updates.quota.toString());
      }

      const response = await this.client.post('/cli/mail/call', { params });
      logger.info(`Updated mail account: ${email}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to update mail account ${email}:`, error.message);
      throw error;
    }
  }

  async deleteMailAccount(email: string): Promise<PleskApiResponse> {
    try {
      const response = await this.client.post('/cli/mail/call', {
        params: ['--remove', email],
      });
      logger.info(`Deleted mail account: ${email}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to delete mail account ${email}:`, error.message);
      throw error;
    }
  }

  async getMailAccountInfo(email: string): Promise<PleskApiResponse> {
    try {
      const response = await this.client.post('/cli/mail/call', {
        params: ['--info', email],
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to get mail account info ${email}:`, error.message);
      throw error;
    }
  }

  async configureSpamAssassin(email: string, enabled: boolean, sensitivity: number = 7): Promise<PleskApiResponse> {
    try {
      const params = enabled 
        ? ['--update', email, '-status', 'true', '-hits', sensitivity.toString()]
        : ['--update', email, '-status', 'false'];

      const response = await this.client.post('/cli/spamassassin/call', { params });
      logger.info(`SpamAssassin ${enabled ? 'enabled' : 'disabled'} for: ${email}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to configure SpamAssassin for ${email}:`, error.message);
      throw error;
    }
  }

  async listDomains(): Promise<string[]> {
    try {
      const response = await this.client.get('/domains');
      return response.data.map((d: any) => d.name);
    } catch (error: any) {
      logger.error('Failed to list domains:', error.message);
      return [];
    }
  }
}

export const pleskClient = new PleskClient();
