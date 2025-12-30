import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('request');

interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  query: Record<string, any>;
  ip: string;
  userAgent: string;
  userId?: number;
  apiKeyId?: number;
  startTime: number;
  service?: string;
}

interface ResponseLog extends RequestLog {
  statusCode: number;
  duration: number;
  contentLength?: number;
}

const sensitiveHeaders = ['authorization', 'x-api-key', 'x-api-secret', 'cookie'];
const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized: any = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

function extractService(path: string): string {
  const servicePatterns = [
    { pattern: /^\/api\/v1/, service: 'molochain-core' },
    { pattern: /^\/api\/mololink/, service: 'mololink' },
    { pattern: /^\/api\/rayanava/, service: 'rayanava-gateway' },
    { pattern: /^\/api\/ai/, service: 'rayanava-ai' },
    { pattern: /^\/api\/comms/, service: 'communications-hub' },
    { pattern: /^\/api\/workflows/, service: 'rayanava-workflows' },
    { pattern: /^\/api\/voice/, service: 'rayanava-voice' },
    { pattern: /^\/api\/notifications/, service: 'rayanava-notifications' },
    { pattern: /^\/api\/monitoring/, service: 'rayanava-monitoring' }
  ];
  
  for (const { pattern, service } of servicePatterns) {
    if (pattern.test(path)) return service;
  }
  
  return 'gateway';
}

export function requestLoggerMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req as any).requestId || 'unknown';
    
    const requestLog: RequestLog = {
      requestId,
      method: req.method,
      path: req.path,
      query: sanitizeData(req.query),
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      startTime,
      service: extractService(req.path)
    };
    
    if ((req as any).user) {
      requestLog.userId = (req as any).user.id;
    }
    
    if ((req as any).apiKey) {
      requestLog.apiKeyId = (req as any).apiKey.id;
    }
    
    logger.info('Incoming request', requestLog);
    
    res.on('finish', () => {
      const responseLog: ResponseLog = {
        ...requestLog,
        statusCode: res.statusCode,
        duration: Date.now() - startTime,
        contentLength: parseInt(res.get('content-length') || '0', 10)
      };
      
      const logLevel = res.statusCode >= 500 ? 'error' : 
                       res.statusCode >= 400 ? 'warn' : 'info';
      
      logger[logLevel]('Request completed', responseLog);
    });
    
    next();
  };
}

export function auditLogMiddleware() {
  const auditPaths = [
    { pattern: /^\/api\/.*\/users/, actions: ['POST', 'PUT', 'DELETE'] },
    { pattern: /^\/api\/.*\/settings/, actions: ['POST', 'PUT', 'DELETE'] },
    { pattern: /^\/api\/.*\/permissions/, actions: ['POST', 'PUT', 'DELETE'] },
    { pattern: /^\/api\/.*\/api-keys/, actions: ['POST', 'DELETE'] }
  ];
  
  return (req: Request, res: Response, next: NextFunction) => {
    const shouldAudit = auditPaths.some(
      ({ pattern, actions }) => pattern.test(req.path) && actions.includes(req.method)
    );
    
    if (!shouldAudit) {
      return next();
    }
    
    const auditData = {
      action: `${req.method} ${req.path}`,
      userId: (req as any).user?.id,
      apiKeyId: (req as any).apiKey?.id,
      ip: req.ip,
      requestBody: sanitizeData(req.body),
      timestamp: new Date().toISOString()
    };
    
    logger.info('AUDIT', auditData);
    
    next();
  };
}
