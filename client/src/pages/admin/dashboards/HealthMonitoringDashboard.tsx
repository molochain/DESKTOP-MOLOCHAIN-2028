import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Database, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network, 
  RefreshCw,
  Server,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Line, LineChart, Bar, BarChart, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SystemMetrics {
  cpu: {
    usage: number;
    loadAvg: number[];
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    freePercentage: number;
    swapUsage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
  };
  network: {
    connections: number;
    bytesReceived: number;
    bytesSent: number;
    activeInterfaces: number;
  };
  uptime: number;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  metrics: {
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

interface CacheMetrics {
  name: string;
  hitRate: number;
  hits: number;
  misses: number;
  keys: number;
  size: number;
  totalOperations: number;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  databaseLatency: number;
  systemMetrics: SystemMetrics;
  servicesStatus: Record<string, ServiceStatus>;
  cacheMetrics: CacheMetrics[];
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

export default function HealthMonitoringDashboard() {
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch health data
  const { data: healthData, isLoading, error, refetch } = useQuery<HealthData>({
    queryKey: ['/api/health/detailed'],
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Performance history data (mock for now)
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);

  useEffect(() => {
    if (healthData) {
      setPerformanceHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          cpu: healthData.systemMetrics.cpu.usage,
          memory: 100 - healthData.systemMetrics.memory.freePercentage,
          cacheHitRate: healthData.cacheMetrics.reduce((acc, c) => acc + c.hitRate, 0) / healthData.cacheMetrics.length,
        };
        const updated = [...prev, newPoint].slice(-20); // Keep last 20 points
        return updated;
      });
    }
  }, [healthData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Default data if API is not available
  const defaultHealthData: HealthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    databaseLatency: 45,
    systemMetrics: {
      cpu: { usage: 35, loadAvg: [1.2, 1.5, 1.8], cores: 8 },
      memory: { used: 4294967296, total: 8589934592, freePercentage: 50, swapUsage: 0 },
      disk: { used: 10737418240, total: 107374182400, free: 96636764160 },
      network: { connections: 42, bytesReceived: 1024000, bytesSent: 2048000, activeInterfaces: 2 },
      uptime: 86400,
    },
    servicesStatus: {
      'API': { name: 'API', status: 'healthy', responseTime: 25, lastCheck: new Date().toISOString(), metrics: { successRate: 99.9, averageResponseTime: 25, errorRate: 0.1 } },
      'Database': { name: 'Database', status: 'healthy', responseTime: 15, lastCheck: new Date().toISOString(), metrics: { successRate: 100, averageResponseTime: 15, errorRate: 0 } },
      'Cache': { name: 'Cache', status: 'degraded', responseTime: 5, lastCheck: new Date().toISOString(), metrics: { successRate: 85, averageResponseTime: 5, errorRate: 15 } },
    },
    cacheMetrics: [
      { name: 'database', hitRate: 0, hits: 0, misses: 100, keys: 10, size: 1024, totalOperations: 100 },
      { name: 'api', hitRate: 0, hits: 0, misses: 50, keys: 5, size: 512, totalOperations: 50 },
      { name: 'session', hitRate: 0, hits: 0, misses: 20, keys: 2, size: 256, totalOperations: 20 },
    ],
    alerts: [],
  };

  const data = healthData || defaultHealthData;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            {t('admin.dashboards.health.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('admin.dashboards.health.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('admin.dashboards.health.buttons.autoRefresh')}</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="toggle"
            />
          </div>
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('admin.dashboards.health.buttons.refresh')}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('admin.dashboards.health.sections.overallStatus')}</span>
            {getStatusIcon(data.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Database className={`w-8 h-8 ${getStatusColor(data.status)}`} />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.databaseLatency')}</p>
                <p className="text-xl font-bold">{data.databaseLatency}ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.resources.cpuUsage')}</p>
                <p className="text-xl font-bold">{data.systemMetrics.cpu.usage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MemoryStick className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.resources.memory')}</p>
                <p className="text-xl font-bold">{(100 - data.systemMetrics.memory.freePercentage).toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.uptime')}</p>
                <p className="text-xl font-bold">{Math.floor(data.systemMetrics.uptime / 3600)}h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">{t('admin.dashboards.health.tabs.metrics')}</TabsTrigger>
          <TabsTrigger value="services">{t('admin.dashboards.health.tabs.services')}</TabsTrigger>
          <TabsTrigger value="cache">{t('admin.dashboards.health.tabs.cache')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('admin.dashboards.health.tabs.alerts')}</TabsTrigger>
        </TabsList>

        {/* System Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CPU & Memory Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.dashboards.health.sections.performanceTrends')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#8b5cf6" name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.dashboards.health.sections.resourceUsage')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{t('admin.dashboards.health.resources.cpuUsage')}</span>
                    <span className="text-sm font-medium">{data.systemMetrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.systemMetrics.cpu.usage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{t('admin.dashboards.health.resources.memory')}</span>
                    <span className="text-sm font-medium">{(100 - data.systemMetrics.memory.freePercentage).toFixed(1)}%</span>
                  </div>
                  <Progress value={100 - data.systemMetrics.memory.freePercentage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{t('admin.dashboards.health.resources.disk')}</span>
                    <span className="text-sm font-medium">
                      {((data.systemMetrics.disk.used / data.systemMetrics.disk.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(data.systemMetrics.disk.used / data.systemMetrics.disk.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                {t('admin.dashboards.health.sections.networkStatistics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.resources.networkConnections')}</p>
                  <p className="text-2xl font-bold">{data.systemMetrics.network.connections}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.dataReceived')}</p>
                  <p className="text-2xl font-bold">{(data.systemMetrics.network.bytesReceived / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.dataSent')}</p>
                  <p className="text-2xl font-bold">{(data.systemMetrics.network.bytesSent / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.activeInterfaces')}</p>
                  <p className="text-2xl font-bold">{data.systemMetrics.network.activeInterfaces}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(data.servicesStatus).map(service => (
              <Card key={service.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{service.name}</span>
                    {getStatusIcon(service.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.responseTime')}</span>
                      <span className="text-sm font-medium">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.successRate')}</span>
                      <span className="text-sm font-medium">{service.metrics.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('admin.dashboards.health.labels.errorRate')}</span>
                      <span className="text-sm font-medium">{service.metrics.errorRate}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('admin.dashboards.health.labels.lastCheck')}: {new Date(service.lastCheck).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cache Performance Tab */}
        <TabsContent value="cache" className="space-y-4">
          <Alert className="mb-4">
            <Zap className="w-4 h-4" />
            <AlertTitle>{t('admin.dashboards.health.alerts.cachePerformance')}</AlertTitle>
            <AlertDescription>
              {t('admin.dashboards.health.alerts.cachePerformanceDesc')}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.cacheMetrics.map(cache => (
              <Card key={cache.name}>
                <CardHeader>
                  <CardTitle className="capitalize">{cache.name} {t('admin.dashboards.health.labels.cache')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{t('admin.dashboards.health.labels.hitRate')}</span>
                        <span className={`text-sm font-medium ${cache.hitRate < 50 ? 'text-red-500' : cache.hitRate < 85 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {cache.hitRate}%
                        </span>
                      </div>
                      <Progress value={cache.hitRate} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t('admin.dashboards.health.labels.hits')}</p>
                        <p className="font-medium">{cache.hits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('admin.dashboards.health.labels.misses')}</p>
                        <p className="font-medium">{cache.misses}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('admin.dashboards.health.labels.keys')}</p>
                        <p className="font-medium">{cache.keys}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t('admin.dashboards.health.labels.size')}</p>
                        <p className="font-medium">{(cache.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cache Hit Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.health.sections.cacheHitRateTrend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cacheHitRate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Hit Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {data.alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">{t('admin.dashboards.health.alerts.noAlerts')}</p>
                <p className="text-sm text-muted-foreground">{t('admin.dashboards.health.alerts.allSystemsOperational')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {data.alerts.map(alert => (
                <Alert key={alert.id} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle className="capitalize">{t(`admin.dashboards.health.severity.${alert.severity}`)} {t('admin.dashboards.health.labels.alert')}</AlertTitle>
                  <AlertDescription>
                    <p>{alert.message}</p>
                    <p className="text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}