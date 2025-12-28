import { db } from '../db';
import { instagramAccounts, instagramPosts, instagramAnalytics, instagramTemplates, instagramComments, instagramCampaigns } from "../../shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { logger } from "../utils/logger";
import axios from "axios";
import crypto from "crypto";

const INSTAGRAM_API_BASE = "https://graph.instagram.com";
const FACEBOOK_API_BASE = "https://graph.facebook.com/v18.0";

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
  expires_in?: number;
}

interface InstagramMediaResponse {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  insights?: {
    data: Array<{
      name: string;
      values: Array<{ value: number }>;
    }>;
  };
}

export class InstagramService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.INSTAGRAM_APP_ID || "";
    this.clientSecret = process.env.INSTAGRAM_APP_SECRET || "";
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:5000/api/instagram/callback";
  }

  // OAuth Authentication Flow
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: "user_profile,user_media,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights",
      response_type: "code",
      state
    });
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    try {
      const response = await axios.post("https://api.instagram.com/oauth/access_token", {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
        code
      }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to exchange code for token:", error);
      throw new Error("Authentication failed");
    }
  }

  async getLongLivedToken(shortLivedToken: string): Promise<string> {
    try {
      const response = await axios.get(`${FACEBOOK_API_BASE}/access_token`, {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: this.clientSecret,
          access_token: shortLivedToken
        }
      });

      return response.data.access_token;
    } catch (error) {
      logger.error("Failed to get long-lived token:", error);
      throw new Error("Failed to get long-lived token");
    }
  }

  async refreshToken(accessToken: string): Promise<string> {
    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE}/refresh_access_token`, {
        params: {
          grant_type: "ig_refresh_token",
          access_token: accessToken
        }
      });

      return response.data.access_token;
    } catch (error) {
      logger.error("Failed to refresh token:", error);
      throw new Error("Failed to refresh token");
    }
  }

  // Account Management
  async saveAccount(userId: number, tokenData: InstagramTokenResponse, accessToken: string) {
    try {
      // Get user profile information
      const profileResponse = await axios.get(`${INSTAGRAM_API_BASE}/me`, {
        params: {
          fields: "id,username,account_type,media_count,followers_count,follows_count,profile_picture_url,biography,website",
          access_token: accessToken
        }
      });

      const profile = profileResponse.data;

      // Get long-lived token
      const longLivedToken = await this.getLongLivedToken(accessToken);

      // Calculate token expiry (60 days from now)
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 60);

      // Save or update account in database
      const existingAccount = await db.select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.instagramUserId, tokenData.user_id))
        .limit(1);

      if (existingAccount.length > 0) {
        // Update existing account
        await db.update(instagramAccounts)
          .set({
            accessToken: longLivedToken,
            username: profile.username,
            followersCount: profile.followers_count || 0,
            followingCount: profile.follows_count || 0,
            mediaCount: profile.media_count || 0,
            profilePictureUrl: profile.profile_picture_url,
            bio: profile.biography,
            isBusinessAccount: profile.account_type === 'BUSINESS',
            updatedAt: new Date()
          })
          .where(eq(instagramAccounts.instagramUserId, tokenData.user_id));
      } else {
        // Create new account
        await db.insert(instagramAccounts).values({
          userId,
          instagramUserId: tokenData.user_id,
          username: profile.username,
          accessToken: longLivedToken,
          followersCount: profile.followers_count || 0,
          followingCount: profile.follows_count || 0,
          mediaCount: profile.media_count || 0,
          profilePictureUrl: profile.profile_picture_url,
          bio: profile.biography,
          isBusinessAccount: profile.account_type === 'BUSINESS'
        });
      }

      return profile;
    } catch (error) {
      logger.error("Failed to save Instagram account:", error);
      throw new Error("Failed to save account");
    }
  }

  async getUserAccounts(userId: number) {
    return await db.select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.userId, userId));
  }

  async getAccountById(accountId: number) {
    const result = await db.select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.id, accountId))
      .limit(1);
    
    return result[0] || null;
  }

  // Content Management
  async getUserMedia(accountId: number, limit: number = 25) {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE}/me/media`, {
        params: {
          fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
          access_token: account.accessToken,
          limit
        }
      });

      return response.data.data;
    } catch (error) {
      logger.error("Failed to fetch user media:", error);
      throw new Error("Failed to fetch media");
    }
  }

  async createMediaContainer(accountId: number, mediaUrl: string, caption: string, mediaType: string = "IMAGE") {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const params: any = {
        access_token: account.accessToken,
        caption
      };

      if (mediaType === "IMAGE") {
        params.image_url = mediaUrl;
      } else if (mediaType === "VIDEO") {
        params.video_url = mediaUrl;
        params.media_type = "VIDEO";
      }

      const response = await axios.post(`${INSTAGRAM_API_BASE}/${account.instagramUserId}/media`, null, { params });

      return response.data.id;
    } catch (error) {
      logger.error("Failed to create media container:", error);
      throw new Error("Failed to create media container");
    }
  }

  async publishMedia(accountId: number, creationId: string) {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const response = await axios.post(`${INSTAGRAM_API_BASE}/${account.instagramUserId}/media_publish`, null, {
        params: {
          creation_id: creationId,
          access_token: account.accessToken
        }
      });

      return response.data.id;
    } catch (error) {
      logger.error("Failed to publish media:", error);
      throw new Error("Failed to publish media");
    }
  }

  async schedulePost(accountId: number, postData: any) {
    // Save scheduled post to database
    const result = await db.insert(instagramPosts).values({
      accountId: accountId,
      mediaType: postData.mediaType,
      mediaUrl: postData.mediaUrl,
      caption: postData.caption,
      hashtags: postData.hashtags || [],
      isScheduled: true,
      scheduledPublishTime: new Date(postData.scheduledAt)
    }).returning();

    return result[0];
  }

  async publishScheduledPosts() {
    // Get all scheduled posts that are due
    const now = new Date();
    const scheduledPosts = await db.select()
      .from(instagramPosts)
      .where(and(
        eq(instagramPosts.isScheduled, true),
        lte(instagramPosts.scheduledPublishTime, now)
      ));

    for (const post of scheduledPosts) {
      try {
        // Create and publish the post
        const creationId = await this.createMediaContainer(
          post.accountId,
          post.mediaUrl!,
          post.caption || "",
          post.mediaType || "IMAGE"
        );

        const mediaId = await this.publishMedia(post.accountId, creationId);

        // Update post status
        await db.update(instagramPosts)
          .set({
            instagramPostId: mediaId,
            isScheduled: false,
            publishedAt: new Date(),
            createdAt: new Date()
          })
          .where(eq(instagramPosts.id, post.id));

        logger.info(`Published scheduled post ${post.id}`);
      } catch (error) {
        logger.error(`Failed to publish scheduled post ${post.id}:`, error);
        
        // Update post status to failed
        await db.update(instagramPosts)
          .set({
            isScheduled: false,
            createdAt: new Date()
          })
          .where(eq(instagramPosts.id, post.id));
      }
    }
  }

  // Analytics
  async getMediaInsights(accountId: number, mediaId: string) {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE}/${mediaId}/insights`, {
        params: {
          metric: "impressions,reach,engagement,saved,shares",
          access_token: account.accessToken
        }
      });

      return response.data.data;
    } catch (error) {
      logger.error("Failed to fetch media insights:", error);
      throw new Error("Failed to fetch insights");
    }
  }

  async getAccountInsights(accountId: number, period: string = "day") {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE}/${account.instagramUserId}/insights`, {
        params: {
          metric: "impressions,reach,profile_views,follower_count,website_clicks",
          period,
          access_token: account.accessToken
        }
      });

      // Save analytics to database
      const metrics = response.data.data;
      const analyticsData: any = {
        accountId,
        date: new Date()
      };

      metrics.forEach((metric: any) => {
        switch (metric.name) {
          case "profile_views":
            analyticsData.profileViews = metric.values[0].value;
            break;
          case "website_clicks":
            analyticsData.websiteClicks = metric.values[0].value;
            break;
          case "impressions":
            analyticsData.totalImpressions = metric.values[0].value;
            break;
          case "reach":
            analyticsData.totalReach = metric.values[0].value;
            break;
        }
      });

      await db.insert(instagramAnalytics).values(analyticsData);

      return metrics;
    } catch (error) {
      logger.error("Failed to fetch account insights:", error);
      throw new Error("Failed to fetch account insights");
    }
  }

  // Comments Management
  async getMediaComments(accountId: number, mediaId: string) {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE}/${mediaId}/comments`, {
        params: {
          fields: "id,text,username,timestamp,like_count",
          access_token: account.accessToken
        }
      });

      return response.data.data;
    } catch (error) {
      logger.error("Failed to fetch comments:", error);
      throw new Error("Failed to fetch comments");
    }
  }

  async replyToComment(accountId: number, commentId: string, message: string) {
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    try {
      const response = await axios.post(`${INSTAGRAM_API_BASE}/${commentId}/replies`, null, {
        params: {
          message,
          access_token: account.accessToken
        }
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to reply to comment:", error);
      throw new Error("Failed to reply to comment");
    }
  }

  // Campaign Management
  async createCampaign(accountId: number, campaignData: any) {
    const result = await db.insert(instagramCampaigns).values({
      accountId,
      name: campaignData.name,
      description: campaignData.description,
      startDate: new Date(campaignData.startDate),
      endDate: campaignData.endDate ? new Date(campaignData.endDate) : undefined,
      status: "draft",
      goals: campaignData.goals || [],
      hashtags: campaignData.hashtags || [],
      targetAudience: campaignData.targetAudience,
      budget: campaignData.budget
    }).returning();

    return result[0];
  }

  async getCampaigns(accountId: number) {
    return await db.select()
      .from(instagramCampaigns)
      .where(eq(instagramCampaigns.accountId, accountId))
      .orderBy(desc(instagramCampaigns.createdAt));
  }

  async updateCampaignMetrics(campaignId: number) {
    const campaign = await db.select()
      .from(instagramCampaigns)
      .where(eq(instagramCampaigns.id, campaignId))
      .limit(1);

    if (!campaign[0]) return;

    // Get all posts within campaign date range
    const posts = await db.select()
      .from(instagramPosts)
      .where(and(
        eq(instagramPosts.accountId, campaign[0].accountId),
        gte(instagramPosts.publishedAt, campaign[0].startDate),
        campaign[0].endDate ? lte(instagramPosts.publishedAt, campaign[0].endDate) : undefined
      ));

    // Calculate metrics
    let totalReach = 0;
    let totalEngagement = 0;

    posts.forEach(post => {
      totalReach += post.reach || 0;
      totalEngagement += (post.likesCount || 0) + (post.commentsCount || 0) + (post.sharesCount || 0);
    });

    // Update campaign metrics
    await db.update(instagramCampaigns)
      .set({
        totalReach,
        totalEngagement,
        totalPosts: posts.length,
        updatedAt: new Date()
      })
      .where(eq(instagramCampaigns.id, campaignId));
  }

  // Template Management
  async createTemplate(templateData: any) {
    const result = await db.insert(instagramTemplates).values({
      name: templateData.name,
      category: templateData.category,
      captionTemplate: templateData.captionTemplate,
      hashtagSets: templateData.hashtags || [],
      variables: templateData.dynamicFields || [],
      mediaRequirements: templateData.mediaPlaceholder || {},
      isActive: true
    }).returning();

    return result[0];
  }

  async getTemplates() {
    return await db.select()
      .from(instagramTemplates)
      .where(eq(instagramTemplates.isActive, true))
      .orderBy(desc(instagramTemplates.useCount));
  }

  async applyTemplate(templateId: number, dynamicData: Record<string, any>) {
    const template = await db.select()
      .from(instagramTemplates)
      .where(eq(instagramTemplates.id, templateId))
      .limit(1);

    if (!template[0]) throw new Error("Template not found");

    let caption = template[0].captionTemplate || "";

    // Replace dynamic fields
    if (template[0].variables) {
      const variables = template[0].variables as any[];
      variables.forEach((field: any) => {
        const value = dynamicData[field.source] || "";
        caption = caption.replace(`{{${field.field}}}`, value);
      });
    }

    // Update usage count
    await db.update(instagramTemplates)
      .set({
        useCount: (template[0].useCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(instagramTemplates.id, templateId));

    return {
      caption,
      hashtags: template[0].hashtagSets,
      mediaRequirements: template[0].mediaRequirements
    };
  }
}

export const instagramService = new InstagramService();