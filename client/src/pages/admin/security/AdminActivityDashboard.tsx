import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGuard } from '@/components/admin/PermissionGuard';
import { PERMISSIONS } from '@shared/permissions';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Users,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string | null;
  createdAt: string | null;
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  } | null;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AuditSummary {
  totalActions: number;
  byAction: { action: string; count: number }[];
  byEntityType: { entityType: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byUser: { userId: number; username: string; count: number }[];
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminActivityDashboard() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (filters.action) params.set('action', filters.action);
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.status) params.set('status', filters.status);
    if (filters.startDate) params.set('startDate', new Date(filters.startDate).toISOString());
    if (filters.endDate) params.set('endDate', new Date(filters.endDate).toISOString());
    return params.toString();
  }, [page, limit, filters]);

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery<AuditLogsResponse>({
    queryKey: ['/api/admin/audit-logs', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/admin/audit-logs?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<AuditSummary>({
    queryKey: ['/api/admin/audit-logs/summary'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await fetch(`/api/admin/audit-logs/summary?startDate=${today.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch audit summary');
      return response.json();
    },
    refetchInterval: 60000,
  });

  const filteredLogs = useMemo(() => {
    if (!logsData?.logs) return [];
    if (!searchQuery) return logsData.logs;
    
    const query = searchQuery.toLowerCase();
    return logsData.logs.filter(log => 
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      log.user?.username?.toLowerCase().includes(query) ||
      log.ipAddress?.toLowerCase().includes(query)
    );
  }, [logsData?.logs, searchQuery]);

  const uniqueActions = useMemo(() => {
    if (!logsData?.logs) return [];
    return [...new Set(logsData.logs.map(log => log.action))].sort();
  }, [logsData?.logs]);

  const uniqueEntityTypes = useMemo(() => {
    if (!logsData?.logs) return [];
    return [...new Set(logsData.logs.map(log => log.entityType))].sort();
  }, [logsData?.logs]);

  const pieChartData = useMemo(() => {
    if (!summary?.byAction) return [];
    return summary.byAction.slice(0, 8).map(item => ({
      name: item.action,
      value: item.count,
    }));
  }, [summary?.byAction]);

  const barChartData = useMemo(() => {
    if (!summary?.byUser) return [];
    return summary.byUser.slice(0, 5).map(item => ({
      name: item.username,
      actions: item.count,
    }));
  }, [summary?.byUser]);

  const errorLogs = useMemo(() => {
    if (!logsData?.logs) return [];
    return logsData.logs.filter(log => log.status === 'error').slice(0, 5);
  }, [logsData?.logs]);

  const handleRefresh = () => {
    refetchLogs();
    refetchSummary();
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'success') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100" data-testid="badge-status-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </Badge>
      );
    }
    if (status === 'error') {
      return (
        <Badge variant="destructive" data-testid="badge-status-error">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    }
    return (
      <Badge variant="outline" data-testid="badge-status-unknown">
        {status || 'Unknown'}
      </Badge>
    );
  };

  return (
    <PermissionGuard permission={PERMISSIONS.AUDIT_VIEW} showAccessDenied>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Admin Activity Dashboard</h1>
            <p className="text-muted-foreground">Monitor and analyze admin actions and system events</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-actions">{summary?.totalActions || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-active-admins">{summary?.byUser?.length || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action Types</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-action-types">{summary?.byAction?.length || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-error-rate">
                  {summary?.totalActions && summary?.byStatus
                    ? `${(((summary.byStatus.find(s => s.status === 'error')?.count || 0) / summary.totalActions) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Actions by Type</CardTitle>
              <CardDescription>Distribution of admin actions today</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Active Admins</CardTitle>
              <CardDescription>Top 5 admins by action count today</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="actions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {errorLogs.length > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recent Error Actions
              </CardTitle>
              <CardDescription>Recent actions that resulted in errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                    data-testid={`error-log-${log.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.user?.username || 'Unknown'} • {log.entityType}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity Feed
            </CardTitle>
            <CardDescription>Live stream of recent admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {logsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : logsData?.logs && logsData.logs.length > 0 ? (
                <div className="space-y-2">
                  {logsData.logs.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      data-testid={`activity-feed-item-${log.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'error' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            <span className="text-primary">{log.user?.username || 'Unknown'}</span>
                            {' '}performed{' '}
                            <span className="font-semibold">{log.action}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.entityType} {log.entityId && `• ID: ${log.entityId}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm:ss') : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No recent activity
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Complete audit trail of all admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-logs"
                    />
                  </div>
                </div>

                <div className="w-[150px]">
                  <Label htmlFor="action-filter">Action</Label>
                  <Select
                    value={filters.action}
                    onValueChange={(value) => {
                      setFilters({ ...filters, action: value === 'all' ? '' : value });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="action-filter" data-testid="select-action-filter">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[150px]">
                  <Label htmlFor="entity-filter">Entity Type</Label>
                  <Select
                    value={filters.entityType}
                    onValueChange={(value) => {
                      setFilters({ ...filters, entityType: value === 'all' ? '' : value });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="entity-filter" data-testid="select-entity-filter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {uniqueEntityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[130px]">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => {
                      setFilters({ ...filters, status: value === 'all' ? '' : value });
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="status-filter" data-testid="select-status-filter">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[150px]">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => {
                      setFilters({ ...filters, startDate: e.target.value });
                      setPage(1);
                    }}
                    data-testid="input-start-date"
                  />
                </div>

                <div className="w-[150px]">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => {
                      setFilters({ ...filters, endDate: e.target.value });
                      setPage(1);
                    }}
                    data-testid="input-end-date"
                  />
                </div>

                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(7)].map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id} data-testid={`table-row-log-${log.id}`}>
                          <TableCell className="whitespace-nowrap">
                            {log.createdAt ? format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{log.user?.username || 'Unknown'}</p>
                              {log.user?.email && (
                                <p className="text-xs text-muted-foreground">{log.user.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.entityType}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.entityId || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ipAddress || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {logsData?.pagination && logsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, logsData.pagination.total)} of {logsData.pagination.total} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page} of {logsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(logsData.pagination.totalPages, p + 1))}
                      disabled={page >= logsData.pagination.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
