import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
// WebSocket disabled for stability in health monitoring

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  totalEndpoints: number;
  healthyEndpoints: number;
  degradedEndpoints: number;
  unhealthyEndpoints: number;
  averageResponseTime: number;
  lastUpdated: string;
}

interface WorkspaceMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  uptime: number;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  endpoint?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: string;
}

interface HealthCheckResult {
  id: string;
  endpoint: string;
  name: string;
  type: 'core' | 'module' | 'system' | 'external';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  lastChecked: string;
}

interface UseHealthMonitoringOptions {
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  enableAlertNotifications?: boolean;
  alertThreshold?: number;
}

export function useHealthMonitoring(options: UseHealthMonitoringOptions = {}) {
  const {
    refreshInterval = 10000,
    enableRealTimeUpdates = true,
    enableAlertNotifications = true,
    alertThreshold = 80
  } = options;

  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const alertsRef = useRef<HealthAlert[]>([]);
  
  useEffect(() => {
    setWsConnected(false);
  }, []);

  // Polling-based updates instead of WebSocket for development stability
  useEffect(() => {
    if (!enableRealTimeUpdates) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/health'] });
      queryClient.invalidateQueries({ queryKey: ['/api/health/workspace-metrics'] });
    }, refreshInterval * 2);

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, queryClient, refreshInterval]);

  // Query for system health
  const {
    data: systemHealth,
    isLoading: healthLoading,
    isError: healthError,
    refetch: refetchHealth
  } = useQuery<SystemHealth>({
    queryKey: ['/api/health'],
    refetchInterval: enableRealTimeUpdates ? refreshInterval : false,
    refetchIntervalInBackground: true,
  });

  // Query for workspace metrics
  const {
    data: workspaceMetrics,
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics
  } = useQuery<WorkspaceMetrics>({
    queryKey: ['/api/health/workspace-metrics'],
    refetchInterval: enableRealTimeUpdates ? refreshInterval : false,
    refetchIntervalInBackground: true,
  });

  // Query for health check results
  const {
    data: healthResults,
    isLoading: resultsLoading,
    isError: resultsError,
    refetch: refetchResults
  } = useQuery<HealthCheckResult[]>({
    queryKey: ['/api/health/endpoints'],
    refetchInterval: enableRealTimeUpdates ? refreshInterval * 2 : false, // Less frequent
  });

  // Query for alerts
  const {
    data: alertsData,
    isLoading: alertsLoading,
    refetch: refetchAlerts
  } = useQuery<HealthAlert[]>({
    queryKey: ['/api/health/alerts'],
    refetchInterval: enableRealTimeUpdates ? refreshInterval : false,
  });

  // Handle alerts data updates
  useEffect(() => {
    if (alertsData) {
      setAlerts(alertsData.filter(alert => !alert.resolved));
      alertsRef.current = alertsData;
    }
  }, [alertsData]);

  // Query for metrics history
  const {
    data: metricsHistory,
    isLoading: historyLoading
  } = useQuery({
    queryKey: ['/api/health/metrics-history'],
    refetchInterval: 60000, // Update every minute
  });

  // Manual refresh function
  const refreshAll = async () => {
    await Promise.all([
      refetchHealth(),
      refetchMetrics(),
      refetchResults(),
      refetchAlerts()
    ]);
  };

  // Calculate derived metrics
  const healthScore = systemHealth 
    ? (systemHealth.healthyEndpoints / systemHealth.totalEndpoints) * 100 
    : 0;

  const isHealthy = systemHealth?.overall === 'healthy';
  const isDegraded = systemHealth?.overall === 'degraded';
  const isUnhealthy = systemHealth?.overall === 'unhealthy';

  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'critical' && !alert.resolved
  );
  
  const hasAlerts = alerts.length > 0;
  const hasCriticalAlerts = criticalAlerts.length > 0;

  // Performance indicators
  const performanceStatus = workspaceMetrics ? {
    cpu: workspaceMetrics.cpuUsage > alertThreshold ? 'high' : 'normal',
    memory: workspaceMetrics.memoryUsage > alertThreshold ? 'high' : 'normal',
    errorRate: workspaceMetrics.errorRate > 5 ? 'high' : 'normal',
    latency: workspaceMetrics.networkLatency > 1000 ? 'high' : 'normal'
  } : null;

  // Mark alert as resolved
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Request browser notification permission
  useEffect(() => {
    if (enableAlertNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [enableAlertNotifications]);

  return {
    // Data
    systemHealth,
    workspaceMetrics,
    healthResults,
    alerts,
    metricsHistory,
    
    // Loading states
    isLoading: healthLoading || metricsLoading,
    healthLoading,
    metricsLoading,
    resultsLoading,
    alertsLoading,
    historyLoading,
    
    // Error states
    hasErrors: healthError || metricsError || resultsError,
    healthError,
    metricsError,
    resultsError,
    
    // Connection status
    isConnected: wsConnected,
    
    // Derived states
    healthScore,
    isHealthy,
    isDegraded,
    isUnhealthy,
    hasAlerts,
    hasCriticalAlerts,
    criticalAlerts,
    performanceStatus,
    
    // Actions
    refreshAll,
    refetchHealth,
    refetchMetrics,
    refetchResults,
    refetchAlerts,
    resolveAlert,
    clearAllAlerts,
  };
}

export default useHealthMonitoring;