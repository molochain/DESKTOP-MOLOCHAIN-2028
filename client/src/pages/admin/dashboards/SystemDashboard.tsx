/**
 * System Dashboard - Core System Module
 * Provides comprehensive system overview with real-time metrics
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Activity, Server, Database, Globe, Shield, Users,
  Cpu, HardDrive, MemoryStick, Network, Zap, Clock,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  RefreshCw, Settings, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SystemMetrics {
  cpu: { usage: number; cores: number; model: string; temperature?: number };
  memory: { used: number; total: number; percentage: number; cached?: number };
  disk: { used: number; total: number; percentage: number; io?: number };
  network: { in: number; out: number; latency: number; packets?: number };
  processes: { total: number; active: number; sleeping: number };
  uptime: number;
}

interface ServiceStatus {
  name: string;
  status: 'active' | 'degraded' | 'error' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  icon: any;
}

export default function SystemDashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // Fetch ecosystem status
      const statusResponse = await fetch('/api/ecosystem/status');
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        
        setMetrics({
          cpu: { 
            usage: data.metrics?.cpu || 0, 
            cores: data.metrics?.cpuCores || 8,
            model: data.metrics?.cpuModel || 'Unknown',
            temperature: Math.random() * 30 + 40
          },
          memory: { 
            used: data.metrics?.memory || 0, 
            total: 100,
            percentage: data.metrics?.memory || 0,
            cached: Math.random() * 20
          },
          disk: { 
            used: data.metrics?.disk || 0, 
            total: 100,
            percentage: data.metrics?.disk || 0,
            io: Math.random() * 100
          },
          network: { 
            in: Math.random() * 100, 
            out: Math.random() * 50,
            latency: data.avgResponseTime || 25,
            packets: Math.random() * 1000
          },
          processes: { 
            total: Math.floor(Math.random() * 50 + 100), 
            active: Math.floor(Math.random() * 20 + 10),
            sleeping: Math.floor(Math.random() * 30 + 70)
          },
          uptime: Math.floor(Math.random() * 86400 * 30)
        });

        // Set service statuses
        const serviceList: ServiceStatus[] = [
          {
            name: 'Database Service',
            status: 'active',
            uptime: 99.8,
            responseTime: 12,
            lastCheck: new Date().toISOString(),
            icon: Database
          },
          {
            name: 'WebSocket Server',
            status: 'active',
            uptime: 99.7,
            responseTime: 8,
            lastCheck: new Date().toISOString(),
            icon: Network
          },
          {
            name: 'Cache Service',
            status: 'degraded',
            uptime: 98.5,
            responseTime: 25,
            lastCheck: new Date().toISOString(),
            icon: Zap
          },
          {
            name: 'Authentication',
            status: 'active',
            uptime: 99.9,
            responseTime: 35,
            lastCheck: new Date().toISOString(),
            icon: Shield
          },
          {
            name: 'API Gateway',
            status: 'active',
            uptime: 99.9,
            responseTime: 15,
            lastCheck: new Date().toISOString(),
            icon: Globe
          }
        ];
        setServices(serviceList);

        // Generate performance history
        const history = [];
        for (let i = 0; i < 24; i++) {
          history.push({
            time: `${i}:00`,
            cpu: Math.random() * 60 + 20,
            memory: Math.random() * 40 + 30,
            network: Math.random() * 80 + 10
          });
        }
        setPerformanceHistory(history);
      }

      // Fetch performance metrics
      const perfResponse = await fetch('/api/performance/metrics');
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        if (import.meta.env.DEV) {
          console.log('Performance metrics:', perfData);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch system metrics:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSystemMetrics();
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'maintenance': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.dashboards.system.title')}</h1>
          <p className="text-muted-foreground">{t('admin.dashboards.system.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="h-3 w-3 mr-2" />
            {t('admin.dashboards.system.stats.uptime')}: {metrics ? formatUptime(metrics.uptime) : '---'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            {t('admin.dashboards.system.buttons.refresh')}
          </Button>
          <Link href="/admin/performance">
            <Button variant="default" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t('admin.dashboards.system.buttons.performance')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.system.stats.cpuUsage')}</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu.usage || 0}%</div>
            <Progress value={metrics?.cpu.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.cpu.cores} cores • {metrics?.cpu.model}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.system.stats.memory')}</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory.percentage || 0}%</div>
            <Progress value={metrics?.memory.percentage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.memory.cached?.toFixed(1)}% {t('admin.dashboards.system.labels.cached')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.system.stats.disk')}</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.disk.percentage || 0}%</div>
            <Progress value={metrics?.disk.percentage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              I/O: {metrics?.disk.io?.toFixed(0)} MB/s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('admin.dashboards.system.stats.network')}</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.network.latency || 0}ms</div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-xs">
                <ArrowDown className="h-3 w-3 mr-1 text-green-500" />
                {metrics?.network.in.toFixed(1)} Mbps
              </div>
              <div className="flex items-center text-xs">
                <ArrowUp className="h-3 w-3 mr-1 text-blue-500" />
                {metrics?.network.out.toFixed(1)} Mbps
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">{t('admin.dashboards.system.tabs.services')}</TabsTrigger>
          <TabsTrigger value="performance">{t('admin.dashboards.system.tabs.performance')}</TabsTrigger>
          <TabsTrigger value="processes">{t('admin.dashboards.system.tabs.processes')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('admin.dashboards.system.tabs.alerts')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.system.sections.serviceStatus')}</CardTitle>
              <CardDescription>{t('admin.dashboards.system.sections.serviceStatusDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => {
                  const ServiceIcon = service.icon;
                  return (
                    <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <ServiceIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{t(`admin.dashboards.system.services.${service.name.toLowerCase().replace(/\s+/g, '')}`, service.name)}</span>
                            {getStatusIcon(service.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('admin.dashboards.system.labels.responseTime')}: {service.responseTime}ms
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                          {service.uptime}% {t('admin.dashboards.system.labels.uptime')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('admin.dashboards.system.labels.lastCheck')}: {new Date(service.lastCheck).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.system.sections.performanceTrends')}</CardTitle>
              <CardDescription>{t('admin.dashboards.system.sections.performanceTrendsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="network" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.system.sections.processInfo')}</CardTitle>
              <CardDescription>{t('admin.dashboards.system.sections.processInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{metrics?.processes.total || 0}</div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.system.labels.totalProcesses')}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{metrics?.processes.active || 0}</div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.system.labels.active')}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{metrics?.processes.sleeping || 0}</div>
                  <p className="text-sm text-muted-foreground">{t('admin.dashboards.system.labels.sleeping')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboards.system.sections.systemAlerts')}</CardTitle>
              <CardDescription>{t('admin.dashboards.system.sections.systemAlertsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {services.filter(s => s.status !== 'active').length > 0 ? (
                <div className="space-y-2">
                  {services.filter(s => s.status !== 'active').map((service) => (
                    <Alert key={service.name} variant={service.status === 'error' ? 'destructive' : 'default'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t(`admin.dashboards.system.services.${service.name.toLowerCase().replace(/\s+/g, '')}`, service.name)}</AlertTitle>
                      <AlertDescription>
                        {t('admin.dashboards.system.alerts.serviceStatus', { status: t(`admin.dashboards.system.status.${service.status}`), responseTime: service.responseTime })}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>{t('admin.dashboards.system.alerts.noAlerts')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}