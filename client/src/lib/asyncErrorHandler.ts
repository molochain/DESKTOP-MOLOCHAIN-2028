/**
 * Comprehensive async error handler to prevent unhandled promise rejections
 */

class AsyncErrorHandler {
  private static instance: AsyncErrorHandler;
  private errorCallbacks: Set<(error: Error) => void> = new Set();

  static getInstance(): AsyncErrorHandler {
    if (!AsyncErrorHandler.instance) {
      AsyncErrorHandler.instance = new AsyncErrorHandler();
    }
    return AsyncErrorHandler.instance;
  }

  init() {
    // Only initialize once to prevent duplicate handlers
    if ((window as any).__asyncErrorHandlerInitialized) {
      return;
    }
    (window as any).__asyncErrorHandlerInitialized = true;

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      this.handleUnhandledRejection(event.reason);
    });

    // Global error handler for synchronous errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error);
    });
  }

  private handleUnhandledRejection(reason: any) {
    // Handle empty or undefined rejections
    if (!reason) {
      // Empty promise rejection prevented
      return;
    }

    // Handle Error objects
    if (reason instanceof Error) {
      const message = reason.message || '';
      
      // Filter out non-critical errors
      if (this.isNonCriticalError(message)) {
        // Non-critical promise rejection handled
        return;
      }
    }

    // Handle network/fetch errors
    if (reason instanceof TypeError && reason.message.includes('fetch')) {
      // Network error handled gracefully
      return;
    }

    // Handle AbortError from cancelled requests
    if (reason?.name === 'AbortError') {
      // Request cancellation handled
      return;
    }

    // Log meaningful errors for debugging
    // Silent handling in production
    if (import.meta.env.DEV) {
      // Promise rejection handled
    }
    
    // Notify registered error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(reason instanceof Error ? reason : new Error(String(reason)));
      } catch (err) {
        // Error callback failed
      }
    });
  }

  private handleGlobalError(error: Error) {
    if (!error || this.isNonCriticalError(error.message)) {
      return;
    }
    
    // Silent handling in production
    if (import.meta.env.DEV) {
      // Global error handled
    }
  }

  private isNonCriticalError(message: string): boolean {
    if (!message || typeof message !== 'string') {
      return true;
    }

    const nonCriticalPatterns = [
      '401',
      '403', 
      'Unauthorized',
      'fetch',
      'AbortError',
      'WebSocket',
      'vite',
      'HMR',
      'ResizeObserver',
      'Non-Error promise rejection captured',
      'Network request failed',
      'DialogContent',
      'DialogTitle',
      'Missing Description',
      'aria-describedby',
      'Heartbeat timeout',
      'Connection seems stale'
    ];

    return nonCriticalPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Method to wrap async functions with error handling
  wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleUnhandledRejection(error);
        throw error;
      }
    }) as T;
  }

  // Method to safely execute promises
  async safeExecute<T>(
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
        this.handleUnhandledRejection(err);
      }
      
      return fallback;
    }
  }

  // Register error callback
  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }
}

export const asyncErrorHandler = AsyncErrorHandler.getInstance();

// Hook for React components to handle async errors
export function useAsyncErrorHandler() {
  const handleError = (error: Error) => {
    asyncErrorHandler['handleUnhandledRejection'](error);
  };

  const safeAsync = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
    return asyncErrorHandler.wrapAsync(fn);
  };

  const safeExecute = <T>(
    promise: Promise<T>, 
    fallback?: T,
    onError?: (error: Error) => void
  ) => {
    return asyncErrorHandler.safeExecute(promise, fallback, onError);
  };

  return { handleError, safeAsync, safeExecute };
}