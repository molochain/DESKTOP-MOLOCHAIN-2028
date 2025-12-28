import { Request, Response } from 'express';
import { serviceRepository } from './repository';
import { serviceCacheService } from './cache';
import { logger } from '../../../utils/logger';
import type {
  ServiceListResponse,
  ServiceDetailResponse,
  ServiceCategoriesResponse,
  ServiceSearchResponse,
  ServiceAvailabilityResponse,
  ServiceSyncDeltaResponse,
  ServiceErrorResponse,
  ServiceSearchParams,
} from './types';

export class ServiceController {
  async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const offset = parseInt(req.query.offset as string) || 0;

      let allServices = serviceCacheService.getCatalog();
      
      if (!allServices) {
        allServices = await serviceRepository.getAll();
        serviceCacheService.setCatalog(allServices);
        serviceCacheService.incrementVersion();
      }

      const total = allServices.length;
      const paginatedServices = allServices.slice(offset, offset + limit);
      const categories = await this.getCategoryList();

      const response: ServiceListResponse = {
        success: true,
        data: paginatedServices,
        meta: {
          total,
          limit,
          offset,
          categories,
        },
        version: serviceCacheService.getCurrentVersion(),
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      logger.error('ServiceController.getCatalog error:', error);
      this.sendError(res, 'CATALOG_ERROR', 'Failed to fetch service catalog');
    }
  }

  async getService(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        this.sendError(res, 'INVALID_SLUG', 'Service slug is required', 400);
        return;
      }

      let service = serviceCacheService.getService(slug);
      
      if (!service) {
        const dbService = await serviceRepository.getBySlug(slug);
        if (dbService) {
          service = dbService;
          serviceCacheService.setService(slug, service);
        }
      }

      if (!service) {
        this.sendError(res, 'SERVICE_NOT_FOUND', `Service '${slug}' not found`, 404);
        return;
      }

      let relatedServices;
      if (service.relatedServices && service.relatedServices.length > 0) {
        const relatedPromises = service.relatedServices.slice(0, 4).map(id => 
          serviceRepository.getBySlug(id)
        );
        const related = await Promise.all(relatedPromises);
        relatedServices = related.filter(Boolean);
      }

      const availability = await serviceRepository.getAvailability(slug);

      const response: ServiceDetailResponse = {
        success: true,
        data: service,
        availability,
        relatedServices: relatedServices as any,
        version: serviceCacheService.getCurrentVersion(),
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      logger.error('ServiceController.getService error:', error);
      this.sendError(res, 'SERVICE_ERROR', 'Failed to fetch service details');
    }
  }

  async searchServices(req: Request, res: Response): Promise<void> {
    try {
      const params: ServiceSearchParams = {
        query: req.query.q as string,
        category: req.query.category as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        isActive: req.query.isActive !== 'false',
        limit: Math.min(parseInt(req.query.limit as string) || 50, 100),
        offset: parseInt(req.query.offset as string) || 0,
        sortBy: (req.query.sortBy as any) || 'popularity',
        sortOrder: (req.query.sortOrder as any) || 'desc',
      };

      const { services, total } = await serviceRepository.search(params);

      const response: ServiceSearchResponse = {
        success: true,
        data: services,
        meta: {
          query: params.query || '',
          total,
          limit: params.limit!,
          offset: params.offset!,
        },
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      logger.error('ServiceController.searchServices error:', error);
      this.sendError(res, 'SEARCH_ERROR', 'Failed to search services');
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      let categories = serviceCacheService.getCategories();
      
      if (!categories) {
        categories = await serviceRepository.getCategories();
        serviceCacheService.setCategories(categories);
      }

      const response: ServiceCategoriesResponse = {
        success: true,
        data: categories,
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      logger.error('ServiceController.getCategories error:', error);
      this.sendError(res, 'CATEGORIES_ERROR', 'Failed to fetch categories');
    }
  }

  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const location = req.query.location as string | undefined;

      if (!serviceId) {
        this.sendError(res, 'INVALID_SERVICE_ID', 'Service ID is required', 400);
        return;
      }

      const availability = await serviceRepository.getAvailability(serviceId, location);

      const response: ServiceAvailabilityResponse = {
        success: true,
        data: {
          serviceId,
          locations: availability,
        },
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      logger.error('ServiceController.getAvailability error:', error);
      this.sendError(res, 'AVAILABILITY_ERROR', 'Failed to check availability');
    }
  }

  async getSyncDelta(req: Request, res: Response): Promise<void> {
    try {
      const sinceVersion = parseInt(req.query.since as string) || 0;

      if (sinceVersion >= serviceCacheService.getCurrentVersion()) {
        const response: ServiceSyncDeltaResponse = {
          success: true,
          data: {
            version: sinceVersion,
            timestamp: new Date(sinceVersion),
            services: {
              added: [],
              updated: [],
              deleted: [],
            },
            nextVersion: serviceCacheService.getCurrentVersion(),
            hasMore: false,
          },
          timestamp: new Date(),
        };
        
        res.json(response);
        return;
      }

      const sinceDate = new Date(sinceVersion);
      const updatedServices = await serviceRepository.getUpdatedSince(sinceDate);

      const deltaSync = serviceCacheService.getDeltaSince(sinceVersion);
      deltaSync.services.updated = updatedServices;

      const response: ServiceSyncDeltaResponse = {
        success: true,
        data: deltaSync,
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      logger.error('ServiceController.getSyncDelta error:', error);
      this.sendError(res, 'SYNC_ERROR', 'Failed to get sync delta');
    }
  }

  private async getCategoryList(): Promise<string[]> {
    const categories = serviceCacheService.getCategories();
    if (categories) {
      return categories.map(c => c.category);
    }
    
    const dbCategories = await serviceRepository.getCategories();
    return dbCategories.map(c => c.category);
  }

  private sendError(
    res: Response, 
    code: string, 
    message: string, 
    statusCode: number = 500
  ): void {
    const response: ServiceErrorResponse = {
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date(),
    };

    res.status(statusCode).json(response);
  }
}

export const serviceController = new ServiceController();
