import { pgTable, text, integer, timestamp, boolean, decimal, jsonb, json, varchar, uuid, index, foreignKey, primaryKey, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export interface UserSession {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'moderator' | 'manager' | 'analyst' | 'developer' | 'executive' | 'premium' | 'company' | 'department' | 'guest';
  permissions: string[];
  isActive: boolean;
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  company: varchar("company", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  department: varchar("department", { length: 100 }), // Department assignment
  permissions: json("permissions").$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"),
  recoveryCodes: json("recovery_codes").default([]).$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Refresh tokens table for session management
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("refresh_tokens_user_idx").on(table.userId),
  tokenIdx: index("refresh_tokens_token_idx").on(table.tokenHash),
  expiresIdx: index("refresh_tokens_expires_idx").on(table.expiresAt),
}));

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// Services table
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon"),
  imageUrl: text("image_url"),
  features: jsonb("features").notNull().$type<string[]>(),
  benefits: jsonb("benefits").notNull().$type<string[]>(),
  additionalInfo: text("additional_info"),
  relatedServices: jsonb("related_services").$type<string[]>(),
  pricing: text("pricing"),
  deliveryTime: text("delivery_time"),
  coverage: text("coverage"),
  tags: jsonb("tags").$type<string[]>(),
  serviceStats: jsonb("service_stats").$type<{label: string, value: string, icon?: string}[]>(),
  certifications: jsonb("certifications").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  popularity: integer("popularity").default(0),
  version: integer("version").default(1).notNull(),
  syncedAt: timestamp("synced_at"),
  cmsContentHash: text("cms_content_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("services_category_idx").on(table.category),
  activeIdx: index("services_active_idx").on(table.isActive),
}));

// Service availability table
export const serviceAvailability = pgTable("service_availability", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  location: text("location").notNull(),
  available: boolean("available").default(true),
  capacity: integer("capacity"),
  nextAvailable: timestamp("next_available"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  serviceLocationIdx: index("service_availability_idx").on(table.serviceId, table.location),
}));

// Service inquiries table
export const serviceInquiries = pgTable("service_inquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Form Types Table =============
export const formTypes = pgTable("form_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  slugIdx: index("form_types_slug_idx").on(table.slug),
  activeIdx: index("form_types_active_idx").on(table.isActive),
}));

export const insertFormTypeSchema = createInsertSchema(formTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertFormType = z.infer<typeof insertFormTypeSchema>;
export type FormType = typeof formTypes.$inferSelect;

// Contact form submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  formTypeId: integer("form_type_id").references(() => formTypes.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  formTypeIdx: index("contact_submissions_form_type_idx").on(table.formTypeId),
  statusIdx: index("contact_submissions_status_idx").on(table.status),
}));

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Service testimonials table
export const serviceTestimonials = pgTable("service_testimonials", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  customerName: text("customer_name").notNull(),
  company: text("company"),
  rating: integer("rating").notNull(),
  testimonial: text("testimonial").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service FAQs table
export const serviceFaqs = pgTable("service_faqs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("active"),
  clientId: integer("client_id").references(() => users.id),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  deadline: timestamp("deadline"),
  teamMembers: jsonb("team_members").$type<number[]>(),
  servicesUsed: jsonb("services_used").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commodities table
export const commodities = pgTable("commodities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  unit: text("unit"),
  origin: text("origin"),
  specifications: jsonb("specifications"),
  availability: text("availability"),
  minOrder: decimal("min_order", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Page and Module Management Tables
export const pageModules = pgTable("page_modules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  type: text("type").notNull(), // 'page' | 'module' | 'service' | 'department'
  category: text("category").notNull(), // 'public' | 'protected' | 'admin' | 'developer' | 'department'
  path: text("path").notNull().unique(),
  componentPath: text("component_path").notNull(),
  description: text("description"),
  icon: text("icon"),
  parentId: integer("parent_id"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  isVisible: boolean("is_visible").default(true),
  requiresAuth: boolean("requires_auth").default(false),
  requiredRole: text("required_role"),
  metadata: jsonb("metadata").$type<{
    lazy?: boolean;
    exact?: boolean;
    layout?: string;
    permissions?: string[];
    tags?: string[];
    searchKeywords?: string[];
  }>(),
  config: jsonb("config").$type<{
    showInMenu?: boolean;
    showInSidebar?: boolean;
    showInSearch?: boolean;
    customProps?: Record<string, any>;
  }>(),
  analytics: jsonb("analytics").$type<{
    viewCount?: number;
    lastAccessed?: string;
    popularityScore?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("page_modules_type_idx").on(table.type),
  categoryIdx: index("page_modules_category_idx").on(table.category),
  activeIdx: index("page_modules_active_idx").on(table.isActive),
  parentIdx: index("page_modules_parent_idx").on(table.parentId),
}));

// Module Dependencies table for tracking inter-module dependencies
export const moduleDependencies = pgTable("module_dependencies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer("module_id").notNull().references(() => pageModules.id),
  dependsOnId: integer("depends_on_id").notNull().references(() => pageModules.id),
  dependencyType: text("dependency_type").notNull(), // 'required' | 'optional' | 'peer'
  version: text("version"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  moduleIdx: index("module_dependencies_module_idx").on(table.moduleId),
  dependsOnIdx: index("module_dependencies_depends_idx").on(table.dependsOnId),
}));

// Module Settings table for storing module-specific configurations
export const moduleSettings = pgTable("module_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer("module_id").notNull().references(() => pageModules.id),
  settingKey: text("setting_key").notNull(),
  settingValue: jsonb("setting_value"),
  settingType: text("setting_type").notNull(), // 'string' | 'number' | 'boolean' | 'json' | 'array'
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  moduleSettingIdx: index("module_settings_idx").on(table.moduleId, table.settingKey),
}));

// User Module Access table for tracking user-specific module permissions
export const userModuleAccess = pgTable("user_module_access", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => pageModules.id),
  hasAccess: boolean("has_access").default(true),
  customPermissions: jsonb("custom_permissions").$type<string[]>(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userModuleIdx: index("user_module_access_idx").on(table.userId, table.moduleId),
}));

// Module Activity Logs
export const moduleActivityLogs = pgTable("module_activity_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer("module_id").notNull().references(() => pageModules.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // 'view' | 'edit' | 'activate' | 'deactivate' | 'configure'
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  moduleUserIdx: index("module_activity_logs_idx").on(table.moduleId, table.userId),
  actionIdx: index("module_activity_action_idx").on(table.action),
}));

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  inquiries: many(serviceInquiries),
  moduleAccess: many(userModuleAccess),
  moduleActivityLogs: many(moduleActivityLogs),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  availability: many(serviceAvailability),
  inquiries: many(serviceInquiries),
  testimonials: many(serviceTestimonials),
  faqs: many(serviceFaqs),
  bookings: many(serviceBookings),
  reviews: many(serviceReviews),
  pricingTiers: many(servicePricingTiers),
  metrics: many(serviceMetrics),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
}));

export const pageModulesRelations = relations(pageModules, ({ many, one }) => ({
  children: many(pageModules),
  parent: one(pageModules, {
    fields: [pageModules.parentId],
    references: [pageModules.id],
  }),
  dependencies: many(moduleDependencies),
  dependents: many(moduleDependencies),
  settings: many(moduleSettings),
  userAccess: many(userModuleAccess),
  activityLogs: many(moduleActivityLogs),
}));

export const moduleDependenciesRelations = relations(moduleDependencies, ({ one }) => ({
  module: one(pageModules, {
    fields: [moduleDependencies.moduleId],
    references: [pageModules.id],
  }),
  dependsOn: one(pageModules, {
    fields: [moduleDependencies.dependsOnId],
    references: [pageModules.id],
  }),
}));

export const moduleSettingsRelations = relations(moduleSettings, ({ one }) => ({
  module: one(pageModules, {
    fields: [moduleSettings.moduleId],
    references: [pageModules.id],
  }),
}));

