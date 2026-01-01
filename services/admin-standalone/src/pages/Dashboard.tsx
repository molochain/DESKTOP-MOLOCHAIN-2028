import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';
import { getSystemMetrics, getContainers } from '@/lib/api';

interface Container {
  name: string;
  status: string;
  health: 'healthy' | 'unhealthy' | 'none';
  ports: string;
}

const CATEGORY_FILTERS = [
  { key: 'core', label: 'Core Services', color: 'bg-blue-500', filter: (c: Container) => 
    c.name.startsWith('molochain-core') || c.name.startsWith('molochain-admin') || c.name.startsWith('molochain-app') ||
    c.name.startsWith('molochain-user') || c.name.startsWith('molochain-company') || c.name === 'auth-service'
  },
  { key: 'rayanava', label: 'Rayanava AI', color: 'bg-purple-500', filter: (c: Container) => 
    c.name.startsWith('rayanava-')
  },
  { key: 'infrastructure', label: 'Infrastructure', color: 'bg-green-500', filter: (c: Container) => 
    c.name.includes('postgres') || c.name.includes('redis') || c.name.includes('kong') ||
    c.name.includes('loki') || c.name.includes('promtail') || c.name.includes('alertmanager') ||
    c.name.includes('portainer') || c.name.includes('pgadmin') || c.name.includes('backup')
  },
  { key: 'cms', label: 'CMS Laravel', color: 'bg-orange-500', filter: (c: Container) => 
    c.name.includes('cms')
  },
  { key: 'communications', label: 'Communications', color: 'bg-pink-500', filter: (c: Container) => 
    c.name.includes('communications') || c.name.includes('comms')
  },
  { key: 'workflow', label: 'Workflows', color: 'bg-cyan-500', filter: (c: Container) => 
    c.name.includes('workflow') || c.name.includes('orchestrator')
  },
];

export function Dashboard() {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/admin/microservices/system-metrics'],
    queryFn: getSystemMetrics,
    refetchInterval: 30000,
  });

  const { data: containersData, isLoading: containersLoading, refetch: refetchContainers } = useQuery({
    queryKey: ['/api/admin/microservices/containers'],
    queryFn: getContainers,
    refetchInterval: 30000,
  });

  const allContainers: Container[] = useMemo(() => {
    if (!containersData) return [];
    if (Array.isArray(containersData)) return containersData;
    if (Array.isArray(containersData?.containers)) return containersData.containers;
    if (Array.isArray(containersData?.data)) return containersData.data;
    return [];
  }, [containersData]);

  const stats = useMemo(() => {
    if (allContainers.length === 0) {
      return { total: 0, healthy: 0, unhealthy: 0, noHealthcheck: 0 };
    }
    return {
      total: allContainers.length,
      healthy: allContainers.filter((c) => c.health === 'healthy').length,
      unhealthy: allContainers.filter((c) => c.health === 'unhealthy').length,
      noHealthcheck: allContainers.filter((c) => c.health === 'none' || !c.health).length,
    };
  }, [allContainers]);

  const categoryCounts = useMemo(() => {
    return CATEGORY_FILTERS.map((cat) => ({
      ...cat,
      count: allContainers.filter(cat.filter).length,
    }));
  }, [allContainers]);

  const handleRefresh = () => {
    refetchMetrics();
    refetchContainers();
  };

  const isLoading = metricsLoading || containersLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time overview of all Molochain services
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            data-testid="btn-refresh-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock size={16} />
            <span>Auto-refresh: 30s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Containers"
          value={stats.total}
          subtitle="Across all services"
          icon={Server}
          color="blue"
        />
        <StatCard
          title="Healthy"
          value={stats.healthy}
          subtitle={stats.total > 0 ? `${((stats.healthy / stats.total) * 100).toFixed(0)}% of total` : 'N/A'}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Unhealthy"
          value={stats.unhealthy}
          subtitle="Requires attention"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="No Healthcheck"
          value={stats.noHealthcheck}
          subtitle="Monitoring disabled"
          icon={AlertTriangle}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            System Resources
          </h2>
          {metricsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu size={18} className="text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">CPU Usage</span>
                  </div>
                  <ProgressBar value={metrics?.cpu || 0} size="lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MemoryStick size={18} className="text-purple-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Memory</span>
                  </div>
                  <ProgressBar value={metrics?.memory?.percent || 0} size="lg" />
                  <p className="text-xs text-slate-500 mt-1">
                    {metrics?.memory?.used || '0 GB'} / {metrics?.memory?.total || '0 GB'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive size={18} className="text-green-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Disk Usage</span>
                  </div>
                  <ProgressBar value={metrics?.disk?.percent || 0} size="lg" />
                  <p className="text-xs text-slate-500 mt-1">
                    {metrics?.disk?.used || '0 GB'} / {metrics?.disk?.total || '0 GB'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={18} className="text-orange-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Load Average</span>
                  </div>
                  <div className="flex gap-4">
                    {(metrics?.loadAverage || [0, 0, 0]).map((load: number, i: number) => (
                      <div key={i} className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {typeof load === 'number' ? load.toFixed(2) : '0.00'}
                        </p>
                        <p className="text-xs text-slate-500">{['1m', '5m', '15m'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Service Categories
          </h2>
          {containersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryCounts.map((cat) => (
                <div
                  key={cat.key}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Server Uptime</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {metrics?.uptime || 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
