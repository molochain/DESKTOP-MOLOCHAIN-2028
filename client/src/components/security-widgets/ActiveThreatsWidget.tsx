import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Shield,
  UserX,
  Activity,
  Database,
  Globe,
  Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';

interface ActiveThreat {
  id: string;
  type: 'brute_force' | 'unusual_access' | 'privilege_escalation' | 'data_exfiltration' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  status: 'active' | 'mitigated' | 'investigating';
  detectedAt: Date;
  attempts?: number;
  description: string;
}

interface ActiveThreatsWidgetProps {
  className?: string;
  refreshInterval?: number;
  onThreatClick?: (threat: ActiveThreat) => void;
  maxItems?: number;
  fullView?: boolean;
}

export default function ActiveThreatsWidget({
  className,
  refreshInterval = 10000,
  onThreatClick,
  maxItems = 5,
  fullView = false
}: ActiveThreatsWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [threats, setThreats] = useState<ActiveThreat[]>([]);
  const { subscribe } = useWebSocket();

  const { data: initialThreats, refetch } = useQuery<ActiveThreat[]>({
    queryKey: ['/api/security/threats/active'],
    refetchInterval: refreshInterval
  });

  useEffect(() => {
    if (initialThreats) {
      setThreats(initialThreats);
    }
  }, [initialThreats]);

  useEffect(() => {
    const unsubscribe = subscribe('security.threats', (data) => {
      if (data.type === 'threat_detected') {
        setThreats(prev => [data.threat, ...prev].slice(0, 20));
      } else if (data.type === 'threat_mitigated') {
        setThreats(prev => 
          prev.map(t => t.id === data.threatId ? { ...t, status: 'mitigated' } : t)
        );
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Lock className="h-4 w-4" />;
      case 'unusual_access': return <Activity className="h-4 w-4" />;
      case 'privilege_escalation': return <UserX className="h-4 w-4" />;
      case 'data_exfiltration': return <Database className="h-4 w-4" />;
      case 'suspicious_activity': return <Globe className="h-4 w-4" />;
      default: return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const activeThreats = threats.filter(t => t.status === 'active');
  const criticalCount = activeThreats.filter(t => t.severity === 'critical').length;
  const highCount = activeThreats.filter(t => t.severity === 'high').length;

  return (
    <Card className={cn('h-full', className)} data-testid="widget-active-threats">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle>Active Threats</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {(criticalCount > 0 || highCount > 0) && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount + highCount} Critical
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8"
              data-testid="button-refresh-threats"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {activeThreats.length} active threat{activeThreats.length !== 1 && 's'} detected
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeThreats.length > 0 ? (
          <ScrollArea className={fullView ? 'h-96' : 'h-64'}>
            <div className="space-y-2">
              {activeThreats.slice(0, fullView ? undefined : maxItems).map((threat) => (
                <div
                  key={threat.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    'hover:bg-accent/50',
                    threat.severity === 'critical' && 'border-destructive/50 bg-destructive/5'
                  )}
                  onClick={() => onThreatClick?.(threat)}
                  data-testid={`threat-item-${threat.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getThreatIcon(threat.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium line-clamp-1">
                            {threat.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{threat.source}</span>
                          <span>→</span>
                          <span>{threat.target}</span>
                        </div>
                        {threat.attempts && (
                          <p className="text-xs text-muted-foreground">
                            {threat.attempts} attempt{threat.attempts !== 1 && 's'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(threat.detectedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {threat.status === 'investigating' && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                      <span className="text-xs text-yellow-600">Investigating...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              No active threats detected. System is secure.
            </AlertDescription>
          </Alert>
        )}

        {/* View All Button */}
        {!fullView && activeThreats.length > maxItems && (
          <Button 
            variant="outline" 
            className="w-full mt-3"
            onClick={() => onThreatClick?.(activeThreats[0])}
            data-testid="button-view-all-threats"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Threats ({activeThreats.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}