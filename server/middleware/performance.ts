import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import dbOptimizer from '../utils/database-optimizer';

interface PerformanceMetrics {
  requestStart: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  const startCpu = process.cpuUsage();

  // Store metrics in request object
  (req as any).performanceMetrics = {
    requestStart: startTime,
    memoryUsage: startMemory,
    cpuUsage: startCpu
  } as PerformanceMetrics;

  // Track response completion
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const endMemory = process.memoryUsage();
    const endCpu = process.cpuUsage(startCpu);

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
        memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
        cpuTime: endCpu.user + endCpu.system
      });
    }

    // Track database query performance if applicable
    if (req.path.startsWith('/api/')) {
      dbOptimizer.trackQuery(
        `${req.method} ${req.path}`,
        duration,
        0 // Row count would need to be tracked separately
      );
    }
  });

  next();
};

export const memoryMonitor = () => {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  // Log memory warnings
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  
  if (heapUsedMB > 500) { // 500MB threshold
    logger.warn('High memory usage detected', {
      heapUsed: `${heapUsedMB.toFixed(2)}MB`,
      heapTotal: `${heapTotalMB.toFixed(2)}MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`,
      cpuUser: cpuUsage.user,
      cpuSystem: cpuUsage.system
    });
  }

  // Force garbage collection if memory is very high
  if (heapUsedMB > 800 && global.gc) {
    global.gc();
    logger.info('Garbage collection triggered');
  }
};

// Start memory monitoring with reduced frequency
setInterval(memoryMonitor, 120000); // Every 2 minutes to reduce CPU load

export default performanceMiddleware;