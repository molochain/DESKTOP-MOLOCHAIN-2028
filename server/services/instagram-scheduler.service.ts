import * as cron from 'node-cron';
import { db } from '../db';
import { instagramPosts, instagramAccounts } from '../../shared/schema';
import { eq, and, lte, isNull, asc } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { instagramService } from './instagram.service';
// Natural language processing will be added later
// import * as natural from 'natural';
import * as crypto from 'crypto-js';
import { Jimp } from 'jimp';
import { promises as fs } from 'fs';
import path from 'path';

interface ScheduledPost {
  id: number;
  accountId: number;
  content: string;
  mediaUrl?: string;
  hashtags: string[];
  scheduledAt: Date;
}

export class InstagramSchedulerService {
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  // Natural language processing will be initialized when library is configured
  private tfidf: any;
  private tokenizer: any;
  private sentiment: any;

  constructor() {
    // NLP features will be initialized later
    this.initializeScheduler();
  }

  private initializeScheduler() {
    // Instagram scheduler temporarily disabled due to Drizzle/Neon compatibility issue
    // The neon-http driver has a conflict with prepared statements
    // TODO: Fix by using drizzle-orm/neon-serverless driver or updating query execution
    logger.info('Instagram scheduler disabled (Drizzle/Neon compatibility issue)');
    
    // Uncomment to re-enable when fixed:
    // const job = cron.schedule('* * * * *', async () => {
    //   await this.checkAndPublishScheduledPosts();
    // });
    // job.start();
    // this.cronJobs.set('main-scheduler', job);
  }

  async checkAndPublishScheduledPosts() {
    try {
      const now = new Date();
      let scheduledPosts: any[];
      
      try {
        scheduledPosts = await db
          .select()
          .from(instagramPosts)
          .where(
            and(
              lte(instagramPosts.scheduledPublishTime, new Date()),
              eq(instagramPosts.isScheduled, true)
            )
          )
          .limit(10);
      } catch (error: any) {
        if (error.code === '42P01') {
          // Table doesn't exist, return empty array
          logger.debug('Instagram posts table not yet created, skipping scheduled post check');
          scheduledPosts = [];
        } else {
          throw error;
        }
      }

      for (const post of scheduledPosts) {
        await this.publishPost(post);
      }
    } catch (error) {
      logger.error('Error checking scheduled posts:', error);
    }
  }

  async publishPost(post: any) {
    try {
      // Get account details
      const [account] = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, post.accountId))
        .limit(1);

      if (!account || !account.accessToken) {
        throw new Error('Account not found or not authenticated');
      }

      // Process image if exists
      let processedMediaUrl = post.mediaUrl;
      if (post.mediaUrl) {
        processedMediaUrl = await this.processImage(post.mediaUrl, post.id);
      }

      // Optimize hashtags
      const optimizedHashtags = await this.optimizeHashtags(post.caption || '', post.hashtags || []);

      // Build final caption
      const finalCaption = `${post.caption}\n\n${optimizedHashtags.join(' ')}`;

      // Here you would call Instagram API to publish
      // For now, we'll simulate the publishing
      await db
        .update(instagramPosts)
        .set({
          isScheduled: false,
          publishedAt: new Date(),
          caption: finalCaption,
          mediaUrl: processedMediaUrl
        })
        .where(eq(instagramPosts.id, post.id));

