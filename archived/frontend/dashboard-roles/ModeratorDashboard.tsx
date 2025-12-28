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
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  User,
  MessageSquare,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Ban,
  UserX,
  Trash2,
  ThumbsUp,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Moderation Metric Card
function ModerationMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  testId
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  testId: string;
}) {
  const variantColors = {
    default: 'text-muted-foreground',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    success: 'text-green-600',
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantColors[variant || 'default']}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1" data-testid={`${testId}-subtitle`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Content Item Card
function ContentItemCard({
  item,
  onApprove,
  onReject,
  onFlag,
  testId
}: {
  item: any;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
  testId: string;
}) {
  const typeIcons = {
    post: FileText,
    comment: MessageSquare,
    user: User,
  };

  const severityColors = {
    low: 'secondary',
    medium: 'default',
    high: 'warning',
    critical: 'destructive',
  };

  const Icon = typeIcons[item.type];

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium" data-testid={`${testId}-type`}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
          </div>
          <Badge variant={severityColors[item.severity]} data-testid={`${testId}-severity`}>
            {item.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium" data-testid={`${testId}-author`}>
            {item.author}
          </p>
          <p className="text-sm text-muted-foreground mt-1" data-testid={`${testId}-content`}>
            {item.content}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid={`${testId}-time`}>
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
          <span data-testid={`${testId}-reports`}>
            {item.reports} reports
          </span>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={onApprove}
            data-testid={`${testId}-approve`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-red-600"
            onClick={onReject}
            data-testid={`${testId}-reject`}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onFlag}
            data-testid={`${testId}-flag`}
          >
            <Flag className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Item
function AlertItem({
  alert,
  testId
}: {
  alert: any;
  testId: string;
}) {
  const typeColors = {
    spam: 'text-yellow-600',
    abuse: 'text-red-600',
    violation: 'text-orange-600',
    suspicious: 'text-purple-600',
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid={testId}>
      <AlertTriangle className={`h-4 w-4 mt-0.5 ${typeColors[alert.type]}`} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" data-testid={`${testId}-title`}>{alert.title}</p>
          <Badge variant="outline" data-testid={`${testId}-type`}>{alert.type}</Badge>
        </div>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-description`}>
          {alert.description}
        </p>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-time`}>
          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default function ModeratorDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  // Fetch moderator-specific data
  const { data: queueData, isLoading: loadingQueue } = useQuery({
    queryKey: ['/api/moderator/queue'],
    enabled: !!dashboardData,
  });

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/moderator/stats'],
    enabled: !!dashboardData,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['/api/moderator/alerts'],
    enabled: !!dashboardData,
  });

  // Loading state
  if (isLoadingData || loadingQueue || loadingStats) {
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
            {error.message || 'Something went wrong while loading your moderator dashboard.'}
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
      pendingReview: 47,
      reviewedToday: 124,
      flaggedContent: 8,
      accuracyRate: 96.5,
    },
    queue: [
      {
        id: '1',
        type: 'post',
        author: 'user_12345',
        content: 'Check out this amazing new shipping route optimization tool I found...',
        severity: 'low',
        reports: 2,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: '2',
        type: 'comment',
        author: 'trader_xyz',
        content: 'This pricing seems suspicious, might be a scam...',
        severity: 'high',
        reports: 5,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: '3',
        type: 'user',
        author: 'new_account_99',
        content: 'Multiple spam posts detected from this account',
        severity: 'critical',
        reports: 12,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
    ],
    alerts: [
      {
        id: '1',
        type: 'spam',
        title: 'Spike in spam activity detected',
        description: '15% increase in spam reports in the last hour',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: '2',
        type: 'abuse',
        title: 'Abusive content reported',
        description: 'Multiple users reported harassment in shipping forum',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: '3',
        type: 'violation',
        title: 'Terms violation detected',
        description: 'User attempting to share prohibited content',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '4',
        type: 'suspicious',
        title: 'Suspicious account activity',
        description: 'Bot-like behavior detected from 3 accounts',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ],
    recentActions: [
      { id: '1', action: 'approved', content: 'Shipping rate comparison post', moderator: 'You', time: new Date(Date.now() - 5 * 60 * 1000) },
      { id: '2', action: 'rejected', content: 'Spam advertisement', moderator: 'You', time: new Date(Date.now() - 10 * 60 * 1000) },
      { id: '3', action: 'flagged', content: 'Suspicious pricing information', moderator: 'You', time: new Date(Date.now() - 20 * 60 * 1000) },
      { id: '4', action: 'banned', content: 'User account for repeated violations', moderator: 'You', time: new Date(Date.now() - 30 * 60 * 1000) },
    ],
  };

  const handleApprove = (itemId: string) => {
    console.log('Approving item:', itemId);
  };

  const handleReject = (itemId: string) => {
    console.log('Rejecting item:', itemId);
  };

  const handleFlag = (itemId: string) => {
    console.log('Flagging item:', itemId);
  };

  return (
    <div className="p-6 space-y-6" data-testid="moderator-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Moderation Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Review and manage platform content and user activity
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="button-filter">
            <Filter className="mr-2 h-4 w-4" />
            Filter Queue
          </Button>
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModerationMetricCard
          title="Pending Review"
          value={mockData.metrics.pendingReview}
          subtitle="Items awaiting moderation"
          icon={Clock}
          variant="warning"
          testId="metric-pending"
        />
        <ModerationMetricCard
          title="Reviewed Today"
          value={mockData.metrics.reviewedToday}
          subtitle="+15% from yesterday"
          icon={CheckCircle}
          variant="success"
          testId="metric-reviewed"
        />
        <ModerationMetricCard
          title="Flagged Content"
          value={mockData.metrics.flaggedContent}
          subtitle="Requires attention"
          icon={Flag}
          variant="danger"
          testId="metric-flagged"
        />
        <ModerationMetricCard
          title="Accuracy Rate"
          value={`${mockData.metrics.accuracyRate}%`}
          subtitle="Moderation accuracy"
          icon={Target}
          variant="default"
          testId="metric-accuracy"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Moderation Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Moderation Queue</CardTitle>
                  <CardDescription>Review and take action on reported content</CardDescription>
                </div>
                <Badge variant="outline" data-testid="queue-count">
                  {mockData.queue.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" data-testid="tabs-queue">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
                  <TabsTrigger value="comments" data-testid="tab-comments">Comments</TabsTrigger>
                  <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {mockData.queue.map((item) => (
                        <ContentItemCard
                          key={item.id}
                          item={item}
                          onApprove={() => handleApprove(item.id)}
                          onReject={() => handleReject(item.id)}
                          onFlag={() => handleFlag(item.id)}
                          testId={`queue-item-${item.id}`}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="posts" className="mt-4">
                  <div className="text-center text-muted-foreground py-8">
                    No posts requiring moderation
                  </div>
                </TabsContent>
                <TabsContent value="comments" className="mt-4">
                  <div className="text-center text-muted-foreground py-8">
                    No comments requiring moderation
                  </div>
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                  <div className="text-center text-muted-foreground py-8">
                    No user accounts requiring review
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>Your moderation activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.recentActions.map((action) => {
                  const actionIcons = {
                    approved: ThumbsUp,
                    rejected: XCircle,
                    flagged: Flag,
                    banned: UserX,
                  };
                  const Icon = actionIcons[action.action];
                  const actionColors = {
                    approved: 'text-green-600',
                    rejected: 'text-red-600',
                    flagged: 'text-yellow-600',
                    banned: 'text-purple-600',
                  };

                  return (
                    <div key={action.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`action-${action.id}`}>
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-4 w-4 ${actionColors[action.action]}`} />
                        <div>
                          <p className="text-sm font-medium" data-testid={`action-${action.id}-type`}>
                            {action.action.charAt(0).toUpperCase() + action.action.slice(1)}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`action-${action.id}-content`}>
                            {action.content}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground" data-testid={`action-${action.id}-time`}>
                        {formatDistanceToNow(action.time, { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Alerts & Statistics */}
        <div className="space-y-6">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important moderation notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {mockData.alerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      testId={`alert-${alert.id}`}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Moderation Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Statistics</CardTitle>
              <CardDescription>Your moderation performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="text-sm font-medium text-green-600" data-testid="stat-approved">85</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rejected</span>
                  <span className="text-sm font-medium text-red-600" data-testid="stat-rejected">32</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Flagged</span>
                  <span className="text-sm font-medium text-yellow-600" data-testid="stat-flagged">7</span>
                </div>
                <Progress value={7} className="h-2" />
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm font-medium" data-testid="stat-response-time">2.3 min avg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common moderation tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="action-bulk-approve">
                <CheckCircle className="mr-2 h-4 w-4" />
                Bulk Approve Safe Content
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="action-review-flags">
                <Flag className="mr-2 h-4 w-4" />
                Review Flagged Items
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="action-ban-list">
                <Ban className="mr-2 h-4 w-4" />
                Manage Ban List
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="action-export-report">
                <FileText className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}