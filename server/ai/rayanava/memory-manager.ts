import { db } from '../../db';
import { 
  rayanavaMemory, 
  rayanavaConversations, 
  rayanavaAnalytics,
  rayanavaLearning,
  rayanavaKnowledgeBase,
  InsertRayanavaMemory,
  InsertRayanavaConversation,
  InsertRayanavaAnalytics,
  InsertRayanavaLearning,
  InsertRayanavaKnowledgeBase
} from '../../../shared/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export class RayanavaMemoryManager {
  private static instance: RayanavaMemoryManager;
  
  private constructor() {}
  
  static getInstance(): RayanavaMemoryManager {
    if (!RayanavaMemoryManager.instance) {
      RayanavaMemoryManager.instance = new RayanavaMemoryManager();
    }
    return RayanavaMemoryManager.instance;
  }

  /**
   * Store conversation and learn from it
   */
  async storeConversation(
    userId: number | null,
    sessionId: string,
    message: string,
    response: string,
    intent?: string,
    sentiment?: string,
    metadata?: any
  ) {
    try {
      // Store conversation
      const conversation: InsertRayanavaConversation = {
        userId,
        sessionId,
        message,
        response,
        intent,
        sentiment,
        topics: this.extractTopics(message),
        entities: this.extractEntities(message),
        timestamp: new Date(),
        metadata
      };
      
      const [stored] = await db.insert(rayanavaConversations).values(conversation).returning();
      
      // Track analytics
      await this.trackAnalytics('usage', 'conversation_count', 1, 'daily', new Date().toISOString().split('T')[0]);
      
      // Learn from conversation
      await this.learnFromInteraction(userId, message, response, intent);
      
      return stored;
    } catch (error) {
      console.error('Error storing conversation:', error);
      return null;
    }
  }

  /**
   * Store user preference or context
   */
  async storeMemory(
    userId: number | null,
    contextType: string,
    contextKey: string,
    contextValue: string,
    confidence: number = 50
  ) {
    try {
      // Check if memory exists
      const existing = await db.select()
        .from(rayanavaMemory)
        .where(
          and(
            userId ? eq(rayanavaMemory.userId, userId) : sql`${rayanavaMemory.userId} IS NULL`,
            eq(rayanavaMemory.contextType, contextType),
            eq(rayanavaMemory.contextKey, contextKey)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing memory
        const [updated] = await db.update(rayanavaMemory)
          .set({
            contextValue,
            confidence: Math.min(100, (existing[0].confidence || 50) + 10), // Increase confidence
            usageCount: (existing[0].usageCount || 0) + 1,
            lastUpdated: new Date()
          })
          .where(eq(rayanavaMemory.id, existing[0].id))
          .returning();
        return updated;
      } else {
        // Create new memory
        const memory: InsertRayanavaMemory = {
          userId,
          contextType,
          contextKey,
          contextValue,
          confidence,
          lastUpdated: new Date(),
          usageCount: 1
        };
        const [created] = await db.insert(rayanavaMemory).values(memory).returning();
        return created;
      }
    } catch (error) {
      console.error('Error storing memory:', error);
      return null;
    }
  }

  /**
   * Retrieve user context and preferences
   */
  async getUserContext(userId: number | null, contextType?: string) {
    try {
      const query = db.select()
        .from(rayanavaMemory)
        .where(
          and(
            userId ? eq(rayanavaMemory.userId, userId) : sql`${rayanavaMemory.userId} IS NULL`,
            contextType ? eq(rayanavaMemory.contextType, contextType) : undefined
          )
        )
        .orderBy(desc(rayanavaMemory.confidence), desc(rayanavaMemory.usageCount));
      
      return await query;
    } catch (error) {
      console.error('Error retrieving user context:', error);
      return [];
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(userId: number | null, sessionId?: string, limit: number = 10) {
    try {
      const query = db.select()
        .from(rayanavaConversations)
        .where(
          and(
            userId ? eq(rayanavaConversations.userId, userId) : sql`${rayanavaConversations.userId} IS NULL`,
            sessionId ? eq(rayanavaConversations.sessionId, sessionId) : undefined
          )
        )
        .orderBy(desc(rayanavaConversations.timestamp))
        .limit(limit);
      
      return await query;
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  /**
   * Track analytics metrics
   */
  async trackAnalytics(
    metricType: string,
    metricName: string,
    metricValue: number,
    dimension?: string,
    dimensionValue?: string
  ) {
    try {
      const analytics: InsertRayanavaAnalytics = {
        metricType,
        metricName,
        metricValue,
        dimension,
        dimensionValue,
        timestamp: new Date()
      };
      
      await db.insert(rayanavaAnalytics).values(analytics);
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }

  /**
   * Store learning data from interactions
   */
  private async learnFromInteraction(
    userId: number | null,
    message: string,
    response: string,
    intent?: string
  ) {
    try {
      // Extract features from interaction
      const features = {
        messageLength: message.length,
        responseLength: response.length,
        intent: intent || 'unknown',
        hasQuestions: message.includes('?'),
        topics: this.extractTopics(message)
      };
      
      const learning: InsertRayanavaLearning = {
        modelType: 'pattern',
        featureName: 'interaction_pattern',
        featureValue: features,
        outcome: 'success', // Can be updated based on user feedback
        reward: 1.0, // Base reward, can be adjusted
        confidence: 0.7,
        timestamp: new Date()
      };
      
      await db.insert(rayanavaLearning).values(learning);
    } catch (error) {
      console.error('Error storing learning data:', error);
    }
  }

  /**
   * Add or update knowledge base entry
   */
  async updateKnowledgeBase(
    category: string,
    topic: string,
    question: string,
    answer: string,
    source: string = 'learned',
    tags?: string[]
  ) {
    try {
      // Check if entry exists
      const existing = await db.select()
        .from(rayanavaKnowledgeBase)
        .where(
          and(
            eq(rayanavaKnowledgeBase.category, category),
            eq(rayanavaKnowledgeBase.question, question)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing entry
        const [updated] = await db.update(rayanavaKnowledgeBase)
          .set({
            answer,
            usageCount: (existing[0].usageCount || 0) + 1,
            lastUsed: new Date(),
            updatedAt: new Date()
          })
          .where(eq(rayanavaKnowledgeBase.id, existing[0].id))
          .returning();
        return updated;
      } else {
        // Create new entry
        const knowledge: InsertRayanavaKnowledgeBase = {
          category,
          topic,
          question,
          answer,
          source,
          tags,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const [created] = await db.insert(rayanavaKnowledgeBase).values(knowledge).returning();
        return created;
      }
    } catch (error) {
      console.error('Error updating knowledge base:', error);
      return null;
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query: string, category?: string) {
    try {
      // Simple keyword search - can be enhanced with vector search
      const results = await db.select()
        .from(rayanavaKnowledgeBase)
        .where(
          and(
            category ? eq(rayanavaKnowledgeBase.category, category) : undefined,
            sql`${rayanavaKnowledgeBase.question} ILIKE ${'%' + query + '%'} OR ${rayanavaKnowledgeBase.answer} ILIKE ${'%' + query + '%'}`
          )
        )
        .orderBy(desc(rayanavaKnowledgeBase.confidence), desc(rayanavaKnowledgeBase.usageCount))
        .limit(5);
      
      // Update usage count for retrieved entries
      for (const result of results) {
        await db.update(rayanavaKnowledgeBase)
          .set({
            usageCount: (result.usageCount || 0) + 1,
            lastUsed: new Date()
          })
          .where(eq(rayanavaKnowledgeBase.id, result.id));
      }
      
      return results;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(metricType?: string, days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const query = db.select({
        metricType: rayanavaAnalytics.metricType,
        metricName: rayanavaAnalytics.metricName,
        totalValue: sql<number>`SUM(${rayanavaAnalytics.metricValue})`,
        avgValue: sql<number>`AVG(${rayanavaAnalytics.metricValue})`,
        count: sql<number>`COUNT(*)`,
        dimension: rayanavaAnalytics.dimension,
        dimensionValue: rayanavaAnalytics.dimensionValue
      })
      .from(rayanavaAnalytics)
      .where(
        and(
          metricType ? eq(rayanavaAnalytics.metricType, metricType) : undefined,
          gte(rayanavaAnalytics.timestamp, startDate)
        )
      )
      .groupBy(
        rayanavaAnalytics.metricType,
        rayanavaAnalytics.metricName,
        rayanavaAnalytics.dimension,
        rayanavaAnalytics.dimensionValue
      );
      
      return await query;
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return [];
    }
  }

  /**
   * Extract topics from text (simple implementation)
   */
  private extractTopics(text: string): string[] {
    const topics = [];
    
    // Check for logistics-related topics
    const logisticsKeywords = ['shipping', 'freight', 'delivery', 'warehouse', 'supply chain', 'logistics', 'transport'];
    const businessKeywords = ['sales', 'marketing', 'customer', 'revenue', 'growth', 'strategy'];
    const techKeywords = ['AI', 'automation', 'integration', 'API', 'system', 'platform'];
    
    const lowerText = text.toLowerCase();
    
    for (const keyword of logisticsKeywords) {
      if (lowerText.includes(keyword)) {
        topics.push('logistics');
        break;
      }
    }
    
    for (const keyword of businessKeywords) {
      if (lowerText.includes(keyword)) {
        topics.push('business');
        break;
      }
    }
    
    for (const keyword of techKeywords) {
      if (lowerText.includes(keyword)) {
        topics.push('technology');
        break;
      }
    }
    
    return topics.length > 0 ? topics : ['general'];
  }

  /**
   * Extract entities from text (simple implementation)
   */
  private extractEntities(text: string): any {
    const entities: any = {};
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) entities.emails = emails;
    
    // Extract company names (simple heuristic)
    const companyIndicators = ['Inc', 'LLC', 'Corp', 'Company', 'Ltd'];
    for (const indicator of companyIndicators) {
      const regex = new RegExp(`\\b[A-Z][\\w\\s]+\\s${indicator}\\b`, 'g');
      const companies = text.match(regex);
      if (companies) {
        entities.companies = companies;
        break;
      }
    }
    
    // Extract numbers (potential IDs, quantities)
    const numbers = text.match(/\b\d+\b/g);
    if (numbers) entities.numbers = numbers;
    
    return entities;
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Clean old conversations
      await db.delete(rayanavaConversations)
        .where(
          and(
            sql`${rayanavaConversations.timestamp} < ${cutoffDate}`,
            sql`${rayanavaConversations.feedback} = 'not_helpful' OR ${rayanavaConversations.feedback} IS NULL`
          )
        );
      
      // Clean old analytics
      await db.delete(rayanavaAnalytics)
        .where(sql`${rayanavaAnalytics.timestamp} < ${cutoffDate}`);
      
      console.log(`Cleaned up data older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }
}