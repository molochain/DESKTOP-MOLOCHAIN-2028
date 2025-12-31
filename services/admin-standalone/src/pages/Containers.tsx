import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Server,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Square,
  CheckSquare,
} from 'lucide-react';
import { LogViewer } from '@/components/LogViewer';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Container {
  name: string;
  status: string;
  health: 'healthy' | 'unhealthy' | 'none';
  ports: string;
  uptime: string;
}

type HealthFilter = 'all' | 'healthy' | 'unhealthy' | 'none';

const HEALTH_FILTERS: { key: HealthFilter; label: string; icon: typeof CheckCircle; color: string }[] = [
  { key: 'all', label: 'All', icon: Server, color: 'bg-slate-500' },
  { key: 'healthy', label: 'Healthy', icon: CheckCircle, color: 'bg-green-500' },
  { key: 'unhealthy', label: 'Unhealthy', icon: XCircle, color: 'bg-red-500' },
  { key: 'none', label: 'No Healthcheck', icon: AlertTriangle, color: 'bg-yellow-500' },
];

const CATEGORY_COLORS: Record<string, string> = {
  core: 'border-l-blue-500',
  rayanava: 'border-l-purple-500',
  infrastructure: 'border-l-green-500',
  cms: 'border-l-orange-500',
  communications: 'border-l-pink-500',
  workflow: 'border-l-cyan-500',
  mololink: 'border-l-indigo-500',
  other: 'border-l-slate-500',
};

function getCategory(name: string): string {
  if (name.includes('postgres') || name.includes('redis') || name.includes('kong') || name.includes('loki') || name.includes('promtail')) return 'infrastructure';
  if (name.startsWith('rayanava-')) return 'rayanava';
  if (name.includes('cms')) return 'cms';
  if (name.includes('communications') || name.includes('comms')) return 'communications';
  if (name.includes('workflow') || name.includes('orchestrator')) return 'workflow';
  if (name.includes('mololink')) return 'mololink';
  if (name.startsWith('molochain-')) return 'core';
  return 'other';
}

function formatUptime(uptime: string): string {
  if (!uptime) return 'Unknown';
  const match = uptime.match(/Up\s+(.+)/);
  return match ? match[1] : uptime;
}

