import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Clock,
  Server,
  ExternalLink,
  BarChart3,
  Zap,
  Network,
  Database,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';
import { getSystemMetrics, getContainers, api } from '@/lib/api';

const TIME_RANGES = [
  { label: '1h', value: '1h', seconds: 3600, step: 60 },
  { label: '6h', value: '6h', seconds: 21600, step: 300 },
  { label: '24h', value: '24h', seconds: 86400, step: 900 },
  { label: '7d', value: '7d', seconds: 604800, step: 3600 },
];

interface ChartData {
  time: string;
  value: number;
}

interface PrometheusResult {
  metric: Record<string, string>;
  values?: Array<[number, string]>;
  value?: [number, string];
}

async function fetchPrometheusRange(query: string, range: typeof TIME_RANGES[number]) {
  const end = Math.floor(Date.now() / 1000);
  const start = end - range.seconds;
  try {
    const response = await api.get(`/prometheus/api/v1/query_range`, {
      params: { query, start, end, step: range.step }
    });
    return response.data;
  } catch {
    return null;
  }
}

async function fetchPrometheusInstant(query: string) {
  try {
    const response = await api.get(`/prometheus/api/v1/query`, {
      params: { query }
    });
    return response.data;
  } catch {
    return null;
  }
}

function formatTimestamp(timestamp: number, rangeValue: string): string {
  const date = new Date(timestamp * 1000);
  if (rangeValue === '7d') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function MetricChart({
  title,
  data,
  color,
  unit,
  isLoading,
  icon: Icon,
}: {
  title: string;
  data: ChartData[];
  color: string;
  unit: string;
  isLoading: boolean;
  icon: typeof Cpu;
}) {
  const fillColor = color === 'text-blue-500' ? '#3b82f6' : 
                    color === 'text-purple-500' ? '#a855f7' :
                    color === 'text-green-500' ? '#22c55e' :
                    color === 'text-orange-500' ? '#f97316' :
                    color === 'text-cyan-500' ? '#06b6d4' : '#6b7280';

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={18} className={color} />
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={color} />
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        {data.length > 0 && (
          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            Current: {data[data.length - 1]?.value?.toFixed(2) || 'N/A'}{unit}
          </span>
        )}
      </div>
      <div className="h-48">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fillColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={fillColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={[0, 'auto']} tickFormatter={(val) => unit === 'MB' ? `${(val / 1024 / 1024).toFixed(0)}${unit}` : `${val.toFixed(0)}${unit}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [unit === 'MB' ? `${(value / 1024 / 1024).toFixed(2)} MB` : `${value.toFixed(4)}${unit}`, title]}
              />
              <Area type="monotone" dataKey="value" stroke={fillColor} fill={`url(#gradient-${title.replace(/\s/g, '')})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
        )}
      </div>
    </div>
  );
}

function StatusBreakdownChart({ data, isLoading }: { data: Array<{ status: string; count: number }>; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-48">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis type="number" stroke="#6b7280" fontSize={10} />
            <YAxis dataKey="status" type="category" stroke="#6b7280" fontSize={10} width={50} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
      )}
    </div>
  );
}

