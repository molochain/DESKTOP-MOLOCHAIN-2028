import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  RefreshCw,
  Trash2,
  Database,
  Server,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  HardDrive,
  Loader2,
  BookOpen,
  RotateCcw,
  Wrench,
  Activity,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Runbook {
  id: string;
  name: string;
  description: string;
  category: 'containers' | 'database' | 'cache' | 'security' | 'maintenance';
  riskLevel: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  icon: typeof Server;
  endpoint: string;
  method: 'POST' | 'DELETE';
  requiresConfirmation: boolean;
  warningMessage?: string;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

const RUNBOOKS: Runbook[] = [
  {
    id: 'restart-unhealthy',
    name: 'Restart Unhealthy Containers',
    description: 'Automatically detect and restart all containers that are in an unhealthy state',
    category: 'containers',
    riskLevel: 'medium',
    estimatedDuration: '1-3 minutes',
    icon: RotateCcw,
    endpoint: '/api/monitor/check',
    method: 'POST',
    requiresConfirmation: true,
    warningMessage: 'This will restart all unhealthy containers. Running services may experience brief interruptions.',
  },
  {
    id: 'clear-restart-attempts',
    name: 'Clear Restart Attempt Counters',
    description: 'Reset the restart attempt counters for all containers, allowing auto-recovery to try again',
    category: 'containers',
    riskLevel: 'low',
    estimatedDuration: 'Instant',
    icon: RefreshCw,
    endpoint: '/api/monitor/clear-attempts',
    method: 'POST',
    requiresConfirmation: false,
  },
  {
    id: 'flush-redis-cache',
    name: 'Flush Redis Cache',
    description: 'Clear all cached data from Redis. Use when cache data becomes stale or corrupted',
    category: 'cache',
    riskLevel: 'medium',
    estimatedDuration: 'Instant',
    icon: Trash2,
    endpoint: '/api/runbooks/flush-redis',
    method: 'POST',
    requiresConfirmation: true,
    warningMessage: 'This will clear ALL cached data. Users may experience slower response times temporarily.',
  },
  {
    id: 'trigger-backup',
    name: 'Trigger Database Backup',
    description: 'Manually trigger an immediate PostgreSQL database backup',
    category: 'database',
    riskLevel: 'low',
    estimatedDuration: '2-5 minutes',
    icon: Database,
    endpoint: '/api/database/backup',
    method: 'POST',
    requiresConfirmation: false,
  },
  {
    id: 'cleanup-old-backups',
    name: 'Cleanup Old Backups',
    description: 'Remove database backups older than the retention period (7 days)',
    category: 'database',
    riskLevel: 'low',
    estimatedDuration: '< 1 minute',
    icon: Trash2,
    endpoint: '/api/runbooks/cleanup-backups',
    method: 'POST',
    requiresConfirmation: false,
  },
  {
    id: 'restart-core-services',
    name: 'Restart Core Services',
    description: 'Restart all Molochain core services (admin, app, auth) in sequence',
    category: 'containers',
    riskLevel: 'high',
    estimatedDuration: '3-5 minutes',
    icon: Server,
    endpoint: '/api/runbooks/restart-core',
    method: 'POST',
    requiresConfirmation: true,
    warningMessage: 'This will restart core services. All active sessions may be interrupted. Use only during maintenance windows.',
  },
  {
    id: 'rotate-logs',
    name: 'Rotate Container Logs',
    description: 'Truncate and rotate logs for all containers to free up disk space',
    category: 'maintenance',
    riskLevel: 'low',
    estimatedDuration: '< 1 minute',
    icon: HardDrive,
    endpoint: '/api/runbooks/rotate-logs',
    method: 'POST',
    requiresConfirmation: false,
  },
  {
    id: 'health-check-all',
    name: 'Run Full Health Check',
    description: 'Execute comprehensive health checks on all containers and services',
    category: 'maintenance',
    riskLevel: 'low',
    estimatedDuration: '30 seconds',
    icon: Activity,
    endpoint: '/api/monitor/check',
    method: 'POST',
    requiresConfirmation: false,
  },
  {
    id: 'ssl-refresh',
    name: 'Refresh SSL Status',
    description: 'Force a fresh SSL certificate check for all monitored domains',
    category: 'security',
    riskLevel: 'low',
    estimatedDuration: '10-20 seconds',
    icon: Shield,
    endpoint: '/api/ssl/check-all',
    method: 'POST',
    requiresConfirmation: false,
  },
];

const CATEGORY_COLORS = {
  containers: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  database: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  cache: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  security: 'bg-green-500/10 text-green-500 border-green-500/20',
  maintenance: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const RISK_COLORS = {
  low: 'bg-green-500/10 text-green-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-red-500/10 text-red-500',
};

const CATEGORY_LABELS = {
  containers: 'Containers',
  database: 'Database',
  cache: 'Cache',
  security: 'Security',
  maintenance: 'Maintenance',
};

function RunbookCard({
  runbook,
  onExecute,
  isExecuting,
  lastResult,
}: {
  runbook: Runbook;
  onExecute: (runbook: Runbook) => void;
  isExecuting: boolean;
  lastResult?: ExecutionResult;
}) {
  const Icon = runbook.icon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-primary-500/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${CATEGORY_COLORS[runbook.category]}`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{runbook.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[runbook.category]} border`}>
              {CATEGORY_LABELS[runbook.category]}
            </span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${RISK_COLORS[runbook.riskLevel]}`}>
          {runbook.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{runbook.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock size={14} />
          <span>{runbook.estimatedDuration}</span>
        </div>

        <button
          onClick={() => onExecute(runbook)}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isExecuting
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
          data-testid={`btn-run-${runbook.id}`}
        >
          {isExecuting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play size={16} />
              Execute
            </>
          )}
        </button>
      </div>

      {lastResult && (
        <div
          className={`mt-4 p-3 rounded-lg border ${
            lastResult.success
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            {lastResult.success ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
            <span className={lastResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {lastResult.message}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(lastResult.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({
  runbook,
  onConfirm,
  onCancel,
}: {
  runbook: Runbook;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Confirm Execution
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {runbook.warningMessage || `Are you sure you want to execute "${runbook.name}"?`}
        </p>

        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Risk Level:</span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${RISK_COLORS[runbook.riskLevel]}`}>
              {runbook.riskLevel.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-slate-500">Duration:</span>
            <span className="text-slate-900 dark:text-white">{runbook.estimatedDuration}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Execute Runbook
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Runbooks() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<Runbook | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ExecutionResult>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: monitorStatus } = useQuery({
    queryKey: ['/api/monitor/status'],
    queryFn: async () => {
      const res = await api.get('/api/monitor/status');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const executeMutation = useMutation({
    mutationFn: async (runbook: Runbook) => {
      const res = await api({
        method: runbook.method,
        url: runbook.endpoint,
      });
      return res.data;
    },
    onSuccess: (data, runbook) => {
      const result: ExecutionResult = {
        success: true,
        message: data.message || 'Runbook executed successfully',
        details: data,
        timestamp: new Date().toISOString(),
      };
      setResults((prev) => ({ ...prev, [runbook.id]: result }));
      queryClient.invalidateQueries({ queryKey: ['/api/monitor/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audit/stats'] });
    },
    onError: (error: Error, runbook) => {
      const result: ExecutionResult = {
        success: false,
        message: error.message || 'Execution failed',
        timestamp: new Date().toISOString(),
      };
      setResults((prev) => ({ ...prev, [runbook.id]: result }));
    },
    onSettled: () => {
      setExecutingId(null);
      setConfirmDialog(null);
    },
  });

  const handleExecute = (runbook: Runbook) => {
    if (runbook.requiresConfirmation) {
      setConfirmDialog(runbook);
    } else {
      setExecutingId(runbook.id);
      executeMutation.mutate(runbook);
    }
  };

  const handleConfirm = () => {
    if (confirmDialog) {
      setExecutingId(confirmDialog.id);
      executeMutation.mutate(confirmDialog);
    }
  };

  const filteredRunbooks =
    selectedCategory === 'all' ? RUNBOOKS : RUNBOOKS.filter((r) => r.category === selectedCategory);

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="text-primary-500" />
            Automated Runbooks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            One-click fixes for common infrastructure issues
          </p>
        </div>
        <div className="flex items-center gap-4">
          {monitorStatus && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Zap size={16} className="text-primary-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {monitorStatus.containers} containers monitored
              </span>
              {monitorStatus.unhealthyContainers > 0 && (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs rounded-full">
                  {monitorStatus.unhealthyContainers} unhealthy
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            data-testid={`btn-filter-${cat}`}
          >
            {cat === 'all' ? 'All Runbooks' : CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
          </button>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-medium text-amber-600 dark:text-amber-400">Important Notice</h4>
          <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
            Runbooks execute automated operations on your infrastructure. High-risk actions require confirmation.
            All executions are logged in the audit trail for accountability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRunbooks.map((runbook) => (
          <RunbookCard
            key={runbook.id}
            runbook={runbook}
            onExecute={handleExecute}
            isExecuting={executingId === runbook.id}
            lastResult={results[runbook.id]}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={18} className="text-primary-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Quick Stats</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{RUNBOOKS.length}</p>
            <p className="text-sm text-slate-500">Available Runbooks</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-500">{RUNBOOKS.filter((r) => r.riskLevel === 'low').length}</p>
            <p className="text-sm text-slate-500">Low Risk</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-500">{RUNBOOKS.filter((r) => r.riskLevel === 'medium').length}</p>
            <p className="text-sm text-slate-500">Medium Risk</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-500">{RUNBOOKS.filter((r) => r.riskLevel === 'high').length}</p>
            <p className="text-sm text-slate-500">High Risk</p>
          </div>
        </div>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          runbook={confirmDialog}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
