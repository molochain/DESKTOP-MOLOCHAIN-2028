/**
 * Application Configuration - Enhanced 2025
 * Next-generation centralized configuration for the logistics platform
 */

// Environment detection with additional checks
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isStaging = process.env.NODE_ENV === 'staging';

// Enhanced server configuration
export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || '5000', 10),
  httpsPort: parseInt(process.env.HTTPS_PORT || '8443', 10),
  host: '0.0.0.0',
  apiPrefix: '/api',
  version: '2.0.0',
  enableHttps: Boolean(process.env.ENABLE_HTTPS || !isProd),
  // All MoloChain subdomains for cross-origin SSO
  corsOrigins: isProd 
    ? (process.env.ALLOWED_ORIGINS || 'https://molochain.com,https://www.molochain.com,https://admin.molochain.com,https://app.molochain.com,https://api.molochain.com,https://auth.molochain.com,https://opt.molochain.com,https://mololink.molochain.com,https://cms.molochain.com').split(',').filter(Boolean)
    : [
        'http://localhost:3000', 
        'http://localhost:5000', 
        'https://localhost:8443',
        'https://molochain.com',
        'https://www.molochain.com',
        'https://admin.molochain.com',
        'https://app.molochain.com',
        'https://auth.molochain.com',
        'https://opt.molochain.com',
        'https://mololink.molochain.com',
        'https://cms.molochain.com'
      ],
  trustProxy: isProd || isStaging,
  compression: isProd || isStaging,
  staticMaxAge: isProd ? 31536000 : (isStaging ? 86400 : 0),
  productionOrigins: /(\.replit\.app|\.repl\.co|\.vercel\.app)$/,
  redirectToHttps: process.env.REDIRECT_TO_HTTPS === 'true' || isProd,
  maxRequestSize: '50mb',
  gracefulShutdownTimeout: 30000,
  keepAliveTimeout: 5000,
  headersTimeout: 10000,
};

// Enhanced security configuration
export const SECURITY_CONFIG = {
  sessionSecret: process.env.SESSION_SECRET || (isDev ? 'dev-secure-session-secret-' + Date.now() : ''),
  sessionCookieName: 'molochain.sid',  // Cross-subdomain session cookie
  csrfProtection: isProd || isStaging,
  enforceCsrf: isProd || isStaging,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: isProd ? 100 : (isStaging ? 300 : 1000),
    standardHeaders: isProd || isStaging,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: any) => req.ip || req.connection.remoteAddress,
  },
  apiRateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: isProd ? 60 : (isStaging ? 120 : 300),
    message: 'Too many API requests from this IP',
  },
  secureCookies: isProd || isStaging,
  passwordHashRounds: isProd ? 14 : 12,
  jwtExpiresIn: isProd ? '12h' : '24h',
  refreshTokenExpiresIn: '7d',
  contentSecurityPolicy: isProd || isStaging,
  xssProtection: true,
  sessionTtl: isProd ? 7 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000,
  // Cross-subdomain SSO requires 'none' for production
  // This allows cookies to be sent in cross-origin requests between subdomains
  sameSitePolicy: isProd ? 'none' : 'lax',
  // Cookie domain for cross-subdomain sharing
  cookieDomain: isProd ? '.molochain.com' : undefined,
  maxLoginAttempts: isProd ? 5 : (isStaging ? 10 : 100),
  maxPasswordResetAttempts: isProd ? 3 : (isStaging ? 5 : 50),
  maxRegistrationsPerDay: isProd ? 5 : (isStaging ? 10 : 100),
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  passwordMinLength: 8,
  requireStrongPasswords: isProd || isStaging,
  enableTwoFactor: isProd,
  helmetOptions: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

};

