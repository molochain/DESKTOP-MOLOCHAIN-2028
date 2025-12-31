import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  RefreshCw,
  Filter,
  Server,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  Terminal,
  Clock,
} from 'lucide-react';
import { getContainers, getContainerLogs } from '@/lib/api';
import { cn } from '@/lib/utils';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'unknown';

interface LogEntry {
  id: string;
  timestamp: Date | null;
  level: LogLevel;
  message: string;
  source: string;
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  error: 'text-red-500 bg-red-500/10',
  warn: 'text-orange-500 bg-orange-500/10',
  info: 'text-blue-500 bg-blue-500/10',
  debug: 'text-slate-400 bg-slate-400/10',
  unknown: 'text-slate-500 bg-slate-500/10',
};

const LOG_LEVEL_ICONS: Record<LogLevel, typeof AlertCircle> = {
  error: AlertCircle,
  warn: AlertTriangle,
  info: Info,
  debug: Bug,
  unknown: Terminal,
};

function parseLogLevel(line: string): LogLevel {
  const lowered = line.toLowerCase();
  if (lowered.includes('error') || lowered.includes('err]') || lowered.includes('[error]')) return 'error';
  if (lowered.includes('warn') || lowered.includes('[warn]') || lowered.includes('warning')) return 'warn';
  if (lowered.includes('info') || lowered.includes('[info]')) return 'info';
  if (lowered.includes('debug') || lowered.includes('[debug]')) return 'debug';
  return 'unknown';
}

