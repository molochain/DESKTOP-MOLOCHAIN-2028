/**
 * Service Manager - Central management system for all services
 * Handles service registration, lifecycle, health monitoring, and coordination
 */

import { db } from '../core/database/db.service';
import { 
  services, 
  serviceInstances, 
  serviceHealthLogs, 
  serviceIntegrations,
  serviceUsage,
  InsertService,
  SelectService,
  InsertServiceInstance,
  SelectServiceInstance,
  InsertServiceHealthLog,
  SelectServiceHealthLog,
  InsertServiceIntegration,
  SelectServiceIntegration,
  InsertServiceUsage,
  SelectServiceUsage
} from '@db/schema';
import { eq, desc, and, or, gte, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { serviceHealthMonitor } from './service-health-monitor';
import { servicesData } from '../data/services-data';

interface ServiceManagerConfig {
  enableAutoDiscovery?: boolean;
  enableHealthMonitoring?: boolean;
  healthCheckInterval?: number;
  autoRestartOnFailure?: boolean;
  maxRestartAttempts?: number;
  syncStaticData?: boolean;
}

interface ServiceRegistration {
  code: string;
  name: string;
  description?: string;
  category: string;
  type: 'internal' | 'external' | 'integration';
  version?: string;
  config?: any;
  metadata?: any;
}

interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  successRate: number;
  lastError?: string;
  uptime: number;
}

class ServiceManager extends EventEmitter {
  private static instance: ServiceManager;
  private config: ServiceManagerConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private serviceCache = new Map<string, SelectService>();
  private instanceCache = new Map<string, SelectServiceInstance>();
  
  private constructor(config: ServiceManagerConfig = {}) {
    super();
    this.config = {
      enableAutoDiscovery: true,
      enableHealthMonitoring: true,
      healthCheckInterval: 60000, // 1 minute
      autoRestartOnFailure: true,
      maxRestartAttempts: 3,
      syncStaticData: true,
      ...config
    };
    this.initialize();
  }