// Database configuration - Optimized for better performance and memory usage
export const DB_CONFIG = {
  url: process.env.DATABASE_URL,
  poolSize: isProd ? 20 : 5, // Increased for better concurrency
  connectionTimeout: 20000, // 20s - reasonable timeout for connection
  statementTimeout: 30000, // 30s - reasonable timeout for statements
  ssl: isProd ? { rejectUnauthorized: true } : false,
  idleTimeout: isProd ? 10000 : 30000, // 10s prod, 30s dev - balanced idle timeout
  maxRetries: 3, // Standard retry count
  retryDelay: 1000, // 1 second between retries
  logging: !isProd,
  preparedStatements: true, // Enable in both environments for performance
  queryTimeout: isProd ? 15000 : 30000, // 15s prod, 30s dev - reasonable query timeout
  // Memory optimization settings
  acquireTimeoutMillis: 10000, // 10s wait time for connections
  createTimeoutMillis: 20000, // 20s connection creation timeout
  destroyTimeoutMillis: 5000, // 5s connection destruction
  reapIntervalMillis: 10000, // Check idle connections every 10s
  createRetryIntervalMillis: 200, // Retry connection creation every 200ms
  // Additional performance settings
  maxIdleTime: 60000, // 1 minute idle time before cleanup
  evictionRunIntervalMillis: 30000, // Run eviction every 30 seconds
  numTestsPerEvictionRun: 3, // Test 3 connections per eviction run
  testOnBorrow: false, // Skip validation on borrow for speed
  testWhileIdle: true, // Test connections while idle
};

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  heartbeatInterval: isProd ? 25000 : 30000, // Increased for stability
  heartbeatTimeout: isProd ? 35000 : 45000, // Increased timeout for reliability
  reconnectInterval: 2000, // Faster reconnection
  maxReconnectAttempts: isProd ? 10 : 15, // More attempts for better resilience
  connectionThrottle: isProd ? 500 : 0, // Reduced throttling
  pingTimeoutMs: 15000, // Increased ping timeout
  maxPayloadSize: isProd ? 1024 * 50 : 1024 * 100, // Increased payload size
  perMessageDeflate: true, // Enable compression in all environments
  closeGracePeriod: 3000, // Increased grace period
  maxConnections: isProd ? 2000 : 200, // Increased connection limits
  authorizationTimeout: 8000, // Increased authorization timeout
  simulateStatusChanges: !isProd, // Simulate status changes for demo purposes in development
  // New stability improvements
  enableAutoReconnect: true,
  exponentialBackoff: true,
  maxBackoffTime: 30000, // Max 30 seconds between reconnection attempts
  jitterFactor: 0.1, // Add jitter to prevent thundering herd
  bufferMaxSize: 1000, // Buffer messages during reconnection
  connectionPooling: isProd, // Enable connection pooling in production
  
  // WebSocket path for Control Panel real-time updates
  controlPanelPath: '/ws/control-panel',
  
  // Paths for different WebSocket endpoints
  paths: {
    main: '/ws',
    notifications: '/ws/notifications',
    shipments: '/ws/shipments',
    controlPanel: '/ws/control-panel',
    metrics: '/ws/metrics'
  }
};

// Monitoring and logging
export const MONITORING_CONFIG = {
  logLevel: isProd ? 'info' : 'debug',
  enablePerformanceMetrics: isProd,
  errorTrackingEnabled: isProd,
  logRequestBody: !isProd,
  logRequestHeaders: !isProd,
  sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'creditCard'],
  healthCheck: {
    enabled: true,
    interval: isProd ? 60000 : 300000, // 1 minute in production, 5 minutes in development
    timeout: 5000, // 5 seconds timeout for health check operations
    path: '/health',
  },
  errorAlerts: {
    enabled: isProd,
    threshold: 5, // Alert after 5 errors of the same type
    timeWindow: 60000, // Within 1 minute
    cooldown: 300000, // Don't send the same alert again for 5 minutes
  },
  performanceThresholds: {
    slowQuery: isProd ? 500 : 1000, // 500ms in production, 1000ms in development
    slowRequest: isProd ? 2000 : 5000, // 2s in production, 5s in development
    memoryThreshold: 85, // Alert when memory usage exceeds 85%
    cpuThreshold: 80, // Alert when CPU usage exceeds 80%
  },
  logRotation: {
    enabled: isProd,
    maxSize: '10m', // Rotate logs when they reach 10MB
    maxFiles: 5, // Keep 5 rotated files
    compress: true, // Compress rotated logs
  }
};

