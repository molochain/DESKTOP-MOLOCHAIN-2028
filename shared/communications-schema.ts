import { pgTable, serial, text, timestamp, boolean, integer, jsonb, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const messageChannels = pgTable('message_channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  config: jsonb('config').$type<ChannelConfig>(),
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
  metadata: jsonb('metadata').$type<Record<string, any>>(),
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
  variables: jsonb('variables').$type<Record<string, any>>(),
  priority: integer('priority').default(5).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  scheduledAt: timestamp('scheduled_at'),
  processedAt: timestamp('processed_at'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const deliveryLogs = pgTable('delivery_logs', {
  id: serial('id').primaryKey(),
  messageId: varchar('message_id', { length: 64 }).notNull(),
  channelType: varchar('channel_type', { length: 20 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  providerResponse: jsonb('provider_response').$type<Record<string, any>>(),
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
  preferences: jsonb('preferences').$type<NotificationPreferenceConfig>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'push' | 'webhook';

export type MessageStatus = 'pending' | 'queued' | 'processing' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface ChannelConfig {
  email?: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername?: string;
    smtpPassword?: string;
    fromEmail: string;
    fromName: string;
    useTls: boolean;
    usePleskRelay: boolean;
  };
  sms?: {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  whatsapp?: {
    provider: 'meta' | 'twilio';
    apiKey: string;
    phoneNumberId: string;
    businessAccountId: string;
  };
  push?: {
    vapidPublicKey: string;
    vapidPrivateKey: string;
  };
  webhook?: {
    url: string;
    headers: Record<string, string>;
    secret: string;
  };
}

export interface NotificationPreferenceConfig {
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  categories?: Record<string, boolean>;
  criticalOnly?: boolean;
}

export interface SendMessageRequest {
  channel: ChannelType;
  recipient: string;
  subject?: string;
  body?: string;
  templateSlug?: string;
  variables?: Record<string, any>;
  priority?: number;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
  status: MessageStatus;
  queuedAt: Date;
  estimatedDelivery?: Date;
}

export interface DeliveryStatus {
  messageId: string;
  channel: ChannelType;
  recipient: string;
  status: MessageStatus;
  attempts: number;
  lastAttemptAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

export interface ChannelStats {
  channel: ChannelType;
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
}

export const insertMessageChannelSchema = createInsertSchema(messageChannels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageQueueSchema = createInsertSchema(messageQueue).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeliveryLogSchema = createInsertSchema(deliveryLogs).omit({ id: true, createdAt: true });
export const insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertMessageChannel = z.infer<typeof insertMessageChannelSchema>;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type InsertMessageQueue = z.infer<typeof insertMessageQueueSchema>;
export type InsertDeliveryLog = z.infer<typeof insertDeliveryLogSchema>;
export type InsertUserNotificationPreferences = z.infer<typeof insertUserNotificationPreferencesSchema>;

export type MessageChannel = typeof messageChannels.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type MessageQueueItem = typeof messageQueue.$inferSelect;
export type DeliveryLog = typeof deliveryLogs.$inferSelect;
export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;

export const sendMessageRequestSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'webhook']),
  recipient: z.string().min(1),
  subject: z.string().optional(),
  body: z.string().optional(),
  templateSlug: z.string().optional(),
  variables: z.record(z.any()).optional(),
  priority: z.number().min(1).max(10).optional(),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
}).refine(data => data.body || data.templateSlug, {
  message: 'Either body or templateSlug must be provided',
});
