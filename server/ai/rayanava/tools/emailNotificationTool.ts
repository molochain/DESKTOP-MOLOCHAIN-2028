import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

// Import the email utility from replitmail integration
import { replitMail, type EmailConfig } from "../../utils/replitmail";

/**
 * Email Notification Tool
 * 
 * Automated email notifications for sales and operations automation
 * including alerts, follow-ups, reports, and business intelligence summaries.
 * Leverages the Replit Mail integration for reliable email delivery.
 */

const NotificationType = z.enum([
  'critical-alert',
  'warning-alert', 
  'success-notification',
  'daily-report',
  'lead-followup',
  'business-analysis',
  'operations-summary',
  'custom'
]);

const Priority = z.enum([
  'urgent',
  'high', 
  'normal',
  'low'
]);

export const emailNotificationTool = createTool({
  id: "email-notification-sender",
  description: `Send automated email notifications for sales and operations automation. Supports critical alerts, business reports, lead follow-ups, and operational summaries with intelligent content generation and formatting.`,
  inputSchema: z.object({
    // Email Configuration
    recipientEmail: z.string().email().describe("Primary recipient email address"),
    ccEmails: z.array(z.string().email()).optional().describe("CC recipient email addresses"),

    // Notification Settings
    notificationType: NotificationType.describe("Type of notification to send"),
    priority: Priority.default('normal').describe("Notification priority level"),

    // Content Configuration
    subject: z.string().optional().describe("Custom email subject (auto-generated if not provided)"),
    customContent: z.string().optional().describe("Custom email content"),

    // Data Integration
    businessData: z.object({
      companyName: z.string().optional().describe("Company name for context"),
      analysisResults: z.array(z.object({
        type: z.string(),
        title: z.string(),
        summary: z.string(),
        recommendations: z.array(z.string())
      })).optional().describe("Business analysis results"),

      salesData: z.object({
        totalLeads: z.number().optional(),
        qualifiedLeads: z.number().optional(),
        hotLeads: z.number().optional(),
        estimatedValue: z.string().optional()
      }).optional().describe("Sales performance data"),

      operationsData: z.object({
        healthScore: z.number().optional(),
        criticalAlerts: z.number().optional(),
        warningAlerts: z.number().optional(),
        metricsOnTarget: z.number().optional(),
        totalMetrics: z.number().optional()
      }).optional().describe("Operations monitoring data"),

      alerts: z.array(z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
        severity: z.number(),
        actionRequired: z.boolean()
      })).optional().describe("Active alerts and issues")
    }).optional().describe("Business data for intelligent content generation"),

    // Personalization
    personalization: z.object({
      recipientName: z.string().optional().describe("Recipient's name for personalization"),
      senderName: z.string().default('Rayanava Sales & Operations Agent').describe("Sender name"),
      includeActionItems: z.boolean().default(true).describe("Include action items in email"),
      includeNextSteps: z.boolean().default(true).describe("Include recommended next steps")
    }).optional()
  }),
  outputSchema: z.object({
    notificationId: z.string(),
    emailSent: z.boolean(),
    recipientEmail: z.string(),
    subject: z.string(),
    deliveryStatus: z.object({
      accepted: z.array(z.string()),
      rejected: z.array(z.string()),
      messageId: z.string(),
      response: z.string()
    }).optional(),
    contentSummary: z.object({
      notificationType: z.string(),
      priority: z.string(),
      contentLength: z.number(),
      includesAttachments: z.boolean()
    }),
    timestamp: z.string(),
    nextFollowUp: z.object({
      recommended: z.boolean(),
      suggestedDate: z.string().optional(),
      followUpType: z.string().optional()
    }).optional()
  }),
  execute: async (context, { mastra } = {}) => {
    const logger = mastra?.getLogger();
    logger?.info('📧 [EmailNotification] Starting email notification process', {
      type: context.notificationType,
      priority: context.priority,
      recipient: context.recipientEmail
    });

    try {
      // Generate notification ID
      const notificationId = `EMAIL_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Generate email content based on notification type and data
      const emailContent = generateEmailContent(context, logger);

      logger?.info('📝 [EmailNotification] Generated email content', {
        notificationId,
        subject: emailContent.subject,
        contentLength: emailContent.textContent.length
      });

      // Prepare email message
      const emailMessage: EmailConfig = {
        to: context.recipientEmail,
        subject: emailContent.subject,
        body: emailContent.htmlContent || emailContent.textContent
      };

      logger?.info('📤 [EmailNotification] Sending email notification', {
        notificationId,
        recipient: context.recipientEmail,
        type: context.notificationType
      });

      // Send email using Replit Mail integration
      let deliveryStatus;
      let emailSent = false;

      try {
        emailSent = await replitMail.sendEmail(emailMessage);

        logger?.info('✅ [EmailNotification] Email sent successfully', {
          notificationId,
          recipient: context.recipientEmail,
          status: 'delivered'
        });

      } catch (emailError: any) {
        logger?.error('❌ [EmailNotification] Email sending failed', {
          notificationId,
          error: emailError.message,
          recipient: context.recipientEmail
        });

        // Continue processing but mark as failed
        emailSent = false;
      }

      // Determine follow-up recommendations
      const nextFollowUp = determineFollowUpRecommendations(
        context.notificationType, 
        context.priority,
        context.businessData,
        logger
      );

      // Create content summary
      const contentSummary = {
        notificationType: context.notificationType,
        priority: context.priority,
        contentLength: emailContent.textContent.length,
        includesAttachments: false
      };

      const result = {
        notificationId,
        emailSent,
        recipientEmail: context.recipientEmail,
        subject: emailContent.subject,
        deliveryStatus,
        contentSummary,
        timestamp: new Date().toISOString(),
        nextFollowUp
      };

      logger?.info('✅ [EmailNotification] Notification process completed', {
        notificationId,
        emailSent,
        nextFollowUpRecommended: nextFollowUp?.recommended
      });

      return result;

    } catch (error: any) {
      logger?.error('❌ [EmailNotification] Notification process failed', {
        error: error.message,
        recipient: context.recipientEmail,
        type: context.notificationType
      });

      throw new Error(`Email notification failed: ${error.message}`);
    }
  },
});

/**
 * Generate email content based on notification type and business data
 */
function generateEmailContent(context: any, logger?: IMastraLogger): {
  subject: string;
  textContent: string;
  htmlContent: string;
} {
  logger?.info('🎨 [EmailNotification] Generating email content', {
    type: context.notificationType,
    hasBusinessData: !!context.businessData
  });

  const personalization = context.personalization || {};
  const recipientName = personalization.recipientName || 'Team';
  const senderName = personalization.senderName || 'Rayanava Sales & Operations Agent';
  const companyName = context.businessData?.companyName || 'Your Business';

  let subject: string;
  let textContent: string;
  let htmlContent: string;

  switch (context.notificationType) {
    case 'critical-alert':
      subject = context.subject || `🚨 CRITICAL ALERT: Immediate Action Required - ${companyName}`;
      const criticalAlerts = context.businessData?.alerts?.filter((a: any) => a.type === 'critical') || [];

      textContent = generateCriticalAlertText(recipientName, senderName, companyName, criticalAlerts, context.businessData);
      htmlContent = generateCriticalAlertHTML(recipientName, senderName, companyName, criticalAlerts, context.businessData);
      break;

    case 'warning-alert':
      subject = context.subject || `⚠️ WARNING: Attention Required - ${companyName}`;
      const warningAlerts = context.businessData?.alerts?.filter((a: any) => a.type === 'warning') || [];

      textContent = generateWarningAlertText(recipientName, senderName, companyName, warningAlerts, context.businessData);
      htmlContent = generateWarningAlertHTML(recipientName, senderName, companyName, warningAlerts, context.businessData);
      break;

    case 'daily-report':
      subject = context.subject || `📊 Daily Business Report - ${new Date().toLocaleDateString()} - ${companyName}`;

      textContent = generateDailyReportText(recipientName, senderName, companyName, context.businessData);
      htmlContent = generateDailyReportHTML(recipientName, senderName, companyName, context.businessData);
      break;

    case 'lead-followup':
      subject = context.subject || `🎯 Sales Opportunity Update - ${companyName}`;

      textContent = generateLeadFollowupText(recipientName, senderName, companyName, context.businessData);
      htmlContent = generateLeadFollowupHTML(recipientName, senderName, companyName, context.businessData);
      break;

    case 'business-analysis':
      subject = context.subject || `📈 Business Intelligence Analysis Complete - ${companyName}`;

      textContent = generateBusinessAnalysisText(recipientName, senderName, companyName, context.businessData);
      htmlContent = generateBusinessAnalysisHTML(recipientName, senderName, companyName, context.businessData);
      break;

    case 'operations-summary':
      subject = context.subject || `⚙️ Operations Summary - ${companyName}`;

      textContent = generateOperationsSummaryText(recipientName, senderName, companyName, context.businessData);
      htmlContent = generateOperationsSummaryHTML(recipientName, senderName, companyName, context.businessData);
      break;

    case 'success-notification':
      subject = context.subject || `✅ Success Update - ${companyName}`;

      textContent = generateSuccessNotificationText(recipientName, senderName, companyName, context.businessData);
      htmlContent = generateSuccessNotificationHTML(recipientName, senderName, companyName, context.businessData);
      break;

    default: // custom
      subject = context.subject || `Update from ${senderName}`;
      textContent = context.customContent || `Hello ${recipientName},\n\nThis is an automated update from your sales and operations system.\n\nBest regards,\n${senderName}`;
      htmlContent = `<p>Hello ${recipientName},</p><p>${context.customContent || 'This is an automated update from your sales and operations system.'}</p><p>Best regards,<br>${senderName}</p>`;
  }

  return { subject, textContent, htmlContent };
}

/**
 * Generate critical alert email content
 */
function generateCriticalAlertText(recipientName: string, senderName: string, companyName: string, alerts: any[], businessData: any): string {
  return `CRITICAL ALERT - IMMEDIATE ACTION REQUIRED

Hello ${recipientName},

🚨 CRITICAL ISSUES DETECTED in ${companyName}'s operations requiring immediate attention:

${alerts.map(alert => `• ${alert.title}: ${alert.message}`).join('\n')}

CURRENT SYSTEM STATUS:
${businessData?.operationsData ? `
• Overall Health Score: ${businessData.operationsData.healthScore}/100
• Critical Alerts: ${businessData.operationsData.criticalAlerts}
• Warning Alerts: ${businessData.operationsData.warningAlerts}
` : '• Operations data not available'}

IMMEDIATE ACTION REQUIRED:
${alerts.filter(a => a.actionRequired).map(alert => `• ${alert.title} - Priority ${alert.severity}/10`).join('\n')}

Please investigate these issues immediately and implement the necessary corrective actions.

This is an automated alert from your Sales & Operations monitoring system.

Best regards,
${senderName}
Automated Business Intelligence System`;
}

function generateCriticalAlertHTML(recipientName: string, senderName: string, companyName: string, alerts: any[], businessData: any): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">🚨 CRITICAL ALERT</h1>
    <p style="margin: 5px 0 0 0; font-size: 16px;">IMMEDIATE ACTION REQUIRED</p>
  </div>

  <div style="padding: 20px; background-color: #f8f9fa;">
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Critical issues have been detected in <strong>${companyName}</strong>'s operations requiring immediate attention:</p>

    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h3 style="color: #856404; margin-top: 0;">Critical Issues:</h3>
      ${alerts.map(alert => `<div style="margin-bottom: 10px;"><strong>${alert.title}:</strong> ${alert.message}</div>`).join('')}
    </div>

    ${businessData?.operationsData ? `
    <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h3 style="color: #0c5460; margin-top: 0;">System Status:</h3>
      <p>Overall Health Score: <strong>${businessData.operationsData.healthScore}/100</strong></p>
      <p>Critical Alerts: <strong>${businessData.operationsData.criticalAlerts}</strong></p>
      <p>Warning Alerts: <strong>${businessData.operationsData.warningAlerts}</strong></p>
    </div>
    ` : ''}

    <p><strong>Please investigate these issues immediately and implement the necessary corrective actions.</strong></p>

    <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
      This is an automated alert from your Sales & Operations monitoring system.<br>
      Best regards,<br>
      <strong>${senderName}</strong><br>
      Automated Business Intelligence System
    </p>
  </div>
</div>`;
}

/**
 * Generate daily report email content
 */
function generateDailyReportText(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  const today = new Date().toLocaleDateString();

  return `DAILY BUSINESS REPORT - ${today}

Hello ${recipientName},

Here's your comprehensive daily business report for ${companyName}:

📊 OPERATIONS OVERVIEW:
${businessData?.operationsData ? `
• Overall Health Score: ${businessData.operationsData.healthScore}/100
• Metrics on Target: ${businessData.operationsData.metricsOnTarget}/${businessData.operationsData.totalMetrics}
• Critical Issues: ${businessData.operationsData.criticalAlerts}
• Warning Issues: ${businessData.operationsData.warningAlerts}
` : '• Operations data not available'}

🎯 SALES PERFORMANCE:
${businessData?.salesData ? `
• Total Leads: ${businessData.salesData.totalLeads || 0}
• Qualified Leads: ${businessData.salesData.qualifiedLeads || 0}
• Hot Leads: ${businessData.salesData.hotLeads || 0}
• Estimated Pipeline Value: ${businessData.salesData.estimatedValue || 'N/A'}
` : '• Sales data not available'}

📈 BUSINESS ANALYSIS RESULTS:
${businessData?.analysisResults ? businessData.analysisResults.map((analysis: any) => `
Analysis: ${analysis.title}
Summary: ${analysis.summary}
Top Recommendations: ${analysis.recommendations.slice(0, 2).join(', ')}
`).join('') : '• No new analysis results'}

RECOMMENDED ACTIONS:
• Review and address any critical or warning alerts
• Follow up on hot leads within 24 hours
• Monitor key performance indicators throughout the day
• Review business analysis recommendations and implement action items

This automated report was generated by your Sales & Operations monitoring system.

Best regards,
${senderName}
Automated Business Intelligence System`;
}

function generateDailyReportHTML(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  const today = new Date().toLocaleDateString();

  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">📊 Daily Business Report</h1>
    <p style="margin: 5px 0 0 0; font-size: 16px;">${today}</p>
  </div>

  <div style="padding: 20px; background-color: #f8f9fa;">
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Here's your comprehensive daily business report for <strong>${companyName}</strong>:</p>

    ${businessData?.operationsData ? `
    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h3 style="color: #155724; margin-top: 0;">⚙️ Operations Overview</h3>
      <p>Overall Health Score: <strong>${businessData.operationsData.healthScore}/100</strong></p>
      <p>Metrics on Target: <strong>${businessData.operationsData.metricsOnTarget}/${businessData.operationsData.totalMetrics}</strong></p>
      <p>Critical Issues: <strong>${businessData.operationsData.criticalAlerts}</strong></p>
      <p>Warning Issues: <strong>${businessData.operationsData.warningAlerts}</strong></p>
    </div>
    ` : ''}

    ${businessData?.salesData ? `
    <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h3 style="color: #0c5460; margin-top: 0;">🎯 Sales Performance</h3>
      <p>Total Leads: <strong>${businessData.salesData.totalLeads || 0}</strong></p>
      <p>Qualified Leads: <strong>${businessData.salesData.qualifiedLeads || 0}</strong></p>
      <p>Hot Leads: <strong>${businessData.salesData.hotLeads || 0}</strong></p>
      <p>Estimated Pipeline Value: <strong>${businessData.salesData.estimatedValue || 'N/A'}</strong></p>
    </div>
    ` : ''}

    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h3 style="color: #856404; margin-top: 0;">📋 Recommended Actions</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Review and address any critical or warning alerts</li>
        <li>Follow up on hot leads within 24 hours</li>
        <li>Monitor key performance indicators throughout the day</li>
        <li>Review business analysis recommendations and implement action items</li>
      </ul>
    </div>

    <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
      This automated report was generated by your Sales & Operations monitoring system.<br>
      Best regards,<br>
      <strong>${senderName}</strong><br>
      Automated Business Intelligence System
    </p>
  </div>
</div>`;
}

// Simplified versions of other content generators for brevity
function generateWarningAlertText(recipientName: string, senderName: string, companyName: string, alerts: any[], businessData: any): string {
  return `WARNING ALERT

Hello ${recipientName},

⚠️ Warning issues detected in ${companyName} requiring attention:

${alerts.map(alert => `• ${alert.title}: ${alert.message}`).join('\n')}

Please review these issues and take appropriate action.

Best regards,
${senderName}`;
}

function generateWarningAlertHTML(recipientName: string, senderName: string, companyName: string, alerts: any[], businessData: any): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #856404;">⚠️ Warning Alert</h2>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Warning issues detected in <strong>${companyName}</strong> requiring attention:</p>
    ${alerts.map(alert => `<div style="margin-bottom: 10px;">• <strong>${alert.title}:</strong> ${alert.message}</div>`).join('')}
    <p>Best regards,<br><strong>${senderName}</strong></p>
  </div>`;
}

function generateLeadFollowupText(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `Sales Opportunity Update

Hello ${recipientName},

Sales update for ${companyName}:

${businessData?.salesData ? `
• Hot Leads requiring immediate follow-up: ${businessData.salesData.hotLeads || 0}
• Total qualified leads: ${businessData.salesData.qualifiedLeads || 0}
• Estimated pipeline value: ${businessData.salesData.estimatedValue || 'N/A'}
` : 'Sales data not available'}

Best regards,
${senderName}`;
}

function generateLeadFollowupHTML(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #0066cc;">🎯 Sales Opportunity Update</h2>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Sales update for <strong>${companyName}</strong>:</p>
    ${businessData?.salesData ? `
    <ul>
      <li>Hot Leads requiring immediate follow-up: <strong>${businessData.salesData.hotLeads || 0}</strong></li>
      <li>Total qualified leads: <strong>${businessData.salesData.qualifiedLeads || 0}</strong></li>
      <li>Estimated pipeline value: <strong>${businessData.salesData.estimatedValue || 'N/A'}</strong></li>
    </ul>
    ` : '<p>Sales data not available</p>'}
    <p>Best regards,<br><strong>${senderName}</strong></p>
  </div>`;
}

function generateBusinessAnalysisText(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `Business Intelligence Analysis Complete

Hello ${recipientName},

Your business analysis for ${companyName} is complete.

${businessData?.analysisResults ? businessData.analysisResults.map((analysis: any) => `
Analysis: ${analysis.title}
Summary: ${analysis.summary}
Top Recommendations:
${analysis.recommendations.slice(0, 3).map((rec: string) => `• ${rec}`).join('\n')}
`).join('\n') : 'Analysis results not available'}

Best regards,
${senderName}`;
}

function generateBusinessAnalysisHTML(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #28a745;">📈 Business Intelligence Analysis Complete</h2>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Your business analysis for <strong>${companyName}</strong> is complete.</p>
    ${businessData?.analysisResults ? businessData.analysisResults.map((analysis: any) => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>${analysis.title}</h3>
        <p><strong>Summary:</strong> ${analysis.summary}</p>
        <p><strong>Top Recommendations:</strong></p>
        <ul>${analysis.recommendations.slice(0, 3).map((rec: string) => `<li>${rec}</li>`).join('')}</ul>
      </div>
    `).join('') : '<p>Analysis results not available</p>'}
    <p>Best regards,<br><strong>${senderName}</strong></p>
  </div>`;
}

function generateOperationsSummaryText(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `Operations Summary

Hello ${recipientName},

Operations summary for ${companyName}:

${businessData?.operationsData ? `
• Health Score: ${businessData.operationsData.healthScore}/100
• Metrics on Target: ${businessData.operationsData.metricsOnTarget}
• Critical Issues: ${businessData.operationsData.criticalAlerts}
• Warning Issues: ${businessData.operationsData.warningAlerts}
` : 'Operations data not available'}

Best regards,
${senderName}`;
}

function generateOperationsSummaryHTML(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #6610f2;">⚙️ Operations Summary</h2>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Operations summary for <strong>${companyName}</strong>:</p>
    ${businessData?.operationsData ? `
    <ul>
      <li>Health Score: <strong>${businessData.operationsData.healthScore}/100</strong></li>
      <li>Metrics on Target: <strong>${businessData.operationsData.metricsOnTarget}</strong></li>
      <li>Critical Issues: <strong>${businessData.operationsData.criticalAlerts}</strong></li>
      <li>Warning Issues: <strong>${businessData.operationsData.warningAlerts}</strong></li>
    </ul>
    ` : '<p>Operations data not available</p>'}
    <p>Best regards,<br><strong>${senderName}</strong></p>
  </div>`;
}

function generateSuccessNotificationText(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `Success Update

Hello ${recipientName},

✅ Positive update for ${companyName}:

Your business systems are performing well with successful metrics and operations.

Best regards,
${senderName}`;
}

