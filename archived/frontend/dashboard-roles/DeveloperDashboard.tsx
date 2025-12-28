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
  Code,
  Database,
  GitBranch,
  Globe,
  Cpu,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Terminal,
  FileCode,
  Zap,
  Shield,
  Package,
  Book,
  RefreshCw,
  ExternalLink,
  Wifi,
  Activity,
  Server,
  Bug,
  Rocket,
  GitCommit,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DeveloperDashboardData } from '@/types/dashboards';

// API Metric Card
function ApiMetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  testId
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        {change && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Deployment Card
function DeploymentCard({
  deployment,
  testId
}: {
  deployment: any;
  testId: string;
}) {
  const statusColors = {
    success: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    pending: 'text-yellow-600 bg-yellow-50',
    in_progress: 'text-blue-600 bg-blue-50',
  };

  const statusIcons = {
    success: CheckCircle,
    failed: XCircle,
    pending: Clock,
    in_progress: RefreshCw,
  };

  const Icon = statusIcons[deployment.status];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors" data-testid={testId}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${statusColors[deployment.status]}`}>
          <Icon className={`h-4 w-4 ${deployment.status === 'in_progress' ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <p className="text-sm font-medium" data-testid={`${testId}-name`}>{deployment.name}</p>
          <p className="text-xs text-muted-foreground" data-testid={`${testId}-environment`}>
            {deployment.environment} • v{deployment.version}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-time`}>
          {formatDistanceToNow(new Date(deployment.timestamp), { addSuffix: true })}
        </p>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-author`}>
          by {deployment.author}
        </p>
      </div>
    </div>
  );
}

// API Endpoint Row
function ApiEndpointRow({
  endpoint,
  index,
  testId
}: {
  endpoint: any;
  index: number;
  testId: string;
}) {
  const methodColors = {
    GET: 'text-green-600 bg-green-50',
    POST: 'text-blue-600 bg-blue-50',
    PUT: 'text-yellow-600 bg-yellow-50',
    DELETE: 'text-red-600 bg-red-50',
    PATCH: 'text-purple-600 bg-purple-50',
  };

  return (
    <TableRow data-testid={testId}>
      <TableCell>
        <Badge className={`${methodColors[endpoint.method]} border-0`} data-testid={`${testId}-method`}>
          {endpoint.method}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-sm" data-testid={`${testId}-path`}>
        {endpoint.path}
      </TableCell>
      <TableCell className="text-right" data-testid={`${testId}-calls`}>
        {endpoint.calls.toLocaleString()}
      </TableCell>
      <TableCell className="text-right" data-testid={`${testId}-avg-time`}>
        {endpoint.avgTime}ms
      </TableCell>
      <TableCell className="text-right">
        <Badge 
          variant={endpoint.errorRate < 1 ? 'success' : endpoint.errorRate < 5 ? 'warning' : 'destructive'}
          data-testid={`${testId}-error-rate`}
        >
          {endpoint.errorRate}%
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export default function DeveloperDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch additional developer-specific data
  const { data: apiMetrics } = useQuery({
    queryKey: ['/api/developer/api-metrics'],
    enabled: !!dashboardData,
  });

  const { data: deployments } = useQuery({
    queryKey: ['/api/developer/deployments'],
    enabled: !!dashboardData,
  });

  const { data: buildStatus } = useQuery({
    queryKey: ['/api/developer/build-status'],
    enabled: !!dashboardData,
  });

  const { data: websocketStatus } = useQuery({
    queryKey: ['/api/developer/websocket-status'],
    enabled: !!dashboardData,
  });

  // Loading state
  if (isLoadingData) {
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
            {error.message || 'Failed to load developer dashboard data.'}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="mt-4"
            data-testid="button-retry"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  // Mock data for demonstration
  const mockData = {
    apiMetrics: {
      totalRequests: 1456789,
      avgResponseTime: 234,
      errorRate: 0.8,
      uptime: 99.95,
      activeConnections: 342,
      requestsPerSecond: 156,
      dataTransferred: '2.4 TB',
      cacheHitRate: 87,
    },
    topEndpoints: [
      { method: 'GET', path: '/api/shipments', calls: 45678, avgTime: 123, errorRate: 0.2 },
      { method: 'POST', path: '/api/quotes', calls: 34567, avgTime: 234, errorRate: 0.5 },
      { method: 'GET', path: '/api/tracking/:id', calls: 23456, avgTime: 89, errorRate: 0.1 },
      { method: 'PUT', path: '/api/bookings/:id', calls: 12345, avgTime: 345, errorRate: 1.2 },
      { method: 'DELETE', path: '/api/drafts/:id', calls: 8901, avgTime: 56, errorRate: 0.0 },
    ],
    recentDeployments: [
      { name: 'API v2.3.1', environment: 'production', version: '2.3.1', status: 'success', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), author: 'CI/CD Bot' },
      { name: 'Frontend Hotfix', environment: 'production', version: '1.8.5', status: 'success', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), author: 'john.doe' },
      { name: 'Database Migration', environment: 'staging', version: '3.0.0', status: 'in_progress', timestamp: new Date(Date.now() - 10 * 60 * 1000), author: 'jane.smith' },
      { name: 'Security Patch', environment: 'development', version: '2.3.2-beta', status: 'failed', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), author: 'CI/CD Bot' },
    ],
    buildMetrics: {
      successRate: 92,
      avgBuildTime: 4.5,
      testsPass: 1234,
      testsFail: 12,
      codeCoverage: 78,
    },
    websocketConnections: {
      total: 234,
      active: 189,
      namespaces: [
        { name: '/tracking', connections: 89, status: 'healthy' },
        { name: '/notifications', connections: 67, status: 'healthy' },
        { name: '/realtime', connections: 45, status: 'warning' },
        { name: '/analytics', connections: 33, status: 'healthy' },
      ],
    },
    documentation: [
      { title: 'API Reference', url: '/docs/api', updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { title: 'WebSocket Guide', url: '/docs/websocket', updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { title: 'Authentication', url: '/docs/auth', updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { title: 'Rate Limiting', url: '/docs/rate-limits', updated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ],
  };

  const developerData = dashboardData as DeveloperDashboardData | undefined;

  return (
    <div className="p-6 space-y-6" data-testid="developer-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Developer Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            API metrics, deployments, and development resources
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="button-api-docs">
            <Book className="mr-2 h-4 w-4" />
            API Docs
          </Button>
          <Button data-testid="button-deploy">
            <Rocket className="mr-2 h-4 w-4" />
            Deploy
          </Button>
        </div>
      </div>

      {/* API Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ApiMetricCard
          title="Total Requests"
          value={(mockData.apiMetrics.totalRequests / 1000000).toFixed(2) + 'M'}
          change="+12% from yesterday"
          icon={Globe}
          trend="up"
          testId="metric-requests"
        />
        <ApiMetricCard
          title="Avg Response Time"
          value={mockData.apiMetrics.avgResponseTime + 'ms'}
          change="-5ms from average"
          icon={Clock}
          trend="down"
          testId="metric-response-time"
        />
        <ApiMetricCard
          title="Error Rate"
          value={mockData.apiMetrics.errorRate + '%'}
          change="Within normal range"
          icon={Bug}
          trend="neutral"
          testId="metric-error-rate"
        />
        <ApiMetricCard
          title="API Uptime"
          value={mockData.apiMetrics.uptime + '%'}
          change="Last 30 days"
          icon={Zap}
          trend="neutral"
          testId="metric-uptime"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="metric-connections">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-connections-value">
              {mockData.apiMetrics.activeConnections}
            </div>
            <p className="text-xs text-muted-foreground">WebSocket & HTTP</p>
          </CardContent>
        </Card>
        <Card data-testid="metric-rps">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-rps-value">
              {mockData.apiMetrics.requestsPerSecond}
            </div>
            <p className="text-xs text-muted-foreground">Current throughput</p>
          </CardContent>
        </Card>
        <Card data-testid="metric-data">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-data-value">
              {mockData.apiMetrics.dataTransferred}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card data-testid="metric-cache">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-cache-value">
              {mockData.apiMetrics.cacheHitRate}%
            </div>
            <p className="text-xs text-muted-foreground">Performance boost</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - API & Deployments */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Top API Endpoints</CardTitle>
              <CardDescription>Most frequently accessed endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead className="text-right">Error Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.topEndpoints.map((endpoint, index) => (
                    <ApiEndpointRow 
                      key={`${endpoint.method}-${endpoint.path}`}
                      endpoint={endpoint}
                      index={index}
                      testId={`endpoint-${index}`}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Deployments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Deployments</CardTitle>
                  <CardDescription>Latest deployment activity</CardDescription>
                </div>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.recentDeployments.map((deployment, index) => (
                  <DeploymentCard 
                    key={`${deployment.name}-${deployment.timestamp}`}
                    deployment={deployment}
                    testId={`deployment-${index}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Build Status */}
          <Card>
            <CardHeader>
              <CardTitle>Build & Test Metrics</CardTitle>
              <CardDescription>CI/CD pipeline statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold" data-testid="build-success-rate">
                      {mockData.buildMetrics.successRate}%
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Build Time</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold" data-testid="build-avg-time">
                      {mockData.buildMetrics.avgBuildTime}m
                    </span>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Code Coverage</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold" data-testid="build-coverage">
                      {mockData.buildMetrics.codeCoverage}%
                    </span>
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tests Passed</p>
                  <span className="text-lg font-semibold text-green-600" data-testid="tests-passed">
                    {mockData.buildMetrics.testsPass}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tests Failed</p>
                  <span className="text-lg font-semibold text-red-600" data-testid="tests-failed">
                    {mockData.buildMetrics.testsFail}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                  <span className="text-lg font-semibold" data-testid="tests-total">
                    {mockData.buildMetrics.testsPass + mockData.buildMetrics.testsFail}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - WebSocket & Resources */}
        <div className="space-y-6">
          {/* WebSocket Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>WebSocket Status</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Real-time connection monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Connections</span>
                  <span className="font-medium" data-testid="ws-total">
                    {mockData.websocketConnections.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-medium text-green-600" data-testid="ws-active">
                    {mockData.websocketConnections.active}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-3">Namespaces</p>
                  <div className="space-y-2">
                    {mockData.websocketConnections.namespaces.map((ns, index) => (
                      <div key={ns.name} className="space-y-1" data-testid={`ws-namespace-${index}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono">{ns.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">{ns.connections}</span>
                            <Badge 
                              variant={ns.status === 'healthy' ? 'success' : 'warning'}
                              className="text-xs"
                            >
                              {ns.status}
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={(ns.connections / mockData.websocketConnections.total) * 100} 
                          className="h-1" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Quick access to developer resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockData.documentation.map((doc, index) => (
                  <Button 
                    key={doc.url}
                    variant="outline" 
                    className="w-full justify-between"
                    data-testid={`doc-link-${index}`}
                  >
                    <span className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      {doc.title}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>Quick access to development tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="button-api-explorer">
                <Terminal className="mr-2 h-4 w-4" />
                API Explorer
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-database-manager">
                <Database className="mr-2 h-4 w-4" />
                Database Manager
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-logs-viewer">
                <FileCode className="mr-2 h-4 w-4" />
                Logs Viewer
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-monitoring">
                <Activity className="mr-2 h-4 w-4" />
                Monitoring
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-git-repos">
                <GitCommit className="mr-2 h-4 w-4" />
                Git Repositories
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-ci-cd">
                <Package className="mr-2 h-4 w-4" />
                CI/CD Pipeline
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}