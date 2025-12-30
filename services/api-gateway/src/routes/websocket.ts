import { Server, IncomingMessage } from 'http';
import { Socket } from 'net';
import WebSocket, { WebSocketServer } from 'ws';
import { URL } from 'url';
import jwt from 'jsonwebtoken';
import { services, gatewayConfig, ServiceConfig } from '../config/services.js';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('websocket');

interface WSConnection {
  ws: WebSocket;
  service: ServiceConfig;
  userId?: number;
  apiKeyId?: number;
  connectedAt: Date;
}

class WebSocketGateway {
  private connections: Map<string, WSConnection> = new Map();
  private serviceConnections: Map<string, WebSocket> = new Map();
  
  constructor(private server: Server) {
    this.setupUpgradeHandler();
  }
  
  private setupUpgradeHandler() {
    this.server.on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
      try {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const pathname = url.pathname;
        
        logger.debug('WebSocket upgrade request', { pathname });
        
        const service = this.findServiceForPath(pathname);
        
        if (!service) {
          logger.warn('No service found for WebSocket path', { pathname });
          socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
          socket.destroy();
          return;
        }
        
        const auth = await this.authenticateWebSocket(req, service);
        
        if (!auth.authenticated && service.authentication !== 'none') {
          logger.warn('WebSocket authentication failed', { 
            pathname, 
            service: service.name 
          });
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }
        
        await this.proxyWebSocket(req, socket, head, service, auth);
        
      } catch (error) {
        logger.error('WebSocket upgrade error', { 
          error: (error as Error).message 
        });
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
      }
    });
  }
  
  private findServiceForPath(pathname: string): ServiceConfig | null {
    for (const service of services) {
      if (service.wsEnabled && service.wsPath && pathname.startsWith(service.wsPath)) {
        return service;
      }
    }
    return null;
  }
  
  private async authenticateWebSocket(
    req: IncomingMessage, 
    service: ServiceConfig
  ): Promise<{ authenticated: boolean; userId?: number; apiKeyId?: number }> {
    if (service.authentication === 'none') {
      return { authenticated: true };
    }
    
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || 
                  req.headers['sec-websocket-protocol']?.split(',')[0]?.trim();
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const bearerToken = authHeader.slice(7);
        return this.validateToken(bearerToken);
      }
      return { authenticated: false };
    }
    
    return this.validateToken(token);
  }
  
  private validateToken(token: string): { authenticated: boolean; userId?: number; apiKeyId?: number } {
    try {
      if (token.includes(':')) {
        logger.debug('API key format detected in WebSocket token, rejecting');
        return { authenticated: false };
      }
      
      if (!gatewayConfig.jwtSecret) {
        logger.error('JWT_SECRET not configured - WebSocket auth will fail in production');
        if (process.env.NODE_ENV === 'production') {
          return { authenticated: false };
        }
        logger.warn('DEV MODE: Allowing WebSocket connection without JWT validation');
        return { authenticated: true, userId: 0 };
      }
      
      const decoded = jwt.verify(token, gatewayConfig.jwtSecret) as any;
      return {
        authenticated: true,
        userId: decoded.userId || decoded.id
      };
    } catch (error) {
      logger.debug('WebSocket token validation failed', { 
        error: (error as Error).message 
      });
      return { authenticated: false };
    }
  }
  
  private async proxyWebSocket(
    req: IncomingMessage,
    socket: Socket,
    head: Buffer,
    service: ServiceConfig,
    auth: { authenticated: boolean; userId?: number; apiKeyId?: number }
  ) {
    const targetUrl = service.target.replace('http://', 'ws://').replace('https://', 'wss://');
    const targetPath = req.url?.replace(service.wsPath || '', '') || '/';
    const fullTarget = `${targetUrl}${targetPath}`;
    
    logger.info('Proxying WebSocket connection', {
      service: service.name,
      target: fullTarget,
      userId: auth.userId
    });
    
    const backendWs = new WebSocket(fullTarget, {
      headers: {
        'X-User-ID': auth.userId?.toString() || '',
        'X-API-Key-ID': auth.apiKeyId?.toString() || '',
        'X-Forwarded-For': req.socket.remoteAddress || '',
        'X-Real-IP': req.headers['x-real-ip'] as string || req.socket.remoteAddress || ''
      }
    });
    
    const clientWss = new WebSocketServer({ noServer: true });
    
    clientWss.handleUpgrade(req, socket, head, (clientWs: WebSocket) => {
      const connectionId = `${service.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.connections.set(connectionId, {
        ws: clientWs,
        service,
        userId: auth.userId,
        apiKeyId: auth.apiKeyId,
        connectedAt: new Date()
      });
      
      clientWs.on('message', (data: Buffer | string) => {
        if (backendWs.readyState === WebSocket.OPEN) {
          backendWs.send(data);
        }
      });
      
      backendWs.on('message', (data: Buffer | string) => {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data);
        }
      });
      
      clientWs.on('close', (code: number, reason: Buffer) => {
        logger.debug('Client WebSocket closed', { 
          connectionId, 
          code, 
          reason: reason.toString() 
        });
        this.connections.delete(connectionId);
        if (backendWs.readyState === WebSocket.OPEN) {
          backendWs.close(code, reason);
        }
      });
      
      backendWs.on('close', (code: number, reason: Buffer) => {
        logger.debug('Backend WebSocket closed', { 
          connectionId, 
          code, 
          reason: reason.toString() 
        });
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close(code, reason);
        }
      });
      
      clientWs.on('error', (error: Error) => {
        logger.error('Client WebSocket error', { 
          connectionId, 
          error: error.message 
        });
      });
      
      backendWs.on('error', (error: Error) => {
        logger.error('Backend WebSocket error', { 
          connectionId, 
          error: error.message 
        });
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close(1011, 'Backend error');
        }
      });
      
      logger.info('WebSocket connection established', {
        connectionId,
        service: service.name,
        userId: auth.userId
      });
    });
  }
  
  getStats() {
    const byService: Record<string, number> = {};
    
    for (const [, conn] of this.connections) {
      byService[conn.service.name] = (byService[conn.service.name] || 0) + 1;
    }
    
    return {
      totalConnections: this.connections.size,
      byService
    };
  }
}

let wsGateway: WebSocketGateway | null = null;

export function initializeWebSocketGateway(server: Server): WebSocketGateway {
  if (!wsGateway) {
    wsGateway = new WebSocketGateway(server);
    logger.info('WebSocket Gateway initialized');
  }
  return wsGateway;
}

export function getWebSocketStats() {
  return wsGateway?.getStats() || { totalConnections: 0, byService: {} };
}
