import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const RequestPasswordReset = lazy(() => import('@/pages/auth/RequestPasswordReset'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// Note: AuthenticationGuide moved to Admin (/admin/developer/auth-guide) for security
RouteRegistry.registerCategory({
  name: 'auth',
  order: 2,
  routes: [
    // Root route for auth subdomain redirects to login
    { path: '/', component: Login, layout: 'none', subdomain: 'auth' },
    { path: '/login', component: Login, layout: 'none', subdomain: ['public', 'admin', 'auth'] },
    { path: '/auth/login', component: Login, layout: 'none', subdomain: ['public', 'admin', 'auth'] },
    { path: '/register', component: Register, layout: 'none', subdomain: ['public', 'auth'] },
    { path: '/forgot-password', component: RequestPasswordReset, layout: 'none', subdomain: ['public', 'admin', 'auth'] },
    { path: '/reset-password', component: ResetPassword, layout: 'none', subdomain: ['public', 'admin', 'auth'] }
  ]
});

export const authRoutes = RouteRegistry.getRoutesByCategory('auth');
