import { useState } from 'react';
import { X, Download, RefreshCw, Search } from 'lucide-react';

interface LogViewerProps {
  containerName: string;
  logs: string;
  isLoading: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function LogViewer({ containerName, logs, isLoading, onClose, onRefresh }: LogViewerProps) {
  const [filter, setFilter] = useState('');

  const filteredLogs = filter
    ? logs.split('\n').filter((line) => line.toLowerCase().includes(filter.toLowerCase())).join('\n')
    : logs;

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${containerName}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Logs: {containerName}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              data-testid="btn-refresh-logs"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              data-testid="btn-download-logs"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              data-testid="btn-close-logs"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500"
              data-testid="input-filter-logs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {isLoading ? 'Loading logs...' : filteredLogs || 'No logs available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
