import { z } from 'zod';

// Common tracking status enum used across all providers
export enum TrackingStatus {
  UNKNOWN = "UNKNOWN",
  PENDING = "PENDING",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  EXCEPTION = "EXCEPTION",
  FAILED_ATTEMPT = "FAILED_ATTEMPT",
}

// Common location interface
export interface TrackingLocation {
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

// Common tracking event interface
export interface TrackingEvent {
  timestamp: Date;
  status: TrackingStatus;
  location: TrackingLocation;
  description: string;
  details?: Record<string, any>;
}

// Common tracking info interface that all providers will map to
export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: TrackingStatus;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  origin?: TrackingLocation;
  destination?: TrackingLocation;
  service?: string;
  weight?: {
    value: number;
    unit: string;
  };
  metadata?: Record<string, any>;
}

// Interface that all tracking providers must implement
export interface TrackingProvider {
  name: string;
  isEnabled: boolean;
  validateTrackingNumber(trackingNumber: string): boolean;
  getTracking(trackingNumber: string): Promise<TrackingInfo>;
}

// Configuration schema for tracking providers
export const trackingProviderConfigSchema = z.object({
  apiKey: z.string(),
  apiSecret: z.string().optional(),
  accountNumber: z.string().optional(),
  meterNumber: z.string().optional(),
  environment: z.enum(["production", "test"]).default("production"),
  timeout: z.number().default(30000),
});

export type TrackingProviderConfig = z.infer<typeof trackingProviderConfigSchema>;

// Error types
export class TrackingError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public trackingNumber: string,
    public originalError?: any
  ) {
    super(message);
    this.name = "TrackingError";
  }
}