  public static getInstance(config?: ServiceManagerConfig): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager(config);
    }
    return ServiceManager.instance;
  }

  private async initialize() {
    try {
      logger.info('Initializing Service Manager');
      
      // Sync static service data to database if enabled
      if (this.config.syncStaticData) {
        // Don't await - let it run in background to avoid blocking
        this.syncStaticServiceData().catch(error => {
          logger.warn('Failed to sync static service data, continuing without it:', error);
        });
      }
      
      // Load services from database into cache
      await this.loadServicesIntoCache();
      
      // Start health monitoring if enabled
      if (this.config.enableHealthMonitoring) {
        this.startHealthMonitoring();
      }
      
      // Auto-discover and register services if enabled
      if (this.config.enableAutoDiscovery) {
        await this.discoverAndRegisterServices();
      }
      
      logger.info('Service Manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize Service Manager:', error);
      this.emit('error', error);
    }
  }

  /**
   * Sync static service data to database
   */
  private async syncStaticServiceData() {
    try {
      logger.info('Syncing static service data to database');
      
      for (const serviceData of servicesData) {
        // Check if service exists in database
        const existingService = await db.select()
          .from(services)
          .where(eq(services.code, serviceData.id))
          .limit(1);
        
        if (existingService.length === 0) {
          // Create new service
          const newService: InsertService = {
            code: serviceData.id,
            name: serviceData.name,
            description: serviceData.description,
            category: this.mapToServiceCategory(serviceData.tags),
            type: 'internal',
            status: 'active',
            version: '1.0.0',
            tags: serviceData.tags,
            businessTypes: serviceData.businessTypes,
            cargoTypes: serviceData.cargoTypes,
            capabilities: serviceData.capabilities,
            features: serviceData.capabilities,
            isActive: true
          };
          
          await db.insert(services).values(newService);
          logger.info(`Synced service: ${serviceData.name}`);
        } else {
          // Update existing service with latest data
          await db.update(services)
            .set({
              name: serviceData.name,
              description: serviceData.description,
              tags: serviceData.tags,
              businessTypes: serviceData.businessTypes,
              cargoTypes: serviceData.cargoTypes,
              capabilities: serviceData.capabilities,
              features: serviceData.capabilities,
              updatedAt: new Date()
            })
            .where(eq(services.code, serviceData.id));
        }
      }
      
      logger.info('Static service data sync completed');
    } catch (error) {
      logger.error('Failed to sync static service data:', error);
    }
  }

  private mapToServiceCategory(tags: string[]): string {
    if (tags.some(tag => tag.includes('shipping'))) return 'SHIPPING';
    if (tags.some(tag => tag.includes('warehouse'))) return 'WAREHOUSING';
    if (tags.some(tag => tag.includes('customs'))) return 'CUSTOMS';
    if (tags.some(tag => tag.includes('freight'))) return 'FREIGHT';
    if (tags.some(tag => tag.includes('logistics'))) return 'LOGISTICS';
    if (tags.some(tag => tag.includes('consulting'))) return 'CONSULTING';
    return 'OTHER';
  }

  /**
   * Load services from database into cache
   */
  private async loadServicesIntoCache() {
    try {
      const allServices = await db.select().from(services).where(eq(services.isActive, true));
      
      if (allServices && allServices.length > 0) {
        for (const service of allServices) {
          this.serviceCache.set(service.code, service);
        }
        logger.info(`Loaded ${allServices.length} services into cache`);
      } else {
        logger.info('No services found in database, starting with empty cache');
      }
    } catch (error) {
      logger.warn('Failed to load services into cache, starting with empty cache:', error);
      // Continue with empty cache - don't block initialization
    }
  }

  /**
   * Discover and register available services
   */
  private async discoverAndRegisterServices() {
    try {
      logger.info('Discovering and registering services');
      
      // Register internal services
      const internalServices = [
        {
          code: 'ai-recommender',
          name: 'AI Service Recommender',
          category: 'AI',
          type: 'internal' as const,
          description: 'AI-powered service recommendation engine'
        },
        {
          code: 'carrier-integration',
          name: 'Carrier Integration Service',
          category: 'INTEGRATION',
          type: 'integration' as const,
          description: 'Integrates with external carrier services'
        },
        {
          code: 'health-monitor',
          name: 'Service Health Monitor',
          category: 'MONITORING',
          type: 'internal' as const,
          description: 'Monitors health status of all services'
        },
        {
          code: 'cpu-optimizer',
          name: 'CPU Optimizer Service',
          category: 'PERFORMANCE',
          type: 'internal' as const,
          description: 'Optimizes CPU usage across services'
        }
      ];
      
      for (const service of internalServices) {
        await this.registerService(service);
      }
      
      logger.info('Service discovery completed');
    } catch (error) {
      logger.error('Failed to discover and register services:', error);
    }
  }

  /**
   * Start health monitoring for all services
   */
  private startHealthMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllServicesHealth();
    }, this.config.healthCheckInterval!);
    
    // Perform initial health check
    this.checkAllServicesHealth();
    
    logger.info('Service health monitoring started');
  }

  /**
   * Check health of all active services
   */
  private async checkAllServicesHealth() {
    try {
      const activeServices = Array.from(this.serviceCache.values());
      
      for (const service of activeServices) {
        await this.checkServiceHealth(service.code);
      }
    } catch (error) {
      logger.error('Failed to check services health:', error);
    }
  }

  /**
   * Check health of a specific service
   */
  public async checkServiceHealth(serviceCode: string): Promise<void> {
    try {
      const service = this.serviceCache.get(serviceCode);
      if (!service) {
        logger.warn(`Service ${serviceCode} not found`);
        return;
      }
      
      // Get health status from service health monitor
      const healthStatus = serviceHealthMonitor.getServiceById(serviceCode);
      
      let status: string = 'healthy';
      let responseTime = 0;
      let errorRate = 0;
      let successRate = 100;
      
      if (healthStatus) {
        status = healthStatus.status === 'available' ? 'healthy' : 
                healthStatus.status === 'degraded' ? 'degraded' : 'unhealthy';
        responseTime = healthStatus.responseTime;
        errorRate = healthStatus.errorRate;
        successRate = healthStatus.successRate;
      }
      
      // Update service health status
      await db.update(services)
        .set({
          healthStatus: status,
          lastHealthCheck: new Date(),
          metrics: {
            responseTime,
            errorRate,
            successRate,
            timestamp: new Date().toISOString()
          }
        })
        .where(eq(services.code, serviceCode));
      
      // Log health check
      const healthLog: InsertServiceHealthLog = {
        serviceId: service.id,
        status,
        responseTime,
        errorRate: errorRate.toString(),
        successRate: successRate.toString(),
        consecutiveFailures: healthStatus?.consecutiveFailures || 0
      };
      
      await db.insert(serviceHealthLogs).values(healthLog);
      
      // Handle unhealthy services
      if (status === 'unhealthy' && this.config.autoRestartOnFailure) {
        await this.attemptServiceRestart(serviceCode);
      }
      
      this.emit('healthChecked', { serviceCode, status, responseTime });
    } catch (error) {
      logger.error(`Failed to check health for service ${serviceCode}:`, error);
    }
  }

  /**
   * Register a new service
   */
  public async registerService(registration: ServiceRegistration): Promise<SelectService> {
    try {
      // Check if service already exists
      const existingService = await db.select()
        .from(services)
        .where(eq(services.code, registration.code))
        .limit(1);
      
      if (existingService.length > 0) {
        logger.info(`Service ${registration.code} already registered`);
        return existingService[0];
      }
      
      // Create new service
      const newService: InsertService = {
        code: registration.code,
        name: registration.name,
        description: registration.description,
        category: registration.category,
        type: registration.type,
        version: registration.version || '1.0.0',
        status: 'active',
        config: registration.config,
        metadata: registration.metadata,
        isActive: true
      };
      
      const [createdService] = await db.insert(services)
        .values(newService)
        .returning();
      
      // Add to cache
      this.serviceCache.set(createdService.code, createdService);
      
      logger.info(`Service ${registration.name} registered successfully`);
      this.emit('serviceRegistered', createdService);
      
      return createdService;
    } catch (error) {
      logger.error('Failed to register service:', error);
      throw error;
    }
  }

  /**
   * Create a service instance
   */
  public async createServiceInstance(
    serviceCode: string,
    instanceConfig: any = {}
  ): Promise<SelectServiceInstance> {
    try {
      const service = this.serviceCache.get(serviceCode);
      if (!service) {
        throw new Error(`Service ${serviceCode} not found`);
      }
      
      const instanceId = `${serviceCode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newInstance: InsertServiceInstance = {
        serviceId: service.id,
        instanceId,
        name: `${service.name} Instance`,
        status: 'starting',
        health: 'healthy',
        config: instanceConfig,
        startedAt: new Date()
      };
      
      const [createdInstance] = await db.insert(serviceInstances)
        .values(newInstance)
        .returning();
      
      // Add to cache
      this.instanceCache.set(instanceId, createdInstance);
      
      // Update status to running
      await db.update(serviceInstances)
        .set({ status: 'running' })
        .where(eq(serviceInstances.id, createdInstance.id));
      
      logger.info(`Service instance ${instanceId} created`);
      this.emit('instanceCreated', createdInstance);
      
      return createdInstance;
    } catch (error) {
      logger.error('Failed to create service instance:', error);
      throw error;
    }
  }

  /**
   * Stop a service instance
   */
  public async stopServiceInstance(instanceId: string): Promise<void> {
    try {
      await db.update(serviceInstances)
        .set({ 
          status: 'stopped',
          stoppedAt: new Date()
        })
        .where(eq(serviceInstances.instanceId, instanceId));
      
      // Remove from cache
      this.instanceCache.delete(instanceId);
      
      logger.info(`Service instance ${instanceId} stopped`);
      this.emit('instanceStopped', instanceId);
    } catch (error) {
      logger.error('Failed to stop service instance:', error);
      throw error;
    }
  }

  /**
   * Attempt to restart a service
   */
  private async attemptServiceRestart(serviceCode: string): Promise<void> {
    try {
      logger.info(`Attempting to restart service ${serviceCode}`);
      
      // Force recovery through health monitor
      const recovered = await serviceHealthMonitor.forceServiceRecovery(serviceCode);
      
      if (recovered) {
        await db.update(services)
          .set({
            healthStatus: 'healthy',
            lastHealthCheck: new Date()
          })
          .where(eq(services.code, serviceCode));
        
        logger.info(`Service ${serviceCode} restarted successfully`);
        this.emit('serviceRestarted', serviceCode);
      } else {
        logger.error(`Failed to restart service ${serviceCode}`);
        this.emit('serviceRestartFailed', serviceCode);
      }
    } catch (error) {
      logger.error(`Error restarting service ${serviceCode}:`, error);
    }
  }

  /**
   * Get all services
   */
  public async getAllServices(): Promise<SelectService[]> {
    try {
      // If we have cached services, return them first
      if (this.serviceCache.size > 0) {
        return Array.from(this.serviceCache.values());
      }
      
      // Try to fetch from database with timeout
      const dbPromise = db.select()
        .from(services)
        .orderBy(desc(services.sortOrder), services.name);
      
      const timeoutPromise = new Promise<SelectService[]>((resolve) => 
        setTimeout(() => {
          logger.warn('Database query timeout, returning cached services');
          resolve(Array.from(this.serviceCache.values()));
        }, 3000)
      );
      
      const allServices = await Promise.race([dbPromise, timeoutPromise]);
      return allServices || [];
    } catch (error) {
      logger.warn('Failed to get all services, returning cached data:', error);
      // Return cached services if database fails
      return Array.from(this.serviceCache.values());
    }
  }

  /**
   * Get service by code
   */
  public async getServiceByCode(code: string): Promise<SelectService | null> {
    try {
      const service = this.serviceCache.get(code);
      if (service) {
        return service;
      }
      
      const [dbService] = await db.select()
        .from(services)
        .where(eq(services.code, code))
        .limit(1);
      
      if (dbService) {
        this.serviceCache.set(code, dbService);
      }
      
      return dbService || null;
    } catch (error) {
      logger.error(`Failed to get service ${code}:`, error);
      throw error;
    }
  }

  /**
   * Update service
   */
  public async updateService(
    code: string,
    updates: Partial<InsertService>
  ): Promise<SelectService> {
    try {
      const [updatedService] = await db.update(services)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(services.code, code))
        .returning();
      
      // Update cache
      this.serviceCache.set(code, updatedService);
      
      logger.info(`Service ${code} updated`);
      this.emit('serviceUpdated', updatedService);
      
      return updatedService;
    } catch (error) {
      logger.error(`Failed to update service ${code}:`, error);
      throw error;
    }
  }

  /**
   * Delete service
   */
  public async deleteService(code: string): Promise<void> {
    try {
      // Soft delete by marking as inactive
      await db.update(services)
        .set({
          isActive: false,
          status: 'deprecated',
          updatedAt: new Date()
        })
        .where(eq(services.code, code));
      
      // Remove from cache
      this.serviceCache.delete(code);
      
      logger.info(`Service ${code} deleted`);
      this.emit('serviceDeleted', code);
    } catch (error) {
      logger.error(`Failed to delete service ${code}:`, error);
      throw error;
    }
  }

  /**
   * Search services
   */
  public async searchServices(query: string): Promise<SelectService[]> {
    try {
      // Use cached services for search if available
      const searchSource = this.serviceCache.size > 0 
        ? Array.from(this.serviceCache.values())
        : await this.getAllServices().catch(() => []);
      
      const lowerQuery = query.toLowerCase();
      return searchSource.filter(service => 
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description?.toLowerCase().includes(lowerQuery) ||
        service.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        service.code.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      logger.warn('Failed to search services, returning empty results:', error);
      return [];
    }
  }

  /**
   * Get service metrics
   */
  public async getServiceMetrics(serviceCode: string): Promise<ServiceMetrics> {
    try {
      const service = await this.getServiceByCode(serviceCode);
      if (!service) {
        throw new Error(`Service ${serviceCode} not found`);
      }
      
      // Get usage statistics
      const usageStats = await db.select({
        requestCount: sql<number>`count(*)`,
        errorCount: sql<number>`sum(case when status = 'error' then 1 else 0 end)`,
        avgDuration: sql<number>`avg(duration)`
      })
      .from(serviceUsage)
      .where(eq(serviceUsage.serviceId, service.id));
      
      const stats = usageStats[0] || { requestCount: 0, errorCount: 0, avgDuration: 0 };
      
      // Get latest health logs
      const healthLogs = await db.select()
        .from(serviceHealthLogs)
        .where(eq(serviceHealthLogs.serviceId, service.id))
        .orderBy(desc(serviceHealthLogs.createdAt))
        .limit(10);
      
      // Calculate metrics
      const successRate = stats.requestCount > 0 
        ? ((stats.requestCount - stats.errorCount) / stats.requestCount) * 100 
        : 100;
      
      return {
        requestCount: stats.requestCount,
        errorCount: stats.errorCount,
        averageResponseTime: stats.avgDuration || 0,
        successRate,
        uptime: this.calculateUptime(service.createdAt),
        lastError: healthLogs.find(log => log.error)?.error || undefined
      };
    } catch (error) {
      logger.error(`Failed to get metrics for service ${serviceCode}:`, error);
      throw error;
    }
  }

  private calculateUptime(createdAt: Date): number {
    return Date.now() - new Date(createdAt).getTime();
  }

  /**
   * Log service usage
   */
  public async logServiceUsage(
    serviceCode: string,
    action: string,
    status: string,
    duration?: number,
    metadata?: any
  ): Promise<void> {
    try {
      const service = await this.getServiceByCode(serviceCode);
      if (!service) {
        return;
      }
      
      const usage: InsertServiceUsage = {
        serviceId: service.id,
        action,
        status,
        duration,
        metadata,
        requestId: `${serviceCode}-${Date.now()}`
      };
      
      await db.insert(serviceUsage).values(usage);
    } catch (error) {
      logger.error('Failed to log service usage:', error);
    }
  }

  /**
   * Get service health history
   */
  public async getServiceHealthHistory(
    serviceCode: string,
    limit: number = 100
  ): Promise<SelectServiceHealthLog[]> {
    try {
      const service = await this.getServiceByCode(serviceCode);
      if (!service) {
        return [];
      }
      
      const healthLogs = await db.select()
        .from(serviceHealthLogs)
        .where(eq(serviceHealthLogs.serviceId, service.id))
        .orderBy(desc(serviceHealthLogs.createdAt))
        .limit(limit);
      
      return healthLogs;
    } catch (error) {
      logger.error(`Failed to get health history for service ${serviceCode}:`, error);
      throw error;
    }
  }

  /**
   * Shutdown the service manager
   */
  public async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Service Manager');
      
      // Stop health monitoring
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      // Stop all service instances
      const instances = Array.from(this.instanceCache.values());
      for (const instance of instances) {
        await this.stopServiceInstance(instance.instanceId);
      }
      
      // Clear caches
      this.serviceCache.clear();
      this.instanceCache.clear();
      
      logger.info('Service Manager shutdown complete');
      this.emit('shutdown');
    } catch (error) {
      logger.error('Error during Service Manager shutdown:', error);
    }
  }
}

// Export singleton instance
export const serviceManager = ServiceManager.getInstance();
export default ServiceManager;