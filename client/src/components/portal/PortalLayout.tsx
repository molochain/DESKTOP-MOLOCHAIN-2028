import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Truck,
  Briefcase,
  Bell,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';

interface PortalLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/tracking', label: 'Tracking', icon: Truck },
  { path: '/performance', label: 'Performance', icon: Activity },
  { path: '/ecosystem', label: 'Ecosystem', icon: Briefcase },
];

const secondaryNavItems: NavItem[] = [
  { path: '/help', label: 'Help', icon: HelpCircle },
];

const bottomNavItems: NavItem[] = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const NavLink = ({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) => {
    const isActive = location === item.path || location.startsWith(item.path + '/');
    const Icon = item.icon;

    return (
      <Link href={item.path}>
        <button
          onClick={() => setMobileOpen(false)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'hover:bg-accent/60',
            isActive && 'bg-primary/10 text-primary font-medium',
            !isActive && 'text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center px-2'
          )}
          data-testid={`nav-link-${item.path.replace('/', '')}`}
        >
          <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      </Link>
    );
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={cn('p-4 flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Molochain</span>
            <span className="text-xs text-muted-foreground">Portal</span>
          </div>
        )}
      </div>

      <Separator className="mx-4" />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="mt-6 mb-2">
          {!collapsed && (
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tools
            </span>
          )}
        </div>
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto px-3 py-4 space-y-1">
        <Separator className="mb-4" />
        {bottomNavItems.map((item) => (
          <NavLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 -right-3 h-6 w-6 rounded-full border bg-background shadow-sm hidden lg:flex"
          data-testid="button-toggle-sidebar"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Welcome back,</span>
              <span className="font-medium text-foreground">{user?.username || 'User'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            <Button variant="ghost" size="icon" data-testid="button-help">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} data-testid="menu-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
