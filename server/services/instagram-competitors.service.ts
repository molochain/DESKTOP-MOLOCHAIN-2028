import { db } from '../db';
import { instagramCompetitors, instagramAccounts } from '../../shared/schema';
import { eq, and, desc, gte, sql, gt } from 'drizzle-orm';
import { logger } from '../utils/logger';

export class InstagramCompetitorsService {
  private accessToken: string;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.facebook.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Add competitor to track
  async addCompetitor(data: {
    accountId?: number;
    competitorUsername: string;
    competitorUserId?: string;
  }) {
    try {
      // Fetch competitor data from Instagram
      const competitorData = await this.fetchCompetitorData(data.competitorUsername);

      const competitor = await db.insert(instagramCompetitors).values({
        accountId: data.accountId,
        competitorUsername: data.competitorUsername,
        competitorUserId: data.competitorUserId,
        ...competitorData,
        trackingEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      logger.info(`Competitor added: ${competitor[0].competitorUsername}`);
      return competitor[0];
    } catch (error) {
      logger.error('Error adding competitor:', error);
      throw error;
    }
  }

  // Fetch competitor data from Instagram
  private async fetchCompetitorData(username: string) {
    try {
      // This would normally use Instagram's API
      // For demonstration, return comprehensive mock data
      const followersCount = Math.floor(Math.random() * 500000) + 10000;
      const postsCount = Math.floor(Math.random() * 1000) + 100;
      
      return {
        profilePictureUrl: `https://placeholder.com/${username}`,
        bio: `Leading logistics company specializing in global shipping solutions`,
        followersCount,
        followingCount: Math.floor(Math.random() * 1000),
        postsCount,
        averageEngagement: Math.random() * 10,
        postingFrequency: Math.random() * 7 + 1, // 1-8 posts per week
        topHashtags: ['#logistics', '#shipping', '#supplychain', '#global', '#innovation'],
        topMentions: ['@partner1', '@client1', '@industry_leader'],
        contentThemes: ['shipping updates', 'industry news', 'technology', 'sustainability'],
        growthRate: Math.random() * 5, // 0-5% monthly growth
        lastPostDate: new Date(),
      };
    } catch (error) {
      logger.error('Error fetching competitor data:', error);
      return {};
    }
  }

  // Analyze competitor performance
  async analyzeCompetitor(competitorId: number) {
    try {
      const competitor = await db.select()
        .from(instagramCompetitors)
        .where(eq(instagramCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error('Competitor not found');
      }

      // Fetch latest data
      const latestData = await this.fetchCompetitorData(competitor[0].competitorUsername);

      // Calculate insights
      const insights = {
        followerGrowth: latestData.followersCount - competitor[0].followersCount,
        growthPercentage: ((latestData.followersCount - competitor[0].followersCount) / competitor[0].followersCount) * 100,
        engagementTrend: latestData.averageEngagement > competitor[0].averageEngagement ? 'increasing' : 'decreasing',
        postingConsistency: this.calculatePostingConsistency(latestData.postingFrequency),
        contentStrategy: this.analyzeContentStrategy(latestData.contentThemes),
        bestPerformingTime: this.analyzeBestPostingTimes(latestData.bestPostingTimes),
      };

      // Update competitor data
      await db.update(instagramCompetitors)
        .set({
          ...latestData,
          lastAnalyzed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(instagramCompetitors.id, competitorId));

      return { competitor: latestData, insights };
    } catch (error) {
      logger.error('Error analyzing competitor:', error);
      throw error;
    }
  }

  // Calculate posting consistency score
  private calculatePostingConsistency(frequency: number): string {
    if (frequency >= 7) return 'Very Consistent (Daily)';
    if (frequency >= 4) return 'Consistent (4-6 per week)';
    if (frequency >= 2) return 'Moderate (2-3 per week)';
    return 'Inconsistent (Less than 2 per week)';
  }

  // Analyze content strategy
  private analyzeContentStrategy(themes: string[]): any {
    return {
      primaryTheme: themes[0],
      diversity: themes.length > 3 ? 'High' : 'Low',
      recommendations: [
        'Focus on trending topics in logistics',
        'Include more user-generated content',
        'Share behind-the-scenes content',
        'Highlight technology innovations',
      ],
    };
  }

  // Analyze best posting times
  private analyzeBestPostingTimes(times: any): any {
    return {
      weekdays: ['9:00 AM', '12:00 PM', '5:00 PM'],
      weekends: ['10:00 AM', '2:00 PM'],
      peakEngagement: '12:00 PM on Wednesdays',
    };
  }

  // Get competitor comparison
  async getCompetitorComparison(accountId: number) {
    try {
      // Get account data
      const account = await db.select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, accountId))
        .limit(1);

      if (!account[0]) {
        throw new Error('Account not found');
      }

      // Get all tracked competitors
      const competitors = await db.select()
        .from(instagramCompetitors)
        .where(
          and(
            eq(instagramCompetitors.accountId, accountId),
            eq(instagramCompetitors.trackingEnabled, true)
          )
        )
        .orderBy(desc(instagramCompetitors.followersCount));

      // Calculate comparison metrics
      const comparison = {
        yourAccount: {
          username: account[0].username,
          followers: account[0].followersCount,
          following: account[0].followingCount,
          posts: account[0].mediaCount,
        },
        competitors: competitors.map(c => ({
          username: c.competitorUsername,
          followers: c.followersCount,
          engagement: c.averageEngagement,
          postingFrequency: c.postingFrequency,
          growthRate: c.growthRate,
        })),
        insights: {
          followerRank: this.calculateRank(account[0].followersCount, competitors),
          averageCompetitorFollowers: this.calculateAverage(competitors, 'followersCount'),
          averageCompetitorEngagement: this.calculateAverage(competitors, 'averageEngagement'),
          topPerformer: competitors[0]?.competitorUsername,
          recommendations: this.generateRecommendations(account[0], competitors),
        },
      };

      return comparison;
    } catch (error) {
      logger.error('Error getting competitor comparison:', error);
      throw error;
    }
  }

  // Calculate rank among competitors
  private calculateRank(yourFollowers: number, competitors: any[]): number {
    const sorted = [...competitors].sort((a, b) => b.followersCount - a.followersCount);
    const position = sorted.findIndex(c => yourFollowers > c.followersCount);
    return position === -1 ? competitors.length + 1 : position + 1;
  }

  // Calculate average of a field
  private calculateAverage(items: any[], field: string): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / items.length;
  }

  // Generate strategic recommendations
  private generateRecommendations(account: any, competitors: any[]): string[] {
    const recommendations = [];
    const avgEngagement = this.calculateAverage(competitors, 'averageEngagement');
    const avgFrequency = this.calculateAverage(competitors, 'postingFrequency');

    if (account.followersCount < this.calculateAverage(competitors, 'followersCount')) {
      recommendations.push('Increase follower acquisition through targeted campaigns');
    }

    if (avgFrequency > 3) {
      recommendations.push(`Increase posting frequency to match competitor average of ${avgFrequency.toFixed(1)} posts/week`);
    }

    recommendations.push('Analyze top-performing competitor content for inspiration');
    recommendations.push('Identify gaps in competitor strategies to differentiate');
    recommendations.push('Monitor competitor hashtags and engagement tactics');

    return recommendations;
  }

  // Get competitor hashtag analysis
  async getHashtagAnalysis(competitorId: number) {
    try {
      const competitor = await db.select()
        .from(instagramCompetitors)
        .where(eq(instagramCompetitors.id, competitorId))
        .limit(1);

      if (!competitor[0]) {
        throw new Error('Competitor not found');
      }

      const hashtagAnalysis = {
        topHashtags: competitor[0].topHashtags || [],
        recommendations: [
          '#logistics',
          '#supplychain',
          '#shipping',
          '#freight',
          '#warehousing',
          '#lastmile',
          '#blockchain',
          '#innovation',
          '#sustainability',
          '#global',
        ],
        trending: [
          { tag: '#supplychaintech', growth: '+45%', posts: '125K' },
          { tag: '#logisticsautomation', growth: '+38%', posts: '89K' },
          { tag: '#greenlogistics', growth: '+32%', posts: '67K' },
          { tag: '#digitaltransformation', growth: '+28%', posts: '234K' },
          { tag: '#ecommercefulfillment', growth: '+25%', posts: '156K' },
        ],
        competitorSpecific: competitor[0].topHashtags?.slice(0, 5) || [],
      };

      return hashtagAnalysis;
    } catch (error) {
      logger.error('Error getting hashtag analysis:', error);
      throw error;
    }
  }

  // Get content gap analysis
  async getContentGapAnalysis(accountId: number) {
    try {
      const competitors = await db.select()
        .from(instagramCompetitors)
        .where(
          and(
            eq(instagramCompetitors.accountId, accountId),
            eq(instagramCompetitors.trackingEnabled, true)
          )
        );

      // Analyze content themes across all competitors
      const allThemes = new Set();
      competitors.forEach(c => {
        (c.contentThemes || []).forEach(theme => allThemes.add(theme));
      });

      const gaps = {
        unexploredThemes: [
          'Blockchain integration tutorials',
          'Customer success stories',
          'Sustainability initiatives',
          'Technology partnerships',
          'Industry certifications',
        ],
        contentOpportunities: [
          {
            type: 'Educational Content',
            description: 'How-to guides and tutorials',
            competitorCoverage: '30%',
            opportunity: 'High',
          },
          {
            type: 'Behind the Scenes',
            description: 'Warehouse and operations content',
            competitorCoverage: '20%',
            opportunity: 'High',
          },
          {
            type: 'User Generated Content',
            description: 'Customer testimonials and reviews',
            competitorCoverage: '15%',
            opportunity: 'Very High',
          },
          {
            type: 'Industry News',
            description: 'Latest logistics trends and updates',
            competitorCoverage: '50%',
            opportunity: 'Medium',
          },
          {
            type: 'Team Culture',
            description: 'Employee spotlights and culture',
            competitorCoverage: '10%',
            opportunity: 'Very High',
          },
        ],
        recommendations: [
          'Focus on underserved content types with high opportunity',
          'Develop unique content series to differentiate',
          'Leverage MoloChain\'s blockchain advantage in content',
          'Create more interactive and engaging content formats',
        ],
      };

      return gaps;
    } catch (error) {
      logger.error('Error getting content gap analysis:', error);
      throw error;
    }
  }

  // Auto-track competitors
  async autoTrackCompetitors() {
    try {
      const competitors = await db.select()
        .from(instagramCompetitors)
        .where(eq(instagramCompetitors.trackingEnabled, true));

      const results = [];
      for (const competitor of competitors) {
        try {
          const analysis = await this.analyzeCompetitor(competitor.id);
          results.push({
            competitor: competitor.competitorUsername,
            status: 'tracked',
            insights: analysis.insights,
          });
        } catch (error) {
          logger.error(`Failed to track competitor ${competitor.competitorUsername}:`, error);
          results.push({
            competitor: competitor.competitorUsername,
            status: 'failed',
            error: error.message,
          });
        }
      }

      return {
        tracked: results.filter(r => r.status === 'tracked').length,
        failed: results.filter(r => r.status === 'failed').length,
        timestamp: new Date(),
        results,
      };
    } catch (error) {
      logger.error('Error in auto-track competitors:', error);
      throw error;
    }
  }

  // Get competitive intelligence dashboard
  async getCompetitiveIntelligence(accountId: number) {
    try {
      const competitors = await db.select()
        .from(instagramCompetitors)
        .where(
          and(
            eq(instagramCompetitors.accountId, accountId),
            eq(instagramCompetitors.trackingEnabled, true)
          )
        );

      const intelligence = {
        marketPosition: {
          yourRank: 3,
          totalCompetitors: competitors.length,
          marketShare: '15%',
          growthTrend: 'Positive',
        },
        competitorActivity: {
          mostActive: competitors.sort((a, b) => b.postingFrequency - a.postingFrequency)[0]?.competitorUsername,
          fastestGrowing: competitors.sort((a, b) => b.growthRate - a.growthRate)[0]?.competitorUsername,
          highestEngagement: competitors.sort((a, b) => b.averageEngagement - a.averageEngagement)[0]?.competitorUsername,
        },
        opportunities: [
          'Competitor X reduced posting - opportunity to capture audience',
          'Rising demand for blockchain logistics content',
          'Gap in video content among competitors',
          'Untapped potential in Stories and Reels',
        ],
        threats: [
          'Competitor Y launching aggressive growth campaign',
          'New entrant with innovative content strategy',
          'Industry shift towards video-first content',
        ],
        actionItems: [
          { priority: 'High', action: 'Increase Reels production to 3 per week', deadline: '1 week' },
          { priority: 'Medium', action: 'Launch UGC campaign', deadline: '2 weeks' },
          { priority: 'Low', action: 'Analyze competitor Y strategy', deadline: '1 month' },
        ],
      };

      return intelligence;
    } catch (error) {
      logger.error('Error getting competitive intelligence:', error);
      throw error;
    }
  }
}

export default InstagramCompetitorsService;