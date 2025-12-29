import { db } from '../../../db';
import { services, serviceAvailability } from '../../../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../../../utils/logger';
import { cmsCache } from '../../../utils/cms-cache';
import crypto from 'crypto';
import type { ServicePlatform, ServiceAvailability as ServiceAvailabilityType, ServiceSearchParams } from './types';

interface CMSService {
  id: number;
  name: string;
  slug: string;
  category: string;
  short_description: string;
  hero_image_url?: string;
}

export class ServiceRepository {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;
  private static readonly FETCH_TIMEOUT_MS = 10000;

  private generateContentHash(service: CMSService): string {
    const content = JSON.stringify({
      name: service.name,
      slug: service.slug,
      category: service.category,
      short_description: service.short_description,
      hero_image_url: service.hero_image_url,
    });
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private async fetchWithRetry(url: string, retries = ServiceRepository.MAX_RETRIES): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ServiceRepository.FETCH_TIMEOUT_MS);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return response;
        }
        
        if (response.status >= 500 && attempt < retries) {
          logger.warn(`CMS fetch attempt ${attempt}/${retries} failed with status ${response.status}, retrying...`);
          await this.delay(ServiceRepository.RETRY_DELAY_MS * attempt);
          continue;
        }
        
        throw new Error(`CMS fetch failed: ${response.status}`);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          logger.warn(`CMS fetch attempt ${attempt}/${retries} timed out after ${ServiceRepository.FETCH_TIMEOUT_MS}ms`);
        } else if (attempt < retries) {
          logger.warn(`CMS fetch attempt ${attempt}/${retries} failed: ${error.message}, retrying...`);
        }
        
        if (attempt === retries) {
          throw error;
        }
        
        await this.delay(ServiceRepository.RETRY_DELAY_MS * attempt);
      }
    }
    throw new Error('CMS fetch failed after all retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getCMSServices(): Promise<CMSService[]> {
    try {
      const cached = cmsCache.get<{ data: CMSService[] }>('cms:services');
      if (cached?.data) {
        return cached.data;
      }

      const url = `${process.env.LARAVEL_CMS_URL || 'https://cms.molochain.com/api'}/services`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      return data.data || data || [];
    } catch (error: any) {
      logger.error(`Failed to fetch CMS services: ${error.message}`);
      return [];
    }
  }

  private async getServicesFromDatabase(): Promise<ServicePlatform[]> {
    try {
      const dbServices = await db.select().from(services).where(eq(services.isActive, true));
      return dbServices.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        icon: s.icon,
        imageUrl: s.imageUrl,
        features: s.features || [],
        benefits: s.benefits || [],
        additionalInfo: s.additionalInfo,
        relatedServices: s.relatedServices,
        pricing: s.pricing,
        deliveryTime: s.deliveryTime,
        coverage: s.coverage,
        tags: s.tags,
        serviceStats: s.serviceStats,
        certifications: s.certifications,
        isActive: s.isActive ?? true,
        popularity: s.popularity ?? 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    } catch (error) {
      logger.error('Failed to fetch services from database:', error);
      return [];
    }
  }

  private mapCMSToServicePlatform(cms: CMSService): ServicePlatform {
    return {
      id: cms.slug,
      title: cms.name,
      description: cms.short_description,
      category: cms.category,
      icon: this.getCategoryIcon(cms.category),
      imageUrl: cms.hero_image_url || null,
      features: [],
      benefits: [],
      additionalInfo: null,
      relatedServices: [],
      pricing: null,
      deliveryTime: null,
      coverage: null,
      tags: [cms.category, cms.slug],
      serviceStats: [],
      certifications: [],
      isActive: true,
      popularity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      transport: 'Truck',
      warehousing: 'Building2',
      storage: 'Building2',
      customs: 'FileCheck',
      ecommerce: 'ShoppingCart',
      logistics: 'Package',
      port: 'Anchor',
      hr: 'Users',
      agency: 'Briefcase',
      postal: 'Mail',
      marketplace: 'Store',
      technology: 'Cpu',
      consulting: 'MessageSquare',
      finance: 'DollarSign',
      corporate: 'Building',
      partnership: 'Handshake',
      platform: 'Globe',
      training: 'GraduationCap',
      events: 'Calendar',
      trading: 'TrendingUp',
    };
    return icons[category] || 'Package';
  }

  async syncFromCMS(): Promise<{ synced: number; created: number; updated: number }> {
    const stats = { synced: 0, created: 0, updated: 0 };
    
    try {
      const cmsServices = await this.getCMSServices();
      if (cmsServices.length === 0) {
        logger.warn('No services from CMS to sync');
        return stats;
      }

      stats.synced = cmsServices.length;
      logger.info(`[Services Platform] CMS sync validated: ${stats.synced} services available from CMS`);
      return stats;
    } catch (error) {
      logger.error('[Services Platform] CMS validation error:', error);
      throw error;
    }
  }

  async getAll(): Promise<ServicePlatform[]> {
    try {
      const cmsServices = await this.getCMSServices();
      
      if (cmsServices.length > 0) {
        return cmsServices.map(s => this.mapCMSToServicePlatform(s));
      }

      logger.info('CMS unavailable, falling back to database');
      return this.getServicesFromDatabase();
    } catch (error) {
      logger.error('ServiceRepository.getAll error, falling back to database:', error);
      return this.getServicesFromDatabase();
    }
  }

  async getBySlug(slug: string): Promise<ServicePlatform | null> {
    try {
      const cmsServices = await this.getCMSServices();
      
      if (cmsServices.length > 0) {
        const service = cmsServices.find(s => s.slug === slug);
        if (service) {
          return this.mapCMSToServicePlatform(service);
        }
      }

      const dbService = await db.select().from(services).where(eq(services.id, slug)).limit(1);
      if (dbService.length > 0) {
        const s = dbService[0];
        return {
          id: s.id,
          title: s.title,
          description: s.description,
          category: s.category,
          icon: s.icon,
          imageUrl: s.imageUrl,
          features: s.features || [],
          benefits: s.benefits || [],
          additionalInfo: s.additionalInfo,
          relatedServices: s.relatedServices,
          pricing: s.pricing,
          deliveryTime: s.deliveryTime,
          coverage: s.coverage,
          tags: s.tags,
          serviceStats: s.serviceStats,
          certifications: s.certifications,
          isActive: s.isActive ?? true,
          popularity: s.popularity ?? 0,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      }

      return null;
    } catch (error) {
      logger.error(`ServiceRepository.getBySlug error for slug: ${slug}`, error);
      throw error;
    }
  }

  async getByCategory(category: string, limit: number = 50): Promise<ServicePlatform[]> {
    try {
      const cmsServices = await this.getCMSServices();
      
      if (cmsServices.length > 0) {
        return cmsServices
          .filter(s => s.category === category)
          .slice(0, limit)
          .map(s => this.mapCMSToServicePlatform(s));
      }

      const dbServices = await db.select()
        .from(services)
        .where(and(eq(services.category, category), eq(services.isActive, true)))
        .limit(limit);

      return dbServices.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        icon: s.icon,
        imageUrl: s.imageUrl,
        features: s.features || [],
        benefits: s.benefits || [],
        additionalInfo: s.additionalInfo,
        relatedServices: s.relatedServices,
        pricing: s.pricing,
        deliveryTime: s.deliveryTime,
        coverage: s.coverage,
        tags: s.tags,
        serviceStats: s.serviceStats,
        certifications: s.certifications,
        isActive: s.isActive ?? true,
        popularity: s.popularity ?? 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    } catch (error) {
      logger.error(`ServiceRepository.getByCategory error for category: ${category}`, error);
      throw error;
    }
  }

  async search(params: ServiceSearchParams): Promise<{ services: ServicePlatform[]; total: number }> {
    try {
      const cmsServices = await this.getCMSServices();
      
      let filtered = cmsServices;

      if (params.category) {
        filtered = filtered.filter(s => s.category === params.category);
      }

      if (params.query) {
        const query = params.query.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(query) ||
          s.short_description.toLowerCase().includes(query) ||
          s.slug.toLowerCase().includes(query)
        );
      }

      const total = filtered.length;
      const offset = params.offset || 0;
      const limit = params.limit || 50;
      
      const paged = filtered.slice(offset, offset + limit);

      return {
        services: paged.map(s => this.mapCMSToServicePlatform(s)),
        total
      };
    } catch (error) {
      logger.error('ServiceRepository.search error:', error);
      throw error;
    }
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    try {
      const cmsServices = await this.getCMSServices();
      
      if (cmsServices.length > 0) {
        const categoryMap = new Map<string, number>();
        for (const service of cmsServices) {
          const count = categoryMap.get(service.category) || 0;
          categoryMap.set(service.category, count + 1);
        }

        return Array.from(categoryMap.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);
      }

      const dbCategories = await db
        .select({
          category: services.category,
          count: sql<number>`count(*)::int`,
        })
        .from(services)
        .where(eq(services.isActive, true))
        .groupBy(services.category);

      return dbCategories.sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('ServiceRepository.getCategories error:', error);
      throw error;
    }
  }

  async getAvailability(serviceId: string, location?: string): Promise<ServiceAvailabilityType[]> {
    try {
      const conditions = [eq(serviceAvailability.serviceId, serviceId)];
      
      if (location) {
        conditions.push(eq(serviceAvailability.location, location));
      }

      const result = await db
        .select()
        .from(serviceAvailability)
        .where(and(...conditions));

      return result.map((r: typeof serviceAvailability.$inferSelect) => ({
        id: r.id,
        serviceId: r.serviceId,
        location: r.location,
        available: r.available ?? true,
        capacity: r.capacity,
        nextAvailable: r.nextAvailable,
        createdAt: r.createdAt
      }));
    } catch (error) {
      logger.error(`ServiceRepository.getAvailability error for service: ${serviceId}`, error);
      return [];
    }
  }

  async getCount(): Promise<number> {
    try {
      const cmsServices = await this.getCMSServices();
      if (cmsServices.length > 0) {
        return cmsServices.length;
      }

      const result = await db.select({ count: sql<number>`count(*)::int` })
        .from(services)
        .where(eq(services.isActive, true));
      return result[0]?.count || 0;
    } catch (error) {
      logger.error('ServiceRepository.getCount error:', error);
      return 0;
    }
  }

  async getUpdatedSince(since: Date): Promise<ServicePlatform[]> {
    try {
      const cmsServices = await this.getCMSServices();
      if (cmsServices.length > 0) {
        return cmsServices.map(s => this.mapCMSToServicePlatform(s));
      }

      return this.getServicesFromDatabase();
    } catch (error) {
      logger.error('ServiceRepository.getUpdatedSince error:', error);
      throw error;
    }
  }

  async upsertService(service: ServicePlatform): Promise<void> {
    const now = new Date();
    const existing = await db.select().from(services).where(eq(services.id, service.id)).limit(1);

    if (existing.length === 0) {
      await db.insert(services).values({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        icon: service.icon,
        imageUrl: service.imageUrl,
        features: service.features,
        benefits: service.benefits,
        additionalInfo: service.additionalInfo,
        relatedServices: service.relatedServices,
        pricing: service.pricing,
        deliveryTime: service.deliveryTime,
        coverage: service.coverage,
        tags: service.tags,
        serviceStats: service.serviceStats,
        certifications: service.certifications,
        isActive: service.isActive,
        popularity: service.popularity,
        version: 1,
        syncedAt: now,
      });
    } else {
      await db.update(services)
        .set({
          title: service.title,
          description: service.description,
          category: service.category,
          icon: service.icon,
          imageUrl: service.imageUrl,
          features: service.features,
          benefits: service.benefits,
          additionalInfo: service.additionalInfo,
          relatedServices: service.relatedServices,
          pricing: service.pricing,
          deliveryTime: service.deliveryTime,
          coverage: service.coverage,
          tags: service.tags,
          serviceStats: service.serviceStats,
          certifications: service.certifications,
          isActive: service.isActive,
          popularity: service.popularity,
          version: (existing[0].version || 1) + 1,
          syncedAt: now,
          updatedAt: now,
        })
        .where(eq(services.id, service.id));
    }
  }
}

export const serviceRepository = new ServiceRepository();
