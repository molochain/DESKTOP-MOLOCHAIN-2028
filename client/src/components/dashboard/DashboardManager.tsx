import { useEffect, Suspense, lazy } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useDashboard } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  User, 
  Code, 
  Building, 
  Users, 
  Briefcase, 
  ChartBar, 
  Eye,
  AlertCircle,
  Loader2,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { DashboardRole } from '@/types/dashboards';
import { DashboardLayout } from './DashboardLayout';

// Icon mapping for dashboard roles
const roleIcons: Record<DashboardRole, React.ElementType> = {
  admin: Shield,
  user: User,
  developer: Code,
  company: Building,
  department: Users,
  manager: Briefcase,
  analyst: ChartBar,
  moderator: Eye,
};

// Lazy load dashboard components for better performance
const AdminDashboard = lazy(() => import('@/pages/dashboard/roles/AdminDashboard').catch(() => ({
  default: () => <FallbackDashboard role="admin" />
})));

const UserDashboard = lazy(() => import('@/pages/dashboard/roles/UserDashboard').catch(() => ({
  default: () => <FallbackDashboard role="user" />
})));

const DeveloperDashboard = lazy(() => import('@/pages/dashboard/roles/DeveloperDashboard').catch(() => ({
  default: () => <FallbackDashboard role="developer" />
})));

const CompanyDashboard = lazy(() => import('@/pages/dashboard/roles/CompanyDashboard').catch(() => ({
  default: () => <FallbackDashboard role="company" />
})));

const DepartmentDashboard = lazy(() => import('@/pages/dashboard/roles/DepartmentDashboard').catch(() => ({
  default: () => <FallbackDashboard role="department" />
})));

const ManagerDashboard = lazy(() => import('@/pages/dashboard/roles/ManagerDashboard').catch(() => ({
  default: () => <FallbackDashboard role="manager" />
})));

const AnalystDashboard = lazy(() => import('@/pages/dashboard/roles/AnalystDashboard').catch(() => ({
  default: () => <FallbackDashboard role="analyst" />
})));

const ModeratorDashboard = lazy(() => import('@/pages/dashboard/roles/ModeratorDashboard').catch(() => ({
  default: () => <FallbackDashboard role="moderator" />
})));

// Dashboard component mapping
const dashboardComponents: Record<DashboardRole, React.LazyExoticComponent<React.ComponentType<any>>> = {
  admin: AdminDashboard,
  user: UserDashboard,
  developer: DeveloperDashboard,
  company: CompanyDashboard,
  department: DepartmentDashboard,
  manager: ManagerDashboard,
  analyst: AnalystDashboard,
  moderator: ModeratorDashboard,
};

// Loading component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">Loading Dashboard</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preparing your personalized workspace...
              </p>
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fallback dashboard component for when specific dashboard doesn't exist
function FallbackDashboard({ role }: { role: DashboardRole }) {
  const Icon = roleIcons[role];
  const { dashboardData, hasPermission } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold capitalize">{role} Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your {role} workspace
            </p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your dashboard overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Access</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
            <CardDescription>Your permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hasPermission('canViewAnalytics') && (
                <div className="flex items-center space-x-2">
                  <ChartBar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Analytics</span>
                </div>
              )}
              {hasPermission('canManageContent') && (
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm">Content Management</span>
                </div>
              )}
              {hasPermission('canViewReports') && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="text-sm">Reports</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Content</CardTitle>
          <CardDescription>
            This is a placeholder dashboard. The specific {role} dashboard is being developed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dashboard Under Construction</AlertTitle>
            <AlertDescription>
              We're working on building a customized dashboard experience for {role} users. 
              In the meantime, you can access available features through the navigation menu.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard switcher component for users with multiple dashboards
function DashboardSwitcher() {
  const { 
    currentDashboard, 
    availableDashboards, 
    switchDashboard 
  } = useDashboard();
  const [, setLocation] = useLocation();

  if (availableDashboards.length <= 1) {
    return null;
  }

  const handleSwitch = async (role: DashboardRole) => {
    if (role === currentDashboard) return;
    
    try {
      await switchDashboard(role);
      const config = availableDashboards.find(d => d.role === role);
      if (config) {
        setLocation(config.path);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to switch dashboard:', error);
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Switch Dashboard</CardTitle>
        <CardDescription>
          You have access to multiple dashboards. Select one to switch views.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentDashboard || 'user'} onValueChange={(value) => handleSwitch(value as DashboardRole)}>
          <TabsList className="grid grid-cols-auto gap-2 w-full">
            {availableDashboards.map((dashboard) => {
              const Icon = roleIcons[dashboard.role];
              return (
                <TabsTrigger
                  key={dashboard.role}
                  value={dashboard.role}
                  className="flex items-center space-x-2"
                  data-testid={`tab-${dashboard.role}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="capitalize">{dashboard.role}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Manager Component
export function DashboardManager() {
  const {
    user,
    userRole,
    currentDashboard,
    isLoading,
    isLoadingUser,
    error,
    getDashboardPath,
    availableDashboards,
  } = useDashboard();

  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation('/login');
    }
  }, [user, isLoadingUser, setLocation]);

  // Auto-redirect to appropriate dashboard if on generic /dashboard route
  useEffect(() => {
    if (!isLoading && currentDashboard && location === '/dashboard') {
      const path = getDashboardPath(currentDashboard);
      if (path && path !== location) {
        setLocation(path);
      }
    }
  }, [currentDashboard, location, setLocation, getDashboardPath, isLoading]);

  // Show loading state
  if (isLoading || isLoadingUser) {
    return <DashboardLoading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Dashboard Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load dashboard'}
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/')}
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthorized state
  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to continue to your dashboard.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/login')}
              data-testid="button-login"
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the appropriate dashboard component
  const DashboardComponent = currentDashboard 
    ? dashboardComponents[currentDashboard] 
    : dashboardComponents.user;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Switcher (if user has multiple dashboards) */}
        <DashboardSwitcher />

        {/* Main Dashboard Content */}
        <Suspense fallback={<DashboardLoading />}>
          <DashboardComponent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

// Export for use in routing
export default DashboardManager;