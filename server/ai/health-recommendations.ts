import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { db } from '../core/database/db.service';
import { healthMetrics } from '@db/schema';
import { desc, gte } from 'drizzle-orm';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface SystemHealthMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAvg: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    freePercentage: number;
    swapUsage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
  };
  services: {
    [key: string]: {
      status: 'available' | 'unavailable';
      responseTime: number;
      consecutiveFailures: number;
      errorRate: number;
    };
  };
  database: {
    latency: number;
    status: 'connected' | 'disconnected';
  };
}

export interface HealthRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'reliability' | 'security' | 'maintenance';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  timeToImplement: string;
  preventiveScore: number; // 0-100, higher means more preventive
  confidence: number; // 0-1, AI confidence in recommendation
  createdAt: Date;
  metrics: {
    triggerValues: any;
    thresholds: any;
  };
}

export interface TrendAnalysis {
  metric: string;
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  changeRate: number;
  prediction: {
    nextHour: number;
    nextDay: number;
    confidence: number;
  };
}

class HealthRecommendationEngine {
  private static instance: HealthRecommendationEngine;
  private recommendations: Map<string, HealthRecommendation> = new Map();
  private lastAnalysis: Date | null = null;

  public static getInstance(): HealthRecommendationEngine {
    if (!HealthRecommendationEngine.instance) {
      HealthRecommendationEngine.instance = new HealthRecommendationEngine();
    }
    return HealthRecommendationEngine.instance;
  }

  /**
   * Analyze system health metrics and generate AI-powered recommendations
   */
  async analyzeSystemHealth(): Promise<HealthRecommendation[]> {
    try {
      // Get recent health metrics from database
      const recentMetrics = await this.getRecentHealthMetrics(24); // Last 24 hours
      
      if (recentMetrics.length === 0) {
        logger.warn('No health metrics available for analysis');
        return [];
      }

      // Perform trend analysis
      const trendAnalysis = await this.analyzeTrends(recentMetrics);
      
      // Get current system state
      const currentMetrics = recentMetrics[0];
      
      // Generate AI recommendations
      const aiRecommendations = await this.generateAIRecommendations(
        currentMetrics, 
        trendAnalysis,
        recentMetrics
      );

      // Combine with rule-based recommendations
      const ruleBasedRecommendations = this.generateRuleBasedRecommendations(currentMetrics);
      
      // Merge and prioritize recommendations
      const allRecommendations = [...aiRecommendations, ...ruleBasedRecommendations];
      const prioritizedRecommendations = this.prioritizeRecommendations(allRecommendations);

      // Store recommendations
      prioritizedRecommendations.forEach(rec => {
        this.recommendations.set(rec.id, rec);
      });

      this.lastAnalysis = new Date();
      
      logger.info(`Generated ${prioritizedRecommendations.length} health recommendations`);
      
      return prioritizedRecommendations;

    } catch (error) {
      logger.error('Error analyzing system health:', error);
      return [];
    }
  }

  /**
   * Get recent health metrics from database
   */
  private async getRecentHealthMetrics(hours: number = 24): Promise<SystemHealthMetrics[]> {
    let retries = 3;
    let delay = 1000;
    
    while (retries > 0) {
      try {
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        
        const metrics = await db
          .select()
          .from(healthMetrics)
          .where(gte(healthMetrics.timestamp, cutoffTime))
          .orderBy(desc(healthMetrics.timestamp))
          .limit(100);

        return metrics
          .filter(metric => metric.timestamp && metric.systemMetrics)
          .map(metric => {
            const systemMetrics = metric.systemMetrics as any;
            return {
              timestamp: metric.timestamp!,
              cpu: systemMetrics?.cpu || { usage: 0, loadAvg: [0, 0, 0], cores: 1 },
              memory: systemMetrics?.memory || { used: 0, total: 1, freePercentage: 100, swapUsage: 0 },
              disk: systemMetrics?.disk || { total: 1, free: 1, used: 0 },
              services: (metric.servicesStatus as any) || {},
              database: {
                latency: metric.databaseLatency || 0,
                status: metric.status === 'healthy' ? 'connected' : 'disconnected'
              }
            };
          });
      } catch (error: any) {
        retries--;
        
        // Check if it's a connection error that we should retry
        if ((error.message?.includes('Connection') || error.message?.includes('socket') || 
             error.message?.includes('ECONNRESET') || error.code === 'ECONNRESET') && retries > 0) {
          logger.warn(`Database connection error in health metrics, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        
        // Only log error if we've exhausted retries
        if (retries === 0) {
          logger.error('Error fetching recent health metrics after all retries:', error);
        }
      }
    }
    
    // Return empty array if all retries failed
    return [];
  }

  /**
   * Analyze trends in system metrics
   */
  private async analyzeTrends(metrics: SystemHealthMetrics[]): Promise<TrendAnalysis[]> {
    if (metrics.length < 3) {
      return [];
    }

    const trends: TrendAnalysis[] = [];
    
    // Analyze CPU trend
    const cpuValues = metrics.map(m => m.cpu.loadAvg[0] / m.cpu.cores * 100);
    trends.push(await this.calculateTrend('cpu_usage', cpuValues));
    
    // Analyze Memory trend
    const memoryValues = metrics.map(m => 100 - m.memory.freePercentage);
    trends.push(await this.calculateTrend('memory_usage', memoryValues));
    
    // Analyze Database latency trend
    const dbLatencyValues = metrics.map(m => m.database.latency);
    trends.push(await this.calculateTrend('database_latency', dbLatencyValues));

    return trends;
  }

  private async calculateTrend(metric: string, values: number[]): Promise<TrendAnalysis> {
    const recent = values.slice(0, Math.min(10, values.length));
    const older = values.slice(-Math.min(10, values.length));
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const changeRate = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: TrendAnalysis['trend'];
    if (changeRate > 10) trend = 'degrading';
    else if (changeRate > 5) trend = 'stable';
    else if (changeRate < -5) trend = 'improving';
    else trend = 'stable';
    
    // Simple linear prediction
    const slope = (recent[0] - recent[recent.length - 1]) / recent.length;
    const nextHour = recent[0] + slope * 12; // Assuming 5-minute intervals
    const nextDay = recent[0] + slope * 288; // 24 hours worth of 5-minute intervals
    
    return {
      metric,
      trend,
      changeRate,
      prediction: {
        nextHour: Math.max(0, nextHour),
        nextDay: Math.max(0, nextDay),
        confidence: Math.min(0.9, Math.max(0.3, 1 - Math.abs(changeRate) / 100))
      }
    };
  }

  /**
   * Generate AI-powered recommendations using OpenAI
   */
  private async generateAIRecommendations(
    currentMetrics: SystemHealthMetrics,
    trends: TrendAnalysis[],
    historicalData: SystemHealthMetrics[]
  ): Promise<HealthRecommendation[]> {
    try {
      const systemAnalysis = {
        current: {
          cpu: {
            usage: currentMetrics.cpu.loadAvg[0] / currentMetrics.cpu.cores * 100,
            cores: currentMetrics.cpu.cores,
            loadAvg: currentMetrics.cpu.loadAvg
          },
          memory: {
            usagePercentage: 100 - currentMetrics.memory.freePercentage,
            totalGB: Math.round(currentMetrics.memory.total / (1024 ** 3)),
            freeGB: Math.round((currentMetrics.memory.total - currentMetrics.memory.used) / (1024 ** 3))
          },
          database: {
            latency: currentMetrics.database.latency,
            status: currentMetrics.database.status
          },
          services: Object.entries(currentMetrics.services).map(([name, service]) => ({
            name,
            status: service.status,
            responseTime: service.responseTime,
            errorRate: service.errorRate
          }))
        },
        trends: trends.map(t => ({
          metric: t.metric,
          trend: t.trend,
          changeRate: t.changeRate,
          prediction: t.prediction
        })),
        historicalSummary: {
          dataPoints: historicalData.length,
          timeSpan: historicalData.length > 0 ? 
            Math.round((historicalData[0].timestamp.getTime() - historicalData[historicalData.length - 1].timestamp.getTime()) / (1000 * 60 * 60)) : 0,
          avgCpuUsage: historicalData.reduce((sum, m) => sum + (m.cpu.loadAvg[0] / m.cpu.cores * 100), 0) / historicalData.length,
          avgMemoryUsage: historicalData.reduce((sum, m) => sum + (100 - m.memory.freePercentage), 0) / historicalData.length
        }
      };

      const prompt = `
        You are a system health expert analyzing a production logistics platform. Based on the system metrics and trends provided, generate specific, actionable recommendations for system optimization and preventive maintenance.

        Current System State:
        ${JSON.stringify(systemAnalysis, null, 2) || '{}'}

        Please provide recommendations in the following JSON format:
        {
          "recommendations": [
            {
              "priority": "low|medium|high|critical",
              "category": "performance|reliability|security|maintenance",
              "title": "Brief descriptive title",
              "description": "Detailed explanation of the issue and why it needs attention",
              "actionItems": ["Specific action 1", "Specific action 2", "..."],
              "estimatedImpact": "low|medium|high",
              "timeToImplement": "Brief time estimate (e.g., '15 minutes', '2 hours', '1 day')",
              "preventiveScore": 85,
              "confidence": 0.9
            }
          ]
        }

        Focus on:
        1. Preventive actions to avoid future issues
        2. Performance optimizations based on current trends
        3. Resource allocation improvements
        4. Service reliability enhancements
        5. Maintenance scheduling recommendations

        Consider the logistics platform context - this system handles:
        - Real-time tracking and monitoring
        - WebSocket connections for live updates
        - Database operations for shipments and services
        - API endpoints for external integrations
      `;

      if (!openai) {
        logger.warn("OpenAI client not available. Skipping AI-powered health recommendations.");
        return this.generateRuleBasedRecommendations(currentMetrics);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert system administrator and DevOps engineer specializing in logistics platforms and predictive maintenance. Provide practical, specific recommendations based on system metrics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      const aiResponse = JSON.parse(content ? content : '{"recommendations": []}');
      
      return aiResponse.recommendations.map((rec: any, index: number) => ({
        id: `ai_${Date.now()}_${index}`,
        priority: rec.priority,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        actionItems: rec.actionItems,
        estimatedImpact: rec.estimatedImpact,
        timeToImplement: rec.timeToImplement,
        preventiveScore: rec.preventiveScore || 50,
        confidence: rec.confidence || 0.7,
        createdAt: new Date(),
        metrics: {
          triggerValues: currentMetrics,
          thresholds: trends
        }
      }));

    } catch (error) {
      logger.error('Error generating AI recommendations:', error);
      return [];
    }
  }

  /**
   * Generate rule-based recommendations for immediate issues
   */
  private generateRuleBasedRecommendations(metrics: SystemHealthMetrics): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];
    
    // High CPU usage
    const cpuUsage = metrics.cpu.loadAvg[0] / metrics.cpu.cores * 100;
    if (cpuUsage > 80) {
      recommendations.push({
        id: `rule_cpu_${Date.now()}`,
        priority: cpuUsage > 95 ? 'critical' : 'high',
        category: 'performance',
        title: 'High CPU Usage Detected',
        description: `CPU usage is at ${cpuUsage.toFixed(1)}%. This may impact system responsiveness and user experience.`,
        actionItems: [
          'Review running processes and identify resource-intensive operations',
          'Consider scaling horizontally or vertically',
          'Optimize database queries and API endpoints',
          'Implement caching for frequently accessed data'
        ],
        estimatedImpact: 'high',
        timeToImplement: '30 minutes to 2 hours',
        preventiveScore: 25,
        confidence: 0.95,
        createdAt: new Date(),
        metrics: {
          triggerValues: { cpuUsage },
          thresholds: { cpu: { warning: 70, critical: 90 } }
        }
      });
    }

    // High memory usage
    const memoryUsage = 100 - metrics.memory.freePercentage;
    if (memoryUsage > 85) {
      recommendations.push({
        id: `rule_memory_${Date.now()}`,
        priority: memoryUsage > 95 ? 'critical' : 'high',
        category: 'performance',
        title: 'High Memory Usage Alert',
        description: `Memory usage is at ${memoryUsage.toFixed(1)}%. System may experience slowdowns or crashes if memory is exhausted.`,
        actionItems: [
          'Identify memory leaks in application code',
          'Restart services with high memory consumption',
          'Implement memory monitoring and alerting',
          'Consider increasing available memory'
        ],
        estimatedImpact: 'high',
        timeToImplement: '15 minutes to 1 hour',
        preventiveScore: 30,
        confidence: 0.9,
        createdAt: new Date(),
        metrics: {
          triggerValues: { memoryUsage },
          thresholds: { memory: { warning: 80, critical: 95 } }
        }
      });
    }

    // High database latency
    if (metrics.database.latency > 1000) { // > 1 second
      recommendations.push({
        id: `rule_db_${Date.now()}`,
        priority: metrics.database.latency > 5000 ? 'critical' : 'medium',
        category: 'performance',
        title: 'Database Performance Degradation',
        description: `Database queries are taking ${metrics.database.latency}ms on average. This affects overall system performance.`,
        actionItems: [
          'Analyze slow query logs',
          'Optimize database indexes',
          'Review connection pool settings',
          'Consider database maintenance tasks'
        ],
        estimatedImpact: 'medium',
        timeToImplement: '1 to 4 hours',
        preventiveScore: 70,
        confidence: 0.85,
        createdAt: new Date(),
        metrics: {
          triggerValues: { dbLatency: metrics.database.latency },
          thresholds: { database: { warning: 500, critical: 2000 } }
        }
      });
    }

    // Service failures
    const failedServices = Object.entries(metrics.services)
      .filter(([_, service]) => service.status === 'unavailable');
    
    if (failedServices.length > 0) {
      recommendations.push({
        id: `rule_services_${Date.now()}`,
        priority: 'critical',
        category: 'reliability',
        title: 'Service Availability Issues',
        description: `${failedServices.length} services are currently unavailable: ${failedServices.map(([name]) => name).join(', ')}`,
        actionItems: [
          'Investigate service health and logs',
          'Restart failed services if needed',
          'Check network connectivity and dependencies',
          'Implement service monitoring and auto-recovery'
        ],
        estimatedImpact: 'high',
        timeToImplement: '10 to 30 minutes',
        preventiveScore: 10,
        confidence: 1.0,
        createdAt: new Date(),
        metrics: {
          triggerValues: { failedServices: failedServices.length },
          thresholds: { services: { maxFailures: 0 } }
        }
      });
    }

    return recommendations;
  }

  /**
   * Prioritize recommendations based on impact, urgency, and preventive value
   */
  private prioritizeRecommendations(recommendations: HealthRecommendation[]): HealthRecommendation[] {
    return recommendations.sort((a, b) => {
      // Priority weight (critical=4, high=3, medium=2, low=1)
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      // Impact weight
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const aImpact = impactWeight[a.estimatedImpact];
      const bImpact = impactWeight[b.estimatedImpact];
      
      // Calculate composite score
      const aScore = (aPriority * 2) + aImpact + (a.confidence * 2) + (a.preventiveScore / 100);
      const bScore = (bPriority * 2) + bImpact + (b.confidence * 2) + (b.preventiveScore / 100);
      
      return bScore - aScore;
    });
  }

  /**
   * Get current recommendations
   */
  getRecommendations(): HealthRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  /**
   * Mark recommendation as implemented
   */
  markRecommendationImplemented(id: string): boolean {
    return this.recommendations.delete(id);
  }

  /**
   * Get last analysis time
   */
  getLastAnalysisTime(): Date | null {
    return this.lastAnalysis;
  }
}

export const healthRecommendationEngine = HealthRecommendationEngine.getInstance();

/**
 * Initialize the health recommendation system
 */
export function initializeHealthRecommendations(): void {
  // Run initial analysis
  setTimeout(async () => {
    await healthRecommendationEngine.analyzeSystemHealth();
  }, 5000); // Wait 5 seconds for system to stabilize

  // Schedule periodic analysis (every 30 minutes)
  setInterval(async () => {
    try {
      await healthRecommendationEngine.analyzeSystemHealth();
    } catch (error) {
      logger.error('Periodic health analysis failed:', error);
    }
  }, 30 * 60 * 1000);

  logger.info('Health recommendation system initialized');
}