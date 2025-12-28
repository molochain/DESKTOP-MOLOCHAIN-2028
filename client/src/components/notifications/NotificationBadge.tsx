import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'secondary' | 'outline';
  showZero?: boolean;
  pulse?: boolean;
  maxCount?: number;
}

export default function NotificationBadge({
  className,
  variant = 'destructive',
  showZero = false,
  pulse = true,
  maxCount = 99
}: NotificationBadgeProps) {
  const [count, setCount] = useState(0);
  const { subscribe } = useWebSocket();

  // Fetch unread count
  const { data: unreadCount } = useQuery<number>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000
  });

  useEffect(() => {
    if (unreadCount !== undefined) {
      setCount(unreadCount);
    }
  }, [unreadCount]);

  // Real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('notifications', (data) => {
      if (data.type === 'new_notification') {
        setCount(prev => prev + 1);
      } else if (data.type === 'notification_read') {
        setCount(prev => Math.max(0, prev - 1));
      } else if (data.type === 'notifications_cleared') {
        setCount(0);
      }
    });

    return unsubscribe;
  }, [subscribe]);

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div className="relative inline-block">
      {pulse && count > 0 && (
        <span className="absolute inset-0 animate-ping bg-destructive rounded-full opacity-75" />
      )}
      <Badge 
        variant={variant} 
        className={cn(
          'relative h-5 min-w-5 px-1.5 text-xs',
          className
        )}
        data-testid="notification-badge"
      >
        {displayCount}
      </Badge>
    </div>
  );
}