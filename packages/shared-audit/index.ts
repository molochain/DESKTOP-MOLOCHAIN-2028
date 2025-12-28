/**
 * @package @molochain/shared-audit
 * Shared Audit Logging Utilities
 * Audit types, interfaces, and constants for cross-service use
 */

export {
  type AuditLogData,
  type AuditFilters,
  type AuditUser,
  type AuditLogWithUser,
  type AuditLogEntry,
  type AuditSeverity,
  type AuditActionSummary,
  type ComplianceAuditData,
} from './types';

export const AUDIT_EVENT_TYPES = {
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_PASSWORD_CHANGE: 'user.password_change',
  USER_PASSWORD_RESET: 'user.password_reset',
  USER_PROFILE_UPDATE: 'user.profile_update',
  USER_2FA_ENABLED: 'user.2fa_enabled',
  USER_2FA_DISABLED: 'user.2fa_disabled',
  
  ADMIN_USER_CREATE: 'admin.user.create',
  ADMIN_USER_UPDATE: 'admin.user.update',
  ADMIN_USER_DELETE: 'admin.user.delete',
  ADMIN_USER_SUSPEND: 'admin.user.suspend',
  ADMIN_USER_ACTIVATE: 'admin.user.activate',
  ADMIN_ROLE_CHANGE: 'admin.role.change',
  ADMIN_PERMISSION_CHANGE: 'admin.permission.change',
  
  CONTENT_CREATE: 'content.create',
  CONTENT_UPDATE: 'content.update',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  CONTENT_UNPUBLISH: 'content.unpublish',
  
  SETTINGS_UPDATE: 'settings.update',
  SECURITY_CONFIG_CHANGE: 'security.config.change',
  INTEGRATION_CONNECT: 'integration.connect',
  INTEGRATION_DISCONNECT: 'integration.disconnect',
  
  API_ACCESS: 'api.access',
  API_ERROR: 'api.error',
  RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
  
  SESSION_CREATE: 'session.create',
  SESSION_DESTROY: 'session.destroy',
  SESSION_REFRESH: 'session.refresh',
  
  DATA_EXPORT: 'data.export',
  DATA_IMPORT: 'data.import',
  
  SECURITY_ALERT: 'security.alert',
  SECURITY_BREACH_ATTEMPT: 'security.breach_attempt',
} as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[keyof typeof AUDIT_EVENT_TYPES];

export const AUDIT_ENTITY_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
  SESSION: 'session',
  CONTENT: 'content',
  SETTINGS: 'settings',
  SECURITY: 'security',
  INTEGRATION: 'integration',
  API: 'api',
  SYSTEM: 'system',
  AUTHENTICATION: 'authentication',
} as const;

export type AuditEntityType = typeof AUDIT_ENTITY_TYPES[keyof typeof AUDIT_ENTITY_TYPES];

export const AUDIT_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  PENDING: 'pending',
} as const;

export type AuditStatus = typeof AUDIT_STATUS[keyof typeof AUDIT_STATUS];

export const SENSITIVE_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'secret',
  'token',
  'apiKey',
  'accessToken',
  'refreshToken',
  'twoFactorSecret',
  'recoveryCodes',
  'creditCard',
  'ssn',
  'pin',
] as const;

export function sanitizeAuditDetails(body: any): Record<string, any> | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditDetails(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function getClientIp(headers: Record<string, string | string[] | undefined>, fallbackIp?: string): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return fallbackIp || 'unknown';
}

export interface AuditLogger {
  log(data: AuditLogData): Promise<void>;
  query(filters: AuditFilters): Promise<{ logs: AuditLogWithUser[]; total: number }>;
  getById(id: number): Promise<AuditLogWithUser | null>;
  getRecentByUser(userId: number, limit?: number): Promise<AuditLogWithUser[]>;
  getSummary(startDate?: Date, endDate?: Date): Promise<AuditActionSummary>;
}