// Storage configuration
export const STORAGE_CONFIG = {
  provider: process.env.STORAGE_PROVIDER || 'local',
  defaultProvider: process.env.STORAGE_PROVIDER || 'local',
  localBasePath: process.env.LOCAL_STORAGE_PATH || './uploads',
  cloudBucket: process.env.CLOUD_STORAGE_BUCKET || 'molochain-storage',
  folderStructure: {
    documents: '/documents',
    uploads: '/uploads',
    images: '/images',
    temp: '/temp'
  },
  maxFileSize: isProd ? 50 * 1024 * 1024 : 100 * 1024 * 1024, // 50MB in prod, 100MB in dev
  allowedMimeTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'application/zip'
  ],
  publicUrlPrefix: process.env.STORAGE_PUBLIC_URL || '',
  useSignedUrls: isProd,
  signedUrlExpiration: 3600, // 1 hour in seconds
  retentionDays: {
    temp: 1, // 1 day for temporary files
    documents: 90, // 90 days for documents
    default: 30 // 30 days default
  },
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || '',
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '',
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    enabled: Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID),
    maxFileSize: parseInt(process.env.GOOGLE_DRIVE_MAX_FILE_SIZE || '104857600', 10), // 100MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
};

// Enhanced feature flags with AI capabilities
export const FEATURES = {
  enableTranslationAPI: Boolean(process.env.ENABLE_TRANSLATION_API),
  enableDocumentGeneration: Boolean(process.env.ENABLE_DOCUMENT_GENERATION),
  enableAdvancedTracking: Boolean(process.env.ENABLE_ADVANCED_TRACKING || !isProd),
  enableExternalIntegrations: Boolean(process.env.ENABLE_EXTERNAL_INTEGRATIONS),
  enableAIAssistant: Boolean(process.env.ENABLE_AI_ASSISTANT),
  enableRealTimeCollaboration: Boolean(process.env.ENABLE_REAL_TIME_COLLABORATION || !isProd),
  enableAdvancedAnalytics: Boolean(process.env.ENABLE_ADVANCED_ANALYTICS),
  enableSmartRecommendations: Boolean(process.env.ENABLE_SMART_RECOMMENDATIONS),
  enableVoiceInput: Boolean(process.env.ENABLE_VOICE_INPUT),
  enableOfflineMode: Boolean(process.env.ENABLE_OFFLINE_MODE),
  enableProgressiveWebApp: Boolean(process.env.ENABLE_PWA || true),
  enableServiceWorker: Boolean(process.env.ENABLE_SERVICE_WORKER || true),
  enablePushNotifications: Boolean(process.env.ENABLE_PUSH_NOTIFICATIONS),
  enableGeolocation: Boolean(process.env.ENABLE_GEOLOCATION),
  enableBiometricAuth: Boolean(process.env.ENABLE_BIOMETRIC_AUTH),
  enableBlockchainIntegration: Boolean(process.env.ENABLE_BLOCKCHAIN),
  enableQuantumSecurity: Boolean(process.env.ENABLE_QUANTUM_SECURITY),
  enableEdgeComputing: Boolean(process.env.ENABLE_EDGE_COMPUTING),
  enableUserSessions: true,
  enableAnalytics: isProd,
  enableCaching: isProd,
  enableWebPushNotifications: Boolean(process.env.ENABLE_WEB_PUSH),
  enableEmailNotifications: Boolean(process.env.ENABLE_EMAIL_NOTIFICATIONS),
  enableSSO: isProd && Boolean(process.env.ENABLE_SSO),
  enableMFA: isProd && Boolean(process.env.ENABLE_MFA),
  enableDebugMode: !isProd || Boolean(process.env.ENABLE_DEBUG_MODE),
  maxFileUploadSize: isProd ? 10 * 1024 * 1024 : 50 * 1024 * 1024,
  maintenanceMode: Boolean(process.env.MAINTENANCE_MODE),
  allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
  enableModularArchitecture: true,
  enableMicroservices: Boolean(process.env.ENABLE_MICROSERVICES),
  enableAutoscaling: Boolean(process.env.ENABLE_AUTOSCALING),
  enableLoadBalancing: Boolean(process.env.ENABLE_LOAD_BALANCING),
  enableCDN: Boolean(process.env.ENABLE_CDN),
  enableAdvancedSecurity: isProd || isStaging,
  enableZeroTrustArchitecture: Boolean(process.env.ENABLE_ZERO_TRUST),
};

