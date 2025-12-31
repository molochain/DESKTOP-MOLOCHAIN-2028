import { useState } from 'react';
import {
  Globe,
  Bell,
  Mail,
  Save,
  RefreshCw,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsState {
  alerts: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    cpuThreshold: number;
    memoryThreshold: number;
    diskThreshold: number;
    containerDown: boolean;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    fromAddress: string;
    recipients: string;
  };
}

const SCHEDULE_OPTIONS = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily_2am', label: 'Daily @ 2:00 AM' },
  { value: 'daily_6am', label: 'Daily @ 6:00 AM' },
  { value: 'weekly', label: 'Weekly (Sunday)' },
  { value: 'disabled', label: 'Disabled' },
];

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
        )}
        data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            enabled && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    alerts: {
      emailEnabled: true,
      slackEnabled: false,
      cpuThreshold: 80,
      memoryThreshold: 85,
      diskThreshold: 90,
      containerDown: true,
    },
    backup: {
      enabled: true,
      schedule: 'daily_2am',
      retention: 30,
    },
    email: {
      smtpHost: 'smtp.molochain.com',
      smtpPort: 587,
      fromAddress: 'alerts@molochain.com',
      recipients: 'admin@molochain.com',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateAlerts = (key: keyof SettingsState['alerts'], value: boolean | number) => {
    setSettings((s) => ({ ...s, alerts: { ...s.alerts, [key]: value } }));
  };

  const updateBackup = (key: keyof SettingsState['backup'], value: boolean | string | number) => {
    setSettings((s) => ({ ...s, backup: { ...s.backup, [key]: value } }));
  };

  const updateEmail = (key: keyof SettingsState['email'], value: string | number) => {
    setSettings((s) => ({ ...s, email: { ...s.email, [key]: value } }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure admin panel and system preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            saved
              ? 'bg-green-500 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          )}
          data-testid="btn-save-settings"
        >
          {isSaving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Bell size={20} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Alert Settings</h2>
          </div>
          <div className="space-y-4">
            <Toggle
              label="Email Notifications"
              enabled={settings.alerts.emailEnabled}
              onChange={(v) => updateAlerts('emailEnabled', v)}
            />
            <Toggle
              label="Slack Notifications"
              enabled={settings.alerts.slackEnabled}
              onChange={(v) => updateAlerts('slackEnabled', v)}
            />
            <Toggle
              label="Container Down Alerts"
              enabled={settings.alerts.containerDown}
              onChange={(v) => updateAlerts('containerDown', v)}
            />
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Resource Thresholds</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">CPU Alert Threshold</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={settings.alerts.cpuThreshold}
                      onChange={(e) => updateAlerts('cpuThreshold', parseInt(e.target.value))}
                      className="w-24"
                      data-testid="slider-cpu-threshold"
                    />
                    <span className="text-sm font-mono w-10 text-right" data-testid="text-cpu-threshold-value">{settings.alerts.cpuThreshold}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Memory Alert Threshold</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={settings.alerts.memoryThreshold}
                      onChange={(e) => updateAlerts('memoryThreshold', parseInt(e.target.value))}
                      className="w-24"
                      data-testid="slider-memory-threshold"
                    />
                    <span className="text-sm font-mono w-10 text-right" data-testid="text-memory-threshold-value">{settings.alerts.memoryThreshold}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Disk Alert Threshold</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={settings.alerts.diskThreshold}
                      onChange={(e) => updateAlerts('diskThreshold', parseInt(e.target.value))}
                      className="w-24"
                      data-testid="slider-disk-threshold"
                    />
                    <span className="text-sm font-mono w-10 text-right" data-testid="text-disk-threshold-value">{settings.alerts.diskThreshold}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <HardDrive size={20} className="text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Backup Settings</h2>
          </div>
          <div className="space-y-4">
            <Toggle
              label="Automatic Backups"
              enabled={settings.backup.enabled}
              onChange={(v) => updateBackup('enabled', v)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Backup Schedule</label>
              <select
                value={settings.backup.schedule}
                onChange={(e) => updateBackup('schedule', e.target.value)}
                disabled={!settings.backup.enabled}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm disabled:opacity-50"
                data-testid="select-backup-schedule"
              >
                {SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Retention Period (days)</label>
              <input
                type="number"
                value={settings.backup.retention}
                onChange={(e) => updateBackup('retention', parseInt(e.target.value) || 7)}
                min={1}
                max={365}
                disabled={!settings.backup.enabled}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm disabled:opacity-50"
                data-testid="input-backup-retention"
              />
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Backup</p>
                <p className="text-xs text-slate-500" data-testid="text-last-backup-time">Today, 02:00 AM</p>
              </div>
              <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full" data-testid="text-backup-status">Successful</span>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Mail size={20} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Email Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateEmail('smtpHost', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  data-testid="input-smtp-host"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => updateEmail('smtpPort', parseInt(e.target.value) || 587)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  data-testid="input-smtp-port"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From Address</label>
              <input
                type="email"
                value={settings.email.fromAddress}
                onChange={(e) => updateEmail('fromAddress', e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                data-testid="input-from-address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Alert Recipients</label>
              <input
                type="text"
                value={settings.email.recipients}
                onChange={(e) => updateEmail('recipients', e.target.value)}
                placeholder="Comma-separated emails"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                data-testid="input-recipients"
              />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Globe size={20} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Admin Domain</span>
              <span className="text-sm font-medium text-blue-500" data-testid="text-admin-domain">admin.molochain.com</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">API Gateway</span>
              <span className="text-sm font-medium text-blue-500" data-testid="text-api-gateway">api.molochain.com</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Auth Mode</span>
              <span className="text-sm font-medium text-green-500" data-testid="text-auth-mode">Isolated (Non-SSO)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">CSRF Protection</span>
              <span className="text-sm font-medium text-green-500" data-testid="text-csrf-protection">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Session Timeout</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white" data-testid="text-session-timeout">24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
