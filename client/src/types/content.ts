import { z } from 'zod';

export interface Asset {
  id: number;
  type: 'logo' | 'banner';
  url: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface ContentAssets {
  logo?: Asset | null;
  banner?: Asset | null;
  error?: {
    message: string;
  };
}

export interface ServiceCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  error?: {
    message: string;
  };
}

export interface ContactInfo {
  id: number;
  label: string;
  value: string;
  type: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  error?: {
    message: string;
  };
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  error?: {
    message: string;
  };
}

export interface AboutSection {
  id: number;
  title: string;
  content: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  error?: {
    message: string;
  };
}

export interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  error?: {
    message: string;
  };
}

export interface SelectMediaFile {
  id: number;
  filename: string;
  fileType: 'image' | 'document' | 'video';
  url: string;
  thumbnailUrl?: string;
  size: number;
  folder: string;
  createdAt: string;
  updatedAt: string;
  error?: {
    message: string;
  };
}

// Add types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type AdminRole = 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: number;
  username: string;
  role: AdminRole;
  permissions: string[];
}

export interface ContentVersion {
  id: number;
  contentType: string;
  contentId: number;
  changes: Record<string, any>;
  createdAt: string;
  createdBy: AdminUser;
}

// Zod schemas for validation
export const assetSchema = z.object({
  id: z.number(),
  type: z.enum(['logo', 'banner']),
  url: z.string().url(),
  createdAt: z.string(),
  updatedAt: z.string(),
  active: z.boolean(),
});

export const contentAssetsSchema = z.object({
  logo: assetSchema.nullable().optional(),
  banner: assetSchema.nullable().optional(),
});

export const serviceCardSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  order: z.number(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});