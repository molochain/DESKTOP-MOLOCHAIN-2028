import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import { logger } from './logger';
import { WEBSOCKET_CONFIG } from '../../config';
import { trackConnectionEvent } from './websocket-health';

// Common WebSocket subscription interface
export interface BaseSubscription {
  id: string;
  ws: WebSocket;
  userId: number | null;
  subscriptions: Set<string>;
  lastHeartbeat?: number;
}

export interface WebSocketServiceOptions<T extends BaseSubscription> {
  path: string;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  onConnection?: (ws: WebSocket, user: any, req?: IncomingMessage) => T;
  onMessage?: (subscription: T, message: any) => Promise<void> | void;
  onClose?: (subscription: T) => void;
  requireAuthentication?: boolean;
  verifyClient?: (info: { req: IncomingMessage }, callback: (verified: boolean) => void) => void;
}

// Get defaults from configuration or use fallbacks
const DEFAULT_HEARTBEAT_INTERVAL = WEBSOCKET_CONFIG?.heartbeatInterval || 15000;
const DEFAULT_HEARTBEAT_TIMEOUT = WEBSOCKET_CONFIG?.heartbeatTimeout || 30000;

export class WebSocketService<T extends BaseSubscription> {
  private wss: WebSocketServer | null = null;
  private subscribers = new Set<T>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private options: WebSocketServiceOptions<T>;

  constructor(options: WebSocketServiceOptions<T>) {
    this.options = {
      heartbeatInterval: DEFAULT_HEARTBEAT_INTERVAL,
      heartbeatTimeout: DEFAULT_HEARTBEAT_TIMEOUT,
      requireAuthentication: true,
      ...options
    };
  }

