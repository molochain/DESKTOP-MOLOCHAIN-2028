import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from '@/hooks/use-toast';
// Collaboration socket functionality simplified for stability
import { collaborationSocket } from '../services/collaborationService';

interface CollaborationEventType {
  CURSOR_MOVE: string;
  TEXT_CHANGE: string;
  USER_JOIN: string;
}

interface CollaborationEvent {
  type: string;
  data: any;
  payload?: any;
}

interface CollaborationMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  contentType?: string;
  sentAt: string;
  attachments?: any[];
}

// Define interface for a collaboration session
export interface CollaborationSession {
  id: number;
  projectId: number;
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdById: number;
  createdAt: string;
  updatedAt: string;
  participants?: Participant[];
  messages?: CollaborationMessage[];
}

// Define interface for a session participant
export interface Participant {
  id: number;
  userId: number;
  sessionId: number;
  role: string;
  isActive: boolean;
  joinedAt: string;
  leftAt: string | null;
  lastActivityAt: string | null;
}

// Type for mapping user IDs to typing status
interface TypedPayload<T> {
  [key: string]: T;
}

// Options that can be passed to the hook
interface UseCollaborationOptions {
  onMessage?: (message: CollaborationMessage) => void;
  onParticipantJoined?: (participant: { userId: number, role: string }) => void;
  onParticipantLeft?: (participant: { userId: number }) => void;
  onTypingIndicator?: (data: { userId: number, isTyping: boolean }) => void;
  onError?: (error: { message: string }) => void;
}

