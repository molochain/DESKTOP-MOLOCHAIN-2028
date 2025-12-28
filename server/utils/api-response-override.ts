import { Response } from 'express';

/**
 * Utility to force JSON responses for API endpoints in development
 * This helps bypass Vite's HTML serving behavior
 */
export function forceJsonResponse(res: Response, data: any, statusCode: number = 200) {
  // Clear any existing headers that might cause HTML serving
  res.removeHeader('Content-Type');
  res.removeHeader('Content-Length');
  
  // Set explicit JSON headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Allow caching for GET requests
  // res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Send JSON response
  res.status(statusCode);
  res.end(JSON.stringify(data, null, 2));
  
  return res;
}

/**
 * Create a JSON response that cannot be intercepted
 */
export function createSecureApiResponse(data: any, statusCode: number = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      // 'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-API-Response': 'secure'
    },
    body: JSON.stringify(data, null, 2)
  };
}