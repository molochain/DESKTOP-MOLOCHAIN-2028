import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, Cpu, Database, HardDrive, Network, 
  Zap, AlertTriangle, TrendingUp, TrendingDown,
  RefreshCw, Download, Settings, Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MetricSnapshot {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  database: {
    activeConnections: number;
    queryTime: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    keys: number;
    memory: number;
  };
  websocket: {
    connections: number;
    messagesPerSecond: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PerformanceDashboard() {
  const [timeRange, setTimeRange] = useState('5m');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([]);
  const [currentMetric, setCurrentMetric] = useState<MetricSnapshot | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Fetch initial metrics
  const { data: historicalData, refetch } = useQuery({
    queryKey: ['/api/performance/metrics', timeRange],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/performance`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({ type: 'subscribe' }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'metrics') {
            setCurrentMetric(data.data);
            setMetrics(prev => {
              const updated = [...prev, data.data];
              // Keep only last 100 metrics
              return updated.slice(-100);
            });
          }
        } catch (error) {
          // Handle error silently
        }
      };
      
      wsRef.current.onerror = () => {
        toast({
          title: "Connection Issue",
          description: "Real-time updates may be delayed",
          variant: "destructive"
        });
      };
    } catch (error) {
      // Fallback to polling only
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (historicalData && Array.isArray(historicalData)) {
      setMetrics(historicalData);
    }
  }, [historicalData]);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  const cpuData = metrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm:ss'),
    usage: m.cpu.usage,
    load: m.cpu.loadAverage[0]
  }));

  const memoryData = metrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm:ss'),
    used: (m.memory.used / (1024 * 1024 * 1024)).toFixed(2),
    percentage: m.memory.percentage
  }));

  const apiData = metrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm:ss'),
    rpm: m.api.requestsPerMinute,
    responseTime: m.api.averageResponseTime,
    errorRate: m.api.errorRate
  }));

  const databaseData = metrics.map(m => ({
    time: format(new Date(m.timestamp), 'HH:mm:ss'),
    connections: m.database.activeConnections,
    queryTime: m.database.queryTime,
    slowQueries: m.database.slowQueries
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Real-time system monitoring and metrics</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">Last 5 min</SelectItem>
              <SelectItem value="15m">Last 15 min</SelectItem>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="icon"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {currentMetric && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getStatusColor(currentMetric.cpu.usage, { good: 50, warning: 75 })}>
                  {currentMetric.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <Progress value={currentMetric.cpu.usage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Load: {currentMetric.cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={getStatusColor(currentMetric.memory.percentage, { good: 60, warning: 80 })}>
                  {currentMetric.memory.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={currentMetric.memory.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(currentMetric.memory.used)} / {formatBytes(currentMetric.memory.total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="h-4 w-4" />
                API Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetric.api.requestsPerMinute} <span className="text-sm">rpm</span>
              </div>
              <div className="flex justify-between mt-2">
                <Badge variant={currentMetric.api.errorRate > 1 ? 'destructive' : 'secondary'}>
                  {currentMetric.api.errorRate.toFixed(1)}% errors
                </Badge>
                <Badge variant="outline">
                  {currentMetric.api.averageResponseTime.toFixed(0)}ms
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentMetric.api.activeConnections} active connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetric.database.activeConnections} <span className="text-sm">connections</span>
              </div>
              <div className="flex justify-between mt-2">
                <Badge variant={currentMetric.database.slowQueries > 5 ? 'destructive' : 'secondary'}>
                  {currentMetric.database.slowQueries} slow
                </Badge>
                <Badge variant="outline">
                  {currentMetric.database.queryTime.toFixed(1)}ms avg
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cache hit rate: {currentMetric.cache.hitRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Charts */}
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="usage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="load" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="percentage" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Rate & Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#8884d8" name="Requests/min" />
                    <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#82ca9d" name="Response (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={apiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="errorRate" stroke="#ff4444" fill="#ff4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={databaseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="connections" stroke="#8884d8" name="Connections" />
                  <Line yAxisId="right" type="monotone" dataKey="queryTime" stroke="#82ca9d" name="Query Time (ms)" />
                  <Line yAxisId="left" type="monotone" dataKey="slowQueries" stroke="#ff7300" name="Slow Queries" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          {currentMetric && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>WebSocket Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Connections</span>
                      <Badge variant="outline" className="text-lg">
                        {currentMetric.websocket.connections}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Messages/Second</span>
                      <Badge variant="outline" className="text-lg">
                        {currentMetric.websocket.messagesPerSecond.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Hit Rate</span>
                      <Badge 
                        variant={currentMetric.cache.hitRate > 80 ? 'default' : 'destructive'}
                        className="text-lg"
                      >
                        {currentMetric.cache.hitRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={currentMetric.cache.hitRate} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{currentMetric.cache.keys} keys</span>
                      <span>{(currentMetric.cache.memory / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Alerts Section */}
      {currentMetric && (
        <>
          {currentMetric.cpu.usage > 80 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High CPU usage detected: {currentMetric.cpu.usage.toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}
          {currentMetric.memory.percentage > 85 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High memory usage: {currentMetric.memory.percentage.toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}
          {currentMetric.api.errorRate > 5 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Elevated API error rate: {currentMetric.api.errorRate.toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}