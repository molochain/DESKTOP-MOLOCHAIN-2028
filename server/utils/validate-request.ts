import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from './logger';
import { ValidationError } from './unified-error-handler';

/**
 * Middleware factory for validating request data against a Zod schema
 */
export function validateRequest(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.debug('Request validation failed', { errors: error.errors });
        return res.status(400).json({
          error: 'Validation failed',
          errors: error.errors
        });
      }
      
      // If it's not a ZodError, pass to the generic error handler
      next(error);
    }
  };
}

/**
 * Function to validate a payload against a Zod schema
 * For use in non-middleware contexts like WebSocket message handling
 */
export function validatePayload<T>(schema: AnyZodObject, payload: unknown): T {
  try {
    return schema.parse(payload) as T;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Payload validation failed', error.errors);
    }
    throw error;
  }
}