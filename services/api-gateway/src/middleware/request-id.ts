import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  requestId: string;
  correlationId: string;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.correlationId = (req.headers['x-correlation-id'] as string) || req.requestId;
  
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  next();
}
