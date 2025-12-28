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
  Package,
  TrendingUp,
  FileText,
  Bell,
  Plus,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Activity,
  DollarSign,
  Calendar,
  Truck,
  User,
  MapPin,
  Hash,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserDashboardData } from '@/types/dashboards';

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

// Activity Item Component
function ActivityItem({ 
  activity,
  testId
}: { 
  activity: any;
  testId: string;
}) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment': return Truck;
      case 'payment': return DollarSign;
      case 'document': return FileText;
      case 'alert': return AlertCircle;
      default: return Activity;
    }
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="flex items-start space-x-3 py-3" data-testid={testId}>
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium" data-testid={`${testId}-title`}>
          {activity.title}
        </p>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-description`}>
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground" data-testid={`${testId}-time`}>
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
      {activity.status && (
        <Badge variant={activity.status === 'completed' ? 'success' : 'secondary'} data-testid={`${testId}-status`}>
          {activity.status}
        </Badge>
      )}
    </div>
  );
}

// Shipment Card Component
function ShipmentCard({ 
  shipment,
  testId
}: { 
  shipment: any;
  testId: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={testId}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm" data-testid={`${testId}-id`}>{shipment.trackingId}</span>
          </div>
          <Badge data-testid={`${testId}-status`}>
            {shipment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span data-testid={`${testId}-route`}>{shipment.origin} → {shipment.destination}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium" data-testid={`${testId}-progress`}>{shipment.progress}%</span>
        </div>
        <Progress value={shipment.progress} className="h-2" />
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span data-testid={`${testId}-eta`}>ETA: {new Date(shipment.eta).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserDashboard() {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();
  
  // Fetch additional user-specific data
  const { data: shipments, isLoading: loadingShipments } = useQuery({
    queryKey: ['/api/user/shipments'],
    enabled: !!dashboardData,
  });

  const { data: notifications } = useQuery({
    queryKey: ['/api/user/notifications'],
    enabled: !!dashboardData,
  });

  const { data: invoices } = useQuery({
    queryKey: ['/api/user/invoices'],
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
            {error.message || 'Something went wrong while loading your dashboard.'}
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
      activeShipments: 12,
      pendingInvoices: 3,
      totalSpent: '$45,678',
      savedQuotes: 7,
    },
    recentActivity: [
      {
        id: '1',
        type: 'shipment',
        title: 'Shipment #SH-2024-001 Delivered',
        description: 'Your shipment to New York has been delivered successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
      },
      {
        id: '2',
        type: 'payment',
        title: 'Invoice Payment Processed',
        description: 'Payment of $2,450 for INV-2024-089 has been processed',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'completed',
      },
      {
        id: '3',
        type: 'document',
        title: 'New Document Available',
        description: 'Bill of Lading for shipment #SH-2024-002 is ready',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        id: '4',
        type: 'alert',
        title: 'Customs Clearance Required',
        description: 'Additional documentation needed for shipment #SH-2024-003',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        status: 'pending',
      },
    ],
    activeShipments: [
      {
        trackingId: 'SH-2024-002',
        status: 'In Transit',
        origin: 'Shanghai',
        destination: 'Los Angeles',
        progress: 65,
        eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        trackingId: 'SH-2024-003',
        status: 'Customs',
        origin: 'London',
        destination: 'Miami',
        progress: 40,
        eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        trackingId: 'SH-2024-004',
        status: 'Processing',
        origin: 'Dubai',
        destination: 'Houston',
        progress: 15,
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
    notifications: [
      {
        id: '1',
        type: 'info',
        title: 'Rate Update',
        message: 'New shipping rates are now available for Asia-Pacific routes',
        read: false,
      },
      {
        id: '2',
        type: 'warning',
        title: 'Document Expiring',
        message: 'Your insurance certificate expires in 7 days',
        read: false,
      },
      {
        id: '3',
        type: 'success',
        title: 'Booking Confirmed',
        message: 'Your booking for container MOLU1234567 has been confirmed',
        read: true,
      },
    ],
  };

  const userData = dashboardData as UserDashboardData | undefined;

  return (
    <div className="p-6 space-y-6" data-testid="user-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Welcome back!
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Here's what's happening with your shipments today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="button-new-quote">
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
          <Button variant="outline" data-testid="button-track-shipment">
            <Search className="mr-2 h-4 w-4" />
            Track Shipment
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Shipments"
          value={mockData.metrics.activeShipments}
          change="+2 from last week"
          icon={Package}
          trend="up"
          testId="metric-active-shipments"
        />
        <MetricCard
          title="Pending Invoices"
          value={mockData.metrics.pendingInvoices}
          change="3 require action"
          icon={FileText}
          trend="neutral"
          testId="metric-pending-invoices"
        />
        <MetricCard
          title="Total Spent"
          value={mockData.metrics.totalSpent}
          change="+12% from last month"
          icon={DollarSign}
          trend="up"
          testId="metric-total-spent"
        />
        <MetricCard
          title="Saved Quotes"
          value={mockData.metrics.savedQuotes}
          change="2 expiring soon"
          icon={ShoppingCart}
          trend="neutral"
          testId="metric-saved-quotes"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity & Shipments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest shipment and account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-1">
                  {mockData.recentActivity.map((activity, index) => (
                    <ActivityItem 
                      key={activity.id} 
                      activity={activity}
                      testId={`activity-item-${index}`}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Active Shipments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" data-testid="text-shipments-title">
                Active Shipments
              </h2>
              <Button variant="ghost" size="sm" data-testid="button-view-all-shipments">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockData.activeShipments.map((shipment, index) => (
                <ShipmentCard 
                  key={shipment.trackingId} 
                  shipment={shipment}
                  testId={`shipment-card-${index}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Stay updated with important alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.notifications.map((notification, index) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border ${!notification.read ? 'bg-primary/5' : ''}`}
                    data-testid={`notification-item-${index}`}
                  >
                    <div className="flex items-start space-x-2">
                      {notification.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                      {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                      {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium" data-testid={`notification-${index}-title`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`notification-${index}-message`}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge variant="secondary" className="text-xs" data-testid={`notification-${index}-badge`}>
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                data-testid="button-view-all-notifications"
              >
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="button-request-quote">
                <FileText className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-book-shipment">
                <Package className="mr-2 h-4 w-4" />
                Book Shipment
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-invoices">
                <DollarSign className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-download-documents">
                <FileText className="mr-2 h-4 w-4" />
                Download Documents
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-contact-support">
                <User className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}