import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LatestMetrics } from '@/types/dashboard';

interface SystemPerformanceProps {
  className?: string;
}

export function SystemPerformance({ className }: SystemPerformanceProps) {
  const { data: metrics, isLoading, error } = useQuery<LatestMetrics>({
    queryKey: ['/api/metrics/latest'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mock chart data - in real app, this would come from the API
  const chartData = [
    { time: '00:00', cpu: 45, memory: 62, network: 28 },
    { time: '01:00', cpu: 52, memory: 58, network: 35 },
    { time: '02:00', cpu: 48, memory: 65, network: 42 },
    { time: '03:00', cpu: 61, memory: 72, network: 38 },
    { time: '04:00', cpu: 55, memory: 68, network: 45 },
    { time: '05:00', cpu: 49, memory: 63, network: 32 },
    { time: '06:00', cpu: 58, memory: 70, network: 48 },
    { time: '07:00', cpu: 44, memory: 59, network: 29 },
    { time: '08:00', cpu: 67, memory: 75, network: 52 },
    { time: '09:00', cpu: 53, memory: 66, network: 36 },
    { time: '10:00', cpu: 47, memory: 61, network: 41 },
    { time: '11:00', cpu: 59, memory: 69, network: 33 },
  ];

  if (isLoading) {
    return (
      <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle>System Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle>System Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400">Error loading performance data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricStatus = (value: number) => {
    if (value < 50) return { color: 'text-green-500', status: 'Good' };
    if (value < 80) return { color: 'text-yellow-500', status: 'Warning' };
    return { color: 'text-red-500', status: 'Critical' };
  };

  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle>System Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#4CAF50" 
                strokeWidth={2}
                name="CPU Usage (%)"
                dot={{ fill: '#4CAF50', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#2196F3" 
                strokeWidth={2}
                name="Memory Usage (%)"
                dot={{ fill: '#2196F3', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="network" 
                stroke="#FF9800" 
                strokeWidth={2}
                name="Network I/O (%)"
                dot={{ fill: '#FF9800', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {metrics && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
              </div>
              <div className="mt-2">
                <span className={`text-lg font-bold ${getMetricStatus(metrics.cpuUsage).color}`}>
                  {metrics.cpuUsage.toFixed(1)}%
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {getMetricStatus(metrics.cpuUsage).status}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
              </div>
              <div className="mt-2">
                <span className={`text-lg font-bold ${getMetricStatus(metrics.memoryUsage).color}`}>
                  {metrics.memoryUsage.toFixed(1)}%
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {getMetricStatus(metrics.memoryUsage).status}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Network I/O</span>
              </div>
              <div className="mt-2">
                <span className={`text-lg font-bold ${getMetricStatus(metrics.networkIO).color}`}>
                  {metrics.networkIO.toFixed(1)}%
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {getMetricStatus(metrics.networkIO).status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Response Time</span>
            <span className="text-sm font-bold text-green-500">31ms avg</span>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            System is performing optimally
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
