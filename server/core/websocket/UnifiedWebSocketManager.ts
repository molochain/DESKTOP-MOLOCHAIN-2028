import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { logger } from '../../utils/logger';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { wsAuthenticator, AuthenticatedUser } from './security/ws-auth';
import { wsAuditLogger } from './security/audit-logger';
import crypto from 'crypto';

interface WebSocketNamespace {
  path: string;
  name: string;
  wss: WebSocketServer;
  connections: Set<any>;
  handlers: Map<string, Function>;
  metrics: {
    messagesReceived: number;
    messagesSent: number;
    connectionsTotal: number;
    errors: number;
  };
}

export class UnifiedWebSocketManager {
  private namespaces: Map<string, WebSocketNamespace> = new Map();
  private server: Server;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(server: Server) {
    this.server = server;
    this.initializeHealthCheck();

    // Ensure server is properly configured for WebSocket upgrades
    server.on('clientError', (err, socket) => {
      logger.debug('HTTP client error during WebSocket setup:', err.message);
      if (!socket.destroyed) {
        socket.destroy();
      }
    });
  }

  createNamespace(path: string, name: string): WebSocketNamespace {
    if (this.namespaces.has(path)) {
      logger.warn(`WebSocket namespace already exists: ${path}`);
      return this.namespaces.get(path)!;
    }

    // Create WebSocket server with simple, reliable configuration
    const wss = new WebSocketServer({
      noServer: true,
      skipUTF8Validation: false,
      handleProtocols: () => false, // Reject all protocols to simplify
      maxPayload: 16 * 1024 * 1024 // 16MB
    });

    logger.info(`✅ WebSocket server created for ${path}`, { path, name });

    const namespace: WebSocketNamespace = {
      path,
      name,
      wss,
      connections: new Set(),
      handlers: new Map(),
      metrics: {
        messagesReceived: 0,
        messagesSent: 0,
        connectionsTotal: 0,
        errors: 0
      }
    };

    // Setup WebSocket connection handling
    wss.on('connection', (ws, request) => {
      // Generate session ID for tracking
      const sessionId = crypto.randomUUID();
      (ws as any).sessionId = sessionId;
      (ws as any).namespace = path;
      (ws as any).connectedAt = new Date();

      // Extract client information
      const clientIP = this.getClientIP(request);
      const userAgent = request.headers['user-agent'];

      // Extract authenticated user from request (set during upgrade)
      const user = (request as any).authenticatedUser as AuthenticatedUser | undefined;
      (ws as any).user = user;

      namespace.connections.add(ws);
      namespace.metrics.connectionsTotal++;

      logger.info(`New WebSocket connection to ${name} (${path})`, {
        sessionId,
        userId: user?.id || 'anonymous',
        clientIP
      });

      // Log security event
      wsAuditLogger.logConnection(user, sessionId, path, clientIP, userAgent);

      // Setup message handling
      ws.on('message', (data) => {
        namespace.metrics.messagesReceived++;
        this.handleMessage(namespace, ws, data);
      });

      ws.on('error', (error) => {
        namespace.metrics.errors++;
        logger.error(`WebSocket error in ${name}:`, error);

        // Log security event for error
        wsAuditLogger.logSecurityEvent({
          type: 'suspicious_activity',
          userId: user?.id,
          sessionId,
          namespace: path,
          clientIP,
          details: { error: error.message, activity: 'websocket_error' },
          severity: 'medium'
        });

        // Attempt to recover from error
        if (ws.readyState === 1) {
          try {
            ws.send(JSON.stringify({ type: 'error_recovery', status: 'attempting' }));
          } catch (e) {
            logger.debug('Could not send recovery message');
          }
        }
      });

      ws.on('close', (code, reason) => {
        namespace.connections.delete(ws);
        logger.info(`WebSocket connection closed in ${name}`, {
          sessionId,
          code,
          reason: reason.toString()
        });

        // Log security event
        wsAuditLogger.logDisconnection(user?.id, sessionId, path, clientIP);
      });

      // Emit connection event
      this.emit(namespace, 'connection', ws, request);
    });

    // HTTP upgrade handling is now centralized in initializeAllServices()

    this.namespaces.set(path, namespace);
    logger.info(`WebSocket namespace created: ${name} on ${path}`);

    return namespace;
  }

  registerHandler(namespace: string, event: string, handler: Function) {
    const ns = this.namespaces.get(namespace);
    if (!ns) {
      logger.error(`Namespace not found: ${namespace}`);
      return;
    }

    ns.handlers.set(event, handler);
  }

