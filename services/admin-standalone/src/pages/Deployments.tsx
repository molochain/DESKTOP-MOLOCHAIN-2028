import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Rocket,
  GitCommit,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { getDeployments, createDeployment, updateDeployment } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Deployment {
  id: number;
  serviceName: string;
  version?: string;
  environment?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  deployedBy?: string;
  commitHash?: string;
  commitMessage?: string;
  deploymentType?: string;
  metadata?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface DeploymentsResponse {
  deployments: Deployment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface DeploymentFormData {
  serviceName: string;
  version: string;
  environment: string;
  deployedBy: string;
  commitHash: string;
  commitMessage: string;
  deploymentType: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  rolled_back: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  pending: Clock,
  in_progress: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
  rolled_back: RotateCcw,
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rolled_back', label: 'Rolled Back' },
];

const ENVIRONMENTS = ['production', 'staging', 'development'];
const DEPLOYMENT_TYPES = ['manual', 'ci_cd', 'rollback', 'hotfix'];

const DEFAULT_FORM: DeploymentFormData = {
  serviceName: '',
  version: '',
  environment: 'production',
  deployedBy: '',
  commitHash: '',
  commitMessage: '',
  deploymentType: 'manual',
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function DeploymentCard({
  deployment,
  onStatusUpdate,
  isUpdating,
}: {
  deployment: Deployment;
  onStatusUpdate: (id: number, status: string) => void;
  isUpdating: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const StatusIcon = STATUS_ICONS[deployment.status] || Clock;

  const handleCopyCommit = async () => {
    if (deployment.commitHash) {
      await navigator.clipboard.writeText(deployment.commitHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canUpdateStatus = deployment.status === 'in_progress' || deployment.status === 'completed';

  return (
    <div className="relative flex gap-4" data-testid={`deployment-card-${deployment.id}`}>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center border-2',
            deployment.status === 'completed' && 'bg-green-500/10 border-green-500',
            deployment.status === 'failed' && 'bg-red-500/10 border-red-500',
            deployment.status === 'in_progress' && 'bg-yellow-500/10 border-yellow-500',
            deployment.status === 'rolled_back' && 'bg-orange-500/10 border-orange-500',
            deployment.status === 'pending' && 'bg-slate-500/10 border-slate-500'
          )}
        >
          <StatusIcon
            size={18}
            className={cn(
              deployment.status === 'completed' && 'text-green-500',
              deployment.status === 'failed' && 'text-red-500',
              deployment.status === 'in_progress' && 'text-yellow-500 animate-spin',
              deployment.status === 'rolled_back' && 'text-orange-500',
              deployment.status === 'pending' && 'text-slate-500'
            )}
          />
        </div>
        <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2" />
      </div>

      <div className="flex-1 pb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Rocket size={18} className="text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {deployment.serviceName}
                  {deployment.version && (
                    <span className="text-sm font-normal text-slate-500">v{deployment.version}</span>
                  )}
                </h3>
                {deployment.environment && (
                  <span className="text-xs text-slate-500 capitalize">{deployment.environment}</span>
                )}
              </div>
            </div>
            <span
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-full border',
                STATUS_COLORS[deployment.status]
              )}
            >
              {deployment.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
            {deployment.deployedBy && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <User size={14} className="text-slate-400" />
                <span>{deployment.deployedBy}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Clock size={14} className="text-slate-400" />
              <span>{formatTimestamp(deployment.createdAt)}</span>
            </div>
            {deployment.commitHash && (
              <div className="flex items-center gap-1.5">
                <GitCommit size={14} className="text-slate-400" />
                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">
                  {deployment.commitHash.substring(0, 7)}
                </code>
                <button
                  onClick={handleCopyCommit}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  title="Copy commit hash"
                  data-testid={`btn-copy-commit-${deployment.id}`}
                >
                  {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            {deployment.deploymentType && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <AlertCircle size={14} className="text-slate-400" />
                <span className="capitalize">{deployment.deploymentType.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {deployment.commitMessage && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 italic">
              "{truncateText(deployment.commitMessage, 100)}"
            </p>
          )}

          {canUpdateStatus && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-500">Quick actions:</span>
              {deployment.status !== 'failed' && (
                <button
                  onClick={() => onStatusUpdate(deployment.id, 'failed')}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  data-testid={`btn-mark-failed-${deployment.id}`}
                >
                  <XCircle size={12} />
                  Mark Failed
                </button>
              )}
              {deployment.status !== 'rolled_back' && (
                <button
                  onClick={() => onStatusUpdate(deployment.id, 'rolled_back')}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                  data-testid={`btn-mark-rollback-${deployment.id}`}
                >
                  <RotateCcw size={12} />
                  Mark Rolled Back
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeploymentFormModal({
  onSave,
  onCancel,
  isLoading,
  services,
}: {
  onSave: (data: DeploymentFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  services: string[];
}) {
  const [form, setForm] = useState<DeploymentFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.serviceName.trim()) newErrors.serviceName = 'Service name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Rocket className="text-primary-500" size={20} />
            Log New Deployment
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            data-testid="btn-close-modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
              list="service-suggestions"
              className={cn(
                'w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white',
                errors.serviceName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              )}
              placeholder="e.g., api-gateway, auth-service"
              data-testid="input-service-name"
            />
            <datalist id="service-suggestions">
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.serviceName && <p className="text-xs text-red-500 mt-1">{errors.serviceName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Version
              </label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="e.g., 1.2.3"
                data-testid="input-version"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Environment
              </label>
              <select
                value={form.environment}
                onChange={(e) => setForm({ ...form, environment: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="select-environment"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Deployed By
              </label>
              <input
                type="text"
                value={form.deployedBy}
                onChange={(e) => setForm({ ...form, deployedBy: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="e.g., john.doe"
                data-testid="input-deployed-by"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Deployment Type
              </label>
              <select
                value={form.deploymentType}
                onChange={(e) => setForm({ ...form, deploymentType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="select-deployment-type"
              >
                {DEPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Commit Hash
            </label>
            <input
              type="text"
              value={form.commitHash}
              onChange={(e) => setForm({ ...form, commitHash: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              placeholder="e.g., abc1234..."
              data-testid="input-commit-hash"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Commit Message
            </label>
            <textarea
              value={form.commitMessage}
              onChange={(e) => setForm({ ...form, commitMessage: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="Brief description of changes..."
              data-testid="input-commit-message"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              data-testid="btn-submit-deployment"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Rocket size={16} />
                  Log Deployment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2" />
          </div>
          <div className="flex-1 pb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div>
                    <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
        <Rocket size={48} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Deployments Found</h3>
      <p className="text-slate-500 text-center max-w-md">
        No deployments have been logged yet. Start by logging a new deployment using the button above.
      </p>
    </div>
  );
}

export function Deployments() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useQuery<DeploymentsResponse>({
    queryKey: ['/api/admin/database/deployments', page, serviceFilter, statusFilter],
    queryFn: () =>
      getDeployments({
        page,
        limit: 10,
        service: serviceFilter || undefined,
        status: statusFilter || undefined,
      }),
    refetchInterval: 30000,
  });

  const deployments = data?.deployments || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const uniqueServices = [...new Set(deployments.map((d) => d.serviceName))].sort();

  const createMutation = useMutation({
    mutationFn: (data: DeploymentFormData) =>
      createDeployment({
        serviceName: data.serviceName,
        version: data.version || undefined,
        environment: data.environment || undefined,
        deployedBy: data.deployedBy || undefined,
        commitHash: data.commitHash || undefined,
        commitMessage: data.commitMessage || undefined,
        deploymentType: data.deploymentType || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/deployments'] });
      setShowCreateModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateDeployment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/deployments'] });
    },
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const handleClearFilters = () => {
    setServiceFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const hasActiveFilters = serviceFilter || statusFilter;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-deployments-title">
            Deployments
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track deployment history across all services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            data-testid="btn-refresh-deployments"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            data-testid="btn-log-deployment"
          >
            <Plus size={16} />
            Log Deployment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-lg">
            <Rocket size={24} className="text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-total-deployments">
              {pagination.total}
            </p>
            <p className="text-sm text-slate-500">Total Deployments</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500" data-testid="text-completed-deployments">
              {deployments.filter((d) => d.status === 'completed').length}
            </p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <RefreshCw size={24} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500" data-testid="text-in-progress-deployments">
              {deployments.filter((d) => d.status === 'in_progress').length}
            </p>
            <p className="text-sm text-slate-500">In Progress</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500" data-testid="text-failed-deployments">
              {deployments.filter((d) => d.status === 'failed').length}
            </p>
            <p className="text-sm text-slate-500">Failed</p>
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
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            data-testid="select-service-filter"
          >
            <option value="">All Services</option>
            {uniqueServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            data-testid="select-status-filter"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              data-testid="btn-clear-filters"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Deployment Timeline</h2>
          <span className="text-sm text-slate-500">{pagination.total} total</span>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : deployments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {deployments.map((deployment) => (
              <DeploymentCard
                key={deployment.id}
                deployment={deployment}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updateMutation.isPending}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(page - 1) * pagination.limit + 1} to{' '}
              {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
                data-testid="btn-prev-page"
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
                className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
                data-testid="btn-next-page"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <DeploymentFormModal
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isPending}
          services={uniqueServices}
        />
      )}
    </div>
  );
}

export default Deployments;
