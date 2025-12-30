import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('circuit-breaker');

interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  successCount: number;
}

const circuits: Map<string, CircuitState> = new Map();

const config = {
  failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD || '5', 10),
  resetTimeout: parseInt(process.env.CB_RESET_TIMEOUT || '30000', 10),
  halfOpenSuccessThreshold: parseInt(process.env.CB_HALF_OPEN_THRESHOLD || '3', 10)
};

function getCircuit(serviceName: string): CircuitState {
  if (!circuits.has(serviceName)) {
    circuits.set(serviceName, {
      failures: 0,
      lastFailure: 0,
      state: 'closed',
      successCount: 0
    });
  }
  return circuits.get(serviceName)!;
}

export function recordSuccess(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  
  if (circuit.state === 'half-open') {
    circuit.successCount++;
    if (circuit.successCount >= config.halfOpenSuccessThreshold) {
      circuit.state = 'closed';
      circuit.failures = 0;
      circuit.successCount = 0;
      logger.info('Circuit closed', { service: serviceName });
    }
  } else if (circuit.state === 'closed') {
    circuit.failures = Math.max(0, circuit.failures - 1);
  }
}

export function recordFailure(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  
  circuit.failures++;
  circuit.lastFailure = Date.now();
  circuit.successCount = 0;
  
  if (circuit.failures >= config.failureThreshold && circuit.state !== 'open') {
    circuit.state = 'open';
    logger.warn('Circuit opened', { 
      service: serviceName, 
      failures: circuit.failures,
      resetIn: config.resetTimeout 
    });
  }
}

export function isCircuitOpen(serviceName: string): boolean {
  const circuit = getCircuit(serviceName);
  
  if (circuit.state === 'open') {
    const timeSinceFailure = Date.now() - circuit.lastFailure;
    
    if (timeSinceFailure >= config.resetTimeout) {
      circuit.state = 'half-open';
      circuit.successCount = 0;
      logger.info('Circuit half-open', { service: serviceName });
      return false;
    }
    return true;
  }
  
  return false;
}

export function getCircuitStats(): Record<string, { state: string; failures: number }> {
  const stats: Record<string, { state: string; failures: number }> = {};
  
  circuits.forEach((circuit, name) => {
    stats[name] = {
      state: circuit.state,
      failures: circuit.failures
    };
  });
  
  return stats;
}

export function circuitBreakerMiddleware(serviceName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isCircuitOpen(serviceName)) {
      logger.warn('Request blocked by circuit breaker', {
        service: serviceName,
        path: req.path
      });
      
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `${serviceName} is temporarily unavailable. Please try again later.`,
        service: serviceName,
        retryAfter: Math.ceil(config.resetTimeout / 1000)
      });
    }
    
    next();
  };
}
