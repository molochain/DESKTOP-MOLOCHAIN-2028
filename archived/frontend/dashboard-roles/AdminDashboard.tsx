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
  Shield,
  Users,
  Activity,
  DollarSign,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Database,
  Globe,
  Lock,
  Settings,
  BarChart3,
  UserCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AdminDashboardData } from '@/types/dashboards';

// System Metric Card
function SystemMetricCard({
  title,
  value,
  unit,
  percentage,
  status,
  icon: Icon,
  testId
}: {
  title: string;
  value: number | string;
  unit?: string;
  percentage?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  testId: string;
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${statusColors[status]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>
          {value}{unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </div>
        {percentage !== undefined && (
          <div className="flex items-center mt-2">
            <Progress value={percentage} className="flex-1" />
            <span className="ml-2 text-xs text-muted-foreground">{percentage}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Department Card
function DepartmentCard({
  department,
  testId
}: {
  department: any;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{department.name}</CardTitle>
          <Badge variant={department.status === 'active' ? 'success' : 'secondary'}>
            {department.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Employees</span>
          <span className="font-medium" data-testid={`${testId}-employees`}>{department.employeeCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Projects</span>
          <span className="font-medium" data-testid={`${testId}-projects`}>{department.projectCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget Used</span>
          <span className="font-medium" data-testid={`${testId}-budget`}>{department.budgetUsed}%</span>
        </div>
        <Progress value={department.budgetUsed} className="h-2 mt-2" />
      </CardContent>
    </Card>
  );
}

// Security Alert Item
function SecurityAlert({
  alert,
  testId
}: {
  alert: any;
  testId: string;
}) {
  const severityColors = {
    low: 'text-blue-600 bg-blue-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50',
  };

  const severityIcons = {
    low: AlertCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: XCircle,
  };

  const Icon = severityIcons[alert.severity];

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" data-testid={testId}>
      <div className={`p-2 rounded-lg ${severityColors[alert.severity]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" data-testid={`${testId}-title`}>{alert.title}</p>
          <Badge variant={alert.acknowledged ? 'secondary' : 'destructive'} className="text-xs">
            {alert.acknowledged ? 'Acknowledged' : 'New'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-description`}>
          {alert.description}
        </p>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-time`}>
          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch additional admin-specific data
  const { data: systemHealth } = useQuery({
    queryKey: ['/api/admin/system-health'],
    enabled: !!dashboardData,
  });

  const { data: userActivity } = useQuery({
    queryKey: ['/api/admin/user-activity'],
    enabled: !!dashboardData,
  });

  const { data: securityAlerts } = useQuery({
    queryKey: ['/api/admin/security-alerts'],
    enabled: !!dashboardData,
  });

  const { data: complianceStatus } = useQuery({
    queryKey: ['/api/admin/compliance'],
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
            {error.message || 'Failed to load admin dashboard data.'}
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
    systemMetrics: {
      cpuUsage: 45,
      memoryUsage: 68,
      diskUsage: 72,
      networkTraffic: 234,
      uptime: '45 days',
      activeConnections: 1234,
    },
    userStats: {
      totalUsers: 15234,
      activeUsers: 8456,
      newToday: 124,
      onlineNow: 2341,
    },
    departments: [
      { name: 'Operations', status: 'active', employeeCount: 45, projectCount: 12, budgetUsed: 67 },
      { name: 'Technology', status: 'active', employeeCount: 32, projectCount: 8, budgetUsed: 82 },
      { name: 'Marketing', status: 'active', employeeCount: 28, projectCount: 6, budgetUsed: 45 },
      { name: 'Finance', status: 'active', employeeCount: 18, projectCount: 4, budgetUsed: 55 },
    ],
    recentActivity: [
      { id: '1', user: 'admin@molochain.com', action: 'Updated system configuration', timestamp: new Date(Date.now() - 15 * 60 * 1000), status: 'success' },
      { id: '2', user: 'john.doe@molochain.com', action: 'Exported user data', timestamp: new Date(Date.now() - 30 * 60 * 1000), status: 'success' },
      { id: '3', user: 'system', action: 'Automated backup completed', timestamp: new Date(Date.now() - 60 * 60 * 1000), status: 'success' },
      { id: '4', user: 'jane.smith@molochain.com', action: 'Failed login attempt', timestamp: new Date(Date.now() - 90 * 60 * 1000), status: 'failed' },
      { id: '5', user: 'system', action: 'Security scan completed', timestamp: new Date(Date.now() - 120 * 60 * 1000), status: 'success' },
    ],
    securityAlerts: [
      { id: '1', severity: 'critical', title: 'Multiple failed login attempts', description: 'Detected 5 failed login attempts from IP 192.168.1.100', timestamp: new Date(Date.now() - 5 * 60 * 1000), acknowledged: false },
      { id: '2', severity: 'high', title: 'Unusual database activity', description: 'High number of queries from user service', timestamp: new Date(Date.now() - 20 * 60 * 1000), acknowledged: false },
      { id: '3', severity: 'medium', title: 'SSL certificate expiring', description: 'SSL certificate for api.molochain.com expires in 30 days', timestamp: new Date(Date.now() - 60 * 60 * 1000), acknowledged: true },
      { id: '4', severity: 'low', title: 'System update available', description: 'Security patches available for 3 packages', timestamp: new Date(Date.now() - 120 * 60 * 1000), acknowledged: true },
    ],
    compliance: [
      { region: 'EU', status: 'compliant', score: 95 },
      { region: 'US', status: 'compliant', score: 92 },
      { region: 'ASIA', status: 'partial', score: 78 },
      { region: 'UK', status: 'compliant', score: 88 },
    ],
  };

  const adminData = dashboardData as AdminDashboardData | undefined;

  return (
    <div className="p-6 space-y-6" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            System overview and administration
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="button-system-settings">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
          <Button data-testid="button-view-reports">
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemMetricCard
          title="CPU Usage"
          value={mockData.systemMetrics.cpuUsage}
          unit="%"
          percentage={mockData.systemMetrics.cpuUsage}
          status="good"
          icon={Cpu}
          testId="metric-cpu"
        />
        <SystemMetricCard
          title="Memory Usage"
          value={mockData.systemMetrics.memoryUsage}
          unit="%"
          percentage={mockData.systemMetrics.memoryUsage}
          status="warning"
          icon={Server}
          testId="metric-memory"
        />
        <SystemMetricCard
          title="Disk Usage"
          value={mockData.systemMetrics.diskUsage}
          unit="%"
          percentage={mockData.systemMetrics.diskUsage}
          status="warning"
          icon={HardDrive}
          testId="metric-disk"
        />
        <SystemMetricCard
          title="Network Traffic"
          value={mockData.systemMetrics.networkTraffic}
          unit="MB/s"
          status="good"
          icon={Wifi}
          testId="metric-network"
        />
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users-value">
              {mockData.userStats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{mockData.userStats.newToday} today
            </p>
          </CardContent>
        </Card>
        <Card data-testid="stat-active-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-users-value">
              {mockData.userStats.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card data-testid="stat-online-now">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-online-now-value">
              {mockData.userStats.onlineNow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time count
            </p>
          </CardContent>
        </Card>
        <Card data-testid="stat-uptime">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-uptime-value">
              {mockData.systemMetrics.uptime}
            </div>
            <p className="text-xs text-muted-foreground">
              99.9% availability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity & Departments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" data-testid="text-departments-title">
                Department Overview
              </h2>
              <Button variant="ghost" size="sm" data-testid="button-manage-departments">
                Manage
                <ExternalLink className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockData.departments.map((dept, index) => (
                <DepartmentCard 
                  key={dept.name}
                  department={dept}
                  testId={`department-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Activity</CardTitle>
              <CardDescription>Latest administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockData.recentActivity.map((activity, index) => (
                      <TableRow key={activity.id} data-testid={`activity-row-${index}`}>
                        <TableCell className="font-medium" data-testid={`activity-${index}-user`}>
                          {activity.user}
                        </TableCell>
                        <TableCell data-testid={`activity-${index}-action`}>
                          {activity.action}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`activity-${index}-time`}>
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={activity.status === 'success' ? 'success' : 'destructive'}
                            data-testid={`activity-${index}-status`}
                          >
                            {activity.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Security & Compliance */}
        <div className="space-y-6">
          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Alerts</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Recent security events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {mockData.securityAlerts.map((alert, index) => (
                    <SecurityAlert 
                      key={alert.id}
                      alert={alert}
                      testId={`security-alert-${index}`}
                    />
                  ))}
                </div>
              </ScrollArea>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                data-testid="button-view-all-alerts"
              >
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Regional compliance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.compliance.map((region, index) => (
                  <div key={region.region} className="space-y-2" data-testid={`compliance-${index}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{region.region}</span>
                      <div className="flex items-center space-x-2">
                        {region.status === 'compliant' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-muted-foreground" data-testid={`compliance-${index}-score`}>
                          {region.score}%
                        </span>
                      </div>
                    </div>
                    <Progress value={region.score} className="h-2" />
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                data-testid="button-compliance-report"
              >
                Generate Compliance Report
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="button-manage-users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-system-backup">
                <Database className="mr-2 h-4 w-4" />
                System Backup
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-security-settings">
                <Lock className="mr-2 h-4 w-4" />
                Security Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-audit-logs">
                <FileText className="mr-2 h-4 w-4" />
                Audit Logs
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-api-management">
                <Globe className="mr-2 h-4 w-4" />
                API Management
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}