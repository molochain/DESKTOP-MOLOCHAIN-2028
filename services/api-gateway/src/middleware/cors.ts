import cors from 'cors';
import { gatewayConfig } from '../config/services.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    
    const isAllowed = gatewayConfig.corsOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.slice(2);
        return origin.endsWith(domain) || origin.endsWith(`.${domain}`);
      }
      return origin === allowed || origin === allowed.replace(/\/$/, '');
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-API-Secret',
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400
});
