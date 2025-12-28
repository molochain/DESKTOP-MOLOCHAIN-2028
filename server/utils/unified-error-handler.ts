/**
 * Unified Error Handling System
 * Replaces all duplicate error handlers with a single, standardized approach
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: any;
}

export class APIError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

// Global error handler middleware
export function globalErrorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details
  logger.error('Global error handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode: error.statusCode
  });

  // Send error response
  const statusCode = error.statusCode || 500;
  const response = {
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.details })
    }
  };

  res.status(statusCode).json(response);
}

// Simplified error recovery for critical issues
export async function handleSystemError(error: Error, component: string): Promise<void> {
  logger.error(`System error in ${component}:`, {
    message: error.message,
    stack: error.stack,
    component
  });

  // Simple recovery: just log and continue
  // Complex recovery logic was causing more issues than it solved
}

// Process error handlers
export function setupProcessErrorHandlers(): void {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason?.message || reason,
      promise: promise.toString()
    });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack
    });
    
    // In production, we might want to exit gracefully
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}