export function Containers() {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set());
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set());
  const [selectedLogContainer, setSelectedLogContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);
  const [bulkRestartInProgress, setBulkRestartInProgress] = useState(false);
  const queryClient = useQueryClient();

  const { data: containersData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/microservices/containers'],
    queryFn: getContainers,
    refetchInterval: 30000,
  });

  const restartMutation = useMutation({
    mutationFn: restartContainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] });
    },
  });

  const allContainers: Container[] = containersData?.containers || [];

  const filteredContainers = useMemo(() => {
    return allContainers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesHealth = healthFilter === 'all' || (healthFilter === 'none' ? (!c.health || c.health === 'none') : c.health === healthFilter);
      return matchesSearch && matchesHealth;
    });
  }, [allContainers, search, healthFilter]);

  const stats = useMemo(() => ({
    total: allContainers.length,
    healthy: allContainers.filter((c) => c.health === 'healthy').length,
    unhealthy: allContainers.filter((c) => c.health === 'unhealthy').length,
    none: allContainers.filter((c) => !c.health || c.health === 'none').length,
  }), [allContainers]);

  const handleViewLogs = async (name: string) => {
    setSelectedLogContainer(name);
    setLogsLoading(true);
    try {
      const data = await getContainerLogs(name, 300);
      setLogs(data.logs || 'No logs available');
    } catch {
      setLogs('Failed to fetch logs');
    }
    setLogsLoading(false);
  };

  const toggleContainer = (name: string) => {
    setSelectedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedContainers.size === filteredContainers.length) {
      setSelectedContainers(new Set());
    } else {
      setSelectedContainers(new Set(filteredContainers.map((c) => c.name)));
    }
  };

  const toggleExpanded = (name: string) => {
    setExpandedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleBulkRestart = async () => {
    if (selectedContainers.size === 0) return;
    setBulkRestartInProgress(true);
    const names = Array.from(selectedContainers);
    for (const name of names) {
      try {
        await restartContainer(name);
      } catch (e) {
        console.error(`Failed to restart ${name}:`, e);
      }
    }
    setSelectedContainers(new Set());
    setBulkRestartInProgress(false);
    queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Container Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all {stats.total} Docker containers</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedContainers.size > 0 && (
            <button
              onClick={handleBulkRestart}
              disabled={bulkRestartInProgress}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
              data-testid="btn-bulk-restart"
            >
              <RotateCcw size={16} className={bulkRestartInProgress ? 'animate-spin' : ''} />
              Restart {selectedContainers.size} Selected
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            data-testid="btn-refresh-containers"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {HEALTH_FILTERS.map(({ key, label, icon: Icon, color }) => {
          const count = key === 'all' ? stats.total : stats[key as keyof typeof stats];
          const isActive = healthFilter === key;
          return (
            <button
              key={key}
              onClick={() => setHealthFilter(key)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all',
                isActive
                  ? 'bg-white dark:bg-slate-800 border-primary-500 ring-2 ring-primary-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              )}
              data-testid={`filter-${key}`}
            >
              <div className={cn('p-2 rounded-lg', color)}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search containers by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500"
            data-testid="input-search-containers"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Filter size={16} />
          <span>Showing {filteredContainers.length} of {allContainers.length} containers</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            data-testid="btn-toggle-all"
          >
            {selectedContainers.size === filteredContainers.length && filteredContainers.length > 0 ? (
              <CheckSquare size={18} className="text-primary-500" />
            ) : (
              <Square size={18} />
            )}
            Select All
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={14} />
            Auto-refresh: 30s
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredContainers.length === 0 ? (
          <div className="p-12 text-center">
            <Server size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No containers match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredContainers.map((container) => {
              const isSelected = selectedContainers.has(container.name);
              const isExpanded = expandedContainers.has(container.name);
              const category = getCategory(container.name);
              return (
                <div key={container.name} className={cn('border-l-4', CATEGORY_COLORS[category] || CATEGORY_COLORS.other)}>
                  <div className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <button
                      onClick={() => toggleContainer(container.name)}
                      className="mr-4 text-slate-400 hover:text-primary-500"
                      data-testid={`checkbox-${container.name}`}
                    >
                      {isSelected ? <CheckSquare size={20} className="text-primary-500" /> : <Square size={20} />}
                    </button>
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full mr-3 flex-shrink-0',
                        container.health === 'healthy' ? 'bg-green-500' : container.health === 'unhealthy' ? 'bg-red-500' : 'bg-yellow-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm truncate">{container.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatUptime(container.uptime)}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleViewLogs(container.name)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        title="View Logs"
                        data-testid={`btn-logs-${container.name}`}
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => restartMutation.mutate(container.name)}
                        disabled={restartMutation.isPending}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                        title="Restart"
                        data-testid={`btn-restart-${container.name}`}
                      >
                        <RefreshCw size={16} className={restartMutation.isPending ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={() => toggleExpanded(container.name)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        data-testid={`btn-expand-${container.name}`}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 ml-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Health:</span>
                        <span className={cn(
                          'ml-2 font-medium',
                          container.health === 'healthy' ? 'text-green-500' : container.health === 'unhealthy' ? 'text-red-500' : 'text-yellow-500'
                        )}>{container.health || 'none'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Status:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">{container.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Ports:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">{container.ports || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Category:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300 capitalize">{category}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedLogContainer && (
        <LogViewer
          containerName={selectedLogContainer}
          logs={logs}
          isLoading={logsLoading}
          onClose={() => setSelectedLogContainer(null)}
          onRefresh={() => handleViewLogs(selectedLogContainer)}
        />
      )}
    </div>
  );
}
