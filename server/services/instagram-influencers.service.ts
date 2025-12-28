import { db } from '../db';
import { instagramInfluencers, instagramAccounts } from '../../shared/schema';
import { eq, and, desc, gte, like, or, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export class InstagramInfluencersService {
  private accessToken: string;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.facebook.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Add influencer to database
  async addInfluencer(data: {
    accountId?: number;
    username: string;
    fullName?: string;
    profilePictureUrl?: string;
    bio?: string;
    followersCount?: number;
    niche?: string[];
    contactEmail?: string;
    contactPhone?: string;
  }) {
    try {
      // Fetch influencer data from Instagram if not provided
      if (!data.followersCount || !data.bio) {
        const instagramData = await this.fetchInfluencerFromInstagram(data.username);
        data = { ...data, ...instagramData };
      }

      // Calculate category based on followers
      const category = this.calculateInfluencerCategory(data.followersCount || 0);

      const influencer = await db.insert(instagramInfluencers).values({
        ...data,
        category,
        collaborationStatus: 'interested',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      logger.info(`Influencer added: ${influencer[0].username}`);
      return influencer[0];
    } catch (error) {
      logger.error('Error adding influencer:', error);
      throw error;
    }
  }

  // Fetch influencer data from Instagram
  private async fetchInfluencerFromInstagram(username: string) {
    try {
      // This would normally use Instagram's API
      // For now, return mock data
      return {
        followersCount: Math.floor(Math.random() * 1000000),
        followingCount: Math.floor(Math.random() * 1000),
        postsCount: Math.floor(Math.random() * 500),
        bio: 'Influencer profile',
        isVerified: Math.random() > 0.7,
      };
    } catch (error) {
      logger.error('Error fetching influencer from Instagram:', error);
      return {};
    }
  }

  // Calculate influencer category based on followers
  private calculateInfluencerCategory(followersCount: number): string {
    if (followersCount < 10000) return 'nano';
    if (followersCount < 100000) return 'micro';
    if (followersCount < 1000000) return 'macro';
    if (followersCount < 10000000) return 'mega';
    return 'celebrity';
  }

  // Calculate engagement rate
  async calculateEngagementRate(influencerId: number) {
    try {
      const influencer = await db.select()
        .from(instagramInfluencers)
        .where(eq(instagramInfluencers.id, influencerId))
        .limit(1);

      if (!influencer[0]) {
        throw new Error('Influencer not found');
      }

      // Calculate engagement rate (likes + comments) / followers * 100
      const avgEngagement = ((influencer[0].averageLikes || 0) + (influencer[0].averageComments || 0)) / 
                           (influencer[0].followersCount || 1) * 100;

      await db.update(instagramInfluencers)
        .set({
          engagementRate: avgEngagement,
          lastAnalyzed: new Date(),
        })
        .where(eq(instagramInfluencers.id, influencerId));

      return avgEngagement;
    } catch (error) {
      logger.error('Error calculating engagement rate:', error);
      throw error;
    }
  }

  // Search influencers
  async searchInfluencers(params: {
    category?: string;
    minFollowers?: number;
    maxFollowers?: number;
    niche?: string[];
    minEngagement?: number;
    collaborationStatus?: string;
  }) {
    try {
      let query = db.select().from(instagramInfluencers);
      const conditions = [];

      if (params.category) {
        conditions.push(eq(instagramInfluencers.category, params.category));
      }

      if (params.minFollowers) {
        conditions.push(gte(instagramInfluencers.followersCount, params.minFollowers));
      }

      if (params.maxFollowers) {
        conditions.push(sql`${instagramInfluencers.followersCount} <= ${params.maxFollowers}`);
      }

      if (params.minEngagement) {
        conditions.push(gte(instagramInfluencers.engagementRate, params.minEngagement));
      }

      if (params.collaborationStatus) {
        conditions.push(eq(instagramInfluencers.collaborationStatus, params.collaborationStatus));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const influencers = await query.orderBy(desc(instagramInfluencers.engagementRate));
      return influencers;
    } catch (error) {
      logger.error('Error searching influencers:', error);
      throw error;
    }
  }

  // Update collaboration status
  async updateCollaborationStatus(influencerId: number, status: string, notes?: any) {
    try {
      const influencer = await db.select()
        .from(instagramInfluencers)
        .where(eq(instagramInfluencers.id, influencerId))
        .limit(1);

      if (!influencer[0]) {
        throw new Error('Influencer not found');
      }

      // Update collaboration history
      const history = Array.isArray(influencer[0].collaborationHistory) 
        ? influencer[0].collaborationHistory 
        : [];
      history.push({
        status,
        date: new Date(),
        notes,
      });

      await db.update(instagramInfluencers)
        .set({
          collaborationStatus: status,
          collaborationHistory: history,
          updatedAt: new Date(),
        })
        .where(eq(instagramInfluencers.id, influencerId));

      logger.info(`Collaboration status updated for influencer ${influencerId}: ${status}`);
      return { success: true };
    } catch (error) {
      logger.error('Error updating collaboration status:', error);
      throw error;
    }
  }

  // Get recommended influencers for MoloChain
  async getRecommendedInfluencers() {
    try {
      // Get influencers in logistics, tech, blockchain niches with good engagement
      const recommended = await db.select()
        .from(instagramInfluencers)
        .where(
          and(
            gte(instagramInfluencers.engagementRate, 3.0),
            or(
              sql`${instagramInfluencers.niche}::jsonb @> '["logistics"]'::jsonb`,
              sql`${instagramInfluencers.niche}::jsonb @> '["blockchain"]'::jsonb`,
              sql`${instagramInfluencers.niche}::jsonb @> '["technology"]'::jsonb`,
              sql`${instagramInfluencers.niche}::jsonb @> '["business"]'::jsonb`
            )
          )
        )
        .orderBy(desc(instagramInfluencers.engagementRate))
        .limit(10);

      return recommended;
    } catch (error) {
      logger.error('Error getting recommended influencers:', error);
      throw error;
    }
  }

  // Calculate ROI for influencer collaboration
  async calculateInfluencerROI(influencerId: number, campaignMetrics: {
    investment: number;
    reach: number;
    engagement: number;
    conversions: number;
    conversionValue: number;
  }) {
    try {
      const influencer = await db.select()
        .from(instagramInfluencers)
        .where(eq(instagramInfluencers.id, influencerId))
        .limit(1);

      if (!influencer[0]) {
        throw new Error('Influencer not found');
      }

      const roi = {
        investment: campaignMetrics.investment,
        totalValue: campaignMetrics.conversions * campaignMetrics.conversionValue,
        roi: ((campaignMetrics.conversions * campaignMetrics.conversionValue - campaignMetrics.investment) / campaignMetrics.investment) * 100,
        costPerEngagement: campaignMetrics.investment / campaignMetrics.engagement,
        costPerConversion: campaignMetrics.investment / (campaignMetrics.conversions || 1),
        engagementRate: (campaignMetrics.engagement / campaignMetrics.reach) * 100,
        conversionRate: (campaignMetrics.conversions / campaignMetrics.reach) * 100,
      };

      return roi;
    } catch (error) {
      logger.error('Error calculating influencer ROI:', error);
      throw error;
    }
  }

  // Generate influencer outreach templates
  async getOutreachTemplates() {
    return {
      templates: [
        {
          id: 'template_1',
          name: 'Initial Contact',
          subject: 'Partnership Opportunity with MoloChain',
          body: `Hi [Influencer Name],

I hope this message finds you well! I'm reaching out from MoloChain, a global logistics and blockchain platform revolutionizing supply chain management.

We've been following your content about [specific niche] and are impressed by your engagement with your audience. Your insights on [specific topic] particularly resonated with our mission.

We'd love to explore a partnership opportunity where you could:
- Share exclusive insights about logistics innovation
- Access our platform for content creation
- Earn competitive compensation

Would you be interested in discussing this further?

Best regards,
[Your Name]
MoloChain Team`,
          type: 'initial',
        },
        {
          id: 'template_2',
          name: 'Collaboration Proposal',
          subject: 'Collaboration Proposal - MoloChain x [Influencer Name]',
          body: `Hi [Influencer Name],

Thank you for your interest in partnering with MoloChain! Based on our discussion, here's what we propose:

Campaign Overview:
- Duration: [X weeks/months]
- Content: [X posts, X stories, X reels]
- Focus: [Specific features/services]

Compensation:
- Base fee: $[Amount]
- Performance bonus: $[Amount] for reaching [metric]
- Product/service access: [Details]

Deliverables:
1. [Specific deliverable]
2. [Specific deliverable]
3. [Specific deliverable]

Timeline:
- Week 1: [Activity]
- Week 2: [Activity]
- Week 3: [Activity]

Looking forward to your thoughts!

Best,
[Your Name]`,
          type: 'proposal',
        },
        {
          id: 'template_3',
          name: 'Content Brief',
          subject: 'Content Brief - MoloChain Campaign',
          body: `Hi [Influencer Name],

Here's the content brief for our upcoming campaign:

Key Messages:
- MoloChain simplifies global logistics
- Blockchain ensures transparency and security
- Real-time tracking for all shipments

Content Guidelines:
- Tone: Professional yet approachable
- Hashtags: #MoloChain #LogisticsInnovation #Blockchain
- Mentions: @molochain_official

Content Ideas:
1. "Day in the life" using MoloChain platform
2. Explaining blockchain in logistics simply
3. Success story/case study showcase

Assets Provided:
- Brand guidelines
- Logo pack
- Product screenshots
- B-roll footage

Posting Schedule:
- Post 1: [Date] - [Content type]
- Post 2: [Date] - [Content type]
- Post 3: [Date] - [Content type]

Questions? Let me know!

Best,
[Your Name]`,
          type: 'brief',
        },
      ],
    };
  }

  // Get influencer performance metrics
  async getInfluencerMetrics(accountId?: number) {
    try {
      const baseQuery = accountId 
        ? eq(instagramInfluencers.accountId, accountId)
        : undefined;

      const metrics = await db.select({
        totalInfluencers: sql<number>`count(*)`,
        activeCollaborations: sql<number>`count(*) filter (where ${instagramInfluencers.collaborationStatus} = 'active')`,
        avgEngagementRate: sql<number>`avg(${instagramInfluencers.engagementRate})`,
        totalReach: sql<number>`sum(${instagramInfluencers.followersCount})`,
        categories: sql<any>`
          json_build_object(
            'nano', count(*) filter (where ${instagramInfluencers.category} = 'nano'),
            'micro', count(*) filter (where ${instagramInfluencers.category} = 'micro'),
            'macro', count(*) filter (where ${instagramInfluencers.category} = 'macro'),
            'mega', count(*) filter (where ${instagramInfluencers.category} = 'mega'),
            'celebrity', count(*) filter (where ${instagramInfluencers.category} = 'celebrity')
          )
        `,
      })
        .from(instagramInfluencers)
        .where(baseQuery);

      return metrics[0];
    } catch (error) {
      logger.error('Error fetching influencer metrics:', error);
      throw error;
    }
  }
}

export default InstagramInfluencersService;