export interface ServiceConfig {
  name: string;
  target: string;
  pathPrefix: string;
  wsEnabled: boolean;
  wsPath?: string;
  healthCheck?: string;
  rateLimit?: {
    points: number;
    duration: number;
  };
  authentication?: 'none' | 'jwt' | 'apikey' | 'both';
}

export const services: ServiceConfig[] = [
  {
    name: 'molochain-core',
    target: process.env.MOLOCHAIN_CORE_URL || 'http://127.0.0.1:5000',
    pathPrefix: '/api/v1',
    wsEnabled: true,
    wsPath: '/ws',
    healthCheck: '/api/health',
    rateLimit: { points: 1000, duration: 3600 },
    authentication: 'both'
  },
  {
    name: 'molochain-core-v2',
    target: process.env.MOLOCHAIN_CORE_URL || 'http://127.0.0.1:5000',
    pathPrefix: '/api/v2',
    wsEnabled: true,
    wsPath: '/ws/v2',
    healthCheck: '/api/health',
    rateLimit: { points: 1500, duration: 3600 },
    authentication: 'both'
  },
  {
    name: 'mololink',
    target: process.env.MOLOLINK_URL || 'http://mololink-app:5001',
    pathPrefix: '/api/mololink',
    wsEnabled: true,
    wsPath: '/ws/mololink',
    healthCheck: '/health',
    rateLimit: { points: 500, duration: 3600 },
    authentication: 'jwt'
  },
  {
    name: 'rayanava-gateway',
    target: process.env.RAYANAVA_GATEWAY_URL || 'http://rayanava-gateway:5001',
    pathPrefix: '/api/rayanava',
    wsEnabled: true,
    wsPath: '/ws/rayanava',
    healthCheck: '/health',
    rateLimit: { points: 200, duration: 3600 },
    authentication: 'apikey'
  },
  {
    name: 'rayanava-ai',
    target: process.env.RAYANAVA_AI_URL || 'http://rayanava-ai-agents:5002',
    pathPrefix: '/api/ai',
    wsEnabled: true,
    wsPath: '/ws/ai',
    healthCheck: '/health',
    rateLimit: { points: 100, duration: 3600 },
    authentication: 'apikey'
  },
  {
    name: 'communications-hub',
    target: process.env.COMMS_HUB_URL || 'http://molochain-communications-hub:7020',
    pathPrefix: '/api/comms',
    wsEnabled: false,
    healthCheck: '/api/health',
    rateLimit: { points: 500, duration: 3600 },
    authentication: 'jwt'
  },
  {
    name: 'rayanava-workflows',
    target: process.env.RAYANAVA_WORKFLOWS_URL || 'http://rayanava-workflows:5004',
    pathPrefix: '/api/workflows',
    wsEnabled: true,
    wsPath: '/ws/workflows',
    healthCheck: '/health',
    rateLimit: { points: 200, duration: 3600 },
    authentication: 'apikey'
  },
  {
    name: 'rayanava-voice',
    target: process.env.RAYANAVA_VOICE_URL || 'http://rayanava-voice:5005',
    pathPrefix: '/api/voice',
    wsEnabled: true,
    wsPath: '/ws/voice',
    healthCheck: '/health',
    rateLimit: { points: 50, duration: 3600 },
    authentication: 'apikey'
  },
  {
    name: 'rayanava-notifications',
    target: process.env.RAYANAVA_NOTIFICATIONS_URL || 'http://rayanava-notifications:5006',
    pathPrefix: '/api/notifications',
    wsEnabled: true,
    wsPath: '/ws/notifications',
    healthCheck: '/health',
    rateLimit: { points: 300, duration: 3600 },
    authentication: 'jwt'
  },
  {
    name: 'rayanava-monitoring',
    target: process.env.RAYANAVA_MONITORING_URL || 'http://rayanava-monitoring:5007',
    pathPrefix: '/api/monitoring',
    wsEnabled: true,
    wsPath: '/ws/monitoring',
    healthCheck: '/health',
    rateLimit: { points: 500, duration: 3600 },
    authentication: 'jwt'
  }
];

export const gatewayConfig = {
  port: parseInt(process.env.GATEWAY_PORT || '4000', 10),
  host: process.env.GATEWAY_HOST || '0.0.0.0',
  corsOrigins: (process.env.CORS_ORIGINS || 'https://molochain.com,https://admin.molochain.com,https://app.molochain.com,https://auth.molochain.com,https://mololink.molochain.com,https://brain.molochain.com,https://rayanava.molochain.com').split(','),
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || '',
  apiKeyPrefix: 'mk_live_',
  jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://rayanava-jaeger:4318/v1/traces',
  prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
  logLevel: process.env.LOG_LEVEL || 'info'
};
