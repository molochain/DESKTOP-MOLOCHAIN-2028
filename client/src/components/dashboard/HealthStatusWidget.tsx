import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  totalEndpoints: number;
  healthyEndpoints: number;
  degradedEndpoints: number;
  unhealthyEndpoints: number;
  averageResponseTime: number;
  lastUpdated: string;
}

export function HealthStatusWidget() {
  const { data: systemHealth, isLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/health'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getHealthProgress = () => {
    if (!systemHealth) return 0;
    return (systemHealth.healthyEndpoints / systemHealth.totalEndpoints) * 100;
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <Card>
              <CardHeader>
            <Activity className="h-5 w-5" />
            System Health
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
              <CardHeader>
          <Activity className="h-5 w-5" />
          System Health
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {systemHealth && getStatusIcon(systemHealth.overall)}
            <span className="font-medium capitalize">
              {systemHealth?.overall || 'Unknown'}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={systemHealth ? getStatusColor(systemHealth.overall) : 'text-gray-400'}
          >
            {systemHealth?.overall || 'Unknown'}
          </Badge>
        </div>

        {/* Health Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Healthy Endpoints</span>
            <span>{systemHealth?.healthyEndpoints || 0}/{systemHealth?.totalEndpoints || 0}</span>
          </div>
          <Progress value={getHealthProgress()} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-gray-600 dark:text-gray-400">Avg Response</span>
            </div>
            <div className="font-medium">
              {systemHealth ? formatResponseTime(systemHealth.averageResponseTime) : 'N/A'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600 dark:text-gray-400">Last Updated</div>
            <div className="font-medium text-xs">
              {systemHealth ? 
                new Date(systemHealth.lastUpdated).toLocaleTimeString() : 
                'Never'
              }
            </div>
          </div>
        </div>

        {/* Status Summary */}
        {systemHealth && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-green-600 font-medium">{systemHealth.healthyEndpoints}</div>
              <div className="text-gray-600 dark:text-gray-400">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-medium">{systemHealth.degradedEndpoints}</div>
              <div className="text-gray-600 dark:text-gray-400">Degraded</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-medium">{systemHealth.unhealthyEndpoints}</div>
              <div className="text-gray-600 dark:text-gray-400">Unhealthy</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}