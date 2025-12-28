/**
 * Validation middleware using Zod schemas
 * 
 * This middleware validates request data (body, query, params) against provided Zod schemas
 * and returns standardized error responses if validation fails.
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { logger } from '../utils/logger';

/**
 * Interface for validation options
 */
interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Middleware that validates request data against provided Zod schemas
 */
export const validateRequest = (schemas: ValidationOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema provided
      if (schemas.body) {
        try {
          const validData = await schemas.body.parseAsync(req.body);
          // Replace request body with validated data
          req.body = validData;
        } catch (error) {
          if (error instanceof z.ZodError) {
            logger.debug('Request body validation failed', {
              path: req.path,
              errors: error.errors,
            });
            
            return res.status(400).json({
              error: 'Validation error',
              message: 'Invalid request data',
              errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
              })),
            });
          }
          throw error;
        }
      }

      // Validate query parameters if schema provided
      if (schemas.query) {
        try {
          const validData = await schemas.query.parseAsync(req.query);
          // Replace request query with validated data
          req.query = validData;
        } catch (error) {
          if (error instanceof z.ZodError) {
            logger.debug('Request query validation failed', {
              path: req.path,
              errors: error.errors,
            });
            
            return res.status(400).json({
              error: 'Validation error',
              message: 'Invalid query parameters',
              errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
              })),
            });
          }
          throw error;
        }
      }

      // Validate URL parameters if schema provided
      if (schemas.params) {
        try {
          const validData = await schemas.params.parseAsync(req.params);
          // Replace request params with validated data
          req.params = validData;
        } catch (error) {
          if (error instanceof z.ZodError) {
            logger.debug('Request params validation failed', {
              path: req.path,
              errors: error.errors,
            });
            
            return res.status(400).json({
              error: 'Validation error',
              message: 'Invalid URL parameters',
              errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
              })),
            });
          }
          throw error;
        }
      }

      next();
    } catch (error) {
      logger.error('Unexpected error in validation middleware', error);
      next(error);
    }
  };
};