// Main hook implementation
export function useCollaboration(
  sessionId?: number,
  options: UseCollaborationOptions = {}
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = !!user;
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<TypedPayload<boolean>>({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const optionsRef = useRef(options);
  
  // Update the ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize the socket connection
  useEffect(() => {
    if (!isAuthenticated) {
      // User not authenticated, cannot connect to collaboration socket
      return;
    }
    
    // Connect to the WebSocket server
    collaborationSocket.connect();
    
    // Setup event listeners for connection status
    const handleOpen = () => {
      setIsConnected(true);
      // Connected to collaboration server
    };
    
    const handleClose = () => {
      setIsConnected(false);
      // Disconnected from collaboration server
    };
    
    // Register handlers with proper event listener management
    if (typeof collaborationSocket.on === 'function') {
      collaborationSocket.on('open', handleOpen);
      collaborationSocket.on('close', handleClose);
    }
    
    // Check if already connected
    if (collaborationSocket.isConnected) {
      setIsConnected(true);
    }
    
    // Clean up on unmount
    return () => {
      if (typeof collaborationSocket.off === 'function') {
        collaborationSocket.off('open', handleOpen);
        collaborationSocket.off('close', handleClose);
      }
    };
  }, [isAuthenticated]);
  
  // Join the session if sessionId is provided
  useEffect(() => {
    if (!sessionId || !isConnected || !isAuthenticated) return;
    
    // Setup event handlers for session events
    const handleNewMessage = (event: CollaborationEvent) => {
      if (event.payload) {
        // For simplicity in our demo, we'll create a message object from the payload
        const message: CollaborationMessage = {
          id: String(Math.floor(Math.random() * 100000)),
          sessionId: String(sessionId),
          senderId: '1',
          content: event.payload.content,
          contentType: event.payload.contentType || 'text',
          sentAt: new Date().toISOString(),
          attachments: event.payload.attachments
        };
        
        setMessages(prev => [...prev, message]);
        
        // Call the user-provided callback if present
        if (optionsRef.current.onMessage) {
          optionsRef.current.onMessage(message);
        }
      }
    };
    
    const handleParticipantJoined = (event: CollaborationEvent) => {
      if (event.payload && event.payload.userId) {
        // Add the new participant to our local state
        const newParticipant: Participant = {
          id: Math.floor(Math.random() * 10000),
          userId: event.payload.userId,
          sessionId: sessionId,
          role: event.payload.role || 'member',
          isActive: true,
          joinedAt: new Date().toISOString(),
          leftAt: null,
          lastActivityAt: new Date().toISOString()
        };
        
        setParticipants(prev => [...prev, newParticipant]);
        
        if (optionsRef.current.onParticipantJoined) {
          optionsRef.current.onParticipantJoined(event.payload);
        }
      }
    };
    
    const handleParticipantLeft = (event: CollaborationEvent) => {
      if (event.payload && event.payload.userId) {
        // Mark participant as inactive in our local state
        setParticipants(prev => 
          prev.map(p => 
            p.userId === event.payload.userId 
              ? { ...p, isActive: false, leftAt: new Date().toISOString() } 
              : p
          )
        );
        
        if (optionsRef.current.onParticipantLeft) {
          optionsRef.current.onParticipantLeft(event.payload);
        }
      }
    };
    
    const handleTypingIndicator = (event: CollaborationEvent) => {
      if (event.payload && typeof event.payload.userId === 'number') {
        const { userId, isTyping: typing } = event.payload;
        setIsTyping(prev => ({ ...prev, [userId]: typing }));
        
        if (optionsRef.current.onTypingIndicator) {
          optionsRef.current.onTypingIndicator(event.payload);
        }
      }
    };
    
    const handleError = (event: CollaborationEvent) => {
      if (event.payload && event.payload.message) {
        // Collaboration error
        toast({
          title: 'Collaboration Error',
          description: event.payload.message,
          variant: 'destructive',
        });
        
        if (optionsRef.current.onError) {
          optionsRef.current.onError(event.payload);
        }
      }
    };
    
    // Register event handlers
    collaborationSocket.on('newMessage', handleNewMessage);
    collaborationSocket.on('participantJoined', handleParticipantJoined);
    collaborationSocket.on('participantLeft', handleParticipantLeft);
    collaborationSocket.on('typingIndicator', handleTypingIndicator);
    collaborationSocket.on('error', handleError);
    
    // Join the session
    collaborationSocket.joinSession(String(sessionId));
    
    // Add a demo participant (the current user)
    setParticipants([{
      id: 1,
      userId: 1,
      sessionId: sessionId,
      role: 'owner',
      isActive: true,
      joinedAt: new Date().toISOString(),
      leftAt: null,
      lastActivityAt: new Date().toISOString()
    }]);
    
    // Clean up on unmount or when sessionId changes
    return () => {
      collaborationSocket.off('newMessage', handleNewMessage);
      collaborationSocket.off('participantJoined', handleParticipantJoined);
      collaborationSocket.off('participantLeft', handleParticipantLeft);
      collaborationSocket.off('typingIndicator', handleTypingIndicator);
      collaborationSocket.off('error', handleError);
      
      // Leave the session when unmounting or changing sessions
      collaborationSocket.leaveSession(String(sessionId));
    };
  }, [sessionId, isConnected, isAuthenticated, toast]);
  
  // For the demo, we'll create a mock session
  const mockSession: CollaborationSession = {
    id: sessionId || 1,
    projectId: 1,
    name: "Demo Collaboration Session",
    status: 'active',
    createdById: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: participants,
    messages: messages
  };
  
  // Send a message
  const sendMessage = useCallback((
    content: string,
    contentType: 'text' | 'document' | 'decision' = 'text',
    attachments?: Array<{ name: string, url?: string }>
  ) => {
    if (!sessionId || !isConnected) {
      toast({
        title: 'Cannot Send Message',
        description: 'Not connected to the collaboration session.',
        variant: 'destructive',
      });
      return;
    }
    
    // Send message via websocket
    collaborationSocket.sendSessionMessage(content, contentType, JSON.stringify(attachments));
    
    // Add the message to our local state (for demo purposes)
    const newMessage: CollaborationMessage = {
      id: String(Date.now()),
      sessionId: String(sessionId),
      senderId: '1', // Current user ID
      content,
      contentType,
      sentAt: new Date().toISOString(),
      attachments
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [sessionId, isConnected, toast]);
  
  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!sessionId || !isConnected) return;
    
    collaborationSocket.sendTypingIndicator(String(isTyping));
  }, [sessionId, isConnected]);
  
  // Complete the session
  const completeSession = useCallback(() => {
    if (!sessionId) return;
    
    // For demo, just update the local session status
    mockSession.status = 'completed';
    mockSession.updatedAt = new Date().toISOString();
    
    toast({
      title: 'Session Updated',
      description: 'Session status changed to completed.',
    });
  }, [sessionId, toast]);
  
  // Pause the session
  const pauseSession = useCallback(() => {
    if (!sessionId) return;
    
    // For demo, just update the local session status
    mockSession.status = 'paused';
    mockSession.updatedAt = new Date().toISOString();
    
    toast({
      title: 'Session Updated',
      description: 'Session status changed to paused.',
    });
  }, [sessionId, toast]);
  
  // Resume the session
  const resumeSession = useCallback(() => {
    if (!sessionId) return;
    
    // For demo, just update the local session status
    mockSession.status = 'active';
    mockSession.updatedAt = new Date().toISOString();
    
    toast({
      title: 'Session Updated',
      description: 'Session status changed to active.',
    });
  }, [sessionId, toast]);
  
  // Create a new session
  const createSession = (data: { projectId: number, name: string }) => {
    if (import.meta.env.DEV) {
      console.log('Creating session:', data);
    }
    
    // For demo, we'll just return success
    toast({
      title: 'Session Created',
      description: 'Collaboration session has been created successfully.',
    });
    
    return mockSession;
  };
  
  return {
    // State
    isConnected,
    isTyping,
    messages,
    participants,
    // Session data (mock for demo)
    session: mockSession,
    isLoadingSession: false,
    isLoadingMessages: false,
    isLoadingParticipants: false,
    isError: false,
    // Mutations
    createSession,
    isCreatingSession: false,
    // Actions
    sendMessage,
    sendTypingIndicator,
    completeSession,
    pauseSession,
    resumeSession,
  };
}