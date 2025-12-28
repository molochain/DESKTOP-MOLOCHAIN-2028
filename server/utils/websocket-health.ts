import { WebSocket } from 'ws';
import { logger } from './logger';

export class WebSocketHealthMonitor {
  private connections = new Map<string, Set<WebSocket>>();
  private metrics = {
    totalConnections: 0,
    activeConnections: 0,
    reconnectionAttempts: 0,
    errorCount: 0,
    lastHeartbeat: new Date()
  };

  constructor() {
    this.startHealthChecks();
  }

  addConnection(serviceName: string, ws: WebSocket) {
    if (!this.connections.has(serviceName)) {
      this.connections.set(serviceName, new Set());
    }
    
    this.connections.get(serviceName)!.add(ws);
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;
    
    ws.on('close', () => {
      this.removeConnection(serviceName, ws);
    });
    
    ws.on('error', (error) => {
      this.metrics.errorCount++;
      logger.error(`WebSocket error in ${serviceName}:`, error);
    });
    
    // Setup heartbeat
    this.setupHeartbeat(ws);
  }

  private removeConnection(serviceName: string, ws: WebSocket) {
    const connections = this.connections.get(serviceName);
    if (connections) {
      connections.delete(ws);
      this.metrics.activeConnections--;
      
      if (connections.size === 0) {
        this.connections.delete(serviceName);
      }
    }
  }

  private setupHeartbeat(ws: WebSocket) {
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
        this.metrics.lastHeartbeat = new Date();
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 30 seconds

    ws.on('pong', () => {
      this.metrics.lastHeartbeat = new Date();
    });
  }

  private startHealthChecks() {
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  private performHealthCheck() {
    const unhealthyServices: string[] = [];
    
    this.connections.forEach((connections, serviceName) => {
      const deadConnections: WebSocket[] = [];
      
      connections.forEach(ws => {
        if (ws.readyState !== WebSocket.OPEN) {
          deadConnections.push(ws);
        }
      });
      
      // Remove dead connections
      deadConnections.forEach(ws => {
        this.removeConnection(serviceName, ws);
      });
      
      // Check if service is unhealthy
      if (connections.size === 0 && deadConnections.length > 0) {
        unhealthyServices.push(serviceName);
      }
    });
    
    if (unhealthyServices.length > 0) {
      logger.warn('Unhealthy WebSocket services detected:', unhealthyServices);
    }
  }

  getHealthStatus() {
    const serviceStats: Array<{name: string, status: string, connections: number}> = [];
    this.connections.forEach((connections, name) => {
      serviceStats.push({
        name,
        status: connections.size > 0 ? 'healthy' : 'inactive',
        connections: connections.size
      });
    });

    return {
      status: this.metrics.activeConnections > 0 ? 'healthy' : 'degraded',
      totalConnections: this.metrics.totalConnections,
      activeConnections: this.metrics.activeConnections,
      services: serviceStats,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      servicesCount: this.connections.size,
      averageConnectionsPerService: this.connections.size > 0 
        ? this.metrics.activeConnections / this.connections.size 
        : 0
    };
  }
}

export const wsHealthMonitor = new WebSocketHealthMonitor();