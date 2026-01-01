import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { 
  RefreshCw, Server, Database, Link2, MessageSquare, 
  Workflow, FileCode, Brain, Boxes 
} from 'lucide-react';
import { ContainerCard } from '@/components/ContainerCard';
import { LogViewer } from '@/components/LogViewer';
import { StatCard } from '@/components/StatCard';
import { getContainers, restartContainer, getContainerLogs } from '@/lib/api';
import { cn } from '@/lib/utils';

type CategoryKey = 'all' | 'core' | 'infrastructure' | 'mololink' | 'communications' | 'workflows' | 'cms' | 'ai';

interface Category {
  key: CategoryKey;
  label: string;
  description: string;
  icon: typeof Server;
  color: string;
  keywords: string[];
  filterFn?: (name: string) => boolean;
}

const CATEGORIES: Category[] = [
  {
    key: 'all',
    label: 'All Services',
    description: 'View all containers across all categories',
    icon: Boxes,
    color: 'bg-slate-500 hover:bg-slate-600',
    keywords: [],
  },
  {
    key: 'core',
    label: 'Core Services',
    description: 'Main application services and user/company management',
    icon: Server,
    color: 'bg-primary-500 hover:bg-primary-600',
    keywords: [
      'molochain-core', 'molochain-admin', 'molochain-app', 
      'molochain-admin-service', 'molochain-admin-db', 'molochain-admin-cache',
      'molochain-user-service', 'molochain-user-db', 'molochain-user-cache',
      'molochain-company-service', 'molochain-company-db', 'molochain-company-cache',
      'auth-service',
    ],
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    description: 'Databases, caches, gateways, and monitoring tools',
    icon: Database,
    color: 'bg-green-500 hover:bg-green-600',
    keywords: ['postgres', 'redis', 'kong', 'loki', 'promtail', 'alertmanager', 'portainer', 'pgadmin', 'backup'],
  },
  {
    key: 'mololink',
    label: 'Mololink',
    description: 'Link management and marketplace services',
    icon: Link2,
    color: 'bg-cyan-500 hover:bg-cyan-600',
    keywords: ['mololink'],
  },
  {
    key: 'communications',
    label: 'Communications',
    description: 'Email, SMS, WhatsApp, and push notification services',
    icon: MessageSquare,
    color: 'bg-pink-500 hover:bg-pink-600',
    keywords: ['communications', 'comms'],
  },
  {
    key: 'workflows',
    label: 'Workflows',
    description: 'Automated workflows, CMS sync, and scheduled tasks',
    icon: Workflow,
    color: 'bg-cyan-500 hover:bg-cyan-600',
    keywords: ['workflow', 'orchestrator'],
  },
  {
    key: 'cms',
    label: 'CMS',
    description: 'Content management system - pages, posts, media assets',
    icon: FileCode,
    color: 'bg-orange-500 hover:bg-orange-600',
    keywords: ['cms'],
  },
  {
    key: 'ai',
    label: 'Rayanava AI',
    description: 'AI agents, voice services, workflows, and monitoring',
    icon: Brain,
    color: 'bg-purple-500 hover:bg-purple-600',
    keywords: [],
    filterFn: (name: string) => name.startsWith('rayanava-'),
  },
];

interface ContainerType {
  name: string;
  status: string;
  health: 'healthy' | 'unhealthy' | 'none';
  ports: string;
  uptime: string;
}

export function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = (searchParams.get('category') || 'all') as CategoryKey;
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(categoryParam);
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

  const allContainers: ContainerType[] = containersData?.containers || [];

  const filterContainers = (category: Category): ContainerType[] => {
    if (category.key === 'all') {
      return allContainers;
    }
    if (category.filterFn) {
      return allContainers.filter((c) => category.filterFn!(c.name));
    }
    return allContainers.filter((c) =>
      category.keywords.some((kw) => c.name.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  const currentCategory = CATEGORIES.find((c) => c.key === selectedCategory) || CATEGORIES[0];
  const filteredContainers = filterContainers(currentCategory);
  const healthyCount = filteredContainers.filter((c) => c.health === 'healthy').length;

  const handleCategoryChange = (key: CategoryKey) => {
    setSelectedCategory(key);
    setSearchParams({ category: key });
  };

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

  const getCategoryStats = () => {
    return CATEGORIES.filter((c) => c.key !== 'all').map((category) => ({
      ...category,
      count: filterContainers(category).length,
      healthy: filterContainers(category).filter((c) => c.health === 'healthy').length,
    }));
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {currentCategory.description}
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/microservices/containers'] })}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors',
            currentCategory.color
          )}
          data-testid="btn-refresh-containers"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.key;
          const count = category.key === 'all' ? allContainers.length : filterContainers(category).length;
          return (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
              data-testid={`btn-category-${category.key}`}
            >
              <category.icon size={16} />
              {category.label}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategory === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoryStats.map((stat) => (
            <button
              key={stat.key}
              onClick={() => handleCategoryChange(stat.key)}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500 transition-colors text-left"
              data-testid={`stat-card-${stat.key}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className="text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.count}</div>
              <div className="text-xs text-green-500">{stat.healthy} healthy</div>
            </button>
          ))}
        </div>
      )}

      {selectedCategory !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Containers"
            value={filteredContainers.length}
            subtitle={`${currentCategory.label} services`}
            icon={currentCategory.icon}
            color="blue"
          />
          <StatCard
            title="Healthy"
            value={healthyCount}
            subtitle={`${((healthyCount / filteredContainers.length) * 100 || 0).toFixed(0)}% operational`}
            icon={currentCategory.icon}
            color="green"
          />
          <StatCard
            title="Unhealthy"
            value={filteredContainers.length - healthyCount}
            subtitle="Need attention"
            icon={currentCategory.icon}
            color={filteredContainers.length - healthyCount > 0 ? 'red' : 'green'}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredContainers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
          <currentCategory.icon size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No containers found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            No containers match the {currentCategory.label} category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContainers.map((container) => (
            <ContainerCard
              key={container.name}
              container={{ ...container, category: selectedCategory === 'all' ? 'core' : selectedCategory as any }}
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
