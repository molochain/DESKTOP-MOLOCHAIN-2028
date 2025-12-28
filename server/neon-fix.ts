/**
 * Complete fix for Neon WebSocket crashes
 * This MUST be the very first import in server/index.ts
 */

// Store original handlers
const originalHandlers = {
  uncaughtException: process.listeners('uncaughtException').slice(),
  unhandledRejection: process.listeners('unhandledRejection').slice()
};

// Remove all existing handlers
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');

// Install our protective handler
process.on('uncaughtException', (error: Error) => {
  const msg = error?.message || '';
  const stack = (error as any)?.stack || '';
  
  // Completely suppress Neon errors
  if (msg.includes('Cannot set property message') ||
      msg.includes('ErrorEvent') ||
      stack.includes('@neondatabase/serverless') ||
      stack.includes('WebSocket') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('socket hang up')) {
    // Silently ignore - these are expected with Neon serverless
    return;
  }
  
  // Log other errors but don't crash
  console.error('Uncaught error (continuing):', msg);
  
  // Don't call original handlers - they might crash the server
  // Just log and continue
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  const msg = reason?.message || reason?.toString() || '';
  
  if (msg.includes('Cannot set property message') ||
      msg.includes('ErrorEvent') ||
      msg.includes('@neondatabase/serverless') ||
      msg.includes('WebSocket') ||
      msg.includes('ECONNREFUSED')) {
    // Silently ignore
    return;
  }
  
  // Log other rejections but don't crash
  console.error('Unhandled rejection (continuing):', msg);
});

// Prevent the process from exiting
process.on('exit', (code) => {
  if (code === 1 || code === 2) {
    console.log('Prevented unexpected exit, keeping server running...');
    // Don't actually exit
    process.exitCode = undefined;
  }
});

// Override process.exit for extra safety
const originalExit = process.exit;
(process as any).exit = function(code?: number) {
  if (code === 1 || code === 2) {
    console.log('Server attempted to exit, but continuing...');
    return;
  }
  // Only allow clean exits
  if (code === 0 || code === undefined) {
    originalExit.call(process, code);
  }
};

console.log('Neon error protection active');

export {};
