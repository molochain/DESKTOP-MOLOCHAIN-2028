import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Circle, Users, Eye, Edit, MessageCircle, Clock } from 'lucide-react';
import { useCollaborationPresence } from '@/hooks/useCollaborationPresence';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activity: 'viewing' | 'editing' | 'typing' | 'idle';
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface CollaborationSession {
  id: string;
  name: string;
  type: 'document' | 'project' | 'chat' | 'meeting';
  users: CollaborationUser[];
  isActive: boolean;
  lastActivity: Date;
}

interface CollaborationStatusIndicatorProps {
  session?: CollaborationSession;
  users?: CollaborationUser[];
  showUserList?: boolean;
  showActivity?: boolean;
  compact?: boolean;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500', 
  busy: 'bg-red-500',
  offline: 'bg-gray-400'
};

const activityIcons = {
  viewing: Eye,
  editing: Edit,
  typing: MessageCircle,
  idle: Clock
};

const activityColors = {
  viewing: 'text-blue-500',
  editing: 'text-green-500',
  typing: 'text-purple-500',
  idle: 'text-gray-400'
};

export function CollaborationStatusIndicator({
  session,
  users = [],
  showUserList = true,
  showActivity = true,
  compact = false,
  className
}: CollaborationStatusIndicatorProps) {
  const [currentUsers, setCurrentUsers] = useState<CollaborationUser[]>(users);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use real-time presence tracking
  const { users: presenceUsers, session: currentSession, isConnected } = useCollaborationPresence();

  // Combine props users with real-time presence data
  const sessionUsers = presenceUsers.length > 0 ? presenceUsers : (session?.users || currentUsers);
  const onlineUsers = sessionUsers.filter(user => user.status === 'online');
  const activeUsers = sessionUsers.filter(user => 
    user.activity === 'editing' || user.activity === 'typing'
  );

  useEffect(() => {
    setCurrentUsers(users);
  }, [users]);

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Circle className={cn("h-2 w-2", onlineUsers.length > 0 ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400')} />
        <span className="text-xs text-muted-foreground">
          {onlineUsers.length} online
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        {/* Session Status */}
        {session && (
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
            <div className="flex items-center gap-2">
              <Circle className={cn(
                "h-3 w-3",
                session.isActive ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
              )} />
              <span className="font-medium text-sm">{session.name}</span>
              <Badge variant="secondary" className="text-xs">
                {session.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 ml-auto">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {onlineUsers.length}/{sessionUsers.length}
              </span>
            </div>
          </div>
        )}

        {/* User List */}
        {showUserList && sessionUsers.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Collaborators</span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {/* Avatar Stack (Always Visible) */}
            <div className="flex -space-x-2">
              {sessionUsers.slice(0, 5).map((user) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Circle className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-background",
                        statusColors[user.status]
                      )} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground">{user.status}</div>
                      {user.status !== 'online' && (
                        <div className="text-muted-foreground">
                          Last seen {formatLastSeen(user.lastSeen)}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {sessionUsers.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{sessionUsers.length - 5}</span>
                </div>
              )}
            </div>

            {/* Expanded User List */}
            {isExpanded && (
              <div className="space-y-2 pt-2 border-t">
                {sessionUsers.map((user) => {
                  const ActivityIcon = activityIcons[user.activity];
                  return (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                      <div className="relative">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Circle className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border border-background",
                          statusColors[user.status]
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{user.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {user.status}
                          </Badge>
                        </div>
                        {showActivity && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <ActivityIcon className={cn("h-3 w-3", activityColors[user.activity])} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {user.activity}
                            </span>
                            {user.status !== 'online' && (
                              <span className="text-xs text-muted-foreground">
                                • {formatLastSeen(user.lastSeen)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Activity Summary */}
        {showActivity && activeUsers.length > 0 && (
          <div className="p-2 rounded-md bg-muted/50">
            <div className="text-xs text-muted-foreground">
              {activeUsers.length === 1 ? (
                <span>{activeUsers[0].name} is {activeUsers[0].activity}</span>
              ) : (
                <span>{activeUsers.length} users are actively collaborating</span>
              )}
            </div>
          </div>
        )}

        {/* No Users Message */}
        {sessionUsers.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No collaborators online
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default CollaborationStatusIndicator;