// Real WebSocket implementation for MoloChain platform
export class RealWebSocket {
  private endpoint: string;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private messageHandlers: Set<(data: any) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private authToken?: string;
  private lastPong = Date.now();

  constructor(endpoint: string, options?: { authToken?: string }) {
    this.endpoint = endpoint;
    this.authToken = options?.authToken;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Construct proper WebSocket URL with robust host resolution
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Get hostname and port separately for better control
        let hostname = window.location.hostname;
        let port = window.location.port;
        
        // Handle undefined/empty hostname
        if (!hostname || hostname === 'undefined' || hostname === '') {
          hostname = 'localhost';
        }
        
        // Handle undefined/empty/invalid port
        if (!port || port === 'undefined' || port === '' || isNaN(Number(port))) {
          port = '5000'; // Default to 5000 for Replit environment
        }
        
        // Special handling for Replit development environment and production domains
        const isReplit = hostname.includes('replit.dev') || hostname.includes('replit.app') || hostname.includes('repl.co');
        const isProduction = hostname.includes('molochain.com') || hostname.includes('molochain.io');
        
        if (isReplit || isProduction) {
          // For Replit and production, use the same host as current page (no explicit port needed)
          // Production nginx proxies WebSocket connections on port 443
          const host = hostname;
          const wsUrl = `${protocol}//${host}${this.endpoint}`;
          
          if (import.meta.env.DEV) {
            console.debug(`[${isProduction ? 'PRODUCTION' : 'REPLIT'}] Connecting to WebSocket: ${wsUrl}`);
          }
          
          this.ws = new WebSocket(wsUrl);
        } else {
          // For local development, use explicit port
          const host = `${hostname}:${port}`;
          const wsUrl = `${protocol}//${host}${this.endpoint}`;
          
          if (import.meta.env.DEV) {
            console.debug(`[LOCAL] Connecting to WebSocket: ${wsUrl}`);
          }
          
          this.ws = new WebSocket(wsUrl);
        }
        
        this.ws.onopen = () => {
          if (import.meta.env.DEV) {
            console.info(`WebSocket connected to ${this.endpoint}`);
          }
          this.connected = true;
          this.reconnectAttempts = 0;
          this.lastPong = Date.now();
          
          // Send auth token if available
          if (this.authToken) {
            this.send({
              type: 'auth',
              payload: { token: this.authToken }
            });
          }
          
          // Start heartbeat
          this.startHeartbeat();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // Update lastPong for any message received from server
            this.lastPong = Date.now();
            
            const data = JSON.parse(event.data);
            
            // Handle pong responses for heartbeat
            if (data.type === 'pong') {
              return;
            }
            
            // Handle welcome and other server messages
            if (data.type === 'welcome') {
              if (import.meta.env.DEV) {
                console.info('WebSocket welcome received:', data.payload?.message);
              }
              return;
            }
            
            // Forward message to handlers
            this.messageHandlers.forEach(handler => {
              try {
                handler(data);
              } catch (error) {
                if (import.meta.env.DEV) {
                  console.error('Message handler error:', error);
                }
              }
            });
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Failed to parse WebSocket message:', error);
            }
          }
        };

        this.ws.onclose = (event) => {
          if (import.meta.env.DEV) {
            console.warn(`WebSocket closed: ${event.code} ${event.reason}`);
          }
          this.connected = false;
          this.stopHeartbeat();
          
          // Attempt reconnection if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          if (import.meta.env.DEV) {
            console.error('WebSocket error:', error);
          }
          this.connected = false;
          reject(new Error(`WebSocket connection failed`));
        };

      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to create WebSocket connection:', error);
        }
        reject(error);
      }
    });
  }

  private startHeartbeat(): void {
    // Send ping every 30 seconds, with much longer timeout for reliability
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        // Check if we've received any message recently (5+ minutes for Replit reliability)
        const timeSinceLastMessage = Date.now() - this.lastPong;
        if (timeSinceLastMessage > 300000) { // 5 minutes without any message
          if (import.meta.env.DEV) {
            console.warn('WebSocket heartbeat timeout, closing connection');
          }
          this.ws?.close();
          return;
        }
        
        // Send ping to keep connection alive
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    if (import.meta.env.DEV) {
      console.info(`Scheduling WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        if (import.meta.env.DEV) {
          console.error('WebSocket reconnection failed:', error);
        }
      });
    }, delay);
  }

  send(data: any): boolean {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to send WebSocket message:', error);
        }
        return false;
      }
    }
    return false;
  }

  close(): void {
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }
    
    this.connected = false;
    this.messageHandlers.clear();
    this.ws = null;
  }

  onMessage(handler: (data: any) => void): void {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler: (data: any) => void): void {
    this.messageHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  get reconnectCount(): number {
    return this.reconnectAttempts;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    if (this.connected) {
      this.send({
        type: 'auth',
        payload: { token }
      });
    }
  }

  // Subscribe to a specific channel
  subscribe(channel: string): void {
    this.send({
      type: 'subscribe',
      payload: { channel }
    });
  }

  // Unsubscribe from a channel
  unsubscribe(channel: string): void {
    this.send({
      type: 'unsubscribe',
      payload: { channel }
    });
  }
}

// Legacy compatibility - now uses real WebSocket
export function useWebSocket(url: string) {
  const ws = new RealWebSocket(url);
  return {
    isConnected: ws.isConnected,
    lastMessage: null,
    send: (data: any) => ws.send(data),
    disconnect: () => ws.close(),
    connect: () => ws.connect()
  };
}

// Real collaboration socket implementation
class CollaborationSocket {
  private ws: RealWebSocket;
  
  constructor() {
    this.ws = new RealWebSocket('/ws/collaboration');
  }
  
  emit(event: string, data?: any) {
    this.ws.send({ type: event, payload: data });
  }
  
  on(event: string, callback: (data: any) => void) {
    this.ws.onMessage((message) => {
      if (message.type === event) {
        callback(message.payload);
      }
    });
  }
  
  off(event: string, callback?: (data: any) => void) {
    // Note: Real implementation would need to track and remove specific handlers
    if (import.meta.env.DEV) {
      console.debug(`Removing handler for ${event}`);
    }
  }
  
  disconnect() {
    this.ws.close();
  }
  
  connect() {
    return this.ws.connect();
  }
  
  get isConnected() {
    return this.ws.isConnected;
  }
  
  joinSession(sessionId: string) {
    this.emit('join_session', { sessionId });
  }
  
  leaveSession(sessionId: string) {
    this.emit('leave_session', { sessionId });
  }
  
  sendSessionMessage(sessionId: string, message: any) {
    this.emit('session_message', { sessionId, message });
  }
  
  sendTypingIndicator(sessionId: string, isTyping: boolean) {
    this.emit('typing_indicator', { sessionId, isTyping });
  }
}

export const collaborationSocket = new CollaborationSocket();