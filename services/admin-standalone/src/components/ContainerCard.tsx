import { useState } from 'react';
import { RefreshCw, FileText, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatUptime, getHealthBgColor } from '@/lib/utils';
import { Container } from '@/types';

interface ContainerCardProps {
  container: Container;
  onRestart: (name: string) => void;
  onViewLogs: (name: string) => void;
  isRestarting?: boolean;
}

export function ContainerCard({ container, onRestart, onViewLogs, isRestarting }: ContainerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const healthColor = container.health === 'healthy' ? 'text-green-500' : container.health === 'unhealthy' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-lg border overflow-hidden transition-all',
        getHealthBgColor(container.health)
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                container.health === 'healthy' ? 'bg-green-500' : container.health === 'unhealthy' ? 'bg-red-500' : 'bg-yellow-500'
              )}
            />
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white text-sm">{container.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatUptime(container.uptime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewLogs(container.name)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              title="View Logs"
              data-testid={`btn-logs-${container.name}`}
            >
              <FileText size={16} />
            </button>
            <button
              onClick={() => onRestart(container.name)}
              disabled={isRestarting}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
              title="Restart"
              data-testid={`btn-restart-${container.name}`}
            >
              <RefreshCw size={16} className={isRestarting ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Health:</span>
              <span className={cn('ml-2 font-medium', healthColor)}>{container.health}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Ports:</span>
              <span className="ml-2 text-slate-700 dark:text-slate-300">{container.ports || 'None'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
