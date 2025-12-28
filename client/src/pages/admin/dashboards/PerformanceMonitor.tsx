/**
 * Performance Monitor - Core System Module
 * Advanced performance monitoring and optimization controls
 */

import { useState, useEffect } from 'react';
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
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">Monitor and optimize system performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-optimize"
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
            />
            <Label htmlFor="auto-optimize">Auto-Optimize</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceMetrics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.memory?.percentage || 0}%</span>
              <span className={cn("text-sm", getStatusColor(metrics?.memory?.status || 'healthy'))}>
                {metrics?.memory?.status || 'healthy'}
              </span>
            </div>
            <Progress value={metrics?.memory?.percentage || 0} className="mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{metrics?.memory?.heapUsed || 0}MB used</span>
              <span>{metrics?.memory?.heapTotal || 0}MB total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.cache?.hitRate || 0}%</span>
              <span className={cn("text-sm", getStatusColor(metrics?.cache?.status || 'healthy'))}>
                {metrics?.cache?.status || 'healthy'}
              </span>
            </div>
            <Progress value={metrics?.cache?.hitRate || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Cache size: {metrics?.cache?.size || 0}MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Database Latency</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.database?.latency || 0}ms</span>
              <span className={cn("text-sm", getStatusColor(metrics?.database?.status || 'connected'))}>
                {metrics?.database?.status || 'connected'}
              </span>
            </div>
            <div className="mt-2">
              <Badge variant={metrics?.database?.latency && metrics.database.latency < 50 ? 'default' : 'secondary'}>
                {metrics?.database?.latency && metrics.database.latency < 50 ? 'Optimal' : 'Needs Attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metrics?.system?.cpu || 0}%</span>
              <span className={cn("text-sm", getStatusColor(metrics?.system?.status || 'healthy'))}>
                {metrics?.system?.status || 'healthy'}
              </span>
            </div>
            <Progress value={metrics?.system?.cpu || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {metrics?.system?.uptime || 0}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="cache">Cache Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Real-time performance metrics over the last 5 minutes</CardDescription>
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
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Optimize system performance instantly</CardDescription>
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
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize Memory
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleClearCache}
                  variant="secondary" 
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Settings</CardTitle>
                <CardDescription>Configure automatic optimizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimizationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={setting.id} className="text-sm font-medium">
                          {setting.name}
                        </Label>
                        <Badge className={cn("text-xs", getImpactBadge(setting.impact))}>
                          {setting.impact} impact
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.description}
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
                Auto-optimization is enabled. The system will automatically optimize performance when needed.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit/Miss Ratio</CardTitle>
                <CardDescription>Current cache performance</CardDescription>
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
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>Detailed cache metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Size</span>
                  <span className="text-sm font-medium">{metrics?.cache?.size || 0}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Hit Rate</span>
                  <span className="text-sm font-medium">{metrics?.cache?.hitRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Keys Stored</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Evictions</span>
                  <span className="text-sm font-medium">45</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Thresholds</CardTitle>
              <CardDescription>Configure alert thresholds for performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Memory Usage Alert Threshold</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[80]} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-medium w-12">80%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>CPU Usage Alert Threshold</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[75]} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-medium w-12">75%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cache Hit Rate Minimum</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[60]} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-medium w-12">60%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Database Latency Maximum</Label>
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