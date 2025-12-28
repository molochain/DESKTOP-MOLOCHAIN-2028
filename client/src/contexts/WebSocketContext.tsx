import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RealWebSocket } from "@/lib/realWebSocket";

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: {
    isConnecting: boolean;
    reconnectAttempts: number;
    maxAttempts: number;
    lastError?: string;
    isAuthenticated: boolean;
    lastHeartbeat?: number;
  };
  sendMessage: (data: any) => boolean;
  reconnect: () => void;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  endpoint: string;
  reconnectConfig?: {
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    maxAttempts?: number;
  };
}

export function WebSocketProvider({ 
  children, 
  endpoint,
  reconnectConfig 
}: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [wsManager, setWsManager] = useState<RealWebSocket | null>(null);
  const [connectionState, setConnectionState] = useState({
    isConnecting: false,
    reconnectAttempts: 0,
    maxAttempts: reconnectConfig?.maxAttempts || 5,
    lastError: undefined as string | undefined,
    isAuthenticated: false,
    lastHeartbeat: undefined as number | undefined
  });
  const { toast } = useToast();

  // Store message handlers
  const [messageHandlers] = useState(new Map<string, Set<(data: any) => void>>());

  // Function to create a new connection
  const createConnection = async () => {
    if (connectionState.isConnecting || isConnected) {
      return; // Prevent multiple concurrent connections
    }

    try {
      // Create real WebSocket connection to server
      const manager = new RealWebSocket(endpoint, {
        authToken: localStorage.getItem('authToken') || undefined
      });
      
      setConnectionState(prev => ({ ...prev, isConnecting: true }));
      
      // Connect to WebSocket server
      try {
        await manager.connect();
        if (import.meta.env.DEV) {
          console.info(`Successfully connected to WebSocket: ${endpoint}`);
        }
      } catch (error) {
        // Handle connection errors gracefully
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        if (import.meta.env.DEV) {
          console.warn('WebSocket connection error:', errorMessage);
        }
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          lastError: errorMessage,
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
        
        // Show user-friendly error message for repeated failures
        if (connectionState.reconnectAttempts >= 2) {
          toast({
            title: "Connection Issue",
            description: "Having trouble connecting to real-time services. Retrying...",
            variant: "default"
          });
        }
        
        setIsConnected(false);
        return;
      }
      
      setWsManager(manager);
      setIsConnected(true);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        reconnectAttempts: 0,
        lastError: undefined,
        isAuthenticated: true,
        lastHeartbeat: Date.now()
      }));

      // Show success message on first connection
      if (connectionState.reconnectAttempts === 0) {
        toast({
          title: "Connected",
          description: "Real-time connection established successfully",
          variant: "default"
        });
      }

      // Set up message handling with proper error boundaries
      manager.onMessage((data) => {
        try {
          // Update last heartbeat on any message
          setConnectionState(prev => ({
            ...prev,
            lastHeartbeat: Date.now()
          }));

          const channel = data?.channel || 'default';
          const handlers = messageHandlers.get(channel);
          if (handlers && handlers.size > 0) {
            handlers.forEach(handler => {
              try {
                handler(data);
              } catch (handlerError) {
                if (import.meta.env.DEV) {
                  console.error(`Message handler error for ${channel}:`, handlerError);
                }
              }
            });
          }
        } catch (messageError) {
          if (import.meta.env.DEV) {
            console.error('Message processing error:', messageError);
          }
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        lastError: errorMessage,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
      
      if (import.meta.env.DEV) {
        console.error('WebSocket connection error:', errorMessage);
      }
      
      // Show error toast for persistent connection issues
      if (connectionState.reconnectAttempts >= 3) {
        toast({
          title: "Connection Failed",
          description: "Unable to establish real-time connection. Some features may be limited.",
          variant: "destructive"
        });
      }
    }
  };

  const sendMessage = (data: any): boolean => {
    if (wsManager && isConnected) {
      return wsManager.send(data);
    }
    return false;
  };

  const reconnect = () => {
    if (wsManager) {
      wsManager.close();
      setWsManager(null);
    }
    setIsConnected(false);
    setConnectionState(prev => ({ ...prev, reconnectAttempts: 0 }));
    createConnection().catch((error) => {
      if (import.meta.env.DEV) {
        console.error('WebSocket reconnection error:', error);
      }
    });
  };

  const subscribe = (channel: string, callback: (data: any) => void) => {
    if (!messageHandlers.has(channel)) {
      messageHandlers.set(channel, new Set());
    }
    messageHandlers.get(channel)!.add(callback);

    // Subscribe to channel on server
    if (wsManager && isConnected) {
      wsManager.subscribe(channel);
    }

    return () => {
      messageHandlers.get(channel)?.delete(callback);
      if (messageHandlers.get(channel)?.size === 0) {
        messageHandlers.delete(channel);
        // Unsubscribe from channel on server
        if (wsManager && isConnected) {
          wsManager.unsubscribe(channel);
        }
      }
    };
  };

  // Initialize connection on mount
  useEffect(() => {
    // Only create connection if we don't have one already
    if (!wsManager && !connectionState.isConnecting) {
      createConnection().catch((error) => {
        if (import.meta.env.DEV) {
          console.error('WebSocket initial connection error:', error);
        }
      });
    }

    return () => {
      if (wsManager) {
        wsManager.close();
      }
    };
  }, [endpoint]);

  // Monitor connection health
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsManager && isConnected) {
        const timeSinceLastHeartbeat = connectionState.lastHeartbeat ? 
          Date.now() - connectionState.lastHeartbeat : Infinity;
        
        // Check if connection seems stale (no messages for 2 minutes)
        if (timeSinceLastHeartbeat > 120000) {
          if (import.meta.env.DEV) {
            console.warn('WebSocket connection seems stale, attempting reconnect...');
          }
          reconnect();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [wsManager, isConnected, connectionState.lastHeartbeat]);

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    sendMessage,
    reconnect,
    subscribe
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}