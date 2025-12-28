import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check, 
  X, 
  Trash2,
  MoreVertical,
  Search,
  Filter,
  AlertCircle,
  Shield,
  Users,
  FileText,
  Activity,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  type: 'security' | 'user' | 'system' | 'compliance' | 'activity';
  category: 'alert' | 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  metadata?: any;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive';
  }>;
}

interface NotificationCenterProps {
  className?: string;
  position?: 'dropdown' | 'panel' | 'fullscreen';
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
}

const notificationIcons: Record<string, React.ReactNode> = {
  security: <Shield className="h-4 w-4" />,
  user: <Users className="h-4 w-4" />,
  system: <Activity className="h-4 w-4" />,
  compliance: <FileText className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />
};

const categoryColors: Record<string, string> = {
  alert: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  success: 'text-green-500',
  error: 'text-red-600'
};

export default function NotificationCenter({
  className,
  position = 'dropdown',
  onNotificationClick,
  onSettingsClick
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { subscribe } = useWebSocket();

  // Fetch notifications
  const { data: notificationData, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000
  });

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData);
    }
  }, [notificationData]);

  // Real-time notifications
  useEffect(() => {
    const unsubscribe = subscribe('notifications', (data) => {
      if (data.type === 'new_notification') {
        setNotifications(prev => [data.notification, ...prev]);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}/read`, 'PUT', {}),
    onSuccess: (_, notificationId) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Acknowledge notification mutation
  const acknowledgeMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}/acknowledge`, 'PUT', {}),
    onSuccess: (_, notificationId) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, acknowledged: true } : n)
      );
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}`, 'DELETE', {}),
    onSuccess: (_, notificationId) => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/read-all', 'PUT', {}),
    onSuccess: () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refetch();
    }
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/clear', 'DELETE', {}),
    onSuccess: () => {
      setNotifications([]);
      refetch();
    }
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (selectedTab !== 'all' && n.type !== selectedTab) return false;
    if (filter === 'unread' && n.read) return false;
    if (filter === 'critical' && n.priority !== 'critical' && n.priority !== 'high') return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => 
    (n.priority === 'critical' || n.priority === 'high') && !n.acknowledged
  ).length;

  const handleNotificationClick = (notification: Notification) => {
    markAsReadMutation.mutate(notification.id);
    onNotificationClick?.(notification);
  };

  const handleActionClick = (notification: Notification, action: any) => {
    // Handle notification actions
    if (import.meta.env.DEV) {
      console.log('Action clicked:', action);
    }
    acknowledgeMutation.mutate(notification.id);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority}
      </Badge>
    );
  };

  const content = (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => markAllAsReadMutation.mutate()}>
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => clearAllMutation.mutate()}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {position === 'dropdown' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Critical'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter('all')}>
              All notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('unread')}>
              Unread only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('critical')}>
              Critical & High
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-6 h-9">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          <TabsTrigger value="user" className="text-xs">User</TabsTrigger>
          <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-3">
          <ScrollArea className="h-96">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      'hover:bg-accent/50',
                      !notification.read && 'bg-accent/20 border-primary/20',
                      notification.priority === 'critical' && 'border-destructive/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('mt-0.5', categoryColors[notification.category])}>
                        {notificationIcons[notification.type]}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm line-clamp-1">
                            {notification.title}
                          </p>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                          {notification.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActionClick(notification, action);
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notification.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          {!notification.acknowledged && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                acknowledgeMutation.mutate(notification.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Acknowledge
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notification.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <BellOff className="h-8 w-8 mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">
              {criticalCount} critical notification{criticalCount !== 1 && 's'} require attention
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (position === 'dropdown') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            data-testid="button-notification-center"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0" align="end">
          <div className="p-4">{content}</div>
        </PopoverContent>
      </Popover>
    );
  }

  if (position === 'panel') {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">{content}</CardContent>
      </Card>
    );
  }

  // Fullscreen
  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
      {content}
    </div>
  );
}