  private handleMessage(namespace: WebSocketNamespace, ws: any, data: any) {
    try {
      const message = JSON.parse(data.toString());
      const { type, payload } = message;

      const handler = namespace.handlers.get(type);
      if (handler) {
        handler(ws, payload);
      } else {
        logger.warn(`No handler for message type: ${type} in ${namespace.name}`);
      }
    } catch (error) {
      logger.error(`Error handling message in ${namespace.name}:`, error);
    }
  }

  private emit(namespace: WebSocketNamespace, event: string, ...args: any[]) {
    const handler = namespace.handlers.get(event);
    if (handler) {
      handler(...args);
    }
  }

  broadcast(namespacePath: string, message: any) {
    const namespace = this.namespaces.get(namespacePath);
    if (!namespace) {
      logger.error(`Namespace not found: ${namespacePath}`);
      return;
    }

    const data = JSON.stringify(message);
    namespace.connections.forEach((ws: any) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(data);
        namespace.metrics.messagesSent++;
      }
    });
  }

  broadcastToAll(message: any) {
    this.namespaces.forEach((namespace) => {
      this.broadcast(namespace.path, message);
    });
  }

  getMetrics() {
    const metrics: any = {};

    this.namespaces.forEach((namespace, path) => {
      metrics[path] = {
        name: namespace.name,
        connections: namespace.connections.size,
        ...namespace.metrics
      };
    });

    return metrics;
  }

  getNamespaceMetrics(namespacePath: string) {
    const namespace = this.namespaces.get(namespacePath);
    if (!namespace) {
      return null;
    }

    return {
      name: namespace.name,
      path: namespace.path,
      connections: namespace.connections.size,
      ...namespace.metrics
    };
  }

  private initializeHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.namespaces.forEach((namespace) => {
        let cleaned = 0;
        let pinged = 0;

        // Clean up dead connections and send ping to active ones
        namespace.connections.forEach((ws: any) => {
          if (ws.readyState !== 1) {
            namespace.connections.delete(ws);
            cleaned++;
          } else {
            // Send ping to verify connection is still alive
            try {
              ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
              pinged++;
            } catch (error) {
              logger.debug(`Failed to ping connection in ${namespace.name}`);
              namespace.connections.delete(ws);
              cleaned++;
            }
          }
        });

        // Log metrics periodically
        if (namespace.connections.size > 0 || cleaned > 0) {
          logger.debug(`WebSocket ${namespace.name}: ${namespace.connections.size} active, ${cleaned} cleaned, ${pinged} pinged`);
        }

        // Reset error counter if no recent errors
        if (namespace.metrics.errors > 0 && cleaned === 0) {
          namespace.metrics.errors = Math.max(0, namespace.metrics.errors - 1);
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Gets client IP address from request
   */
  private getClientIP(request: IncomingMessage): string {
    const forwarded = request.headers['x-forwarded-for'];
    const realIP = request.headers['x-real-ip'];

    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }

    if (typeof realIP === 'string') {
      return realIP;
    }

    return request.socket.remoteAddress || 'unknown';
  }

  /**
   * Gets enhanced metrics including security information
   */
  getEnhancedMetrics() {
    const metrics: any = {};
    const auditMetrics = wsAuditLogger.getMetrics();

    this.namespaces.forEach((namespace, path) => {
      const connectionDetails = Array.from(namespace.connections).map((ws: any) => ({
        sessionId: ws.sessionId,
        userId: ws.user?.id,
        connectedAt: ws.connectedAt,
        namespace: ws.namespace
      }));

      metrics[path] = {
        name: namespace.name,
        connections: namespace.connections.size,
        connectionDetails,
        ...namespace.metrics
      };
    });

    return {
      namespaces: metrics,
      security: auditMetrics,
      overall: {
        totalConnections: Object.values(metrics).reduce((sum: number, ns: any) => sum + ns.connections, 0),
        totalMessages: Object.values(metrics).reduce((sum: number, ns: any) => sum + ns.messagesReceived, 0),
        totalErrors: Object.values(metrics).reduce((sum: number, ns: any) => sum + ns.errors, 0)
      }
    };
  }

  /**
   * Forces disconnection of a specific user/session
   */
  forceDisconnect(sessionId?: string, userId?: string, reason: string = 'Administrative action') {
    let disconnectedCount = 0;

    this.namespaces.forEach((namespace) => {
      namespace.connections.forEach((ws: any) => {
        if ((sessionId && ws.sessionId === sessionId) ||
            (userId && ws.user?.id === userId)) {

          try {
            ws.send(JSON.stringify({
              type: 'force_disconnect',
              reason,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            logger.debug('Could not send disconnect message');
          }

          ws.close(1008, reason); // Policy Violation
          disconnectedCount++;

          logger.info(`Force disconnected WebSocket`, {
            sessionId: ws.sessionId,
            userId: ws.user?.id,
            reason
          });
        }
      });
    });

    return disconnectedCount;
  }

  shutdown() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.namespaces.forEach((namespace) => {
      namespace.connections.forEach((ws: any) => {
        ws.close();
      });
      namespace.wss.close();
    });

    logger.info('WebSocket manager shutdown complete');
  }

  initializeAllServices() {
    logger.info('Setting up HTTP upgrade handler for all WebSocket namespaces...');

    // Setup secure HTTP upgrade handling for WebSocket connections
    this.server.on('upgrade', async (request, socket, head) => {
      const pathname = request.url || '';
      const clientIP = this.getClientIP(request);
      const sessionId = crypto.randomUUID();

      try {
        // Validate authentication
        const authResult = await wsAuthenticator.validateUpgradeRequest(request);

        if (!authResult.success) {
          // Log security event
          wsAuditLogger.logAuthFailure(
            sessionId,
            pathname,
            clientIP,
            authResult.error || 'Authentication failed',
            request.headers['user-agent']
          );

          // Send proper WebSocket close frame
          const response = 'HTTP/1.1 401 Unauthorized\r\n' +
                          'Content-Type: text/plain\r\n' +
                          'Connection: close\r\n\r\n' +
                          'WebSocket authentication required';
          socket.write(response);
          socket.destroy();
          return;
        }

        // Check rate limiting
        if (authResult.rateLimit && authResult.rateLimit.remaining <= 0) {
          wsAuditLogger.logRateLimit(
            sessionId,
            pathname,
            clientIP,
            request.headers['user-agent']
          );

          const response = 'HTTP/1.1 429 Too Many Requests\r\n' +
                          'Content-Type: text/plain\r\n' +
                          'Retry-After: 60\r\n' +
                          'Connection: close\r\n\r\n' +
                          'Rate limit exceeded';
          socket.write(response);
          socket.destroy();
          return;
        }

        // Find matching namespace
        logger.info(`🔍 Searching for matching namespace for path: ${pathname}`, {
          pathname,
          availableNamespaces: Array.from(this.namespaces.keys())
        });

        for (const [path, namespace] of this.namespaces.entries()) {
          logger.debug(`Checking namespace: ${path} against ${pathname}`);

          if (pathname === path || pathname.startsWith(path + '?')) {
            logger.info(`✅ Found matching namespace: ${path}`, {
              namespace: path,
              requestPath: pathname,
              authenticatedUser: authResult.user?.id || 'anonymous'
            });

            // Attach authenticated user to request for connection handler
            (request as any).authenticatedUser = authResult.user;

            try {
              logger.info(`🔄 Attempting WebSocket upgrade for namespace: ${path}`);

              // Create a timeout to prevent hanging
              const upgradeTimeout = setTimeout(() => {
                logger.error(`❌ WebSocket upgrade timeout for ${path} - forcing socket close`);
                if (!socket.destroyed) {
                  socket.destroy();
                }
              }, 10000); // 10 second timeout

              // Track if upgrade completed to prevent double handling
              let upgradeCompleted = false;

              // Handle upgrade errors on the socket BEFORE calling handleUpgrade
              const errorHandler = (error: Error) => {
                if (upgradeCompleted) return;
                upgradeCompleted = true;
                clearTimeout(upgradeTimeout);
                logger.error(`❌ Socket error during WebSocket upgrade for ${path}:`, error);
                if (!socket.destroyed) {
                  socket.destroy();
                }
              };

              const closeHandler = () => {
                if (upgradeCompleted) return;
                upgradeCompleted = true;
                clearTimeout(upgradeTimeout);
                logger.warn(`🔌 Socket closed during WebSocket upgrade for ${path}`);
              };

              socket.once('error', errorHandler);
              socket.once('close', closeHandler);

              // Add a wrapper to ensure the callback is always called
              const upgradeCallback = (ws: WebSocket) => {
                if (upgradeCompleted) {
                  logger.warn(`⚠️ Duplicate upgrade callback for ${path} - ignoring`);
                  return;
                }
                upgradeCompleted = true;
                clearTimeout(upgradeTimeout);

                // Remove temporary error handlers
                socket.removeListener('error', errorHandler);
                socket.removeListener('close', closeHandler);

                try {
                  logger.info(`🎉 WebSocket upgrade successful for ${path}`, {
                    namespace: path,
                    sessionId
                  });

                  // Emit connection event - this triggers the 'connection' handler
                  namespace.wss.emit('connection', ws, request);
                } catch (connectionError) {
                  logger.error(`❌ WebSocket connection emission failed for ${path}:`, connectionError);
                  ws.close(1011, 'Internal server error');
                }
              };

              // Enhanced upgrade with buffer and socket validation
              try {
                logger.debug(`📤 Attempting WebSocket upgrade for ${path}`, {
                  socketReadyState: socket.readyState,
                  socketDestroyed: socket.destroyed,
                  headLength: head ? head.length : 'no head',
                  requestMethod: request.method,
                  requestUrl: request.url
                });

                // Verify socket is still valid before attempting upgrade
                if (socket.destroyed) {
                  logger.debug(`❌ Socket already destroyed before upgrade for ${path}`);
                  if (upgradeCompleted) return;
                  upgradeCompleted = true;
                  clearTimeout(upgradeTimeout);
                  return;
                }

                // Add additional error handling for the WebSocket upgrade
                const upgradeStartTime = Date.now();

                namespace.wss.handleUpgrade(request, socket, head, (ws: WebSocket, upgradeRequest: IncomingMessage) => {
                  const upgradeDuration = Date.now() - upgradeStartTime;
                  logger.debug(`🎯 WebSocket upgrade callback invoked for ${path}`, {
                    duration: `${upgradeDuration}ms`,
                    wsReadyState: ws.readyState,
                    upgradeCompleted
                  });

                  if (upgradeCompleted) {
                    logger.warn(`⚠️  Duplicate upgrade callback for ${path} - closing duplicate connection`);
                    ws.close(1001, 'Duplicate connection');
                    return;
                  }

                  upgradeCompleted = true;
                  clearTimeout(upgradeTimeout);

                  // Remove socket error handlers before handing over to WebSocket
                  socket.removeListener('error', errorHandler);
                  socket.removeListener('close', closeHandler);

                  logger.info(`✅ WebSocket upgrade successful for ${path}`, {
                    duration: `${upgradeDuration}ms`,
                    wsState: ws.readyState
                  });

                  // Call the success callback with the WebSocket instance
                  upgradeCallback(ws);
                });

                logger.debug(`📤 handleUpgrade call initiated for ${path} - waiting for callback`);

              } catch (upgradeError) {
                if (upgradeCompleted) return;
                upgradeCompleted = true;
                clearTimeout(upgradeTimeout);

                logger.error(`❌ handleUpgrade threw error for ${path}:`, {
                  error: upgradeError.message,
                  stack: upgradeError.stack,
                  socketState: socket.destroyed ? 'destroyed' : 'active'
                });

                socket.removeListener('error', errorHandler);
                socket.removeListener('close', closeHandler);

                if (!socket.destroyed) {
                  socket.destroy();
                }
                return;
              }

              return;
            } catch (error) {
              logger.error(`❌ WebSocket upgrade setup failed for namespace ${path}:`, error);
              if (!socket.destroyed) {
                socket.destroy();
              }
              return;
            }
          }
        }

        // No matching namespace found
        wsAuditLogger.logSecurityEvent({
          type: 'suspicious_activity',
          sessionId,
          namespace: pathname,
          clientIP,
          details: { activity: 'invalid_namespace', attempted_path: pathname },
          severity: 'medium'
        });

        const response = 'HTTP/1.1 404 Not Found\r\n' +
                        'Content-Type: text/plain\r\n' +
                        'Connection: close\r\n\r\n' +
                        'WebSocket namespace not found';
        socket.write(response);
        socket.destroy();

      } catch (error) {
        logger.error('WebSocket upgrade error:', error);

        wsAuditLogger.logSecurityEvent({
          type: 'suspicious_activity',
          sessionId,
          namespace: pathname,
          clientIP,
          details: { activity: 'upgrade_error', error: error instanceof Error ? error.message : 'Unknown error' },
          severity: 'high'
        });

        socket.destroy();
      }
    });

    logger.info('HTTP upgrade handler initialized successfully for all WebSocket namespaces');
  }
}