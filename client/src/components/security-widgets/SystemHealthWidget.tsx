import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Activity, 
  RefreshCw, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Server,
  Database,
  Shield,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  errorRate: number;
  details?: string;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    latency: number;
    packetLoss: number;
    bandwidth: number;
  };
}

interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealth[];
  metrics: SystemMetrics;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}

interface SystemHealthWidgetProps {
  className?: string;
  refreshInterval?: number;
  onServiceClick?: (service: ServiceHealth) => void;
  fullView?: boolean;
}

const serviceIcons: Record<string, React.ReactNode> = {
  'Authentication': <Shield className="h-4 w-4" />,
  'Database': <Database className="h-4 w-4" />,
  'API Gateway': <Server className="h-4 w-4" />,
  'Cache': <HardDrive className="h-4 w-4" />,
  'WebSocket': <Wifi className="h-4 w-4" />,
  'Monitoring': <Activity className="h-4 w-4" />
};

export default function SystemHealthWidget({
  className,
  refreshInterval = 10000,
  onServiceClick,
  fullView = false
}: SystemHealthWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const { subscribe } = useWebSocket();

  const { data: systemHealth, refetch } = useQuery<SystemHealth>({
    queryKey: ['/api/security/system-health'],
    refetchInterval: refreshInterval
  });

  useEffect(() => {
    if (systemHealth) {
      setHealth(systemHealth);
    }
  }, [systemHealth]);

  useEffect(() => {
    const unsubscribe = subscribe('system.health', (data) => {
      if (data.type === 'health_update') {
        setHealth(data.health);
      } else if (data.type === 'service_alert') {
        // Update specific service status
        setHealth(prev => {
          if (!prev) return prev;
          const services = prev.services.map(s => 
            s.name === data.service ? { ...s, status: data.status } : s
          );
          return { ...prev, services };
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
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' ? 'success' : 
                   status === 'degraded' ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  const healthyServices = health?.services.filter(s => s.status === 'healthy').length || 0;
  const totalServices = health?.services.length || 0;

  return (
    <Card className={cn('h-full', className)} data-testid="widget-system-health">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle>System Health</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {health && getStatusBadge(health.overallStatus)}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              data-testid="button-refresh-health"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {healthyServices}/{totalServices} services operational
        </CardDescription>
      </CardHeader>
      <CardContent>
        {health ? (
          <div className="space-y-4">
            {/* Services Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Services</span>
                <span className="text-muted-foreground">
                  {Math.round((healthyServices / totalServices) * 100)}% healthy
                </span>
              </div>
              <div className="space-y-2">
                {health.services.slice(0, fullView ? undefined : 5).map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer transition-all"
                    onClick={() => onServiceClick?.(service)}
                    data-testid={`service-item-${service.name}`}
                  >
                    <div className="flex items-center gap-2">
                      {serviceIcons[service.name] || <Server className="h-4 w-4" />}
                      <span className="text-sm">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {service.responseTime}ms
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.uptime.toFixed(1)}% uptime
                        </p>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Metrics */}
            {fullView && (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-sm font-medium">System Resources</h4>
                
                {/* CPU Usage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-3 w-3" />
                      CPU Usage
                    </span>
                    <span className="font-medium">{health.metrics.cpu.usage}%</span>
                  </div>
                  <Progress value={health.metrics.cpu.usage} className="h-2" />
                </div>

                {/* Memory Usage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3" />
                      Memory
                    </span>
                    <span className="font-medium">
                      {(health.metrics.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB / 
                      {(health.metrics.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB
                    </span>
                  </div>
                  <Progress value={health.metrics.memory.percentage} className="h-2" />
                </div>

                {/* Disk Usage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      Disk Space
                    </span>
                    <span className="font-medium">
                      {(health.metrics.disk.used / 1024 / 1024 / 1024).toFixed(1)}GB / 
                      {(health.metrics.disk.total / 1024 / 1024 / 1024).toFixed(1)}GB
                    </span>
                  </div>
                  <Progress value={health.metrics.disk.percentage} className="h-2" />
                </div>

                {/* Network */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">Latency</p>
                    <p className="font-medium">{health.metrics.network.latency}ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Packet Loss</p>
                    <p className="font-medium">{health.metrics.network.packetLoss}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Bandwidth</p>
                    <p className="font-medium">{health.metrics.network.bandwidth}Mbps</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {health.alerts.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                {health.alerts.slice(0, 2).map((alert, index) => (
                  <Alert 
                    key={index}
                    className={cn(
                      'py-2',
                      alert.severity === 'error' && 'border-red-200 bg-red-50',
                      alert.severity === 'warning' && 'border-yellow-200 bg-yellow-50'
                    )}
                  >
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      {alert.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* All Healthy Alert */}
            {health.overallStatus === 'healthy' && health.alerts.length === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All systems operational. No issues detected.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading system health...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}