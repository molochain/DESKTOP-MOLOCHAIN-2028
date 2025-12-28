import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Activity, 
  RefreshCw, 
  Circle,
  UserCheck,
  UserX,
  Clock,
  Globe,
  Monitor
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

interface UserActivity {
  userId: number;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'idle' | 'offline';
  lastActivity: Date;
  currentAction?: string;
  location?: string;
  device?: string;
  riskLevel: 'normal' | 'elevated' | 'high';
  sessionDuration?: number;
}

interface ActivityStats {
  totalUsers: number;
  activeUsers: number;
  idleUsers: number;
  recentActivities: Array<{
    userId: number;
    username: string;
    action: string;
    timestamp: Date;
    resource?: string;
  }>;
}

interface UserActivityWidgetProps {
  className?: string;
  refreshInterval?: number;
  onUserClick?: (user: UserActivity) => void;
  maxUsers?: number;
  fullView?: boolean;
}

export default function UserActivityWidget({
  className,
  refreshInterval = 15000,
  onUserClick,
  maxUsers = 8,
  fullView = false
}: UserActivityWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [recentActions, setRecentActions] = useState<ActivityStats['recentActivities']>([]);
  const { subscribe } = useWebSocket();

  const { data: activityData, refetch } = useQuery<{
    users: UserActivity[];
    stats: ActivityStats;
  }>({
    queryKey: ['/api/security/user-activity'],
    refetchInterval: refreshInterval
  });

  useEffect(() => {
    if (activityData) {
      setActivities(activityData.users);
      setRecentActions(activityData.stats.recentActivities);
    }
  }, [activityData]);

  useEffect(() => {
    const unsubscribe = subscribe('security.activity', (data) => {
      if (data.type === 'user_activity') {
        setRecentActions(prev => [data.activity, ...prev].slice(0, 10));
        
        // Update user status
        setActivities(prev => {
          const index = prev.findIndex(u => u.userId === data.activity.userId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              status: 'online',
              lastActivity: new Date(),
              currentAction: data.activity.action
            };
            return updated;
          }
          return prev;
        });
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'idle': return 'text-yellow-500';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    return (
      <Circle 
        className={cn('h-2 w-2 fill-current', getStatusColor(status))} 
      />
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case 'elevated': return <Badge variant="secondary" className="text-xs">Elevated</Badge>;
      default: return null;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const onlineUsers = activities.filter(u => u.status === 'online');
  const idleUsers = activities.filter(u => u.status === 'idle');

  return (
    <Card className={cn('h-full', className)} data-testid="widget-user-activity">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>User Activity</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Circle className="h-2 w-2 fill-green-500" />
              {onlineUsers.length} online
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              data-testid="button-refresh-activity"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {onlineUsers.length + idleUsers.length} active users currently
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {/* User Stats */}
            <div className="grid grid-cols-3 gap-3 pb-3 border-b">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Online</p>
                <p className="text-lg font-semibold text-green-500">{onlineUsers.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Idle</p>
                <p className="text-lg font-semibold text-yellow-500">{idleUsers.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{activities.length}</p>
              </div>
            </div>

            {/* Active Users List */}
            <ScrollArea className={fullView ? 'h-80' : 'h-52'}>
              <div className="space-y-2">
                {activities
                  .filter(u => u.status !== 'offline')
                  .slice(0, fullView ? undefined : maxUsers)
                  .map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-all"
                      onClick={() => onUserClick?.(user)}
                      data-testid={`user-item-${user.userId}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0">
                            {getStatusIcon(user.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{user.username}</p>
                            {getRiskBadge(user.riskLevel)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {user.currentAction && (
                              <span className="truncate">{user.currentAction}</span>
                            )}
                            {user.location && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {user.location}
                              </span>
                            )}
                            {user.device && (
                              <span className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {user.device}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.lastActivity).toLocaleTimeString()}
                        </p>
                        {user.sessionDuration && (
                          <p className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatDuration(user.sessionDuration)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            {/* Recent Actions */}
            {fullView && recentActions.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Recent Actions
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {recentActions.slice(0, 5).map((action, index) => (
                      <div
                        key={`${action.userId}-${index}`}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{action.username}</span>
                          <span className="text-muted-foreground">{action.action}</span>
                          {action.resource && (
                            <span className="text-primary">{action.resource}</span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading user activity...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}