export const userModuleAccessRelations = relations(userModuleAccess, ({ one }) => ({
  user: one(users, {
    fields: [userModuleAccess.userId],
    references: [users.id],
  }),
  module: one(pageModules, {
    fields: [userModuleAccess.moduleId],
    references: [pageModules.id],
  }),
}));

export const moduleActivityLogsRelations = relations(moduleActivityLogs, ({ one }) => ({
  module: one(pageModules, {
    fields: [moduleActivityLogs.moduleId],
    references: [pageModules.id],
  }),
  user: one(users, {
    fields: [moduleActivityLogs.userId],
    references: [users.id],
  }),
}));

// API Keys table for third-party integrations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 64 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  scopes: text("scopes").array().default(sql`ARRAY[]::text[]`),
  rateLimit: integer("rate_limit").default(1000),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// API Key usage tracking
export const apiKeyUsage = pgTable("api_key_usage", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Rate limit overrides for specific users/IPs
export const rateLimitOverrides = pgTable("rate_limit_overrides", {
  id: serial("id").primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  maxRequests: integer("max_requests").notNull(),
  windowMs: integer("window_ms").notNull(),
  reason: text("reason"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Security audit logs
export const securityAudits = pgTable("security_audits", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  requestPath: varchar("request_path", { length: 500 }),
  requestMethod: varchar("request_method", { length: 10 }),
  statusCode: integer("status_code"),
  details: text("details"),
  severity: varchar("severity", { length: 20 }).default('low'),
  timestamp: timestamp("timestamp").defaultNow()
});

// Performance metrics table
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 20 }),
  tags: text("tags"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Service Bookings table
export const serviceBookings = pgTable("service_bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  userId: integer("user_id").references(() => users.id),
  bookingNumber: text("booking_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  companyName: text("company_name"),
  bookingDate: timestamp("booking_date").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  quantity: integer("quantity").default(1),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  currency: text("currency").default("USD"),
  paymentStatus: text("payment_status").default("pending"), // pending, partial, paid, refunded
  pickupLocation: text("pickup_location"),
  deliveryLocation: text("delivery_location"),
  cargoDetails: jsonb("cargo_details").$type<{weight?: string, dimensions?: string, type?: string, special?: string[]}>(),
  specialRequirements: text("special_requirements"),
  documents: jsonb("documents").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  serviceUserIdx: index("service_bookings_idx").on(table.serviceId, table.userId),
  statusIdx: index("booking_status_idx").on(table.status),
  dateIdx: index("booking_date_idx").on(table.bookingDate),
}));

// Service Reviews and Ratings table
export const serviceReviews = pgTable("service_reviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  bookingId: integer("booking_id").references(() => serviceBookings.id),
  userId: integer("user_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  review: text("review").notNull(),
  pros: jsonb("pros").$type<string[]>(),
  cons: jsonb("cons").$type<string[]>(),
  wouldRecommend: boolean("would_recommend").default(true),
  verifiedPurchase: boolean("verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  images: jsonb("images").$type<string[]>(),
  response: text("response"), // Company response
  responseDate: timestamp("response_date"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  serviceRatingIdx: index("service_reviews_idx").on(table.serviceId, table.rating),
  userReviewIdx: index("user_reviews_idx").on(table.userId),
}));

// Service Pricing Tiers table
export const servicePricingTiers = pgTable("service_pricing_tiers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  tierName: text("tier_name").notNull(), // Basic, Standard, Premium, Enterprise
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  billingPeriod: text("billing_period"), // one-time, hourly, daily, weekly, monthly, yearly
  features: jsonb("features").$type<string[]>(),
  limitations: jsonb("limitations").$type<{maxQuantity?: number, maxWeight?: string, regions?: string[]}>(),
  discounts: jsonb("discounts").$type<{volume?: {min: number, discount: number}[], seasonal?: {code: string, percent: number}[]}>(),
  minOrder: decimal("min_order", { precision: 10, scale: 2 }),
  maxOrder: decimal("max_order", { precision: 10, scale: 2 }),
  setupFee: decimal("setup_fee", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  serviceTierIdx: index("service_pricing_idx").on(table.serviceId, table.tierName),
  activeIdx: index("pricing_active_idx").on(table.isActive),
}));

// Service Metrics and Analytics table
export const serviceMetrics = pgTable("service_metrics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: text("service_id").notNull().references(() => services.id),
  metricDate: timestamp("metric_date").notNull(),
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  bookings: integer("bookings").default(0),
  completedBookings: integer("completed_bookings").default(0),
  cancelledBookings: integer("cancelled_bookings").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }), // inquiries to bookings
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // completed vs total bookings
  averageDeliveryTime: integer("average_delivery_time"), // in hours
  customerSatisfaction: decimal("customer_satisfaction", { precision: 5, scale: 2 }), // percentage
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }), // overall service score
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  serviceDateIdx: index("service_metrics_idx").on(table.serviceId, table.metricDate),
}));

// Service Comparison table for tracking comparisons
export const serviceComparisons = pgTable("service_comparisons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  comparedServices: jsonb("compared_services").$type<string[]>().notNull(),
  comparisonCriteria: jsonb("comparison_criteria").$type<string[]>(),
  selectedService: text("selected_service"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userComparisonIdx: index("service_comparisons_idx").on(table.userId),
}));

// User Favorite Services table
export const userFavoriteServices = pgTable("user_favorite_services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceId: text("service_id").notNull().references(() => services.id),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>(),
  notifyOnPriceChange: boolean("notify_on_price_change").default(false),
  notifyOnAvailability: boolean("notify_on_availability").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userServiceIdx: index("user_favorite_services_idx").on(table.userId, table.serviceId),
  userIdx: index("user_favorites_user_idx").on(table.userId),
}));

// Investment rounds table
export const investmentRounds = pgTable("investment_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  minimumInvestment: decimal("minimum_investment", { precision: 10, scale: 2 }).notNull(),
  maximumInvestment: decimal("maximum_investment", { precision: 10, scale: 2 }),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).default("0"),
  tokenPrice: decimal("token_price", { precision: 10, scale: 6 }),
  tokensAvailable: decimal("tokens_available", { precision: 18, scale: 6 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("upcoming"), // 'upcoming', 'active', 'closed', 'completed'
  roundType: text("round_type").default("seed"), // 'pre-seed', 'seed', 'series-a', 'series-b', 'public'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("investment_rounds_status_idx").on(table.status),
}));

// Investors table
export const investors = pgTable("investors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id).notNull(),
  kycStatus: text("kyc_status").default("pending"), // 'pending', 'submitted', 'verified', 'rejected'
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  accreditedStatus: boolean("accredited_status").default(false),
  accreditationDocuments: jsonb("accreditation_documents").$type<string[]>(),
  totalInvested: decimal("total_invested", { precision: 15, scale: 2 }).default("0"),
  walletAddresses: jsonb("wallet_addresses").$type<{address: string, chain: string}[]>(),
  preferredPaymentMethod: text("preferred_payment_method"), // 'credit_card', 'crypto', 'wire'
  investorType: text("investor_type").default("individual"), // 'individual', 'institutional', 'angel'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("investors_user_idx").on(table.userId),
  kycStatusIdx: index("investors_kyc_status_idx").on(table.kycStatus),
}));

// Investments table
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").references(() => investors.id).notNull(),
  roundId: varchar("round_id").references(() => investmentRounds.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"), // 'USD', 'ETH', 'BTC', 'USDC'
  paymentMethod: text("payment_method").notNull(), // 'stripe', 'crypto', 'wire'
  paymentId: text("payment_id"), // Stripe payment ID or transaction hash
  status: text("status").default("pending"), // 'pending', 'processing', 'confirmed', 'failed', 'refunded'
  tokensAllocated: decimal("tokens_allocated", { precision: 18, scale: 6 }),
  tokenVestingSchedule: jsonb("token_vesting_schedule").$type<{date: string, amount: number}[]>(),
  transactionHash: text("transaction_hash"), // For crypto payments
  blockNumber: integer("block_number"), // For crypto payments
  chainId: integer("chain_id"), // For crypto payments
  investmentDocuments: jsonb("investment_documents").$type<string[]>(),
  notes: text("notes"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  investorIdx: index("investments_investor_idx").on(table.investorId),
  roundIdx: index("investments_round_idx").on(table.roundId),
  statusIdx: index("investments_status_idx").on(table.status),
}));

