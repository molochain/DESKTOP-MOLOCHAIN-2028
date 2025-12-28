import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

/**
 * Sales Opportunity Analysis Tool
 * 
 * Automated lead qualification and scoring based on comprehensive criteria
 * including company profile, contact information, engagement history, and
 * strategic fit assessment for sales and operations automation.
 */

// Lead qualification criteria
const LeadSource = z.enum([
  'website', 'referral', 'social-media', 'email-campaign', 
  'trade-show', 'cold-outreach', 'partnership', 'organic'
]);

const CompanySize = z.enum([
  'startup', 'small', 'medium', 'large', 'enterprise'
]);

const Industry = z.enum([
  'technology', 'finance', 'healthcare', 'manufacturing', 'retail',
  'education', 'government', 'consulting', 'real-estate', 'other'
]);

const BudgetRange = z.enum([
  'under-10k', '10k-50k', '50k-100k', '100k-500k', 'over-500k'
]);

const Timeline = z.enum([
  'immediate', '1-3-months', '3-6-months', '6-12-months', 'over-12-months'
]);

export const salesOpportunityTool = createTool({
  id: "sales-opportunity-analyzer",
  description: `Analyze and score sales opportunities using AI-powered lead qualification. Evaluates leads based on company profile, contact engagement, budget qualification, timeline, and strategic fit to prioritize sales efforts and automate follow-up sequences.`,
  inputSchema: z.object({
    // Lead Basic Information
    leadName: z.string().describe("Contact person's full name"),
    companyName: z.string().describe("Company or organization name"),
    email: z.string().email().describe("Contact email address"),
    phone: z.string().optional().describe("Contact phone number"),
    jobTitle: z.string().describe("Contact's job title or role"),
    
    // Company Profile
    industry: Industry.describe("Industry or business sector"),
    companySize: CompanySize.describe("Company size category"),
    companyRevenue: z.string().optional().describe("Annual company revenue if known"),
    location: z.string().describe("Company location (city, country)"),
    
    // Opportunity Details
    leadSource: LeadSource.describe("How the lead was acquired"),
    serviceInterest: z.string().describe("Products/services the lead is interested in"),
    budgetRange: BudgetRange.optional().describe("Budget range if disclosed"),
    timeline: Timeline.optional().describe("Decision timeline if known"),
    
    // Engagement Data
    websiteVisits: z.number().default(0).describe("Number of website visits"),
    emailOpens: z.number().default(0).describe("Email engagement count"),
    contentDownloads: z.number().default(0).describe("Content downloads or form submissions"),
    socialEngagement: z.number().default(0).describe("Social media engagement level"),
    
    // Additional Context
    painPoints: z.string().optional().describe("Identified pain points or challenges"),
    competitorMentions: z.string().optional().describe("Competitors mentioned by lead"),
    additionalNotes: z.string().optional().describe("Additional qualifying information")
  }),
  outputSchema: z.object({
    leadId: z.string(),
    qualificationScore: z.number(),
    scoreBreakdown: z.object({
      companyFit: z.number(),
      contactQuality: z.number(), 
      engagementLevel: z.number(),
      budgetQualification: z.number(),
      timelineReadiness: z.number(),
      strategicValue: z.number()
    }),
    priority: z.enum(['hot', 'warm', 'cold', 'nurture']),
    recommendedActions: z.array(z.string()),
    followUpSequence: z.array(z.object({
      day: z.number(),
      action: z.string(),
      channel: z.string(),
      template: z.string()
    })),
    riskFactors: z.array(z.string()),
    opportunityInsights: z.array(z.string()),
    nextSteps: z.array(z.string()),
    estimatedValue: z.string(),
    closeProbability: z.number(),
    timestamp: z.string()
  }),
  execute: async (context, { mastra } = {}) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [SalesOpportunity] Starting lead qualification analysis', { 
      lead: context.leadName,
      company: context.companyName,
      source: context.leadSource
    });

    try {
      // Generate unique lead ID
      const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      logger?.info('📊 [SalesOpportunity] Calculating qualification scores');

      // Calculate individual scoring components
      const companyFit = calculateCompanyFitScore(context, logger);
      const contactQuality = calculateContactQualityScore(context, logger);
      const engagementLevel = calculateEngagementScore(context, logger);
      const budgetQualification = calculateBudgetScore(context, logger);
      const timelineReadiness = calculateTimelineScore(context, logger);
      const strategicValue = calculateStrategicValueScore(context, logger);

      // Calculate overall qualification score (weighted average)
      const qualificationScore = Math.round(
        (companyFit * 0.20) +
        (contactQuality * 0.15) +
        (engagementLevel * 0.20) +
        (budgetQualification * 0.20) +
        (timelineReadiness * 0.15) +
        (strategicValue * 0.10)
      );

      const scoreBreakdown = {
        companyFit,
        contactQuality,
        engagementLevel,
        budgetQualification,
        timelineReadiness,
        strategicValue
      };

      logger?.info('📈 [SalesOpportunity] Lead scoring completed', {
        leadId,
        qualificationScore,
        breakdown: scoreBreakdown
      });

      // Determine priority level
      const priority = determinePriorityLevel(qualificationScore, scoreBreakdown);
      
      // Generate recommended actions
      const recommendedActions = generateRecommendedActions(context, qualificationScore, scoreBreakdown, logger);
      
      // Create follow-up sequence
      const followUpSequence = createFollowUpSequence(priority, context, logger);
      
      // Identify risk factors
      const riskFactors = identifyRiskFactors(context, scoreBreakdown, logger);
      
      // Generate opportunity insights
      const opportunityInsights = generateOpportunityInsights(context, scoreBreakdown, logger);
      
      // Determine next steps
      const nextSteps = determineNextSteps(priority, context, scoreBreakdown);
      
      // Calculate estimated value and close probability
      const estimatedValue = calculateEstimatedValue(context, scoreBreakdown);
      const closeProbability = calculateCloseProbability(qualificationScore, scoreBreakdown);

      const result = {
        leadId,
        qualificationScore,
        scoreBreakdown,
        priority,
        recommendedActions,
        followUpSequence,
        riskFactors,
        opportunityInsights,
        nextSteps,
        estimatedValue,
        closeProbability,
        timestamp: new Date().toISOString()
      };

      logger?.info('✅ [SalesOpportunity] Lead analysis completed successfully', {
        leadId,
        priority,
        score: qualificationScore,
        closeProbability,
        estimatedValue
      });

      return result;

    } catch (error: any) {
      logger?.error('❌ [SalesOpportunity] Lead analysis failed', { 
        error: error.message,
        lead: context.leadName,
        company: context.companyName
      });
      
      throw new Error(`Sales opportunity analysis failed: ${error.message}`);
    }
  },
});

