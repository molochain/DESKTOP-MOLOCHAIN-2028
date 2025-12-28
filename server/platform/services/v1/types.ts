export type ServiceCategory =
  | 'shipping'
  | 'logistics'
  | 'warehousing'
  | 'customs'
  | 'consulting'
  | 'technology'
  | 'finance'
  | 'documentation'
  | 'special'
  | 'other';

export interface ServiceStats {
  label: string;
  value: string;
  icon?: string;
}

export interface ServicePlatform {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory | string;
  icon?: string | null;
  imageUrl?: string | null;
  features: string[];
  benefits: string[];
  additionalInfo?: string | null;
  relatedServices?: string[] | null;
  pricing?: string | null;
  deliveryTime?: string | null;
  coverage?: string | null;
  tags?: string[] | null;
  serviceStats?: ServiceStats[] | null;
  certifications?: string[] | null;
  isActive: boolean;
  popularity: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ServiceAvailability {
  id: number;
  serviceId: string;
  location: string;
  available: boolean;
  capacity?: number | null;
  nextAvailable?: Date | null;
  createdAt: Date | null;
}

export interface ServiceSearchParams {
  query?: string;
  category?: ServiceCategory | string;
  tags?: string[];
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'popularity' | 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceDeltaSync {
  version: number;
  timestamp: Date;
  services: {
    added: ServicePlatform[];
    updated: ServicePlatform[];
    deleted: string[];
  };
  nextVersion: number;
  hasMore: boolean;
}

export interface ServiceListResponse {
  success: boolean;
  data: ServicePlatform[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    categories: string[];
  };
  version: number;
  timestamp: Date;
}

export interface ServiceDetailResponse {
  success: boolean;
  data: ServicePlatform | null;
  availability?: ServiceAvailability[];
  relatedServices?: ServicePlatform[];
  version: number;
  timestamp: Date;
}

export interface ServiceCategoriesResponse {
  success: boolean;
  data: {
    category: string;
    count: number;
    description?: string;
  }[];
  timestamp: Date;
}

export interface ServiceSearchResponse {
  success: boolean;
  data: ServicePlatform[];
  meta: {
    query: string;
    total: number;
    limit: number;
    offset: number;
  };
  timestamp: Date;
}

export interface ServiceAvailabilityResponse {
  success: boolean;
  data: {
    serviceId: string;
    locations: ServiceAvailability[];
  };
  timestamp: Date;
}

export interface ServiceSyncDeltaResponse {
  success: boolean;
  data: ServiceDeltaSync;
  timestamp: Date;
}

export interface ServiceErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: Date;
}

export type ServiceApiResponse =
  | ServiceListResponse
  | ServiceDetailResponse
  | ServiceCategoriesResponse
  | ServiceSearchResponse
  | ServiceAvailabilityResponse
  | ServiceSyncDeltaResponse
  | ServiceErrorResponse;
