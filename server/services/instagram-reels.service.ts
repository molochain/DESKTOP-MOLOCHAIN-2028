import { db } from '../db';
import { instagramReels, instagramAccounts } from '../../shared/schema';
import { eq, and, desc, lte, gte, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export class InstagramReelsService {
  private accessToken: string;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.facebook.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Create and schedule a reel
  async createReel(data: {
    accountId: number;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    hashtags?: string[];
    audioTrack?: any;
    effects?: string[];
    duration?: number;
    scheduledPublishTime?: Date;
  }) {
    try {
      const reel = await db.insert(instagramReels).values({
        accountId: data.accountId,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        caption: data.caption,
        hashtags: data.hashtags,
        audioTrack: data.audioTrack,
        effects: data.effects,
        duration: data.duration,
        isScheduled: !!data.scheduledPublishTime,
        scheduledPublishTime: data.scheduledPublishTime,
        createdAt: new Date(),
      }).returning();

      logger.info(`Reel created: ${reel[0].id}`);
      return reel[0];
    } catch (error) {
      logger.error('Error creating reel:', error);
      throw error;
    }
  }

  // Publish a reel to Instagram
  async publishReel(reelId: number) {
    try {
      const reel = await db.select()
        .from(instagramReels)
        .where(eq(instagramReels.id, reelId))
        .limit(1);

      if (!reel[0]) {
        throw new Error('Reel not found');
      }

      const account = await db.select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, reel[0].accountId))
        .limit(1);

      if (!account[0]) {
        throw new Error('Instagram account not found');
      }

      // Create media container for reel
      const mediaResponse = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${account[0].instagramUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'REELS',
            video_url: reel[0].videoUrl,
            caption: reel[0].caption,
            access_token: this.accessToken,
            share_to_feed: true,
            thumb_offset: 0,
          }),
        }
      );

      const mediaData = await mediaResponse.json();

      if (mediaData.error) {
        throw new Error(mediaData.error.message);
      }

      // Publish the reel
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

      // Update reel with Instagram ID and publish time
      await db.update(instagramReels)
        .set({
          reelId: publishData.id,
          publishedAt: new Date(),
          isScheduled: false,
        })
        .where(eq(instagramReels.id, reelId));

      logger.info(`Reel published: ${publishData.id}`);
      return publishData;
    } catch (error) {
      logger.error('Error publishing reel:', error);
      throw error;
    }
  }

  // Get reel analytics
  async getReelAnalytics(reelId: string) {
    try {
      const metrics = [
        'plays',
        'likes',
        'comments',
        'shares',
        'saved',
        'reach',
        'impressions',
      ].join(',');

      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${reelId}/insights?metric=${metrics}&access_token=${this.accessToken}`
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

      // Update reel with analytics
      await db.update(instagramReels)
        .set({
          playsCount: analytics.plays,
          likesCount: analytics.likes,
          commentsCount: analytics.comments,
          sharesCount: analytics.shares,
          savesCount: analytics.saved,
          reach: analytics.reach,
          impressions: analytics.impressions,
        })
        .where(eq(instagramReels.reelId, reelId));

      return analytics;
    } catch (error) {
      logger.error('Error fetching reel analytics:', error);
      throw error;
    }
  }

  // Get trending audio tracks
  async getTrendingAudio() {
    try {
      // This would normally call Instagram's API for trending audio
      // For now, return curated list for logistics/business content
      return {
        trending: [
          {
            id: 'audio_1',
            name: 'Upbeat Corporate',
            artist: 'Business Beats',
            uses: 125000,
            category: 'Business',
            duration: 30,
            mood: 'Energetic',
            trending_score: 9.2,
          },
          {
            id: 'audio_2',
            name: 'Tech Innovation',
            artist: 'Digital Sounds',
            uses: 98000,
            category: 'Technology',
            duration: 15,
            mood: 'Inspiring',
            trending_score: 8.8,
          },
          {
            id: 'audio_3',
            name: 'Global Commerce',
            artist: 'Trade Tunes',
            uses: 76000,
            category: 'Business',
            duration: 30,
            mood: 'Professional',
            trending_score: 8.5,
          },
          {
            id: 'audio_4',
            name: 'Supply Chain Flow',
            artist: 'Logistics Beats',
            uses: 64000,
            category: 'Logistics',
            duration: 20,
            mood: 'Dynamic',
            trending_score: 8.1,
          },
          {
            id: 'audio_5',
            name: 'Blockchain Revolution',
            artist: 'Crypto Sounds',
            uses: 52000,
            category: 'Technology',
            duration: 25,
            mood: 'Futuristic',
            trending_score: 7.9,
          },
        ],
        categories: ['Business', 'Technology', 'Logistics', 'Motivational', 'Educational'],
      };
    } catch (error) {
      logger.error('Error fetching trending audio:', error);
      throw error;
    }
  }

  // Get reel templates for logistics content
  async getReelTemplates() {
    return {
      templates: [
        {
          id: 'template_1',
          name: 'Package Journey',
          description: 'Show a package from warehouse to delivery',
          duration: 15,
          scenes: [
            { duration: 3, action: 'Package being scanned' },
            { duration: 3, action: 'Loading onto truck' },
            { duration: 3, action: 'In transit shots' },
            { duration: 3, action: 'Delivery to customer' },
            { duration: 3, action: 'Happy customer unboxing' },
          ],
          hashtags: ['#logistics', '#shipping', '#delivery', '#supplychain'],
          tips: 'Use fast transitions and upbeat music',
        },
        {
          id: 'template_2',
          name: 'Blockchain Explained',
          description: 'Simple explanation of blockchain in logistics',
          duration: 30,
          scenes: [
            { duration: 5, action: 'Problem statement' },
            { duration: 10, action: 'Blockchain solution visual' },
            { duration: 10, action: 'Benefits showcase' },
            { duration: 5, action: 'Call to action' },
          ],
          hashtags: ['#blockchain', '#innovation', '#tech', '#logistics'],
          tips: 'Use simple graphics and clear text overlays',
        },
        {
          id: 'template_3',
          name: 'Warehouse Tour',
          description: 'Quick tour of warehouse operations',
          duration: 20,
          scenes: [
            { duration: 4, action: 'Warehouse exterior' },
            { duration: 4, action: 'Inventory management' },
            { duration: 4, action: 'Picking and packing' },
            { duration: 4, action: 'Quality control' },
            { duration: 4, action: 'Shipping preparation' },
          ],
          hashtags: ['#warehouse', '#operations', '#behindthescenes', '#logistics'],
          tips: 'Show efficiency and organization',
        },
        {
          id: 'template_4',
          name: 'Success Story',
          description: 'Client success story or case study',
          duration: 30,
          scenes: [
            { duration: 5, action: 'Client challenge' },
            { duration: 10, action: 'MoloChain solution' },
            { duration: 10, action: 'Results and metrics' },
            { duration: 5, action: 'Client testimonial' },
          ],
          hashtags: ['#success', '#casestudy', '#results', '#testimonial'],
          tips: 'Include real numbers and client quotes',
        },
        {
          id: 'template_5',
          name: 'Tech Feature Demo',
          description: 'Demonstrate a platform feature',
          duration: 15,
          scenes: [
            { duration: 3, action: 'Feature introduction' },
            { duration: 6, action: 'Live demonstration' },
            { duration: 3, action: 'Key benefits' },
            { duration: 3, action: 'How to get started' },
          ],
          hashtags: ['#feature', '#demo', '#platform', '#technology'],
          tips: 'Keep it simple and focus on value',
        },
      ],
    };
  }

  // Get reel performance metrics
  async getReelPerformance(accountId: number, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const reels = await db.select({
        totalReels: sql<number>`count(*)`,
        totalPlays: sql<number>`sum(${instagramReels.playsCount})`,
        totalLikes: sql<number>`sum(${instagramReels.likesCount})`,
        totalComments: sql<number>`sum(${instagramReels.commentsCount})`,
        totalShares: sql<number>`sum(${instagramReels.sharesCount})`,
        totalSaves: sql<number>`sum(${instagramReels.savesCount})`,
        avgCompletionRate: sql<number>`avg(${instagramReels.completionRate})`,
        avgWatchTime: sql<number>`avg(${instagramReels.averageWatchTime})`,
        totalReach: sql<number>`sum(${instagramReels.reach})`,
      })
        .from(instagramReels)
        .where(
          and(
            eq(instagramReels.accountId, accountId),
            gte(instagramReels.publishedAt, startDate)
          )
        );

      return reels[0] || {
        totalReels: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        avgCompletionRate: 0,
        avgWatchTime: 0,
        totalReach: 0,
      };
    } catch (error) {
      logger.error('Error fetching reel performance:', error);
      throw error;
    }
  }

  // Auto-publish scheduled reels
  async autoPublishScheduledReels() {
    try {
      const now = new Date();
      const scheduledReels = await db.select()
        .from(instagramReels)
        .where(
          and(
            eq(instagramReels.isScheduled, true),
            lte(instagramReels.scheduledPublishTime, now)
          )
        );
      
      for (const reel of scheduledReels) {
        try {
          await this.publishReel(reel.id);
          logger.info(`Auto-published reel: ${reel.id}`);
        } catch (error) {
          logger.error(`Failed to auto-publish reel ${reel.id}:`, error);
        }
      }

      return {
        published: scheduledReels.length,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in auto-publish reels:', error);
      throw error;
    }
  }

  // Get viral reel insights
  async getViralReelInsights() {
    return {
      insights: {
        bestTimes: ['9:00 AM', '12:00 PM', '6:00 PM', '9:00 PM'],
        optimalDuration: '15-30 seconds',
        topHashtags: [
          '#logistics',
          '#supplychain',
          '#shipping',
          '#blockchain',
          '#innovation',
          '#technology',
          '#business',
          '#entrepreneur',
          '#ecommerce',
          '#global',
        ],
        contentTips: [
          'Hook viewers in first 3 seconds',
          'Use trending audio',
          'Add captions for silent viewing',
          'Include a clear call-to-action',
          'Show real operations and results',
          'Keep it authentic and relatable',
          'Use fast-paced editing',
          'Include customer testimonials',
        ],
        averageViralMetrics: {
          plays: 50000,
          likes: 5000,
          comments: 500,
          shares: 1000,
          saves: 2000,
          completionRate: 75,
        },
      },
    };
  }
}

export default InstagramReelsService;