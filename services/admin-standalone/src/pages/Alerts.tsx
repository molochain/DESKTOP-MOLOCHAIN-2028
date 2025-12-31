import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  Filter,
  Clock,
  Server,
  Cpu,
  HardDrive,
  Activity,
} from 'lucide-react';
import { getContainers, getSystemMetrics } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'container' | 'cpu' | 'memory' | 'disk' | 'network';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

const ALERT_COLORS = {
  critical: 'bg-red-500/10 border-red-500/30 text-red-500',
  warning: 'bg-orange-500/10 border-orange-500/30 text-orange-500',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
};

const ALERT_ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const CATEGORY_ICONS = {
  container: Server,
  cpu: Cpu,
  memory: Activity,
  disk: HardDrive,
  network: Activity,
};

// Storage keys
const ACKNOWLEDGED_KEY = 'molochain-acknowledged-alerts';
const TIMESTAMPS_KEY = 'molochain-alert-timestamps';
const ACTIVE_ALERTS_KEY = 'molochain-active-alerts';

// Load/save helpers
function loadAcknowledged(): Record<string, number> {
  try {
    const stored = localStorage.getItem(ACKNOWLEDGED_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveAcknowledged(acks: Record<string, number>) {
  try {
    localStorage.setItem(ACKNOWLEDGED_KEY, JSON.stringify(acks));
  } catch {}
}

function loadTimestamps(): Record<string, number> {
  try {
    const stored = localStorage.getItem(TIMESTAMPS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveTimestamps(ts: Record<string, number>) {
  try {
    localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(ts));
  } catch {}
}

function loadPreviousActiveAlerts(): Set<string> {
  try {
    const stored = localStorage.getItem(ACTIVE_ALERTS_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function saveActiveAlerts(ids: string[]) {
  try {
    localStorage.setItem(ACTIVE_ALERTS_KEY, JSON.stringify(ids));
  } catch {}
}

function generateAlertsFromData(
  containers: any[],
  systemMetrics: any,
  timestamps: Record<string, number>,
  previousActiveAlerts: Set<string>,
  acknowledged: Record<string, number>
): { alerts: Alert[]; updatedTimestamps: Record<string, number>; updatedAcknowledged: Record<string, number> } {
  const alerts: Alert[] = [];
  const updatedTimestamps = { ...timestamps };
  let updatedAcknowledged = { ...acknowledged };
  const now = Date.now();
  const currentAlertIds: string[] = [];

  // Container health alerts
  if (containers) {
    const unhealthyContainers = containers.filter(
      (c: any) => c.State !== 'running' || (c.Status && c.Status.includes('unhealthy'))
    );
    unhealthyContainers.forEach((container: any) => {
      const alertId = `container-${container.Id}`;
      currentAlertIds.push(alertId);
      
      // If this is a new alert or was previously resolved, set new timestamp
      if (!previousActiveAlerts.has(alertId)) {
        updatedTimestamps[alertId] = now;
        // Clear any previous acknowledgement since this is a new occurrence
        delete updatedAcknowledged[alertId];
      }
      
      alerts.push({
        id: alertId,
        type: container.State === 'exited' ? 'critical' : 'warning',
        category: 'container',
        title: `Container ${container.State === 'running' ? 'Unhealthy' : 'Down'}`,
        message: `Container "${container.Names?.[0]?.replace(/^\//, '') || container.Id.slice(0, 12)}" is ${container.State === 'running' ? 'unhealthy' : container.State}`,
        timestamp: new Date(updatedTimestamps[alertId] || now),
        acknowledged: false,
        source: container.Names?.[0]?.replace(/^\//, '') || container.Id.slice(0, 12),
      });
    });
  }

  // System resource alerts
  if (systemMetrics) {
    if (systemMetrics.cpu?.usage > 80) {
      const alertId = 'cpu-high';
      currentAlertIds.push(alertId);
      if (!previousActiveAlerts.has(alertId)) {
        updatedTimestamps[alertId] = now;
        delete updatedAcknowledged[alertId];
      }
      alerts.push({
        id: alertId,
        type: systemMetrics.cpu.usage > 90 ? 'critical' : 'warning',
        category: 'cpu',
        title: 'High CPU Usage',
        message: `CPU usage is at ${Math.round(systemMetrics.cpu.usage)}%, exceeding threshold`,
        timestamp: new Date(updatedTimestamps[alertId] || now),
        acknowledged: false,
        source: 'System',
      });
    }
    if (systemMetrics.memory?.usedPercent > 85) {
      const alertId = 'memory-high';
      currentAlertIds.push(alertId);
      if (!previousActiveAlerts.has(alertId)) {
        updatedTimestamps[alertId] = now;
        delete updatedAcknowledged[alertId];
      }
      alerts.push({
        id: alertId,
        type: systemMetrics.memory.usedPercent > 95 ? 'critical' : 'warning',
        category: 'memory',
        title: 'High Memory Usage',
        message: `Memory usage is at ${Math.round(systemMetrics.memory.usedPercent)}%, exceeding threshold`,
        timestamp: new Date(updatedTimestamps[alertId] || now),
        acknowledged: false,
        source: 'System',
      });
    }
    if (systemMetrics.disk?.usedPercent > 90) {
      const alertId = 'disk-high';
      currentAlertIds.push(alertId);
      if (!previousActiveAlerts.has(alertId)) {
        updatedTimestamps[alertId] = now;
        delete updatedAcknowledged[alertId];
      }
      alerts.push({
        id: alertId,
        type: 'critical',
        category: 'disk',
        title: 'Disk Space Critical',
        message: `Disk usage is at ${Math.round(systemMetrics.disk.usedPercent)}%, running low on space`,
        timestamp: new Date(updatedTimestamps[alertId] || now),
        acknowledged: false,
        source: 'System',
      });
    }
  }

  // Clean up timestamps and acknowledgements for resolved alerts
  const currentAlertSet = new Set(currentAlertIds);
  Object.keys(updatedTimestamps).forEach(id => {
    if (!currentAlertSet.has(id)) {
      delete updatedTimestamps[id];
    }
  });
  Object.keys(updatedAcknowledged).forEach(id => {
    if (!currentAlertSet.has(id)) {
      delete updatedAcknowledged[id];
    }
  });

  // Save current alerts for next comparison
  saveActiveAlerts(currentAlertIds);

  // Sort by timestamp descending
  return {
    alerts: alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    updatedTimestamps,
    updatedAcknowledged,
  };
}

export function Alerts() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [acknowledged, setAcknowledged] = useState<Record<string, number>>(loadAcknowledged);
  const [timestamps, setTimestamps] = useState<Record<string, number>>(loadTimestamps);
  const previousActiveAlertsRef = useRef<Set<string>>(loadPreviousActiveAlerts());

  const { data: containersData, isLoading: containersLoading, refetch: refetchContainers } = useQuery({
    queryKey: ['/api/admin/containers'],
    queryFn: getContainers,
    refetchInterval: 30000,
  });

  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/admin/microservices/system-metrics'],
    queryFn: getSystemMetrics,
    refetchInterval: 30000,
  });

  const isLoading = containersLoading || metricsLoading;

  // Generate alerts and update state
  const { alerts, updatedTimestamps, updatedAcknowledged } = generateAlertsFromData(
    containersData?.containers || [],
    metricsData || null,
    timestamps,
    previousActiveAlertsRef.current,
    acknowledged
  );

  // Update previous alerts ref and persist changes
  useEffect(() => {
    const currentIds = new Set(alerts.map(a => a.id));
    previousActiveAlertsRef.current = currentIds;
    
    // Persist timestamps and acknowledgements if changed
    if (JSON.stringify(updatedTimestamps) !== JSON.stringify(timestamps)) {
      setTimestamps(updatedTimestamps);
      saveTimestamps(updatedTimestamps);
    }
    if (JSON.stringify(updatedAcknowledged) !== JSON.stringify(acknowledged)) {
      setAcknowledged(updatedAcknowledged);
      saveAcknowledged(updatedAcknowledged);
    }
  }, [containersData, metricsData]);

  const filteredAlerts = alerts
    .filter((a) => filter === 'all' || a.type === filter)
    .filter((a) => categoryFilter === 'all' || a.category === categoryFilter)
    .map((a) => ({ ...a, acknowledged: !!acknowledged[a.id] }));

  const activeAlerts = alerts.filter((a) => !acknowledged[a.id]);
  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;
  const acknowledgedCount = alerts.filter((a) => acknowledged[a.id]).length;

  const handleAcknowledge = (id: string) => {
    const newAcknowledged = { ...acknowledged, [id]: Date.now() };
    setAcknowledged(newAcknowledged);
    saveAcknowledged(newAcknowledged);
  };

  const handleAcknowledgeAll = () => {
    const newAcknowledged: Record<string, number> = {};
    const now = Date.now();
    alerts.forEach((a) => { newAcknowledged[a.id] = now; });
    setAcknowledged(newAcknowledged);
    saveAcknowledged(newAcknowledged);
  };

  const handleRefresh = () => {
    refetchContainers();
    refetchMetrics();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts & Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time monitoring alerts for containers and system resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAcknowledgeAll}
            disabled={activeAlerts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            data-testid="btn-acknowledge-all"
          >
            <CheckCircle2 size={16} />
            Acknowledge All
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
            data-testid="btn-refresh-alerts"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-lg">
            <Bell size={24} className="text-slate-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-total-alerts">{alerts.length}</p>
            <p className="text-sm text-slate-500">Total Alerts</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500" data-testid="text-critical-alerts">{criticalCount}</p>
            <p className="text-sm text-slate-500">Critical</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <AlertTriangle size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500" data-testid="text-warning-alerts">{warningCount}</p>
            <p className="text-sm text-slate-500">Warnings</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <CheckCircle2 size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500" data-testid="text-acknowledged-alerts">{acknowledgedCount}</p>
            <p className="text-sm text-slate-500">Acknowledged</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Severity:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'critical', 'warning', 'info'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  filter === f
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
                data-testid={`btn-filter-${f}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'container', 'cpu', 'memory', 'disk'].map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  categoryFilter === c
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
                data-testid={`btn-category-${c}`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">All Clear!</h3>
            <p className="text-slate-500">No alerts match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredAlerts.map((alert) => {
              const Icon = ALERT_ICONS[alert.type];
              const CategoryIcon = CATEGORY_ICONS[alert.category];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 flex items-start gap-4',
                    alert.acknowledged && 'opacity-50'
                  )}
                  data-testid={`alert-item-${alert.id}`}
                >
                  <div className={cn('p-2 rounded-lg border', ALERT_COLORS[alert.type])}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-white">{alert.title}</h3>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full border',
                        ALERT_COLORS[alert.type]
                      )}>
                        {alert.type}
                      </span>
                      {alert.acknowledged && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CategoryIcon size={12} />
                        {alert.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-green-500"
                      title="Acknowledge"
                      data-testid={`btn-acknowledge-${alert.id}`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
