import { Suspense, lazy } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { RouteRegistry, RouteConfig } from './RouteRegistry';
import { useAuth } from '@/hooks/use-auth';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { shouldRedirectRoute, isRouteAllowedOnSubdomain } from '@/lib/subdomain';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import PortalLayout from '@/components/portal/PortalLayout';
import { useOnboarding } from '@/components/portal/OnboardingWizard';
import { Loader2 } from 'lucide-react';

const OnboardingWizard = lazy(() => import('@/components/portal/OnboardingWizard'));
const AdminPublicLayout = lazy(() => import('@/components/admin/AdminPublicLayout'));

import './main.routes';
import './auth.routes';
import './portal.routes';
import './admin.routes';
import './departments.routes';
import './services.routes';
import './ecosystem.routes';
// import './mololink.routes'; // MOLOLINK consolidated to Docker service at mololink.molochain.com
import './brandbook.routes';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

interface RouteWrapperProps {
  route: RouteConfig;
  children: React.ReactNode;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ route, children }) => {
  const { user, isLoading } = useAuth();
  const { subdomain } = useSubdomain();
  const [location] = useLocation();

  if (!isRouteAllowedOnSubdomain(route.subdomain, subdomain)) {
    const redirect = shouldRedirectRoute(location, route.subdomain);
    if (redirect.shouldRedirect && redirect.targetUrl) {
      window.location.href = redirect.targetUrl;
      return <LoadingSpinner />;
    }
  }

  if (route.requireAuth && !isLoading && !user) {
    window.location.href = '/login';
    return null;
  }

  if (route.requireAdmin && !isLoading && user?.role !== 'admin') {
    window.location.href = '/';
    return null;
  }

  switch (route.layout) {
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;
    case 'admin-public':
      return <AdminPublicLayout>{children}</AdminPublicLayout>;
    case 'portal':
      return <PortalLayout>{children}</PortalLayout>;
    case 'none':
      return <>{children}</>;
    case 'default':
    default:
      return <Layout>{children}</Layout>;
  }
};

const PortalOnboardingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const { subdomain } = useSubdomain();
  const { user } = useAuth();
  
  // Only show onboarding on app subdomain for authenticated users
  const shouldShowOnboarding = showOnboarding && subdomain === 'app' && !!user;
  
  return (
    <>
      {children}
      {shouldShowOnboarding && (
        <Suspense fallback={null}>
          <OnboardingWizard onComplete={completeOnboarding} onSkip={completeOnboarding} />
        </Suspense>
      )}
    </>
  );
};

export const AppRouter: React.FC = () => {
  const { subdomain } = useSubdomain();
  const routes = RouteRegistry.getRoutes(subdomain);

  return (
    <PortalOnboardingWrapper>
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          {routes.map((route) => {
            const Component = route.component;
            return (
              <Route key={route.path} path={route.path}>
                <RouteWrapper route={route}>
                  <Component />
                </RouteWrapper>
              </Route>
            );
          })}
        </Switch>
      </Suspense>
    </PortalOnboardingWrapper>
  );
};