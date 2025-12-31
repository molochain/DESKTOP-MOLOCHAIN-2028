import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Brain, Bot, BarChart3 } from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { StatCard } from '@/components/StatCard';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';

export function RayanaraAI() {
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
  const rayanaContainers = allContainers.filter(
    (c: { name: string }) => c.name.startsWith('rayanava-')
  );

  const healthyCount = rayanaContainers.filter((c: { health: string }) => c.health === 'healthy').length;

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rayanava AI Platform</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            AI agents, voice services, workflows, and monitoring
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Services"
          value={rayanaContainers.length}
          subtitle="AI platform components"
          icon={Brain}
          color="purple"
        />
        <StatCard
          title="Healthy"
          value={healthyCount}
          subtitle={`${((healthyCount / rayanaContainers.length) * 100 || 0).toFixed(0)}% operational`}
          icon={Bot}
          color="green"
        />
        <StatCard
          title="Databases"
          value={rayanaContainers.filter((c: { name: string }) => c.name.includes('postgres')).length}
          subtitle="PostgreSQL instances"
          icon={BarChart3}
          color="blue"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rayanaContainers.map((container: { name: string; status: string; health: 'healthy' | 'unhealthy' | 'none'; ports: string; uptime: string }) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: 'rayanava' }}
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
