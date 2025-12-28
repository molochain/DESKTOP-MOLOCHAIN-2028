import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Share2, 
  Mic, 
  MicOff,
  Camera,
  CameraOff,
  Send,
  Settings,
  UserPlus,
  Crown,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'owner' | 'editor' | 'viewer';
  cursor?: {
    line: number;
    column: number;
  };
  lastSeen?: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'code';
}

interface LiveCollaborationProps {
  projectId: string;
  collaborators: Collaborator[];
  currentUserId: string;
  onInviteUser?: (email: string) => void;
  className?: string;
}

export function LiveCollaboration({
  projectId,
  collaborators,
  currentUserId,
  onInviteUser,
  className
}: LiveCollaborationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    // Initialize with some demo messages
    setMessages([
      {
        id: '1',
        userId: 'user-1',
        message: 'Welcome to the collaborative workspace!',
        timestamp: new Date(Date.now() - 600000),
        type: 'system'
      },
      {
        id: '2',
        userId: 'user-2',
        message: 'I updated the API client code',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: '3',
        userId: 'user-1',
        message: 'Great! The WebSocket connection looks good',
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    return <Circle className={cn("w-2 h-2 fill-current", getStatusColor(status))} />;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />;
      default: return null;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId,
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const inviteUser = () => {
    if (!inviteEmail.trim() || !onInviteUser) return;
    
    onInviteUser(inviteEmail.trim());
    setInviteEmail('');
    setShowInviteForm(false);
    
    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      message: `Invitation sent to ${inviteEmail}`,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      message: 'Video call started',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      message: 'Video call ended',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserById = (id: string) => {
    return collaborators.find(c => c.id === id) || {
      id,
      name: 'Unknown User',
      avatar: '',
      status: 'offline' as const,
      role: 'viewer' as const
    };
  };

  return (
    <div className={cn("flex flex-col h-full space-y-4", className)}>
      {/* Active Collaborators */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Collaborators ({collaborators.length})</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteForm(!showInviteForm)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showInviteForm && (
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={inviteUser} disabled={!inviteEmail.trim()}>
                Send
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={collaborator.avatar} />
                  <AvatarFallback>
                    {collaborator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{collaborator.name}</span>
                    {getRoleIcon(collaborator.role)}
                    <Badge variant="outline" className="text-xs">
                      {collaborator.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(collaborator.status)}
                    <span className="text-xs text-gray-500 capitalize">
                      {collaborator.status}
                    </span>
                    {collaborator.cursor && (
                      <span className="text-xs text-gray-400">
                        • Line {collaborator.cursor.line}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Call Controls */}
      {isVideoCallActive && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Video Call Active</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={isMicMuted ? 'bg-red-100' : ''}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className={isCameraOff ? 'bg-red-100' : ''}
                >
                  {isCameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </Button>
                
                <Button variant="destructive" size="sm" onClick={endVideoCall}>
                  End Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Team Chat</span>
            </CardTitle>
            
            {!isVideoCallActive && (
              <Button variant="outline" size="sm" onClick={startVideoCall}>
                <Video className="w-4 h-4 mr-2" />
                Start Call
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              {messages.map((message) => {
                const user = getUserById(message.userId);
                const isCurrentUser = message.userId === currentUserId;
                const isSystemMessage = message.type === 'system';
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isCurrentUser ? "justify-end" : "justify-start",
                      isSystemMessage && "justify-center"
                    )}
                  >
                    {isSystemMessage ? (
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {message.message}
                      </div>
                    ) : (
                      <div className={cn(
                        "max-w-[70%] space-y-1",
                        isCurrentUser ? "items-end" : "items-start"
                      )}>
                        {!isCurrentUser && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{user.name}</span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "px-3 py-2 rounded-lg",
                          isCurrentUser 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-100 text-gray-900"
                        )}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LiveCollaboration;