import { useState, useEffect, useRef } from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useUser } from '../../hooks/use-user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, FileText, Check, X, PauseCircle, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CollaborationSessionProps {
  sessionId: number;
  className?: string;
}

export function CollaborationSession({ sessionId, className }: CollaborationSessionProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, isLoading: isLoadingUser } = useUser();
  
  // Create the collaboration hook
  const {
    isConnected,
    isTyping: typingUsers,
    messages,
    participants,
    session,
    isLoadingSession,
    isLoadingMessages,
    isLoadingParticipants,
    sendMessage,
    sendTypingIndicator,
    pauseSession,
    resumeSession,
    completeSession
  } = useCollaboration(sessionId);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle typing indicator with debounce
  useEffect(() => {
    if (isTyping) {
      sendTypingIndicator(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a timeout to turn off typing indicator after inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(false);
      }
    }, 2000);
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, sendTypingIndicator]);
  
  // Handle message input changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value) {
      setIsTyping(true);
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Format date for messages
  const formatMessageTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'h:mm a');
    } catch (e) {
      return '';
    }
  };
  
  // Get user name for display
  const getUserName = (userId: number) => {
    const participant = participants.find(p => p.userId === userId);
    return participant ? `User ${userId}` : `Unknown User`;
  };
  
  // Check if a message is from the current user
  const isOwnMessage = (senderId: number) => {
    return user?.id === senderId;
  };
  
  // Render loading state
  if (isLoadingSession || isLoadingMessages || isLoadingParticipants || isLoadingUser) {
    return (
      <Card className={cn("w-full h-[600px] flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading collaboration session...</p>
        </div>
      </Card>
    );
  }
  
  // Render error or not found state
  if (!session) {
    return (
      <Card className={cn("w-full h-[600px] flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-4">
          <X className="h-8 w-8 text-destructive" />
          <p>Session not found or unavailable</p>
        </div>
      </Card>
    );
  }
  
  // Get a list of users who are currently typing
  const typingUserIds = Object.entries(typingUsers)
    .filter(([userId, isTyping]) => isTyping && Number(userId) !== user?.id)
    .map(([userId]) => Number(userId));
  
  return (
    <Card className={cn("w-full h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{session.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                session.status === 'active' ? 'default' : 
                session.status === 'paused' ? 'secondary' : 
                'outline'
              }
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
            
            {session.status === 'active' ? (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={pauseSession} 
                title="Pause Session"
              >
                <PauseCircle className="h-4 w-4" />
              </Button>
            ) : session.status === 'paused' ? (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resumeSession}
                title="Resume Session"
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            ) : null}
            
            {session.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={completeSession}
                title="Complete Session"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {participants.filter(p => p.isActive).length} active participant(s)
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-3">
        <ScrollArea className="h-full pr-4">
          <div className="flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    isOwnMessage(msg.senderId) && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      {getUserName(msg.senderId).substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "rounded-lg px-3 py-2 max-w-[80%]",
                    isOwnMessage(msg.senderId) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={cn(
                        "text-xs font-medium",
                        isOwnMessage(msg.senderId) 
                          ? "text-primary-foreground" 
                          : "text-muted-foreground"
                      )}>
                        {getUserName(msg.senderId)}
                      </span>
                      <span className={cn(
                        "text-xs",
                        isOwnMessage(msg.senderId) 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground/70"
                      )}>
                        {formatMessageTime(msg.sentAt)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicators */}
            {typingUserIds.length > 0 && (
              <div className="flex gap-2 mt-1">
                <div className="flex gap-1">
                  {typingUserIds.slice(0, 3).map((userId) => (
                    <Avatar key={userId} className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getUserName(userId).substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="bg-muted rounded-lg px-3 py-1 text-xs text-muted-foreground">
                  {typingUserIds.length === 1 
                    ? `${getUserName(typingUserIds[0])} is typing...` 
                    : `${typingUserIds.length} people are typing...`}
                </div>
              </div>
            )}
            
            {/* Invisible element for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t p-3">
        {!isConnected ? (
          <div className="w-full text-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
            Connecting...
          </div>
        ) : session.status === 'completed' ? (
          <div className="w-full text-center text-sm text-muted-foreground">
            This session has been completed and is read-only.
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <Textarea
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none min-h-[60px]"
              disabled={session.status !== 'active'}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || session.status !== 'active'}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}