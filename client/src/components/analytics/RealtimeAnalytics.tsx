import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  timestamp: string;
  value: number;
  label: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface RealtimeMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  data: AnalyticsData[];
  color: string;
  status: 'healthy' | 'warning' | 'critical';
}

const useRealtimeAnalytics = (metric: string) => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectEventSource = () => {
      try {
        eventSourceRef.current = new EventSource(`/api/analytics/stream/${metric}`);
        
        eventSourceRef.current.onopen = () => {
          setError(null);
          setIsLoading(false);
        };
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const newData = JSON.parse(event.data);
            setData(prevData => {
              const updatedData = [...prevData.slice(-99), newData];
              return updatedData;
            });
          } catch (parseError) {
            if (import.meta.env.DEV) {
              console.error('Error parsing analytics data:', parseError);
            }
          }
        };

        eventSourceRef.current.onerror = (error) => {
          if (import.meta.env.DEV) {
            console.error('EventSource error:', error);
          }
          setError('Connection lost. Reconnecting...');
          setTimeout(connectEventSource, 5000);
        };
      } catch (error) {
        setError('Failed to connect to analytics stream');
        setIsLoading(false);
      }
    };

    connectEventSource();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [metric]);

  return { data, isLoading, error };
};

const MetricCard = ({ metric }: { metric: RealtimeMetric }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(metric.status)}>
            {metric.status}
          </Badge>
          {getTrendIcon(metric.trend)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {metric.value.toLocaleString()} {metric.unit}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className={`font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
          </span>
          <span className="ml-1">from last hour</span>
        </div>
        <div className="mt-4 h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metric.data}>
              <defs>
                <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={metric.color}
                strokeWidth={2}
                fill={`url(#gradient-${metric.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const RealtimeAnalyticsDashboard = () => {
  const shipmentMetrics = useRealtimeAnalytics('shipments');
  const performanceMetrics = useRealtimeAnalytics('performance');
  const customerMetrics = useRealtimeAnalytics('customers');
  const systemMetrics = useRealtimeAnalytics('system');

  const [metrics, setMetrics] = useState<RealtimeMetric[]>([
    {
      id: 'active-shipments',
      title: 'Active Shipments',
      value: 0,
      unit: '',
      change: 0,
      trend: 'stable',
      data: [],
      color: '#3b82f6',
      status: 'healthy'
    },
    {
      id: 'delivery-performance',
      title: 'On-Time Delivery Rate',
      value: 0,
      unit: '%',
      change: 0,
      trend: 'stable',
      data: [],
      color: '#10b981',
      status: 'healthy'
    },
    {
      id: 'customer-satisfaction',
      title: 'Customer Satisfaction',
      value: 0,
      unit: '/5',
      change: 0,
      trend: 'stable',
      data: [],
      color: '#f59e0b',
      status: 'healthy'
    },
    {
      id: 'system-health',
      title: 'System Health Score',
      value: 0,
      unit: '%',
      change: 0,
      trend: 'stable',
      data: [],
      color: '#ef4444',
      status: 'healthy'
    }
  ]);

  useEffect(() => {
    // Update metrics based on real-time data
    setMetrics(prevMetrics => prevMetrics.map(metric => {
      let updatedMetric = { ...metric };
      
      switch (metric.id) {
        case 'active-shipments':
          if (shipmentMetrics.data.length > 0) {
            const latest = shipmentMetrics.data[shipmentMetrics.data.length - 1];
            updatedMetric.value = latest.value;
            updatedMetric.change = latest.change;
            updatedMetric.trend = latest.trend;
            updatedMetric.data = shipmentMetrics.data;
          }
          break;
        case 'delivery-performance':
          if (performanceMetrics.data.length > 0) {
            const latest = performanceMetrics.data[performanceMetrics.data.length - 1];
            updatedMetric.value = latest.value;
            updatedMetric.change = latest.change;
            updatedMetric.trend = latest.trend;
            updatedMetric.data = performanceMetrics.data;
            updatedMetric.status = latest.value >= 95 ? 'healthy' : latest.value >= 85 ? 'warning' : 'critical';
          }
          break;
        case 'customer-satisfaction':
          if (customerMetrics.data.length > 0) {
            const latest = customerMetrics.data[customerMetrics.data.length - 1];
            updatedMetric.value = latest.value;
            updatedMetric.change = latest.change;
            updatedMetric.trend = latest.trend;
            updatedMetric.data = customerMetrics.data;
            updatedMetric.status = latest.value >= 4.5 ? 'healthy' : latest.value >= 4.0 ? 'warning' : 'critical';
          }
          break;
        case 'system-health':
          if (systemMetrics.data.length > 0) {
            const latest = systemMetrics.data[systemMetrics.data.length - 1];
            updatedMetric.value = latest.value;
            updatedMetric.change = latest.change;
            updatedMetric.trend = latest.trend;
            updatedMetric.data = systemMetrics.data;
            updatedMetric.status = latest.value >= 95 ? 'healthy' : latest.value >= 85 ? 'warning' : 'critical';
          }
          break;
      }
      
      return updatedMetric;
    }));
  }, [shipmentMetrics.data, performanceMetrics.data, customerMetrics.data, systemMetrics.data]);

  const hasErrors = [shipmentMetrics, performanceMetrics, customerMetrics, systemMetrics]
    .some(metric => metric.error);

  if (hasErrors) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          <span>Unable to connect to real-time analytics. Please check your connection.</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Real-time Analytics</h2>
          <p className="text-muted-foreground">
            Live performance metrics and system monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Volume Trends</CardTitle>
            <CardDescription>
              Real-time shipment processing volume over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shipmentMetrics.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [value, 'Shipments']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>
              Delivery performance across different time periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceMetrics.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value}%`, 'On-Time Rate']}
                  />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtimeAnalyticsDashboard;