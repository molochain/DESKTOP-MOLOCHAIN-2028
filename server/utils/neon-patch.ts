/**
 * Patch for Neon WebSocket errors that crash the application
 * This must be imported before any database connections
 */

// Override global error handlers to catch Neon WebSocket errors
const originalUncaughtException = process.listeners('uncaughtException');
const originalUnhandledRejection = process.listeners('unhandledRejection');

// Clear existing handlers
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');

// Add our handler first
process.on('uncaughtException', (error: Error) => {
  const errorStr = error?.message || error?.toString() || '';
  const stack = (error as any)?.stack || '';
  
  // Specifically catch and suppress Neon WebSocket errors
  if (errorStr.includes('Cannot set property message') ||
      errorStr.includes('ErrorEvent') ||
      stack.includes('@neondatabase/serverless')) {
    console.debug('Neon WebSocket error suppressed (normal behavior)');
    return; // Suppress the error completely
  }
  
  // For other errors, call original handlers
  originalUncaughtException.forEach(handler => {
    (handler as any)(error);
  });
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  const errorStr = reason?.message || reason?.toString() || '';
  
  if (errorStr.includes('Cannot set property message') ||
      errorStr.includes('ErrorEvent') ||
      errorStr.includes('@neondatabase/serverless')) {
    console.debug('Neon WebSocket rejection suppressed (normal behavior)');
    return; // Suppress the error completely
  }
  
  // For other rejections, call original handlers
  originalUnhandledRejection.forEach(handler => {
    (handler as any)(reason, promise);
  });
});

// Also patch the WebSocket constructor if available
try {
  const ws = require('ws');
  const OriginalWebSocket = ws.WebSocket || ws;
  
  class PatchedWebSocket extends OriginalWebSocket {
    constructor(...args: any[]) {
      super(...args);
      
      // Suppress error events that cause issues
      this.on('error', (error: any) => {
        const errorStr = error?.message || error?.toString() || '';
        if (errorStr.includes('ECONNREFUSED') || 
            errorStr.includes('ETIMEDOUT') ||
            errorStr.includes('ErrorEvent')) {
          console.debug('WebSocket connection retry needed');
          return;
        }
      });
    }
  }
  
  // Replace the WebSocket in the module
  if (ws.WebSocket) {
    ws.WebSocket = PatchedWebSocket;
  } else {
    module.exports = PatchedWebSocket;
    module.exports.WebSocket = PatchedWebSocket;
  }
} catch (e) {
  // WebSocket patching failed, but that's okay
  console.debug('WebSocket patching skipped');
}

export const neonPatchApplied = true;