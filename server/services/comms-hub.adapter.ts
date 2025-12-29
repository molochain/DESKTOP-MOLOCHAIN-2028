import axios, { AxiosError } from 'axios';
import { createLoggerWithContext } from '../utils/logger';

const log = createLoggerWithContext('CommsHubAdapter');

const COMMS_HUB_URL = process.env.COMMS_HUB_URL || 'http://localhost:7020';
const COMMS_HUB_TIMEOUT = parseInt(process.env.COMMS_HUB_TIMEOUT || '10000', 10);

export function isCommsHubEnabled(): boolean {
  return process.env.FEATURE_COMMS_HUB_ENABLED === 'true';
}

interface CommsHubResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}

class CommsHubAdapter {
  private isAvailable: boolean = true;
  private lastHealthCheck: number = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL && this.isAvailable) {
      return this.isAvailable;
    }

    try {
      const response = await axios.get(`${COMMS_HUB_URL}/api/health`, {
        timeout: 5000,
      });
      this.isAvailable = response.data?.status === 'healthy';
      this.lastHealthCheck = now;
      return this.isAvailable;
    } catch (error) {
      log.warn('Communications Hub health check failed', { error: (error as Error).message });
      this.isAvailable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<{ success: boolean; shouldFallback: boolean }> {
    if (!isCommsHubEnabled()) {
      return { success: false, shouldFallback: true };
    }

    try {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        log.warn('Communications Hub unavailable, falling back to direct email');
        return { success: false, shouldFallback: true };
      }

      const response = await axios.post<CommsHubResponse>(
        `${COMMS_HUB_URL}/api/messages/send-direct`,
        {
          channel: 'email',
          recipient: to,
          subject,
          body: html,
          metadata: {
            textBody: text,
            source: 'email-service-adapter',
          },
        },
        {
          timeout: COMMS_HUB_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        log.info('Email sent via Communications Hub', {
          messageId: response.data.messageId,
          to,
          subject,
        });
        return { success: true, shouldFallback: false };
      }

      log.warn('Communications Hub returned error', { error: response.data.error });
      return { success: false, shouldFallback: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        log.warn('Communications Hub connection failed, falling back to direct email', {
          error: axiosError.message,
        });
        this.isAvailable = false;
        return { success: false, shouldFallback: true };
      }

      log.error('Communications Hub request failed', error);
      return { success: false, shouldFallback: true };
    }
  }

  async sendTemplateEmail(
    templateSlug: string,
    data: Record<string, string>,
    toEmail?: string,
    subdomain?: string
  ): Promise<{ success: boolean; shouldFallback: boolean }> {
    if (!isCommsHubEnabled()) {
      return { success: false, shouldFallback: true };
    }

    try {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        log.warn('Communications Hub unavailable for template email, falling back');
        return { success: false, shouldFallback: true };
      }

      const response = await axios.post<CommsHubResponse>(
        `${COMMS_HUB_URL}/api/templates/send`,
        {
          channel: 'email',
          templateSlug,
          recipient: toEmail,
          variables: data,
          metadata: {
            subdomain,
            source: 'email-service-adapter',
          },
        },
        {
          timeout: COMMS_HUB_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        log.info('Template email sent via Communications Hub', {
          messageId: response.data.messageId,
          templateSlug,
          toEmail,
        });
        return { success: true, shouldFallback: false };
      }

      log.warn('Communications Hub template send returned error', { 
        error: response.data.error,
        templateSlug,
      });
      return { success: false, shouldFallback: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        log.warn('Communications Hub connection failed for template email', {
          error: axiosError.message,
          templateSlug,
        });
        this.isAvailable = false;
        return { success: false, shouldFallback: true };
      }

      if (axiosError.response?.status === 404) {
        log.info('Template endpoint not found in Comms Hub, falling back', { templateSlug });
        return { success: false, shouldFallback: true };
      }

      log.error('Communications Hub template request failed', error);
      return { success: false, shouldFallback: true };
    }
  }

  async sendAuthEmail(
    type: 'login' | 'register' | 'password-reset',
    userEmail: string,
    variables: Record<string, string>,
    subdomain?: string
  ): Promise<{ success: boolean; shouldFallback: boolean }> {
    if (!isCommsHubEnabled()) {
      return { success: false, shouldFallback: true };
    }

    try {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        log.warn('Communications Hub unavailable for auth email, falling back');
        return { success: false, shouldFallback: true };
      }

      const authTemplateMap: Record<string, string> = {
        'login': 'auth-login-notification',
        'register': 'registration-notification',
        'password-reset': 'auth-password-reset-notification',
      };

      const templateSlug = authTemplateMap[type];

      const response = await axios.post<CommsHubResponse>(
        `${COMMS_HUB_URL}/api/templates/send`,
        {
          channel: 'email',
          templateSlug,
          recipient: userEmail,
          variables: {
            ...variables,
            email: userEmail,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
            time: new Date().toLocaleTimeString('en-US', { timeStyle: 'short' }),
            year: new Date().getFullYear().toString(),
          },
          metadata: {
            authType: type,
            subdomain,
            source: 'email-service-adapter',
          },
        },
        {
          timeout: COMMS_HUB_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        log.info('Auth email sent via Communications Hub', {
          messageId: response.data.messageId,
          type,
          userEmail,
        });
        return { success: true, shouldFallback: false };
      }

      log.warn('Communications Hub auth email returned error', { 
        error: response.data.error,
        type,
      });
      return { success: false, shouldFallback: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
        log.warn('Communications Hub connection failed for auth email', {
          error: axiosError.message,
          type,
        });
        this.isAvailable = false;
        return { success: false, shouldFallback: true };
      }

      if (axiosError.response?.status === 404) {
        log.info('Auth template endpoint not found in Comms Hub, falling back', { type });
        return { success: false, shouldFallback: true };
      }

      log.error('Communications Hub auth email request failed', error);
      return { success: false, shouldFallback: true };
    }
  }

  resetAvailability(): void {
    this.isAvailable = true;
    this.lastHealthCheck = 0;
  }
}

export const commsHubAdapter = new CommsHubAdapter();
