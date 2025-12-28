import { lazy, LazyExoticComponent, ComponentType } from 'react';
import { SubdomainRole, isRouteAllowedOnSubdomain } from '@/lib/subdomain';

export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  exact?: boolean;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  layout?: 'default' | 'admin' | 'admin-public' | 'portal' | 'none';
  title?: string;
  category?: string;
  subdomain?: SubdomainRole | SubdomainRole[];
}

export interface RouteCategory {
  name: string;
  routes: RouteConfig[];
  icon?: string;
  order?: number;
}

class RouteRegistryClass {
  private routes: Map<string, RouteConfig> = new Map();
  private categories: Map<string, RouteCategory> = new Map();

  registerCategory(category: RouteCategory) {
    this.categories.set(category.name, category);
    category.routes.forEach(route => {
      this.routes.set(route.path, route);
    });
  }

  registerRoute(route: RouteConfig) {
    this.routes.set(route.path, route);
  }

  getRoutes(subdomain?: SubdomainRole): RouteConfig[] {
    const sortedCategories = this.getCategories();
    const orderedRoutes: RouteConfig[] = [];
    
    sortedCategories.forEach(category => {
      category.routes.forEach(route => {
        if (route.path !== '*') {
          if (subdomain && route.subdomain) {
            if (isRouteAllowedOnSubdomain(route.subdomain, subdomain)) {
              orderedRoutes.push(route);
            }
          } else if (!route.subdomain) {
            orderedRoutes.push(route);
          } else if (!subdomain) {
            orderedRoutes.push(route);
          }
        }
      });
    });
    
    sortedCategories.forEach(category => {
      category.routes.forEach(route => {
        if (route.path === '*') {
          orderedRoutes.push(route);
        }
      });
    });
    
    return orderedRoutes;
  }

  getCategories(): RouteCategory[] {
    return Array.from(this.categories.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getRoutesByCategory(categoryName: string): RouteConfig[] {
    const category = this.categories.get(categoryName);
    return category ? category.routes : [];
  }

  getRoute(path: string): RouteConfig | undefined {
    return this.routes.get(path);
  }
}

export const RouteRegistry = new RouteRegistryClass();