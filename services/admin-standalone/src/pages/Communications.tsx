import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, MessageSquare, Mail, Bell, MessageCircle } from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { StatCard } from '@/components/StatCard';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';

const COMMS_KEYWORDS = ['communications', 'comms'];

export function Communications() {
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
  const commsContainers = allContainers.filter((c: { name: string }) =>
    COMMS_KEYWORDS.some((kw) => c.name.toLowerCase().includes(kw))
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Communications Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Email, SMS, WhatsApp, and push notification services
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Hub Services"
          value={commsContainers.length}
          subtitle="Active containers"
          icon={MessageSquare}
          color="purple"
        />
        <StatCard
          title="Email"
          value="Active"
          subtitle="Nodemailer + Plesk"
          icon={Mail}
          color="blue"
        />
        <StatCard
          title="Push"
          value="Active"
          subtitle="Web push notifications"
          icon={Bell}
          color="green"
        />
        <StatCard
          title="WhatsApp"
          value="Configured"
          subtitle="Business API"
          icon={MessageCircle}
          color="green"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commsContainers.map((container: { name: string; status: string; health: 'healthy' | 'unhealthy' | 'none'; ports: string; uptime: string }) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: 'communications' }}
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
