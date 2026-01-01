import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Clock,
  AlertTriangle,
  Loader2,
  Activity,
  X,
  History,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import {
  getAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  getIncidents,
  approveIncident,
  rejectIncident,
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface AlertRule {
  id: number;
  name: string;
  description?: string;
  conditionType: string;
  conditionValue: object;
  actionType: string;
  actionConfig?: object;
  enabled: boolean;
  requiresApproval: boolean;
  cooldownSeconds: number;
  createdAt: string;
  updatedAt: string;
}

interface Incident {
  id: number;
  ruleId?: number;
  triggerType: string;
  triggerReason?: string;
  actionType: string;
  actionConfig?: object;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  approvedBy?: string;
  approvedAt?: string;
  executedAt?: string;
  result?: object;
  createdAt: string;
}

interface RuleFormData {
  name: string;
  description: string;
  conditionType: string;
  conditionValue: string;
  actionType: string;
  actionConfig: string;
  requiresApproval: boolean;
  cooldownSeconds: number;
  enabled: boolean;
}

const CONDITION_TYPES = [
  { value: 'cpu_threshold', label: 'CPU Threshold' },
  { value: 'memory_threshold', label: 'Memory Threshold' },
  { value: 'disk_threshold', label: 'Disk Threshold' },
  { value: 'container_down', label: 'Container Down' },
];

const ACTION_TYPES = [
  { value: 'restart_container', label: 'Restart Container' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'run_runbook', label: 'Run Runbook' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  executed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const DEFAULT_FORM: RuleFormData = {
  name: '',
  description: '',
  conditionType: 'cpu_threshold',
  conditionValue: '{"threshold": 90}',
  actionType: 'send_notification',
  actionConfig: '',
  requiresApproval: true,
  cooldownSeconds: 300,
  enabled: true,
};

function RuleCard({
  rule,
  onEdit,
  onDelete,
  onViewHistory,
}: {
  rule: AlertRule;
  onEdit: (rule: AlertRule) => void;
  onDelete: (rule: AlertRule) => void;
  onViewHistory: (rule: AlertRule) => void;
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border p-6 transition-colors',
        rule.enabled
          ? 'border-slate-200 dark:border-slate-700'
          : 'border-slate-200/50 dark:border-slate-700/50 opacity-70'
      )}
      data-testid={`card-rule-${rule.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2.5 rounded-lg',
              rule.enabled
                ? 'bg-primary-500/10 text-primary-500'
                : 'bg-slate-500/10 text-slate-500'
            )}
          >
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              {rule.name}
              {rule.enabled ? (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
                  Disabled
                </span>
              )}
            </h3>
            {rule.description && (
              <p className="text-sm text-slate-500 mt-0.5">{rule.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewHistory(rule)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="View History"
            data-testid={`btn-history-${rule.id}`}
          >
            <History size={18} />
          </button>
          <button
            onClick={() => onEdit(rule)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Edit"
            data-testid={`btn-edit-${rule.id}`}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(rule)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500"
            title="Delete"
            data-testid={`btn-delete-${rule.id}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Condition:</span>
          <p className="font-medium text-slate-900 dark:text-white">
            {CONDITION_TYPES.find((c) => c.value === rule.conditionType)?.label || rule.conditionType}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Action:</span>
          <p className="font-medium text-slate-900 dark:text-white">
            {ACTION_TYPES.find((a) => a.value === rule.actionType)?.label || rule.actionType}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Cooldown:</span>
          <p className="font-medium text-slate-900 dark:text-white">{rule.cooldownSeconds}s</p>
        </div>
        <div>
          <span className="text-slate-500">Approval:</span>
          <p className="font-medium text-slate-900 dark:text-white">
            {rule.requiresApproval ? 'Required' : 'Auto'}
          </p>
        </div>
      </div>
    </div>
  );
}

function RuleFormModal({
  rule,
  onSave,
  onCancel,
  isLoading,
}: {
  rule?: AlertRule | null;
  onSave: (data: RuleFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<RuleFormData>(() => {
    if (rule) {
      return {
        name: rule.name,
        description: rule.description || '',
        conditionType: rule.conditionType,
        conditionValue: JSON.stringify(rule.conditionValue, null, 2),
        actionType: rule.actionType,
        actionConfig: rule.actionConfig ? JSON.stringify(rule.actionConfig, null, 2) : '',
        requiresApproval: rule.requiresApproval,
        cooldownSeconds: rule.cooldownSeconds,
        enabled: rule.enabled,
      };
    }
    return DEFAULT_FORM;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    try {
      JSON.parse(form.conditionValue);
    } catch {
      newErrors.conditionValue = 'Invalid JSON';
    }
    if (form.actionConfig) {
      try {
        JSON.parse(form.actionConfig);
      } catch {
        newErrors.actionConfig = 'Invalid JSON';
      }
    }
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
            <Shield className="text-primary-500" size={20} />
            {rule ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white',
                errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              )}
              data-testid="input-name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Condition Type
              </label>
              <select
                value={form.conditionType}
                onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="select-condition-type"
              >
                {CONDITION_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Action Type
              </label>
              <select
                value={form.actionType}
                onChange={(e) => setForm({ ...form, actionType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="select-action-type"
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Condition Value (JSON) *
            </label>
            <textarea
              value={form.conditionValue}
              onChange={(e) => setForm({ ...form, conditionValue: e.target.value })}
              rows={3}
              className={cn(
                'w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm',
                errors.conditionValue ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              )}
              placeholder='{"threshold": 90}'
              data-testid="input-condition-value"
            />
            {errors.conditionValue && (
              <p className="text-xs text-red-500 mt-1">{errors.conditionValue}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Action Config (JSON, optional)
            </label>
            <textarea
              value={form.actionConfig}
              onChange={(e) => setForm({ ...form, actionConfig: e.target.value })}
              rows={2}
              className={cn(
                'w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm',
                errors.actionConfig ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              )}
              placeholder='{"container": "app-1"}'
              data-testid="input-action-config"
            />
            {errors.actionConfig && (
              <p className="text-xs text-red-500 mt-1">{errors.actionConfig}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cooldown Seconds
            </label>
            <input
              type="number"
              value={form.cooldownSeconds}
              onChange={(e) => setForm({ ...form, cooldownSeconds: parseInt(e.target.value) || 300 })}
              min={0}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              data-testid="input-cooldown"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.requiresApproval}
                onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                data-testid="checkbox-requires-approval"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Requires Approval</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                data-testid="checkbox-enabled"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Enabled</span>
            </label>
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
              data-testid="btn-save-rule"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Rule</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  rule,
  onConfirm,
  onCancel,
  isLoading,
}: {
  rule: AlertRule;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Delete Alert Rule
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Are you sure you want to delete the rule "{rule.name}"? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            data-testid="btn-confirm-delete"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({
  rule,
  onClose,
}: {
  rule: AlertRule;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/database/incidents', rule.id],
    queryFn: () => getIncidents({ ruleId: rule.id, limit: 20 }),
  });

  const incidents: Incident[] = data?.incidents || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-primary-500" size={20} />
            Execution History: {rule.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8">
              <Activity size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500">No executions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  data-testid={`history-item-${incident.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full border',
                        STATUS_COLORS[incident.status]
                      )}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(incident.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {incident.triggerReason || 'No reason provided'}
                  </p>
                  {incident.approvedBy && (
                    <p className="text-xs text-slate-500 mt-1">
                      Approved by: {incident.approvedBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingIncidentCard({
  incident,
  onApprove,
  onReject,
  isLoading,
}: {
  incident: Incident;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl border border-yellow-500/30 p-4"
      data-testid={`pending-incident-${incident.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
            <Clock size={18} />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">
              {ACTION_TYPES.find((a) => a.value === incident.actionType)?.label || incident.actionType}
            </h4>
            <p className="text-sm text-slate-500 mt-0.5">
              {incident.triggerReason || 'Triggered by alert rule'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            data-testid={`btn-reject-${incident.id}`}
          >
            <XCircle size={16} />
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            data-testid={`btn-approve-${incident.id}`}
          >
            <CheckCircle size={16} />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export function Incidents() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [deleteRule, setDeleteRule] = useState<AlertRule | null>(null);
  const [historyRule, setHistoryRule] = useState<AlertRule | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/admin/database/alert-rules'],
    queryFn: getAlertRules,
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/admin/database/incidents', 'pending'],
    queryFn: () => getIncidents({ status: 'pending' }),
    refetchInterval: 30000,
  });

  const rules: AlertRule[] = rulesData?.rules || [];
  const pendingIncidents: Incident[] = pendingData?.incidents || [];

  const createMutation = useMutation({
    mutationFn: (data: RuleFormData) =>
      createAlertRule({
        name: data.name,
        description: data.description || undefined,
        conditionType: data.conditionType,
        conditionValue: JSON.parse(data.conditionValue),
        actionType: data.actionType,
        actionConfig: data.actionConfig ? JSON.parse(data.actionConfig) : undefined,
        requiresApproval: data.requiresApproval,
        cooldownSeconds: data.cooldownSeconds,
        enabled: data.enabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/alert-rules'] });
      setShowForm(false);
      showToast('Alert rule created successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create rule', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RuleFormData }) =>
      updateAlertRule(id, {
        name: data.name,
        description: data.description || undefined,
        conditionType: data.conditionType,
        conditionValue: JSON.parse(data.conditionValue),
        actionType: data.actionType,
        actionConfig: data.actionConfig ? JSON.parse(data.actionConfig) : undefined,
        requiresApproval: data.requiresApproval,
        cooldownSeconds: data.cooldownSeconds,
        enabled: data.enabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/alert-rules'] });
      setEditingRule(null);
      showToast('Alert rule updated successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update rule', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAlertRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/alert-rules'] });
      setDeleteRule(null);
      showToast('Alert rule deleted successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete rule', 'error');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/incidents'] });
      showToast('Incident approved', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to approve', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/database/incidents'] });
      showToast('Incident rejected', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to reject', 'error');
    },
  });

  const handleSaveRule = (data: RuleFormData) => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const enabledCount = rules.filter((r) => r.enabled).length;
  const disabledCount = rules.filter((r) => !r.enabled).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2',
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          )}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Zap className="text-primary-500" />
            Incidents & Alert Rules
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure automated alert rules and manage incident approvals
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          data-testid="btn-create-rule"
        >
          <Plus size={16} />
          Create Rule
        </button>
      </div>

      {pendingIncidents.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Pending Approvals ({pendingIncidents.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingIncidents.map((incident) => (
              <PendingIncidentCard
                key={incident.id}
                incident={incident}
                onApprove={() => approveMutation.mutate(incident.id)}
                onReject={() => rejectMutation.mutate(incident.id)}
                isLoading={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-lg">
            <Shield size={24} className="text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-total-rules">
              {rules.length}
            </p>
            <p className="text-sm text-slate-500">Total Rules</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Play size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500" data-testid="text-enabled-rules">
              {enabledCount}
            </p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-lg">
            <Pause size={24} className="text-slate-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-500" data-testid="text-disabled-rules">
              {disabledCount}
            </p>
            <p className="text-sm text-slate-500">Disabled</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <Clock size={24} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500" data-testid="text-pending-incidents">
              {pendingIncidents.length}
            </p>
            <p className="text-sm text-slate-500">Pending</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Alert Rules</h2>
        {rulesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <Shield size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Alert Rules</h3>
            <p className="text-slate-500 mb-4">Create your first alert rule to start monitoring</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Create Rule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={setEditingRule}
                onDelete={setDeleteRule}
                onViewHistory={setHistoryRule}
              />
            ))}
          </div>
        )}
      </div>

      {(showForm || editingRule) && (
        <RuleFormModal
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deleteRule && (
        <DeleteConfirmDialog
          rule={deleteRule}
          onConfirm={() => deleteMutation.mutate(deleteRule.id)}
          onCancel={() => setDeleteRule(null)}
          isLoading={deleteMutation.isPending}
        />
      )}

      {historyRule && <HistoryModal rule={historyRule} onClose={() => setHistoryRule(null)} />}
    </div>
  );
}
