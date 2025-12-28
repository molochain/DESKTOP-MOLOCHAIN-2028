import { Suspense, lazy } from 'react';
import { Switch, Route, Redirect, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

// Import the main Mololink page
import MololinkMain from './MololinkMain';

// Lazy load the pages
const CompaniesPage = lazy(() => import('./pages/companies'));
const CompanyProfilePage = lazy(() => import('./pages/company-profile'));
const NetworkPage = lazy(() => import('./pages/network'));
const MarketplacePage = lazy(() => import('./pages/marketplace'));
const JobsPage = lazy(() => import('./pages/jobs'));
const ExplorerPage = lazy(() => import('./pages/explorer'));
const MessagingPage = lazy(() => import('./pages/messaging'));
const ProfilePage = lazy(() => import('./pages/profile'));
const NotificationsPage = lazy(() => import('./pages/notifications'));
const SearchPage = lazy(() => import('./pages/search'));
const HomePage = lazy(() => import('./pages/home'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const MololinkWrapper = () => {
  return (
    <div className="mololink-module">
      <Switch>
        {/* Main Mololink landing page */}
        <Route path="/mololink" component={MololinkMain} />
        
        {/* Authentication routes - redirect to main auth pages */}
        <Route path="/mololink/login">
          <Redirect to="/login" />
        </Route>
        
        <Route path="/mololink/register">
          <Redirect to="/register" />
        </Route>
        
        {/* Main pages */}
        <Route path="/mololink/home" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        )} />
        
        <Route path="/mololink/companies" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <CompaniesPage />
          </Suspense>
        )} />
        
        <Route path="/mololink/companies/:slug" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <CompanyProfilePage />
          </Suspense>
        )} />
        
        <Route path="/mololink/network" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <NetworkPage />
          </Suspense>
        )} />
        
        <Route path="/mololink/marketplace" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <MarketplacePage />
          </Suspense>
        )} />
        
        <Route path="/mololink/jobs" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <JobsPage />
          </Suspense>
        )} />
        
        <Route path="/mololink/explorer" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <ExplorerPage />
          </Suspense>
        )} />
        
        <Route path="/mololink/messaging" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <MessagingPage />
          </Suspense>
        )} />
        
        <Route path="/mololink/profile" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfilePage />
          </Suspense>
        )} />
        
        <Route path="/mololink/notifications" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <NotificationsPage />
          </Suspense>
        )} />
        
        <Route path="/mololink/search" component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <SearchPage />
          </Suspense>
        )} />
        
        {/* Default route - redirect to main page */}
        <Route component={MololinkMain} />
      </Switch>
    </div>
  );
};

export default MololinkWrapper;