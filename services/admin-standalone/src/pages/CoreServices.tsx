import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';

const CORE_CONTAINERS = [
  'molochain-core',
  'molochain-admin',
  'molochain-app',
  'molochain-admin-service',
  'molochain-admin-db',
  'molochain-admin-cache',
  'molochain-user-service',
  'molochain-user-db',
  'molochain-user-cache',
  'molochain-company-service',
  'molochain-company-db',
  'molochain-company-cache',
  'auth-service',
];

export function CoreServices() {
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

  const containers = (containersData?.containers || []).filter(
    (c: { name: string }) => CORE_CONTAINERS.some((name) => c.name.includes(name))
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

  const handleRefreshLogs = async () => {
    if (selectedContainer) {
      await handleViewLogs(selectedContainer);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Core Services</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Main application services and user/company management
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          data-testid="btn-refresh-containers"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containers.map((container: { name: string; status: string; health: 'healthy' | 'unhealthy' | 'none'; ports: string; uptime: string }) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: 'core' }}
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
          onRefresh={handleRefreshLogs}
        />
      )}
    </div>
  );
}
