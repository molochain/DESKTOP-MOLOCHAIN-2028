import { db } from '../db';
import { instagramStories, instagramAccounts } from '../../shared/schema';
import { eq, and, desc, lte, gte, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export class InstagramStoriesService {
  private accessToken: string;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.facebook.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Create and schedule a story
  async createStory(data: {
    accountId: number;
    mediaType: 'photo' | 'video';
    mediaUrl: string;
    caption?: string;
    stickers?: any;
    mentions?: string[];
    location?: any;
    scheduledPublishTime?: Date;
  }) {
    try {
      const story = await db.insert(instagramStories).values({
        accountId: data.accountId,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        caption: data.caption,
        stickers: data.stickers,
        mentions: data.mentions,
        location: data.location,
        isScheduled: !!data.scheduledPublishTime,
        scheduledPublishTime: data.scheduledPublishTime,
        createdAt: new Date(),
      }).returning();

      logger.info(`Story created: ${story[0].id}`);
      return story[0];
    } catch (error) {
      logger.error('Error creating story:', error);
      throw error;
    }
  }

  // Publish a story to Instagram
  async publishStory(storyId: number) {
    try {
      const story = await db.select()
        .from(instagramStories)
        .where(eq(instagramStories.id, storyId))
        .limit(1);

      if (!story[0]) {
        throw new Error('Story not found');
      }

      const account = await db.select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, story[0].accountId))
        .limit(1);

      if (!account[0]) {
        throw new Error('Instagram account not found');
      }

      // Create media container for story
      const mediaResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${account[0].instagramUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: story[0].mediaType?.toUpperCase(),
            image_url: story[0].mediaUrl,
            caption: story[0].caption,
            access_token: this.accessToken,
            media_product_type: 'STORY',
          }),
        }
      );

      const mediaData = await mediaResponse.json();

      if (mediaData.error) {
        throw new Error(mediaData.error.message);
      }

      // Publish the story
      const publishResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${account[0].instagramUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: mediaData.id,
            access_token: this.accessToken,
          }),
        }
      );

      const publishData = await publishResponse.json();

      if (publishData.error) {
        throw new Error(publishData.error.message);
      }

      // Update story with Instagram ID and publish time
      await db.update(instagramStories)
        .set({
          storyId: publishData.id,
          publishedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Stories expire after 24 hours
          isScheduled: false,
        })
        .where(eq(instagramStories.id, storyId));

      logger.info(`Story published: ${publishData.id}`);
      return publishData;
    } catch (error) {
      logger.error('Error publishing story:', error);
      throw error;
    }
  }

  // Get scheduled stories
  async getScheduledStories(accountId?: number) {
    try {
      const now = new Date();
      const query = accountId
        ? and(
            eq(instagramStories.accountId, accountId),
            eq(instagramStories.isScheduled, true),
            lte(instagramStories.scheduledPublishTime, now)
          )
        : and(
            eq(instagramStories.isScheduled, true),
            lte(instagramStories.scheduledPublishTime, now)
          );

      const stories = await db.select()
        .from(instagramStories)
        .where(query)
        .orderBy(instagramStories.scheduledPublishTime);

      return stories;
    } catch (error) {
      logger.error('Error fetching scheduled stories:', error);
      throw error;
    }
  }

  // Get story analytics
  async getStoryAnalytics(storyId: string) {
    try {
      const metrics = [
        'impressions',
        'reach',
        'replies',
        'exits',
        'taps_forward',
        'taps_back',
      ].join(',');

      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${storyId}/insights?metric=${metrics}&access_token=${this.accessToken}`
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Parse insights data
      const analytics: any = {};
      data.data?.forEach((metric: any) => {
        analytics[metric.name] = metric.values[0]?.value || 0;
      });

      // Update story with analytics
      await db.update(instagramStories)
        .set({
          impressions: analytics.impressions,
          reach: analytics.reach,
          repliesCount: analytics.replies,
          exitsCount: analytics.exits,
          tapsForward: analytics.taps_forward,
          tapsBack: analytics.taps_back,
        })
        .where(eq(instagramStories.storyId, storyId));

      return analytics;
    } catch (error) {
      logger.error('Error fetching story analytics:', error);
      throw error;
    }
  }

  // Create story highlight
  async createHighlight(data: {
    accountId: number;
    name: string;
    storyIds: number[];
  }) {
    try {
      // Mark stories as highlights
      await db.update(instagramStories)
        .set({
          isHighlight: true,
          highlightName: data.name,
        })
        .where(
          and(
            eq(instagramStories.accountId, data.accountId),
            sql`${instagramStories.id} = ANY(${data.storyIds})`
          )
        );

      logger.info(`Highlight created: ${data.name}`);
      return { success: true, highlightName: data.name };
    } catch (error) {
      logger.error('Error creating highlight:', error);
      throw error;
    }
  }

  // Get story performance metrics
  async getStoryPerformance(accountId: number, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stories = await db.select({
        totalStories: sql<number>`count(*)`,
        totalViews: sql<number>`sum(${instagramStories.viewsCount})`,
        totalReach: sql<number>`sum(${instagramStories.reach})`,
        avgCompletionRate: sql<number>`avg(100.0 - (${instagramStories.exitsCount}::float / NULLIF(${instagramStories.viewsCount}, 0) * 100))`,
        totalReplies: sql<number>`sum(${instagramStories.repliesCount})`,
      })
        .from(instagramStories)
        .where(
          and(
            eq(instagramStories.accountId, accountId),
            gte(instagramStories.publishedAt, startDate)
          )
        );

      return stories[0] || {
        totalStories: 0,
        totalViews: 0,
        totalReach: 0,
        avgCompletionRate: 0,
        totalReplies: 0,
      };
    } catch (error) {
      logger.error('Error fetching story performance:', error);
      throw error;
    }
  }

  // Auto-publish scheduled stories
  async autoPublishScheduledStories() {
    try {
      const scheduledStories = await this.getScheduledStories();
      
      for (const story of scheduledStories) {
        try {
          await this.publishStory(story.id);
          logger.info(`Auto-published story: ${story.id}`);
        } catch (error) {
          logger.error(`Failed to auto-publish story ${story.id}:`, error);
        }
      }

      return {
        published: scheduledStories.length,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in auto-publish stories:', error);
      throw error;
    }
  }

  // Get trending story formats
  async getTrendingStoryFormats() {
    return {
      formats: [
        {
          name: 'Behind the Scenes',
          description: 'Show warehouse operations, packing process, or team at work',
          engagementRate: 8.5,
          bestTime: '11:00 AM',
          tips: ['Keep it authentic', 'Add music', 'Use polls for engagement'],
        },
        {
          name: 'Product Showcase',
          description: 'Highlight new logistics services or blockchain features',
          engagementRate: 7.2,
          bestTime: '2:00 PM',
          tips: ['Use tap-to-reveal', 'Add product stickers', 'Include swipe-up links'],
        },
        {
          name: 'Quick Tips',
          description: 'Share logistics tips or blockchain insights',
          engagementRate: 9.1,
          bestTime: '9:00 AM',
          tips: ['Keep under 15 seconds', 'Use text overlays', 'Add value quickly'],
        },
        {
          name: 'User Testimonials',
          description: 'Share customer success stories and reviews',
          engagementRate: 8.8,
          bestTime: '6:00 PM',
          tips: ['Use customer quotes', 'Show real results', 'Add company logo'],
        },
        {
          name: 'Day in the Life',
          description: 'Follow a shipment journey or blockchain transaction',
          engagementRate: 7.9,
          bestTime: '12:00 PM',
          tips: ['Create a series', 'Use timestamps', 'Show progress updates'],
        },
      ],
    };
  }
}

export default InstagramStoriesService;