import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  UserX, 
  Shield, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Key,
  Smartphone,
  Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AuthStats {
  successRate: number;
  failureRate: number;
  totalAttempts: number;
  mfaAdoption: number;
  activeSessionsCount: number;
  averageLoginTime: number;
  recentAttempts: Array<{
    time: string;
    successful: number;
    failed: number;
  }>;
  byMethod: {
    password: number;
    mfa: number;
    sso: number;
    biometric: number;
  };
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface AuthenticationStatsWidgetProps {
  className?: string;
  refreshInterval?: number;
  onDetailsClick?: () => void;
  fullView?: boolean;
}

export default function AuthenticationStatsWidget({
  className,
  refreshInterval = 30000,
  onDetailsClick,
  fullView = false
}: AuthenticationStatsWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState<AuthStats | null>(null);
  const { subscribe } = useWebSocket();

  const { data: stats, refetch } = useQuery<AuthStats>({
    queryKey: ['/api/security/auth-stats'],
    refetchInterval: refreshInterval
  });

  useEffect(() => {
    if (stats) {
      setRealtimeStats(stats);
    }
  }, [stats]);

  useEffect(() => {
    const unsubscribe = subscribe('security.auth', (data) => {
      if (data.type === 'auth_attempt' && realtimeStats) {
        setRealtimeStats(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated.totalAttempts++;
          if (data.successful) {
            const newSuccessCount = Math.floor(prev.successRate * prev.totalAttempts / 100) + 1;
            updated.successRate = (newSuccessCount / updated.totalAttempts) * 100;
          } else {
            const newFailureCount = Math.floor(prev.failureRate * prev.totalAttempts / 100) + 1;
            updated.failureRate = (newFailureCount / updated.totalAttempts) * 100;
          }
          return updated;
        });
      }
    });

    return unsubscribe;
  }, [subscribe, realtimeStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const pieData = realtimeStats ? [
    { name: 'Success', value: realtimeStats.successRate, color: '#10b981' },
    { name: 'Failure', value: realtimeStats.failureRate, color: '#ef4444' }
  ] : [];

  const methodData = realtimeStats ? Object.entries(realtimeStats.byMethod).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    icon: key === 'mfa' ? '🔐' : key === 'sso' ? '🔗' : key === 'biometric' ? '👆' : '🔑'
  })) : [];

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  return (
    <Card className={cn('h-full', className)} data-testid="widget-auth-stats">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle>Authentication</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
            data-testid="button-refresh-auth"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        </div>
        <CardDescription>Login success rates and MFA adoption</CardDescription>
      </CardHeader>
      <CardContent>
        {realtimeStats ? (
          <div className="space-y-4">
            {/* Success Rate Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {realtimeStats.successRate.toFixed(1)}%
                </div>
                <Progress value={realtimeStats.successRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">MFA Adoption</span>
                  <Shield className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {realtimeStats.mfaAdoption.toFixed(1)}%
                </div>
                <Progress value={realtimeStats.mfaAdoption} className="h-2" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Attempts</p>
                <p className="text-lg font-semibold">{realtimeStats.totalAttempts.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Active Sessions</p>
                <p className="text-lg font-semibold">{realtimeStats.activeSessionsCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg Login Time</p>
                <p className="text-lg font-semibold">{realtimeStats.averageLoginTime}s</p>
              </div>
            </div>

            {fullView && (
              <Tabs defaultValue="chart" className="pt-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Trend</TabsTrigger>
                  <TabsTrigger value="methods">Methods</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="space-y-2">
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={realtimeStats.recentAttempts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="successful" 
                        stackId="1" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="failed" 
                        stackId="1" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="methods" className="space-y-2">
                  <div className="space-y-2">
                    {methodData.map((method) => (
                      <div key={method.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          <span className="text-sm">{method.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{method.value}</span>
                          <Progress value={method.value / realtimeStats.totalAttempts * 100} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Trends */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">24h:</span>
                  {getTrendIcon(realtimeStats.trends.daily)}
                  <span className={cn(
                    'font-medium',
                    realtimeStats.trends.daily > 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {Math.abs(realtimeStats.trends.daily)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">7d:</span>
                  {getTrendIcon(realtimeStats.trends.weekly)}
                  <span className={cn(
                    'font-medium',
                    realtimeStats.trends.weekly > 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {Math.abs(realtimeStats.trends.weekly)}%
                  </span>
                </div>
              </div>
              {onDetailsClick && (
                <Button variant="ghost" size="sm" onClick={onDetailsClick}>
                  View Details
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading authentication stats...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}