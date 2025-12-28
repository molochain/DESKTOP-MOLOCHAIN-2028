import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Health check status types
export const healthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']);
export const endpointTypeSchema = z.enum(['core', 'module', 'system', 'external']);

// Health check result schema
export const healthCheckResultSchema = z.object({
  id: z.string(),
  endpoint: z.string(),
  name: z.string(),
  type: endpointTypeSchema,
  status: healthStatusSchema,
  responseTime: z.number(),
  statusCode: z.number().optional(),
  errorMessage: z.string().optional(),
  lastChecked: z.date(),
  metadata: z.record(z.any()).optional(),
});

// System health summary schema
export const systemHealthSchema = z.object({
  overall: healthStatusSchema,
  totalEndpoints: z.number(),
  healthyEndpoints: z.number(),
  degradedEndpoints: z.number(),
  unhealthyEndpoints: z.number(),
  averageResponseTime: z.number(),
  lastUpdated: z.date(),
});

// Health check configuration schema
export const healthCheckConfigSchema = z.object({
  endpoint: z.string(),
  name: z.string(),
  type: endpointTypeSchema,
  timeout: z.number().default(5000),
  interval: z.number().default(30000),
  expectedStatus: z.number().default(200),
  retries: z.number().default(3),
  enabled: z.boolean().default(true),
});

// Alert configuration schema
export const alertConfigSchema = z.object({
  id: z.string(),
  endpoint: z.string(),
  threshold: z.number().default(3),
  cooldown: z.number().default(300000), // 5 minutes
  enabled: z.boolean().default(true),
});

// Health incident schema
export const healthIncidentSchema = z.object({
  id: z.string(),
  endpoint: z.string(),
  status: healthStatusSchema,
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  resolved: z.boolean().default(false),
  description: z.string().optional(),
});

// Type exports
export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>;
export type SystemHealth = z.infer<typeof systemHealthSchema>;
export type HealthCheckConfig = z.infer<typeof healthCheckConfigSchema>;
export type AlertConfig = z.infer<typeof alertConfigSchema>;
export type HealthIncident = z.infer<typeof healthIncidentSchema>;
export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type EndpointType = z.infer<typeof endpointTypeSchema>;

// Health check metrics for time series
export const healthMetricSchema = z.object({
  endpoint: z.string(),
  timestamp: z.date(),
  responseTime: z.number(),
  status: healthStatusSchema,
  statusCode: z.number().optional(),
});

export type HealthMetric = z.infer<typeof healthMetricSchema>;

// Real-time workspace metrics schema
export const workspaceMetricsSchema = z.object({
  timestamp: z.date(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  diskUsage: z.number(),
  networkLatency: z.number(),
  activeConnections: z.number(),
  requestsPerMinute: z.number(),
  errorRate: z.number(),
  uptime: z.number(),
});

// Widget configuration schema
export const healthWidgetConfigSchema = z.object({
  showMiniView: z.boolean().default(false),
  showDetailedMetrics: z.boolean().default(true),
  showHistoryChart: z.boolean().default(true),
  refreshInterval: z.number().default(10000), // 10 seconds
  alertThreshold: z.number().default(80), // percentage
  position: z.enum(['top-right', 'top-left', 'bottom-right', 'bottom-left']).default('top-right'),
});

// Health alert schema
export const healthAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['warning', 'error', 'info', 'success']),
  message: z.string(),
  endpoint: z.string().optional(),
  timestamp: z.date(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  resolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
});

export type WorkspaceMetrics = z.infer<typeof workspaceMetricsSchema>;
export type HealthWidgetConfig = z.infer<typeof healthWidgetConfigSchema>;
export type HealthAlert = z.infer<typeof healthAlertSchema>;