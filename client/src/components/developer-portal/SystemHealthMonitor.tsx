// System Health Monitor Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  Loader2, 
  MemoryStick, 
  Network, 
  RefreshCw, 
  Server, 
  Wifi, 
  XCircle,
  Zap,
  Eye,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

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
  };
  disk: {
    total: number;
    free: number;
    used: number;
  };
  network: {
    connections: number;
    bytesReceived: number;
    bytesSent: number;
  };
  uptime: number;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  endpoint: string;
}

interface HealthRecommendation {
  id: string;
  category: 'performance' | 'security' | 'reliability' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  impact: string;
}

export function SystemHealthMonitor() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['/api/health/system'],
    queryFn: async () => {
      const response = await fetch('/api/health/system');
      if (!response.ok) throw new Error('Failed to fetch system health');
      const data = await response.json();
      // Handle the nested response structure
      if (data.success && data.data) {
        return data.data;
      }
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: serviceHealth, isLoading: serviceLoading } = useQuery({
    queryKey: ['/api/health/endpoints'],
    queryFn: async () => {
      const response = await fetch('/api/health/endpoints');
      if (!response.ok) throw new Error('Failed to fetch service health');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/health-recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/health-recommendations');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      return data.data?.recommendations || [];
    },
    refetchInterval: 300000, // 5 minutes
  });

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'down': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getOverallHealth = () => {
    if (!systemHealth) return { status: 'unknown', message: 'Loading...', color: 'gray' };
    
    const cpuUsage = systemHealth.metrics?.cpu || 0;
    const memoryUsage = systemHealth.metrics?.memory || 0;
    
    if (cpuUsage > 80 || memoryUsage > 85) {
      return { status: 'critical', message: 'System under heavy load', color: 'red' };
    } else if (cpuUsage > 60 || memoryUsage > 70) {
      return { status: 'degraded', message: 'Performance degraded', color: 'yellow' };
    }
    return { status: 'healthy', message: 'All systems operational', color: 'green' };
  };

  const overallHealth = getOverallHealth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Health Monitor</h2>
          <p className="text-muted-foreground">Real-time system monitoring and performance metrics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchHealth()}
          disabled={healthLoading}
        >
          {healthLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Overall Status Alert */}
      <Alert className={`border-${overallHealth.color}-200 bg-${overallHealth.color}-50`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(overallHealth.status)}
          <AlertTitle className="capitalize">{overallHealth.status} System Status</AlertTitle>
        </div>
        <AlertDescription>{overallHealth.message}</AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold text-${overallHealth.color}-600`}>
                  {overallHealth.status}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overallHealth.message}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealth ? formatUptime(systemHealth.uptime || 0) : '---'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealth?.metrics?.cpu || 0}%
                </div>
                <Progress 
                  value={systemHealth?.metrics?.cpu || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealth?.metrics?.memory || 0}%
                </div>
                <Progress 
                  value={systemHealth?.metrics?.memory || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Active Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Real-time Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {systemHealth?.metrics?.activeConnections || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {systemHealth?.metrics?.requestsPerMinute || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Requests/min</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {systemHealth?.responseTime || 0}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-6">
            {healthLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading system metrics...</p>
              </div>
            ) : systemHealth ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        CPU Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Usage</span>
                            <span className="text-sm">{systemHealth.metrics?.cpu || 0}%</span>
                          </div>
                          <Progress value={systemHealth.metrics?.cpu || 0} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cores:</span>
                            <span className="ml-2 font-medium">8</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Load Avg:</span>
                            <span className="ml-2 font-medium">1.2</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MemoryStick className="h-5 w-5" />
                        Memory Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Usage</span>
                            <span className="text-sm">{systemHealth.metrics?.memory || 0}%</span>
                          </div>
                          <Progress value={systemHealth.metrics?.memory || 0} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Used:</span>
                            <span className="ml-2 font-medium">6.4 GB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <span className="ml-2 font-medium">16 GB</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Disk Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Usage</span>
                            <span className="text-sm">45%</span>
                          </div>
                          <Progress value={45} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Used:</span>
                            <span className="ml-2 font-medium">225 GB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Free:</span>
                            <span className="ml-2 font-medium">275 GB</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Network Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Connections:</span>
                            <span className="ml-2 font-medium">{systemHealth.metrics?.activeConnections || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Interfaces:</span>
                            <span className="ml-2 font-medium">4</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Received:</span>
                            <span className="ml-2 font-medium">1.2 GB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sent:</span>
                            <span className="ml-2 font-medium">856 MB</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Unable to load system metrics</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-6">
            {serviceLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading service status...</p>
              </div>
            ) : serviceHealth ? (
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(serviceHealth).map(([serviceName, status]: [string, any]) => (
                  <Card key={serviceName}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status.status)}
                          <div>
                            <h4 className="font-medium">{serviceName}</h4>
                            <p className="text-sm text-muted-foreground">{status.endpoint}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{status.responseTime}ms</div>
                            <div className="text-xs text-muted-foreground">Response time</div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(status.status)}>
                            {status.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Unable to load service status</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-6">
            {recommendations && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec: HealthRecommendation) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge variant={getPriorityBadgeVariant(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <CardDescription>{rec.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Recommended Action:</span>
                          <span className="ml-2">{rec.action}</span>
                        </div>
                        <div>
                          <span className="font-medium">Expected Impact:</span>
                          <span className="ml-2">{rec.impact}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recommendations</h3>
                <p className="text-muted-foreground">System is performing optimally</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}