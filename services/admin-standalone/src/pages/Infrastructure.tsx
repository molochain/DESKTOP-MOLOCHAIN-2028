import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Database, HardDrive, Shield, Activity } from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { StatCard } from '@/components/StatCard';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';

const INFRA_KEYWORDS = [
  'postgres',
  'redis',
  'kong',
  'loki',
  'promtail',
  'alertmanager',
  'portainer',
  'pgadmin',
  'backup',
];

export function Infrastructure() {
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
  const infraContainers = allContainers.filter((c: { name: string }) =>
    INFRA_KEYWORDS.some((kw) => c.name.toLowerCase().includes(kw))
  );

  const postgresCount = infraContainers.filter((c: { name: string }) => c.name.includes('postgres')).length;
  const redisCount = infraContainers.filter((c: { name: string }) => c.name.includes('redis')).length;

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Infrastructure</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Databases, caches, gateways, and monitoring tools
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="PostgreSQL"
          value={postgresCount}
          subtitle="Database instances"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Redis"
          value={redisCount}
          subtitle="Cache instances"
          icon={HardDrive}
          color="red"
        />
        <StatCard
          title="Kong Gateway"
          value={allContainers.filter((c: { name: string }) => c.name.includes('kong')).length}
          subtitle="API Gateway"
          icon={Shield}
          color="green"
        />
        <StatCard
          title="Monitoring"
          value={allContainers.filter((c: { name: string }) => 
            c.name.includes('loki') || c.name.includes('promtail') || c.name.includes('alertmanager')
          ).length}
          subtitle="Logging & Alerts"
          icon={Activity}
          color="purple"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {infraContainers.map((container: { name: string; status: string; health: 'healthy' | 'unhealthy' | 'none'; ports: string; uptime: string }) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: 'infrastructure' }}
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
