import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  X,
  Bell
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  location?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read?: boolean;
}

interface AlertNotificationsProps {
  source: 'supply-chain' | 'investment' | 'general';
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  autoFetch?: boolean;
  fetchInterval?: number;
}

export default function AlertNotifications({
  source,
  position = 'bottom-right',
  autoFetch = true,
  fetchInterval = 30000
}: AlertNotificationsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!autoFetch) return;

    const fetchAlerts = async () => {
      try {
        let endpoint = '';
        switch (source) {
          case 'supply-chain':
            endpoint = '/api/supply-chain/alerts';
            break;
          case 'investment':
            endpoint = '/api/investment/alerts';
            break;
          default:
            endpoint = '/api/alerts';
        }

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const newAlerts = data.filter((alert: Alert) => !alert.read);
          
          // Show toast for critical alerts
          newAlerts.forEach((alert: Alert) => {
            if (alert.severity === 'critical' || alert.severity === 'high') {
              showNotification(alert);
            }
          });

          setAlerts(data);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching alerts:', error);
        }
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, fetchInterval);

    return () => clearInterval(interval);
  }, [source, autoFetch, fetchInterval]);

  const showNotification = (alert: Alert) => {
    toast({
      title: alert.title,
      description: alert.description,
      variant: alert.type === 'danger' ? 'destructive' : 'default',
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <>
      {/* Alert Bell Indicator */}
      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className={`fixed ${positionClasses[position]} z-50`}
          onClick={() => setIsVisible(!isVisible)}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          </div>
        </Button>
      )}

      {/* Alert Panel */}
      {isVisible && alerts.length > 0 && (
        <Card className={`fixed ${positionClasses[position]} z-40 w-96 max-h-96 overflow-hidden shadow-lg`}>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-semibold">Alerts</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {alerts.slice(0, 10).map(alert => (
              <div
                key={alert.id}
                className={`p-4 border-b last:border-0 ${
                  !alert.read ? 'bg-accent/20' : ''
                } hover:bg-accent/10 transition-colors cursor-pointer`}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{alert.title}</p>
                      {alert.severity && (
                        <Badge 
                          variant={getSeverityBadgeVariant(alert.severity)}
                          className="text-xs"
                        >
                          {alert.severity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                    {alert.location && (
                      <p className="text-xs text-muted-foreground">
                        📍 {alert.location}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}