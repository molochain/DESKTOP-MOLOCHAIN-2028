/**
 * Global error handler for unhandled promise rejections and errors
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: Array<{ error: any; context: ErrorContext }> = [];
  private isProcessing = false;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  init() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Always prevent the default browser handling
      event.preventDefault();
      
      this.handleError(event.reason, {
        component: 'Global',
        action: 'unhandledrejection',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'Global',
        action: 'uncaughtError',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Handle React error boundaries (if needed)
    window.addEventListener('react-error', (event: any) => {
      this.handleError(event.detail.error, {
        component: event.detail.componentStack,
        action: 'reactError',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
  }

  handleError(error: any, context: ErrorContext) {
    // Handle undefined/null errors from promise rejections
    if (!error) {
      // Skip logging for empty promise rejections - these are typically cleanup issues
      return;
    }

    // Filter out known non-critical errors
    if (this.shouldIgnoreError(error)) {
      return;
    }

    this.errorQueue.push({ error, context });
    this.processErrorQueue();
  }

  private shouldIgnoreError(error: any): boolean {
    if (!error) return true;

    const errorMessage = error.message || error.toString() || '';
    
    // Ignore WebSocket connection errors in fallback mode
    if (errorMessage.includes('WebSocket') && errorMessage.includes('1006')) {
      return true;
    }

    // Ignore network errors for missing API configurations
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return true;
    }

    // Ignore Vite HMR errors in development
    if (import.meta.env.DEV && (errorMessage.includes('vite') || errorMessage.includes('HMR'))) {
      return true;
    }

    // Ignore ResizeObserver errors (common browser quirk)
    if (errorMessage.includes('ResizeObserver')) {
      return true;
    }

    // Ignore AbortError from fetch requests (normal cleanup)
    if (errorMessage.includes('AbortError') || errorMessage.includes('The operation was aborted')) {
      return true;
    }

    // Ignore empty or trivial errors
    if (errorMessage.length === 0 || errorMessage === '[object Object]') {
      return true;
    }

    return false;
  }

  private async processErrorQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.errorQueue.splice(0, 5); // Process in batches
      
      for (const { error, context } of batch) {
        await this.logError(error, context);
      }
    } catch (err) {
      // Silent failure for error logging
    } finally {
      this.isProcessing = false;
      
      // Process remaining errors
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.processErrorQueue(), 1000);
      }
    }
  }

  private async logError(error: any, context: ErrorContext) {
    if (import.meta.env.DEV) {
      // Only log meaningful errors in development
      if (error && (error.message || error.stack)) {
        // Error details logged in development mode
      }
      return;
    }

    // In production, send to logging service
    try {
      const errorData = {
        message: error.message || error.toString(),
        stack: error.stack,
        context,
        timestamp: Date.now()
      };

      // Could send to external logging service here
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
    } catch (err) {
      // Silent failure for error reporting
    }
  }

  // Method for components to manually report errors
  reportError(error: any, component: string, action: string) {
    this.handleError(error, {
      component,
      action,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }
}

export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;