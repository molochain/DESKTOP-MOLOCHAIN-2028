import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, HardDrive, Activity, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface SystemMonitorWidgetProps {
  refreshInterval?: number;
  className?: string;
}

export function SystemMonitorWidget({ 
  refreshInterval = 5000,
  className = '' 
}: SystemMonitorWidgetProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  });

  // Simulate fetching system metrics
  const fetchMetrics = async () => {
    // In a real app, this would fetch from an API endpoint
    // For now, we'll simulate with random values
    setMetrics({
      cpu: Math.floor(Math.random() * 40) + 10,
      memory: Math.floor(Math.random() * 30) + 40,
      disk: Math.floor(Math.random() * 20) + 60,
      network: Math.floor(Math.random() * 50) + 20
    });
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-500';
    if (value < 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">System Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU Usage */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className={`h-4 w-4 ${getStatusColor(metrics.cpu)}`} />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.cpu)}`}>
              {metrics.cpu}%
            </span>
          </div>
          <Progress 
            value={metrics.cpu} 
            className="h-2"
            data-testid="progress-cpu"
          />
        </motion.div>

        {/* Memory Usage */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${getStatusColor(metrics.memory)}`} />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.memory)}`}>
              {metrics.memory}%
            </span>
          </div>
          <Progress 
            value={metrics.memory} 
            className="h-2"
            data-testid="progress-memory"
          />
        </motion.div>

        {/* Disk Usage */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className={`h-4 w-4 ${getStatusColor(metrics.disk)}`} />
              <span className="text-sm font-medium">Disk</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.disk)}`}>
              {metrics.disk}%
            </span>
          </div>
          <Progress 
            value={metrics.disk} 
            className="h-2"
            data-testid="progress-disk"
          />
        </motion.div>

        {/* Network Usage */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${getStatusColor(metrics.network)}`} />
              <span className="text-sm font-medium">Network</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(metrics.network)}`}>
              {metrics.network}%
            </span>
          </div>
          <Progress 
            value={metrics.network} 
            className="h-2"
            data-testid="progress-network"
          />
        </motion.div>

        {/* Status Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Health</span>
            <span className={`font-medium ${
              Math.max(metrics.cpu, metrics.memory, metrics.disk) < 75 
                ? 'text-green-500' 
                : 'text-yellow-500'
            }`}>
              {Math.max(metrics.cpu, metrics.memory, metrics.disk) < 75 ? 'Good' : 'Moderate'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}