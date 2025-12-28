import { Router } from "express";
import { instagramService } from "../services/instagram.service";
import { instagramSchedulerService } from "../services/instagram-scheduler.service";
import { instagramAnalyticsService } from "../services/instagram-analytics.service";
import { instagramContentAIService } from "../services/instagram-content-ai.service";
import { isAuthenticated } from "../core/auth/auth.service";
import { logger } from "../utils/logger";
import crypto from "crypto";
import { db } from '../db';
import { 
  instagramAccounts, 
  instagramPosts, 
  instagramAnalytics, 
  instagramTemplates, 
  instagramCampaigns,
  instagramStories,
  instagramReels,
  instagramInfluencers,
  instagramCompetitors,
  instagramABTests,
  instagramShoppingProducts
} from "../../shared/schema";
import { eq, desc, and, gte, gt, lte } from "drizzle-orm";

const router = Router();

// OAuth endpoints
router.get("/auth", isAuthenticated, (req: any, res) => {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");
    
    // Store state in session for verification
    req.session.instagramState = state;
    (req.session as any).userId = req.userId;
    
    const authUrl = instagramService.getAuthorizationUrl(state);
    res.json({ authUrl });
  } catch (error) {
    logger.error("Instagram auth error:", error);
    res.status(500).json({ error: "Failed to generate authorization URL" });
  }
});

router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Verify state to prevent CSRF attacks
    if (!state || state !== (req.session as any).instagramState) {
      return res.status(400).json({ error: "Invalid state parameter" });
    }
    
    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }
    
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    // Exchange code for token
    const tokenData = await instagramService.exchangeCodeForToken(code as string);
    
    // Save account to database
    const profile = await instagramService.saveAccount(userId, tokenData, tokenData.access_token);
    
    // Clean up session
    delete (req.session as any).instagramState;
    
    // Redirect to Instagram dashboard
    res.redirect("/dashboard/marketing/instagram?connected=true");
  } catch (error) {
    logger.error("Instagram callback error:", error);
    res.status(500).json({ error: "Failed to complete authentication" });
  }
});

// Demo/Test endpoint for development
router.get("/demo", async (req, res) => {
  try {
    // Fetch demo account and its data
    const [demoAccount] = await db
      .select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.username, "molochain_official"))
      .limit(1);
    
    if (demoAccount) {
      // Fetch analytics for the demo account
      const analytics = await db
        .select()
        .from(instagramAnalytics)
        .where(eq(instagramAnalytics.accountId, demoAccount.id))
        .orderBy(desc(instagramAnalytics.date))
        .limit(7);
      
      // Fetch templates
      const templates = await db
        .select()
        .from(instagramTemplates)
        .where(eq(instagramTemplates.isActive, true));
      
      res.json({
        account: demoAccount,
        analytics,
        templates,
        message: "Demo data loaded successfully"
      });
    } else {
      res.json({ 
        message: "No demo account found. Run the database seed script.",
        account: null,
        analytics: [],
        templates: []
      });
    }
  } catch (error) {
    logger.error("Failed to fetch demo data:", error);
    res.status(500).json({ error: "Failed to fetch demo data" });
  }
});

