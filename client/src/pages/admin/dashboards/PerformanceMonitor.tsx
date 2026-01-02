/**
 * Performance Monitor - Core System Module
 * Advanced performance monitoring and optimization controls
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, TrendingUp, Cpu, HardDrive, Activity, AlertCircle,
  CheckCircle, XCircle, RefreshCw, Download, Upload, 
  Clock, Gauge, Settings, PlayCircle, PauseCircle, Trash2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  memory: {
    heapUsed: number;
    heapTotal: number;
    percentage: number;
    external: number;
    rss: number;
    status: string;
  };
  cache: {
    hitRate: number;
    size: number;
    status: string;
  };
  database: {
    latency: number;
    status: string;
  };
  system: {
    cpu: number;
    uptime: number;
    status: string;
  };
}

interface OptimizationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  impact: 'low' | 'medium' | 'high';
  category: string;
}

export default function PerformanceMonitor() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [cacheMetrics, setCacheMetrics] = useState<any[]>([]);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSetting[]>([
    {
      id: 'memory-gc',
      name: 'Automatic Garbage Collection',
      description: 'Automatically trigger GC when memory usage is high',
      enabled: true,
      impact: 'high',
      category: 'memory'
    },
    {
      id: 'cache-warm',
      name: 'Cache Warming',
      description: 'Pre-load frequently accessed data into cache',
      enabled: true,
      impact: 'medium',
      category: 'cache'
    },
    {
      id: 'query-opt',
      name: 'Query Optimization',
      description: 'Optimize database queries automatically',
      enabled: true,
      impact: 'high',
      category: 'database'
    },
    {
      id: 'compress',
      name: 'Response Compression',
      description: 'Compress API responses for faster transmission',
      enabled: false,
      impact: 'low',
      category: 'network'
    }
  ]);

  useEffect(() => {
    fetchPerformanceMetrics();
    const interval = setInterval(fetchPerformanceMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/performance/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        
        // Update performance history
        setPerformanceHistory(prev => {
          const newEntry = {
            time: new Date().toLocaleTimeString(),
            memory: data.memory?.percentage || 0,
            cache: data.cache?.hitRate || 0,
            cpu: data.system?.cpu || 0
          };
          const updated = [...prev, newEntry].slice(-30);
          return updated;
        });

        // Update cache metrics
        setCacheMetrics([
          { name: 'Hits', value: 85, fill: '#10b981' },
          { name: 'Misses', value: 15, fill: '#ef4444' }
        ]);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch performance metrics:', error);
      }
    }
  };

  const handleOptimizeMemory = async () => {
    setOptimizing(true);
    try {
      const response = await fetch('/api/performance/optimize/memory', {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        if (import.meta.env.DEV) {
          console.log('Memory optimization result:', result);
        }
        fetchPerformanceMetrics();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Memory optimization failed:', error);
      }
    } finally {
      setTimeout(() => setOptimizing(false), 2000);
    }
  };

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/performance/optimize/cache', {
        method: 'POST'
      });
      if (response.ok) {
        if (import.meta.env.DEV) {
          console.log('Cache cleared successfully');
        }
        fetchPerformanceMetrics();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  const toggleOptimizationSetting = (id: string) => {
    setOptimizationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.dashboards.performance.title')}</h1>
          <p className="text-muted-foreground">{t('admin.dashboards.performance.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-optimize"
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
            />
            <Label htmlFor="auto-optimize">{t('admin.dashboards.performance.switches.autoOptimize')}</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceMetrics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.dashboards.performance.buttons.refresh')}
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.performance.sections.memoryStatus')}</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.memory?.percentage || 0}%</span>
              <span className={cn("text-sm", getStatusColor(metrics?.memory?.status || 'healthy'))}>
                {t(`admin.dashboards.performance.status.${metrics?.memory?.status || 'healthy'}`)}
              </span>
            </div>
            <Progress value={metrics?.memory?.percentage || 0} className="mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{metrics?.memory?.heapUsed || 0}MB {t('admin.dashboards.performance.labels.used')}</span>
              <span>{metrics?.memory?.heapTotal || 0}MB {t('admin.dashboards.performance.labels.total')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.performance.labels.hitRate')}</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.cache?.hitRate || 0}%</span>
              <span className={cn("text-sm", getStatusColor(metrics?.cache?.status || 'healthy'))}>
                {t(`admin.dashboards.performance.status.${metrics?.cache?.status || 'healthy'}`)}
              </span>
            </div>
            <Progress value={metrics?.cache?.hitRate || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t('admin.dashboards.performance.labels.cacheSize')}: {metrics?.cache?.size || 0}MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.performance.sections.databasePerformance')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.database?.latency || 0}ms</span>
              <span className={cn("text-sm", getStatusColor(metrics?.database?.status || 'connected'))}>
                {t(`admin.dashboards.performance.status.${metrics?.database?.status || 'connected'}`)}
              </span>
            </div>
            <div className="mt-2">
              <Badge variant={metrics?.database?.latency && metrics.database.latency < 50 ? 'default' : 'secondary'}>
                {metrics?.database?.latency && metrics.database.latency < 50 ? t('admin.dashboards.performance.status.optimal') : t('admin.dashboards.performance.status.needsAttention')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.performance.labels.cpuUsage')}</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.system?.cpu || 0}%</span>
              <span className={cn("text-sm", getStatusColor(metrics?.system?.status || 'healthy'))}>
                {t(`admin.dashboards.performance.status.${metrics?.system?.status || 'healthy'}`)}
              </span>
            </div>
            <Progress value={metrics?.system?.cpu || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t('admin.dashboards.performance.labels.uptime')}: {metrics?.system?.uptime || 0}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">{t('admin.dashboards.performance.tabs.realtime')}</TabsTrigger>
          <TabsTrigger value="optimization">{t('admin.dashboards.performance.tabs.optimization')}</TabsTrigger>
          <TabsTrigger value="cache">{t('admin.dashboards.performance.tabs.cache')}</TabsTrigger>
          <TabsTrigger value="settings">{t('admin.dashboards.performance.tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.performance.sections.performanceTrends')}</CardTitle>
              <CardDescription>{t('admin.dashboards.performance.sections.performanceTrendsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="memory" stroke="#8884d8" name="Memory %" />
                  <Line type="monotone" dataKey="cache" stroke="#82ca9d" name="Cache Hit %" />
                  <Line type="monotone" dataKey="cpu" stroke="#ffc658" name="CPU %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.dashboards.performance.sections.quickActions')}</CardTitle>
                <CardDescription>{t('admin.dashboards.performance.sections.quickActionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleOptimizeMemory} 
                  disabled={optimizing}
                  className="w-full"
                >
                  {optimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('admin.dashboards.performance.buttons.optimizing')}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      {t('admin.dashboards.performance.buttons.optimizeMemory')}
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleClearCache}
                  variant="secondary" 
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('admin.dashboards.performance.buttons.clearCache')}
                </Button>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('admin.dashboards.performance.buttons.runDiagnostics')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.dashboards.performance.sections.optimizationSettings')}</CardTitle>
                <CardDescription>{t('admin.dashboards.performance.sections.optimizationSettingsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimizationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={setting.id} className="text-sm font-medium">
                          {t(`admin.dashboards.performance.settings.${setting.id.replace('-', '')}`)}
                        </Label>
                        <Badge className={cn("text-xs", getImpactBadge(setting.impact))}>
                          {t(`admin.dashboards.performance.impact.${setting.impact}`)} {t('admin.dashboards.performance.labels.impact')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t(`admin.dashboards.performance.settingsDesc.${setting.id.replace('-', '')}`)}
                      </p>
                    </div>
                    <Switch
                      id={setting.id}
                      checked={setting.enabled}
                      onCheckedChange={() => toggleOptimizationSetting(setting.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {autoOptimize && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('admin.dashboards.performance.alerts.autoOptimizeEnabled')}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.dashboards.performance.sections.cachePerformance')}</CardTitle>
                <CardDescription>{t('admin.dashboards.performance.sections.cachePerformanceDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={cacheMetrics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cacheMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.dashboards.performance.sections.cacheStatistics')}</CardTitle>
                <CardDescription>{t('admin.dashboards.performance.sections.cacheStatisticsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{t('admin.dashboards.performance.labels.totalSize')}</span>
                  <span className="text-sm font-medium">{metrics?.cache?.size || 0}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{t('admin.dashboards.performance.labels.hitRate')}</span>
                  <span className="text-sm font-medium">{metrics?.cache?.hitRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{t('admin.dashboards.performance.labels.keysStored')}</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{t('admin.dashboards.performance.labels.evictions')}</span>
                  <span className="text-sm font-medium">45</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.performance.sections.performanceThresholds')}</CardTitle>
              <CardDescription>{t('admin.dashboards.performance.sections.performanceThresholdsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('admin.dashboards.performance.thresholds.memoryUsage')}</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[80]} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-medium w-12">80%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.dashboards.performance.thresholds.cpuUsage')}</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[75]} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-medium w-12">75%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.dashboards.performance.thresholds.cacheHitRate')}</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[60]} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-medium w-12">60%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.dashboards.performance.thresholds.databaseLatency')}</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[100]} max={500} step={10} className="flex-1" />
                  <span className="text-sm font-medium w-12">100ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}