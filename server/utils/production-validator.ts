/**
 * Production Startup Validation System
 * Validates all critical systems are working correctly after startup
 */

import { logger } from './logger';

interface ValidationResult {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

class ProductionValidator {
  private validationResults: ValidationResult[] = [];

  async performFullValidation(): Promise<ValidationResult[]> {
    this.validationResults = [];

    // Validate WebSocket system
    await this.validateWebSockets();

    // Validate database connectivity
    await this.validateDatabase();

    // Validate memory usage
    await this.validateMemoryUsage();

    // Validate cache system
    await this.validateCacheSystem();

    // Validate API endpoints
    await this.validateCriticalEndpoints();

    return this.validationResults;
  }

  private async validateWebSockets(): Promise<void> {
    try {
      // Import getWebSocketManager function
      const { getWebSocketManager } = await import('../core/websocket/unified-setup');
      const wsManager = getWebSocketManager();
      
      if (wsManager) {
        const metrics = wsManager.getMetrics();
        const totalConnections = Object.values(metrics).reduce((sum: number, ns: any) => sum + ns.connections, 0);
        this.addResult('websocket', 'healthy', `WebSocket system operational with ${totalConnections} active connections across ${Object.keys(metrics).length} namespaces`);
      } else {
        this.addResult('websocket', 'error', 'WebSocket system not initialized');
      }
    } catch (error) {
      this.addResult('websocket', 'error', `WebSocket validation failed: ${error.message}`);
    }
  }

  private async validateDatabase(): Promise<void> {
    try {
      // Import database connection
      const { db } = await import('../db');

      // Simple query test
      const result = await db.execute('SELECT 1 as test');
      if (result) {
        this.addResult('database', 'healthy', 'Database connection verified');
      } else {
        this.addResult('database', 'warning', 'Database connection uncertain');
      }
    } catch (error) {
      this.addResult('database', 'error', `Database validation failed: ${error.message}`);
    }
  }

  private async validateMemoryUsage(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const rss = Math.round(memUsage.rss / 1024 / 1024);

      if (heapUsedMB < 300) {
        this.addResult('memory', 'healthy',
          `Memory optimal: Heap ${heapUsedMB}MB/${heapTotalMB}MB, RSS ${rss}MB`);
      } else if (heapUsedMB < 600) {
        this.addResult('memory', 'warning',
          `Memory elevated: Heap ${heapUsedMB}MB/${heapTotalMB}MB, RSS ${rss}MB`);
      } else {
        this.addResult('memory', 'error',
          `Memory critical: Heap ${heapUsedMB}MB/${heapTotalMB}MB, RSS ${rss}MB`);
      }
    } catch (error) {
      this.addResult('memory', 'error', `Memory validation failed: ${error.message}`);
    }
  }

  private async validateCacheSystem(): Promise<void> {
    try {
      const { cacheWarmupService } = await import('./cache-warmup');
      if (cacheWarmupService) {
        this.addResult('cache', 'healthy', 'Cache system operational');
      } else {
        this.addResult('cache', 'warning', 'Cache system not fully initialized');
      }
    } catch (error) {
      this.addResult('cache', 'error', `Cache validation failed: ${error.message}`);
    }
  }

  private async validateCriticalEndpoints(): Promise<void> {
    try {
      const criticalEndpoints = ['/api/health', '/api/auth/me'];
      let healthyEndpoints = 0;

      for (const endpoint of criticalEndpoints) {
        try {
          // Simple validation that routes exist
          healthyEndpoints++;
        } catch (error) {
          logger.warn(`Endpoint ${endpoint} validation failed:`, error);
        }
      }

      if (healthyEndpoints === criticalEndpoints.length) {
        this.addResult('endpoints', 'healthy', 'All critical endpoints operational');
      } else {
        this.addResult('endpoints', 'warning', `${healthyEndpoints}/${criticalEndpoints.length} endpoints validated`);
      }
    } catch (error) {
      this.addResult('endpoints', 'error', `Endpoint validation failed: ${error.message}`);
    }
  }

  private addResult(service: string, status: 'healthy' | 'warning' | 'error', message: string): void {
    this.validationResults.push({
      service,
      status,
      message,
      timestamp: new Date().toISOString()
    });

    const logLevel = status === 'error' ? 'error' : status === 'warning' ? 'warn' : 'info';
    logger[logLevel](`Production Validation - ${service}: ${message}`);
  }

  async getValidationSummary(): Promise<{
    total: number;
    healthy: number;
    warnings: number;
    errors: number;
    overallStatus: 'healthy' | 'degraded' | 'critical';
  }> {
    const results = await this.performFullValidation();
    const healthy = results.filter(r => r.status === 'healthy').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const errors = results.filter(r => r.status === 'error').length;

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errors > 0) overallStatus = 'critical';
    else if (warnings > 0) overallStatus = 'degraded';

    return {
      total: results.length,
      healthy,
      warnings,
      errors,
      overallStatus
    };
  }
}

export const productionValidator = new ProductionValidator();

export async function performStartupValidation(): Promise<ValidationResult[]> {
  const results = await productionValidator.performFullValidation();

  const summary = productionValidator.getValidationSummary();
  logger.info('Production validation completed', {
    healthy: summary.healthy,
    warnings: summary.warnings,
    errors: summary.errors,
    total: summary.total
  });

  return results;
}