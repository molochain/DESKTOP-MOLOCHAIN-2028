import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, RefreshCw, Zap, Database, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  timestamp: string;
  cache: {
    hitRate: string;
    keys: number;
    hits: number;
    misses: number;
    status: string;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
    status: string;
    growthRate: string;
    needsOptimization: boolean;
  };
  modules: {
    total: number;
    enabled: number;
    loaded: number;
    healthy: number;
    averageLoadTime: string;
    memoryUsageMB: number;
  };
}

export default function SystemPerformancePanel() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system/performance');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        throw new Error('Failed to fetch metrics');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching performance metrics:', error);
      }
      toast({
        title: "Error",
        description: "Failed to fetch system performance metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeSystem = async () => {
    setOptimizing(true);
    try {
      const response = await fetch('/api/admin/system/optimize', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Optimization Complete",
          description: `Freed ${result.optimization.memoryFreedMB}MB of memory. ${result.optimization.actions.length} optimization actions performed.`,
        });
        
        // Refresh metrics after optimization
        setTimeout(fetchMetrics, 2000);
      } else {
        throw new Error('Optimization failed');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error optimizing system:', error);
      }
      toast({
        title: "Error",
        description: "System optimization failed",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'degraded': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'critical':
      case 'degraded': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Failed to load performance metrics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Performance
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMetrics}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={optimizeSystem}
              disabled={optimizing}
            >
              <Zap className={`w-4 h-4 ${optimizing ? 'animate-pulse' : ''}`} />
              {optimizing ? 'Optimizing...' : 'Optimize'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cache Performance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="font-medium">Cache Performance</span>
            </div>
            <Badge variant={metrics.cache.status === 'healthy' ? 'default' : 'destructive'}>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.cache.status)}`}>
                {getStatusIcon(metrics.cache.status)}
                {metrics.cache.status}
              </div>
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Hit Rate</div>
              <div className="font-semibold text-lg">{metrics.cache.hitRate}</div>
              <Progress 
                value={parseFloat(metrics.cache.hitRate)} 
                className="h-2 mt-1"
              />
            </div>
            <div>
              <div className="text-gray-500">Total Keys</div>
              <div className="font-semibold text-lg">{metrics.cache.keys.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>Hits: {metrics.cache.hits.toLocaleString()}</div>
            <div>Misses: {metrics.cache.misses.toLocaleString()}</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span className="font-medium">Memory Usage</span>
            </div>
            <Badge variant={metrics.memory.status === 'healthy' ? 'default' : 'destructive'}>
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.memory.status)}`}>
                {getStatusIcon(metrics.memory.status)}
                {metrics.memory.status}
              </div>
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Heap Used</div>
              <div className="font-semibold text-lg">{metrics.memory.heapUsedMB}MB</div>
              <Progress 
                value={(metrics.memory.heapUsedMB / metrics.memory.heapTotalMB) * 100} 
                className="h-2 mt-1"
              />
            </div>
            <div>
              <div className="text-gray-500">Growth Rate</div>
              <div className="font-semibold text-lg">{metrics.memory.growthRate}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div>Total: {metrics.memory.heapTotalMB}MB</div>
            <div>RSS: {metrics.memory.rssMB}MB</div>
            <div>External: {metrics.memory.externalMB}MB</div>
          </div>
          
          {metrics.memory.needsOptimization && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4" />
                Memory optimization recommended
              </div>
            </div>
          )}
        </div>

        {/* Module Statistics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Module System</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Health Status</div>
              <div className="font-semibold text-lg">
                {metrics.modules.healthy}/{metrics.modules.enabled} Healthy
              </div>
              <Progress 
                value={(metrics.modules.healthy / metrics.modules.enabled) * 100} 
                className="h-2 mt-1"
              />
            </div>
            <div>
              <div className="text-gray-500">Avg Load Time</div>
              <div className="font-semibold text-lg">{metrics.modules.averageLoadTime}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div>Total: {metrics.modules.total}</div>
            <div>Loaded: {metrics.modules.loaded}</div>
            <div>Memory: {metrics.modules.memoryUsageMB}MB</div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 border-t pt-3">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}