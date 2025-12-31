import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Workflow, Play, Clock, CheckCircle } from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { StatCard } from '@/components/StatCard';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';

const WORKFLOW_KEYWORDS = ['workflow', 'orchestrator'];

export function Workflows() {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: containersData, isLoading } = useQuery({
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

  const allContainers = containersData?.containers || [];
  const workflowContainers = allContainers.filter((c: { name: string }) =>
    WORKFLOW_KEYWORDS.some((kw) => c.name.toLowerCase().includes(kw))
  );

  const handleViewLogs = async (name: string) => {
    setSelectedContainer(name);
    setLogsLoading(true);
    try {
      const data = await getContainerLogs(name, 200);
      setLogs(data.logs || 'No logs available');
    } catch {
      setLogs('Failed to fetch logs');
    }
    setLogsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workflow Orchestration</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Automated workflows, CMS sync, and scheduled tasks
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Orchestrators"
          value={workflowContainers.length}
          subtitle="Active containers"
          icon={Workflow}
          color="purple"
        />
        <StatCard
          title="Workflows"
          value="10"
          subtitle="Registered workflows"
          icon={Play}
          color="blue"
        />
        <StatCard
          title="Handlers"
          value="35"
          subtitle="Active handlers"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Schedules"
          value="7"
          subtitle="Cron jobs running"
          icon={Clock}
          color="yellow"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Registered Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'cms-sync', schedule: '*/5 * * * *', desc: 'CMS content synchronization' },
            { name: 'database-backup', schedule: '0 2 * * *', desc: 'Daily PostgreSQL backup' },
            { name: 'health-monitoring', schedule: '* * * * *', desc: 'Container health checks' },
            { name: 'cache-warmup', schedule: '*/30 * * * *', desc: 'Application cache pre-warming' },
            { name: 'log-rotation', schedule: '0 0 * * *', desc: 'Log file rotation and cleanup' },
            { name: 'security-audit', schedule: '0 3 * * *', desc: 'Security compliance checks' },
          ].map((wf) => (
            <div key={wf.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{wf.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{wf.desc}</p>
              </div>
              <code className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                {wf.schedule}
              </code>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflowContainers.map((container: { name: string; status: string; health: 'healthy' | 'unhealthy' | 'none'; ports: string; uptime: string }) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: 'workflow' }}
              onRestart={(name) => restartMutation.mutate(name)}
              onViewLogs={handleViewLogs}
              isRestarting={restartMutation.isPending}
            />
          ))}
        </div>
      )}

      {selectedContainer && (
        <LogViewer
          containerName={selectedContainer}
          logs={logs}
          isLoading={logsLoading}
          onClose={() => setSelectedContainer(null)}
          onRefresh={() => handleViewLogs(selectedContainer)}
        />
      )}
    </div>
  );
}