// Configuration validation and warnings
if (isProd) {
  // Required environment variables for production
  const requiredVars = [
    'DATABASE_URL', 
    'SESSION_SECRET',
    'NODE_ENV' // Ensure we're explicitly set to production
  ];
  
  // Recommended but not strictly required
  const recommendedVars = [
    'ALLOWED_ORIGINS',
    'LOG_LEVEL',
    'MAX_PAYLOAD_SIZE',
  ];
  
  // Check for missing required variables
  const missingRequired = requiredVars.filter(key => !process.env[key]);
  if (missingRequired.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missingRequired.join(', ')}`);
  }
  
  // Check for missing recommended variables
  const missingRecommended = recommendedVars.filter(key => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(`Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }
  
  // Security validation
  if (!SERVER_CONFIG.corsOrigins.length) {
    console.warn('No CORS origins configured. API will reject cross-origin requests.');
  }
  
  if (!SECURITY_CONFIG.secureCookies) {
    console.warn('Secure cookies are disabled in production! This is a security risk.');
  }
  
  if (SECURITY_CONFIG.sessionSecret === 'dev-session-secret') {
    throw new Error('Using development session secret in production! This is a severe security risk. Set SESSION_SECRET environment variable.');
  }

  if (SECURITY_CONFIG.sessionSecret.length < 16) {
    console.warn('Session secret is too short. It should be at least 16 characters long for security.');
  }
  
  // Database configuration validation
  if (!DB_CONFIG.url) {
    throw new Error('Database URL is not configured. Set DATABASE_URL environment variable.');
  }

  if (!DB_CONFIG.ssl && !process.env.DISABLE_DB_SSL) {
    console.warn('Database SSL is disabled in production! This may expose sensitive data. Consider enabling SSL for database connections.');
  }
  
  // WebSocket configuration validation
  if (WEBSOCKET_CONFIG.heartbeatInterval >= WEBSOCKET_CONFIG.heartbeatTimeout) {
    console.warn('WebSocket heartbeat interval should be less than timeout to avoid false disconnections');
  }

  if (WEBSOCKET_CONFIG.maxPayloadSize > 100 * 1024) {
    console.warn(`WebSocket payload size limit is set to ${Math.round(WEBSOCKET_CONFIG.maxPayloadSize / 1024)}KB which is high. Consider reducing it to minimize risk of DoS attacks.`);
  }
  
  // Feature flag validation
  if (FEATURES.maintenanceMode) {
    console.info('Application is running in maintenance mode - most APIs will return 503 responses');
  }

  if (FEATURES.enableDebugMode) {
    console.warn('Debug mode is enabled in production! This may expose sensitive information.');
  }

  if (!SERVER_CONFIG.compression) {
    console.warn('Response compression is disabled in production. Consider enabling it for better performance.');
  }
  
  // Log important startup configuration
  console.info(`Server starting in PRODUCTION mode on ${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
  console.info(`Rate limiting: ${SECURITY_CONFIG.rateLimit.max} requests per ${SECURITY_CONFIG.rateLimit.windowMs/60000} minutes`);
  console.info(`SSL is ${DB_CONFIG.ssl ? 'enabled' : 'disabled'} for database connections`);
  console.info(`Performance metrics and error tracking are ${MONITORING_CONFIG.enablePerformanceMetrics ? 'enabled' : 'disabled'}`);
  console.info(`Session TTL: ${SECURITY_CONFIG.sessionTtl/3600000} hours`);
} else {
  // Development-only warnings and information
  console.info(`Server starting in DEVELOPMENT mode on ${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
  
  if (SECURITY_CONFIG.sessionSecret === '') {
    console.warn('No session secret configured for development');
  }
  
  console.info('Development settings active:');
  console.info(`- Database logging: ${DB_CONFIG.logging ? 'enabled' : 'disabled'}`);
  console.info(`- Request body logging: ${MONITORING_CONFIG.logRequestBody ? 'enabled' : 'disabled'}`);
  console.info(`- CSP: ${SECURITY_CONFIG.contentSecurityPolicy ? 'enabled' : 'disabled'}`);
  console.info(`- Rate limit: ${SECURITY_CONFIG.rateLimit.max} requests per ${SECURITY_CONFIG.rateLimit.windowMs/60000} minutes`);
}