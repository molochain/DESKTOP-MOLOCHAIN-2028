import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

/**
 * Operations Monitoring Tool
 * 
 * Comprehensive business operations monitoring with metrics tracking,
 * performance analysis, automated alerts, and operational intelligence
 * based on Rayanava's advanced metrics and monitoring capabilities.
 */

// Metric categories for operations monitoring
const MetricCategory = z.enum([
  'sales', 'marketing', 'customer-service', 'operations', 
  'finance', 'product', 'hr', 'technology'
]);

const AlertType = z.enum([
  'critical', 'warning', 'info', 'success'
]);

const TimePeriod = z.enum([
  'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
]);

const MetricType = z.enum([
  'counter', 'gauge', 'rate', 'percentage', 'currency', 'duration'
]);

export const operationsMonitoringTool = createTool({
  id: "operations-monitor",
  description: `Monitor business operations with comprehensive metrics tracking, performance analysis, and automated alerting. Tracks KPIs across sales, marketing, customer service, operations, finance, and technology domains with intelligent anomaly detection and actionable insights.`,
  inputSchema: z.object({
    // Monitoring Configuration
    monitoringScope: z.array(MetricCategory).describe("Areas of business to monitor"),
    timePeriod: TimePeriod.describe("Time period for metrics analysis"),
    includeHistorical: z.boolean().default(true).describe("Include historical trend analysis"),
    
    // Metrics Input (can be real-time data or historical)
    metrics: z.array(z.object({
      id: z.string().describe("Unique metric identifier"),
      name: z.string().describe("Human-readable metric name"),
      category: MetricCategory.describe("Business category for the metric"),
      type: MetricType.describe("Type of metric measurement"),
      value: z.number().describe("Current metric value"),
      target: z.number().optional().describe("Target or goal value"),
      previousValue: z.number().optional().describe("Previous period value for comparison"),
      unit: z.string().optional().describe("Unit of measurement (%, $, count, etc.)"),
      description: z.string().optional().describe("Metric description and context")
    })).describe("Array of business metrics to monitor"),
    
    // Alert Configuration
    alertThresholds: z.object({
      critical: z.number().default(0.2).describe("Critical alert threshold (20% deviation)"),
      warning: z.number().default(0.1).describe("Warning alert threshold (10% deviation)"),
      enableTrendAlerts: z.boolean().default(true).describe("Enable trend-based alerts"),
      minimumDataPoints: z.number().default(3).describe("Minimum data points for trend analysis")
    }).optional(),
    
    // Analysis Options
    analysisOptions: z.object({
      anomalyDetection: z.boolean().default(true).describe("Enable anomaly detection"),
      trendAnalysis: z.boolean().default(true).describe("Enable trend analysis"),
      correlationAnalysis: z.boolean().default(false).describe("Enable cross-metric correlation"),
      predictiveInsights: z.boolean().default(true).describe("Enable predictive insights"),
      benchmarkComparison: z.boolean().default(false).describe("Compare against industry benchmarks")
    }).optional()
  }),
  outputSchema: z.object({
    monitoringId: z.string(),
    timestamp: z.string(),
    overallHealthScore: z.number(),
    
    // Metrics Analysis
    metricsAnalysis: z.array(z.object({
      metricId: z.string(),
      name: z.string(),
      category: z.string(),
      currentValue: z.number(),
      previousValue: z.number().optional(),
      targetValue: z.number().optional(),
      percentageChange: z.number().optional(),
      trend: z.enum(['improving', 'declining', 'stable', 'volatile']),
      healthStatus: z.enum(['healthy', 'warning', 'critical', 'unknown']),
      unit: z.string().optional()
    })),
    
    // Alerts and Issues
    alerts: z.array(z.object({
      id: z.string(),
      type: AlertType,
      title: z.string(),
      message: z.string(),
      metricId: z.string(),
      severity: z.number(),
      actionRequired: z.boolean(),
      suggestedActions: z.array(z.string()),
      timestamp: z.string()
    })),
    
    // Insights and Recommendations
    insights: z.array(z.object({
      category: z.string(),
      insight: z.string(),
      confidence: z.number(),
      impactLevel: z.enum(['high', 'medium', 'low']),
      recommendedActions: z.array(z.string())
    })),
    
    // Performance Summary
    performanceSummary: z.object({
      metricsOnTarget: z.number(),
      metricsImproving: z.number(),
      metricsDeclining: z.number(),
      criticalIssues: z.number(),
      warningIssues: z.number(),
      overallTrend: z.enum(['positive', 'negative', 'stable', 'mixed'])
    }),
    
    // Automated Actions
    automatedActions: z.array(z.object({
      action: z.string(),
      trigger: z.string(),
      scheduled: z.boolean(),
      executionTime: z.string().optional()
    })),
    
    // Next Monitoring Schedule
    nextMonitoring: z.object({
      scheduledTime: z.string(),
      monitoringType: z.string(),
      focusAreas: z.array(z.string())
    })
  }),
  execute: async (context, { mastra } = {}) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [OperationsMonitor] Starting operations monitoring analysis', { 
      scope: context.monitoringScope,
      timePeriod: context.timePeriod,
      metricsCount: context.metrics.length
    });

    try {
      // Generate monitoring ID
      const monitoringId = `MON_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      logger?.info('📊 [OperationsMonitor] Analyzing business metrics', {
        monitoringId,
        categories: context.monitoringScope
      });

      // Analyze each metric
      const metricsAnalysis = context.metrics.map(metric => 
        analyzeMetric(metric, context.analysisOptions || {}, logger)
      );

      // Calculate overall health score
      const overallHealthScore = calculateOverallHealthScore(metricsAnalysis, logger);

      // Generate alerts based on metric analysis
      const alerts = generateAlerts(
        metricsAnalysis, 
        context.alertThresholds || { critical: 0.2, warning: 0.1, enableTrendAlerts: true, minimumDataPoints: 3 },
        logger
      );

      // Generate insights and recommendations
      const insights = generateOperationalInsights(
        metricsAnalysis, 
        context.monitoringScope, 
        context.analysisOptions || {},
        logger
      );

      // Create performance summary
      const performanceSummary = createPerformanceSummary(metricsAnalysis, alerts, logger);

      // Plan automated actions
      const automatedActions = planAutomatedActions(alerts, metricsAnalysis, logger);

      // Schedule next monitoring
      const nextMonitoring = scheduleNextMonitoring(
        context.timePeriod,
        alerts,
        context.monitoringScope,
        logger
      );

      const result = {
        monitoringId,
        timestamp: new Date().toISOString(),
        overallHealthScore,
        metricsAnalysis,
        alerts,
        insights,
        performanceSummary,
        automatedActions,
        nextMonitoring
      };

      logger?.info('✅ [OperationsMonitor] Monitoring analysis completed successfully', {
        monitoringId,
        healthScore: overallHealthScore,
        alertsCount: alerts.length,
        insightsCount: insights.length,
        criticalIssues: performanceSummary.criticalIssues
      });

      return result;

    } catch (error: any) {
      logger?.error('❌ [OperationsMonitor] Monitoring analysis failed', { 
        error: error.message,
        scope: context.monitoringScope
      });
      
      throw new Error(`Operations monitoring analysis failed: ${error.message}`);
    }
  },
});

/**
 * Analyze individual metric performance and trends
 */
function analyzeMetric(metric: any, options: any, logger?: IMastraLogger): any {
  logger?.info(`📈 [OperationsMonitor] Analyzing metric: ${metric.name}`);
  
  // Calculate percentage change if previous value exists
  let percentageChange = undefined;
  if (metric.previousValue !== undefined && metric.previousValue !== 0) {
    percentageChange = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
  }
  
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' | 'volatile' = 'stable';
  if (percentageChange !== undefined) {
    if (Math.abs(percentageChange) < 2) {
      trend = 'stable';
    } else if (percentageChange > 15 || percentageChange < -15) {
      trend = 'volatile';
    } else if (percentageChange > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }
  }
  
  // Determine health status
  let healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown' = 'unknown';
  
  if (metric.target !== undefined) {
    const deviationFromTarget = Math.abs(metric.value - metric.target) / metric.target;
    if (deviationFromTarget <= 0.05) {
      healthStatus = 'healthy';
    } else if (deviationFromTarget <= 0.15) {
      healthStatus = 'warning';
    } else {
      healthStatus = 'critical';
    }
  } else if (percentageChange !== undefined) {
    // Use trend-based health assessment
    if (trend === 'stable' || trend === 'improving') {
      healthStatus = 'healthy';
    } else if (trend === 'declining') {
      healthStatus = 'warning';
    } else if (trend === 'volatile') {
      healthStatus = 'critical';
    }
  }

  return {
    metricId: metric.id,
    name: metric.name,
    category: metric.category,
    currentValue: metric.value,
    previousValue: metric.previousValue,
    targetValue: metric.target,
    percentageChange,
    trend,
    healthStatus,
    unit: metric.unit || 'count'
  };
}

/**
 * Calculate overall business health score
 */
function calculateOverallHealthScore(metricsAnalysis: any[], logger?: IMastraLogger): number {
  logger?.info('🏥 [OperationsMonitor] Calculating overall health score');
  
  if (metricsAnalysis.length === 0) return 50;
  
  const healthScores = metricsAnalysis.map(metric => {
    switch (metric.healthStatus) {
      case 'healthy': return 100;
      case 'warning': return 60;
      case 'critical': return 20;
      default: return 50;
    }
  });
  
  const averageScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  
  // Apply trend adjustments
  const improvingMetrics = metricsAnalysis.filter(m => m.trend === 'improving').length;
  const decliningMetrics = metricsAnalysis.filter(m => m.trend === 'declining').length;
  
  let adjustedScore = averageScore;
  if (improvingMetrics > decliningMetrics) {
    adjustedScore += 5;
  } else if (decliningMetrics > improvingMetrics) {
    adjustedScore -= 5;
  }
  
  return Math.max(0, Math.min(100, Math.round(adjustedScore)));
}

/**
 * Generate alerts based on metric analysis
 */
function generateAlerts(metricsAnalysis: any[], thresholds: any, logger?: IMastraLogger): any[] {
  logger?.info('🚨 [OperationsMonitor] Generating automated alerts');
  
  const alerts = [];
  let alertId = 1;
  
  for (const metric of metricsAnalysis) {
    // Critical alerts
    if (metric.healthStatus === 'critical') {
      alerts.push({
        id: `ALERT_${alertId++}`,
        type: 'critical',
        title: `Critical Issue: ${metric.name}`,
        message: `${metric.name} is in critical condition with current value ${metric.currentValue}${metric.unit}`,
        metricId: metric.metricId,
        severity: 9,
        actionRequired: true,
        suggestedActions: [
          "Investigate root cause immediately",
          "Escalate to operations manager",
          "Implement emergency response plan"
        ],
        timestamp: new Date().toISOString()
      });
    }
    
    // Warning alerts
    if (metric.healthStatus === 'warning') {
      alerts.push({
        id: `ALERT_${alertId++}`,
        type: 'warning',
        title: `Warning: ${metric.name}`,
        message: `${metric.name} shows warning signs with ${metric.percentageChange ? 
          `${metric.percentageChange.toFixed(1)}% change` : 'deviation from target'}`,
        metricId: metric.metricId,
        severity: 6,
        actionRequired: true,
        suggestedActions: [
          "Monitor closely for next 24 hours",
          "Review contributing factors",
          "Consider preventive measures"
        ],
        timestamp: new Date().toISOString()
      });
    }
    
    // Trend alerts
    if (thresholds.enableTrendAlerts && metric.trend === 'volatile') {
      alerts.push({
        id: `ALERT_${alertId++}`,
        type: 'warning',
        title: `Volatility Alert: ${metric.name}`,
        message: `${metric.name} showing high volatility - investigate for stability`,
        metricId: metric.metricId,
        severity: 7,
        actionRequired: true,
        suggestedActions: [
          "Analyze factors causing volatility",
          "Implement stabilization measures",
          "Increase monitoring frequency"
        ],
        timestamp: new Date().toISOString()
      });
    }
    
    // Positive alerts
    if (metric.trend === 'improving' && metric.healthStatus === 'healthy') {
      alerts.push({
        id: `ALERT_${alertId++}`,
        type: 'success',
        title: `Positive Trend: ${metric.name}`,
        message: `${metric.name} is performing well with improving trend`,
        metricId: metric.metricId,
        severity: 2,
        actionRequired: false,
        suggestedActions: [
          "Document successful practices",
          "Consider scaling successful strategies",
          "Share success with team"
        ],
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return alerts;
}

/**
 * Generate operational insights and recommendations
 */
function generateOperationalInsights(
  metricsAnalysis: any[], 
  monitoringScope: string[], 
  options: any,
  logger?: IMastraLogger
): any[] {
  logger?.info('💡 [OperationsMonitor] Generating operational insights');
  
  const insights = [];
  
  // Cross-category analysis
  const categoryPerformance = monitoringScope.map(category => {
    const categoryMetrics = metricsAnalysis.filter(m => m.category === category);
    const healthyCount = categoryMetrics.filter(m => m.healthStatus === 'healthy').length;
    const totalCount = categoryMetrics.length;
    
    return {
      category,
      healthRatio: totalCount > 0 ? healthyCount / totalCount : 0,
      totalMetrics: totalCount,
      healthyMetrics: healthyCount
    };
  });
  
  // Generate insights based on category performance
  categoryPerformance.forEach(cat => {
    if (cat.healthRatio >= 0.8) {
      insights.push({
        category: cat.category,
        insight: `${cat.category} operations are performing excellently with ${Math.round(cat.healthRatio * 100)}% of metrics healthy`,
        confidence: 0.9,
        impactLevel: 'high',
        recommendedActions: [
          "Document and replicate successful practices",
          "Consider expanding successful strategies",
          "Use as benchmark for other areas"
        ]
      });
    } else if (cat.healthRatio < 0.5) {
      insights.push({
        category: cat.category,
        insight: `${cat.category} operations need attention - only ${Math.round(cat.healthRatio * 100)}% of metrics are healthy`,
        confidence: 0.95,
        impactLevel: 'high',
        recommendedActions: [
          "Conduct thorough analysis of underperforming areas",
          "Implement improvement action plan",
          "Increase monitoring and reporting frequency",
          "Consider resource reallocation"
        ]
      });
    }
  });
  
  // Trend insights
  const improvingMetrics = metricsAnalysis.filter(m => m.trend === 'improving').length;
  const decliningMetrics = metricsAnalysis.filter(m => m.trend === 'declining').length;
  const totalMetrics = metricsAnalysis.length;
  
  if (improvingMetrics > decliningMetrics && improvingMetrics > totalMetrics * 0.6) {
    insights.push({
      category: 'overall',
      insight: `Strong positive momentum with ${improvingMetrics} out of ${totalMetrics} metrics improving`,
      confidence: 0.85,
      impactLevel: 'high',
      recommendedActions: [
        "Maintain current strategic direction",
        "Identify factors driving improvement",
        "Scale successful initiatives"
      ]
    });
  } else if (decliningMetrics > improvingMetrics && decliningMetrics > totalMetrics * 0.4) {
    insights.push({
      category: 'overall',
      insight: `Concerning trend with ${decliningMetrics} out of ${totalMetrics} metrics declining`,
      confidence: 0.9,
      impactLevel: 'high',
      recommendedActions: [
        "Urgent strategic review required",
        "Identify root causes of decline",
        "Implement corrective action plan",
        "Consider external factors impact"
      ]
    });
  }
  
  // Volatility insights
  const volatileMetrics = metricsAnalysis.filter(m => m.trend === 'volatile').length;
  if (volatileMetrics > totalMetrics * 0.3) {
    insights.push({
      category: 'stability',
      insight: `High volatility detected in ${volatileMetrics} metrics - stability risk identified`,
      confidence: 0.8,
      impactLevel: 'medium',
      recommendedActions: [
        "Investigate volatility causes",
        "Implement stability measures",
        "Review operational processes",
        "Consider market factors"
      ]
    });
  }
  
  return insights;
}

/**
 * Create performance summary
 */
function createPerformanceSummary(metricsAnalysis: any[], alerts: any[], logger?: IMastraLogger): any {
  logger?.info('📋 [OperationsMonitor] Creating performance summary');
  
  const metricsOnTarget = metricsAnalysis.filter(m => m.healthStatus === 'healthy').length;
  const metricsImproving = metricsAnalysis.filter(m => m.trend === 'improving').length;
  const metricsDeclining = metricsAnalysis.filter(m => m.trend === 'declining').length;
  const criticalIssues = alerts.filter(a => a.type === 'critical').length;
  const warningIssues = alerts.filter(a => a.type === 'warning').length;
  
  // Determine overall trend
  let overallTrend: 'positive' | 'negative' | 'stable' | 'mixed';
  if (metricsImproving > metricsDeclining * 1.5) {
    overallTrend = 'positive';
  } else if (metricsDeclining > metricsImproving * 1.5) {
    overallTrend = 'negative';
  } else if (metricsImproving === metricsDeclining && metricsImproving === 0) {
    overallTrend = 'stable';
  } else {
    overallTrend = 'mixed';
  }
  
  return {
    metricsOnTarget,
    metricsImproving,
    metricsDeclining,
    criticalIssues,
    warningIssues,
    overallTrend
  };
}

/**
 * Plan automated actions based on alerts and metrics
 */
function planAutomatedActions(alerts: any[], metricsAnalysis: any[], logger?: IMastraLogger): any[] {
  logger?.info('🤖 [OperationsMonitor] Planning automated actions');
  
  const actions = [];
  
  // Critical alerts require immediate notifications
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  if (criticalAlerts.length > 0) {
    actions.push({
      action: "Send critical alert notifications to operations team",
      trigger: `${criticalAlerts.length} critical alerts detected`,
      scheduled: true,
      executionTime: new Date().toISOString()
    });
    
    actions.push({
      action: "Escalate to management dashboard",
      trigger: "Critical operational issues",
      scheduled: true,
      executionTime: new Date().toISOString()
    });
  }
  
  // Schedule detailed reporting for warning alerts
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  if (warningAlerts.length > 3) {
    actions.push({
      action: "Generate comprehensive operations report",
      trigger: `${warningAlerts.length} warning alerts require attention`,
      scheduled: true,
      executionTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    });
  }
  
  // Plan follow-up monitoring for volatile metrics
  const volatileMetrics = metricsAnalysis.filter(m => m.trend === 'volatile');
  if (volatileMetrics.length > 0) {
    actions.push({
      action: "Increase monitoring frequency for volatile metrics",
      trigger: `${volatileMetrics.length} volatile metrics detected`,
      scheduled: true,
      executionTime: new Date(Date.now() + 1800000).toISOString() // 30 minutes from now
    });
  }
  
  return actions;
}

/**
 * Schedule next monitoring session
 */
function scheduleNextMonitoring(timePeriod: string, alerts: any[], monitoringScope: string[], logger?: IMastraLogger): any {
  logger?.info('📅 [OperationsMonitor] Scheduling next monitoring session');
  
  // Determine next monitoring interval based on current state
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
  const warningAlerts = alerts.filter(a => a.type === 'warning').length;
  
  let nextInterval = timePeriod;
  let monitoringType = 'routine';
  
  if (criticalAlerts > 0) {
    nextInterval = 'hourly';
    monitoringType = 'critical_followup';
  } else if (warningAlerts > 2) {
    nextInterval = timePeriod === 'daily' ? 'hourly' : 'daily';
    monitoringType = 'enhanced';
  }
  
  // Calculate next monitoring time
  const intervals = {
    'hourly': 3600000,
    'daily': 86400000,
    'weekly': 604800000,
    'monthly': 2592000000
  };
  
  const intervalMs = intervals[nextInterval as keyof typeof intervals] || 86400000;
  const scheduledTime = new Date(Date.now() + intervalMs).toISOString();
  
  // Determine focus areas based on issues
  const focusAreas = [];
  if (criticalAlerts > 0) {
    focusAreas.push('critical_issues_resolution');
  }
  if (warningAlerts > 0) {
    focusAreas.push('warning_alerts_monitoring');
  }
  if (focusAreas.length === 0) {
    focusAreas.push('routine_health_check');
  }
  
  return {
    scheduledTime,
    monitoringType,
    focusAreas: [...new Set([...focusAreas, ...monitoringScope])]
  };
}