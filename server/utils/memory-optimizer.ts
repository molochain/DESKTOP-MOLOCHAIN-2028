/**
 * Utils Memory Optimizer - COMPATIBILITY STUB
 * Original file moved to archive/disabled-optimizers-2025-08-25/
 * Using unified memory optimizer instead
 */

import { unifiedMemoryOptimizer } from '../core/monitoring/unified-memory-optimizer';

// Compatibility exports to prevent import errors
export const memoryOptimizer = {
  getMemoryStats: () => ({ disabled: true, percentage: 0 }),
  optimize: () => {}, // Using unified memory optimizer
  forceGarbageCollection: () => {}, // Using unified memory optimizer GC
  destroy: () => unifiedMemoryOptimizer.destroy(),
  cleanup: () => unifiedMemoryOptimizer.destroy()
};