function parseTimestamp(line: string): Date | null {
  // Try ISO 8601 format
  const isoMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  if (isoMatch) return new Date(isoMatch[1]);
  
  // Try common log formats
  const dateMatch = line.match(/(\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}:\d{2}:\d{2})/);
  if (dateMatch) return new Date(dateMatch[1].replace(/\//g, '-'));
  
  return null;
}

function parseLogLine(line: string, index: number, source: string): LogEntry {
  return {
    id: `${source}-${index}-${Date.now()}`,
    timestamp: parseTimestamp(line),
    level: parseLogLevel(line),
    message: line,
    source,
  };
}

export function Logs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set());
  const [expandedSidebar, setExpandedSidebar] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lineCount, setLineCount] = useState(200);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: containersData, isLoading: containersLoading } = useQuery({
    queryKey: ['/api/admin/microservices/containers'],
    queryFn: getContainers,
    refetchInterval: 60000,
  });

  const containers = containersData?.containers || [];

  // Fetch logs for selected containers
  const fetchLogs = async () => {
    if (selectedContainers.size === 0) {
      setAllLogs([]);
      return;
    }

    setIsRefreshing(true);
    const logsPromises = Array.from(selectedContainers).map(async (containerName) => {
      try {
        const data = await getContainerLogs(containerName, lineCount);
        const lines = (data.logs || '').split('\n').filter((l: string) => l.trim());
        return lines.map((line: string, idx: number) => parseLogLine(line, idx, containerName));
      } catch (err) {
        console.error(`Failed to fetch logs for ${containerName}:`, err);
        return [];
      }
    });

    const results = await Promise.all(logsPromises);
    const combined = results.flat().sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
    setAllLogs(combined);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedContainers, lineCount]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allLogs, autoScroll]);

  const toggleContainer = (name: string) => {
    setSelectedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const selectAllContainers = () => {
    setSelectedContainers(new Set(containers.map((c: any) => c.name)));
  };

  const clearSelection = () => {
    setSelectedContainers(new Set());
    setAllLogs([]);
  };

  const filteredLogs = allLogs
    .filter((log) => levelFilter === 'all' || log.level === levelFilter)
    .filter((log) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return log.message.toLowerCase().includes(query) || log.source.toLowerCase().includes(query);
    });

  const levelCounts = {
    error: allLogs.filter((l) => l.level === 'error').length,
    warn: allLogs.filter((l) => l.level === 'warn').length,
    info: allLogs.filter((l) => l.level === 'info').length,
    debug: allLogs.filter((l) => l.level === 'debug').length,
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleDownload = () => {
    const text = filteredLogs.map((l) => `[${l.source}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Container List */}
      <div className={cn(
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all',
        expandedSidebar ? 'w-64' : 'w-12'
      )}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          {expandedSidebar && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Services</span>
          )}
          <button
            onClick={() => setExpandedSidebar(!expandedSidebar)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            data-testid="btn-toggle-sidebar"
          >
            {expandedSidebar ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        
        {expandedSidebar && (
          <>
            <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex gap-2">
              <button
                onClick={selectAllContainers}
                className="flex-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                data-testid="btn-select-all"
              >
                All
              </button>
              <button
                onClick={clearSelection}
                className="flex-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                data-testid="btn-clear-selection"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {containersLoading ? (
                <div className="text-center py-4 text-slate-400">
                  <RefreshCw size={20} className="animate-spin mx-auto" />
                </div>
              ) : (
                containers.map((container: any) => {
                  const name = container.name;
                  const isSelected = selectedContainers.has(name);
                  const isRunning = container.status === 'running';
                  return (
                    <button
                      key={name}
                      onClick={() => toggleContainer(name)}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors',
                        isSelected
                          ? 'bg-primary-500/10 text-primary-500 border border-primary-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                      )}
                      data-testid={`btn-container-${name}`}
                    >
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        isRunning ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <span className="truncate">{name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Content - Logs Viewer */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Log Viewer</h1>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-slate-300"
                  data-testid="checkbox-autoscroll"
                />
                Auto-scroll
              </label>
              <select
                value={lineCount}
                onChange={(e) => setLineCount(Number(e.target.value))}
                className="text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                data-testid="select-line-count"
              >
                <option value={100}>100 lines</option>
                <option value={200}>200 lines</option>
                <option value={500}>500 lines</option>
                <option value={1000}>1000 lines</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                data-testid="btn-refresh-logs"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={handleDownload}
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                data-testid="btn-download-logs"
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                data-testid="input-search-logs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  data-testid="btn-clear-search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              {(['all', 'error', 'warn', 'info', 'debug'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded flex items-center gap-1',
                    levelFilter === level
                      ? 'bg-primary-500 text-white'
                      : level !== 'all'
                        ? LOG_LEVEL_COLORS[level as LogLevel]
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  )}
                  data-testid={`btn-filter-${level}`}
                >
                  {level !== 'all' && (
                    <span className="opacity-70">{levelCounts[level as keyof typeof levelCounts]}</span>
                  )}
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4 text-xs">
          <span className="text-slate-500">
            <Server size={12} className="inline mr-1" />
            {selectedContainers.size} service{selectedContainers.size !== 1 ? 's' : ''} selected
          </span>
          <span className="text-slate-500">
            <Terminal size={12} className="inline mr-1" />
            {filteredLogs.length} / {allLogs.length} log entries
          </span>
          <span className="text-red-500">
            <AlertCircle size={12} className="inline mr-1" />
            {levelCounts.error} errors
          </span>
          <span className="text-orange-500">
            <AlertTriangle size={12} className="inline mr-1" />
            {levelCounts.warn} warnings
          </span>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-y-auto font-mono text-sm bg-slate-900">
          {selectedContainers.size === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Server size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Select services to view logs</p>
              <p className="text-sm mt-2">Choose one or more containers from the sidebar</p>
            </div>
          ) : isRefreshing ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <RefreshCw size={32} className="animate-spin mb-4" />
              <p>Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Terminal size={48} className="mb-4 opacity-50" />
              <p>No logs match your filters</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredLogs.map((log, idx) => {
                const LevelIcon = LOG_LEVEL_ICONS[log.level];
                return (
                  <div
                    key={`${log.id}-${idx}`}
                    className="flex items-start gap-2 py-0.5 hover:bg-slate-800 px-2 rounded group"
                    data-testid={`log-entry-${idx}`}
                  >
                    <span className="text-slate-500 w-16 shrink-0 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(log.timestamp)}
                    </span>
                    <span className={cn(
                      'w-14 shrink-0 flex items-center gap-1 text-xs px-1 py-0.5 rounded',
                      LOG_LEVEL_COLORS[log.level]
                    )}>
                      <LevelIcon size={10} />
                      {log.level.toUpperCase().slice(0, 4)}
                    </span>
                    <span className="text-cyan-400 w-24 shrink-0 truncate" title={log.source}>
                      [{log.source.slice(0, 20)}]
                    </span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
