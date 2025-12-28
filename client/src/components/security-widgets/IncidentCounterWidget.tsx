import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Siren, 
  AlertTriangle, 
  Info, 
  Shield,
  RefreshCw,
  ChevronRight,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

interface IncidentStats {
  total: number;
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byType: Record<string, number>;
  averageResolutionTime: number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  recentIncidents: Array<{
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: string;
    createdAt: Date;
  }>;
}

interface IncidentCounterWidgetProps {
  className?: string;
  refreshInterval?: number;
  onIncidentClick?: (incidentId: string) => void;
  onViewAll?: () => void;
  fullView?: boolean;
}

export default function IncidentCounterWidget({
  className,
  refreshInterval = 30000,
  onIncidentClick,
  onViewAll,
  fullView = false
}: IncidentCounterWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incidentStats, setIncidentStats] = useState<IncidentStats | null>(null);
  const { subscribe } = useWebSocket();

  const { data: stats, refetch } = useQuery<IncidentStats>({
    queryKey: ['/api/security/incidents/stats'],
    refetchInterval: refreshInterval
  });

  useEffect(() => {
    if (stats) {
      setIncidentStats(stats);
    }
  }, [stats]);

  useEffect(() => {
    const unsubscribe = subscribe('security.incidents', (data) => {
      if (data.type === 'incident_created' && incidentStats) {
        setIncidentStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            total: prev.total + 1,
            open: prev.open + 1,
            bySeverity: {
              ...prev.bySeverity,
              [data.incident.severity]: prev.bySeverity[data.incident.severity] + 1
            }
          };
        });
      } else if (data.type === 'incident_updated' && incidentStats) {
        // Update incident status
        refetch();
      }
    });

    return unsubscribe;
  }, [subscribe, incidentStats, refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: string): any => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-500';
      case 'investigating': return 'text-yellow-500';
      case 'contained': return 'text-blue-500';
      case 'resolved': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const criticalIncidents = incidentStats?.bySeverity.critical || 0;
  const highIncidents = incidentStats?.bySeverity.high || 0;
  const urgentCount = criticalIncidents + highIncidents;

  return (
    <Card className={cn('h-full', className)} data-testid="widget-incident-counter">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Siren className="h-5 w-5 text-destructive" />
            <CardTitle>Incidents</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {urgentCount} Urgent
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              data-testid="button-refresh-incidents"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {incidentStats?.open || 0} open incident{incidentStats?.open !== 1 && 's'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {incidentStats ? (
          <div className="space-y-4">
            {/* Severity Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">By Severity</span>
                <span className="text-muted-foreground">Total: {incidentStats.total}</span>
              </div>
              <div className="space-y-2">
                {Object.entries(incidentStats.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        getSeverityColor(severity)
                      )}
                    />
                    <span className="text-xs capitalize w-16">{severity}</span>
                    <Progress 
                      value={incidentStats.total > 0 ? (count / incidentStats.total) * 100 : 0} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs font-medium w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Open</p>
                <p className={cn('text-lg font-semibold', getStatusColor('open'))}>
                  {incidentStats.open}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Investigating</p>
                <p className={cn('text-lg font-semibold', getStatusColor('investigating'))}>
                  {incidentStats.investigating}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Contained</p>
                <p className={cn('text-lg font-semibold', getStatusColor('contained'))}>
                  {incidentStats.contained}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className={cn('text-lg font-semibold', getStatusColor('resolved'))}>
                  {incidentStats.resolved}
                </p>
              </div>
            </div>

            {/* Resolution Time */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Avg Resolution</span>
              </div>
              <span className="text-sm font-medium">
                {incidentStats.averageResolutionTime} hours
              </span>
            </div>

            {/* Trend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">30d Trend</span>
                {incidentStats.trend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : incidentStats.trend.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="text-xs">→</span>
                )}
              </div>
              <span className={cn(
                'text-sm font-medium',
                incidentStats.trend.direction === 'up' ? 'text-red-500' : 
                incidentStats.trend.direction === 'down' ? 'text-green-500' : 
                'text-gray-500'
              )}>
                {incidentStats.trend.direction === 'up' ? '+' : ''}
                {incidentStats.trend.percentage}%
              </span>
            </div>

            {/* Recent Incidents */}
            {fullView && incidentStats.recentIncidents.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                <h4 className="text-sm font-medium">Recent Incidents</h4>
                <div className="space-y-1">
                  {incidentStats.recentIncidents.slice(0, 3).map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer"
                      onClick={() => onIncidentClick?.(incident.id)}
                      data-testid={`incident-item-${incident.id}`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <span className="text-xs truncate">{incident.title}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View All Button */}
            {onViewAll && incidentStats.total > 0 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onViewAll}
                data-testid="button-view-all-incidents"
              >
                View All Incidents
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* No Incidents Alert */}
            {incidentStats.total === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  No active incidents. All systems operational.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading incident data...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}