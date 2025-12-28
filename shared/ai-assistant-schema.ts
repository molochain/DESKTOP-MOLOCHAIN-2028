import { pgTable, serial, varchar, text, timestamp, boolean, decimal, integer, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// AI Conversations Table
export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  context: varchar('context', { length: 100 }).notNull(), // 'mission', 'dashboard', 'department', etc.
  contextId: varchar('context_id', { length: 255 }), // mission ID, department ID, etc.
  title: varchar('title', { length: 255 }),
  isActive: boolean('is_active').default(true),
  userId: varchar('user_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// AI Messages Table
export const aiMessages = pgTable('ai_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 100 }).default('text'), // 'text', 'insight', 'recommendation', etc.
  metadata: jsonb('metadata'), // Additional data like confidence scores, references, etc.
  createdAt: timestamp('created_at').defaultNow()
});

// AI Insights Table
export const aiInsights = pgTable('ai_insights', {
  id: serial('id').primaryKey(),
  missionId: varchar('mission_id', { length: 255 }).notNull(),
  insightType: varchar('insight_type', { length: 100 }).notNull(), // 'risk', 'opportunity', 'performance', 'prediction'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  severity: varchar('severity', { length: 50 }).default('medium'), // 'low', 'medium', 'high', 'critical'
  confidence: decimal('confidence', { precision: 3, scale: 2 }), // 0.00 to 1.00
  actionItems: jsonb('action_items'), // Array of suggested actions
  relatedData: jsonb('related_data'), // Supporting data and references
  status: varchar('status', { length: 50 }).default('active'), // 'active', 'addressed', 'dismissed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// AI Recommendations Table
export const aiRecommendations = pgTable('ai_recommendations', {
  id: serial('id').primaryKey(),
  context: varchar('context', { length: 100 }).notNull(), // 'mission', 'department', 'project', etc.
  contextId: varchar('context_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'optimization', 'resource_allocation', 'timeline', 'budget'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  impact: varchar('impact', { length: 50 }).default('medium'), // 'low', 'medium', 'high'
  effort: varchar('effort', { length: 50 }).default('medium'), // 'low', 'medium', 'high'
  priority: integer('priority').default(5), // 1-10 scale
  estimatedBenefit: jsonb('estimated_benefit'), // Cost savings, time savings, etc.
  implementation: jsonb('implementation'), // Step-by-step guide
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'accepted', 'rejected', 'implemented'
  userId: varchar('user_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// AI Analytics Table
export const aiAnalytics = pgTable('ai_analytics', {
  id: serial('id').primaryKey(),
  context: varchar('context', { length: 100 }).notNull(),
  contextId: varchar('context_id', { length: 255 }),
  eventType: varchar('event_type', { length: 100 }).notNull(), // 'conversation_start', 'insight_generated', 'recommendation_accepted'
  eventData: jsonb('event_data'),
  userId: varchar('user_id', { length: 255 }),
  sessionId: varchar('session_id', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow()
});

// AI Contexts Table - tracks context awareness
export const aiContexts = pgTable('ai_contexts', {
  id: serial('id').primaryKey(),
  contextType: varchar('context_type', { length: 100 }).notNull(), // 'mission', 'department', 'user_session'
  contextId: varchar('context_id', { length: 255 }).notNull(),
  contextData: jsonb('context_data').notNull(), // Current state, relevant info, etc.
  lastAccessed: timestamp('last_accessed').defaultNow(),
  isActive: boolean('is_active').default(true)
});

// Mission Analysis Table - AI-generated mission analytics
export const missionAnalysis = pgTable('mission_analysis', {
  id: serial('id').primaryKey(),
  missionId: varchar('mission_id', { length: 255 }).notNull().unique(),
  analysisData: jsonb('analysis_data').notNull(), // Comprehensive analysis results
  riskScore: decimal('risk_score', { precision: 3, scale: 2 }), // 0.00 to 1.00
  healthScore: decimal('health_score', { precision: 3, scale: 2 }), // 0.00 to 1.00
  progressTrend: varchar('progress_trend', { length: 50 }), // 'improving', 'declining', 'stable'
  keyMetrics: jsonb('key_metrics'), // Important KPIs and metrics
  lastAnalyzed: timestamp('last_analyzed').defaultNow(),
  isStale: boolean('is_stale').default(false)
});

// Insert Schemas for type safety
export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({ id: true, createdAt: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiAnalyticsSchema = createInsertSchema(aiAnalytics).omit({ id: true, timestamp: true });
export const insertAiContextSchema = createInsertSchema(aiContexts).omit({ id: true, lastAccessed: true });
export const insertMissionAnalysisSchema = createInsertSchema(missionAnalysis).omit({ id: true, lastAnalyzed: true });

// Select Types
export type AiConversation = typeof aiConversations.$inferSelect;
export type AiMessage = typeof aiMessages.$inferSelect;
export type AiInsight = typeof aiInsights.$inferSelect;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type AiAnalytics = typeof aiAnalytics.$inferSelect;
export type AiContext = typeof aiContexts.$inferSelect;
export type MissionAnalysis = typeof missionAnalysis.$inferSelect;

// Insert Types
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type InsertAiAnalytics = z.infer<typeof insertAiAnalyticsSchema>;
export type InsertAiContext = z.infer<typeof insertAiContextSchema>;
export type InsertMissionAnalysis = z.infer<typeof insertMissionAnalysisSchema>;