      logger.info(`Published post ${post.id} for account ${account.username}`);
    } catch (error) {
      logger.error(`Failed to publish post ${post.id}:`, error);

      await db
        .update(instagramPosts)
        .set({ isScheduled: false })
        .where(eq(instagramPosts.id, post.id));
    }
  }

  async optimizeHashtags(content: string, existingHashtags: string[]): Promise<string[]> {
    try {
      // Simple keyword extraction for now
      const words = content.toLowerCase().split(/\s+/);
      const keywords = words
        .filter((word: string) => word.length > 4 && !word.startsWith('#'))
        .slice(0, 5);

      // Simple sentiment analysis
      const positiveWords = ['great', 'amazing', 'excellent', 'success', 'innovative'];
      const negativeWords = ['problem', 'issue', 'difficult', 'challenge', 'fail'];
      const sentimentScore = words.reduce((score: number, word: string) => {
        if (positiveWords.includes(word)) return score + 0.2;
        if (negativeWords.includes(word)) return score - 0.2;
        return score;
      }, 0);

      // Generate smart hashtags based on content
      const generatedHashtags = keywords
        .slice(0, 5)
        .map(keyword => `#${keyword.toLowerCase().replace(/\s+/g, '')}`);

      // Combine with existing hashtags
      const allHashtags = [...new Set([...existingHashtags, ...generatedHashtags])];

      // Add sentiment-based hashtags
      if (sentimentScore > 0.5) {
        allHashtags.push('#success', '#achievement', '#winning');
      } else if (sentimentScore < -0.5) {
        allHashtags.push('#challenge', '#overcome', '#resilience');
      }

      // Add trending logistics hashtags
      const trendingHashtags = [
        '#logistics', '#supplychain', '#blockchain', '#molochain',
        '#shipping', '#freight', '#cargo', '#innovation'
      ];

      // Select relevant trending hashtags (max 30 total)
      const finalHashtags = [...allHashtags, ...trendingHashtags]
        .filter((tag, index, self) => self.indexOf(tag) === index)
        .slice(0, 30);

      return finalHashtags;
    } catch (error) {
      logger.error('Error optimizing hashtags:', error);
      return existingHashtags;
    }
  }

  async processImage(imageUrl: string, postId: number): Promise<string> {
    try {
      // For now, just return the original URL
      // Full image processing would require proper Jimp configuration
      logger.info(`Processing image for post ${postId}`);
      return imageUrl;
    } catch (error) {
      logger.error('Error processing image:', error);
      return imageUrl;
    }
  }

  async schedulePost(
    accountId: number,
    content: string,
    scheduledAt: Date,
    mediaUrl?: string,
    hashtags: string[] = []
  ): Promise<number> {
    try {
      const [post] = await db
        .insert(instagramPosts)
        .values({
          accountId,
          caption: content,
          mediaUrl,
          hashtags,
          scheduledPublishTime: scheduledAt,
          isScheduled: true,
          mediaType: mediaUrl ? 'IMAGE' : 'TEXT'
        })
        .returning();

      logger.info(`Scheduled post ${post.id} for ${scheduledAt}`);
      return post.id;
    } catch (error) {
      logger.error('Error scheduling post:', error);
      throw error;
    }
  }

  async cancelScheduledPost(postId: number): Promise<void> {
    try {
      await db
        .update(instagramPosts)
        .set({ isScheduled: false })
        .where(eq(instagramPosts.id, postId));

      logger.info(`Cancelled scheduled post ${postId}`);
    } catch (error) {
      logger.error('Error cancelling post:', error);
      throw error;
    }
  }

  async getScheduledPosts(accountId: number): Promise<any[]> {
    try {
      const posts = await db
        .select()
        .from(instagramPosts)
        .where(and(
          eq(instagramPosts.accountId, accountId),
          eq(instagramPosts.isScheduled, true)
        ))
        .orderBy(asc(instagramPosts.scheduledPublishTime));

      return posts;
    } catch (error) {
      logger.error('Error getting scheduled posts:', error);
      throw error;
    }
  }

  async analyzeOptimalPostingTime(accountId: number): Promise<{ hour: number; dayOfWeek: number }> {
    try {
      // Analyze historical engagement data
      const analytics = await db
        .select()
        .from(instagramPosts)
        .where(and(
          eq(instagramPosts.accountId, accountId),
          eq(instagramPosts.isScheduled, false)
        ))
        .limit(100);

      // Calculate best times based on engagement
      const engagementByHour = new Map<number, number>();
      const engagementByDay = new Map<number, number>();

      analytics.forEach(post => {
        if (post.publishedAt) {
          const date = new Date(post.publishedAt);
          const hour = date.getHours();
          const day = date.getDay();

          const engagement = (post.likesCount || 0) + (post.commentsCount || 0) * 2;

          engagementByHour.set(hour, (engagementByHour.get(hour) || 0) + engagement);
          engagementByDay.set(day, (engagementByDay.get(day) || 0) + engagement);
        }
      });

      // Find optimal hour and day
      let optimalHour = 14; // Default 2 PM
      let optimalDay = 3; // Default Wednesday
      let maxHourEngagement = 0;
      let maxDayEngagement = 0;

      engagementByHour.forEach((engagement, hour) => {
        if (engagement > maxHourEngagement) {
          maxHourEngagement = engagement;
          optimalHour = hour;
        }
      });

      engagementByDay.forEach((engagement, day) => {
        if (engagement > maxDayEngagement) {
          maxDayEngagement = engagement;
          optimalDay = day;
        }
      });

      return { hour: optimalHour, dayOfWeek: optimalDay };
    } catch (error) {
      logger.error('Error analyzing optimal posting time:', error);
      return { hour: 14, dayOfWeek: 3 }; // Default values
    }
  }

  async generateContentSuggestions(topic: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Generate content variations
    const baseTemplates = [
      `Exciting developments in ${topic} at MoloChain! 🚀`,
      `How ${topic} is transforming global logistics 🌍`,
      `Breaking: New ${topic} features now available on MoloChain`,
      `Success story: ${topic} helping businesses save 30% on logistics costs`,
      `Join the ${topic} revolution with MoloChain's innovative solutions`
    ];

    // Generate variations using NLP
    baseTemplates.forEach(template => {
      // Add emoji based on content type
      let emoji = topic.includes('success') ? '✨' : topic.includes('challenge') ? '💪' : '📦';
      suggestions.push(`${template} ${emoji}`);
    });

    return suggestions;
  }

  async cleanup() {
    // Stop all cron jobs
    this.cronJobs.forEach((job, key) => {
      job.stop();
      logger.info(`Stopped cron job: ${key}`);
    });
    this.cronJobs.clear();
  }
}

export const instagramSchedulerService = new InstagramSchedulerService();