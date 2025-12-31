import { User, Shield, Database, Globe } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure admin panel and system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User size={20} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">admin@molochain.com</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Role</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Super Admin</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Last Login</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Today</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield size={20} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Auth Mode</span>
              <span className="text-sm font-medium text-green-500">Isolated (Non-SSO)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Session Timeout</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">24 hours</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">CSRF Protection</span>
              <span className="text-sm font-medium text-green-500">Enabled</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Database size={20} className="text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Database</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Primary</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">molochaindb</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Backups</span>
              <span className="text-sm font-medium text-green-500">Daily @ 2 AM</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Retention</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">30 days</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Globe size={20} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Endpoints</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Admin</span>
              <span className="text-sm font-medium text-blue-500">admin.molochain.com</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">API Gateway</span>
              <span className="text-sm font-medium text-blue-500">api.molochain.com</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Grafana</span>
              <span className="text-sm font-medium text-blue-500">:3001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
