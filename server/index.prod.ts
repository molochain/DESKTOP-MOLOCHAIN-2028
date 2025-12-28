// Apply complete Neon error fix FIRST before any other imports
import './neon-fix';

import { unifiedMemoryOptimizer } from './core/monitoring/unified-memory-optimizer';
import { globalErrorHandler, setupProcessErrorHandlers } from './utils/unified-error-handler';

import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { setupAuth } from './core/auth/auth.service';
import { setupPasswordReset } from './core/auth/password-reset.service';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { performanceMiddleware } from './middleware/performance';
import performanceMonitor from './utils/performance-monitor';
import { logger, stream } from './utils/logger';
import morgan from 'morgan';
import {
  SERVER_CONFIG,
  SECURITY_CONFIG,
  MONITORING_CONFIG,
  FEATURES
} from '../config';
// import { createActivityLog } from './activity-logs'; // Temporarily disabled - activity logs moved to unified system
import { initializeHealthRecommendations } from './ai/health-recommendations';
import { systemMonitor } from './utils/system-monitor';
import performanceMetricsRoutes from './routes/admin-performance-metrics';
import { createEnhancedRateLimiter, apiRateLimiter } from './middleware/enhanced-rate-limiter';
import { validateCsrfToken, csrfErrorHandler } from './middleware/enhanced-csrf';
import { systemRecovery } from './utils/system-recovery';
import { cacheWarmupService } from './utils/cache-warmup';
import { autoCacheMiddleware, cacheInterceptor } from './middleware/cache-interceptor';
import { initializePerformanceEnhancements } from './utils/performance-enhancements';

// Import the WebSocket setup function
import { setupUnifiedWebSocket, getWebSocketManager } from './core/websocket/unified-setup';
import { missionMonitor } from './utils/mission-status-monitor';
import { setupDatabase } from './scripts/complete-database-setup';
import { createServer } from 'http';


// Determine if we're in production
const isProd = process.env.NODE_ENV === 'production';

// Content Security Policy configuration - use the one from config if available
const cspOptions = SECURITY_CONFIG.helmetOptions?.contentSecurityPolicy || {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on your needs
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'", "ws:", "wss:"],
  }
};

const initializeServer = async () => {
  // Perform startup validation first
  const { StartupValidator } = await import('./utils/startup-validator');
  const isValid = await StartupValidator.performQuickHealthCheck();
  
  if (!isValid) {
    console.error('🚨 Server startup aborted due to validation failures');
    process.exit(1);
  }

  // Initialize unified error handling and memory optimization
  setupProcessErrorHandlers();

  // Increase default max listeners for all EventEmitters to prevent warnings
  process.setMaxListeners(100);
  // Set default max listeners for all EventEmitters
  const { EventEmitter } = await import('events');
  EventEmitter.defaultMaxListeners = 100;

  logger.info('Unified systems initialized');

  process.on('uncaughtException', (error: Error) => {
    // Handle non-critical exceptions more gracefully
    const message = error?.message || error?.toString() || '';
    const isNonCritical = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'Connection reset',
      'WebSocket',
      'ErrorEvent',
      'Cannot set property message'
    ].some(pattern => message.toLowerCase().includes(pattern.toLowerCase()));

    if (isNonCritical) {
      logger.debug('Non-critical exception handled:', message);
      return;
    }

    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack
    });
  });

  const app = express();
  const server = createServer(app);

  // Enable trust proxy if configured (important for proper client IP detection)  
  // Use trust proxy in Replit environment with a reasonable setting (trust the first proxy)
  app.set('trust proxy', 1);

  // Initialize WebSocket monitoring system EARLY to ensure upgrade handler is ready
  logger.info('🔌 Initializing WebSocket server early in startup...');
  const { initializeWebSocketMonitoring } = await import('./core/websocket/monitoring');
  const wsManager = initializeWebSocketMonitoring(server);
  
  // Initialize the actual WebSocket system right after monitoring
  logger.info('Initializing WebSocket system...');
  try {
    await setupUnifiedWebSocket(server);
    logger.info('✅ WebSocket system initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize WebSocket system:', error);
    throw error;
  }
  
  // Store reference for health checks (using getter function)
  (global as any).getWebSocketManager = getWebSocketManager;

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: isProd ? cspOptions : false
  }));

  // Enable compression with optimized settings
  if (SERVER_CONFIG.compression) {
    app.use(compression({
      threshold: 1024, // Compress responses larger than 1KB
      level: 6, // Balanced compression level
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Skip compression for WebSocket upgrades and small responses
        if (req.headers.upgrade === 'websocket') {
          return false;
        }
        return compression.filter(req, res);
      }
    }));
    logger.info('Response compression enabled with optimization');
  }

  // Basic middleware setup
  app.use(express.json({ limit: FEATURES.maxFileUploadSize || '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: FEATURES.maxFileUploadSize || '1mb' }));

  // Logging
  app.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', { stream }));

  // CORS configuration
  app.use(cors({
    origin: isProd
      ? SERVER_CONFIG.corsOrigins.length > 0
        ? SERVER_CONFIG.corsOrigins
        : false // Block all origins if none configured in production
      : [
          'https://molochain.com',
          'https://www.molochain.com',
          'https://api.molochain.com',
          /^https:\/\/.*\.molochain\.com$/,
          /^https:\/\/.*\.replit\.dev$/,
          /^https:\/\/.*\.replit\.app$/,
          /^https:\/\/.*\.repl\.co$/
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Cache-Control'
    ]
  }));

  // Apply enhanced rate limiting to API routes with internal request skipping
  app.use('/api/', apiRateLimiter);

  // Initialize cookie parser for handling cookies
  app.use(cookieParser());

  // Performance monitoring middleware
  app.use(performanceMiddleware);

  // Apply automatic cache middleware for common endpoints
  app.use(autoCacheMiddleware());
  logger.info('Cache interceptor middleware enabled for common endpoints');

  // Auth setup
  setupAuth(app);

  // Password reset functionality
  setupPasswordReset(app);

  // Initialize system recovery procedures
  systemRecovery.performSystemRecovery().catch(error => {
    logger.error('System recovery initialization failed:', error);
  });

  // CSRF Protection (only in production or when explicitly enabled)
  if (SECURITY_CONFIG.enforceCsrf) {
    const csrfProtection = csurf({
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',  // Changed from 'strict' for cross-subdomain SSO
        domain: isProd ? '.molochain.com' : undefined  // Share across subdomains
      }
    });

    // Apply CSRF protection to state-changing routes
    app.use('/api/auth/login', csrfProtection);
    app.use('/api/auth/register', csrfProtection);
    app.use('/api/auth/logout', csrfProtection);

    // Apply to all POST, PUT, DELETE API routes except specific endpoints
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/') &&
          ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) &&
          !req.path.includes('/api/auth/me') &&
          !req.path.includes('/api/health') &&
          !req.path.startsWith('/api/email') &&
          !req.path.startsWith('/api/quote') &&
          !req.path.startsWith('/api/contact') &&
          !req.path.startsWith('/api/platform/services/v1/webhooks')) {
        return csrfProtection(req, res, next);
      }
      next();
    });

    // Endpoint to get CSRF token
    app.get('/api/csrf-token', csrfProtection, (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });

    logger.info('CSRF protection enabled for state-changing routes');
  } else {
    logger.info('CSRF protection disabled (development mode)');
  }

  // Request logging middleware with sensitive data filtering
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    // Only capture response in development or if explicitly enabled
    if (MONITORING_CONFIG.logLevel === 'debug') {
      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };
    }

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logData: any = {
          method: req.method,
          path,
          status: res.statusCode,
          duration,
          clientIp: req.ip
        };

        // Only include filtered request body in debug mode
        if (MONITORING_CONFIG.logRequestBody && req.body) {
          // Filter out sensitive fields
          const filteredBody = { ...req.body };
          MONITORING_CONFIG.sensitiveFields.forEach(field => {
            if (filteredBody[field]) filteredBody[field] = '[FILTERED]';
          });
          logData.body = filteredBody;
        }

        // Include response for debugging
        if (capturedJsonResponse && MONITORING_CONFIG.logLevel === 'debug') {
          logData.response = capturedJsonResponse;
        }

        if (res.statusCode >= 400) {
          logger.error("API Error", logData);

          // Log authentication failures and potential security issues
          if (res.statusCode === 401 || res.statusCode === 403) {
            // Safely access user id if it exists
            const userId = (req.user && 'id' in req.user) ? (req.user as any).id : null;

            // Activity logging temporarily disabled - will be handled by unified system
            logger.warn('Security event', {
              userId: userId || 0,
              action: 'SECURITY_EVENT',
              details: {
                category: 'auth',
                event: 'authentication_failure',
                path
              },
              metadata: {
                ip: req.ip,
                userAgent: req.headers['user-agent'] as string
              }
            });
          }
        } else {
          logger.info("API Request", logData);
        }
      }
    });

    next();
  });


  // Register API routes FIRST to prevent Vite interference
  await registerRoutes(app, server);

  // Register performance monitoring routes under /api prefix
  app.use('/api', performanceMetricsRoutes);

  // Initialize AI-powered health recommendations system (disabled by default to prevent startup crashes)
  const FEATURE_AI_ENABLED = process.env.FEATURE_AI_ENABLED === 'true';
  if (FEATURE_AI_ENABLED) {
    initializeHealthRecommendations();
    logger.info('AI services enabled and initialized');
  } else {
    logger.info('AI services disabled (set FEATURE_AI_ENABLED=true to enable)');
  }

  // Start automated system monitoring and optimization
  systemMonitor.start();

  // Initialize cache warmup service
  setTimeout(async () => {
    try {
      await cacheWarmupService.initialize();
      logger.info('Cache warmup service initialized');
    } catch (error) {
      logger.warn('Cache warmup failed but server continues:', error);
    }
  }, 2000);

  // Start performance target monitoring for 100% success rates (non-blocking)
  setTimeout(async () => {
    try {
      const { performanceTargetMonitor } = await import('./utils/performance-target-monitor');
      await performanceTargetMonitor.startContinuousTargetMonitoring();
      logger.info('Performance target monitoring started');
    } catch (error) {
      logger.warn('Performance monitoring failed but server continues:', error);
    }
  }, 3000);

  // Initialize CMS sync service for automatic content synchronization
  setTimeout(async () => {
    try {
      const { cmsSyncService } = await import('./services/cms-sync.service');
      await cmsSyncService.initialize('*/5 * * * *'); // Every 5 minutes
      logger.info('CMS sync service initialized (syncing every 5 minutes)');
    } catch (error) {
      logger.warn('CMS sync service failed to initialize but server continues:', error);
    }
  }, 4000);

  // Initialize Services Platform v1 sync worker
  setTimeout(async () => {
    try {
      const { servicesSyncWorker } = await import('./platform/services/v1');
      await servicesSyncWorker.initialize('*/5 * * * *'); // Every 5 minutes
      logger.info('[Services Platform] Sync worker initialized (syncing every 5 minutes)');
    } catch (error) {
      logger.warn('[Services Platform] Sync worker failed to initialize but server continues:', error);
    }
  }, 5000);

  // Execute lightweight ecosystem integration (non-blocking) - temporarily disabled for fast startup
  logger.info('Ecosystem integration temporarily disabled for fast startup');
  setTimeout(async () => {
    logger.info('Ecosystem integration available but skipped for performance');
  }, 1000);

  // Increase event listener limit to avoid MaxListenersExceededWarning
  server.setMaxListeners(100);
  process.setMaxListeners(100);

  // Start performance monitoring with reduced frequency
  performanceMonitor.startMonitoring(180000); // Every 3 minutes to reduce CPU load

  // Production: serve static files directly (no Vite)
  const { serveStatic } = await import('./static-server');
  serveStatic(app);

  // Initialize mission monitoring
  missionMonitor.initializeMonitoring().catch(console.error);

  // Initialize database on startup
  setupDatabase().catch(console.error);

  // Initialize performance enhancements
  initializePerformanceEnhancements().catch(error => {
    logger.error('Failed to initialize performance enhancements:', error);
  });


  // Enhanced error handling with recovery system
  app.use(async (err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const errorId = Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Log the error with a reference ID
    logger.error(`Server Error [${errorId}]`, {
      errorId,
      status,
      message,
      path: req.path,
      method: req.method,
      stack: err.stack
    });

    // Trigger error recovery if this is a system-level error
    if (status >= 500) {
      try {
        const component = req.path.includes('/api/health') ? 'health' :
                         req.path.includes('/api/') ? 'api' : 'server';
        const { handleSystemError } = await import('./utils/unified-error-handler');
        await handleSystemError(err, component);
      } catch (recoveryError) {
        logger.error('Error recovery failed:', recoveryError);
      }
    }

    // In production, don't expose error details
    const publicMessage = process.env.NODE_ENV === 'production'
      ? `Something went wrong. Reference ID: ${errorId}`
      : message;

    res.status(status).json({
      message: publicMessage,
      errorId: process.env.NODE_ENV === 'production' ? errorId : undefined
    });
  });

  // 404 handler - this should only trigger for API routes now
  // since the client routing handler is registered before this
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
  });

  // Graceful shutdown
  const cleanup = (signal?: string) => {
    logger.info(`Shutting down server... (triggered by ${signal || 'unknown signal'})`);
    performanceMonitor.stopMonitoring();
    server.close(() => {
      logger.info("Server shut down gracefully");
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => {
    logger.warn('⚠️  SIGTERM signal received - external shutdown triggered');
    cleanup('SIGTERM');
  });
  process.on('SIGINT', () => {
    logger.info('SIGINT signal received - manual shutdown (Ctrl+C)');
    cleanup('SIGINT');
  });
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.stack });
    cleanup();
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
  });

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";

  // Start automatic memory cleanup
  // Unified memory optimizer is already initialized
  logger.info('Memory management enabled with automatic cleanup');

  server.listen(port, host, () => {
    logger.info(`Server started in ${process.env.NODE_ENV || 'development'} mode`, {
      port,
      host,
      nodeVersion: process.version
    });
    
    // Production validation checks
    if (process.env.NODE_ENV === 'production') {
      setTimeout(async () => {
        try {
          const { performStartupValidation } = await import('./utils/production-validator');
          await performStartupValidation();
          logger.info('Production startup validation completed successfully');
        } catch (error) {
          logger.error('Production startup validation failed:', error);
          // Trigger recovery procedures
          const { enhancedErrorRecoverySystem } = await import('./utils/enhanced-error-recovery');
          await enhancedErrorRecoverySystem.handleSystemError(error, 'startup');
        }
      }, 5000);
    }
  });

  return server;
};

initializeServer().catch(error => {
  logger.error('Server initialization failed:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });

  // Log specific guidance for common errors
  if (error.message.includes('EADDRINUSE')) {
    logger.error('Port is already in use. Try changing the port in configuration.');
  } else if (error.message.includes('Vite')) {
    logger.error('Vite error during development setup. Retrying in simplified mode...');
    // Attempt to start without Vite for emergency mode
    process.exit(1);
  } else {
    logger.error('Unknown server initialization error occurred');
  }

  process.exit(1);
});