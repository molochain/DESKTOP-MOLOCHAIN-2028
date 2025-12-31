import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, FileCode, ExternalLink, Database, Layers } from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { StatCard } from '@/components/StatCard';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';

const CMS_KEYWORDS = ['cms'];

export function CMS() {
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
  const cmsContainers = allContainers.filter((c: { name: string }) =>
    CMS_KEYWORDS.some((kw) => c.name.toLowerCase().includes(kw))
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CMS (Laravel)</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Content management system - pages, posts, media assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://cms.molochain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            Open CMS
          </a>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="CMS Containers"
          value={cmsContainers.length}
          subtitle="Laravel stack"
          icon={FileCode}
          color="purple"
        />
        <StatCard
          title="Database"
          value="cmsdb"
          subtitle="26 tables"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Queue Workers"
          value="1"
          subtitle="Processing jobs"
          icon={Layers}
          color="green"
        />
        <StatCard
          title="Stack"
          value="PHP 8.4"
          subtitle="FPM + Nginx"
          icon={FileCode}
          color="yellow"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">CMS Stack Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { name: 'cms-app', desc: 'PHP 8.4 FPM', port: '9000' },
            { name: 'cms-nginx', desc: 'Web Server', port: '8090' },
            { name: 'cms-queue', desc: 'Queue Worker', port: '9000' },
            { name: 'cms-scheduler', desc: 'Cron Jobs', port: '9000' },
            { name: 'cms-redis', desc: 'Cache/Session', port: '6379' },
          ].map((comp) => (
            <div key={comp.name} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
              <p className="font-medium text-slate-900 dark:text-white text-sm">{comp.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{comp.desc}</p>
              <code className="text-xs text-orange-500">:{comp.port}</code>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cmsContainers.map((container: { name: string; status: string; health: 'healthy' | 'unhealthy' | 'none'; ports: string; uptime: string }) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: 'cms' }}
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
