import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('circuit-breaker');

interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  successCount: number;
  lastStateChange: number;
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
      successCount: 0,
      lastStateChange: Date.now()
    });
  }
  return circuits.get(serviceName)!;
}

export function recordSuccess(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  
  if (circuit.state === 'half-open') {
    circuit.successCount++;
    logger.debug('Half-open success recorded', { 
      service: serviceName, 
      successCount: circuit.successCount,
      threshold: config.halfOpenSuccessThreshold
    });
    
    if (circuit.successCount >= config.halfOpenSuccessThreshold) {
      circuit.state = 'closed';
      circuit.failures = 0;
      circuit.successCount = 0;
      circuit.lastStateChange = Date.now();
      logger.info('Circuit closed after recovery', { service: serviceName });
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
  
  logger.debug('Failure recorded', { 
    service: serviceName, 
    failures: circuit.failures,
    threshold: config.failureThreshold,
    currentState: circuit.state
  });
  
  if (circuit.failures >= config.failureThreshold && circuit.state !== 'open') {
    circuit.state = 'open';
    circuit.lastStateChange = Date.now();
    logger.warn('Circuit opened due to failures', { 
      service: serviceName, 
      failures: circuit.failures,
      resetTimeout: config.resetTimeout 
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
      circuit.lastStateChange = Date.now();
      logger.info('Circuit transitioned to half-open', { 
        service: serviceName,
        timeSinceFailure
      });
      return false;
    }
    return true;
  }
  
  return false;
}

export function getCircuitStats(): Record<string, { 
  state: string; 
  failures: number;
  successCount: number;
  lastStateChange: string;
}> {
  const stats: Record<string, { 
    state: string; 
    failures: number;
    successCount: number;
    lastStateChange: string;
  }> = {};
  
  circuits.forEach((circuit, name) => {
    stats[name] = {
      state: circuit.state,
      failures: circuit.failures,
      successCount: circuit.successCount,
      lastStateChange: new Date(circuit.lastStateChange).toISOString()
    };
  });
  
  return stats;
}

export interface RequestWithTiming extends Request {
  gatewayStartTime?: number;
}

export function circuitBreakerMiddleware(serviceName: string) {
  return (req: RequestWithTiming, res: Response, next: NextFunction) => {
    if (isCircuitOpen(serviceName)) {
      logger.warn('Request blocked by circuit breaker', {
        service: serviceName,
        path: req.path,
        circuitState: 'open'
      });
      
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `${serviceName} is temporarily unavailable. Please try again later.`,
        service: serviceName,
        retryAfter: Math.ceil(config.resetTimeout / 1000)
      });
    }
    
    req.gatewayStartTime = Date.now();
    
    next();
  };
}

export function getCircuitState(serviceName: string): 'closed' | 'open' | 'half-open' {
  const circuit = getCircuit(serviceName);
  
  if (circuit.state === 'open') {
    const timeSinceFailure = Date.now() - circuit.lastFailure;
    if (timeSinceFailure >= config.resetTimeout) {
      return 'half-open';
    }
  }
  
  return circuit.state;
}
