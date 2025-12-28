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
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Target,
  Clock,
  Calendar,
  FileText,
  ChartBar,
  Award,
  UserCheck,
  Building,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DepartmentDashboardData } from '@/types/dashboards';

// Department Metric Card
function DepartmentMetricCard({
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

// Team Member Row
function TeamMemberRow({ member, testId }: { member: any; testId: string }) {
  return (
    <TableRow data-testid={testId}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium" data-testid={`${testId}-name`}>{member.name}</p>
            <p className="text-xs text-muted-foreground" data-testid={`${testId}-role`}>{member.role}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'success' : 'secondary'} data-testid={`${testId}-status`}>
          {member.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Progress value={member.performance} className="w-16 h-2" />
          <span className="text-xs text-muted-foreground" data-testid={`${testId}-performance`}>
            {member.performance}%
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-sm" data-testid={`${testId}-projects`}>{member.projectCount} projects</span>
      </TableCell>
    </TableRow>
  );
}

// Project Card
function ProjectCard({ project, testId }: { project: any; testId: string }) {
  const statusColors = {
    'on-track': 'text-green-600',
    'at-risk': 'text-yellow-600',
    'delayed': 'text-red-600',
    'completed': 'text-blue-600',
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base" data-testid={`${testId}-name`}>{project.name}</CardTitle>
          <Badge className={statusColors[project.status as keyof typeof statusColors]} data-testid={`${testId}-status`}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium" data-testid={`${testId}-progress`}>{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span data-testid={`${testId}-deadline`}>Due {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs" data-testid={`${testId}-team-size`}>{project.teamSize}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DepartmentDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch department-specific data
  const { data: departmentData, isLoading: loadingDepartment } = useQuery({
    queryKey: ['/api/department/overview'],
    enabled: !!dashboardData,
  });

  const { data: teamMembers, isLoading: loadingTeam } = useQuery({
    queryKey: ['/api/department/team'],
    enabled: !!dashboardData,
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['/api/department/projects'],
    enabled: !!dashboardData,
  });

  // Loading state
  if (isLoadingData || loadingDepartment || loadingTeam || loadingProjects) {
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
            {error.message || 'Something went wrong while loading the department dashboard.'}
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
    metrics: {
      teamSize: 24,
      activeProjects: 8,
      budgetUtilization: 78,
      kpiAchievement: 92,
    },
    teamMembers: [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Senior Developer',
        status: 'active',
        performance: 95,
        projectCount: 3,
      },
      {
        id: '2',
        name: 'Michael Chen',
        role: 'Project Manager',
        status: 'active',
        performance: 88,
        projectCount: 5,
      },
      {
        id: '3',
        name: 'Emily Davis',
        role: 'Business Analyst',
        status: 'active',
        performance: 91,
        projectCount: 4,
      },
      {
        id: '4',
        name: 'James Wilson',
        role: 'UX Designer',
        status: 'active',
        performance: 87,
        projectCount: 2,
      },
      {
        id: '5',
        name: 'Lisa Anderson',
        role: 'QA Engineer',
        status: 'active',
        performance: 93,
        projectCount: 4,
      },
    ],
    projects: [
      {
        id: '1',
        name: 'Supply Chain Optimization',
        status: 'on-track',
        progress: 75,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        teamSize: 6,
      },
      {
        id: '2',
        name: 'Customer Portal Redesign',
        status: 'at-risk',
        progress: 45,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        teamSize: 4,
      },
      {
        id: '3',
        name: 'Warehouse Automation',
        status: 'on-track',
        progress: 60,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        teamSize: 8,
      },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'achievement',
        title: 'Q3 Target Achieved',
        description: 'Department exceeded quarterly targets by 15%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'milestone',
        title: 'Project Milestone Completed',
        description: 'Phase 2 of Supply Chain Optimization completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        type: 'team',
        title: 'New Team Member',
        description: 'Alex Thompson joined as Senior Developer',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    ],
  };

  const deptData = dashboardData as DepartmentDashboardData | undefined;

  return (
    <div className="p-6 space-y-6" data-testid="department-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Department Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Monitor your department's performance and team activities
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="button-new-project">
            <Briefcase className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button variant="outline" data-testid="button-team-overview">
            <Users className="mr-2 h-4 w-4" />
            Team Overview
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DepartmentMetricCard
          title="Team Size"
          value={mockData.metrics.teamSize}
          change="+2 this month"
          icon={Users}
          trend="up"
          testId="metric-team-size"
        />
        <DepartmentMetricCard
          title="Active Projects"
          value={mockData.metrics.activeProjects}
          change="3 near deadline"
          icon={Briefcase}
          trend="neutral"
          testId="metric-active-projects"
        />
        <DepartmentMetricCard
          title="Budget Utilization"
          value={`${mockData.metrics.budgetUtilization}%`}
          change="+5% from last month"
          icon={DollarSign}
          trend="up"
          testId="metric-budget"
        />
        <DepartmentMetricCard
          title="KPI Achievement"
          value={`${mockData.metrics.kpiAchievement}%`}
          change="Above target"
          icon={Target}
          trend="up"
          testId="metric-kpi"
        />
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">Projects</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Current team roster and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Projects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.teamMembers.map((member, index) => (
                    <TeamMemberRow
                      key={member.id}
                      member={member}
                      testId={`team-member-${index}`}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                testId={`project-card-${index}`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Key performance indicators and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Overall KPI Achievement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={92} className="w-32" />
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Project On-Time Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={85} className="w-32" />
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Quality Score</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={88} className="w-32" />
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Team Satisfaction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={90} className="w-32" />
                    <span className="text-sm font-medium">90%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest department updates and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {mockData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {activity.type === 'achievement' && <Award className="h-4 w-4 text-primary" />}
                        {activity.type === 'milestone' && <CheckCircle className="h-4 w-4 text-primary" />}
                        {activity.type === 'team' && <Users className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}