// Account management endpoints
router.get("/accounts", isAuthenticated, async (req: any, res) => {
  try {
    const accounts = await instagramService.getUserAccounts(req.userId);
    res.json(accounts);
  } catch (error) {
    logger.error("Failed to fetch accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.get("/accounts/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const account = await instagramService.getAccountById(parseInt(req.params.accountId));
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    logger.error("Failed to fetch account:", error);
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

router.post("/accounts/:accountId/refresh", isAuthenticated, async (req: any, res) => {
  try {
    const account = await instagramService.getAccountById(parseInt(req.params.accountId));
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    const newToken = await instagramService.refreshToken(account.accessToken);
    res.json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    logger.error("Failed to refresh token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Content management endpoints
router.get("/accounts/:accountId/media", isAuthenticated, async (req: any, res) => {
  try {
    const { limit = 25 } = req.query;
    const media = await instagramService.getUserMedia(
      parseInt(req.params.accountId),
      parseInt(limit as string)
    );
    res.json(media);
  } catch (error) {
    logger.error("Failed to fetch media:", error);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

router.post("/accounts/:accountId/posts", isAuthenticated, async (req: any, res) => {
  try {
    const { mediaUrl, caption, mediaType = "IMAGE", scheduledAt } = req.body;
    const accountId = parseInt(req.params.accountId);
    
    if (scheduledAt) {
      // Schedule the post
      const scheduledPost = await instagramService.schedulePost(accountId, {
        mediaType,
        mediaUrl,
        caption,
        hashtags: extractHashtags(caption),
        scheduledAt
      });
      res.json({ success: true, post: scheduledPost });
    } else {
      // Publish immediately
      const creationId = await instagramService.createMediaContainer(
        accountId,
        mediaUrl,
        caption,
        mediaType
      );
      const mediaId = await instagramService.publishMedia(accountId, creationId);
      
      // Save post to database
      const post = await db.insert(instagramPosts).values({
        accountId,
        postId: mediaId,
        mediaType,
        mediaUrl,
        caption,
        hashtags: extractHashtags(caption),
        status: "published",
        publishedAt: new Date()
      }).returning();
      
      res.json({ success: true, post: post[0] });
    }
  } catch (error) {
    logger.error("Failed to create post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/posts", isAuthenticated, async (req: any, res) => {
  try {
    const { status, accountId, limit = 50 } = req.query;
    
    const conditions = [];
    if (status) {
      conditions.push(eq(instagramPosts.status, status as string));
    }
    if (accountId) {
      conditions.push(eq(instagramPosts.accountId, parseInt(accountId as string)));
    }
    
    const posts = conditions.length > 0
      ? await db.select()
          .from(instagramPosts)
          .where(and(...conditions))
          .orderBy(desc(instagramPosts.createdAt))
          .limit(parseInt(limit as string))
      : await db.select()
          .from(instagramPosts)
          .orderBy(desc(instagramPosts.createdAt))
          .limit(parseInt(limit as string));
    
    res.json(posts);
  } catch (error) {
    logger.error("Failed to fetch posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.patch("/posts/:postId", isAuthenticated, async (req: any, res) => {
  try {
    const { status, caption, scheduledAt } = req.body;
    const updateData: any = { updatedAt: new Date() };
    
    if (status) updateData.status = status;
    if (caption) {
      updateData.caption = caption;
      updateData.hashtags = extractHashtags(caption);
    }
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    
    const result = await db.update(instagramPosts)
      .set(updateData)
      .where(eq(instagramPosts.id, parseInt(req.params.postId)))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    logger.error("Failed to update post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/posts/:postId", isAuthenticated, async (req: any, res) => {
  try {
    await db.update(instagramPosts)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(instagramPosts.id, parseInt(req.params.postId)));
    
    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Analytics endpoints
router.get("/accounts/:accountId/insights", isAuthenticated, async (req: any, res) => {
  try {
    const { period = "day" } = req.query;
    const insights = await instagramService.getAccountInsights(
      parseInt(req.params.accountId),
      period as string
    );
    res.json(insights);
  } catch (error) {
    logger.error("Failed to fetch insights:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

router.get("/accounts/:accountId/analytics", isAuthenticated, async (req: any, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const accountId = parseInt(req.params.accountId);
    
    const conditions = [eq(instagramAnalytics.accountId, accountId)];
    if (startDate) {
      conditions.push(gte(instagramAnalytics.date, new Date(startDate as string)));
    }
    
    const analytics = await db.select()
      .from(instagramAnalytics)
      .where(and(...conditions))
      .orderBy(desc(instagramAnalytics.date))
      .limit(parseInt(limit as string));
    
    res.json(analytics);
  } catch (error) {
    logger.error("Failed to fetch analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/media/:mediaId/insights", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: "Account ID required" });
    }
    
    const insights = await instagramService.getMediaInsights(
      parseInt(accountId as string),
      req.params.mediaId
    );
    res.json(insights);
  } catch (error) {
    logger.error("Failed to fetch media insights:", error);
    res.status(500).json({ error: "Failed to fetch media insights" });
  }
});

// Comments management endpoints
router.get("/media/:mediaId/comments", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: "Account ID required" });
    }
    
    const comments = await instagramService.getMediaComments(
      parseInt(accountId as string),
      req.params.mediaId
    );
    res.json(comments);
  } catch (error) {
    logger.error("Failed to fetch comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/comments/:commentId/reply", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, message } = req.body;
    if (!accountId || !message) {
      return res.status(400).json({ error: "Account ID and message required" });
    }
    
    const reply = await instagramService.replyToComment(
      accountId,
      req.params.commentId,
      message
    );
    res.json({ success: true, reply });
  } catch (error) {
    logger.error("Failed to reply to comment:", error);
    res.status(500).json({ error: "Failed to reply to comment" });
  }
});

// Template management endpoints
router.get("/templates", isAuthenticated, async (req: any, res) => {
  try {
    const templates = await instagramService.getTemplates();
    res.json(templates);
  } catch (error) {
    logger.error("Failed to fetch templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

router.post("/templates", isAuthenticated, async (req: any, res) => {
  try {
    const template = await instagramService.createTemplate(req.body);
    res.json(template);
  } catch (error) {
    logger.error("Failed to create template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

router.post("/templates/:templateId/apply", isAuthenticated, async (req: any, res) => {
  try {
    const { dynamicData } = req.body;
    const content = await instagramService.applyTemplate(
      parseInt(req.params.templateId),
      dynamicData || {}
    );
    res.json(content);
  } catch (error) {
    logger.error("Failed to apply template:", error);
    res.status(500).json({ error: "Failed to apply template" });
  }
});

router.delete("/templates/:templateId", isAuthenticated, async (req: any, res) => {
  try {
    await db.update(instagramTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(instagramTemplates.id, parseInt(req.params.templateId)));
    
    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// Campaign management endpoints
router.get("/campaigns", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: "Account ID required" });
    }
    
    const campaigns = await instagramService.getCampaigns(parseInt(accountId as string));
    res.json(campaigns);
  } catch (error) {
    logger.error("Failed to fetch campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.post("/campaigns", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, ...campaignData } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: "Account ID required" });
    }
    
    const campaign = await instagramService.createCampaign(accountId, campaignData);
    res.json(campaign);
  } catch (error) {
    logger.error("Failed to create campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

router.patch("/campaigns/:campaignId", isAuthenticated, async (req: any, res) => {
  try {
    const updateData: any = { updatedAt: new Date() };
    
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
    if (req.body.goals) updateData.goals = req.body.goals;
    if (req.body.hashtags) updateData.hashtags = req.body.hashtags;
    if (req.body.budget) updateData.budget = req.body.budget;
    
    const result = await db.update(instagramCampaigns)
      .set(updateData)
      .where(eq(instagramCampaigns.id, parseInt(req.params.campaignId)))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    logger.error("Failed to update campaign:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});

router.post("/campaigns/:campaignId/refresh-metrics", isAuthenticated, async (req: any, res) => {
  try {
    await instagramService.updateCampaignMetrics(parseInt(req.params.campaignId));
    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to refresh campaign metrics:", error);
    res.status(500).json({ error: "Failed to refresh metrics" });
  }
});

// ============ ENHANCED FEATURES ENDPOINTS ============

// Schedule a post
router.post("/posts/schedule", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, content, scheduledAt, mediaUrl, hashtags } = req.body;
    
    const postId = await instagramSchedulerService.schedulePost(
      accountId,
      content,
      new Date(scheduledAt),
      mediaUrl,
      hashtags
    );
    
    res.json({ success: true, postId });
  } catch (error) {
    logger.error("Failed to schedule post:", error);
    res.status(500).json({ error: "Failed to schedule post" });
  }
});

// Get scheduled posts
router.get("/posts/scheduled/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const posts = await instagramSchedulerService.getScheduledPosts(
      parseInt(req.params.accountId)
    );
    res.json(posts);
  } catch (error) {
    logger.error("Failed to get scheduled posts:", error);
    res.status(500).json({ error: "Failed to get scheduled posts" });
  }
});

// Cancel scheduled post
router.delete("/posts/scheduled/:postId", isAuthenticated, async (req: any, res) => {
  try {
    await instagramSchedulerService.cancelScheduledPost(
      parseInt(req.params.postId)
    );
    res.json({ success: true });
  } catch (error) {
    logger.error("Failed to cancel post:", error);
    res.status(500).json({ error: "Failed to cancel post" });
  }
});

// Generate AI content
router.post("/content/generate", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, topic, contentType } = req.body;
    
    const content = await instagramContentAIService.generateContent(
      accountId,
      topic,
      contentType || 'educational'
    );
    
    res.json(content);
  } catch (error) {
    logger.error("Failed to generate content:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Generate content calendar
router.post("/content/calendar", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, days, postsPerWeek } = req.body;
    
    const calendar = await instagramContentAIService.generateContentCalendar(
      accountId,
      days || 30,
      postsPerWeek || 5
    );
    
    res.json(calendar);
  } catch (error) {
    logger.error("Failed to generate calendar:", error);
    res.status(500).json({ error: "Failed to generate calendar" });
  }
});

// Improve content with AI
router.post("/content/improve", isAuthenticated, async (req: any, res) => {
  try {
    const { content } = req.body;
    const improved = await instagramContentAIService.improveContent(content);
    res.json({ improvedContent: improved });
  } catch (error) {
    logger.error("Failed to improve content:", error);
    res.status(500).json({ error: "Failed to improve content" });
  }
});

// Get engagement rate
router.get("/analytics/engagement/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const engagementRate = await instagramAnalyticsService.calculateEngagementRate(
      parseInt(req.params.accountId)
    );
    res.json({ engagementRate });
  } catch (error) {
    logger.error("Failed to get engagement rate:", error);
    res.status(500).json({ error: "Failed to get engagement rate" });
  }
});

// Get top performing content
router.get("/analytics/top-content/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const topContent = await instagramAnalyticsService.getTopPerformingContent(
      parseInt(req.params.accountId),
      parseInt(req.query.limit as string) || 10
    );
    res.json(topContent);
  } catch (error) {
    logger.error("Failed to get top content:", error);
    res.status(500).json({ error: "Failed to get top content" });
  }
});

// Analyze hashtag performance
router.get("/analytics/hashtags/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const hashtagPerformance = await instagramAnalyticsService.analyzeHashtagPerformance(
      parseInt(req.params.accountId)
    );
    res.json(hashtagPerformance);
  } catch (error) {
    logger.error("Failed to analyze hashtags:", error);
    res.status(500).json({ error: "Failed to analyze hashtags" });
  }
});

// Get account growth metrics
router.get("/analytics/growth/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const growth = await instagramAnalyticsService.getAccountGrowth(
      parseInt(req.params.accountId),
      parseInt(req.query.days as string) || 30
    );
    res.json(growth);
  } catch (error) {
    logger.error("Failed to get growth metrics:", error);
    res.status(500).json({ error: "Failed to get growth metrics" });
  }
});

// Get competitor analysis
router.get("/analytics/competitors/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const analysis = await instagramAnalyticsService.getCompetitorAnalysis(
      parseInt(req.params.accountId)
    );
    res.json(analysis);
  } catch (error) {
    logger.error("Failed to get competitor analysis:", error);
    res.status(500).json({ error: "Failed to get competitor analysis" });
  }
});

// Generate performance report
router.get("/analytics/report/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const report = await instagramAnalyticsService.generatePerformanceReport(
      parseInt(req.params.accountId)
    );
    res.json(report);
  } catch (error) {
    logger.error("Failed to generate report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Analyze content for optimization
router.post("/analytics/analyze-content", isAuthenticated, async (req: any, res) => {
  try {
    const { content } = req.body;
    const analysis = await instagramAnalyticsService.analyzeContent(content);
    res.json(analysis);
  } catch (error) {
    logger.error("Failed to analyze content:", error);
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

// Create AI template
router.post("/templates/ai", isAuthenticated, async (req: any, res) => {
  try {
    const { name, category, baseContent } = req.body;
    
    const templateId = await instagramContentAIService.createAITemplate(
      name,
      category,
      baseContent
    );
    
    res.json({ success: true, templateId });
  } catch (error) {
    logger.error("Failed to create AI template:", error);
    res.status(500).json({ error: "Failed to create AI template" });
  }
});

// Get advanced competitor insights
router.get("/competitors/:accountId/insights", isAuthenticated, async (req: any, res) => {
  try {
    const insights = await instagramContentAIService.analyzeCompetitors(
      parseInt(req.params.accountId)
    );
    res.json(insights);
  } catch (error) {
    logger.error("Failed to get competitor insights:", error);
    res.status(500).json({ error: "Failed to get competitor insights" });
  }
});

// Predict engagement for content
router.post("/engagement/predict", isAuthenticated, async (req: any, res) => {
  try {
    const { content, hashtags, postTime } = req.body;
    
    const prediction = await instagramContentAIService.predictEngagement(
      content,
      hashtags || [],
      new Date(postTime || Date.now())
    );
    
    res.json(prediction);
  } catch (error) {
    logger.error("Failed to predict engagement:", error);
    res.status(500).json({ error: "Failed to predict engagement" });
  }
});

// Generate automated response for comment
router.post("/comments/generate-response", isAuthenticated, async (req: any, res) => {
  try {
    const { commentText, sentiment } = req.body;
    
    const response = await instagramContentAIService.generateAutomatedResponse(
      commentText,
      sentiment || 'neutral'
    );
    
    res.json({ response });
  } catch (error) {
    logger.error("Failed to generate response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Get performance optimization recommendations
router.get("/recommendations/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const competitors = await instagramContentAIService.analyzeCompetitors(
      parseInt(req.params.accountId)
    );
    
    const recommendations = {
      contentStrategy: competitors.contentStrategies,
      bestTimes: competitors.bestPostingTimes,
      trendingHashtags: competitors.topHashtags,
      targetEngagement: competitors.engagementRate,
      actionItems: [
        "Post during peak engagement hours",
        "Use 10-15 relevant hashtags per post",
        "Engage with comments within first hour",
        "Maintain consistent posting schedule",
        "Include calls-to-action in captions"
      ]
    };
    
    res.json(recommendations);
  } catch (error) {
    logger.error("Failed to get recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// ============ ADVANCED FEATURES ENDPOINTS ============

// Stories endpoints
router.get("/stories/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const { limit = 20, active = true } = req.query;
    const conditions = [eq(instagramStories.accountId, parseInt(req.params.accountId))];
    
    if (active === 'true') {
      conditions.push(gt(instagramStories.expiresAt, new Date()));
    }
    
    const stories = await db.select()
      .from(instagramStories)
      .where(and(...conditions))
      .orderBy(desc(instagramStories.createdAt))
      .limit(parseInt(limit as string));
    
    res.json(stories);
  } catch (error) {
    logger.error("Failed to fetch stories:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

router.post("/stories", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, mediaUrl, mediaType, caption, scheduledAt } = req.body;
    
    const story = await db.insert(instagramStories).values({
      accountId,
      mediaUrl,
      mediaType: mediaType || 'IMAGE',
      caption,
      isScheduled: !!scheduledAt,
      scheduledPublishTime: scheduledAt ? new Date(scheduledAt) : null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date()
    }).returning();
    
    res.json({ success: true, story: story[0] });
  } catch (error) {
    logger.error("Failed to create story:", error);
    res.status(500).json({ error: "Failed to create story" });
  }
});

// Reels endpoints
router.get("/reels/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const reels = await db.select()
      .from(instagramReels)
      .where(eq(instagramReels.accountId, parseInt(req.params.accountId)))
      .orderBy(desc(instagramReels.createdAt))
      .limit(parseInt(limit as string));
    
    res.json(reels);
  } catch (error) {
    logger.error("Failed to fetch reels:", error);
    res.status(500).json({ error: "Failed to fetch reels" });
  }
});

router.post("/reels", isAuthenticated, async (req: any, res) => {
  try {
    const { accountId, videoUrl, thumbnailUrl, caption, hashtags, duration, audioTrack } = req.body;
    
    const reel = await db.insert(instagramReels).values({
      accountId,
      videoUrl,
      thumbnailUrl,
      caption,
      hashtags: hashtags || [],
      duration: duration || 30,
      audioTrack: audioTrack || null,
      createdAt: new Date()
    }).returning();
    
    res.json({ success: true, reel: reel[0] });
  } catch (error) {
    logger.error("Failed to create reel:", error);
    res.status(500).json({ error: "Failed to create reel" });
  }
});

router.get("/reels/trending-audio", isAuthenticated, async (req: any, res) => {
  try {
    // Return trending audio tracks for reels
    const trendingAudio = [
      { id: 'audio_1', name: 'Trending Track 1', uses: 125000, genre: 'Pop' },
      { id: 'audio_2', name: 'Trending Track 2', uses: 98000, genre: 'Electronic' },
      { id: 'audio_3', name: 'Trending Track 3', uses: 76000, genre: 'Hip Hop' }
    ];
    res.json(trendingAudio);
  } catch (error) {
    logger.error("Failed to fetch trending audio:", error);
    res.status(500).json({ error: "Failed to fetch trending audio" });
  }
});

// Influencers endpoints
router.get("/influencers/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const { category, minFollowers, maxFollowers, status } = req.query;
    const conditions = [eq(instagramInfluencers.accountId, parseInt(req.params.accountId))];
    
    if (category) {
      conditions.push(eq(instagramInfluencers.category, category as string));
    }
    if (minFollowers) {
      conditions.push(gte(instagramInfluencers.followersCount, parseInt(minFollowers as string)));
    }
    if (maxFollowers) {
      conditions.push(lte(instagramInfluencers.followersCount, parseInt(maxFollowers as string)));
    }
    if (status) {
      conditions.push(eq(instagramInfluencers.collaborationStatus, status as string));
    }
    
    const influencers = await db.select()
      .from(instagramInfluencers)
      .where(and(...conditions))
      .orderBy(desc(instagramInfluencers.engagementRate));
    
    res.json(influencers);
  } catch (error) {
    logger.error("Failed to fetch influencers:", error);
    res.status(500).json({ error: "Failed to fetch influencers" });
  }
});

router.post("/influencers", isAuthenticated, async (req: any, res) => {
  try {
    const influencer = await db.insert(instagramInfluencers).values({
      ...req.body,
      createdAt: new Date()
    }).returning();
    
    res.json({ success: true, influencer: influencer[0] });
  } catch (error) {
    logger.error("Failed to add influencer:", error);
    res.status(500).json({ error: "Failed to add influencer" });
  }
});

router.patch("/influencers/:influencerId", isAuthenticated, async (req: any, res) => {
  try {
    const result = await db.update(instagramInfluencers)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(instagramInfluencers.id, parseInt(req.params.influencerId)))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    logger.error("Failed to update influencer:", error);
    res.status(500).json({ error: "Failed to update influencer" });
  }
});

// Competitors endpoints
router.get("/competitors/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const competitors = await db.select()
      .from(instagramCompetitors)
      .where(eq(instagramCompetitors.accountId, parseInt(req.params.accountId)))
      .orderBy(desc(instagramCompetitors.followersCount));
    
    res.json(competitors);
  } catch (error) {
    logger.error("Failed to fetch competitors:", error);
    res.status(500).json({ error: "Failed to fetch competitors" });
  }
});

router.post("/competitors", isAuthenticated, async (req: any, res) => {
  try {
    const competitor = await db.insert(instagramCompetitors).values({
      ...req.body,
      trackingEnabled: true,
      createdAt: new Date()
    }).returning();
    
    res.json({ success: true, competitor: competitor[0] });
  } catch (error) {
    logger.error("Failed to add competitor:", error);
    res.status(500).json({ error: "Failed to add competitor" });
  }
});

router.get("/competitors/:accountId/insights", isAuthenticated, async (req: any, res) => {
  try {
    const competitors = await db.select()
      .from(instagramCompetitors)
      .where(eq(instagramCompetitors.accountId, parseInt(req.params.accountId)));
    
    const insights = {
      totalCompetitors: competitors.length,
      averageFollowers: competitors.reduce((sum, c) => sum + c.followersCount, 0) / competitors.length,
      averageEngagement: competitors.reduce((sum, c) => sum + c.averageEngagement, 0) / competitors.length,
      topPerformer: competitors.sort((a, b) => b.averageEngagement - a.averageEngagement)[0],
      recommendations: [
        "Increase posting frequency to match top competitors",
        "Focus on video content (Reels) for higher engagement",
        "Analyze competitor hashtag strategies"
      ]
    };
    
    res.json(insights);
  } catch (error) {
    logger.error("Failed to get competitor insights:", error);
    res.status(500).json({ error: "Failed to get competitor insights" });
  }
});

// A/B Testing endpoints
router.get("/ab-tests/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const { status = 'active' } = req.query;
    const conditions = [eq(instagramABTests.accountId, parseInt(req.params.accountId))];
    
    if (status) {
      conditions.push(eq(instagramABTests.status, status as string));
    }
    
    const tests = await db.select()
      .from(instagramABTests)
      .where(and(...conditions))
      .orderBy(desc(instagramABTests.createdAt));
    
    res.json(tests);
  } catch (error) {
    logger.error("Failed to fetch A/B tests:", error);
    res.status(500).json({ error: "Failed to fetch A/B tests" });
  }
});

router.post("/ab-tests", isAuthenticated, async (req: any, res) => {
  try {
    const test = await db.insert(instagramABTests).values({
      ...req.body,
      status: 'active',
      createdAt: new Date()
    }).returning();
    
    res.json({ success: true, test: test[0] });
  } catch (error) {
    logger.error("Failed to create A/B test:", error);
    res.status(500).json({ error: "Failed to create A/B test" });
  }
});

router.get("/ab-tests/:testId/results", isAuthenticated, async (req: any, res) => {
  try {
    const test = await db.select()
      .from(instagramABTests)
      .where(eq(instagramABTests.id, parseInt(req.params.testId)))
      .limit(1);
    
    if (!test[0]) {
      return res.status(404).json({ error: "Test not found" });
    }
    
    const results = {
      testId: test[0].id,
      testName: test[0].testName,
      status: test[0].status,
      winner: test[0].winner || 'Test in progress',
      variantAPerformance: test[0].variantAMetrics || {},
      variantBPerformance: test[0].variantBMetrics || {},
      confidence: test[0].confidenceLevel || 0,
      recommendation: test[0].winner ? `Use ${test[0].winner}` : 'Continue testing'
    };
    
    res.json(results);
  } catch (error) {
    logger.error("Failed to get test results:", error);
    res.status(500).json({ error: "Failed to get test results" });
  }
});

// Shopping endpoints
router.get("/shopping/:accountId", isAuthenticated, async (req: any, res) => {
  try {
    const { isActive = true } = req.query;
    const conditions = [eq(instagramShoppingProducts.accountId, parseInt(req.params.accountId))];
    
    if (isActive === 'true') {
      conditions.push(eq(instagramShoppingProducts.isActive, true));
    }
    
    const products = await db.select()
      .from(instagramShoppingProducts)
      .where(and(...conditions))
      .orderBy(desc(instagramShoppingProducts.createdAt));
    
    res.json(products);
  } catch (error) {
    logger.error("Failed to fetch shopping products:", error);
    res.status(500).json({ error: "Failed to fetch shopping products" });
  }
});

router.post("/shopping", isAuthenticated, async (req: any, res) => {
  try {
    const product = await db.insert(instagramShoppingProducts).values({
      ...req.body,
      isActive: true,
      createdAt: new Date()
    }).returning();
    
    res.json({ success: true, product: product[0] });
  } catch (error) {
    logger.error("Failed to add shopping product:", error);
    res.status(500).json({ error: "Failed to add shopping product" });
  }
});

router.patch("/shopping/:productId", isAuthenticated, async (req: any, res) => {
  try {
    const result = await db.update(instagramShoppingProducts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(instagramShoppingProducts.id, parseInt(req.params.productId)))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    logger.error("Failed to update product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.get("/shopping/:productId/performance", isAuthenticated, async (req: any, res) => {
  try {
    const product = await db.select()
      .from(instagramShoppingProducts)
      .where(eq(instagramShoppingProducts.id, parseInt(req.params.productId)))
      .limit(1);
    
    if (!product[0]) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const performance = {
      productId: product[0].id,
      productName: product[0].name,
      clicks: product[0].clicksCount || 0,
      purchases: product[0].purchasesCount || 0,
      revenue: product[0].revenue || 0,
      conversionRate: product[0].clicksCount ? 
        ((product[0].purchasesCount || 0) / product[0].clicksCount * 100).toFixed(2) + '%' : '0%',
      postsTagged: product[0].postsTagged || 0
    };
    
    res.json(performance);
  } catch (error) {
    logger.error("Failed to get product performance:", error);
    res.status(500).json({ error: "Failed to get product performance" });
  }
});

// Helper function to extract hashtags from caption
function extractHashtags(caption: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = caption.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}

export default router;