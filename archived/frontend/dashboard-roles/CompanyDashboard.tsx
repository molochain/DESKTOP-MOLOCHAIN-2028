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
  Building,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Package,
  Briefcase,
  Globe,
  Target,
  Award,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Handshake,
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  LineChart,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CompanyDashboardData } from '@/types/dashboards';

// Business Metric Card
function BusinessMetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  prefix,
  suffix,
  testId
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
  testId: string;
}) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground',
  };

  const changeIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: null,
  };

  const ChangeIcon = changeType ? changeIcons[changeType] : null;

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>
          {prefix}{value}{suffix}
        </div>
        {change && (
          <div className="flex items-center mt-1">
            {ChangeIcon && <ChangeIcon className={`h-3 w-3 mr-1 ${changeColors[changeType || 'neutral']}`} />}
            <p className={`text-xs ${changeColors[changeType || 'neutral']}`}>
              {change}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Department Performance Card
function DepartmentPerformanceCard({
  department,
  testId
}: {
  department: any;
  testId: string;
}) {
  const performanceColor = department.performance >= 80 ? 'text-green-600' : 
                          department.performance >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{department.name}</CardTitle>
            <CardDescription className="text-xs">
              Led by {department.head}
            </CardDescription>
          </div>
          <Badge variant={department.performance >= 80 ? 'success' : 'warning'}>
            {department.performance}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Employees</p>
            <p className="font-semibold" data-testid={`${testId}-employees`}>
              {department.employees}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Projects</p>
            <p className="font-semibold" data-testid={`${testId}-projects`}>
              {department.projects}
            </p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Budget Utilization</span>
            <span className={`font-medium ${department.budgetUsed > 90 ? 'text-red-600' : ''}`}>
              {department.budgetUsed}%
            </span>
          </div>
          <Progress value={department.budgetUsed} className="h-2" />
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Revenue</span>
            <span className="font-semibold" data-testid={`${testId}-revenue`}>
              ${(department.revenue / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Partnership Card
function PartnershipCard({
  partnership,
  testId
}: {
  partnership: any;
  testId: string;
}) {
  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${statusColors[partnership.status]} transition-all hover:shadow-sm`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Handshake className="h-4 w-4" />
          <h4 className="font-medium text-sm" data-testid={`${testId}-name`}>
            {partnership.name}
          </h4>
        </div>
        <Badge variant={partnership.status === 'active' ? 'success' : 'secondary'} className="text-xs">
          {partnership.status}
        </Badge>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type</span>
          <span data-testid={`${testId}-type`}>{partnership.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Value</span>
          <span className="font-semibold" data-testid={`${testId}-value`}>
            ${(partnership.value / 1000000).toFixed(2)}M
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Since</span>
          <span data-testid={`${testId}-since`}>
            {new Date(partnership.since).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Project Status Row
function ProjectRow({
  project,
  index,
  testId
}: {
  project: any;
  index: number;
  testId: string;
}) {
  const statusColors = {
    'On Track': 'success',
    'At Risk': 'warning',
    'Delayed': 'destructive',
    'Completed': 'secondary',
  } as const;

  return (
    <TableRow data-testid={testId}>
      <TableCell className="font-medium" data-testid={`${testId}-name`}>
        {project.name}
      </TableCell>
      <TableCell data-testid={`${testId}-department`}>
        {project.department}
      </TableCell>
      <TableCell>
        <Badge variant={statusColors[project.status as keyof typeof statusColors]} data-testid={`${testId}-status`}>
          {project.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right" data-testid={`${testId}-budget`}>
        ${(project.budget / 1000).toFixed(0)}K
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Progress value={project.completion} className="flex-1" />
          <span className="text-xs text-muted-foreground w-10" data-testid={`${testId}-completion`}>
            {project.completion}%
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground" data-testid={`${testId}-deadline`}>
        {new Date(project.deadline).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}

export default function CompanyDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch additional company-specific data
  const { data: financialData } = useQuery({
    queryKey: ['/api/company/financial-summary'],
    enabled: !!dashboardData,
  });

  const { data: departmentData } = useQuery({
    queryKey: ['/api/company/departments'],
    enabled: !!dashboardData,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['/api/company/projects'],
    enabled: !!dashboardData,
  });

  const { data: partnershipsData } = useQuery({
    queryKey: ['/api/company/partnerships'],
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
            {error.message || 'Failed to load company dashboard data.'}
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
    companyMetrics: {
      revenue: 125600000,
      revenueChange: '+15.3% YoY',
      profit: 18840000,
      profitChange: '+8.7% YoY',
      employees: 1234,
      employeeChange: '+124 this quarter',
      customers: 8567,
      customerChange: '+892 this month',
      marketShare: 23.4,
      marketShareChange: '+2.1% this year',
      nps: 72,
      npsChange: '+5 points',
    },
    financials: {
      revenue: 125600000,
      expenses: 106760000,
      profit: 18840000,
      cashFlow: 22400000,
      assets: 450000000,
      liabilities: 180000000,
      equity: 270000000,
      roi: 14.2,
    },
    departments: [
      { name: 'Operations', head: 'John Smith', employees: 245, projects: 18, performance: 87, budgetUsed: 72, revenue: 45600000 },
      { name: 'Technology', head: 'Sarah Johnson', employees: 189, projects: 12, performance: 92, budgetUsed: 68, revenue: 28900000 },
      { name: 'Sales & Marketing', head: 'Michael Chen', employees: 156, projects: 24, performance: 78, budgetUsed: 85, revenue: 67800000 },
      { name: 'Finance', head: 'Emily Davis', employees: 89, projects: 8, performance: 95, budgetUsed: 45, revenue: 12300000 },
      { name: 'Human Resources', head: 'Robert Wilson', employees: 67, projects: 6, performance: 83, budgetUsed: 52, revenue: 4500000 },
      { name: 'Legal & Compliance', head: 'Jessica Taylor', employees: 45, projects: 4, performance: 91, budgetUsed: 38, revenue: 3200000 },
    ],
    projects: [
      { name: 'Digital Transformation', department: 'Technology', status: 'On Track', budget: 2500000, completion: 65, deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      { name: 'Market Expansion APAC', department: 'Sales & Marketing', status: 'At Risk', budget: 1800000, completion: 45, deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) },
      { name: 'Supply Chain Optimization', department: 'Operations', status: 'On Track', budget: 1200000, completion: 78, deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { name: 'Customer Portal 2.0', department: 'Technology', status: 'Delayed', budget: 800000, completion: 32, deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { name: 'ESG Initiative', department: 'Legal & Compliance', status: 'On Track', budget: 600000, completion: 55, deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
    ],
    partnerships: [
      { name: 'Global Logistics Inc', type: 'Strategic', status: 'active', value: 45000000, since: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000) },
      { name: 'TechCorp Solutions', type: 'Technology', status: 'active', value: 12000000, since: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      { name: 'Maritime Alliance', type: 'Operational', status: 'active', value: 28000000, since: new Date(Date.now() - 540 * 24 * 60 * 60 * 1000) },
      { name: 'EcoShip Partners', type: 'Sustainability', status: 'pending', value: 8000000, since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    ],
    compliance: [
      { region: 'North America', score: 94, status: 'compliant' },
      { region: 'Europe', score: 91, status: 'compliant' },
      { region: 'Asia Pacific', score: 87, status: 'compliant' },
      { region: 'Middle East', score: 82, status: 'partial' },
      { region: 'Africa', score: 78, status: 'partial' },
    ],
  };

  const companyData = dashboardData as CompanyDashboardData | undefined;

  return (
    <div className="p-6 space-y-6" data-testid="company-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Company Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Enterprise-wide metrics and business intelligence
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="button-export-report">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button data-testid="button-view-analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BusinessMetricCard
          title="Annual Revenue"
          value={(mockData.companyMetrics.revenue / 1000000).toFixed(1) + 'M'}
          change={mockData.companyMetrics.revenueChange}
          changeType="positive"
          icon={DollarSign}
          prefix="$"
          testId="metric-revenue"
        />
        <BusinessMetricCard
          title="Net Profit"
          value={(mockData.companyMetrics.profit / 1000000).toFixed(1) + 'M'}
          change={mockData.companyMetrics.profitChange}
          changeType="positive"
          icon={TrendingUp}
          prefix="$"
          testId="metric-profit"
        />
        <BusinessMetricCard
          title="Total Employees"
          value={mockData.companyMetrics.employees.toLocaleString()}
          change={mockData.companyMetrics.employeeChange}
          changeType="positive"
          icon={Users}
          testId="metric-employees"
        />
        <BusinessMetricCard
          title="Active Customers"
          value={mockData.companyMetrics.customers.toLocaleString()}
          change={mockData.companyMetrics.customerChange}
          changeType="positive"
          icon={Globe}
          testId="metric-customers"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="metric-market-share">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Share</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-market-share-value">
              {mockData.companyMetrics.marketShare}%
            </div>
            <p className="text-xs text-green-600">
              {mockData.companyMetrics.marketShareChange}
            </p>
          </CardContent>
        </Card>
        <Card data-testid="metric-nps">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-nps-value">
              {mockData.companyMetrics.nps}
            </div>
            <p className="text-xs text-green-600">
              {mockData.companyMetrics.npsChange}
            </p>
          </CardContent>
        </Card>
        <Card data-testid="metric-cash-flow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-cash-flow-value">
              ${(mockData.financials.cashFlow / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Operating cash flow
            </p>
          </CardContent>
        </Card>
        <Card data-testid="metric-roi">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-roi-value">
              {mockData.financials.roi}%
            </div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Departments & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Performance */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" data-testid="text-departments-title">
                Department Performance
              </h2>
              <Button variant="ghost" size="sm" data-testid="button-view-all-departments">
                View All
                <ExternalLink className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockData.departments.slice(0, 4).map((dept, index) => (
                <DepartmentPerformanceCard 
                  key={dept.name}
                  department={dept}
                  testId={`department-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Major initiatives across departments</CardDescription>
                </div>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.projects.map((project, index) => (
                    <ProjectRow 
                      key={project.name}
                      project={project}
                      index={index}
                      testId={`project-${index}`}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Financial & Partnerships */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Financial Summary</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Q4 2024 Performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-semibold" data-testid="financial-revenue">
                    ${(mockData.financials.revenue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expenses</span>
                  <span className="font-semibold" data-testid="financial-expenses">
                    ${(mockData.financials.expenses / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Net Profit</span>
                  <span className="font-bold text-green-600" data-testid="financial-profit">
                    ${(mockData.financials.profit / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span data-testid="financial-margin">
                      {((mockData.financials.profit / mockData.financials.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(mockData.financials.profit / mockData.financials.revenue) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                data-testid="button-financial-report"
              >
                <Receipt className="mr-2 h-4 w-4" />
                View Financial Report
              </Button>
            </CardContent>
          </Card>

          {/* Strategic Partnerships */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Partnerships</CardTitle>
              <CardDescription>Key business alliances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.partnerships.map((partnership, index) => (
                  <PartnershipCard 
                    key={partnership.name}
                    partnership={partnership}
                    testId={`partnership-${index}`}
                  />
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                data-testid="button-manage-partnerships"
              >
                Manage Partnerships
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Compliance Status</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Regional compliance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.compliance.map((region, index) => (
                  <div key={region.region} className="space-y-1" data-testid={`compliance-${index}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{region.region}</span>
                      <div className="flex items-center space-x-2">
                        {region.status === 'compliant' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-muted-foreground" data-testid={`compliance-${index}-score`}>
                          {region.score}%
                        </span>
                      </div>
                    </div>
                    <Progress value={region.score} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}