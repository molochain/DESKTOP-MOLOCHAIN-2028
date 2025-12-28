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
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  UserPlus,
  FolderOpen,
  Award,
  DollarSign,
  UserCheck,
  ListTodo,
  PieChart,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Metric Card Component
function MetricCard({
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

// Team Member Card
function TeamMemberCard({
  member,
  testId
}: {
  member: any;
  testId: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid={testId}>
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm" data-testid={`${testId}-name`}>{member.name}</p>
          <p className="text-xs text-muted-foreground" data-testid={`${testId}-role`}>{member.role}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={member.status === 'active' ? 'success' : 'secondary'} data-testid={`${testId}-status`}>
          {member.status}
        </Badge>
        <p className="text-xs text-muted-foreground mt-1" data-testid={`${testId}-performance`}>
          Performance: {member.performance}%
        </p>
      </div>
    </div>
  );
}

// Project Card
function ProjectCard({
  project,
  testId
}: {
  project: any;
  testId: string;
}) {
  const statusColors = {
    'on-track': 'text-green-600',
    'at-risk': 'text-yellow-600',
    'delayed': 'text-red-600',
    'completed': 'text-blue-600',
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base" data-testid={`${testId}-name`}>{project.name}</CardTitle>
          <Badge className={statusColors[project.status]} data-testid={`${testId}-status`}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Team Size</span>
          <span className="font-medium" data-testid={`${testId}-team-size`}>{project.teamSize} members</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget Used</span>
          <span className="font-medium" data-testid={`${testId}-budget`}>{project.budgetUsed}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground" data-testid={`${testId}-progress`}>Progress: {project.progress}%</span>
          <span className="text-muted-foreground" data-testid={`${testId}-deadline`}>
            Due: {new Date(project.deadline).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagerDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch manager-specific data
  const { data: teamData, isLoading: loadingTeam } = useQuery({
    queryKey: ['/api/manager/team'],
    enabled: !!dashboardData,
  });

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['/api/manager/projects'],
    enabled: !!dashboardData,
  });

  const { data: performanceData } = useQuery({
    queryKey: ['/api/manager/performance'],
    enabled: !!dashboardData,
  });

  // Loading state
  if (isLoadingData || loadingTeam || loadingProjects) {
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
            {error.message || 'Something went wrong while loading your manager dashboard.'}
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
    metrics: {
      teamSize: 24,
      activeProjects: 7,
      completionRate: 89,
      resourceUtilization: 78,
    },
    team: [
      { id: '1', name: 'Sarah Johnson', role: 'Senior Developer', status: 'active', performance: 92 },
      { id: '2', name: 'Mike Chen', role: 'Product Designer', status: 'active', performance: 88 },
      { id: '3', name: 'Emily Davis', role: 'QA Engineer', status: 'active', performance: 95 },
      { id: '4', name: 'Alex Wilson', role: 'Backend Developer', status: 'away', performance: 85 },
      { id: '5', name: 'Jessica Brown', role: 'Frontend Developer', status: 'active', performance: 90 },
    ],
    projects: [
      {
        id: '1',
        name: 'Supply Chain Platform',
        status: 'on-track',
        progress: 65,
        teamSize: 8,
        budgetUsed: 58,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Customer Portal v2',
        status: 'at-risk',
        progress: 45,
        teamSize: 6,
        budgetUsed: 72,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        name: 'Mobile App Redesign',
        status: 'on-track',
        progress: 80,
        teamSize: 5,
        budgetUsed: 65,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    ],
    recentActivities: [
      { id: '1', type: 'project', title: 'Sprint planning completed', time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: '2', type: 'team', title: 'New team member onboarded', time: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { id: '3', type: 'milestone', title: 'Phase 2 milestone achieved', time: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: '4', type: 'review', title: 'Quarterly performance reviews completed', time: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    ],
    tasks: [
      { id: '1', title: 'Review Q4 budget allocation', priority: 'high', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { id: '2', title: 'Conduct 1-on-1 meetings', priority: 'medium', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
      { id: '3', title: 'Approve vacation requests', priority: 'low', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { id: '4', title: 'Update project roadmap', priority: 'high', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
    ],
  };

  return (
    <div className="p-6 space-y-6" data-testid="manager-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Oversee your teams and projects effectively
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="button-new-project">
            <FolderOpen className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button variant="outline" data-testid="button-add-member">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Team Size"
          value={mockData.metrics.teamSize}
          change="+2 this month"
          icon={Users}
          trend="up"
          testId="metric-team-size"
        />
        <MetricCard
          title="Active Projects"
          value={mockData.metrics.activeProjects}
          change="3 in progress"
          icon={Briefcase}
          trend="neutral"
          testId="metric-active-projects"
        />
        <MetricCard
          title="Completion Rate"
          value={`${mockData.metrics.completionRate}%`}
          change="+5% from last month"
          icon={Target}
          trend="up"
          testId="metric-completion-rate"
        />
        <MetricCard
          title="Resource Utilization"
          value={`${mockData.metrics.resourceUtilization}%`}
          change="Optimal range"
          icon={Activity}
          trend="neutral"
          testId="metric-resource-utilization"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Monitor progress and resource allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  testId={`project-${project.id}`}
                />
              ))}
              <Button variant="ghost" className="w-full" data-testid="button-view-all-projects">
                View All Projects
              </Button>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Your priority items for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {mockData.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium" data-testid={`task-${task.id}-title`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`task-${task.id}-due`}>
                            Due: {task.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                        data-testid={`task-${task.id}-priority`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Team & Activity */}
        <div className="space-y-6">
          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Current team status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.team.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  testId={`team-member-${member.id}`}
                />
              ))}
              <Button variant="ghost" className="w-full" data-testid="button-view-all-team">
                View Full Team
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest team and project updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {mockData.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-2 text-sm"
                      data-testid={`activity-${activity.id}`}
                    >
                      <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p data-testid={`activity-${activity.id}-title`}>{activity.title}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`activity-${activity.id}-time`}>
                          {formatDistanceToNow(activity.time, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}