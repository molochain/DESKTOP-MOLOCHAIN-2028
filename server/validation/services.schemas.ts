import { z } from 'zod';

// Service categories enum
export const serviceCategoryEnum = z.enum([
  "SHIPPING",
  "CUSTOMS",
  "WAREHOUSING",
  "FREIGHT",
  "LOGISTICS",
  "CONSULTING",
  "OTHER"
]);

// Schema for creating a new service
export const createServiceSchema = z.object({
  code: z.string()
    .min(2, { message: "Service code must be at least 2 characters" })
    .max(20, { message: "Service code must be less than 20 characters" })
    .refine(val => /^[A-Z0-9_-]+$/.test(val), {
      message: "Service code can only contain uppercase letters, numbers, underscores, and hyphens"
    }),
  name: z.string()
    .min(3, { message: "Service name must be at least 3 characters" })
    .max(100, { message: "Service name must be less than 100 characters" }),
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  category: serviceCategoryEnum.default("OTHER"),
  active: z.boolean().default(true),
  pricing: z.object({
    base: z.number().nonnegative(),
    currency: z.string().length(3).default("USD"),
    unit: z.enum(["FLAT", "PER_KG", "PER_KM", "PER_ITEM", "HOURLY", "DAILY"]).default("FLAT"),
    bulk: z.array(z.object({
      min: z.number().int().nonnegative(),
      max: z.number().int().nonnegative(),
      price: z.number().nonnegative()
    })).optional()
  }).optional(),
  requirements: z.array(z.string()).optional(),
  availability: z.object({
    regions: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0 = Sunday, 6 = Saturday
    leadTimeHours: z.number().int().nonnegative().optional()
  }).optional(),
  features: z.array(z.string()).optional(),
  metaTags: z.array(z.string()).optional()
});

// Schema for updating an existing service
export const updateServiceSchema = z.object({
  name: z.string()
    .min(3, { message: "Service name must be at least 3 characters" })
    .max(100, { message: "Service name must be less than 100 characters" })
    .optional(),
  description: z.string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  category: serviceCategoryEnum.optional(),
  active: z.boolean().optional(),
  pricing: z.object({
    base: z.number().nonnegative(),
    currency: z.string().length(3).default("USD"),
    unit: z.enum(["FLAT", "PER_KG", "PER_KM", "PER_ITEM", "HOURLY", "DAILY"]).default("FLAT"),
    bulk: z.array(z.object({
      min: z.number().int().nonnegative(),
      max: z.number().int().nonnegative(),
      price: z.number().nonnegative()
    })).optional()
  }).optional(),
  requirements: z.array(z.string()).optional(),
  availability: z.object({
    regions: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    leadTimeHours: z.number().int().nonnegative().optional()
  }).optional(),
  features: z.array(z.string()).optional(),
  metaTags: z.array(z.string()).optional()
}).refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field must be provided for update"
});

// Schema for service availability check
export const serviceAvailabilitySchema = z.object({
  serviceCode: z.string().min(2).max(20),
  origin: z.object({
    country: z.string().min(2).max(100),
    city: z.string().min(2).max(100).optional()
  }),
  destination: z.object({
    country: z.string().min(2).max(100),
    city: z.string().min(2).max(100).optional()
  }),
  date: z.string().datetime().optional(),
  weight: z.number().positive().optional(),
  volume: z.number().positive().optional()
});