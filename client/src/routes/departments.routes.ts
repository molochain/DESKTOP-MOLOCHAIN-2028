import { lazy } from 'react';
import { RouteRegistry } from './RouteRegistry';

const DepartmentsHub = lazy(() => import('@/pages/departments/DepartmentsHub'));
const DepartmentPage = lazy(() => import('@/pages/departments/DepartmentPage'));

RouteRegistry.registerCategory({
  name: 'departments',
  order: 3,
  routes: [
    { path: '/departments', component: DepartmentsHub, requireAuth: true, layout: 'default' },
    { path: '/departments/:slug', component: DepartmentPage, requireAuth: true, layout: 'default' }
  ]
});

export const departmentRoutes = RouteRegistry.getRoutesByCategory('departments');
