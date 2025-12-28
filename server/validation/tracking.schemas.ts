import { z } from 'zod';

// Common location schema used in multiple places
export const locationSchema = z.object({
  city: z.string().min(1, { message: "City is required" }).max(100),
  country: z.string().min(1, { message: "Country is required" }).max(100),
  postalCode: z.string().max(20).optional(),
  state: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

// Enum for valid tracking statuses
export const trackingStatusEnum = z.enum([
  "PENDING", 
  "PICKED_UP", 
  "IN_TRANSIT", 
  "OUT_FOR_DELIVERY", 
  "DELIVERED", 
  "EXCEPTION"
]);

// Schema for creating a new shipment
export const createShipmentSchema = z.object({
  trackingNumber: z.string()
    .min(5, { message: "Tracking number must be at least 5 characters" })
    .max(50, { message: "Tracking number must be less than 50 characters" }),
  origin: locationSchema,
  destination: locationSchema,
  status: trackingStatusEnum.default("PENDING"),
  customerId: z.number().int().positive(),
  estimatedDelivery: z.string().datetime().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(["cm", "in"]).default("cm")
  }).optional(),
  serviceType: z.string().max(50).optional(),
  specialInstructions: z.string().max(500).optional(),
  isHazardous: z.boolean().default(false),
  requiresRefrigeration: z.boolean().default(false),
  customsInfo: z.object({
    declaredValue: z.number().nonnegative().optional(),
    contentDescription: z.string().max(200).optional(),
    originCountry: z.string().max(100).optional()
  }).optional()
});

// Schema for creating a tracking event/update
export const createTrackingEventSchema = z.object({
  shipmentId: z.number().int().positive(),
  status: trackingStatusEnum,
  location: locationSchema,
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  description: z.string().max(500),
  isPublic: z.boolean().default(true),
  scanType: z.enum(["SYSTEM", "MANUAL", "CUSTOMER", "DRIVER"]).default("MANUAL"),
  attachments: z.array(z.string().url()).optional()
});

// Schema for tracking lookup
export const trackingLookupSchema = z.object({
  trackingNumber: z.string()
    .min(5, { message: "Tracking number must be at least 5 characters" })
    .max(50, { message: "Tracking number must be less than 50 characters" })
});

// Schema for updating a shipment
export const updateShipmentSchema = z.object({
  status: trackingStatusEnum.optional(),
  estimatedDelivery: z.string().datetime().optional(),
  destination: locationSchema.optional(),
  specialInstructions: z.string().max(500).optional()
}).refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field must be provided for update"
});