/**
 * Enhanced error boundary handler for React components and async operations
 */

class ErrorBoundaryHandler {
  private static instance: ErrorBoundaryHandler;
  private errorCallbacks: Set<(error: Error) => void> = new Set();

  static getInstance(): ErrorBoundaryHandler {
    if (!ErrorBoundaryHandler.instance) {
      ErrorBoundaryHandler.instance = new ErrorBoundaryHandler();
    }
    return ErrorBoundaryHandler.instance;
  }

  private constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason || 'Unknown error'));
      
      // Filter out non-critical errors
      if (this.isNonCriticalError(error)) {
        return;
      }

      // Handle the error silently
      this.handleError(error);
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      event.preventDefault();
      
      if (event.error && !this.isNonCriticalError(event.error)) {
        this.handleError(event.error);
      }
    });
  }

  private isNonCriticalError(error: Error): boolean {
    const message = error.message?.toLowerCase() || '';
    const nonCriticalPatterns = [
      'network error',
      'fetch failed',
      'not authenticated',
      'unauthorized',
      'authentication',
      'loading chunk',
      'script error',
      'cors',
      'websocket',
      'connection'
    ];

    return nonCriticalPatterns.some(pattern => message.includes(pattern));
  }

  private handleError(error: Error) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.debug('Non-critical error handled:', error.message);
    }

    // Notify callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        // Prevent callback errors from propagating
      }
    });
  }

  public onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  public wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.handleError(err);
        throw err;
      }
    }) as T;
  }

  public async safeExecute<T>(
    promise: Promise<T>,
    fallback?: T,
    onError?: (error: Error) => void
  ): Promise<T | undefined> {
    try {
      return await promise;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (onError) {
        onError(err);
      } else {
        this.handleError(err);
      }
      
      return fallback;
    }
  }
}

export const errorBoundaryHandler = ErrorBoundaryHandler.getInstance();

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: Error) => {
    errorBoundaryHandler['handleError'](error);
  };

  const safeAsync = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
    return errorBoundaryHandler.wrapAsync(fn);
  };

  const safeExecute = <T>(
    promise: Promise<T>,
    fallback?: T,
    onError?: (error: Error) => void
  ) => {
    return errorBoundaryHandler.safeExecute(promise, fallback, onError);
  };

  return {
    handleError,
    safeAsync,
    safeExecute
  };
}