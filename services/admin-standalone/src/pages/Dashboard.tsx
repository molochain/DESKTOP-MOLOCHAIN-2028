import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Activity,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';
import { getSystemMetrics, getContainers } from '@/lib/api';

const SERVICE_CATEGORIES = [
  { key: 'core', label: 'Core Services', count: 6, color: 'bg-blue-500' },
  { key: 'rayanava', label: 'Rayanava AI', count: 24, color: 'bg-purple-500' },
  { key: 'infrastructure', label: 'Infrastructure', count: 13, color: 'bg-green-500' },
  { key: 'cms', label: 'CMS Laravel', count: 5, color: 'bg-orange-500' },
  { key: 'communications', label: 'Communications', count: 4, color: 'bg-pink-500' },
  { key: 'workflow', label: 'Workflows', count: 5, color: 'bg-cyan-500' },
];

export function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/microservices/system-metrics'],
    queryFn: getSystemMetrics,
    refetchInterval: 30000,
  });

  const { data: containers, isLoading: containersLoading } = useQuery({
    queryKey: ['/api/admin/microservices/containers'],
    queryFn: getContainers,
    refetchInterval: 30000,
  });

  const stats = containers?.stats || { total: 65, healthy: 52, unhealthy: 0, noHealthcheck: 13 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time overview of all Molochain services
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock size={16} />
          <span>Auto-refresh: 30s</span>
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
          subtitle={`${((stats.healthy / stats.total) * 100).toFixed(0)}% of total`}
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={18} className="text-blue-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">CPU Usage</span>
                </div>
                <ProgressBar
                  value={metrics?.cpu || 0}
                  size="lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MemoryStick size={18} className="text-purple-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Memory</span>
                </div>
                <ProgressBar
                  value={metrics?.memory?.percent || 0}
                  size="lg"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {metrics?.memory?.used || '0 GB'} / {metrics?.memory?.total || '8 GB'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive size={18} className="text-green-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Disk Usage</span>
                </div>
                <ProgressBar
                  value={metrics?.disk?.percent || 0}
                  size="lg"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {metrics?.disk?.used || '0 GB'} / {metrics?.disk?.total || '150 GB'}
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
                        {load.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{['1m', '5m', '15m'][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Service Categories
          </h2>
          <div className="space-y-3">
            {SERVICE_CATEGORIES.map((cat) => (
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
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Server Uptime</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {metrics?.uptime || '47 days'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
