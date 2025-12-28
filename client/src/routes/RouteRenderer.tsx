import { Suspense } from 'react';
import { Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import AdminLayout from '@/components/admin/AdminLayout';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Login />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this area.</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

interface RouteWithLayoutProps {
  component: React.ComponentType;
  layout?: 'none' | 'default' | 'admin';
  protected?: boolean;
  adminOnly?: boolean;
}

export function RouteWithLayout({ 
  component: Component, 
  layout = 'default',
  protected: isProtected = false,
  adminOnly = false 
}: RouteWithLayoutProps) {
  if (adminOnly) {
    return (
      <ProtectedAdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Component />
        </Suspense>
      </ProtectedAdminRoute>
    );
  }

  if (isProtected) {
    const content = (
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    );

    if (layout === 'default') {
      return (
        <ProtectedRoute>
          <Layout>{content}</Layout>
        </ProtectedRoute>
      );
    }

    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  const content = (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  if (layout === 'default') {
    return <Layout>{content}</Layout>;
  }

  return content;
}

interface RouteDefinition {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  layout?: 'none' | 'default' | 'admin';
  protected?: boolean;
  adminOnly?: boolean;
}

export function renderRoutes(routes: RouteDefinition[]) {
  return routes.map((route) => (
    <Route 
      key={route.path} 
      path={route.path}
      component={() => (
        <RouteWithLayout 
          component={route.component}
          layout={route.layout}
          protected={route.protected}
          adminOnly={route.adminOnly}
        />
      )}
    />
  ));
}