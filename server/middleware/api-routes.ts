import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure API routes return JSON
 * and are not intercepted by Vite development server
 */
export function ensureApiJsonResponse(req: Request, res: Response, next: NextFunction) {
  // Only apply to API routes
  if (req.path.startsWith('/api/')) {
    // Force JSON content type
    res.setHeader('Content-Type', 'application/json');
    
    // Prevent caching for API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Add API response identifier
    res.setHeader('X-API-Response', 'true');
  }
  
  next();
}

/**
 * Middleware to handle API route prefixes
 */
export function apiRouteHandler(req: Request, res: Response, next: NextFunction) {
  // Mark request as API route
  (req as any).isApiRoute = req.path.startsWith('/api/');
  next();
}