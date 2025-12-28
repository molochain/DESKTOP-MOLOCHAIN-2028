import { useState, useEffect, useCallback, useRef } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
}

interface AgentStatusResponse {
  success: boolean;
  data: AgentStatus[];
  timestamp: string;
}

export function useAgentStatus() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isHttpMode, setIsHttpMode] = useState(true); // Start with HTTP for reliability
  const [authError, setAuthError] = useState(false); // Track auth errors to prevent repeated polling
  
  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // HTTP polling function for reliable agent status updates
  const fetchAgentStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/contact/agents', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Silently fail for auth errors - user not logged in
        if (response.status === 401) {
          setConnectionStatus('disconnected');
          setError('Authentication required');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: AgentStatusResponse = await response.json();
      
      if (data.success && data.data) {
        setAgents(data.data);
        setLastUpdate(new Date());
        setError(null);
        setConnectionStatus('connected');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Only log non-auth errors to console
      if (!err || (err instanceof Error && !err.message.includes('401'))) {
        // Failed to fetch agent status
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch agent status');
      setConnectionStatus('disconnected');
    }
  }, []);

  // WebSocket connection attempt
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/contact`;
      
      wsRef.current = new WebSocket(wsUrl);
      setConnectionStatus('connecting');
      
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
          // WebSocket connection timeout, falling back to HTTP
          setIsHttpMode(true);
        }
      }, 3000);

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        // WebSocket connected successfully
        setConnectionStatus('connected');
        setError(null);
        setIsHttpMode(false);
        retryCountRef.current = 0;
        
        // Stop HTTP polling when WebSocket is active
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        
        // Request initial status
        wsRef.current?.send(JSON.stringify({ type: 'get-statuses' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'agent-statuses' && message.data) {
            setAgents(message.data);
            setLastUpdate(new Date());
          }
        } catch (err) {
          // Failed to parse WebSocket message
        }
      };

      wsRef.current.onclose = () => {
        clearTimeout(connectionTimeout);
        // WebSocket connection closed, switching to HTTP mode
        setConnectionStatus('disconnected');
        setIsHttpMode(true);
        wsRef.current = null;
      };

      wsRef.current.onerror = () => {
        clearTimeout(connectionTimeout);
        // WebSocket error, falling back to HTTP
        setConnectionStatus('disconnected');
        setIsHttpMode(true);
        wsRef.current = null;
      };
    } catch (err) {
      // Failed to create WebSocket
      setIsHttpMode(true);
    }
  }, []);

  // Start HTTP polling
  const startHttpPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    // Initial fetch
    fetchAgentStatus();
    
    // Set up polling every 15 seconds
    pollingRef.current = setInterval(fetchAgentStatus, 15000);
  }, [fetchAgentStatus]);

  // Retry WebSocket connection
  const retryWebSocket = useCallback(() => {
    if (retryCountRef.current < maxRetries && !isHttpMode) {
      retryCountRef.current++;
      // Retrying WebSocket connection
      setTimeout(connectWebSocket, 2000 * retryCountRef.current);
    } else {
      // Max WebSocket retries reached, using HTTP mode
      setIsHttpMode(true);
    }
  }, [connectWebSocket, isHttpMode]);

  // Initialize connection
  useEffect(() => {
    if (isHttpMode) {
      startHttpPolling();
    } else {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isHttpMode, startHttpPolling, connectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (isHttpMode) {
      fetchAgentStatus();
    } else {
      wsRef.current?.send(JSON.stringify({ type: 'get-statuses' }));
    }
  }, [isHttpMode, fetchAgentStatus]);

  // Toggle connection mode
  const toggleConnectionMode = useCallback(() => {
    if (isHttpMode) {
      // Switch to WebSocket
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setIsHttpMode(false);
      retryCountRef.current = 0;
    } else {
      // Switch to HTTP
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsHttpMode(true);
    }
  }, [isHttpMode]);

  return {
    agents,
    connectionStatus,
    error,
    lastUpdate,
    isHttpMode,
    refresh,
    toggleConnectionMode
  };
}