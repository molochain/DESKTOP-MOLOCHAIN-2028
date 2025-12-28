import { ReactNode, useState, useEffect, Fragment } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { navigationGroups } from "@/config/navigation-optimized";
import { useUser } from "@/hooks/use-user";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, isLoading } = useUser();
  const [pageTitle, setPageTitle] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path?: string }>>([]);

  // Generate breadcrumbs and page title based on current location
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const paths = location.split('/').filter(Boolean);
      const crumbs: Array<{ label: string; path?: string }> = [
        { label: 'Admin', path: '/admin' }
      ];

      // Find the current page in navigation groups
      let currentPageName = '';
      navigationGroups.forEach(group => {
        const item = group.items.find(item => item.path === location);
        if (item) {
          currentPageName = item.name;
          crumbs.push({ label: group.name, path: undefined });
          crumbs.push({ label: item.name });
        }
      });

      // If not found in navigation groups, generate from path
      if (!currentPageName && paths.length > 1) {
        const lastPath = paths[paths.length - 1];
        currentPageName = lastPath
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        crumbs.push({ label: currentPageName });
      }

      setPageTitle(currentPageName || 'Dashboard');
      setBreadcrumbs(crumbs);
    };

    generateBreadcrumbs();
  }, [location]);

  // Check if user has access
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">Admin privileges are required to access this area.</p>
          <Button variant="outline" onClick={() => window.location.href = '/login'}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Always visible, not collapsible */}
      <AdminSidebar />

      {/* Main Content Area - No margin needed as flex handles spacing */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-background border-b">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              {/* Breadcrumbs */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {crumb.path ? (
                          <BreadcrumbLink href={crumb.path}>
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <span className="text-muted-foreground">{crumb.label}</span>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Page Title */}
            {pageTitle && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
              </div>
            )}
            
            {/* Main Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}