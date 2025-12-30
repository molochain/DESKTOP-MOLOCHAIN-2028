import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { gatewayConfig } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('auth');

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    permissions?: string[];
  };
  apiKey?: {
    id: number;
    name: string;
    scopes: string[];
  };
  authMethod?: 'jwt' | 'apikey' | 'none';
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function validateJWT(token: string): Promise<AuthenticatedRequest['user'] | null> {
  try {
    if (!gatewayConfig.jwtSecret) {
      logger.warn('JWT_SECRET not configured');
      return null;
    }
    
    const decoded = jwt.verify(token, gatewayConfig.jwtSecret) as any;
    return {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };
  } catch (error) {
    logger.debug('JWT validation failed', { error: (error as Error).message });
    return null;
  }
}

export async function validateApiKey(key: string, secret: string): Promise<AuthenticatedRequest['apiKey'] | null> {
  try {
    if (!key.startsWith(gatewayConfig.apiKeyPrefix)) {
      logger.debug('API key prefix mismatch', { expected: gatewayConfig.apiKeyPrefix });
      return null;
    }
    
    const keyHash = hashKey(key);
    const secretHash = hashKey(secret);
    
    const molochainCoreUrl = process.env.MOLOCHAIN_CORE_URL || 'http://127.0.0.1:5000';
    
    try {
      const response = await fetch(`${molochainCoreUrl}/api/internal/validate-api-key`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Internal-Gateway': 'true'
        },
        body: JSON.stringify({ keyHash, secretHash }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json() as { valid: boolean; id?: number; name?: string; scopes?: string[] };
        if (data.valid) {
          logger.debug('API key validated via core service', { keyPrefix: key.substring(0, 12) });
          return {
            id: data.id || 0,
            name: data.name || 'unknown',
            scopes: data.scopes || ['read']
          };
        }
      }
    } catch (fetchError) {
      logger.warn('API key validation via core failed, falling back to hash check', { 
        error: (fetchError as Error).message 
      });
    }
    
    if (process.env.NODE_ENV !== 'production' && key && secret) {
      logger.warn('DEV MODE: API key accepted without validation');
      return {
        id: 0,
        name: 'dev-key',
        scopes: ['read', 'write']
      };
    }
    
    logger.debug('API key validation failed', { keyPrefix: key.substring(0, 12) });
    return null;
  } catch (error) {
    logger.error('API key validation error', { error: (error as Error).message });
    return null;
  }
}

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isInCIDR(ip: string, cidr: string): boolean {
  const [network, prefixLen] = cidr.split('/');
  const prefix = parseInt(prefixLen, 10);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);
  return (ipNum & mask) === (networkNum & mask);
}

function isRFC1918(ip: string): boolean {
  const cleanIp = ip.replace(/^::ffff:/, '');
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(cleanIp)) {
    return cleanIp === '::1' || cleanIp === 'localhost';
  }
  return (
    isInCIDR(cleanIp, '10.0.0.0/8') ||
    isInCIDR(cleanIp, '172.16.0.0/12') ||
    isInCIDR(cleanIp, '192.168.0.0/16') ||
    cleanIp === '127.0.0.1'
  );
}

function isInternalNetwork(ip: string | undefined, socketRemoteAddress?: string): boolean {
  if (!ip) return false;
  const cleanIp = ip.replace(/^::ffff:/, '');
  if (!isRFC1918(cleanIp)) {
    return false;
  }
  if (socketRemoteAddress) {
    const cleanSocket = socketRemoteAddress.replace(/^::ffff:/, '');
    return isRFC1918(cleanSocket);
  }
  return true;
}

export function authMiddleware(required: 'none' | 'jwt' | 'apikey' | 'both' = 'both') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (required === 'none') {
      req.authMethod = 'none';
      return next();
    }
    
    if (req.path === '/metrics' && isInternalNetwork(req.ip, req.socket?.remoteAddress)) {
      req.authMethod = 'none';
      return next();
    }
    
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      
      if (token.includes(':')) {
        const [key, secret] = token.split(':');
        const apiKeyData = await validateApiKey(key, secret);
        if (apiKeyData) {
          req.apiKey = apiKeyData;
          req.authMethod = 'apikey';
          return next();
        }
      } else {
        const user = await validateJWT(token);
        if (user) {
          req.user = user;
          req.authMethod = 'jwt';
          return next();
        }
      }
    }
    
    if (apiKey && apiSecret) {
      const apiKeyData = await validateApiKey(apiKey, apiSecret);
      if (apiKeyData) {
        req.apiKey = apiKeyData;
        req.authMethod = 'apikey';
        return next();
      }
    }
    
    logger.warn('Authentication failed', {
      path: req.path,
      ip: req.ip,
      hasAuthHeader: !!authHeader,
      hasApiKey: !!apiKey
    });
    
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid authentication required'
    });
  };
}

export function requireScope(...scopes: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.apiKey) {
      const hasScope = scopes.some(scope => 
        req.apiKey!.scopes.includes(scope) || req.apiKey!.scopes.includes('*')
      );
      
      if (!hasScope) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Required scope: ${scopes.join(' or ')}`
        });
      }
    }
    
    next();
  };
}