/**
 * Calculate company fit score based on size, industry, and profile
 */
function calculateCompanyFitScore(context: any, logger?: IMastraLogger): number {
  logger?.info('🏢 [SalesOpportunity] Calculating company fit score');
  
  let score = 50; // Base score
  
  // Company size scoring
  const sizeScores = {
    'startup': 60,
    'small': 70,
    'medium': 85,
    'large': 90,
    'enterprise': 95
  };
  score += (sizeScores[context.companySize as keyof typeof sizeScores] || 50) * 0.4;
  
  // Industry fit scoring
  const industryScores = {
    'technology': 95,
    'finance': 85,
    'healthcare': 80,
    'consulting': 90,
    'manufacturing': 75,
    'other': 60
  };
  score += (industryScores[context.industry as keyof typeof industryScores] || 60) * 0.3;
  
  // Location scoring (simplified)
  if (context.location.toLowerCase().includes('us') || 
      context.location.toLowerCase().includes('europe') ||
      context.location.toLowerCase().includes('canada')) {
    score += 10;
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate contact quality score based on job title and contact information
 */
function calculateContactQualityScore(context: any, logger?: IMastraLogger): number {
  logger?.info('👤 [SalesOpportunity] Calculating contact quality score');
  
  let score = 40; // Base score
  
  // Job title scoring
  const title = context.jobTitle.toLowerCase();
  if (title.includes('ceo') || title.includes('founder') || title.includes('president')) {
    score += 40;
  } else if (title.includes('cto') || title.includes('cio') || title.includes('vp')) {
    score += 35;
  } else if (title.includes('director') || title.includes('head of')) {
    score += 25;
  } else if (title.includes('manager') || title.includes('lead')) {
    score += 15;
  }
  
  // Complete contact information
  if (context.email) score += 10;
  if (context.phone) score += 10;
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate engagement score based on digital interactions
 */
function calculateEngagementScore(context: any, logger?: IMastraLogger): number {
  logger?.info('📱 [SalesOpportunity] Calculating engagement score');
  
  let score = 20; // Base score for any engagement
  
  // Website visits scoring
  score += Math.min(context.websiteVisits * 5, 25);
  
  // Email engagement scoring
  score += Math.min(context.emailOpens * 3, 20);
  
  // Content downloads scoring
  score += Math.min(context.contentDownloads * 8, 25);
  
  // Social engagement scoring
  score += Math.min(context.socialEngagement * 2, 10);
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate budget qualification score
 */
function calculateBudgetScore(context: any, logger?: IMastraLogger): number {
  logger?.info('💰 [SalesOpportunity] Calculating budget score');
  
  if (!context.budgetRange) return 50; // Neutral score if unknown
  
  const budgetScores = {
    'under-10k': 40,
    '10k-50k': 60,
    '50k-100k': 80,
    '100k-500k': 95,
    'over-500k': 100
  };
  
  return budgetScores[context.budgetRange as keyof typeof budgetScores] || 50;
}

/**
 * Calculate timeline readiness score
 */
function calculateTimelineScore(context: any, logger?: IMastraLogger): number {
  logger?.info('⏰ [SalesOpportunity] Calculating timeline score');
  
  if (!context.timeline) return 50; // Neutral score if unknown
  
  const timelineScores = {
    'immediate': 100,
    '1-3-months': 90,
    '3-6-months': 70,
    '6-12-months': 50,
    'over-12-months': 30
  };
  
  return timelineScores[context.timeline as keyof typeof timelineScores] || 50;
}

/**
 * Calculate strategic value score
 */
function calculateStrategicValueScore(context: any, logger?: IMastraLogger): number {
  logger?.info('🎯 [SalesOpportunity] Calculating strategic value score');
  
  let score = 50; // Base score
  
  // High-value lead sources
  const sourceScores = {
    'referral': 90,
    'partnership': 85,
    'trade-show': 75,
    'website': 70,
    'email-campaign': 65,
    'social-media': 60,
    'cold-outreach': 40,
    'organic': 55
  };
  
  score = sourceScores[context.leadSource as keyof typeof sourceScores] || 50;
  
  // Pain points mentioned (indicates need)
  if (context.painPoints && context.painPoints.length > 20) {
    score += 15;
  }
  
  // Competitor mentions (indicates active evaluation)
  if (context.competitorMentions && context.competitorMentions.length > 10) {
    score += 10;
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Determine priority level based on overall score and breakdown
 */
function determinePriorityLevel(qualificationScore: number, scoreBreakdown: any): 'hot' | 'warm' | 'cold' | 'nurture' {
  if (qualificationScore >= 80 && 
      (scoreBreakdown.timelineReadiness >= 70 || scoreBreakdown.budgetQualification >= 70)) {
    return 'hot';
  } else if (qualificationScore >= 65) {
    return 'warm';
  } else if (qualificationScore >= 45) {
    return 'cold';
  } else {
    return 'nurture';
  }
}

/**
 * Generate recommended actions based on lead analysis
 */
function generateRecommendedActions(context: any, score: number, breakdown: any, logger?: IMastraLogger): string[] {
  logger?.info('📋 [SalesOpportunity] Generating recommended actions');
  
  const actions = [];
  
  if (score >= 80) {
    actions.push("Schedule immediate discovery call within 24 hours");
    actions.push("Prepare customized proposal based on pain points");
    actions.push("Research company's recent news and developments");
  } else if (score >= 65) {
    actions.push("Send personalized follow-up email within 48 hours");
    actions.push("Share relevant case studies and success stories");
    actions.push("Offer free consultation or demo");
  } else if (score >= 45) {
    actions.push("Add to nurturing email sequence");
    actions.push("Connect on LinkedIn with personalized message");
    actions.push("Share valuable industry insights and content");
  } else {
    actions.push("Add to long-term nurturing campaign");
    actions.push("Monitor for engagement and re-score monthly");
    actions.push("Provide educational content and resources");
  }
  
  // Specific actions based on weak areas
  if (breakdown.budgetQualification < 60) {
    actions.push("Qualify budget in next interaction");
  }
  
  if (breakdown.timelineReadiness < 60) {
    actions.push("Determine decision timeline and urgency factors");
  }
  
  if (breakdown.engagementLevel < 50) {
    actions.push("Increase engagement through valuable content sharing");
  }
  
  return actions;
}

/**
 * Create follow-up sequence based on priority
 */
function createFollowUpSequence(priority: string, context: any, logger?: IMastraLogger): any[] {
  logger?.info('📅 [SalesOpportunity] Creating follow-up sequence');
  
  const sequences = {
    hot: [
      { day: 0, action: "Send immediate response", channel: "email", template: "hot_lead_immediate" },
      { day: 1, action: "Follow-up call", channel: "phone", template: "discovery_call_booking" },
      { day: 3, action: "Send proposal", channel: "email", template: "custom_proposal" },
      { day: 7, action: "Proposal follow-up", channel: "phone", template: "proposal_discussion" }
    ],
    warm: [
      { day: 1, action: "Personalized email", channel: "email", template: "warm_lead_followup" },
      { day: 3, action: "Share case study", channel: "email", template: "relevant_case_study" },
      { day: 7, action: "LinkedIn connection", channel: "linkedin", template: "professional_connection" },
      { day: 14, action: "Check-in call", channel: "phone", template: "warm_lead_checkin" }
    ],
    cold: [
      { day: 2, action: "Educational content", channel: "email", template: "industry_insights" },
      { day: 7, action: "Company news mention", channel: "email", template: "news_mention" },
      { day: 14, action: "Value proposition", channel: "email", template: "value_proposition" },
      { day: 30, action: "Re-engagement attempt", channel: "email", template: "reengagement" }
    ],
    nurture: [
      { day: 7, action: "Welcome to newsletter", channel: "email", template: "newsletter_signup" },
      { day: 21, action: "Industry report", channel: "email", template: "industry_report" },
      { day: 45, action: "Webinar invitation", channel: "email", template: "webinar_invite" },
      { day: 90, action: "Re-qualification", channel: "email", template: "requalification" }
    ]
  };
  
  return sequences[priority as keyof typeof sequences] || sequences.nurture;
}

/**
 * Identify risk factors that could impact deal success
 */
function identifyRiskFactors(context: any, breakdown: any, logger?: IMastraLogger): string[] {
  logger?.info('⚠️ [SalesOpportunity] Identifying risk factors');
  
  const risks = [];
  
  if (breakdown.budgetQualification < 50) {
    risks.push("Budget not yet qualified - may not have sufficient funds");
  }
  
  if (breakdown.timelineReadiness < 50) {
    risks.push("Timeline is extended - may lose momentum or urgency");
  }
  
  if (breakdown.contactQuality < 60) {
    risks.push("Contact may not have decision-making authority");
  }
  
  if (breakdown.engagementLevel < 40) {
    risks.push("Low engagement level indicates limited interest");
  }
  
  if (context.competitorMentions) {
    risks.push("Actively evaluating competitors - competitive situation");
  }
  
  if (context.companySize === 'startup') {
    risks.push("Startup - higher risk of budget constraints or business changes");
  }
  
  return risks;
}

/**
 * Generate opportunity insights
 */
function generateOpportunityInsights(context: any, breakdown: any, logger?: IMastraLogger): string[] {
  logger?.info('💡 [SalesOpportunity] Generating opportunity insights');
  
  const insights = [];
  
  if (breakdown.companyFit >= 80) {
    insights.push("Excellent company fit - strong alignment with ideal customer profile");
  }
  
  if (breakdown.engagementLevel >= 70) {
    insights.push("High engagement level indicates strong interest and buying intent");
  }
  
  if (context.painPoints && context.painPoints.length > 20) {
    insights.push("Clearly articulated pain points provide strong value proposition opportunity");
  }
  
  if (context.leadSource === 'referral') {
    insights.push("Referral source provides higher trust and conversion potential");
  }
  
  if (breakdown.timelineReadiness >= 80) {
    insights.push("Immediate timeline creates urgency and higher close probability");
  }
  
  insights.push(`Overall qualification score of ${breakdown.companyFit + breakdown.contactQuality + breakdown.engagementLevel + breakdown.budgetQualification + breakdown.timelineReadiness + breakdown.strategicValue} indicates strong sales potential`);
  
  return insights;
}

/**
 * Determine immediate next steps
 */
function determineNextSteps(priority: string, context: any, breakdown: any): string[] {
  const nextSteps = [];
  
  switch (priority) {
    case 'hot':
      nextSteps.push("Schedule discovery call within 24 hours");
      nextSteps.push("Research company background and recent developments");
      nextSteps.push("Prepare customized talking points and questions");
      break;
    case 'warm':
      nextSteps.push("Send personalized follow-up email within 48 hours");
      nextSteps.push("Connect on LinkedIn with relevant message");
      nextSteps.push("Share case study or relevant content");
      break;
    case 'cold':
      nextSteps.push("Add to nurturing sequence");
      nextSteps.push("Monitor for increased engagement");
      nextSteps.push("Plan re-qualification in 30 days");
      break;
    default:
      nextSteps.push("Add to long-term nurturing campaign");
      nextSteps.push("Provide educational content");
      nextSteps.push("Re-evaluate quarterly");
  }
  
  return nextSteps;
}

/**
 * Calculate estimated deal value
 */
function calculateEstimatedValue(context: any, breakdown: any): string {
  const budgetRangeValues = {
    'under-10k': 7500,
    '10k-50k': 30000,
    '50k-100k': 75000,
    '100k-500k': 300000,
    'over-500k': 750000
  };
  
  const baseValue = context.budgetRange ? 
    budgetRangeValues[context.budgetRange as keyof typeof budgetRangeValues] : 50000;
    
  // Adjust based on company size
  const sizeMultipliers = {
    'startup': 0.7,
    'small': 0.8,
    'medium': 1.0,
    'large': 1.3,
    'enterprise': 1.6
  };
  
  const multiplier = sizeMultipliers[context.companySize as keyof typeof sizeMultipliers] || 1.0;
  const estimatedValue = Math.round(baseValue * multiplier);
  
  return `$${estimatedValue.toLocaleString()}`;
}

/**
 * Calculate probability of closing deal
 */
function calculateCloseProbability(qualificationScore: number, breakdown: any): number {
  let probability = qualificationScore * 0.6; // Base on overall score
  
  // Adjust based on specific factors
  if (breakdown.timelineReadiness >= 80) probability += 10;
  if (breakdown.budgetQualification >= 80) probability += 10;
  if (breakdown.contactQuality >= 80) probability += 5;
  
  return Math.min(Math.round(probability), 95); // Cap at 95%
}