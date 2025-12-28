import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { usePermission } from '@/hooks/use-permission';
import { navigationGroups, NavigationGroup, NavigationItem } from '@/config/navigation-optimized';
import { getPageByPath } from '@/config/adminPageRegistry';
import { canAccessPage } from '@/lib/permissions';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Search,
  Command,
  Sparkles,
  User,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';

export default function AdminSidebar() {
  const isCollapsed = false; // Always expanded
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { userRole } = usePermission();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const permissionFilteredGroups = useMemo(() => {
    if (!userRole) return [];
    
    return navigationGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          const page = getPageByPath(item.path);
          if (!page) return true;
          return canAccessPage(page, userRole);
        });
        
        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [userRole]);

  // Initialize expanded groups based on defaultExpanded flag and current location
  useEffect(() => {
    const initialExpanded = new Set<string>();
    permissionFilteredGroups.forEach(group => {
      if (group.defaultExpanded || group.items.some(item => location === item.path)) {
        initialExpanded.add(group.name);
      }
    });
    setExpandedGroups(initialExpanded);
  }, [permissionFilteredGroups]);

  // Auto-expand group when navigating to its item
  useEffect(() => {
    permissionFilteredGroups.forEach(group => {
      if (group.items.some(item => location === item.path)) {
        setExpandedGroups(prev => new Set([...prev, group.name]));
      }
    });
  }, [location, permissionFilteredGroups]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/login');
      toast({
        title: 'Success',
        description: 'Logged out successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive'
      });
    }
  };

  // Filter navigation items based on search (using permission-filtered groups)
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return permissionFilteredGroups;
    
    return permissionFilteredGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery, permissionFilteredGroups]);

  // Check if a path is active
  const isPathActive = (path: string) => {
    if (path === location) return true;
    // Check if current location is a child route
    if (location.startsWith(path + '/')) return true;
    return false;
  };

  // Get badge variant based on type
  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case 'PRIMARY':
        return 'default';
      case 'NEW':
        return 'secondary';
      case 'BETA':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="h-16 border-b flex items-center px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/molochain-logo.png" 
            alt="MOLOCHAIN" 
            className="h-8 w-auto"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold">MOLOCHAIN</span>
            <span className="text-xs text-muted-foreground">Admin Control</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search admin features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}


      {/* Navigation Groups */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(group.name)}
                  className={cn(
                    "w-full justify-between px-3 py-2 h-auto font-medium",
                    "hover:bg-muted/50 transition-colors",
                    expandedGroups.has(group.name) && "bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {group.icon && <group.icon className="h-4 w-4" />}
                    {!isCollapsed && (
                      <span className="text-sm">{group.name}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    expandedGroups.has(group.name) 
                      ? <ChevronDown className="h-3 w-3" />
                      : <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
                {!isCollapsed && expandedGroups.has(group.name) && (
                  <div className="space-y-0.5 ml-2">
                    {group.items.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all cursor-pointer",
                            "hover:bg-accent hover:text-accent-foreground",
                            isPathActive(item.path) 
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary ml-[2px]" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <Badge 
                              variant={getBadgeVariant(item.badge)}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      <div className="p-3 space-y-2">
        {!isCollapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        
        {/* Footer Actions */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {!isCollapsed && <span>Theme</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.open('/help', '_blank')}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Help</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed width, always expanded */}
      <aside className="hidden lg:flex flex-col bg-background border-r w-[264px] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Sidebar - Always render expanded content on mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-[264px] bg-background h-full overflow-y-auto">
            {/* Mobile header */}
            <div className="h-16 border-b flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/molochain-logo.png" 
                  alt="MOLOCHAIN" 
                  className="h-8 w-auto"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">MOLOCHAIN</span>
                  <span className="text-xs text-muted-foreground">Admin Control</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile search bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search admin features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile navigation groups */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredGroups.map((group) => (
                  <div key={group.name} className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(group.name)}
                      className={cn(
                        "w-full justify-between px-3 py-2 h-auto font-medium",
                        "hover:bg-muted/50 transition-colors",
                        expandedGroups.has(group.name) && "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {group.icon && <group.icon className="h-4 w-4" />}
                        <span className="text-sm">{group.name}</span>
                      </div>
                      {expandedGroups.has(group.name) 
                        ? <ChevronDown className="h-3 w-3" />
                        : <ChevronRight className="h-3 w-3" />
                      }
                    </Button>
                    {expandedGroups.has(group.name) && (
                      <div className="space-y-0.5 ml-2">
                        {group.items.map((item) => (
                          <Link key={item.path} href={item.path}>
                            <div
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all cursor-pointer",
                                "hover:bg-accent hover:text-accent-foreground",
                                isPathActive(item.path) 
                                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary ml-[2px]" 
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                              <span className="flex-1 truncate">{item.name}</span>
                              {item.badge && (
                                <Badge 
                                  variant={getBadgeVariant(item.badge)}
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Mobile user section */}
            <div className="p-3 space-y-2">
              {user && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 mr-2" />
                  ) : (
                    <Moon className="h-4 w-4 mr-2" />
                  )}
                  <span>Theme</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open('/help', '_blank')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Help</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}