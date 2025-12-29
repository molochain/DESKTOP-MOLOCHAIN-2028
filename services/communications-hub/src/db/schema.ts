import { pgTable, serial, text, timestamp, boolean, integer, jsonb, varchar } from 'drizzle-orm/pg-core';

export const messageChannels = pgTable('message_channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  config: jsonb('config'),
  priority: integer('priority').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messageTemplates = pgTable('message_templates', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  channelType: varchar('channel_type', { length: 20 }).notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  variables: jsonb('variables').$type<string[]>().default([]),
  metadata: jsonb('metadata'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messageQueue = pgTable('message_queue', {
  id: serial('id').primaryKey(),
  messageId: varchar('message_id', { length: 64 }).notNull().unique(),
  channelType: varchar('channel_type', { length: 20 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  templateId: integer('template_id').references(() => messageTemplates.id),
  variables: jsonb('variables'),
  priority: integer('priority').default(5).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  scheduledAt: timestamp('scheduled_at'),
  processedAt: timestamp('processed_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const deliveryLogs = pgTable('delivery_logs', {
  id: serial('id').primaryKey(),
  messageId: varchar('message_id', { length: 64 }).notNull(),
  channelType: varchar('channel_type', { length: 20 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  providerResponse: jsonb('provider_response'),
  errorMessage: text('error_message'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userNotificationPreferences = pgTable('user_notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  channelType: varchar('channel_type', { length: 20 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  address: varchar('address', { length: 255 }),
  preferences: jsonb('preferences'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type MessageChannel = typeof messageChannels.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type MessageQueueItem = typeof messageQueue.$inferSelect;
export type DeliveryLog = typeof deliveryLogs.$inferSelect;
export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
