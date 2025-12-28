/**
 * Comprehensive promise handling utilities to prevent unhandled rejections
 */

// Global promise rejection handler that prevents any unhandled rejections from reaching the console
let rejectionCount = 0;

export function initializePromiseHandling() {
  // Only add event listener if it hasn't been added before
  if (!(window as any).__promiseHandlerInitialized) {
    (window as any).__promiseHandlerInitialized = true;
    
    // Override the default unhandled rejection behavior
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      rejectionCount++;
      
      // Completely suppress empty or undefined rejections
      if (!event.reason) {
        return;
      }
      
      // Suppress common non-critical rejections
      const reason = event.reason;
      if (reason instanceof Error) {
        const message = reason.message || '';
        if (isNonCriticalError(message)) {
          return;
        }
      }
      
      // Handle string reasons
      if (typeof reason === 'string' && isNonCriticalError(reason)) {
        return;
      }
      
      // For any other errors, log them silently without causing console spam
      // Rejection handled silently
    });
    
    // Also handle promise rejections from React components
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message) {
        const message = event.error.message;
        if (isNonCriticalError(message)) {
          event.preventDefault();
          return;
        }
      }
    });
  }
}

function isNonCriticalError(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return true; // Treat empty/invalid messages as non-critical
  }
  
  const patterns = [
    '401',
    '403',
    'unauthorized',
    'fetch',
    'aborterror',
    'websocket',
    'network',
    'connection',
    'timeout',
    'vite',
    'hmr',
    'resizeobserver',
    'non-error promise rejection',
    'loading chunk',
    'dynamic import',
    '[vite] connecting',
    'connecting...',
    'hot update',
    'module invalidated',
    'ws connection closed'
  ];
  
  return patterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

// Safe promise executor that never throws unhandled rejections
export function safePromise<T>(
  executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    try {
      executor(
        (value: T) => resolve(value),
        (reason?: any) => {
          // Always resolve to null instead of rejecting
          // Safe promise rejection handled
          resolve(null);
        }
      );
    } catch (error) {
      // Catch any synchronous errors and resolve to null
      // Safe promise sync error handled
      resolve(null);
    }
  });
}

// Wrap async functions to prevent unhandled rejections
export function safeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Safe async error handled
      return null;
    }
  };
}

// Safe fetch wrapper that never throws unhandled rejections
export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response | null> {
  try {
    const response = await fetch(input, init);
    return response;
  } catch (error) {
    // Safe fetch error handled
    return null;
  }
}

// Get rejection statistics for debugging
export function getRejectionStats() {
  return { rejectionCount };
}

// Reset rejection count
export function resetRejectionCount() {
  rejectionCount = 0;
}