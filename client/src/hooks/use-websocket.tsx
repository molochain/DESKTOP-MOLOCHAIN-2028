import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookOptions {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options?: WebSocketHookOptions) {
  if (!options) {
    // Return empty hook when no options provided
    return {
      socket: null,
      isConnected: false,
      connectionState: 'disconnected' as const,
      sendMessage: () => false,
      connect: () => {},
      disconnect: () => {},
    };
  }

  const {
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectAttempts = 3,
    reconnectInterval = 3000,
  } = options;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      const ws = new WebSocket(url);

      // Handle WebSocket constructor errors
      ws.addEventListener('error', () => {
        // Suppress unhandled promise rejections from WebSocket errors
      });

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setConnectionState('error');
        }
      }, 10000); // 10 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        onMessage?.(event);
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setConnectionState('disconnected');
        setSocket(null);
        onClose?.(event);

        // Attempt to reconnect if connection was not closed intentionally
        if (shouldReconnectRef.current && event.code !== 1000 && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setConnectionState('error');
        // Prevent unhandled promise rejections
        Promise.resolve().catch(() => {}); 
        onError?.(error);
      };

      setSocket(ws);
    } catch (error) {
      setConnectionState('error');
      // WebSocket connection failed
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close(1000, 'Intentional disconnect');
    }
  }, [socket]);

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        // Failed to send WebSocket message
        return false;
      }
    }
    return false;
  }, [socket]);

  useEffect(() => {
    connect();
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [url]); // Only depend on url, not connect function

  return {
    socket,
    isConnected,
    connectionState,
    sendMessage,
    connect,
    disconnect,
  };
}