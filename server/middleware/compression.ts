import compression from 'compression';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// Configure compression middleware with optimized settings
export const compressionMiddleware = compression({
  // Enable compression for responses larger than 1kb
  threshold: 1024,
  
  // Set compression level (1-9, higher = better compression but slower)
  level: 6,
  
  // Enable brotli compression when supported
  filter: (req: Request, res: Response) => {
    // Don't compress for specific routes
    if (req.path.startsWith('/ws/')) {
      return false;
    }
    
    // Don't compress already compressed content
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // Use compression for text-based responses
    const contentType = res.getHeader('Content-Type') as string;
    if (contentType) {
      const compressibleTypes = [
        'text/', 'application/json', 'application/javascript',
        'application/xml', 'application/xhtml+xml', 'application/rss+xml',
        'application/atom+xml', 'image/svg+xml', 'application/x-font-ttf'
      ];
      
      return compressibleTypes.some(type => contentType.includes(type));
    }
    
    // Default to compression
    return compression.filter(req, res);
  },
  
  // Memory level (1-9, higher = more memory but faster)
  memLevel: 8,
  
  // Strategy for compression algorithm
  strategy: 0, // Default strategy
  
  // Window bits for compression
  windowBits: 15,
  
  // Chunk size for compression
  chunkSize: 16 * 1024
});

// Middleware to track compression effectiveness
export function compressionMonitor(req: Request, res: Response, next: Function) {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const uncompressedSize = Buffer.byteLength(data);
    
    // Log compression ratio for large responses
    if (uncompressedSize > 10240) { // 10KB
      const encoding = res.getHeader('Content-Encoding');
      if (encoding) {
        logger.debug(`Compression applied (${encoding}): ${req.path}`, {
          originalSize: uncompressedSize,
          encoding
        });
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Response time header middleware
export function responseTimeMiddleware(req: Request, res: Response, next: Function) {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const responseTime = Number(end - start) / 1000000; // Convert to milliseconds
    
    res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    
    // Log slow responses
    if (responseTime > 1000) {
      logger.warn(`Slow response detected: ${req.method} ${req.path} - ${responseTime.toFixed(2)}ms`);
    }
  });
  
  next();
}

// ETag middleware for better caching
export function etagMiddleware(req: Request, res: Response, next: Function) {
  // Skip for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  
  const originalSend = res.send;
  const originalJson = res.json;
  
  const generateETag = (data: any): string => {
    // crypto already imported at the top
    const hash = crypto.createHash('md5');
    hash.update(typeof data === 'string' ? data : JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  };
  
  res.send = function(data: any) {
    if (!res.getHeader('ETag')) {
      const etag = generateETag(data);
      res.setHeader('ETag', etag);
      
      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304).end();
        return res;
      }
    }
    
    return originalSend.call(this, data);
  };
  
  res.json = function(data: any) {
    if (!res.getHeader('ETag')) {
      const etag = generateETag(data);
      res.setHeader('ETag', etag);
      
      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304).end();
        return res;
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}