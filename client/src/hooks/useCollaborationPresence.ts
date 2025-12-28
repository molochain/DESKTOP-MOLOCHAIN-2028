import { useState, useEffect, useCallback, useRef } from 'react';
import { CollaborationUser, CollaborationSession } from '@/components/collaboration/CollaborationStatusIndicator';

interface PresenceMessage {
  type: 'presence_update' | 'user_joined' | 'user_left' | 'activity_change' | 'cursor_move';
  userId: string;
  sessionId?: string;
  data: any;
  timestamp: number;
}

interface UseCollaborationPresenceOptions {
  sessionId?: string;
  userId?: string;
  sessionType?: 'document' | 'project' | 'chat' | 'meeting';
  autoConnect?: boolean;
  heartbeatInterval?: number;
}

export function useCollaborationPresence(options: UseCollaborationPresenceOptions = {}) {
  const {
    sessionId,
    userId,
    sessionType = 'document',
    autoConnect = true,
    heartbeatInterval = 30000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to collaboration WebSocket
  const connect = useCallback(() => {
    if (!sessionId || !userId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/collaboration`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (import.meta.env.DEV) {
          console.log('Connected to collaboration service');
        }
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Join session
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'join_session',
            sessionId,
            userId,
            sessionType,
            timestamp: Date.now()
          }));
        }

        // Start heartbeat
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
        heartbeatRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'heartbeat',
              userId,
              sessionId,
              timestamp: Date.now()
            }));
          }
        }, heartbeatInterval);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: PresenceMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error parsing collaboration message:', error);
          }
        }
      };

      wsRef.current.onclose = () => {
        if (import.meta.env.DEV) {
          console.log('Disconnected from collaboration service');
        }
        setIsConnected(false);
        
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        if (import.meta.env.DEV) {
          console.error('Collaboration WebSocket error:', error);
        }
      };

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error connecting to collaboration service:', error);
      }
    }
  }, [sessionId, userId, sessionType, heartbeatInterval]);

  // Handle incoming messages
  const handleMessage = useCallback((message: PresenceMessage) => {
    switch (message.type) {
      case 'presence_update':
        setUsers(message.data.users || []);
        setSession(message.data.session || null);
        break;

      case 'user_joined':
        setUsers(prevUsers => {
          const existingUser = prevUsers.find(u => u.id === message.data.user.id);
          if (existingUser) {
            return prevUsers.map(u => 
              u.id === message.data.user.id 
                ? { ...u, ...message.data.user, status: 'online' }
                : u
            );
          }
          return [...prevUsers, { ...message.data.user, status: 'online' }];
        });
        break;

      case 'user_left':
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === message.userId 
              ? { ...u, status: 'offline', lastSeen: new Date(message.timestamp) }
              : u
          )
        );
        break;

      case 'activity_change':
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === message.userId 
              ? { ...u, activity: message.data.activity, lastSeen: new Date(message.timestamp) }
              : u
          )
        );
        setLastActivity(new Date(message.timestamp));
        break;

      case 'cursor_move':
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === message.userId 
              ? { ...u, cursor: message.data.cursor }
              : u
          )
        );
        break;

      default:
        if (import.meta.env.DEV) {
          console.log('Unknown message type:', message.type);
        }
    }
  }, []);

  // Update user activity
  const updateActivity = useCallback((activity: CollaborationUser['activity']) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !userId) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'activity_change',
      userId,
      sessionId,
      data: { activity },
      timestamp: Date.now()
    }));

    setCurrentUser(prev => prev ? { ...prev, activity } : null);
  }, [userId, sessionId]);

  // Update cursor position
  const updateCursor = useCallback((x: number, y: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !userId) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'cursor_move',
      userId,
      sessionId,
      data: { cursor: { x, y } },
      timestamp: Date.now()
    }));
  }, [userId, sessionId]);

  // Update user status
  const updateStatus = useCallback((status: CollaborationUser['status']) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !userId) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'status_change',
      userId,
      sessionId,
      data: { status },
      timestamp: Date.now()
    }));

    setCurrentUser(prev => prev ? { ...prev, status } : null);
  }, [userId, sessionId]);

  // Disconnect from session
  const disconnect = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'leave_session',
          userId,
          sessionId,
          timestamp: Date.now()
        }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setUsers([]);
    setSession(null);
    setCurrentUser(null);
  }, [userId, sessionId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && sessionId && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, sessionId, userId, connect, disconnect]);

  // Auto-detect user activity
  useEffect(() => {
    if (!isConnected) return;

    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      setLastActivity(new Date());
      updateActivity('viewing');
      
      // Reset to idle after 2 minutes of inactivity
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        updateActivity('idle');
      }, 120000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(activityTimeout);
    };
  }, [isConnected, updateActivity]);

  // Handle page visibility changes
  useEffect(() => {
    if (!isConnected) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away');
      } else {
        updateStatus('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, updateStatus]);

  const stats = {
    totalUsers: users.length,
    onlineUsers: users.filter(u => u.status === 'online').length,
    activeUsers: users.filter(u => u.activity === 'editing' || u.activity === 'typing').length,
    isSessionActive: session?.isActive || false
  };

  return {
    // Connection state
    isConnected,
    
    // Data
    users,
    session,
    currentUser,
    stats,
    lastActivity,
    
    // Actions
    connect,
    disconnect,
    updateActivity,
    updateCursor,
    updateStatus,
    
    // Utilities
    getUserById: (id: string) => users.find(u => u.id === id),
    getOnlineUsers: () => users.filter(u => u.status === 'online'),
    getActiveUsers: () => users.filter(u => u.activity === 'editing' || u.activity === 'typing')
  };
}

export default useCollaborationPresence;