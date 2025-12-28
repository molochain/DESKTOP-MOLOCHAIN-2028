/**
 * WebSocket Connection Indicator
 * 
 * Shows the current WebSocket connection status to users
 */

import { useWebSocketStatus } from '../lib/websocket';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

const statusConfig = {
  connected: {
    icon: Wifi,
    label: 'Connected',
    variant: 'default' as const,
    className: 'text-green-600 bg-green-50 border-green-200'
  },
  connecting: {
    icon: Loader2,
    label: 'Connecting',
    variant: 'secondary' as const,
    className: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  reconnecting: {
    icon: Loader2,
    label: 'Reconnecting',
    variant: 'secondary' as const,
    className: 'text-orange-600 bg-orange-50 border-orange-200'
  },
  disconnected: {
    icon: WifiOff,
    label: 'Offline',
    variant: 'secondary' as const,
    className: 'text-gray-600 bg-gray-50 border-gray-200'
  },
  error: {
    icon: AlertTriangle,
    label: 'Error',
    variant: 'destructive' as const,
    className: 'text-red-600 bg-red-50 border-red-200'
  }
};

interface WebSocketIndicatorProps {
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function WebSocketIndicator({ 
  showLabel = true, 
  size = 'default',
  className = ''
}: WebSocketIndicatorProps) {
  const status = useWebSocketStatus();
  const config = statusConfig[status];
  const Icon = config.icon;

  const isAnimated = status === 'connecting' || status === 'reconnecting';

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} ${
        size === 'sm' ? 'text-xs px-2 py-1' : 
        size === 'lg' ? 'text-base px-3 py-2' : 
        'text-sm px-2.5 py-1.5'
      }`}
    >
      <Icon 
        className={`${
          size === 'sm' ? 'h-3 w-3' : 
          size === 'lg' ? 'h-5 w-5' : 
          'h-4 w-4'
        } ${showLabel ? 'mr-2' : ''} ${
          isAnimated ? 'animate-spin' : ''
        }`} 
      />
      {showLabel && config.label}
    </Badge>
  );
}

export function WebSocketStatus() {
  const status = useWebSocketStatus();

  if (status === 'connected') return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <WebSocketIndicator />
    </div>
  );
}