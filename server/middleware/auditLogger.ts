import { Request, Response, NextFunction } from 'express';
import { logAdminAction, AuditLogData } from '../services/auditService';
import { logger } from '../utils/logger';

const SENSITIVE_FIELDS = [
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
];

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function sanitizeDetails(body: any): Record<string, any> | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeDetails(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function extractEntityType(path: string): string {
  const match = path.match(/^\/api\/admin\/([^\/]+)/);
  if (match) {
    return match[1].replace(/-/g, '_');
  }
  return 'admin';
}

function extractEntityId(req: Request): string | null {
  if (req.params.id) {
    return String(req.params.id);
  }
  if (req.params.userId) {
    return String(req.params.userId);
  }
  const idMatch = req.originalUrl.match(/\/(\d+)(?:\?|$)/);
  if (idMatch) {
    return idMatch[1];
  }
  return null;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function auditLogger(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith('/api/admin')) {
    return next();
  }

  if (!MUTATING_METHODS.includes(req.method)) {
    return next();
  }

  const startTime = Date.now();
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const logAction = async (status: 'success' | 'error') => {
    try {
      const user = req.user as any;
      if (!user?.id) {
        return;
      }

      const auditData: AuditLogData = {
        userId: user.id,
        action: `${req.method} ${req.path}`,
        entityType: extractEntityType(req.path),
        entityId: extractEntityId(req),
        details: sanitizeDetails(req.body),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        status,
      };

      await logAdminAction(auditData);
    } catch (error) {
      logger.error('Audit logging failed:', error);
    }
  };

  res.json = function (body: any) {
    const status = res.statusCode >= 400 ? 'error' : 'success';
    logAction(status);
    return originalJson(body);
  };

  res.send = function (body: any) {
    const status = res.statusCode >= 400 ? 'error' : 'success';
    logAction(status);
    return originalSend(body);
  };

  next();
}