  setup(httpServer: Server): WebSocketServer {
    if (this.wss) {
      return this.wss;
    }

    logger.info(`Setting up WebSocket server on path: ${this.options.path}`);
    
    try {
      this.wss = new WebSocketServer({ 
        server: httpServer, 
        path: this.options.path,
        verifyClient: this.options.verifyClient || this.defaultVerifyClient,
        maxPayload: WEBSOCKET_CONFIG.maxPayloadSize,
        perMessageDeflate: WEBSOCKET_CONFIG.perMessageDeflate,
        clientTracking: true,
        skipUTF8Validation: false, // Ensure data integrity
        backlog: 511, // Increase connection backlog
        handleProtocols: (protocols, req) => {
          // Handle vite-hmr protocol specifically
          const protocolArray = Array.from(protocols);
          if (protocolArray.includes('vite-hmr')) {
            return false; // Reject vite-hmr connections
          }
          return protocolArray[0] || ''; // Accept first protocol or empty
        }
      });
      
      // Enhanced error handling for the WebSocket server
      this.wss.on('error', (error) => {
        logger.error(`WebSocket server error on path ${this.options.path}:`, error);
        trackConnectionEvent(this.options.path, 'error', error.message);
      });
      
      this.wss.on('listening', () => {
        logger.info(`WebSocket server listening on path: ${this.options.path}`);
      });
      
      logger.info(`WebSocket server successfully created on path: ${this.options.path}`);
    } catch (error) {
      logger.error(`Error creating WebSocket server on path ${this.options.path}:`, error);
      throw error;
    }
    
    // Setup connection handling

    // Setup connection handling
    this.wss.on('connection', async (ws, req) => {
      // Configure ping handler for this connection
      ws.on('ping', (data) => {
        // Respond with a pong (automatic in ws library but logging for metrics)
        logger.debug('Received client ping frame');
        
        // Update heartbeat time in our tracking
        if ('lastHeartbeat' in ws) {
          (ws as any).lastHeartbeat = Date.now();
        }
      });
      
      // Configure pong handler for connection keep-alive
      ws.on('pong', (data) => {
        // Update heartbeat timestamp
        logger.debug('Received client pong frame');
        
        // Update heartbeat time in our tracking
        if ('lastHeartbeat' in ws) {
          (ws as any).lastHeartbeat = Date.now();
        }
      });
      
      // For custom verification, the user might be attached to req
      let user = (req as any).user;

      // AUTHENTICATION DISABLED
      // For default verification, always use admin user
      if (!user) {
        // Always provide a mock admin user since authentication is disabled
        user = {
          id: 1,
          username: 'admin',
          role: 'admin',
          permissions: ['read', 'write', 'admin']
        };
        logger.debug('Authentication disabled, using admin user for all WebSocket connections');
        
        // If authentication is required but we have no user, use mock for development
        if (!user) {
          // In development mode, allow with a mock user
          if (process.env.NODE_ENV !== 'production') {
            logger.debug('Using mock user for development');
            user = {
              id: 1,
              username: 'demo_user',
              role: 'admin'
            };
          }
          // Special case: If we have a verifyClient handler but it didn't reject earlier,
          // this might be a public connection that just needs userId=null
          else if (this.options.verifyClient) {
            // Allow the connection but with null userId
            logger.debug('Anonymous WebSocket connection allowed due to verifyClient');
          } else {
            logger.warn('WebSocket connection rejected: Invalid session');
            ws.close(1008, 'Unauthorized');
            return;
          }
        }
      } else if (!this.options.requireAuthentication) {
        // For non-authenticated connections, explicitly log that we're allowing anonymous access
        logger.debug('Authentication not required, anonymous WebSocket connection allowed');
      }

      // Create subscription
      let subscription: T;
      
      if (this.options.onConnection) {
        subscription = this.options.onConnection(ws, user, req);
      } else {
        // Default subscription with all required properties
        subscription = {
          id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ws,
          userId: user ? user.id : null,
          subscriptions: new Set(),
          lastHeartbeat: Date.now()
        } as T;
      }

      this.subscribers.add(subscription);
      
      // Setup message handler with more robust error handling
      ws.on('message', async (message: Buffer) => {
        try {
          // First check if the websocket is still open
          if (ws.readyState !== WebSocket.OPEN) {
            logger.warn('Received message for non-open WebSocket connection - discarding');
            return;
          }
          
          // Update heartbeat timestamp for any message received
          if ('lastHeartbeat' in subscription) {
            subscription.lastHeartbeat = Date.now();
          }
          
          // Parse the message
          let data: any;
          try {
            data = JSON.parse(message.toString());
          } catch (parseErr) {
            logger.error('Failed to parse WebSocket message:', parseErr);
            // Respond with error for invalid JSON
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid JSON',
                message: 'The message could not be parsed as JSON'
              }));
            }
            return;
          }
          
          // Handle specific message types at the framework level
          switch (data.type) {
            case 'heartbeat':
            case 'ping':
              // Send heartbeat response directly without going through custom handler
              if (ws.readyState === WebSocket.OPEN) {
                try {
                  ws.send(JSON.stringify({ 
                    type: 'pong', 
                    timestamp: Date.now() 
                  }));
                } catch (sendErr) {
                  logger.error('Failed to send heartbeat response:', sendErr);
                }
              }
              return;
          }
          
          // Pass to custom handler if provided
          if (this.options.onMessage) {
            await this.options.onMessage(subscription, data);
          }
        } catch (error) {
          logger.error('Error processing WebSocket message:', error);
          // Try to notify client of error
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Internal Error',
                message: 'The server encountered an error processing your request'
              }));
            } catch (sendErr) {
              logger.error('Failed to send error response:', sendErr);
            }
          }
        }
      });

      // Handle connection close
      ws.on('close', (code: number, reason: string) => {
        // Clean up and remove this subscription
        this.subscribers.delete(subscription);
        
        // Log details about the closure
        logger.info(`WebSocket disconnected for user ${subscription.userId}`, {
          code,
          reason: reason || 'No reason provided',
          userAgent: (req.headers['user-agent'] || 'unknown')
        });
        
        // Notify any registered handlers
        if (this.options.onClose) {
          this.options.onClose(subscription);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for user ${subscription.userId}:`, error);
        
        // Record the error for metrics
        trackConnectionEvent('websocket-service', 'error', 'WebSocket connection error');
        
        this.subscribers.delete(subscription);
        ws.close();
      });

      // Send connection confirmation only after connection is fully established
      const sendWelcome = () => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ 
              type: 'welcome', 
              timestamp: Date.now(),
              authenticated: !!user,
              subscriptionId: subscription.id
            }));
          } catch (error) {
            logger.error('Failed to send welcome message:', error);
          }
        }
      };

      // Wait for next tick to ensure connection is stable
      process.nextTick(sendWelcome);
    });

    // Always setup heartbeat since we've defined lastHeartbeat in BaseSubscription
    this.setupHeartbeat();

    return this.wss;
  }

  private defaultVerifyClient = async ({ req }: { req: IncomingMessage }, done: (verified: boolean) => void) => {
    // Skip Vite HMR WebSocket connections - let Vite handle its own WebSockets
    const protocol = req.headers['sec-websocket-protocol'];
    if (protocol && (
      (typeof protocol === 'string' && protocol.includes('vite-hmr')) ||
      (Array.isArray(protocol) && protocol.some(p => p === 'vite-hmr'))
    )) {
      return done(false);
    }

    // Log detailed connection info for debugging
    logger.debug('WebSocket connection attempt:', { 
      path: req.url,
      headers: {
        cookie: !!req.headers.cookie,
        origin: req.headers.origin,
        host: req.headers.host
      },
      authRequired: this.options.requireAuthentication
    });

    // Skip origin check in development mode to simplify local testing
    // In production, this would normally validate against allowed origin list
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      const origin = req.headers.origin;
      const host = req.headers.host;
      
      // In production, validate origins more strictly
      // But for our Replit environment, we'll be permissive for testing
      if (origin && host && !origin.includes(host.split(':')[0])) {
        logger.warn('Cross-origin WebSocket connection attempt rejected', {
          origin,
          host
        });
        // Allow anyway for now, but log the warning
        // In strict production, this would be: return done(false);
      }
    }

    // Check if authentication is required
    if (!this.options.requireAuthentication) {
      logger.debug('Authentication not required for WebSocket connection');
      return done(true);
    }

    // Log cookie header presence for debugging
    logger.debug('WebSocket auth - Cookie header:', { 
      present: !!req.headers.cookie
    });

    // AUTHENTICATION DISABLED - Always allow connections with mock admin user
    try {
      // Create mock admin user
      const mockAdminUser = {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        permissions: ["read", "write", "admin"],
        isActive: true
      };
      
      // Attach the mock user to the request
      (req as any).user = mockAdminUser;
      logger.debug('WebSocket auth disabled - Using mock admin user');
      return done(true);
    } catch (error) {
      logger.error('WebSocket auth mock user error:', error);
      // Even on error, allow the connection
      return done(true);
    }
  }

  private setupHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();

      this.subscribers.forEach((subscription) => {
        if (!('lastHeartbeat' in subscription)) return;
        
        // First, verify that the WebSocket instance is still valid
        if (!subscription.ws) {
          logger.warn('Removing subscription with invalid WebSocket');
          this.subscribers.delete(subscription);
          return;
        }

        if (subscription.ws.readyState === WebSocket.OPEN) {
          try {
            // First send an application-level ping because it's more widely supported
            subscription.ws.send(JSON.stringify({ 
              type: 'ping', 
              timestamp: now,
              heartbeat: true
            }));
            
            // Then try the WebSocket protocol ping frame if supported
            try {
              // Some WebSocket implementations might not support ping/pong frames
              subscription.ws.ping(Buffer.from(JSON.stringify({ timestamp: now })));
              
              // Also setup pong listener if not already set up for this connection
              if (!subscription.ws.listenerCount('pong')) {
                subscription.ws.on('pong', () => {
                  // Update last heartbeat when pong is received
                  if ('lastHeartbeat' in subscription) {
                    subscription.lastHeartbeat = Date.now();
                  }
                });
              }
            } catch (error) {
              // Just log, don't close since we already sent application-level ping
              const pingError = error as Error;
              logger.debug('WebSocket ping frame not supported:', pingError.message);
            }
          } catch (error) {
            logger.error('Failed to send heartbeat message:', error);
            try {
              // Try graceful closure with reason
              subscription.ws.close(1001, 'Heartbeat failure');
            } catch (closeError) {
              logger.error('Error during connection close:', closeError);
            }
            this.subscribers.delete(subscription);
          }
        } else if (subscription.ws.readyState !== WebSocket.CONNECTING) {
          // For any state other than CONNECTING or OPEN, remove subscription
          logger.info(`Removing dead connection in state ${subscription.ws.readyState} for user ${subscription.userId || 'anonymous'}`);
          this.subscribers.delete(subscription);
          return;
        }

        // Check for timeout and close stale connections
        const lastHeartbeat = subscription.lastHeartbeat || 0;
        if (now - lastHeartbeat > (this.options.heartbeatTimeout || DEFAULT_HEARTBEAT_TIMEOUT)) {
          logger.info(`Closing stale connection for user ${subscription.userId || 'anonymous'}`);
          try {
            subscription.ws.close(1001, 'Connection timeout');
          } catch (error) {
            logger.error('Error closing stale connection:', error);
          }
          this.subscribers.delete(subscription);
        }
      });
    }, this.options.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL);
  }

  broadcast(message: any, filter?: (subscription: T) => boolean) {
    if (!this.wss) return;

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.subscribers.forEach((subscription) => {
      if (filter && !filter(subscription)) return;
      
      if (subscription.ws.readyState === WebSocket.OPEN) {
        try {
          subscription.ws.send(messageStr);
        } catch (error) {
          logger.error('Failed to broadcast message:', error);
        }
      }
    });
  }

  getSubscribers(): ReadonlySet<T> {
    return this.subscribers;
  }

  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.subscribers.clear();
  }
}