// Investment transactions table (for payment processing)
export const investmentTransactions = pgTable("investment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investmentId: varchar("investment_id").references(() => investments.id).notNull(),
  transactionType: text("transaction_type").notNull(), // 'payment', 'refund', 'fee', 'conversion'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  processorReference: text("processor_reference"), // Stripe intent ID, Coinbase charge ID, etc.
  processorResponse: jsonb("processor_response"), // Full response from payment processor
  status: text("status").default("pending"), // 'pending', 'completed', 'failed'
  fee: decimal("fee", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  investmentIdx: index("investment_transactions_investment_idx").on(table.investmentId),
  statusIdx: index("investment_transactions_status_idx").on(table.status),
}));

// User wallets table (for crypto payments)
export const userWallets = pgTable("user_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  address: text("address").notNull(),
  chainId: integer("chain_id").notNull(),
  chainName: text("chain_name").notNull(), // 'ethereum', 'polygon', 'bsc', 'arbitrum'
  walletType: text("wallet_type"), // 'metamask', 'walletconnect', 'coinbase'
  isPrimary: boolean("is_primary").default(false),
  verificationSignature: text("verification_signature"), // Signature for ownership verification
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_wallets_user_idx").on(table.userId),
  addressIdx: index("user_wallets_address_idx").on(table.address),
}));

// Instagram Marketing Module Tables

// Instagram accounts table
export const instagramAccounts = pgTable("instagram_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  instagramUserId: text("instagram_user_id").notNull().unique(),
  username: text("username").notNull(),
  accessToken: text("access_token").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  mediaCount: integer("media_count").default(0),
  bio: text("bio"),
  isBusinessAccount: boolean("is_business_account").default(false),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("instagram_accounts_user_idx").on(table.userId),
}));

// Instagram posts table
export const instagramPosts = pgTable("instagram_posts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  instagramPostId: text("instagram_post_id").unique(),
  mediaType: text("media_type"),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  hashtags: jsonb("hashtags").$type<string[]>(),
  permalink: text("permalink"),
  isScheduled: boolean("is_scheduled").default(false),
  scheduledPublishTime: timestamp("scheduled_publish_time"),
  publishedAt: timestamp("published_at"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_posts_account_idx").on(table.accountId),
  scheduledIdx: index("instagram_posts_scheduled_idx").on(table.scheduledPublishTime),
}));

// Instagram analytics table
export const instagramAnalytics = pgTable("instagram_analytics", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  profileViews: integer("profile_views").default(0),
  websiteClicks: integer("website_clicks").default(0),
  emailClicks: integer("email_clicks").default(0),
  callClicks: integer("call_clicks").default(0),
  newFollowers: integer("new_followers").default(0),
  lostFollowers: integer("lost_followers").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  topLocations: jsonb("top_locations"),
  topHashtags: jsonb("top_hashtags").$type<{hashtag: string, reach: number}[]>(),
  audienceDemographics: jsonb("audience_demographics"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  accountDateIdx: index("instagram_analytics_account_date_idx").on(table.accountId, table.date),
}));

// Instagram templates table
export const instagramTemplates = pgTable("instagram_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"), // logistics_update, blockchain_feature, milestone, promotion
  captionTemplate: text("caption_template").notNull(),
  hashtagSets: jsonb("hashtag_sets"),
  mediaRequirements: jsonb("media_requirements"),
  variables: jsonb("variables"), // placeholders for dynamic content
  isActive: boolean("is_active").default(true),
  useCount: integer("use_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  activeIdx: index("instagram_templates_active_idx").on(table.isActive),
}));

// Instagram comments table
export const instagramComments = pgTable("instagram_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => instagramPosts.id),
  commentId: text("comment_id").unique(),
  username: text("username").notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  isReply: boolean("is_reply").default(false),
  parentCommentId: text("parent_comment_id"),
  sentiment: text("sentiment"), // positive, neutral, negative
  isHidden: boolean("is_hidden").default(false),
  repliedAt: timestamp("replied_at"),
  replyText: text("reply_text"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  postIdx: index("instagram_comments_post_idx").on(table.postId),
  sentimentIdx: index("instagram_comments_sentiment_idx").on(table.sentiment),
}));

// Instagram campaigns table
export const instagramCampaigns = pgTable("instagram_campaigns", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("draft"), // draft, active, paused, completed
  goals: jsonb("goals").$type<{metric: string, target: number}[]>(),
  hashtags: jsonb("hashtags").$type<string[]>(),
  targetAudience: jsonb("target_audience"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  totalReach: integer("total_reach").default(0),
  totalEngagement: integer("total_engagement").default(0),
  totalPosts: integer("total_posts").default(0),
  roi: decimal("roi", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_campaigns_account_idx").on(table.accountId),
  statusIdx: index("instagram_campaigns_status_idx").on(table.status),
  dateIdx: index("instagram_campaigns_date_idx").on(table.startDate, table.endDate),
}));

// Instagram Stories table
export const instagramStories = pgTable("instagram_stories", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  storyId: text("story_id").unique(),
  mediaType: text("media_type"), // photo, video
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  stickers: jsonb("stickers"), // poll, question, countdown, etc.
  mentions: jsonb("mentions").$type<string[]>(),
  location: jsonb("location"),
  isScheduled: boolean("is_scheduled").default(false),
  scheduledPublishTime: timestamp("scheduled_publish_time"),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  viewsCount: integer("views_count").default(0),
  repliesCount: integer("replies_count").default(0),
  exitsCount: integer("exits_count").default(0),
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  tapsForward: integer("taps_forward").default(0),
  tapsBack: integer("taps_back").default(0),
  isHighlight: boolean("is_highlight").default(false),
  highlightName: text("highlight_name"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_stories_account_idx").on(table.accountId),
  scheduledIdx: index("instagram_stories_scheduled_idx").on(table.scheduledPublishTime),
  highlightIdx: index("instagram_stories_highlight_idx").on(table.isHighlight),
}));

// Instagram Reels table
export const instagramReels = pgTable("instagram_reels", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  reelId: text("reel_id").unique(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  hashtags: jsonb("hashtags").$type<string[]>(),
  audioTrack: jsonb("audio_track"), // trending audio info
  effects: jsonb("effects").$type<string[]>(),
  duration: integer("duration"), // in seconds
  isScheduled: boolean("is_scheduled").default(false),
  scheduledPublishTime: timestamp("scheduled_publish_time"),
  publishedAt: timestamp("published_at"),
  playsCount: integer("plays_count").default(0),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  savesCount: integer("saves_count").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  averageWatchTime: integer("average_watch_time"), // in seconds
  completionRate: real("completion_rate"), // percentage
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_reels_account_idx").on(table.accountId),
  scheduledIdx: index("instagram_reels_scheduled_idx").on(table.scheduledPublishTime),
}));

// Instagram Influencers table for collaboration
export const instagramInfluencers = pgTable("instagram_influencers", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => instagramAccounts.id),
  username: text("username").notNull().unique(),
  fullName: text("full_name"),
  profilePictureUrl: text("profile_picture_url"),
  bio: text("bio"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  postsCount: integer("posts_count").default(0),
  engagementRate: real("engagement_rate"),
  averageLikes: integer("average_likes"),
  averageComments: integer("average_comments"),
  category: text("category"), // micro, macro, mega, celebrity
  niche: jsonb("niche").$type<string[]>(), // logistics, tech, blockchain, etc.
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  collaborationStatus: text("collaboration_status"), // interested, contacted, negotiating, active, inactive
  collaborationHistory: jsonb("collaboration_history"),
  rateCard: jsonb("rate_card"), // pricing for different types of posts
  lastAnalyzed: timestamp("last_analyzed"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_influencers_account_idx").on(table.accountId),
  categoryIdx: index("instagram_influencers_category_idx").on(table.category),
  statusIdx: index("instagram_influencers_status_idx").on(table.collaborationStatus),
}));

