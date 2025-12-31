import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Activity,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  category: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  severity: 'info' | 'warning' | 'error';
  success: boolean;
  details: Record<string, unknown> | null;
}

interface AuditStats {
  total: number;
  today: number;
  failed: number;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'database', label: 'Database' },
  { value: 'containers', label: 'Containers' },
  { value: 'users', label: 'Users' },
  { value: 'settings', label: 'Settings' },
  { value: 'security', label: 'Security' },
];

const SEVERITIES = [
  { value: '', label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

function getCategoryColor(category: string): string {
  switch (category) {
    case 'database': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'containers': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
    case 'users': return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'settings': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
    case 'security': return 'bg-red-500/10 text-red-500 border-red-500/30';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'info': return 'text-blue-500';
    case 'warning': return 'text-orange-500';
    case 'error': return 'text-red-500';
    default: return 'text-slate-500';
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'info': return Info;
    case 'warning': return AlertTriangle;
    case 'error': return XCircle;
    default: return Info;
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', '20');
    if (category) params.append('category', category);
    if (severity) params.append('severity', severity);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (search) params.append('search', search);
    return params.toString();
  };

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<AuditStats>({
    queryKey: ['/api/audit/stats'],
    queryFn: async () => {
      const res = await api.get('/api/audit/stats');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery<AuditLogsResponse>({
    queryKey: ['/api/audit/logs', page, category, severity, startDate, endDate, search],
    queryFn: async () => {
      const res = await api.get(`/api/audit/logs?${buildQueryParams()}`);
      return res.data;
    },
  });

  const stats = statsData || { total: 0, today: 0, failed: 0 };
  const logs = logsData?.logs || [];
  const pagination = logsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const handleRefresh = () => {
    refetchStats();
    refetchLogs();
  };

  const handleClearFilters = () => {
    setCategory('');
    setSeverity('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = category || severity || startDate || endDate || search;

  const toggleRowExpand = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-audit-logs-title">
            Audit Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track and monitor all system activities and changes
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={logsLoading || statsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
          data-testid="button-refresh-logs"
        >
          <RefreshCw size={16} className={(logsLoading || statsLoading) ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <FileText size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-total-logs">
              {statsLoading ? '...' : stats.total.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">Total Logs</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Activity size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-today-logs">
              {statsLoading ? '...' : stats.today.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">Today</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500" data-testid="text-failed-logs">
              {statsLoading ? '...' : stats.failed.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">Failed Actions</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            data-testid="select-category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            data-testid="select-severity"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev.value} value={sev.value}>{sev.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              max={endDate || formatDate(new Date())}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-testid="input-start-date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              min={startDate}
              max={formatDate(new Date())}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-testid="input-end-date"
            />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search action or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-testid="input-search"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              data-testid="button-clear-filters"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Log</h2>
          <span className="text-sm text-slate-500">
            {pagination.total.toLocaleString()} entries
          </span>
        </div>

        {logsLoading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">No audit logs found</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 text-primary-500 hover:text-primary-600 text-sm"
                data-testid="button-clear-filters-empty"
              >
                Clear filters to see all logs
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                      <Clock size={14} className="inline mr-1" />
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">User</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">IP Address</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Severity</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-300">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {logs.map((log) => {
                    const SeverityIcon = getSeverityIcon(log.severity);
                    const isExpanded = expandedRow === log.id;
                    
                    return (
                      <>
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                          data-testid={`audit-log-row-${log.id}`}
                        >
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                            {log.action}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'inline-flex px-2 py-1 text-xs font-medium rounded-full border',
                              getCategoryColor(log.category)
                            )}>
                              {log.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {log.user_email || <span className="text-slate-400 italic">System</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                            {log.ip_address || '--'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('flex items-center gap-1', getSeverityColor(log.severity))}>
                              <SeverityIcon size={14} />
                              <span className="capitalize">{log.severity}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {log.success ? (
                              <CheckCircle size={18} className="text-green-500 inline" data-testid={`status-success-${log.id}`} />
                            ) : (
                              <XCircle size={18} className="text-red-500 inline" data-testid={`status-failure-${log.id}`} />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {log.details && Object.keys(log.details).length > 0 ? (
                              <button
                                onClick={() => toggleRowExpand(log.id)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                data-testid={`button-expand-${log.id}`}
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} className="text-slate-500" />
                                ) : (
                                  <ChevronDown size={16} className="text-slate-500" />
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && log.details && (
                          <tr key={`${log.id}-details`}>
                            <td colSpan={8} className="px-4 py-3 bg-slate-50 dark:bg-slate-900">
                              <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-prev-page"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
