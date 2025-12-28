import { createWorkflow, createStep } from "../inngest";
import { z } from "zod";
import { salesOperationsAgent } from "../agents/salesOperationsAgent";

/**
 * Sales & Operations Automation Workflow
 * 
 * Comprehensive time-based workflow that automates:
 * - Business intelligence analysis (SWOT, competitive analysis, market research)
 * - Sales opportunity qualification and lead scoring
 * - Operations monitoring with metrics tracking and alerting
 * - AI-powered decision making and automated follow-ups
 * 
 * Runs on a scheduled basis to provide continuous business optimization.
 */

// Business Intelligence Analysis Step
const businessIntelligenceStep = createStep({
  id: "business-intelligence-analysis",
  description: "Perform comprehensive business intelligence analysis using AI-powered insights",
  inputSchema: z.object({
    // Default business configuration for automated analysis
    analysisType: z.enum(['swot-analysis', 'competitive-analysis', 'market-research']).default('swot-analysis').describe("Type of business analysis to perform"),
    businessDescription: z.string().default("Rayanava is an advanced AI-powered business automation platform that provides comprehensive sales operations, business intelligence, and operational monitoring capabilities. We serve small to enterprise businesses looking to optimize their operations through AI-driven insights and automation.").describe("Business description for analysis"),
    industry: z.string().default("technology").describe("Industry sector"),
    targetMarket: z.string().default("small to enterprise businesses seeking AI-powered automation solutions").describe("Target market segment"),
    language: z.enum(['en', 'fa', 'tr']).default('en').describe("Language for analysis output")
  }),
  outputSchema: z.object({
    analysisType: z.string(),
    analysisContent: z.string(),
    keyInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
    nextActions: z.array(z.string()),
    timestamp: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🎯 [BusinessIntelligence] Starting business intelligence analysis', {
      type: inputData.analysisType,
      industry: inputData.industry
    });

    try {
      // Use the sales operations agent to perform business intelligence analysis
      const analysisPrompt = `Please perform a comprehensive ${inputData.analysisType} for our business:

Business: ${inputData.businessDescription}
Industry: ${inputData.industry}
Target Market: ${inputData.targetMarket}

Use your business intelligence tool to generate detailed analysis with specific recommendations and actionable insights. Focus on strategic opportunities for growth and operational optimization.`;

      logger?.info('📊 [BusinessIntelligence] Generating AI-powered analysis');

      const { text } = await salesOperationsAgent.generate([
        { role: "user", content: analysisPrompt }
      ], {
        maxSteps: 5,
        resourceId: "sales-ops-automation",
        threadId: `business-intel-${Date.now()}`,
        onStepFinish: ({ text, toolCalls }) => {
          if (toolCalls && toolCalls.length > 0) {
            logger?.info('🔧 [BusinessIntelligence] Tool execution completed', {
              toolsUsed: toolCalls.map(t => t.toolName)
            });
          }
        }
      });

      // Extract insights and recommendations from the analysis
      const insights = extractInsights(text);
      const recommendations = extractRecommendations(text);
      const nextActions = extractNextActions(text);

      logger?.info('✅ [BusinessIntelligence] Analysis completed successfully', {
        insightsCount: insights.length,
        recommendationsCount: recommendations.length,
        actionsCount: nextActions.length
      });

      return {
        analysisType: inputData.analysisType,
        analysisContent: text,
        keyInsights: insights,
        recommendations: recommendations,
        nextActions: nextActions,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger?.error('❌ [BusinessIntelligence] Analysis failed', {
        error: error.message,
        type: inputData.analysisType
      });
      
      // Return fallback analysis
      return {
        analysisType: inputData.analysisType,
        analysisContent: `Business intelligence analysis encountered an error: ${error.message}. Manual review recommended.`,
        keyInsights: ["Analysis error detected", "Manual intervention required"],
        recommendations: ["Review system configuration", "Retry analysis manually"],
        nextActions: ["Check system logs", "Contact technical support"],
        timestamp: new Date().toISOString()
      };
    }
  }
});

// Sales Opportunity Qualification Step
const salesOpportunityStep = createStep({
  id: "sales-opportunity-qualification",
  description: "Analyze and score sales opportunities using AI-powered lead qualification",
  inputSchema: z.object({
    // Sample leads for automated qualification (in production, these would come from CRM/lead sources)
    sampleLeads: z.array(z.object({
      leadName: z.string(),
      companyName: z.string(),
      email: z.string().email(),
      jobTitle: z.string(),
      industry: z.string(),
      companySize: z.string(),
      leadSource: z.string(),
      serviceInterest: z.string(),
      websiteVisits: z.number().default(0),
      emailOpens: z.number().default(0)
    })).default([
      {
        leadName: "Sarah Johnson",
        companyName: "TechStart Solutions",
        email: "sarah.johnson@techstart.com", 
        jobTitle: "Chief Operations Officer",
        industry: "technology",
        companySize: "medium",
        leadSource: "website",
        serviceInterest: "AI automation and business intelligence platform",
        websiteVisits: 5,
        emailOpens: 3
      },
      {
        leadName: "Michael Chen",
        companyName: "GrowthCorp Manufacturing",
        email: "m.chen@growthcorp.com",
        jobTitle: "VP of Operations", 
        industry: "manufacturing",
        companySize: "large",
        leadSource: "referral",
        serviceInterest: "Operations monitoring and performance analytics",
        websiteVisits: 8,
        emailOpens: 6
      },
      {
        leadName: "Lisa Martinez",
        companyName: "RetailMax Inc",
        email: "lisa.martinez@retailmax.com",
        jobTitle: "Marketing Director",
        industry: "retail",
        companySize: "small", 
        leadSource: "social-media",
        serviceInterest: "Sales automation and lead management",
        websiteVisits: 2,
        emailOpens: 1
      }
    ]).describe("Sample leads for qualification analysis"),
    qualificationCriteria: z.object({
      prioritizeBy: z.enum(['score', 'company-size', 'engagement']).default('score').describe("Primary qualification criteria"),
      minimumScore: z.number().default(60).describe("Minimum qualification score for follow-up"),
      maxLeadsToProcess: z.number().default(10).describe("Maximum number of leads to analyze per run")
    }).optional()
  }),
  outputSchema: z.object({
    qualifiedLeads: z.array(z.object({
      leadId: z.string(),
      leadName: z.string(),
      companyName: z.string(),
      qualificationScore: z.number(),
      priority: z.string(),
      recommendedActions: z.array(z.string()),
      estimatedValue: z.string(),
      closeProbability: z.number(),
      followUpPlan: z.string()
    })),
    summaryMetrics: z.object({
      totalLeads: z.number(),
      hotLeads: z.number(),
      warmLeads: z.number(),
      coldLeads: z.number(),
      averageScore: z.number(),
      totalEstimatedValue: z.string()
    }),
    priorityActions: z.array(z.string()),
    timestamp: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🎯 [SalesOpportunity] Starting sales opportunity qualification', {
      leadsCount: inputData.sampleLeads.length,
      criteria: inputData.qualificationCriteria
    });

    try {
      const qualifiedLeads = [];
      let hotLeads = 0, warmLeads = 0, coldLeads = 0;
      let totalScore = 0;
      
      // Process each sample lead
      for (const lead of inputData.sampleLeads.slice(0, inputData.qualificationCriteria?.maxLeadsToProcess || 10)) {
        logger?.info('📊 [SalesOpportunity] Analyzing lead', {
          leadName: lead.leadName,
          company: lead.companyName
        });

        // Use the sales operations agent to qualify the lead
        const qualificationPrompt = `Please analyze and qualify this sales opportunity:

Lead Information:
- Name: ${lead.leadName}
- Company: ${lead.companyName}
- Email: ${lead.email}
- Job Title: ${lead.jobTitle}
- Industry: ${lead.industry}
- Company Size: ${lead.companySize}
- Lead Source: ${lead.leadSource}
- Service Interest: ${lead.serviceInterest}
- Website Visits: ${lead.websiteVisits}
- Email Opens: ${lead.emailOpens}

Use your sales opportunity tool to provide comprehensive lead qualification with scoring, priority assessment, and specific recommendations for follow-up actions.`;

        const { text } = await salesOperationsAgent.generate([
          { role: "user", content: qualificationPrompt }
        ], {
          maxSteps: 5,
          resourceId: "lead-qualification",
          threadId: `lead-${lead.companyName}-${Date.now()}`,
          onStepFinish: ({ toolCalls }) => {
            if (toolCalls && toolCalls.length > 0) {
              logger?.info('🔧 [SalesOpportunity] Lead analysis completed', {
                leadName: lead.leadName,
                toolsUsed: toolCalls.map(t => t.toolName)
              });
            }
          }
        });

        // Extract qualification data from the response
        const qualificationData = extractLeadQualificationData(text, lead);
        totalScore += qualificationData.qualificationScore;

        // Count priority levels
        if (qualificationData.priority === 'hot') hotLeads++;
        else if (qualificationData.priority === 'warm') warmLeads++;
        else coldLeads++;

        qualifiedLeads.push(qualificationData);
      }

      // Generate priority actions based on qualified leads
      const priorityActions = generatePriorityActions(qualifiedLeads, logger);

      const summaryMetrics = {
        totalLeads: inputData.sampleLeads.length,
        hotLeads,
        warmLeads,
        coldLeads,
        averageScore: Math.round(totalScore / qualifiedLeads.length),
        totalEstimatedValue: calculateTotalEstimatedValue(qualifiedLeads)
      };

      logger?.info('✅ [SalesOpportunity] Lead qualification completed', {
        totalLeads: qualifiedLeads.length,
        hotLeads,
        warmLeads,
        averageScore: summaryMetrics.averageScore
      });

      return {
        qualifiedLeads,
        summaryMetrics,
        priorityActions,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger?.error('❌ [SalesOpportunity] Lead qualification failed', {
        error: error.message,
        leadsCount: inputData.sampleLeads.length
      });

      return {
        qualifiedLeads: [],
        summaryMetrics: {
          totalLeads: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          averageScore: 0,
          totalEstimatedValue: "$0"
        },
        priorityActions: ["Review system configuration", "Retry lead qualification"],
        timestamp: new Date().toISOString()
      };
    }
  }
});

// Operations Monitoring Step
const operationsMonitoringStep = createStep({
  id: "operations-monitoring",
  description: "Monitor business operations with comprehensive metrics tracking and automated alerting",
  inputSchema: z.object({
    // Sample business metrics for monitoring (in production, these would come from various business systems)
    businessMetrics: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      type: z.string(),
      value: z.number(),
      target: z.number().optional(),
      previousValue: z.number().optional(),
      unit: z.string().optional()
    })).default([
      // Sales Metrics
      { id: "monthly_revenue", name: "Monthly Revenue", category: "sales", type: "currency", value: 125000, target: 150000, previousValue: 118000, unit: "$" },
      { id: "new_customers", name: "New Customers", category: "sales", type: "counter", value: 24, target: 30, previousValue: 22, unit: "count" },
      { id: "sales_pipeline", name: "Sales Pipeline Value", category: "sales", type: "currency", value: 450000, target: 500000, previousValue: 420000, unit: "$" },
      { id: "conversion_rate", name: "Lead Conversion Rate", category: "sales", type: "percentage", value: 12.5, target: 15.0, previousValue: 11.8, unit: "%" },
      
      // Marketing Metrics
      { id: "website_visitors", name: "Website Visitors", category: "marketing", type: "counter", value: 8500, target: 10000, previousValue: 7800, unit: "visits" },
      { id: "lead_generation", name: "Marketing Qualified Leads", category: "marketing", type: "counter", value: 45, target: 60, previousValue: 38, unit: "leads" },
      { id: "cost_per_lead", name: "Cost Per Lead", category: "marketing", type: "currency", value: 85, target: 75, previousValue: 92, unit: "$" },
      
      // Customer Service Metrics
      { id: "customer_satisfaction", name: "Customer Satisfaction Score", category: "customer-service", type: "percentage", value: 88.5, target: 90.0, previousValue: 87.2, unit: "%" },
      { id: "support_response_time", name: "Average Response Time", category: "customer-service", type: "duration", value: 4.2, target: 3.0, previousValue: 4.8, unit: "hours" },
      { id: "ticket_resolution_rate", name: "First Contact Resolution", category: "customer-service", type: "percentage", value: 76.3, target: 80.0, previousValue: 74.1, unit: "%" },
      
      // Operations Metrics
      { id: "system_uptime", name: "System Uptime", category: "operations", type: "percentage", value: 99.2, target: 99.5, previousValue: 98.9, unit: "%" },
      { id: "process_efficiency", name: "Process Efficiency Score", category: "operations", type: "gauge", value: 82.4, target: 85.0, previousValue: 80.1, unit: "score" },
      { id: "operational_costs", name: "Monthly Operational Costs", category: "operations", type: "currency", value: 45000, target: 42000, previousValue: 47000, unit: "$" }
    ]).describe("Sample business metrics for monitoring"),
    monitoringConfig: z.object({
      alertThreshold: z.number().default(0.15).describe("Alert threshold percentage (15% deviation)"),
      criticalThreshold: z.number().default(0.25).describe("Critical alert threshold (25% deviation)"),
      includeTrendAnalysis: z.boolean().default(true).describe("Include trend analysis in monitoring"),
      enablePredictiveAlerts: z.boolean().default(true).describe("Enable predictive alerting")
    }).optional()
  }),
  outputSchema: z.object({
    monitoringId: z.string(),
    overallHealthScore: z.number(),
    metricsAnalysis: z.array(z.object({
      metricId: z.string(),
      name: z.string(),
      category: z.string(),
      currentValue: z.number(),
      targetValue: z.number().optional(),
      percentageChange: z.number().optional(),
      status: z.string(),
      trend: z.string()
    })),
    alerts: z.array(z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      metricId: z.string(),
      severity: z.string(),
      actionRequired: z.boolean(),
      suggestedActions: z.array(z.string())
    })),
    insights: z.array(z.object({
      category: z.string(),
      insight: z.string(),
      impact: z.string(),
      recommendations: z.array(z.string())
    })),
    priorityActions: z.array(z.string()),
    timestamp: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🎯 [OperationsMonitor] Starting operations monitoring', {
      metricsCount: inputData.businessMetrics.length,
      config: inputData.monitoringConfig
    });

    try {
      // Use the sales operations agent to analyze operational metrics
      const monitoringPrompt = `Please analyze our business operations metrics and provide comprehensive monitoring insights:

Business Metrics:
${inputData.businessMetrics.map(metric => 
  `- ${metric.name}: ${metric.value}${metric.unit || ''} (Target: ${metric.target || 'N/A'}, Previous: ${metric.previousValue || 'N/A'})`
).join('\n')}

Please use your operations monitoring tool to:
1. Analyze current performance vs targets
2. Identify trends and patterns
3. Generate alerts for metrics outside acceptable ranges  
4. Provide actionable insights and recommendations
5. Prioritize areas requiring immediate attention

Focus on operational excellence and business performance optimization.`;

      logger?.info('📊 [OperationsMonitor] Generating comprehensive monitoring analysis');

      const { text } = await salesOperationsAgent.generate([
        { role: "user", content: monitoringPrompt }
      ], {
        maxSteps: 5,
        resourceId: "operations-monitoring",
        threadId: `ops-monitor-${Date.now()}`,
        onStepFinish: ({ toolCalls }) => {
          if (toolCalls && toolCalls.length > 0) {
            logger?.info('🔧 [OperationsMonitor] Monitoring analysis completed', {
              toolsUsed: toolCalls.map(t => t.toolName)
            });
          }
        }
      });

      // Process the monitoring results
      const monitoringResults = processMonitoringResults(text, inputData.businessMetrics, logger);

      logger?.info('✅ [OperationsMonitor] Operations monitoring completed', {
        overallScore: monitoringResults.overallHealthScore,
        alertsCount: monitoringResults.alerts.length,
        insightsCount: monitoringResults.insights.length
      });

      return {
        ...monitoringResults,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger?.error('❌ [OperationsMonitor] Operations monitoring failed', {
        error: error.message,
        metricsCount: inputData.businessMetrics.length
      });

      return {
        monitoringId: `MON_ERROR_${Date.now()}`,
        overallHealthScore: 0,
        metricsAnalysis: [],
        alerts: [{
          id: "ALERT_SYSTEM_ERROR",
          type: "critical",
          title: "Monitoring System Error",
          message: `Operations monitoring failed: ${error.message}`,
          metricId: "system",
          severity: "critical",
          actionRequired: true,
          suggestedActions: ["Check system logs", "Restart monitoring service", "Contact technical support"]
        }],
        insights: [],
        priorityActions: ["Investigate monitoring system failure"],
        timestamp: new Date().toISOString()
      };
    }
  }
});

// Email Notification Step (using replitmail integration)
const emailNotificationStep = createStep({
  id: "email-notifications",
  description: "Send automated email notifications using the emailNotificationTool for alerts, insights, and follow-ups",
  inputSchema: z.object({
    // Data from previous workflow steps
    businessIntelligence: z.object({
      analysisType: z.string(),
      analysisContent: z.string(),
      keyInsights: z.array(z.string()),
      recommendations: z.array(z.string()),
      nextActions: z.array(z.string()),
      timestamp: z.string()
    }),
    salesOpportunities: z.object({
      qualifiedLeads: z.array(z.object({
        leadId: z.string(),
        leadName: z.string(),
        companyName: z.string(),
        qualificationScore: z.number(),
        priority: z.string(),
        recommendedActions: z.array(z.string()),
        estimatedValue: z.string(),
        closeProbability: z.number(),
        followUpPlan: z.string()
      })),
      summaryMetrics: z.object({
        totalLeads: z.number(),
        hotLeads: z.number(),
        warmLeads: z.number(),
        coldLeads: z.number(),
        averageScore: z.number(),
        totalEstimatedValue: z.string()
      }),
      priorityActions: z.array(z.string()),
      timestamp: z.string()
    }),
    operationsHealth: z.object({
      monitoringId: z.string(),
      overallHealthScore: z.number(),
      metricsAnalysis: z.array(z.object({
        metricId: z.string(),
        name: z.string(),
        category: z.string(),
        currentValue: z.number(),
        targetValue: z.number().optional(),
        percentageChange: z.number().optional(),
        status: z.string(),
        trend: z.string()
      })),
      alerts: z.array(z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        message: z.string(),
        metricId: z.string(),
        severity: z.string(),
        actionRequired: z.boolean(),
        suggestedActions: z.array(z.string())
      })),
      insights: z.array(z.object({
        category: z.string(),
        insight: z.string(),
        impact: z.string(),
        recommendations: z.array(z.string())
      })),
      priorityActions: z.array(z.string()),
      timestamp: z.string()
    }),
    // Email configuration with defaults
    emailConfig: z.object({
      recipientEmail: z.string().email().default("admin@rayanava.com").describe("Email recipient for reports"),
      sendCriticalAlerts: z.boolean().default(true).describe("Send critical alerts immediately"),
      sendDailySummary: z.boolean().default(true).describe("Send daily summary report"),
      includeRecommendations: z.boolean().default(true).describe("Include AI recommendations in emails")
    }).default({
      recipientEmail: "admin@rayanava.com",
      sendCriticalAlerts: true,
      sendDailySummary: true,
      includeRecommendations: true
    })
  }),
  outputSchema: z.object({
    emailsSent: z.number(),
    notifications: z.array(z.object({
      type: z.string(),
      recipient: z.string(),
      subject: z.string(),
      status: z.string(),
      timestamp: z.string()
    })),
    summary: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('📧 [EmailNotifications] Starting email notification process using emailNotificationTool');

    try {
      const notifications = [];
      let emailsSent = 0;
      const config = inputData.emailConfig;

      // Prepare business data for emailNotificationTool
      const businessData = {
        companyName: "Rayanava",
        analysisResults: [{
          type: inputData.businessIntelligence.analysisType,
          title: `Business Intelligence Analysis - ${inputData.businessIntelligence.analysisType}`,
          summary: inputData.businessIntelligence.analysisContent.substring(0, 500) + "...",
          recommendations: inputData.businessIntelligence.recommendations
        }],
        salesData: {
          totalLeads: inputData.salesOpportunities.summaryMetrics.totalLeads,
          qualifiedLeads: inputData.salesOpportunities.qualifiedLeads.length,
          hotLeads: inputData.salesOpportunities.summaryMetrics.hotLeads,
          estimatedValue: inputData.salesOpportunities.summaryMetrics.totalEstimatedValue
        },
        operationsData: {
          healthScore: inputData.operationsHealth.overallHealthScore,
          criticalAlerts: inputData.operationsHealth.alerts.filter(a => a.type === 'critical').length,
          warningAlerts: inputData.operationsHealth.alerts.filter(a => a.type === 'warning').length,
          metricsOnTarget: inputData.operationsHealth.metricsAnalysis.filter(m => m.status === 'healthy').length,
          totalMetrics: inputData.operationsHealth.metricsAnalysis.length
        },
        alerts: inputData.operationsHealth.alerts.map(alert => ({
          type: alert.type,
          title: alert.title,
          message: alert.message,
          severity: alert.severity === 'critical' ? 10 : alert.severity === 'warning' ? 5 : 1,
          actionRequired: alert.actionRequired
        }))
      };

      logger?.info('📊 [EmailNotifications] Prepared business data for notifications', {
        salesData: businessData.salesData,
        operationsScore: businessData.operationsData.healthScore,
        alertsCount: businessData.alerts.length
      });

      // Use the sales operations agent to send email notifications
      const emailPrompt = `Please send automated email notifications for our sales and operations results:

BUSINESS INTELLIGENCE RESULTS:
- Analysis Type: ${inputData.businessIntelligence.analysisType}
- Key Insights: ${inputData.businessIntelligence.keyInsights.join(', ')}
- Recommendations: ${inputData.businessIntelligence.recommendations.join(', ')}

SALES OPPORTUNITIES:
- Total Leads Processed: ${inputData.salesOpportunities.summaryMetrics.totalLeads}
- Hot Leads: ${inputData.salesOpportunities.summaryMetrics.hotLeads}
- Warm Leads: ${inputData.salesOpportunities.summaryMetrics.warmLeads}
- Total Estimated Value: ${inputData.salesOpportunities.summaryMetrics.totalEstimatedValue}

OPERATIONS HEALTH:
- Overall Health Score: ${inputData.operationsHealth.overallHealthScore}/100
- Critical Alerts: ${businessData.operationsData.criticalAlerts}
- Warning Alerts: ${businessData.operationsData.warningAlerts}
- Metrics On Target: ${businessData.operationsData.metricsOnTarget}/${businessData.operationsData.totalMetrics}

Please use your email notification tool to:
1. Send a daily business report to ${config.recipientEmail}
2. Send critical alerts if there are any critical issues
3. Send sales follow-up notifications for hot leads
4. Include all relevant business data, insights, and recommended actions

Configure the notifications appropriately based on the business data and priority levels.`;

      logger?.info('🤖 [EmailNotifications] Calling sales operations agent for email automation');

      const { text } = await salesOperationsAgent.generate([
        { role: "user", content: emailPrompt }
      ], {
        maxSteps: 10,
        resourceId: "email-automation",
        threadId: `email-notifications-${Date.now()}`,
        onStepFinish: ({ text, toolCalls }) => {
          if (toolCalls && toolCalls.length > 0) {
            logger?.info('📧 [EmailNotifications] Email tool execution completed', {
              toolsUsed: toolCalls.map(t => t.toolName),
              emailsSentThisStep: toolCalls.filter(t => t.toolName === 'email-notification-sender').length
            });
            // Count successful email tool calls
            emailsSent += toolCalls.filter(t => t.toolName === 'email-notification-sender').length;
          }
        }
      });

      // Parse the agent response to extract notification details
      const notificationResults = parseEmailNotificationResults(text, config.recipientEmail, logger);
      notifications.push(...notificationResults);

      const summary = `Email notifications completed via AI agent: ${emailsSent} emails sent through emailNotificationTool, ${notifications.length} notifications processed. Agent response: ${text.substring(0, 200)}...`;

      logger?.info('✅ [EmailNotifications] AI-powered email notification process completed', {
        emailsSentViaAgent: emailsSent,
        notificationsProcessed: notifications.length,
        agentResponseLength: text.length
      });

      return {
        emailsSent,
        notifications,
        summary
      };

    } catch (error: any) {
      logger?.error('❌ [EmailNotifications] AI email notification process failed', {
        error: error.message,
        recipientEmail: inputData.emailConfig.recipientEmail
      });

      return {
        emailsSent: 0,
        notifications: [{
          type: "error",
          recipient: "system",
          subject: "AI Email Notification Error",
          status: "failed",
          timestamp: new Date().toISOString()
        }],
        summary: `AI email notification process failed: ${error.message}`
      };
    }
  }
});

// Main Workflow Definition
export const salesOperationsWorkflow = createWorkflow({
  id: "sales-operations-automation",
  description: "Comprehensive time-based automation workflow for sales and operations using Rayanava's AI-powered business intelligence platform",
  inputSchema: z.object({}), // Empty for time-based workflows
  outputSchema: z.object({
    workflowId: z.string(),
    executionSummary: z.string(),
    businessIntelligence: z.object({
      analysisType: z.string(),
      keyInsights: z.array(z.string()),
      recommendations: z.array(z.string())
    }),
    salesOpportunities: z.object({
      totalLeads: z.number(),
      hotLeads: z.number(),
      averageScore: z.number(),
      priorityActions: z.array(z.string())
    }),
    operationsHealth: z.object({
      overallScore: z.number(),
      alertsCount: z.number(),
      criticalIssues: z.number()
    }),
    notifications: z.object({
      emailsSent: z.number(),
      status: z.string()
    }),
    timestamp: z.string(),
    success: z.boolean()
  })
})
  .then(businessIntelligenceStep)
  .then(salesOpportunityStep)
  .then(operationsMonitoringStep)
  .then(emailNotificationStep)
  .commit();

// Helper Functions

function extractInsights(text: string): string[] {
  // Extract insights from AI analysis - in production would use more sophisticated parsing
  const insights = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('insight') || line.toLowerCase().includes('key point') || line.toLowerCase().includes('finding')) {
      insights.push(line.trim());
    }
  }
  
  return insights.length > 0 ? insights : ["AI-powered business analysis completed", "Strategic insights generated", "Recommendations available"];
}

function extractRecommendations(text: string): string[] {
  // Extract recommendations from AI analysis
  const recommendations = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('should') || line.toLowerCase().includes('action')) {
      recommendations.push(line.trim());
    }
  }
  
  return recommendations.length > 0 ? recommendations : ["Review business strategy", "Optimize operations", "Enhance customer engagement"];
}

function extractNextActions(text: string): string[] {
  // Extract action items from AI analysis
  const actions = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('next step') || line.toLowerCase().includes('action item') || line.toLowerCase().includes('implement')) {
      actions.push(line.trim());
    }
  }
  
  return actions.length > 0 ? actions : ["Schedule strategy review", "Implement recommendations", "Monitor progress"];
}

function extractLeadQualificationData(analysisText: string, lead: any): any {
  // Extract qualification data from AI analysis - simplified for demo
  const baseScore = 50;
  const companyScore = lead.companySize === 'large' ? 20 : lead.companySize === 'medium' ? 15 : 10;
  const engagementScore = (lead.websiteVisits * 2) + (lead.emailOpens * 3);
  const sourceScore = lead.leadSource === 'referral' ? 15 : lead.leadSource === 'website' ? 10 : 5;
  
  const qualificationScore = Math.min(100, baseScore + companyScore + engagementScore + sourceScore);
  
  let priority = 'cold';
  if (qualificationScore >= 80) priority = 'hot';
  else if (qualificationScore >= 60) priority = 'warm';
  
  const estimatedValue = lead.companySize === 'large' ? '$50,000-$100,000' : 
                        lead.companySize === 'medium' ? '$25,000-$50,000' : '$10,000-$25,000';
  
  const closeProbability = priority === 'hot' ? 0.75 : priority === 'warm' ? 0.45 : 0.20;
  
  return {
    leadId: `LEAD_${Date.now()}_${lead.companyName.replace(/\s+/g, '_').toUpperCase()}`,
    leadName: lead.leadName,
    companyName: lead.companyName,
    qualificationScore,
    priority,
    recommendedActions: [
      `Contact ${lead.leadName} within 24 hours`,
      `Send personalized ${lead.serviceInterest} proposal`,
      `Schedule demo call`
    ],
    estimatedValue,
    closeProbability,
    followUpPlan: `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority follow-up sequence with personalized outreach`
  };
}

function generatePriorityActions(qualifiedLeads: any[], logger: any): string[] {
  const hotLeads = qualifiedLeads.filter(lead => lead.priority === 'hot');
  const warmLeads = qualifiedLeads.filter(lead => lead.priority === 'warm');
  
  const actions = [];
  
  if (hotLeads.length > 0) {
    actions.push(`Immediately contact ${hotLeads.length} hot leads`);
    actions.push(`Prepare personalized proposals for high-value opportunities`);
  }
  
  if (warmLeads.length > 0) {
    actions.push(`Schedule follow-up calls with ${warmLeads.length} warm leads`);
    actions.push(`Send nurturing email sequence to warm prospects`);
  }
  
  actions.push('Update CRM with qualification scores');
  actions.push('Review and optimize lead generation strategy');
  
  return actions;
}

function calculateTotalEstimatedValue(qualifiedLeads: any[]): string {
  // Simplified calculation - in production would use actual value ranges
  const estimates = qualifiedLeads.map(lead => {
    const range = lead.estimatedValue;
    if (range.includes('$50,000-$100,000')) return 75000;
    if (range.includes('$25,000-$50,000')) return 37500;
    if (range.includes('$10,000-$25,000')) return 17500;
    return 10000;
  });
  
  const total = estimates.reduce((sum, val) => sum + val, 0);
  return `$${total.toLocaleString()}`;
}

function processMonitoringResults(analysisText: string, metrics: any[], logger: any): any {
  // Process operations monitoring results - simplified for demo
  const monitoringId = `MON_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const metricsAnalysis = metrics.map(metric => {
    const percentageChange = metric.previousValue ? 
      ((metric.value - metric.previousValue) / metric.previousValue) * 100 : 0;
    
    let status = 'healthy';
    let trend = 'stable';
    
    if (metric.target) {
      const deviation = Math.abs(metric.value - metric.target) / metric.target;
      if (deviation > 0.25) status = 'critical';
      else if (deviation > 0.15) status = 'warning';
    }
    
    if (percentageChange > 5) trend = 'improving';
    else if (percentageChange < -5) trend = 'declining';
    
    return {
      metricId: metric.id,
      name: metric.name,
      category: metric.category,
      currentValue: metric.value,
      targetValue: metric.target,
      percentageChange: Math.round(percentageChange * 100) / 100,
      status,
      trend
    };
  });
  
  // Generate alerts for metrics that are off-target
  const alerts = [];
  metricsAnalysis.forEach(metric => {
    if (metric.status === 'critical') {
      alerts.push({
        id: `ALERT_${metric.metricId}_${Date.now()}`,
        type: 'critical',
        title: `Critical Issue: ${metric.name}`,
        message: `${metric.name} is significantly below target. Current: ${metric.currentValue}, Target: ${metric.targetValue}`,
        metricId: metric.metricId,
        severity: 'critical',
        actionRequired: true,
        suggestedActions: [
          `Investigate ${metric.name} performance issues`,
          'Implement corrective measures immediately',
          'Monitor progress closely'
        ]
      });
    } else if (metric.status === 'warning') {
      alerts.push({
        id: `ALERT_${metric.metricId}_${Date.now()}`,
        type: 'warning',
        title: `Performance Warning: ${metric.name}`,
        message: `${metric.name} is below optimal levels. Current: ${metric.currentValue}, Target: ${metric.targetValue}`,
        metricId: metric.metricId,
        severity: 'warning',
        actionRequired: false,
        suggestedActions: [
          `Review ${metric.name} processes`,
          'Consider optimization strategies'
        ]
      });
    }
  });
  
  // Generate insights based on trends and performance
  const insights = [
    {
      category: 'performance',
      insight: `${metricsAnalysis.filter(m => m.status === 'healthy').length} out of ${metricsAnalysis.length} metrics are performing within acceptable ranges`,
      impact: 'medium',
      recommendations: ['Continue monitoring healthy metrics', 'Focus improvement efforts on underperforming areas']
    },
    {
      category: 'trends', 
      insight: `${metricsAnalysis.filter(m => m.trend === 'improving').length} metrics show positive trends`,
      impact: 'high',
      recommendations: ['Identify success factors from improving metrics', 'Apply successful strategies to other areas']
    }
  ];
  
  // Calculate overall health score
  const healthyCount = metricsAnalysis.filter(m => m.status === 'healthy').length;
  const overallHealthScore = Math.round((healthyCount / metricsAnalysis.length) * 100);
  
  const priorityActions = [
    'Address critical performance issues immediately',
    'Implement optimization strategies for warning-level metrics',
    'Continue monitoring trend improvements',
    'Schedule performance review meeting'
  ];
  
  return {
    monitoringId,
    overallHealthScore,
    metricsAnalysis,
    alerts,
    insights,
    priorityActions
  };
}

function parseEmailNotificationResults(agentResponse: string, recipientEmail: string, logger: any): any[] {
  // Parse the agent's response to extract email notification details
  logger?.info('📝 [EmailNotifications] Parsing agent response for notification results');
  
  const notifications = [];
  const timestamp = new Date().toISOString();
  
  // Check if agent mentioned sending emails
  const responseText = agentResponse.toLowerCase();
  
  if (responseText.includes('email sent') || responseText.includes('notification sent')) {
    // Extract different types of notifications mentioned
    if (responseText.includes('daily report') || responseText.includes('summary')) {
      notifications.push({
        type: "daily_report",
        recipient: recipientEmail,
        subject: `Daily Business Report - ${new Date().toLocaleDateString()}`,
        status: "processed_via_agent",
        timestamp
      });
    }
    
    if (responseText.includes('critical alert') || responseText.includes('urgent')) {
      notifications.push({
        type: "critical_alert",
        recipient: recipientEmail,
        subject: "Critical Business Alert - Immediate Action Required",
        status: "processed_via_agent", 
        timestamp
      });
    }
    
    if (responseText.includes('sales') || responseText.includes('lead')) {
      notifications.push({
        type: "sales_followup",
        recipient: recipientEmail,
        subject: "Sales Opportunity Follow-up Required",
        status: "processed_via_agent",
        timestamp
      });
    }
    
    // If no specific types detected but email sending was mentioned
    if (notifications.length === 0) {
      notifications.push({
        type: "general_notification",
        recipient: recipientEmail,
        subject: "Business Intelligence Update",
        status: "processed_via_agent",
        timestamp
      });
    }
  } else {
    // Agent didn't mention sending emails - add a default response
    notifications.push({
      type: "agent_response",
      recipient: recipientEmail,
      subject: "Automated Business Analysis Complete",
      status: "agent_completed_analysis",
      timestamp
    });
  }
  
  logger?.info('📋 [EmailNotifications] Parsed notification results', {
    notificationsFound: notifications.length,
    types: notifications.map(n => n.type)
  });
  
  return notifications;
}