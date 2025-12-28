// Tracking connection state simplified
import { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Info, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type StatusType = 'connected' | 'connecting' | 'disconnected' | 'failed';

interface TrackingStatusIndicatorProps {
  trackingNumber?: string;
  className?: string;
}

const TrackingStatusIndicator = ({ 
  trackingNumber,
  className 
}: TrackingStatusIndicatorProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StatusType>('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Periodically update connection state
  useEffect(() => {
    const checkStatus = () => {
      // Simplified connection state for stability
      const connState = { 
        isConnected: false, 
        connectionDetails: { 
          isConnecting: false,
          reconnectAttempts: 0,
          maxAttempts: 5,
          connectionStatus: 'disconnected'
        }, 
        activeSubscriptions: [] as string[]
      };
      
      let newStatus: StatusType = 'disconnected';
      let message = '';
      
      if (connState.isConnected) {
        newStatus = 'connected';
        message = t('tracking.status.connected');
        
        // Check if this specific tracking number is being tracked
        if (trackingNumber && connState.activeSubscriptions.includes(trackingNumber)) {
          message += ` - ${t('tracking.status.tracking', { number: trackingNumber })}`;
        }
      } else if (connState.connectionDetails?.isConnecting) {
        newStatus = 'connecting';
        message = t('tracking.status.connecting');
      } else if ((connState.connectionDetails?.reconnectAttempts ?? 0) >= 
                (connState.connectionDetails?.maxAttempts ?? 5)) {
        newStatus = 'failed';
        message = t('tracking.status.failed');
      } else {
        message = t('tracking.status.disconnected');
        const reconnectAttempts = connState.connectionDetails?.reconnectAttempts ?? 0;
        if (reconnectAttempts > 0) {
          message += ` - ${t('tracking.status.retrying', { 
            attempt: reconnectAttempts,
            max: connState.connectionDetails?.maxAttempts ?? 5
          })}`;
        }
      }
      
      setStatus(newStatus);
      setStatusMessage(message || connState.connectionDetails?.connectionStatus || '');
    };
    
    // Check immediately
    checkStatus();
    
    // And then set up interval
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [trackingNumber, t]);
  
  // Determine status icon
  const StatusIcon = useMemo(() => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Info className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: // 'disconnected'
        return <WifiOff className="h-4 w-4 text-amber-500" />;
    }
  }, [status]);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-2 text-xs rounded px-2 py-1",
              status === 'connected' && "bg-green-50 text-green-700 border border-green-200",
              status === 'connecting' && "bg-blue-50 text-blue-700 border border-blue-200",
              status === 'disconnected' && "bg-amber-50 text-amber-700 border border-amber-200",
              status === 'failed' && "bg-red-50 text-red-700 border border-red-200",
              className
            )}
          >
            {StatusIcon}
            <span>{t(`tracking.connection.${status}`, {
              // Fallback values in case translations aren't loaded yet
              defaultValue: status === 'connected' ? 'Connected' :
                           status === 'connecting' ? 'Connecting...' :
                           status === 'failed' ? 'Connection Failed' : 'Disconnected'
            })}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusMessage || 'Tracking connection status'}</p>
          {status !== 'connected' && (
            <p className="mt-1 text-xs opacity-80">{t('tracking.status.fallback', {
              defaultValue: 'Fallback data is being used while disconnected'
            })}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TrackingStatusIndicator;