function generateSuccessNotificationHTML(recipientName: string, senderName: string, companyName: string, businessData: any): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #28a745;">✅ Success Update</h2>
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Positive update for <strong>${companyName}</strong>:</p>
    <p>Your business systems are performing well with successful metrics and operations.</p>
    <p>Best regards,<br><strong>${senderName}</strong></p>
  </div>`;
}

/**
 * Determine follow-up recommendations based on notification type and data
 */
function determineFollowUpRecommendations(
  notificationType: string, 
  priority: string, 
  businessData: any,
  logger?: IMastraLogger
): any {
  logger?.info('📅 [EmailNotification] Determining follow-up recommendations');

  const followUpRecommendations = {
    'critical-alert': {
      recommended: true,
      suggestedDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      followUpType: 'critical-status-check'
    },
    'warning-alert': {
      recommended: true,
      suggestedDate: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      followUpType: 'warning-resolution-check'
    },
    'daily-report': {
      recommended: priority === 'high',
      suggestedDate: new Date(Date.now() + 86400000).toISOString(), // Next day
      followUpType: 'next-daily-report'
    },
    'lead-followup': {
      recommended: businessData?.salesData?.hotLeads > 0,
      suggestedDate: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      followUpType: 'sales-followup'
    }
  };

  return followUpRecommendations[notificationType as keyof typeof followUpRecommendations] || {
    recommended: false
  };
}