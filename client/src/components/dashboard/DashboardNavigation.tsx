import { useLocation, Link } from 'wouter';
import { useDashboard } from '@/hooks/use-dashboard';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  User,
  Code,
  Building,
  Users,
  Briefcase,
  ChartBar,
  Eye,
  Home,
  Settings,
  FileText,
  Database,
  Activity,
  Package,
  GitBranch,
  BarChart3,
  UserCheck,
  FolderOpen,
  Server,
  Lock,
  Globe,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { DashboardRole, DashboardPermissions } from '@/types/dashboards';

// Navigation item interface
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  requiredPermission?: keyof DashboardPermissions;
  children?: NavItem[];
}

// Role-specific navigation configurations
const roleNavigations: Record<DashboardRole, NavItem[]> = {
  admin: [
    {
      title: 'Overview',
      href: '/dashboard/admin',
      icon: Home,
      description: 'System overview and metrics',
    },
    {
      title: 'System',
      href: '/dashboard/admin/system',
      icon: Server,
      children: [
        {
          title: 'Health Monitor',
          href: '/dashboard/admin/system/health',
          icon: Activity,
          requiredPermission: 'canViewSystemHealth',
        },
        {
          title: 'Performance',
          href: '/dashboard/admin/system/performance',
          icon: BarChart3,
          requiredPermission: 'canViewSystemHealth',
        },
        {
          title: 'Logs',
          href: '/dashboard/admin/system/logs',
          icon: FileText,
          requiredPermission: 'canViewSystemHealth',
        },
      ],
    },
    {
      title: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
      requiredPermission: 'canViewUsers',
      children: [
        {
          title: 'All Users',
          href: '/dashboard/admin/users/all',
          icon: Users,
        },
        {
          title: 'Roles & Permissions',
          href: '/dashboard/admin/users/roles',
          icon: Lock,
        },
        {
          title: 'Sessions',
          href: '/dashboard/admin/users/sessions',
          icon: UserCheck,
        },
      ],
    },
    {
      title: 'Departments',
      href: '/dashboard/admin/departments',
      icon: Building,
      requiredPermission: 'canManageDepartments',
    },
    {
      title: 'God Layer',
      href: '/dashboard/admin/god-layer',
      icon: Shield,
      requiredPermission: 'canAccessGodLayer',
      badge: 'Pro',
    },
    {
      title: 'Settings',
      href: '/dashboard/admin/settings',
      icon: Settings,
    },
  ],
  user: [
    {
      title: 'Dashboard',
      href: '/dashboard/user',
      icon: Home,
      description: 'Your personal dashboard',
    },
    {
      title: 'Projects',
      href: '/dashboard/user/projects',
      icon: FolderOpen,
      description: 'Your projects and tasks',
    },
    {
      title: 'Activities',
      href: '/dashboard/user/activities',
      icon: Activity,
      description: 'Recent activities',
    },
    {
      title: 'Settings',
      href: '/dashboard/user/settings',
      icon: Settings,
      description: 'Account settings',
    },
  ],
  developer: [
    {
      title: 'Overview',
      href: '/dashboard/developer',
      icon: Home,
      description: 'Development dashboard',
    },
    {
      title: 'API',
      href: '/dashboard/developer/api',
      icon: Globe,
      requiredPermission: 'canAccessDeveloperTools',
      children: [
        {
          title: 'Documentation',
          href: '/dashboard/developer/api/docs',
          icon: FileText,
        },
        {
          title: 'Usage & Metrics',
          href: '/dashboard/developer/api/metrics',
          icon: ChartBar,
        },
        {
          title: 'Keys & Tokens',
          href: '/dashboard/developer/api/keys',
          icon: Lock,
        },
      ],
    },
    {
      title: 'Deployments',
      href: '/dashboard/developer/deployments',
      icon: Package,
      requiredPermission: 'canAccessDeveloperTools',
    },
    {
      title: 'Code',
      href: '/dashboard/developer/code',
      icon: Code,
      requiredPermission: 'canAccessDeveloperTools',
      children: [
        {
          title: 'Repositories',
          href: '/dashboard/developer/code/repos',
          icon: GitBranch,
        },
        {
          title: 'CI/CD',
          href: '/dashboard/developer/code/cicd',
          icon: Activity,
        },
      ],
    },
    {
      title: 'Integrations',
      href: '/dashboard/developer/integrations',
      icon: Package,
      requiredPermission: 'canManageIntegrations',
    },
    {
      title: 'Database',
      href: '/dashboard/developer/database',
      icon: Database,
      requiredPermission: 'canAccessDeveloperTools',
    },
  ],
  company: [
    {
      title: 'Overview',
      href: '/dashboard/company',
      icon: Home,
      description: 'Company dashboard',
    },
    {
      title: 'Departments',
      href: '/dashboard/company/departments',
      icon: Building,
      requiredPermission: 'canManageDepartments',
    },
    {
      title: 'Projects',
      href: '/dashboard/company/projects',
      icon: FolderOpen,
      requiredPermission: 'canManageProjects',
    },
    {
      title: 'Financials',
      href: '/dashboard/company/financials',
      icon: ChartBar,
      requiredPermission: 'canViewFinancials',
    },
    {
      title: 'Analytics',
      href: '/dashboard/company/analytics',
      icon: BarChart3,
      requiredPermission: 'canViewAnalytics',
    },
    {
      title: 'Reports',
      href: '/dashboard/company/reports',
      icon: FileText,
      requiredPermission: 'canViewReports',
    },
  ],
  department: [
    {
      title: 'Overview',
      href: '/dashboard/department',
      icon: Home,
      description: 'Department dashboard',
    },
    {
      title: 'Team',
      href: '/dashboard/department/team',
      icon: Users,
    },
    {
      title: 'Tasks',
      href: '/dashboard/department/tasks',
      icon: FolderOpen,
    },
    {
      title: 'Resources',
      href: '/dashboard/department/resources',
      icon: Package,
    },
    {
      title: 'Budget',
      href: '/dashboard/department/budget',
      icon: ChartBar,
      requiredPermission: 'canViewFinancials',
    },
    {
      title: 'Reports',
      href: '/dashboard/department/reports',
      icon: FileText,
      requiredPermission: 'canViewReports',
    },
  ],
  manager: [
    {
      title: 'Overview',
      href: '/dashboard/manager',
      icon: Home,
      description: 'Manager dashboard',
    },
    {
      title: 'Teams',
      href: '/dashboard/manager/teams',
      icon: Users,
      requiredPermission: 'canViewUsers',
    },
    {
      title: 'Projects',
      href: '/dashboard/manager/projects',
      icon: FolderOpen,
      requiredPermission: 'canManageProjects',
    },
    {
      title: 'Analytics',
      href: '/dashboard/manager/analytics',
      icon: ChartBar,
      requiredPermission: 'canViewAnalytics',
    },
    {
      title: 'Reports',
      href: '/dashboard/manager/reports',
      icon: FileText,
      requiredPermission: 'canViewReports',
    },
    {
      title: 'Content',
      href: '/dashboard/manager/content',
      icon: FileText,
      requiredPermission: 'canManageContent',
    },
  ],
  analyst: [
    {
      title: 'Overview',
      href: '/dashboard/analyst',
      icon: Home,
      description: 'Analyst dashboard',
    },
    {
      title: 'Analytics',
      href: '/dashboard/analyst/analytics',
      icon: ChartBar,
      requiredPermission: 'canViewAnalytics',
    },
    {
      title: 'Reports',
      href: '/dashboard/analyst/reports',
      icon: FileText,
      requiredPermission: 'canViewReports',
    },
    {
      title: 'Data',
      href: '/dashboard/analyst/data',
      icon: Database,
    },
    {
      title: 'Insights',
      href: '/dashboard/analyst/insights',
      icon: BarChart3,
    },
  ],
  moderator: [
    {
      title: 'Overview',
      href: '/dashboard/moderator',
      icon: Home,
      description: 'Moderator dashboard',
    },
    {
      title: 'Content',
      href: '/dashboard/moderator/content',
      icon: FileText,
      requiredPermission: 'canManageContent',
    },
    {
      title: 'Users',
      href: '/dashboard/moderator/users',
      icon: Users,
      requiredPermission: 'canViewUsers',
    },
    {
      title: 'Reports',
      href: '/dashboard/moderator/reports',
      icon: Eye,
    },
  ],
};