// Instagram Competitors table for monitoring
export const instagramCompetitors = pgTable("instagram_competitors", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => instagramAccounts.id),
  competitorUsername: text("competitor_username").notNull(),
  competitorUserId: text("competitor_user_id"),
  profilePictureUrl: text("profile_picture_url"),
  bio: text("bio"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  postsCount: integer("posts_count").default(0),
  averageEngagement: real("average_engagement"),
  postingFrequency: real("posting_frequency"), // posts per week
  topHashtags: jsonb("top_hashtags").$type<string[]>(),
  topMentions: jsonb("top_mentions").$type<string[]>(),
  contentThemes: jsonb("content_themes").$type<string[]>(),
  bestPostingTimes: jsonb("best_posting_times"),
  growthRate: real("growth_rate"), // monthly follower growth percentage
  lastPostDate: timestamp("last_post_date"),
  lastAnalyzed: timestamp("last_analyzed"),
  trackingEnabled: boolean("tracking_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_competitors_account_idx").on(table.accountId),
  trackingIdx: index("instagram_competitors_tracking_idx").on(table.trackingEnabled),
}));

// Instagram A/B Tests table
export const instagramABTests = pgTable("instagram_ab_tests", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  testName: text("test_name").notNull(),
  testType: text("test_type"), // caption, hashtags, posting_time, media_type, etc.
  status: text("status").default("draft"), // draft, running, completed, cancelled
  variantA: jsonb("variant_a").notNull(),
  variantB: jsonb("variant_b").notNull(),
  variantAPostId: integer("variant_a_post_id").references(() => instagramPosts.id),
  variantBPostId: integer("variant_b_post_id").references(() => instagramPosts.id),
  sampleSize: integer("sample_size"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  winningVariant: text("winning_variant"), // A or B
  metrics: jsonb("metrics"), // engagement, reach, clicks, etc.
  confidenceLevel: real("confidence_level"), // statistical confidence
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_ab_tests_account_idx").on(table.accountId),
  statusIdx: index("instagram_ab_tests_status_idx").on(table.status),
}));

// Instagram Shopping Products table
export const instagramShoppingProducts = pgTable("instagram_shopping_products", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => instagramAccounts.id),
  productId: text("product_id").unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: text("currency").default("USD"),
  imageUrl: text("image_url").notNull(),
  additionalImages: jsonb("additional_images").$type<string[]>(),
  productUrl: text("product_url"),
  sku: text("sku"),
  inventory: integer("inventory"),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  postsTagged: integer("posts_tagged").default(0),
  clicksCount: integer("clicks_count").default(0),
  purchasesCount: integer("purchases_count").default(0),
  revenue: integer("revenue").default(0), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountIdx: index("instagram_shopping_products_account_idx").on(table.accountId),
  activeIdx: index("instagram_shopping_products_active_idx").on(table.isActive),
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertServiceBookingSchema = createInsertSchema(serviceBookings);
export const insertServiceReviewSchema = createInsertSchema(serviceReviews);
export const insertServicePricingTierSchema = createInsertSchema(servicePricingTiers);
export const insertServiceMetricSchema = createInsertSchema(serviceMetrics);
export const insertServiceComparisonSchema = createInsertSchema(serviceComparisons);
export const insertServiceSchema = createInsertSchema(services);
export const insertInvestmentRoundSchema = createInsertSchema(investmentRounds);
export const insertInvestorSchema = createInsertSchema(investors);
export const insertInvestmentSchema = createInsertSchema(investments);
export const insertInvestmentTransactionSchema = createInsertSchema(investmentTransactions);
export const insertUserWalletSchema = createInsertSchema(userWallets);
export const insertInstagramAccountSchema = createInsertSchema(instagramAccounts);
export const insertInstagramPostSchema = createInsertSchema(instagramPosts);
export const insertInstagramAnalyticsSchema = createInsertSchema(instagramAnalytics);
export const insertInstagramTemplateSchema = createInsertSchema(instagramTemplates);
export const insertInstagramCommentSchema = createInsertSchema(instagramComments);
export const insertInstagramCampaignSchema = createInsertSchema(instagramCampaigns);
export const insertProjectSchema = createInsertSchema(projects);
export const insertCommoditySchema = createInsertSchema(commodities);
export const insertServiceInquirySchema = createInsertSchema(serviceInquiries);
export const insertServiceTestimonialSchema = createInsertSchema(serviceTestimonials);
export const insertServiceFaqSchema = createInsertSchema(serviceFaqs);
export const insertPageModuleSchema = createInsertSchema(pageModules);
export const insertModuleDependencySchema = createInsertSchema(moduleDependencies);
export const insertModuleSettingSchema = createInsertSchema(moduleSettings);
export const insertUserModuleAccessSchema = createInsertSchema(userModuleAccess);
export const insertModuleActivityLogSchema = createInsertSchema(moduleActivityLogs);
export const insertApiKeySchema = createInsertSchema(apiKeys);
export const insertApiKeyUsageSchema = createInsertSchema(apiKeyUsage);
export const insertRateLimitOverrideSchema = createInsertSchema(rateLimitOverrides);
export const insertSecurityAuditSchema = createInsertSchema(securityAudits);
export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics);

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Commodity = typeof commodities.$inferSelect;
export type InsertCommodity = z.infer<typeof insertCommoditySchema>;
export type ServiceInquiry = typeof serviceInquiries.$inferSelect;
export type InsertServiceInquiry = z.infer<typeof insertServiceInquirySchema>;
export type ServiceTestimonial = typeof serviceTestimonials.$inferSelect;
export type InsertServiceTestimonial = z.infer<typeof insertServiceTestimonialSchema>;
export type ServiceFaq = typeof serviceFaqs.$inferSelect;
export type InsertServiceFaq = z.infer<typeof insertServiceFaqSchema>;
export type PageModule = typeof pageModules.$inferSelect;
export type InsertPageModule = z.infer<typeof insertPageModuleSchema>;
export type ModuleDependency = typeof moduleDependencies.$inferSelect;
export type InsertModuleDependency = z.infer<typeof insertModuleDependencySchema>;
export type ModuleSetting = typeof moduleSettings.$inferSelect;
export type InsertModuleSetting = z.infer<typeof insertModuleSettingSchema>;
export type UserModuleAccess = typeof userModuleAccess.$inferSelect;
export type InsertUserModuleAccess = z.infer<typeof insertUserModuleAccessSchema>;
export type ModuleActivityLog = typeof moduleActivityLogs.$inferSelect;
export type InsertModuleActivityLog = z.infer<typeof insertModuleActivityLogSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKeyUsage = typeof apiKeyUsage.$inferSelect;
export type InsertApiKeyUsage = z.infer<typeof insertApiKeyUsageSchema>;
export type RateLimitOverride = typeof rateLimitOverrides.$inferSelect;
export type InsertRateLimitOverride = z.infer<typeof insertRateLimitOverrideSchema>;
export type SecurityAudit = typeof securityAudits.$inferSelect;
export type InsertSecurityAudit = z.infer<typeof insertSecurityAuditSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type ServiceReview = typeof serviceReviews.$inferSelect;
export type InsertServiceReview = z.infer<typeof insertServiceReviewSchema>;
export type ServicePricingTier = typeof servicePricingTiers.$inferSelect;
export type InsertServicePricingTier = z.infer<typeof insertServicePricingTierSchema>;
export type ServiceMetric = typeof serviceMetrics.$inferSelect;
export type InsertServiceMetric = z.infer<typeof insertServiceMetricSchema>;
export type ServiceComparison = typeof serviceComparisons.$inferSelect;
export type InsertServiceComparison = z.infer<typeof insertServiceComparisonSchema>;
export type InvestmentRound = typeof investmentRounds.$inferSelect;
export type InsertInvestmentRound = z.infer<typeof insertInvestmentRoundSchema>;
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;
export type InsertInvestmentTransaction = z.infer<typeof insertInvestmentTransactionSchema>;
export type UserWallet = typeof userWallets.$inferSelect;
export type InsertUserWallet = z.infer<typeof insertUserWalletSchema>;
export type InstagramAccount = typeof instagramAccounts.$inferSelect;
export type InsertInstagramAccount = z.infer<typeof insertInstagramAccountSchema>;
export type InstagramPost = typeof instagramPosts.$inferSelect;
export type InsertInstagramPost = z.infer<typeof insertInstagramPostSchema>;
export type InstagramAnalytics = typeof instagramAnalytics.$inferSelect;
export type InsertInstagramAnalytics = z.infer<typeof insertInstagramAnalyticsSchema>;
export type InstagramTemplate = typeof instagramTemplates.$inferSelect;
export type InsertInstagramTemplate = z.infer<typeof insertInstagramTemplateSchema>;
export type InstagramComment = typeof instagramComments.$inferSelect;
export type InsertInstagramComment = z.infer<typeof insertInstagramCommentSchema>;
export type InstagramCampaign = typeof instagramCampaigns.$inferSelect;
export type InsertInstagramCampaign = z.infer<typeof insertInstagramCampaignSchema>;

// Rayanava AI Memory & Learning Tables
export const rayanavaMemory = pgTable('rayanava_memory', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  contextType: varchar('context_type'), // 'user_preference', 'business_context', 'interaction_pattern'
  contextKey: varchar('context_key'),
  contextValue: text('context_value'),
  confidence: integer('confidence').default(50), // 0-100 confidence score
  lastUpdated: timestamp('last_updated').defaultNow(),
  usageCount: integer('usage_count').default(1),
  metadata: jsonb('metadata')
});

export const rayanavaConversations = pgTable('rayanava_conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionId: varchar('session_id'),
  message: text('message'),
  response: text('response'),
  intent: varchar('intent'), // detected intent
  sentiment: varchar('sentiment'), // positive, negative, neutral
  topics: text('topics').array(), // extracted topics
  entities: jsonb('entities'), // extracted entities
  feedback: varchar('feedback'), // user feedback: helpful, not_helpful
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata')
});

export const rayanavaAnalytics = pgTable('rayanava_analytics', {
  id: serial('id').primaryKey(),
  metricType: varchar('metric_type'), // 'usage', 'performance', 'accuracy', 'satisfaction'
  metricName: varchar('metric_name'),
  metricValue: real('metric_value'),
  dimension: varchar('dimension'), // feature, user_segment, time_period
  dimensionValue: varchar('dimension_value'),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata')
});

export const rayanavaLearning = pgTable('rayanava_learning', {
  id: serial('id').primaryKey(),
  modelType: varchar('model_type'), // 'preference', 'pattern', 'optimization'
  featureName: varchar('feature_name'),
  featureValue: jsonb('feature_value'),
  outcome: varchar('outcome'),
  reward: real('reward'), // reinforcement learning reward
  confidence: real('confidence'),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata')
});

export const rayanavaWorkflows = pgTable('rayanava_workflows', {
  id: serial('id').primaryKey(),
  workflowId: varchar('workflow_id').unique(),
  name: varchar('name'),
  description: text('description'),
  type: varchar('type'), // 'automation', 'analysis', 'generation', 'optimization'
  steps: jsonb('steps'), // workflow steps definition
  triggers: jsonb('triggers'), // workflow triggers
  schedule: varchar('schedule'), // cron expression if scheduled
  active: boolean('active').default(true),
  executionCount: integer('execution_count').default(0),
  lastExecuted: timestamp('last_executed'),
  avgExecutionTime: integer('avg_execution_time'), // milliseconds
  successRate: real('success_rate'),
  createdAt: timestamp('created_at').defaultNow(),
  metadata: jsonb('metadata')
});

export const rayanavaKnowledgeBase = pgTable('rayanava_knowledge_base', {
  id: serial('id').primaryKey(),
  category: varchar('category'), // 'logistics', 'business', 'technical', 'customer_service'
  topic: varchar('topic'),
  question: text('question'),
  answer: text('answer'),
  source: varchar('source'), // 'manual', 'learned', 'imported'
  confidence: integer('confidence').default(100),
  usageCount: integer('usage_count').default(0),
  lastUsed: timestamp('last_used'),
  tags: text('tags').array(),
  relatedTopics: text('related_topics').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata')
});

// Create insert schemas and types for new tables
export const insertRayanavaMemorySchema = createInsertSchema(rayanavaMemory).omit({ id: true });
export const insertRayanavaConversationSchema = createInsertSchema(rayanavaConversations).omit({ id: true });
export const insertRayanavaAnalyticsSchema = createInsertSchema(rayanavaAnalytics).omit({ id: true });
export const insertRayanavaLearningSchema = createInsertSchema(rayanavaLearning).omit({ id: true });
export const insertRayanavaWorkflowSchema = createInsertSchema(rayanavaWorkflows).omit({ id: true });
export const insertRayanavaKnowledgeBaseSchema = createInsertSchema(rayanavaKnowledgeBase).omit({ id: true });

export type RayanavaMemory = typeof rayanavaMemory.$inferSelect;
export type InsertRayanavaMemory = z.infer<typeof insertRayanavaMemorySchema>;
export type RayanavaConversation = typeof rayanavaConversations.$inferSelect;
export type InsertRayanavaConversation = z.infer<typeof insertRayanavaConversationSchema>;
export type RayanavaAnalytics = typeof rayanavaAnalytics.$inferSelect;
export type InsertRayanavaAnalytics = z.infer<typeof insertRayanavaAnalyticsSchema>;
export type RayanavaLearning = typeof rayanavaLearning.$inferSelect;
export type InsertRayanavaLearning = z.infer<typeof insertRayanavaLearningSchema>;
export type RayanavaWorkflow = typeof rayanavaWorkflows.$inferSelect;
export type InsertRayanavaWorkflow = z.infer<typeof insertRayanavaWorkflowSchema>;
export type RayanavaKnowledgeBase = typeof rayanavaKnowledgeBase.$inferSelect;
export type InsertRayanavaKnowledgeBase = z.infer<typeof insertRayanavaKnowledgeBaseSchema>;

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: text("resource_id"),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Health metrics table
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull(),
  databaseLatency: integer("database_latency"),
  servicesStatus: jsonb("services_status"),
  systemMetrics: jsonb("system_metrics"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  alertsEnabled: boolean("alerts_enabled").default(false),
  alertConfigurations: jsonb("alert_configurations"),
  lastAlertSent: timestamp("last_alert_sent"),
  responseTimeThresholds: jsonb("response_time_thresholds"),
});

// Audit log schemas and types
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true });
export const insertHealthMetricsSchema = createInsertSchema(healthMetrics).omit({ id: true });

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type HealthMetrics = typeof healthMetrics.$inferSelect;
export type InsertHealthMetrics = z.infer<typeof insertHealthMetricsSchema>;

// ============= Media Files Table =============
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename"),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  fileType: text("file_type"), // 'image', 'document', 'video', etc.
  folder: text("folder").default("uploads"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uploadedByIdx: index("media_files_uploaded_by_idx").on(table.uploadedBy),
  fileTypeIdx: index("media_files_file_type_idx").on(table.fileType),
}));

// ============= Content Assets Table =============
export const contentAssets = pgTable("content_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'image', 'video', 'document', 'template'
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>(),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Tracking Providers Table =============
export const trackingProviders = pgTable("tracking_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  trackingUrlTemplate: text("tracking_url_template"),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  isActive: boolean("is_active").default(true),
  supportedRegions: jsonb("supported_regions").$type<string[]>(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Guide Categories Table =============
export const guideCategories = pgTable("guide_categories", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Guides Table =============
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => guideCategories.id),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  path: text("path"), // file path for content
  content: text("content"), // inline content
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  viewCount: integer("view_count").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  tags: jsonb("tags").$type<string[]>(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("guides_category_idx").on(table.categoryId),
  codeIdx: index("guides_code_idx").on(table.code),
}));

// ============= Guide Documents Table =============
export const guideDocuments = pgTable("guide_documents", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => guides.id).notNull(),
  title: text("title").notNull(),
  type: text("type"), // 'pdf', 'doc', 'video', 'link'
  url: text("url"),
  content: text("content"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Guide Search Index Table =============
export const guideSearchIndex = pgTable("guide_search_index", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => guides.id).notNull(),
  searchText: text("search_text").notNull(),
  keywords: jsonb("keywords").$type<string[]>(),
  weight: integer("weight").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= User Guide Progress Table =============
export const userGuideProgress = pgTable("user_guide_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  guideId: integer("guide_id").references(() => guides.id).notNull(),
  status: text("status").default("not_started"), // 'not_started', 'in_progress', 'completed'
  progress: integer("progress").default(0), // percentage 0-100
  lastViewedAt: timestamp("last_viewed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userGuideIdx: index("user_guide_progress_idx").on(table.userId, table.guideId),
}));

// ============= Ecosystem Departments Table =============
export const ecosystemDepartments = pgTable("ecosystem_departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  headUserId: integer("head_user_id").references(() => users.id),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Ecosystem Sub-Departments Table =============
export const ecosystemSubDepartments = pgTable("ecosystem_sub_departments", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").references(() => ecosystemDepartments.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  headUserId: integer("head_user_id").references(() => users.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  departmentIdx: index("sub_departments_dept_idx").on(table.departmentId),
}));

// ============= Ecosystem Units Table =============
export const ecosystemUnits = pgTable("ecosystem_units", {
  id: serial("id").primaryKey(),
  subDepartmentId: integer("sub_department_id").references(() => ecosystemSubDepartments.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  headUserId: integer("head_user_id").references(() => users.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  subDeptIdx: index("units_sub_dept_idx").on(table.subDepartmentId),
}));

// ============= Ecosystem Sub-Units Table =============
export const ecosystemSubUnits = pgTable("ecosystem_sub_units", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").references(() => ecosystemUnits.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  headUserId: integer("head_user_id").references(() => users.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  unitIdx: index("sub_units_unit_idx").on(table.unitId),
}));

// ============= Ecosystem Divisions Table =============
export const ecosystemDivisions = pgTable("ecosystem_divisions", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").references(() => ecosystemDepartments.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  headUserId: integer("head_user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Ecosystem Modules Table =============
export const ecosystemModules = pgTable("ecosystem_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  category: text("category"),
  status: text("status").default("active"),
  version: text("version"),
  dependencies: jsonb("dependencies").$type<string[]>(),
  config: jsonb("config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Ecosystem Teams Table =============
export const ecosystemTeams = pgTable("ecosystem_teams", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").references(() => ecosystemDepartments.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  leadUserId: integer("lead_user_id").references(() => users.id),
  members: jsonb("members").$type<number[]>(),
  status: text("status").default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Ecosystem Health Metrics Table =============
export const ecosystemHealthMetrics = pgTable("ecosystem_health_metrics", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  metricType: text("metric_type").notNull(),
  value: decimal("value", { precision: 10, scale: 4 }),
  unit: text("unit"),
  status: text("status").default("healthy"),
  threshold: jsonb("threshold"),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Ecosystem Alerts Table =============
export const ecosystemAlerts = pgTable("ecosystem_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").default("info"), // info, warning, critical
  category: text("category"),
  source: text("source"),
  status: text("status").default("active"), // active, acknowledged, resolved
  acknowledgedBy: integer("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Ecosystem AI Conversations Table =============
export const ecosystemAiConversations = pgTable("ecosystem_ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title"),
  context: text("context"),
  status: text("status").default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Ecosystem AI Messages Table =============
export const ecosystemAiMessages = pgTable("ecosystem_ai_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => ecosystemAiConversations.id).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Ecosystem Achievements Table =============
export const ecosystemAchievements = pgTable("ecosystem_achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
  points: integer("points").default(0),
  criteria: jsonb("criteria"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Ecosystem User Achievements Table =============
export const ecosystemUserAchievements = pgTable("ecosystem_user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => ecosystemAchievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  metadata: jsonb("metadata"),
});

// ============= Ecosystem API Keys Table =============
export const ecosystemApiKeys = pgTable("ecosystem_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  permissions: jsonb("permissions").$type<string[]>(),
  rateLimit: integer("rate_limit").default(1000),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= MOLOLINK Profiles Table =============
export const mololinkProfiles = pgTable("mololink_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  isPublic: boolean("is_public").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= MOLOLINK Companies Table =============
export const mololinkCompanies = pgTable("mololink_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  industry: text("industry"),
  size: text("size"),
  location: text("location"),
  website: text("website"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  ownerId: integer("owner_id").references(() => users.id),
  isVerified: boolean("is_verified").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= MOLOLINK Company Employees Table =============
export const mololinkCompanyEmployees = pgTable("mololink_company_employees", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => mololinkCompanies.id).notNull(),
  profileId: integer("profile_id").references(() => mololinkProfiles.id).notNull(),
  title: text("title"),
  department: text("department"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= MOLOLINK Posts Table =============
export const mololinkPosts = pgTable("mololink_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => mololinkProfiles.id).notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  isPublic: boolean("is_public").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= MOLOLINK Company Posts Table =============
export const mololinkCompanyPosts = pgTable("mololink_company_posts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => mololinkCompanies.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= MOLOLINK Comments Table =============
export const mololinkComments = pgTable("mololink_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => mololinkPosts.id).notNull(),
  authorId: integer("author_id").references(() => mololinkProfiles.id).notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= MOLOLINK Connections Table =============
export const mololinkConnections = pgTable("mololink_connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").references(() => mololinkProfiles.id).notNull(),
  receiverId: integer("receiver_id").references(() => mololinkProfiles.id).notNull(),
  status: text("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= MOLOLINK Skills Table =============
export const mololinkSkills = pgTable("mololink_skills", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => mololinkProfiles.id).notNull(),
  name: text("name").notNull(),
  endorsements: integer("endorsements").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Marketplace Listings Table =============
export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  price: decimal("price", { precision: 12, scale: 2 }),
  currency: text("currency").default("USD"),
  condition: text("condition"),
  location: text("location"),
  images: jsonb("images").$type<string[]>(),
  status: text("status").default("active"), // active, sold, expired, draft
  viewsCount: integer("views_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Marketplace Auctions Table =============
export const marketplaceAuctions = pgTable("marketplace_auctions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => marketplaceListings.id).notNull(),
  startingPrice: decimal("starting_price", { precision: 12, scale: 2 }).notNull(),
  reservePrice: decimal("reserve_price", { precision: 12, scale: 2 }),
  currentBid: decimal("current_bid", { precision: 12, scale: 2 }),
  buyNowPrice: decimal("buy_now_price", { precision: 12, scale: 2 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").default("scheduled"), // scheduled, active, ended, cancelled
  winnerId: integer("winner_id").references(() => users.id),
  bidsCount: integer("bids_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Marketplace Bids Table =============
export const marketplaceBids = pgTable("marketplace_bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").references(() => marketplaceAuctions.id).notNull(),
  bidderId: integer("bidder_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  isWinning: boolean("is_winning").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============= Marketplace Service Posts Table =============
export const marketplaceServicePosts = pgTable("marketplace_service_posts", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  priceType: text("price_type"), // fixed, hourly, project
  price: decimal("price", { precision: 12, scale: 2 }),
  currency: text("currency").default("USD"),
  location: text("location"),
  isRemote: boolean("is_remote").default(false),
  images: jsonb("images").$type<string[]>(),
  status: text("status").default("active"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewsCount: integer("reviews_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= Insert Schemas for MOLOLINK and Marketplace =============
export const insertMololinkProfileSchema = createInsertSchema(mololinkProfiles).omit({ id: true });
export const insertMololinkCompanySchema = createInsertSchema(mololinkCompanies).omit({ id: true });
export const insertMololinkPostSchema = createInsertSchema(mololinkPosts).omit({ id: true });
export const insertMololinkConnectionSchema = createInsertSchema(mololinkConnections).omit({ id: true });
export const insertMololinkSkillSchema = createInsertSchema(mololinkSkills).omit({ id: true });
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true });
export const insertMarketplaceAuctionSchema = createInsertSchema(marketplaceAuctions).omit({ id: true });
export const insertMarketplaceBidSchema = createInsertSchema(marketplaceBids).omit({ id: true });
export const insertMarketplaceServicePostSchema = createInsertSchema(marketplaceServicePosts).omit({ id: true });

// ============= Types for MOLOLINK and Marketplace =============
export type MololinkProfile = typeof mololinkProfiles.$inferSelect;
export type InsertMololinkProfile = z.infer<typeof insertMololinkProfileSchema>;
export type MololinkCompany = typeof mololinkCompanies.$inferSelect;
export type InsertMololinkCompany = z.infer<typeof insertMololinkCompanySchema>;
export type MololinkPost = typeof mololinkPosts.$inferSelect;
export type InsertMololinkPost = z.infer<typeof insertMololinkPostSchema>;
export type MololinkConnection = typeof mololinkConnections.$inferSelect;
export type InsertMololinkConnection = z.infer<typeof insertMololinkConnectionSchema>;
export type MololinkSkill = typeof mololinkSkills.$inferSelect;
export type InsertMololinkSkill = z.infer<typeof insertMololinkSkillSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceAuction = typeof marketplaceAuctions.$inferSelect;
export type InsertMarketplaceAuction = z.infer<typeof insertMarketplaceAuctionSchema>;
export type MarketplaceBid = typeof marketplaceBids.$inferSelect;
export type InsertMarketplaceBid = z.infer<typeof insertMarketplaceBidSchema>;
export type MarketplaceServicePost = typeof marketplaceServicePosts.$inferSelect;
export type InsertMarketplaceServicePost = z.infer<typeof insertMarketplaceServicePostSchema>;

// ============= Insert Schemas for New Tables =============
export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({ id: true });
export const insertContentAssetSchema = createInsertSchema(contentAssets).omit({ id: true });
export const insertTrackingProviderSchema = createInsertSchema(trackingProviders).omit({ id: true });
export const insertGuideCategorySchema = createInsertSchema(guideCategories).omit({ id: true });
export const insertGuideSchema = createInsertSchema(guides).omit({ id: true });
export const insertGuideDocumentSchema = createInsertSchema(guideDocuments).omit({ id: true });
export const insertUserGuideProgressSchema = createInsertSchema(userGuideProgress).omit({ id: true });
export const insertEcosystemDepartmentSchema = createInsertSchema(ecosystemDepartments).omit({ id: true });
export const insertEcosystemSubDepartmentSchema = createInsertSchema(ecosystemSubDepartments).omit({ id: true });
export const insertEcosystemUnitSchema = createInsertSchema(ecosystemUnits).omit({ id: true });
export const insertEcosystemSubUnitSchema = createInsertSchema(ecosystemSubUnits).omit({ id: true });

// Aliases for backwards compatibility
export const insertSubDepartmentSchema = insertEcosystemSubDepartmentSchema;
export const insertUnitSchema = insertEcosystemUnitSchema;
export const insertSubUnitSchema = insertEcosystemSubUnitSchema;

// ============= Types for New Tables =============
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type ContentAsset = typeof contentAssets.$inferSelect;
export type InsertContentAsset = z.infer<typeof insertContentAssetSchema>;
export type TrackingProvider = typeof trackingProviders.$inferSelect;
export type InsertTrackingProvider = z.infer<typeof insertTrackingProviderSchema>;
export type GuideCategory = typeof guideCategories.$inferSelect;
export type InsertGuideCategory = z.infer<typeof insertGuideCategorySchema>;
export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type GuideDocument = typeof guideDocuments.$inferSelect;
export type InsertGuideDocument = z.infer<typeof insertGuideDocumentSchema>;
export type UserGuideProgress = typeof userGuideProgress.$inferSelect;
export type InsertUserGuideProgress = z.infer<typeof insertUserGuideProgressSchema>;
export type EcosystemDepartment = typeof ecosystemDepartments.$inferSelect;
export type InsertEcosystemDepartment = z.infer<typeof insertEcosystemDepartmentSchema>;
export type EcosystemSubDepartment = typeof ecosystemSubDepartments.$inferSelect;
export type InsertEcosystemSubDepartment = z.infer<typeof insertEcosystemSubDepartmentSchema>;
export type EcosystemUnit = typeof ecosystemUnits.$inferSelect;
export type InsertEcosystemUnit = z.infer<typeof insertEcosystemUnitSchema>;
export type EcosystemSubUnit = typeof ecosystemSubUnits.$inferSelect;
export type InsertEcosystemSubUnit = z.infer<typeof insertEcosystemSubUnitSchema>;

// ============= Password Reset Tokens Table =============
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tokenIdx: index("password_reset_token_idx").on(table.token),
  userIdx: index("password_reset_user_idx").on(table.userId),
}));

// ============= Shipments Table =============
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  customerId: integer("customer_id").references(() => users.id),
  status: text("status").default("pending"), // pending, in_transit, delivered, delayed, cancelled
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  currentLocation: text("current_location"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  dimensions: jsonb("dimensions").$type<{length?: number, width?: number, height?: number}>(),
  carrier: text("carrier"),
  serviceType: text("service_type"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  trackingIdx: index("shipments_tracking_idx").on(table.trackingNumber),
  customerIdx: index("shipments_customer_idx").on(table.customerId),
  statusIdx: index("shipments_status_idx").on(table.status),
}));

// ============= Collaboration Sessions Table =============
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"), // active, paused, completed
  createdBy: integer("created_by").references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("collab_sessions_project_idx").on(table.projectId),
  statusIdx: index("collab_sessions_status_idx").on(table.status),
}));

// ============= Collaboration Participants Table =============
export const collaborationParticipants = pgTable("collaboration_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => collaborationSessions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("member"), // host, member, viewer
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  sessionIdx: index("collab_participants_session_idx").on(table.sessionId),
  userIdx: index("collab_participants_user_idx").on(table.userId),
}));

// ============= Collaboration Messages Table =============
export const collaborationMessages = pgTable("collaboration_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => collaborationSessions.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  messageType: text("message_type").default("text"), // text, file, system
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<string[]>(),
  sentAt: timestamp("sent_at").defaultNow(),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
}, (table) => ({
  sessionIdx: index("collab_messages_session_idx").on(table.sessionId),
  senderIdx: index("collab_messages_sender_idx").on(table.senderId),
}));

// ============= Admin Activity Logs Table =============
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").default("success"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("admin_activity_user_idx").on(table.userId),
  actionIdx: index("admin_activity_action_idx").on(table.action),
  entityIdx: index("admin_activity_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("admin_activity_created_idx").on(table.createdAt),
}));

// ============= Admin Settings Table =============
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  key: text("key").notNull(),
  value: jsonb("value"),
  type: text("type").default("string"),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryKeyIdx: index("admin_settings_category_key_idx").on(table.category, table.key),
}));

// ============= Analytics Summary Table =============
export const analyticsSummary = pgTable("analytics_summary", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  metricType: text("metric_type").notNull(),
  metricName: text("metric_name").notNull(),
  value: decimal("value", { precision: 15, scale: 4 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  dateIdx: index("analytics_date_idx").on(table.date),
  metricIdx: index("analytics_metric_idx").on(table.metricType, table.metricName),
}));

// ============= Email Settings Table (SMTP Configuration) =============
export const emailSettings = pgTable("email_settings", {
  id: serial("id").primaryKey(),
  smtpHost: varchar("smtp_host", { length: 255 }).notNull(),
  smtpPort: integer("smtp_port").default(587),
  smtpUsername: varchar("smtp_username", { length: 255 }).notNull(),
  smtpPassword: varchar("smtp_password", { length: 255 }).notNull(),
  fromName: varchar("from_name", { length: 255 }).notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  replyToEmail: varchar("reply_to_email", { length: 255 }),
  useTls: boolean("use_tls").default(true),
  isVerified: boolean("is_verified").default(false),
  lastVerifiedAt: timestamp("last_verified_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailSettingsSchema = createInsertSchema(emailSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertEmailSettings = z.infer<typeof insertEmailSettingsSchema>;
export type EmailSettings = typeof emailSettings.$inferSelect;

// ============= Email Templates Table =============
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  formTypeId: integer("form_type_id").references(() => formTypes.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlBody: text("html_body").notNull(),
  textBody: text("text_body"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("email_templates_slug_idx").on(table.slug),
  formTypeIdx: index("email_templates_form_type_idx").on(table.formTypeId),
  activeIdx: index("email_templates_active_idx").on(table.isActive),
}));

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// ============= Notification Recipients Table =============
export const notificationRecipients = pgTable("notification_recipients", {
  id: serial("id").primaryKey(),
  formTypeId: integer("form_type_id").references(() => formTypes.id),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  formTypeIdx: index("notification_recipients_form_type_idx").on(table.formTypeId),
  emailIdx: index("notification_recipients_email_idx").on(table.email),
  activeIdx: index("notification_recipients_active_idx").on(table.isActive),
}));

export const insertNotificationRecipientSchema = createInsertSchema(notificationRecipients).omit({
  id: true,
  createdAt: true,
});

export type InsertNotificationRecipient = z.infer<typeof insertNotificationRecipientSchema>;
export type NotificationRecipient = typeof notificationRecipients.$inferSelect;

// ============= Email API Keys Table (Cross-Subdomain Authentication) =============
export const emailApiKeys = pgTable("email_api_keys", {
  id: serial("id").primaryKey(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  apiKey: varchar("api_key", { length: 64 }), // Deprecated: kept for migration, will be null after migration
  keyHash: varchar("key_hash", { length: 64 }), // SHA-256 hash of the API key
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
}, (table) => ({
  subdomainIdx: index("email_api_keys_subdomain_idx").on(table.subdomain),
  activeIdx: index("email_api_keys_active_idx").on(table.isActive),
  keyHashIdx: index("email_api_keys_hash_idx").on(table.keyHash),
}));

export const insertEmailApiKeySchema = createInsertSchema(emailApiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertEmailApiKey = z.infer<typeof insertEmailApiKeySchema>;
export type EmailApiKey = typeof emailApiKeys.$inferSelect;

// ============= Email Logs Table (Delivery Tracking) =============
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  templateSlug: varchar("template_slug", { length: 100 }),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  formType: varchar("form_type", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  subdomain: varchar("subdomain", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("email_logs_status_idx").on(table.status),
  formTypeIdx: index("email_logs_form_type_idx").on(table.formType),
  subdomainIdx: index("email_logs_subdomain_idx").on(table.subdomain),
  createdAtIdx: index("email_logs_created_at_idx").on(table.createdAt),
}));

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

// ============= Relations for Form and Email Management =============
export const formTypesRelations = relations(formTypes, ({ many }) => ({
  contactSubmissions: many(contactSubmissions),
  emailTemplates: many(emailTemplates),
  notificationRecipients: many(notificationRecipients),
}));

export const contactSubmissionsRelations = relations(contactSubmissions, ({ one }) => ({
  formType: one(formTypes, {
    fields: [contactSubmissions.formTypeId],
    references: [formTypes.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  formType: one(formTypes, {
    fields: [emailTemplates.formTypeId],
    references: [formTypes.id],
  }),
}));

export const notificationRecipientsRelations = relations(notificationRecipients, ({ one }) => ({
  formType: one(formTypes, {
    fields: [notificationRecipients.formTypeId],
    references: [formTypes.id],
  }),
}));

// ============= API Route Mappings Table (For Frontend-Backend-Database Mapping) =============
export const apiRouteMappings = pgTable("api_route_mappings", {
  id: serial("id").primaryKey(),
  frontendRoute: text("frontend_route").notNull(),
  pageComponent: text("page_component").notNull(),
  routeCategory: text("route_category").notNull(), // main, auth, admin, departments, services, ecosystem
  queryKeys: jsonb("query_keys").$type<string[]>(),
  httpMethods: jsonb("http_methods").$type<{method: string, endpoint: string}[]>(),
  apiEndpoints: jsonb("api_endpoints").$type<string[]>(),
  storageMethod: text("storage_method"),
  databaseTables: jsonb("database_tables").$type<string[]>(),
  requiresAuth: boolean("requires_auth").default(false),
  requiresAdmin: boolean("requires_admin").default(false),
  status: text("status").default("active"), // active, deprecated, unused
  notes: text("notes"),
  lastVerifiedAt: timestamp("last_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  frontendRouteIdx: index("api_route_mappings_frontend_idx").on(table.frontendRoute),
  categoryIdx: index("api_route_mappings_category_idx").on(table.routeCategory),
  statusIdx: index("api_route_mappings_status_idx").on(table.status),
}));

export const insertApiRouteMappingSchema = createInsertSchema(apiRouteMappings).omit({ id: true });
export type ApiRouteMapping = typeof apiRouteMappings.$inferSelect;
export type InsertApiRouteMapping = z.infer<typeof insertApiRouteMappingSchema>;

// ============= Insert Schemas for Additional Tables =============
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true });
export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).omit({ id: true });
export const insertCollaborationParticipantSchema = createInsertSchema(collaborationParticipants).omit({ id: true });
export const insertCollaborationMessageSchema = createInsertSchema(collaborationMessages).omit({ id: true });
export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).omit({ id: true });
export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({ id: true });
export const insertAnalyticsSummarySchema = createInsertSchema(analyticsSummary).omit({ id: true });
export const insertUserFavoriteServiceSchema = createInsertSchema(userFavoriteServices).omit({ id: true, createdAt: true });

// ============= Types for Additional Tables =============
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type CollaborationSession = typeof collaborationSessions.$inferSelect;
export type InsertCollaborationSession = z.infer<typeof insertCollaborationSessionSchema>;
export type CollaborationParticipant = typeof collaborationParticipants.$inferSelect;
export type InsertCollaborationParticipant = z.infer<typeof insertCollaborationParticipantSchema>;
export type CollaborationMessage = typeof collaborationMessages.$inferSelect;
export type InsertCollaborationMessage = z.infer<typeof insertCollaborationMessageSchema>;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AnalyticsSummary = typeof analyticsSummary.$inferSelect;
export type InsertAnalyticsSummary = z.infer<typeof insertAnalyticsSummarySchema>;
export type UserFavoriteService = typeof userFavoriteServices.$inferSelect;
export type InsertUserFavoriteService = z.infer<typeof insertUserFavoriteServiceSchema>;

// ============= CMS Types (from Laravel CMS) =============
// Types aligned with actual API responses from cms.molochain.com

export interface CMSMenuItem {
  id: number;
  label: string;
  href: string;
  parent_id: number | null;
  sort_order: number;
  is_active: number | boolean; // API returns 1/0, convert to boolean in hooks
  created_at?: string;
  updated_at?: string;
}

export interface CMSHomeSectionItem {
  title: string;
  description: string;
  icon?: string;
  link?: string;
}

export interface CMSHomeSection {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  body?: string;
  items: CMSHomeSectionItem[];
  sort_order: number;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CMSSettings {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

export interface CMSService {
  id: number;
  slug: string;
  name: string;
  short_description?: string;
  category: string;
  hero_image_url?: string;
}

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  template?: string | null;
  body?: string;
  meta_title?: string;
  meta_description?: string;
  updated_at?: string;
}
// ============= OTMS (Order Tracking Management System) Types =============
// API Base: https://opt.molochain.com/v1

export interface OTMSOrder {
  id: string;
  trackingId: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  shipper: string | null;
  recipient: string | null;
  weight: number | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  } | null;
  serviceType: string | null;
  carrier: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any> | null;
}

export interface OTMSOrderStatus {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  code: string | null;
}

export interface OTMSSearchResult {
  orders: OTMSOrder[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