export function Metrics() {
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[0]);

  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/admin/microservices/system-metrics'],
    queryFn: getSystemMetrics,
    refetchInterval: 30000,
  });

  const { data: containersData, isLoading: containersLoading, refetch: refetchContainers } = useQuery({
    queryKey: ['/api/admin/microservices/containers'],
    queryFn: getContainers,
    refetchInterval: 30000,
  });

  const { data: httpRateHistory, isLoading: httpLoading, refetch: refetchHttp } = useQuery({
    queryKey: ['prometheus-http-rate', selectedRange.value],
    queryFn: () => fetchPrometheusRange('sum(rate(gateway_http_request_duration_seconds_count[5m])) * 60', selectedRange),
    refetchInterval: 60000,
  });

  const { data: processCpuHistory, isLoading: cpuHistLoading, refetch: refetchCpu } = useQuery({
    queryKey: ['prometheus-process-cpu', selectedRange.value],
    queryFn: () => fetchPrometheusRange('sum(rate(process_cpu_seconds_total[5m])) * 100', selectedRange),
    refetchInterval: 60000,
  });

  const { data: heapUsedHistory, isLoading: heapLoading, refetch: refetchHeap } = useQuery({
    queryKey: ['prometheus-heap', selectedRange.value],
    queryFn: () => fetchPrometheusRange('sum(nodejs_heap_size_used_bytes)', selectedRange),
    refetchInterval: 60000,
  });

  const { data: eventLoopHistory, isLoading: eventLoopLoading, refetch: refetchEventLoop } = useQuery({
    queryKey: ['prometheus-eventloop', selectedRange.value],
    queryFn: () => fetchPrometheusRange('avg(nodejs_eventloop_lag_mean_seconds) * 1000', selectedRange),
    refetchInterval: 60000,
  });

  const { data: statusBreakdown, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['prometheus-status'],
    queryFn: () => fetchPrometheusInstant('sum by (status)(gateway_http_request_duration_seconds_count)'),
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    refetchMetrics();
    refetchContainers();
    refetchHttp();
    refetchCpu();
    refetchHeap();
    refetchEventLoop();
    refetchStatus();
  };

  const parsePrometheusData = (data: { data?: { result?: PrometheusResult[] } } | null): ChartData[] => {
    if (!data?.data?.result?.[0]?.values) return [];
    return data.data.result[0].values.map(([timestamp, value]: [number, string]) => ({
      time: formatTimestamp(timestamp, selectedRange.value),
      value: parseFloat(value) || 0,
    }));
  };

  const parseStatusBreakdown = (data: { data?: { result?: PrometheusResult[] } } | null): Array<{ status: string; count: number }> => {
    if (!data?.data?.result) return [];
    return data.data.result.map((r: PrometheusResult) => ({
      status: r.metric.status || 'unknown',
      count: parseFloat(r.value?.[1] || '0'),
    })).sort((a, b) => b.count - a.count).slice(0, 6);
  };

  const httpChartData = useMemo(() => parsePrometheusData(httpRateHistory), [httpRateHistory, selectedRange.value]);
  const cpuChartData = useMemo(() => parsePrometheusData(processCpuHistory), [processCpuHistory, selectedRange.value]);
  const heapChartData = useMemo(() => parsePrometheusData(heapUsedHistory), [heapUsedHistory, selectedRange.value]);
  const eventLoopChartData = useMemo(() => parsePrometheusData(eventLoopHistory), [eventLoopHistory, selectedRange.value]);
  const statusData = useMemo(() => parseStatusBreakdown(statusBreakdown), [statusBreakdown]);

  const isLoading = metricsLoading || containersLoading;
  const metrics = metricsData || {};
  const containers = containersData?.containers || [];
  const healthyCount = containers.filter((c: { health: string }) => c.health === 'healthy').length;
  const totalCount = containers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Metrics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time system performance with Prometheus charts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedRange.value === range.value
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                data-testid={`btn-range-${range.value}`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            data-testid="btn-refresh-metrics"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock size={16} />
            <span>30s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="CPU Usage" value={metrics.cpu != null ? `${metrics.cpu.toFixed(1)}%` : 'N/A'} subtitle="Current utilization" icon={Cpu} color="blue" />
        <StatCard title="Memory" value={metrics.memory?.percent != null ? `${metrics.memory.percent.toFixed(1)}%` : 'N/A'} subtitle={metrics.memory ? `${metrics.memory.used} / ${metrics.memory.total}` : 'N/A'} icon={MemoryStick} color="purple" />
        <StatCard title="Disk" value={metrics.disk?.percent != null ? `${metrics.disk.percent.toFixed(1)}%` : 'N/A'} subtitle={metrics.disk ? `${metrics.disk.used} / ${metrics.disk.total}` : 'N/A'} icon={HardDrive} color="green" />
        <StatCard title="Containers" value={`${healthyCount}/${totalCount}`} subtitle="Healthy / Total" icon={Server} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricChart title="HTTP Requests" data={httpChartData} color="text-orange-500" unit="/min" isLoading={httpLoading} icon={Network} />
        <MetricChart title="Process CPU" data={cpuChartData} color="text-blue-500" unit="%" isLoading={cpuHistLoading} icon={Cpu} />
        <MetricChart title="Heap Memory" data={heapChartData} color="text-purple-500" unit="MB" isLoading={heapLoading} icon={Database} />
        <MetricChart title="Event Loop Lag" data={eventLoopChartData} color="text-cyan-500" unit="ms" isLoading={eventLoopLoading} icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">HTTP Status Breakdown</h3>
          </div>
          <StatusBreakdownChart data={statusData} isLoading={statusLoading} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Load Average</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(metrics.loadAverage || [0, 0, 0]).map((load: number, i: number) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{typeof load === 'number' ? load.toFixed(2) : '0.00'}</p>
                <p className="text-sm text-slate-500">{['1 min', '5 min', '15 min'][i]}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <a href="http://31.186.24.19:3001" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg hover:from-orange-500/20 hover:to-orange-600/20 transition-colors" data-testid="link-grafana">
              <div><p className="font-semibold text-slate-900 dark:text-white">Grafana</p><p className="text-xs text-slate-500">Full dashboard</p></div>
              <ExternalLink size={18} className="text-orange-500" />
            </a>
            <a href="http://31.186.24.19:9090" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg hover:from-red-500/20 hover:to-red-600/20 transition-colors" data-testid="link-prometheus">
              <div><p className="font-semibold text-slate-900 dark:text-white">Prometheus</p><p className="text-xs text-slate-500">Query metrics</p></div>
              <ExternalLink size={18} className="text-red-500" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MemoryStick size={18} className="text-purple-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Resource Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">CPU</span>
              <span className="font-medium text-slate-900 dark:text-white">{metrics.cpu?.toFixed(1) || 0}%</span>
            </div>
            <ProgressBar value={metrics.cpu || 0} size="lg" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Memory</span>
              <span className="font-medium text-slate-900 dark:text-white">{metrics.memory?.percent?.toFixed(1) || 0}%</span>
            </div>
            <ProgressBar value={metrics.memory?.percent || 0} size="lg" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Disk</span>
              <span className="font-medium text-slate-900 dark:text-white">{metrics.disk?.percent?.toFixed(1) || 0}%</span>
            </div>
            <ProgressBar value={metrics.disk?.percent || 0} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
