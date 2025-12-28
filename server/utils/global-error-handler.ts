/**
 * Global Error Handler for MoloChain Platform
 * Handles unhandled promise rejections and uncaught exceptions
 */

import { logger } from './logger';

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;

  private constructor() {
    this.setupUnhandledRejectionHandler();
    this.setupUncaughtExceptionHandler();
    this.setupProcessErrorHandlers();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupUnhandledRejectionHandler(): void {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Promise Rejection:', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString()
      });

      // Don't exit the process in development, just log
      if (process.env.NODE_ENV === 'production') {
        // In production, we might want to exit gracefully
        logger.error('Shutting down due to unhandled promise rejection');
        process.exit(1);
      }
    });
  }

  private setupUncaughtExceptionHandler(): void {
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Exit the process for uncaught exceptions
      process.exit(1);
    });
  }

  private setupProcessErrorHandlers(): void {
    // Signal handlers removed - now handled centrally in server/index.ts to avoid conflicts
    // This prevents multiple signal handlers from competing and causing unexpected shutdowns
  }

  /**
   * Wrap async functions to handle errors gracefully
   */
  public static wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return ((...args: any[]) => {
      const result = fn(...args);
      if (result && typeof result.catch === 'function') {
        result.catch((error: Error) => {
          logger.error('Async function error:', {
            message: error.message,
            stack: error.stack,
            functionName: fn.name
          });
        });
      }
      return result;
    }) as T;
  }

  /**
   * Safe async execution with error handling
   */
  public static async safeAsync<T>(
    asyncFn: () => Promise<T>,
    fallback?: T,
    context?: string
  ): Promise<T | undefined> {
    try {
      return await asyncFn();
    } catch (error) {
      logger.error(`Safe async execution failed ${context ? `(${context})` : ''}:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return fallback;
    }
  }
}

// Initialize global error handler
export const globalErrorHandler = GlobalErrorHandler.getInstance();