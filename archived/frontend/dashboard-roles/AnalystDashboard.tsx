import { useQuery } from '@tanstack/react-query';
import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Database,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  Activity,
  DollarSign,
  Users,
  Package,
  Zap,
  Target,
  Calendar,
  Clock,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  changePercent,
  trend,
  icon: Icon,
  testId
}: {
  title: string;
  value: string | number;
  change: string;
  changePercent: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
  testId: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        <div className={`flex items-center text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3 mr-1" />
          <span data-testid={`${testId}-change`}>{changePercent}% {change}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Data Insight Card
function DataInsightCard({
  insight,
  testId
}: {
  insight: any;
  testId: string;
}) {
  const severityColors = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  };

  return (
    <div className="p-4 rounded-lg border space-y-2" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-600" />
          <h4 className="text-sm font-medium" data-testid={`${testId}-title`}>{insight.title}</h4>
        </div>
        <Badge variant={severityColors[insight.priority]} data-testid={`${testId}-priority`}>
          {insight.priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground" data-testid={`${testId}-description`}>
        {insight.description}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground" data-testid={`${testId}-impact`}>
          Impact: {insight.impact}
        </span>
        <Button variant="ghost" size="sm" data-testid={`${testId}-action`}>
          View Details
        </Button>
      </div>
    </div>
  );
}

// Report Row Component
function ReportRow({
  report,
  testId
}: {
  report: any;
  testId: string;
}) {
  return (
    <TableRow data-testid={testId}>
      <TableCell data-testid={`${testId}-name`}>{report.name}</TableCell>
      <TableCell data-testid={`${testId}-type`}>
        <Badge variant="outline">{report.type}</Badge>
      </TableCell>
      <TableCell data-testid={`${testId}-status`}>
        <Badge variant={report.status === 'ready' ? 'success' : 'secondary'}>
          {report.status}
        </Badge>
      </TableCell>
      <TableCell data-testid={`${testId}-updated`}>
        {formatDistanceToNow(report.lastUpdated, { addSuffix: true })}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" data-testid={`${testId}-download`}>
          <Download className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AnalystDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch analyst-specific data
  const { data: metricsData, isLoading: loadingMetrics } = useQuery({
    queryKey: ['/api/analyst/metrics'],
    enabled: !!dashboardData,
  });

  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ['/api/analyst/reports'],
    enabled: !!dashboardData,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['/api/analyst/insights'],
    enabled: !!dashboardData,
  });

  // Loading state
  if (isLoadingData || loadingMetrics || loadingReports) {
    return (
      <div className="p-6 space-y-6" data-testid="dashboard-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6" data-testid="dashboard-error">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading dashboard</AlertTitle>
          <AlertDescription>
            {error.message || 'Something went wrong while loading your analyst dashboard.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="mt-4"
            data-testid="button-retry"
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  // Mock data for demonstration
  const mockData = {
    kpis: {
      revenue: { value: '$2.4M', change: 'from last month', changePercent: 12, trend: 'up' as const },
      conversion: { value: '3.2%', change: 'from last week', changePercent: 8, trend: 'up' as const },
      activeUsers: { value: '45.2K', change: 'from yesterday', changePercent: -2, trend: 'down' as const },
      avgOrderValue: { value: '$156', change: 'from last quarter', changePercent: 5, trend: 'up' as const },
    },
    insights: [
      {
        id: '1',
        title: 'Unusual spike in North America traffic',
        description: 'Traffic from NA region increased by 45% in the last 24 hours, primarily from organic search.',
        priority: 'high',
        impact: 'High positive impact on conversions',
      },
      {
        id: '2',
        title: 'Cart abandonment rate increasing',
        description: 'Cart abandonment has increased by 12% this week, particularly on mobile devices.',
        priority: 'medium',
        impact: 'Medium negative impact on revenue',
      },
      {
        id: '3',
        title: 'New customer segment identified',
        description: 'Analysis shows a growing segment of B2B customers with higher average order values.',
        priority: 'low',
        impact: 'Potential for targeted campaigns',
      },
    ],
    reports: [
      { id: '1', name: 'Monthly Performance Report', type: 'Performance', status: 'ready', lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: '2', name: 'Customer Segmentation Analysis', type: 'Analysis', status: 'ready', lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { id: '3', name: 'Q3 Financial Summary', type: 'Financial', status: 'processing', lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: '4', name: 'Market Trends Report', type: 'Market', status: 'ready', lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      { id: '5', name: 'Supply Chain Analytics', type: 'Operations', status: 'ready', lastUpdated: new Date(Date.now() - 72 * 60 * 60 * 1000) },
    ],
    trendData: [
      { month: 'Jan', revenue: 1200000, orders: 3200, customers: 28000 },
      { month: 'Feb', revenue: 1350000, orders: 3600, customers: 31000 },
      { month: 'Mar', revenue: 1480000, orders: 3900, customers: 34000 },
      { month: 'Apr', revenue: 1650000, orders: 4200, customers: 37000 },
      { month: 'May', revenue: 1890000, orders: 4800, customers: 41000 },
      { month: 'Jun', revenue: 2100000, orders: 5200, customers: 44000 },
      { month: 'Jul', revenue: 2400000, orders: 5800, customers: 48000 },
    ],
  };

  return (
    <div className="p-6 space-y-6" data-testid="analyst-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Data insights and business intelligence at your fingertips
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="button-generate-report">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" data-testid="button-refresh-data">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue"
          value={mockData.kpis.revenue.value}
          change={mockData.kpis.revenue.change}
          changePercent={mockData.kpis.revenue.changePercent}
          trend={mockData.kpis.revenue.trend}
          icon={DollarSign}
          testId="kpi-revenue"
        />
        <KPICard
          title="Conversion Rate"
          value={mockData.kpis.conversion.value}
          change={mockData.kpis.conversion.change}
          changePercent={mockData.kpis.conversion.changePercent}
          trend={mockData.kpis.conversion.trend}
          icon={Target}
          testId="kpi-conversion"
        />
        <KPICard
          title="Active Users"
          value={mockData.kpis.activeUsers.value}
          change={mockData.kpis.activeUsers.change}
          changePercent={mockData.kpis.activeUsers.changePercent}
          trend={mockData.kpis.activeUsers.trend}
          icon={Users}
          testId="kpi-active-users"
        />
        <KPICard
          title="Avg Order Value"
          value={mockData.kpis.avgOrderValue.value}
          change={mockData.kpis.avgOrderValue.change}
          changePercent={mockData.kpis.avgOrderValue.changePercent}
          trend={mockData.kpis.avgOrderValue.trend}
          icon={Package}
          testId="kpi-avg-order-value"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Trends</CardTitle>
                  <CardDescription>Revenue and customer growth over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-filter-trends">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="revenue" data-testid="tabs-trends">
                <TabsList>
                  <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
                  <TabsTrigger value="customers" data-testid="tab-customers">Customers</TabsTrigger>
                </TabsList>
                <TabsContent value="revenue" className="mt-4">
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <LineChart className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Revenue trend chart</span>
                  </div>
                </TabsContent>
                <TabsContent value="orders" className="mt-4">
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Orders trend chart</span>
                  </div>
                </TabsContent>
                <TabsContent value="customers" className="mt-4">
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <PieChart className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Customer growth chart</span>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generated reports and analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.reports.map((report) => (
                    <ReportRow
                      key={report.id}
                      report={report}
                      testId={`report-${report.id}`}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Insights & Quick Stats */}
        <div className="space-y-6">
          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>AI-powered data insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.insights.map((insight) => (
                <DataInsightCard
                  key={insight.id}
                  insight={insight}
                  testId={`insight-${insight.id}`}
                />
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
              <CardDescription>Real-time metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center" data-testid="stat-data-points">
                <span className="text-sm text-muted-foreground">Data Points Analyzed</span>
                <span className="text-sm font-medium">1.2M</span>
              </div>
              <div className="flex justify-between items-center" data-testid="stat-queries">
                <span className="text-sm text-muted-foreground">Queries Today</span>
                <span className="text-sm font-medium">847</span>
              </div>
              <div className="flex justify-between items-center" data-testid="stat-accuracy">
                <span className="text-sm text-muted-foreground">Prediction Accuracy</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <div className="flex justify-between items-center" data-testid="stat-processing">
                <span className="text-sm text-muted-foreground">Processing Time</span>
                <span className="text-sm font-medium">0.3s avg</span>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Connected integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800" data-testid="source-database">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-sm">Main Database</span>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800" data-testid="source-api">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm">Analytics API</span>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800" data-testid="source-warehouse">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm">Data Warehouse</span>
                  </div>
                  <Badge variant="success">Synced</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}