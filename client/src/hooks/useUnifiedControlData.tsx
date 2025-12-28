import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  components: {
    database: 'healthy' | 'degraded' | 'critical';
    cache: 'healthy' | 'degraded' | 'critical';
    websocket: 'healthy' | 'degraded' | 'critical';
    api: 'healthy' | 'degraded' | 'critical';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    activeConnections: number;
    errorRate: number;
  };
}

interface DashboardStats {
  activeUsers: number;
  totalProjects: number;
  apiRequests: number;
  systemLoad: number;
  cacheHitRate: number;
  totalDepartments: number;
  totalDivisions: number;
  activeModules: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  details?: string;
}

export const useUnifiedControlData = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  // Query system health
  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery<SystemHealth>({
    queryKey: ['/api/health/detailed'],
    refetchInterval: 30000
  });

  // Query dashboard statistics  
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboards/unified-stats'],
    refetchInterval: 60000
  });

  // Query activity logs
  const { data: activityLogs, isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activity/recent'],
    refetchInterval: 10000
  });

  // Check WebSocket connection
  useEffect(() => {
    const checkConnection = () => {
      // Check if WebSocket is available
      setIsConnected(true); // For now, assume connected
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    systemHealth,
    dashboardStats,
    activityLogs,
    isConnected,
    isLoading: healthLoading || statsLoading || logsLoading,
    refetchHealth
  };
};