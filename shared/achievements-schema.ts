import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Achievement definitions table
export const achievements = pgTable('achievements', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // workflow, milestone, streak, collaboration, etc.
  type: text('type').notNull(), // common, rare, epic, legendary (rarity level)
  points: integer('points').notNull().default(0),
  badgeIcon: text('badge_icon').notNull(), // icon name for display
  badgeColor: text('badge_color').notNull(), // color for the badge
  requirements: jsonb('requirements').notNull(), // conditions to unlock
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User achievements (unlocked achievements)
export const userAchievements = pgTable('user_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  progress: jsonb('progress'), // current progress towards achievement
  metadata: jsonb('metadata'), // additional data like completion details
});

// User progress tracking
export const userProgress = pgTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  category: text('category').notNull(), // workflow_completions, login_streak, etc.
  metric: text('metric').notNull(), // specific metric being tracked
  currentValue: integer('current_value').notNull().default(0),
  totalValue: integer('total_value').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  metadata: jsonb('metadata'), // additional tracking data
});

// Achievement rewards
export const achievementRewards = pgTable('achievement_rewards', {
  id: text('id').primaryKey(),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  rewardType: text('reward_type').notNull(), // badge, points, title, feature_unlock
  rewardValue: text('reward_value').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
});

// Leaderboards
export const leaderboards = pgTable('leaderboards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  timeframe: text('timeframe').notNull(), // daily, weekly, monthly, all_time
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User leaderboard entries
export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: text('id').primaryKey(),
  leaderboardId: text('leaderboard_id').notNull().references(() => leaderboards.id),
  userId: text('user_id').notNull(),
  score: integer('score').notNull().default(0),
  rank: integer('rank'),
  period: text('period').notNull(), // specific time period identifier
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Badges table
export const badges = pgTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  color: text('color'),
  pointsRequired: integer('points_required').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User profiles for gamification
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  displayName: text('display_name'),
  title: text('title'), // earned title from achievements
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  totalPoints: integer('total_points').notNull().default(0),
  streak: integer('streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  preferences: jsonb('preferences'), // notification preferences, display settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Insert schemas
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastUpdated: true,
});

export const insertAchievementRewardSchema = createInsertSchema(achievementRewards).omit({
  id: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  createdAt: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  lastUpdated: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type AchievementReward = typeof achievementRewards.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertAchievementReward = z.infer<typeof insertAchievementRewardSchema>;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;