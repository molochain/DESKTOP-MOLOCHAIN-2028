/**
 * Notification Center Component
 * 
 * Displays real-time notifications and handles notification management
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  CheckCheck,
  Users,
  Heart,
  MessageSquare,
  Building2,
  Award,
  ShoppingCart,
  Mail,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
// WebSocket functionality will be handled by the parent component
// import { useWebSocketMessage } from '@/lib/websocket';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 
        'company_follow' | 'skill_endorsement' | 'marketplace_bid' | 'message' | 'system';
  title: string;
  message: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserImage?: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

const notificationIcons = {
  connection_request: Users,
  connection_accepted: Users,
  post_like: Heart,
  post_comment: MessageSquare,
  company_follow: Building2,
  skill_endorsement: Award,
  marketplace_bid: ShoppingCart,
  message: Mail,
  system: Settings
};

const notificationColors = {
  connection_request: 'text-blue-600 bg-blue-50',
  connection_accepted: 'text-green-600 bg-green-50',
  post_like: 'text-red-600 bg-red-50',
  post_comment: 'text-purple-600 bg-purple-50',
  company_follow: 'text-indigo-600 bg-indigo-50',
  skill_endorsement: 'text-yellow-600 bg-yellow-50',
  marketplace_bid: 'text-orange-600 bg-orange-50',
  message: 'text-blue-600 bg-blue-50',
  system: 'text-gray-600 bg-gray-50'
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/communication/notifications'],
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry failed requests to avoid 401 spam
    enabled: false // Disable for now until authentication is properly set up
  });

  // Fetch notification counts
  const { data: counts } = useQuery<{ unread: number; total: number }>({
    queryKey: ['/api/communication/notifications/counts'],
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: false,
    enabled: false // Disable for now
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest('PATCH', `/api/communication/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications/counts'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest('PATCH', '/api/communication/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications/counts'] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest('DELETE', `/api/communication/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications/counts'] });
    }
  });

  // Listen for real-time notifications
  // WebSocket connection for real-time notifications will be handled by parent component
  // This will be connected to /ws/mololink endpoint
  useEffect(() => {
    // Refresh notifications periodically as a fallback
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communication/notifications/counts'] });
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [queryClient]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = (counts?.unread ?? 0) as number;
  const hasUnread = unreadCount > 0;

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = notificationIcons[notification.type];
    const colorClass = notificationColors[notification.type];

    return (
      <Card className={`mb-2 transition-all duration-200 hover:shadow-md ${
        !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        disabled={markAsReadMutation.isPending}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  disabled={deleteNotificationMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          data-testid="button-notifications"
        >
          {hasUnread ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0" 
        sideOffset={8}
      >
        <div className="border-b bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Notifications
            </h3>
            
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-sm"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
          
          {counts && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          )}
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-gray-500">Loading notifications...</div>
              </div>
            ) : (notifications as Notification[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              (notifications as Notification[]).map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}