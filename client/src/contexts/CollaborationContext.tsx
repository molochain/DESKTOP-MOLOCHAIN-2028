import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCollaborationPresence } from '@/hooks/useCollaborationPresence';
import { CollaborationUser, CollaborationSession } from '@/components/collaboration/CollaborationStatusIndicator';

interface CollaborationContextType {
  // Current collaboration state
  currentSession: CollaborationSession | null;
  currentUser: CollaborationUser | null;
  isConnected: boolean;
  
  // Session management
  joinSession: (sessionId: string, sessionType?: 'document' | 'project' | 'chat' | 'meeting') => void;
  leaveSession: () => void;
  
  // User interactions
  updateActivity: (activity: CollaborationUser['activity']) => void;
  updateStatus: (status: CollaborationUser['status']) => void;
  updateCursor: (x: number, y: number) => void;
  
  // Data access
  users: CollaborationUser[];
  stats: {
    totalUsers: number;
    onlineUsers: number;
    activeUsers: number;
    isSessionActive: boolean;
  };
  
  // Utilities
  getUserById: (id: string) => CollaborationUser | undefined;
  getOnlineUsers: () => CollaborationUser[];
  getActiveUsers: () => CollaborationUser[];
  
  // Session history
  recentSessions: CollaborationSession[];
  addToRecentSessions: (session: CollaborationSession) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

interface CollaborationProviderProps {
  children: ReactNode;
  maxRecentSessions?: number;
}

export function CollaborationProvider({ 
  children, 
  maxRecentSessions = 10 
}: CollaborationProviderProps) {
  const { user } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionType, setActiveSessionType] = useState<'document' | 'project' | 'chat' | 'meeting'>('document');
  const [recentSessions, setRecentSessions] = useState<CollaborationSession[]>([]);

  const {
    isConnected,
    users,
    session: currentSession,
    currentUser,
    stats,
    connect,
    disconnect,
    updateActivity,
    updateCursor,
    updateStatus,
    getUserById,
    getOnlineUsers,
    getActiveUsers
  } = useCollaborationPresence({
    sessionId: activeSessionId || undefined,
    userId: user?.id?.toString(),
    sessionType: activeSessionType,
    autoConnect: !!activeSessionId && !!user?.id
  });

  // Join a collaboration session
  const joinSession = (sessionId: string, sessionType: 'document' | 'project' | 'chat' | 'meeting' = 'document') => {
    if (activeSessionId === sessionId) return;
    
    // Leave current session if exists
    if (activeSessionId) {
      disconnect();
    }
    
    setActiveSessionId(sessionId);
    setActiveSessionType(sessionType);
    
    // Add to recent sessions when joining
    if (currentSession) {
      addToRecentSessions(currentSession);
    }
  };

  // Leave current session
  const leaveSession = () => {
    if (currentSession) {
      addToRecentSessions(currentSession);
    }
    
    disconnect();
    setActiveSessionId(null);
  };

  // Add session to recent history
  const addToRecentSessions = (session: CollaborationSession) => {
    setRecentSessions(prev => {
      const filtered = prev.filter(s => s.id !== session.id);
      const updated = [{ ...session, lastActivity: new Date() }, ...filtered];
      return updated.slice(0, maxRecentSessions);
    });
  };

  // Load recent sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('collaboration-recent-sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSessions(parsed.map((s: any) => ({
          ...s,
          lastActivity: new Date(s.lastActivity)
        })));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading recent sessions:', error);
      }
    }
  }, []);

  // Save recent sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('collaboration-recent-sessions', JSON.stringify(recentSessions));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving recent sessions:', error);
      }
    }
  }, [recentSessions]);

  // Auto-update activity based on user interactions
  useEffect(() => {
    if (!isConnected || !user) return;

    let isEditing = false;
    let editingTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect editing in form inputs, textareas, and contenteditable elements
      const target = e.target as HTMLElement;
      const isEditableElement = target.tagName === 'INPUT' || 
                               target.tagName === 'TEXTAREA' || 
                               target.contentEditable === 'true';

      if (isEditableElement && !isEditing) {
        isEditing = true;
        updateActivity('editing');
      }

      clearTimeout(editingTimeout);
      editingTimeout = setTimeout(() => {
        isEditing = false;
        updateActivity('viewing');
      }, 2000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Update cursor position (throttled)
      updateCursor(e.clientX, e.clientY);
    };

    let lastCursorUpdate = 0;
    const throttledMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastCursorUpdate > 100) { // Throttle to 10fps
        handleMouseMove(e);
        lastCursorUpdate = now;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', throttledMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', throttledMouseMove);
      clearTimeout(editingTimeout);
    };
  }, [isConnected, user, updateActivity, updateCursor]);

  // Handle browser events for status updates
  useEffect(() => {
    if (!isConnected) return;

    const handleFocus = () => updateStatus('online');
    const handleBlur = () => updateStatus('away');
    const handleBeforeUnload = () => updateStatus('offline');

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isConnected, updateStatus]);

  const contextValue: CollaborationContextType = {
    // State
    currentSession,
    currentUser,
    isConnected,
    
    // Actions
    joinSession,
    leaveSession,
    updateActivity,
    updateStatus,
    updateCursor,
    
    // Data
    users,
    stats,
    
    // Utilities
    getUserById,
    getOnlineUsers,
    getActiveUsers,
    
    // History
    recentSessions,
    addToRecentSessions
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}

export default CollaborationContext;