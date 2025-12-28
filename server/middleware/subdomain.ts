import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export type SubdomainRole = 'admin' | 'app' | 'public';

declare global {
  namespace Express {
    interface Request {
      subdomainRole?: SubdomainRole;
    }
  }
}

const PRODUCTION_ALLOWLIST = [
  'molochain.com',
  'www.molochain.com',
  'admin.molochain.com',
  'app.molochain.com',
  'api.molochain.com',
  'mololink.molochain.com',
  'www.mololink.molochain.com',
];

function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase().trim();
}

function isDevelopmentHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.replit.dev') ||
    normalized.endsWith('.replit.app') ||
    normalized.endsWith('.repl.co') ||
    normalized.includes('.id.repl.co')
  );
}

function getSubdomainRole(hostname: string): SubdomainRole {
  const normalized = normalizeHostname(hostname);
  
  if (normalized.startsWith('admin.')) {
    return 'admin';
  }
  
  if (normalized.startsWith('app.')) {
    return 'app';
  }
  
  return 'public';
}

function isAllowedHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopmentHost(normalized)) {
    return true;
  }
  
  if (PRODUCTION_ALLOWLIST.includes(normalized)) {
    return true;
  }
  
  if (!isProduction) {
    return true;
  }
  
  return false;
}

export function subdomainMiddleware(req: Request, res: Response, next: NextFunction): void {
  const hostname = req.hostname || req.headers.host || 'localhost';
  const normalized = normalizeHostname(hostname);
  
  if (!isAllowedHost(normalized)) {
    logger.warn(`Rejected request from unknown host: ${normalized}`);
    res.status(421).json({
      error: 'Misdirected Request',
      message: 'This host is not allowed to access this service',
    });
    return;
  }
  
  const subdomainRole = getSubdomainRole(normalized);
  req.subdomainRole = subdomainRole;
  
  res.setHeader('x-molochain-subdomain', subdomainRole);
  
  logger.debug(`Subdomain detection: host=${normalized}, role=${subdomainRole}`);
  
  next();
}

export default subdomainMiddleware;
