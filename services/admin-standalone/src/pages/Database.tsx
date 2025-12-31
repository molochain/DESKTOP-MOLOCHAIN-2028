import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Database as DatabaseIcon, 
  Table, 
  Play, 
  Download, 
  Upload, 
  RefreshCw, 
  HardDrive,
  Layers,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface TableInfo {
  table_name: string;
  table_type: string;
  size: string;
  column_count: number;
  row_count: number;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface TableData {
  table: string;
  columns: ColumnInfo[];
  rows: Record<string, unknown>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface DatabaseStats {
  databaseName: string;
  size: string;
  tableCount: number;
  activeConnections: number;
  version: string;
}

interface Backup {
  name: string;
  size: number;
  sizeFormatted: string;
  created: string;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  duration: number;
}

export default function Database() {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM ');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'backups'>('tables');

  const { data: stats, isLoading: statsLoading } = useQuery<DatabaseStats>({
    queryKey: ['/api/database/stats'],
    refetchInterval: 30000,
  });

  const { data: tablesData, isLoading: tablesLoading, refetch: refetchTables } = useQuery<{ tables: TableInfo[] }>({
    queryKey: ['/api/database/tables'],
  });

  const { data: tableData, isLoading: tableDataLoading } = useQuery<TableData>({
    queryKey: ['/api/database/tables', selectedTable, tablePage],
    enabled: !!selectedTable,
  });

  const { data: backupsData, isLoading: backupsLoading, refetch: refetchBackups } = useQuery<{ backups: Backup[] }>({
    queryKey: ['/api/database/backups'],
    enabled: activeTab === 'backups',
  });

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await api.post('/api/database/query', { query });
      return res.data;
    },
    onSuccess: (data) => {
      setQueryResult(data);
      setQueryError(null);
    },
    onError: (err: Error) => {
      setQueryError(err.message);
      setQueryResult(null);
    },
  });

  const backupMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/database/backup');
      return res.data;
    },
    onSuccess: () => {
      refetchBackups();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (filename: string) => {
      const res = await api.post('/api/database/restore', { filename, confirm: 'RESTORE' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/database/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/database/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/database/backups'] });
      if (selectedTable) {
        queryClient.invalidateQueries({ queryKey: ['/api/database/tables', selectedTable] });
      }
    },
  });

  const tables = tablesData?.tables || [];
  const backups = backupsData?.backups || [];

  const handleRunQuery = () => {
    if (sqlQuery.trim()) {
      queryMutation.mutate(sqlQuery);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setTablePage(1);
    setSqlQuery(`SELECT * FROM "${tableName}" LIMIT 100`);
  };

  const handleRestore = (filename: string) => {
    if (window.confirm(`Are you sure you want to restore from ${filename}? This will overwrite current data.`)) {
      restoreMutation.mutate(filename);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-database-title">Database Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage PostgreSQL database, run queries, and handle backups</p>
        </div>
        <button
          onClick={() => {
            refetchTables();
            queryClient.invalidateQueries({ queryKey: ['/api/database/stats'] });
          }}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
          data-testid="button-refresh-database"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <DatabaseIcon size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white" data-testid="text-db-name">
              {statsLoading ? '...' : stats?.databaseName || 'N/A'}
            </p>
            <p className="text-xs text-slate-500">Database</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <HardDrive size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white" data-testid="text-db-size">
              {statsLoading ? '...' : stats?.size || 'N/A'}
            </p>
            <p className="text-xs text-slate-500">Size</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Layers size={24} className="text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white" data-testid="text-table-count">
              {statsLoading ? '...' : stats?.tableCount || 0}
            </p>
            <p className="text-xs text-slate-500">Tables</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <Activity size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white" data-testid="text-connections">
              {statsLoading ? '...' : stats?.activeConnections || 0}
            </p>
            <p className="text-xs text-slate-500">Connections</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {(['tables', 'query', 'backups'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
            data-testid={`tab-${tab}`}
          >
            {tab === 'tables' && <Table size={16} className="inline mr-2" />}
            {tab === 'query' && <Play size={16} className="inline mr-2" />}
            {tab === 'backups' && <Download size={16} className="inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'tables' && (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white">Tables ({tables.length})</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {tablesLoading ? (
                <div className="p-4 text-center text-slate-500">Loading...</div>
              ) : (
                tables.map((table) => (
                  <button
                    key={table.table_name}
                    onClick={() => handleTableSelect(table.table_name)}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between',
                      selectedTable === table.table_name && 'bg-primary-500/10'
                    )}
                    data-testid={`table-item-${table.table_name}`}
                  >
                    <div className="flex items-center gap-2">
                      <Table size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-900 dark:text-white">{table.table_name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{table.row_count}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {!selectedTable ? (
              <div className="p-8 text-center text-slate-500">
                <Table size={48} className="mx-auto mb-4 opacity-30" />
                <p>Select a table to view its data</p>
              </div>
            ) : tableDataLoading ? (
              <div className="p-8 text-center">
                <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">Loading table data...</p>
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{selectedTable}</h3>
                    <p className="text-xs text-slate-500">{tableData?.pagination.total || 0} rows</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={tablePage <= 1}
                      onClick={() => setTablePage((p) => p - 1)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-500">
                      Page {tablePage} of {tableData?.pagination.totalPages || 1}
                    </span>
                    <button
                      disabled={tablePage >= (tableData?.pagination.totalPages || 1)}
                      onClick={() => setTablePage((p) => p + 1)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                      data-testid="button-next-page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                      <tr>
                        {tableData?.columns.map((col) => (
                          <th
                            key={col.column_name}
                            className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600"
                          >
                            <div>
                              {col.column_name}
                              <span className="block text-xs font-normal text-slate-400">{col.data_type}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData?.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          {tableData?.columns.map((col) => (
                            <td key={col.column_name} className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                              {String(row[col.column_name] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'query' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-32 p-3 font-mono text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter SQL query (SELECT only)..."
                  data-testid="input-sql-query"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunQuery}
                disabled={queryMutation.isPending || !sqlQuery.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
                data-testid="button-run-query"
              >
                {queryMutation.isPending ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                Run Query
              </button>
              <p className="text-xs text-slate-500">Only SELECT, EXPLAIN, and SHOW queries are allowed</p>
            </div>
          </div>

          {queryError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Query Error</p>
                <p className="text-sm text-red-500">{queryError}</p>
              </div>
            </div>
          )}

          {queryResult && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {queryResult.rowCount} rows returned in {queryResult.duration}ms
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                    <tr>
                      {queryResult.columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        {queryResult.columns.map((col) => (
                          <td key={col} className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Create and manage database backups</p>
            <button
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-create-backup"
            >
              {backupMutation.isPending ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Create Backup
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white">Available Backups</h3>
            </div>
            {backupsLoading ? (
              <div className="p-8 text-center">
                <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">Loading backups...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p>No backups available</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {backups.map((backup) => (
                  <div
                    key={backup.name}
                    className="p-4 flex items-center justify-between"
                    data-testid={`backup-item-${backup.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FileText size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{backup.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{backup.sizeFormatted}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(backup.created).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(backup.name)}
                        disabled={restoreMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm"
                        data-testid={`button-restore-${backup.name}`}
                      >
                        <Upload size={14} />
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
