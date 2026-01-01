import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { getMetricsHistory, getMetricsTrends } from '@/lib/api';
import { cn } from '@/lib/utils';

const TIME_PERIODS = [
  { label: '24h', value: '24h', days: 1 },
  { label: '7d', value: '7d', days: 7 },
  { label: '30d', value: '30d', days: 30 },
];

const METRIC_TYPES = [
  { label: 'All', value: 'all', icon: Activity },
  { label: 'CPU', value: 'cpu', icon: Cpu, color: '#3b82f6' },
  { label: 'Memory', value: 'memory', icon: MemoryStick, color: '#8b5cf6' },
  { label: 'Disk', value: 'disk', icon: HardDrive, color: '#f59e0b' },
];

const ANOMALY_THRESHOLD = 90;

interface MetricDataPoint {
  timestamp: string;
  value: number;
  type: string;
}

interface ChartDataPoint {
  time: string;
  timestamp: number;
  cpu?: number;
  memory?: number;
  disk?: number;
  cpuAnomaly?: boolean;
  memoryAnomaly?: boolean;
  diskAnomaly?: boolean;
}

interface TrendData {
  type: string;
  current: number;
  average: number;
  min: number;
  max: number;
  trend: number;
}

function formatTimestamp(timestamp: string, period: string): string {
  const date = new Date(timestamp);
  if (period === '30d' || period === '7d') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function SummaryCard({
  title,
  icon: Icon,
  current,
  average,
  min,
  max,
  trend,
  color,
  isLoading,
}: {
  title: string;
  icon: typeof Cpu;
  current: number;
  average: number;
  min: number;
  max: number;
  trend: number;
  color: string;
  isLoading: boolean;
}) {
  const isPositiveTrend = trend > 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const isAnomaly = current > ANOMALY_THRESHOLD;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border p-5 transition-colors',
        isAnomaly
          ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10'
          : 'border-slate-200 dark:border-slate-700'
      )}
      data-testid={`card-summary-${title.toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={18} style={{ color }} />
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </span>
        </div>
        {isAnomaly && (
          <div className="flex items-center gap-1 text-red-500">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">High</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={cn(
            'text-2xl font-bold',
            isAnomaly ? 'text-red-500' : 'text-slate-900 dark:text-white'
          )}
        >
          {current.toFixed(1)}%
        </span>
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            isPositiveTrend
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          )}
        >
          <TrendIcon size={12} />
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-slate-400 dark:text-slate-500">Average</p>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {average.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">Min</p>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {min.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">Max</p>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {max.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendChart({
  data,
  selectedType,
  isLoading,
}: {
  data: ChartDataPoint[];
  selectedType: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4" />
          <div className="h-72 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Resource Trends
          </h3>
        </div>
        <div className="h-72 flex flex-col items-center justify-center text-slate-400">
          <Activity size={48} className="mb-3 opacity-50" />
          <p className="text-sm">No metrics data available</p>
          <p className="text-xs mt-1">Data will appear once metrics are collected</p>
        </div>
      </div>
    );
  }

  const showCpu = selectedType === 'all' || selectedType === 'cpu';
  const showMemory = selectedType === 'all' || selectedType === 'memory';
  const showDisk = selectedType === 'all' || selectedType === 'disk';

  const hasAnomalies = data.some(
    (d) =>
      (d.cpu && d.cpu > ANOMALY_THRESHOLD) ||
      (d.memory && d.memory > ANOMALY_THRESHOLD) ||
      (d.disk && d.disk > ANOMALY_THRESHOLD)
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-cyan-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Resource Trends
          </h3>
        </div>
        {hasAnomalies && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              Anomalies detected
            </span>
          </div>
        )}
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <ReferenceLine
              y={ANOMALY_THRESHOLD}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeOpacity={0.7}
              label={{
                value: 'Threshold (90%)',
                position: 'insideTopRight',
                fill: '#ef4444',
                fontSize: 10,
              }}
            />
            {showCpu && (
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.cpuAnomaly) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            )}
            {showMemory && (
              <Line
                type="monotone"
                dataKey="memory"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.memoryAnomaly) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            )}
            {showDisk && (
              <Line
                type="monotone"
                dataKey="disk"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.diskAnomaly) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        {showCpu && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">CPU</span>
          </div>
        )}
        {showMemory && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Memory</span>
          </div>
        )}
        {showDisk && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Disk</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500" style={{ borderStyle: 'dashed' }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Anomaly Threshold
          </span>
        </div>
      </div>
    </div>
  );
}

export function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS[0]);
  const [selectedType, setSelectedType] = useState('all');

  const periodConfig = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - selectedPeriod.days);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days: selectedPeriod.days,
    };
  }, [selectedPeriod]);

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['/api/admin/database/metrics/history', periodConfig],
    queryFn: () =>
      getMetricsHistory({
        type: selectedType === 'all' ? undefined : selectedType,
        startDate: periodConfig.startDate,
        endDate: periodConfig.endDate,
        limit: 500,
      }),
    refetchInterval: 60000,
  });

  const {
    data: trendsData,
    isLoading: trendsLoading,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['/api/admin/database/metrics/trends', periodConfig],
    queryFn: () =>
      getMetricsTrends({
        type: selectedType === 'all' ? undefined : selectedType,
        period: selectedPeriod.days <= 1 ? 'hourly' : 'daily',
        days: selectedPeriod.days,
      }),
    refetchInterval: 60000,
  });

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!historyData?.history || historyData.history.length === 0) return [];

    const grouped: Record<string, ChartDataPoint> = {};

    historyData.history.forEach((point: MetricDataPoint) => {
      const timeKey = formatTimestamp(point.timestamp, selectedPeriod.value);
      if (!grouped[timeKey]) {
        grouped[timeKey] = {
          time: timeKey,
          timestamp: new Date(point.timestamp).getTime(),
        };
      }

      const metricType = point.type.toLowerCase();
      if (metricType === 'cpu') {
        grouped[timeKey].cpu = point.value;
        grouped[timeKey].cpuAnomaly = point.value > ANOMALY_THRESHOLD;
      } else if (metricType === 'memory') {
        grouped[timeKey].memory = point.value;
        grouped[timeKey].memoryAnomaly = point.value > ANOMALY_THRESHOLD;
      } else if (metricType === 'disk') {
        grouped[timeKey].disk = point.value;
        grouped[timeKey].diskAnomaly = point.value > ANOMALY_THRESHOLD;
      }
    });

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [historyData, selectedPeriod.value]);

  const summaryCards = useMemo<TrendData[]>(() => {
    if (!trendsData?.trends) {
      return [
        { type: 'cpu', current: 0, average: 0, min: 0, max: 0, trend: 0 },
        { type: 'memory', current: 0, average: 0, min: 0, max: 0, trend: 0 },
        { type: 'disk', current: 0, average: 0, min: 0, max: 0, trend: 0 },
      ];
    }

    const trends = trendsData.trends;
    const result: TrendData[] = [];

    ['cpu', 'memory', 'disk'].forEach((type) => {
      const typeData = trends.filter(
        (t: { type: string }) => t.type.toLowerCase() === type
      );
      if (typeData.length > 0) {
        const values = typeData.map((t: { avgValue: number }) => t.avgValue);
        const current = values[values.length - 1] || 0;
        const previous = values[values.length - 2] || current;
        const average =
          values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const trend = previous !== 0 ? ((current - previous) / previous) * 100 : 0;

        result.push({ type, current, average, min, max, trend });
      } else {
        result.push({ type, current: 0, average: 0, min: 0, max: 0, trend: 0 });
      }
    });

    return result;
  }, [trendsData]);

  const handleRefresh = () => {
    refetchHistory();
    refetchTrends();
  };

  const isLoading = historyLoading || trendsLoading;

  const getMetricConfig = (type: string) => {
    switch (type) {
      case 'cpu':
        return { icon: Cpu, color: '#3b82f6', label: 'CPU Usage' };
      case 'memory':
        return { icon: MemoryStick, color: '#8b5cf6', label: 'Memory Usage' };
      case 'disk':
        return { icon: HardDrive, color: '#f59e0b', label: 'Disk Usage' };
      default:
        return { icon: Activity, color: '#06b6d4', label: type };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Historical resource trends and capacity analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  selectedPeriod.value === period.value
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
                data-testid={`btn-period-${period.value}`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            data-testid="btn-refresh-analytics"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock size={16} />
            <span>60s</span>
          </div>
        </div>
      </div>

      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {METRIC_TYPES.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.value}
              onClick={() => setSelectedType(metric.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                selectedType === metric.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
              data-testid={`btn-type-${metric.value}`}
            >
              <Icon size={16} style={metric.color ? { color: metric.color } : undefined} />
              {metric.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards
          .filter(
            (card) => selectedType === 'all' || card.type === selectedType
          )
          .map((card) => {
            const config = getMetricConfig(card.type);
            return (
              <SummaryCard
                key={card.type}
                title={config.label}
                icon={config.icon}
                current={card.current}
                average={card.average}
                min={card.min}
                max={card.max}
                trend={card.trend}
                color={config.color}
                isLoading={trendsLoading}
              />
            );
          })}
      </div>

      <TrendChart
        data={chartData}
        selectedType={selectedType}
        isLoading={historyLoading}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          About Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
              Data Collection
            </h4>
            <p>
              Metrics are collected at regular intervals and stored for historical
              analysis. The dashboard shows aggregated data based on the selected
              time period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
              Anomaly Detection
            </h4>
            <p>
              Data points exceeding the 90% threshold are highlighted in red.
              These anomalies may indicate resource constraints requiring
              attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
