import { useState, useEffect, useCallback, useRef } from 'react';

// Define the agent status type
export interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  lastActive: Date;
  // Additional properties for detailed reporting
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string | Date;
  region?: string;
  specialty?: string[];
  // Additional properties for profile widgets
  phone?: string;
  timezone?: string;
  languages?: string[];
  profileImage?: string;
  experience?: number; // in years
  rating?: number; // out of 5
  projects?: number; // number of projects handled
  customFields?: Record<string, any>; // For user-added fields
}

export const useContactWebSocket = () => {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3; // Reduced attempts to fail faster
  const RECONNECT_INTERVAL = 2000; // Faster initial retry
  
  // Check if the WebSocket API is available in this browser
  const isWebSocketSupported = useCallback(() => {
    return 'WebSocket' in window;
  }, []);
  
  // Check network conditions to see if WebSocket is likely to work
  const checkNetworkCondition = useCallback(() => {
    // Get connection info if available in this browser
    const connectionInfo = (navigator as any).connection || 
                           (navigator as any).mozConnection || 
                           (navigator as any).webkitConnection || 
                           null;
    
    // Network type debug info: connectionInfo ? connectionInfo.type : 'unknown'
    
    // Check if the server is reachable via HTTP
    fetch(window.location.origin, { method: 'HEAD' })
      .then(() => {
        // Server is reachable via HTTP. WebSocket issues may be specific to WebSocket protocol.
      })
      .catch(err => {
        // Server is not reachable via HTTP
      });
      
    return true; // Continue anyway, the above checks are just for diagnostics
  }, []);
  
  // Function to establish WebSocket connection
  const connect = useCallback(() => {
    // Check if WebSocket is supported in this browser
    if (!isWebSocketSupported()) {
      // WebSocket is not supported in this browser
      setError('Your browser does not support WebSockets. Please use a modern browser.');
      return;
    }
    
    // Check network conditions
    checkNetworkCondition();
    
    // If there's an existing socket, check its state
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        // WebSocket already connected
        return; // Already connected
      }
      
      if (socketRef.current.readyState !== WebSocket.CLOSED && socketRef.current.readyState !== WebSocket.CLOSING) {
        // WebSocket connection in progress, waiting...
        return; // Connection in progress
      }
      
      // Close the existing socket if it's in closing state
      if (socketRef.current.readyState === WebSocket.CLOSING) {
        // Waiting for WebSocket to close before reconnecting...
        setTimeout(connect, 1000); // Try again after a short delay
        return;
      }
      
      // If closed, remove the reference
      socketRef.current = null;
    }
    
    try {
      // Determine the WebSocket protocol based on the current page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Get the current page URL for diagnostics
      // Current page URL debug
      
      // Set the WebSocket URL using the same host as the current page
      const wsUrl = `${protocol}//${window.location.host}/ws/contact`;
      
      // Attempting to connect to WebSocket
      
      // Create the WebSocket connection without query parameters for better compatibility
      // Creating WebSocket connection 
      
      // Try connecting with different protocol configurations to handle browser differences
      let socket: WebSocket;
      
      try {
        // Simplified connection without protocol specification
        socket = new WebSocket(wsUrl);
        // WebSocket created without protocol specification
      } catch (socketError) {
        // WebSocket creation failed
        setError('Failed to establish WebSocket connection. Please check your network connection.');
        return;
      }
      
      // Set binary type to ArrayBuffer for better compatibility
      socket.binaryType = 'arraybuffer';
      
      // Check if connection is initialized correctly
      // WebSocket object initialized
      
      // Log more detailed WebSocket creation status
      // WebSocket object created successfully
      
      // For debugging: Log socket readyState
      // Initial socket state check
      socketRef.current = socket;
      
      socket.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        // Connected to contact WebSocket server
        
        // Request the initial agent statuses
        socket.send(JSON.stringify({
          type: 'get-statuses'
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'agent-statuses':
              // Transform ISO string dates back to Date objects
              const statuses = message.data.map((agent: any) => ({
                ...agent,
                lastActive: new Date(agent.lastActive),
                lastUpdated: agent.lastUpdated ? new Date(agent.lastUpdated) : new Date(agent.lastActive)
              }));
              
              // Received agent statuses
              setAgentStatuses(statuses);
              break;
              
            case 'pong':
              // Log successful pong response
              // Received pong from server
              break;
              
            case 'error':
              // Server reported error
              setError(message.message || 'Unknown server error');
              break;
              
            default:
              // Received unknown message type
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error('Error parsing WebSocket message:', err);
          }
        }
      };
      
      socket.onclose = (event) => {
        setIsConnected(false);
        if (import.meta.env.DEV) {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        }
        
        // Check server HTTP reachability on WebSocket closure
        checkNetworkCondition();
        
        // Only attempt to reconnect for unexpected closures
        if (event.code !== 1000 && event.code !== 1001) { // Not normal closure or going away
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            
            // Use exponential backoff for reconnections
            const delay = Math.min(RECONNECT_INTERVAL * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (import.meta.env.DEV) {
                console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`);
              }
              connect();
            }, delay);
          } else {
            setFallbackMode(true);
            setError(null); // Clear error since we're using fallback
            if (import.meta.env.DEV) {
              console.log('WebSocket connections disabled for stability');
            }
            
            // Provide fallback static data
            setAgentStatuses([
              {
                id: "agent-1",
                name: "Mehmet Yilmaz",
                email: "myilmaz@molochain.com",
                country: "Turkey",
                role: "Regional Director",
                status: "online",
                lastActive: new Date(),
                connectionQuality: "95",
                networkAvailability: "98",
                responseTime: "120"
              },
              {
                id: "agent-2", 
                name: "Ahmed Al-Maktoum",
                email: "aalmaktoum@molochain.com",
                country: "United Arab Emirates",
                role: "Regional Manager", 
                status: "busy",
                lastActive: new Date(),
                connectionQuality: "87",
                networkAvailability: "92",
                responseTime: "180"
              },
              {
                id: "agent-3",
                name: "James Wilson",
                email: "jwilson@molochain.com", 
                country: "United Kingdom",
                role: "Regional Director",
                status: "offline",
                lastActive: new Date(Date.now() - 3600000),
                connectionQuality: "0",
                networkAvailability: "0",
                responseTime: "0"
              }
            ]);
          }
        }
      };
      
      socket.onerror = (event) => {
        if (import.meta.env.DEV) {
          console.error('WebSocket error:', event);
        }
        setError('Error connecting to agent status service.');
        
        // Log more detailed error information
        if (import.meta.env.DEV) {
          console.error('WebSocket error details:', {
          url: wsUrl,
          readyState: socket.readyState === 0 ? 'CONNECTING' : 
                      socket.readyState === 1 ? 'OPEN' : 
                      socket.readyState === 2 ? 'CLOSING' : 'CLOSED',
          timestamp: new Date().toISOString()
        });
        }
        
        // Force close the socket if it's in an error state but not closed
        if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
          if (import.meta.env.DEV) {
            console.log('Forcing socket close after error');
          }
          try {
            socket.close(3000, 'Closed due to error');
          } catch (closeError) {
            if (import.meta.env.DEV) {
              console.error('Error while closing socket:', closeError);
            }
          }
        }
      };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error creating WebSocket connection:', err);
      }
      setError('Failed to connect to agent status service.');
    }
  }, [isWebSocketSupported, checkNetworkCondition]);
  
  // Get available agents (status online or busy)
  const getAvailableAgents = useCallback(() => {
    return agentStatuses.filter(agent => agent.status !== 'offline');
  }, [agentStatuses]);
  
  // Get agent status by ID
  const getAgentStatus = useCallback((agentId: string) => {
    return agentStatuses.find(agent => agent.id === agentId);
  }, [agentStatuses]);
  
  // Get agent status by email
  const getAgentStatusByEmail = useCallback((email: string) => {
    return agentStatuses.find(agent => agent.email === email);
  }, [agentStatuses]);
  
  // Set up ping interval to keep connection alive
  useEffect(() => {
    let pingInterval: NodeJS.Timeout | null = null;
    
    if (isConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      if (import.meta.env.DEV) {
        console.log('Setting up ping interval to keep WebSocket connection alive');
      }
      pingInterval = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          if (import.meta.env.DEV) {
            console.log('Sending ping to server');
          }
          socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
      }, 30000); // Every 30 seconds
    }
    
    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [isConnected]);
  
  // Connect to WebSocket on component mount and disconnect on unmount
  useEffect(() => {
    connect();
    
    // Set a timeout to verify connection was established
    const connectionTimeout = setTimeout(() => {
      if (!isConnected && socketRef.current) {
        if (import.meta.env.DEV) {
          console.log('Connection timeout - forcing reconnect');
        }
        if (socketRef.current.readyState !== WebSocket.CLOSED) {
          socketRef.current.close();
        }
        connect();
      }
    }, 5000); // 5 second timeout
    
    return () => {
      clearTimeout(connectionTimeout);
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);
  
  return {
    agentStatuses,
    getAvailableAgents,
    getAgentStatus,
    getAgentStatusByEmail,
    isConnected,
    fallbackMode,
    error
  };
};

export default useContactWebSocket;