// Role icons mapping
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

// Mobile navigation menu
function MobileNav({ items, hasPermission }: { 
  items: NavItem[]; 
  hasPermission: (permission: keyof DashboardPermissions) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const filteredItems = items.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b z-50">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4 space-y-2">
              {filteredItems.map((item) => (
                <div key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                        location === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      onClick={() => setIsOpen(false)}
                      data-testid={`link-mobile-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                  {item.children && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children
                        .filter(child => !child.requiredPermission || hasPermission(child.requiredPermission))
                        .map((child) => (
                          <Link key={child.href} href={child.href}>
                            <a
                              className={cn(
                                "flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                                location === child.href
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-accent"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <child.icon className="h-3 w-3" />
                              <span>{child.title}</span>
                            </a>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Dashboard breadcrumbs component
export function DashboardBreadcrumbs() {
  const [location] = useLocation();
  const { currentDashboard, getDashboardConfig } = useDashboard();

  const breadcrumbs = useMemo(() => {
    const parts = location.split('/').filter(Boolean);
    const items: { label: string; href?: string }[] = [];

    parts.forEach((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      
      items.push({
        label,
        href: index < parts.length - 1 ? href : undefined,
      });
    });

    return items;
  }, [location]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href ? (
              <>
                <BreadcrumbLink asChild>
                  <Link href={item.href}>
                    <a className="hover:text-primary transition-colors">
                      {item.label}
                    </a>
                  </Link>
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Main dashboard navigation component
export function DashboardNavigation() {
  const {
    currentDashboard,
    availableDashboards,
    switchDashboard,
    hasPermission,
    userRole,
  } = useDashboard();

  const [location, setLocation] = useLocation();

  // Get navigation items for current dashboard
  const navigationItems = currentDashboard
    ? roleNavigations[currentDashboard] || []
    : [];

  // Filter navigation items based on permissions
  const filteredNavItems = navigationItems.filter(item =>
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  // Handle dashboard switching
  const handleDashboardSwitch = async (role: DashboardRole) => {
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

  const CurrentIcon = currentDashboard ? roleIcons[currentDashboard] : User;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Dashboard Switcher */}
        {availableDashboards.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="mr-4 flex items-center space-x-2"
                data-testid="button-dashboard-switcher"
              >
                <CurrentIcon className="h-4 w-4" />
                <span className="capitalize">{currentDashboard}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableDashboards.map((dashboard) => {
                const Icon = roleIcons[dashboard.role];
                return (
                  <DropdownMenuItem
                    key={dashboard.role}
                    onClick={() => handleDashboardSwitch(dashboard.role)}
                    className="cursor-pointer"
                    data-testid={`menuitem-switch-${dashboard.role}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="capitalize">{dashboard.role}</span>
                    {dashboard.role === currentDashboard && (
                      <Badge variant="secondary" className="ml-auto">
                        Current
                      </Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              {filteredNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-1">
                            {item.badge}
                          </Badge>
                        )}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                          {item.children
                            .filter(child => 
                              !child.requiredPermission || hasPermission(child.requiredPermission)
                            )
                            .map((child) => (
                              <li key={child.href}>
                                <NavigationMenuLink asChild>
                                  <Link href={child.href}>
                                    <a
                                      className={cn(
                                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                        location === child.href && "bg-accent"
                                      )}
                                      data-testid={`link-nav-${child.title.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <child.icon className="h-4 w-4" />
                                        <div className="text-sm font-medium leading-none">
                                          {child.title}
                                        </div>
                                      </div>
                                      {child.description && (
                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                          {child.description}
                                        </p>
                                      )}
                                    </a>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={item.href}>
                      <NavigationMenuLink
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                          location === item.href && "bg-accent"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <MobileNav items={navigationItems} hasPermission={hasPermission} />

        {/* Breadcrumbs (desktop only) */}
        <div className="hidden md:flex ml-auto">
          <DashboardBreadcrumbs />
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavigation;