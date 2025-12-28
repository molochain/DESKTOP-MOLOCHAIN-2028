
import { db } from '../db';
import { instagramPosts, instagramAnalytics, instagramAccounts } from "../../shared/schema";
import { eq, desc, and, gte, lte, avg, sum, count } from "drizzle-orm";
import { logger } from "../utils/logger";

export class InstagramAnalyticsService {
  async calculateEngagementRate(accountId: number, days: number = 30): Promise<number> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const posts = await db.select()
        .from(instagramPosts)
        .where(and(
          eq(instagramPosts.accountId, accountId),
          gte(instagramPosts.publishedAt, startDate),
          eq(instagramPosts.status, 'published')
        ));

      const account = await db.select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, accountId))
        .limit(1);

      if (!account[0] || posts.length === 0) return 0;

      const totalEngagement = posts.reduce((sum, post) => 
        sum + (post.likesCount || 0) + (post.commentsCount || 0), 0);
      
      const avgEngagement = totalEngagement / posts.length;
      const engagementRate = (avgEngagement / account[0].followersCount) * 100;

      return Math.round(engagementRate * 100) / 100;
    } catch (error) {
      logger.error('Error calculating engagement rate:', error);
      return 0;
    }
  }

  async getTopPerformingContent(accountId: number, limit: number = 10) {
    try {
      const posts = await db.select()
        .from(instagramPosts)
        .where(and(
          eq(instagramPosts.accountId, accountId),
          eq(instagramPosts.status, 'published')
        ))
        .orderBy(desc(instagramPosts.engagementRate))
        .limit(limit);

      return posts.map(post => ({
        id: post.id,
        caption: post.caption?.substring(0, 100) + '...',
        mediaType: post.mediaType,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        engagementRate: post.engagementRate,
        publishedAt: post.publishedAt,
        hashtags: post.hashtags
      }));
    } catch (error) {
      logger.error('Error getting top performing content:', error);
      return [];
    }
  }

  async analyzeHashtagPerformance(accountId: number) {
    try {
      const posts = await db.select()
        .from(instagramPosts)
        .where(and(
          eq(instagramPosts.accountId, accountId),
          eq(instagramPosts.status, 'published')
        ))
        .limit(100);

      const hashtagStats = new Map<string, {
        count: number,
        totalEngagement: number,
        avgEngagement: number
      }>();

      posts.forEach(post => {
        const engagement = (post.likesCount || 0) + (post.commentsCount || 0);
        
        post.hashtags?.forEach(hashtag => {
          const current = hashtagStats.get(hashtag) || {
            count: 0,
            totalEngagement: 0,
            avgEngagement: 0
          };
          
          current.count += 1;
          current.totalEngagement += engagement;
          current.avgEngagement = current.totalEngagement / current.count;
          
          hashtagStats.set(hashtag, current);
        });
      });

      return Array.from(hashtagStats.entries())
        .map(([hashtag, stats]) => ({
          hashtag,
          ...stats,
          performance: stats.avgEngagement > 50 ? 'high' : 
                     stats.avgEngagement > 25 ? 'medium' : 'low'
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 20);
    } catch (error) {
      logger.error('Error analyzing hashtag performance:', error);
      return [];
    }
  }

  async getAccountGrowth(accountId: number, days: number = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await db.select()
        .from(instagramAnalytics)
        .where(and(
          eq(instagramAnalytics.accountId, accountId),
          gte(instagramAnalytics.date, startDate),
          lte(instagramAnalytics.date, endDate)
        ))
        .orderBy(instagramAnalytics.date);

      const growth = {
        followerGrowth: 0,
        engagementGrowth: 0,
        reachGrowth: 0,
        impressionsGrowth: 0,
        dailyMetrics: analytics.map(day => ({
          date: day.date,
          followers: day.newFollowers || 0,
          engagement: day.engagementRate || 0,
          reach: day.reach || 0,
          impressions: day.impressions || 0
        }))
      };

      if (analytics.length > 1) {
        const first = analytics[0];
        const last = analytics[analytics.length - 1];
        
        growth.followerGrowth = (last.newFollowers || 0) - (first.newFollowers || 0);
        growth.engagementGrowth = ((last.engagementRate || 0) - (first.engagementRate || 0)) * 100;
        growth.reachGrowth = ((last.reach || 0) - (first.reach || 0)) / (first.reach || 1) * 100;
        growth.impressionsGrowth = ((last.impressions || 0) - (first.impressions || 0)) / (first.impressions || 1) * 100;
      }

      return growth;
    } catch (error) {
      logger.error('Error getting account growth:', error);
      return {
        followerGrowth: 0,
        engagementGrowth: 0,
        reachGrowth: 0,
        impressionsGrowth: 0,
        dailyMetrics: []
      };
    }
  }

  async getCompetitorAnalysis(accountId: number) {
    try {
      // This would normally fetch from the competitors table
      // For now, return mock data structure
      return {
        averageEngagementRate: 3.2,
        averagePostFrequency: 5.5,
        topCompetitors: [
          { username: 'competitor1', followers: 50000, engagement: 4.1 },
          { username: 'competitor2', followers: 35000, engagement: 3.8 },
          { username: 'competitor3', followers: 42000, engagement: 3.5 }
        ],
        industryBenchmarks: {
          engagement: 3.1,
          postFrequency: 4.2,
          followerGrowth: 2.5
        }
      };
    } catch (error) {
      logger.error('Error getting competitor analysis:', error);
      return null;
    }
  }

  async generatePerformanceReport(accountId: number) {
    try {
      const [
        engagementRate,
        topContent,
        hashtagPerformance,
        growth
      ] = await Promise.all([
        this.calculateEngagementRate(accountId),
        this.getTopPerformingContent(accountId, 5),
        this.analyzeHashtagPerformance(accountId),
        this.getAccountGrowth(accountId)
      ]);

      return {
        summary: {
          engagementRate,
          totalPosts: topContent.length,
          topHashtagCount: hashtagPerformance.length,
          growthTrend: growth.followerGrowth > 0 ? 'positive' : 'negative'
        },
        topPerformingContent: topContent,
        hashtagInsights: hashtagPerformance.slice(0, 10),
        growthMetrics: growth,
        recommendations: this.generateRecommendations(engagementRate, growth)
      };
    } catch (error) {
      logger.error('Error generating performance report:', error);
      throw error;
    }
  }

  async analyzeContent(content: string) {
    try {
      // Simple content analysis
      const wordCount = content.split(' ').length;
      const hashtagCount = (content.match(/#\w+/g) || []).length;
      const mentionCount = (content.match(/@\w+/g) || []).length;
      const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;

      const score = this.calculateContentScore(wordCount, hashtagCount, mentionCount, emojiCount);

      return {
        wordCount,
        hashtagCount,
        mentionCount,
        emojiCount,
        score,
        recommendations: this.getContentRecommendations(wordCount, hashtagCount, emojiCount),
        sentiment: this.analyzeSentiment(content)
      };
    } catch (error) {
      logger.error('Error analyzing content:', error);
      throw error;
    }
  }

  private calculateContentScore(words: number, hashtags: number, mentions: number, emojis: number): number {
    let score = 50; // Base score

    // Word count scoring (optimal: 125-150 words)
    if (words >= 100 && words <= 200) score += 20;
    else if (words >= 50 && words <= 250) score += 10;
    else score -= 10;

    // Hashtag scoring (optimal: 5-11 hashtags)
    if (hashtags >= 5 && hashtags <= 11) score += 20;
    else if (hashtags >= 3 && hashtags <= 15) score += 10;
    else score -= 10;

    // Emoji scoring (optimal: 1-3 emojis)
    if (emojis >= 1 && emojis <= 3) score += 10;
    else if (emojis > 5) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private getContentRecommendations(words: number, hashtags: number, emojis: number): string[] {
    const recommendations = [];

    if (words < 50) recommendations.push("Consider adding more descriptive content");
    if (words > 250) recommendations.push("Content might be too long for optimal engagement");
    if (hashtags < 3) recommendations.push("Add more relevant hashtags (5-11 recommended)");
    if (hashtags > 15) recommendations.push("Reduce hashtag count for better readability");
    if (emojis === 0) recommendations.push("Add 1-2 relevant emojis to increase engagement");
    if (emojis > 5) recommendations.push("Reduce emoji usage for professional appearance");

    return recommendations;
  }

  private analyzeSentiment(content: string): string {
    // Simple sentiment analysis
    const positiveWords = ['great', 'amazing', 'excellent', 'love', 'perfect', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'disappointing', 'worst'];

    const words = content.toLowerCase().split(' ');
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  private generateRecommendations(engagementRate: number, growth: any): string[] {
    const recommendations = [];

    if (engagementRate < 2) {
      recommendations.push("Focus on creating more engaging content");
      recommendations.push("Use trending hashtags relevant to your industry");
    }

    if (growth.followerGrowth < 0) {
      recommendations.push("Increase posting consistency");
      recommendations.push("Engage more with your audience's comments");
    }

    if (engagementRate > 5) {
      recommendations.push("Maintain current content strategy");
      recommendations.push("Consider expanding reach with paid promotion");
    }

    return recommendations;
  }
}

export const instagramAnalyticsService = new InstagramAnalyticsService();
