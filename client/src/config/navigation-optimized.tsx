import { getNavigationGroups, getPageByPath, getBreadcrumbs as getPageBreadcrumbs } from './adminPageRegistry';

export interface NavigationItem {
  name: string;
  path: string;
  icon?: any;
  badge?: string;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  name: string;
  icon?: any;
  items: NavigationItem[];
  defaultExpanded?: boolean;
}

// Get navigation groups from centralized registry
export const navigationGroups: NavigationGroup[] = getNavigationGroups();

// Helper function to find a navigation item by path
export function findNavigationItem(path: string): NavigationItem | null {
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.path === path) return item;
      if (item.children) {
        const childItem = item.children.find(child => child.path === path);
        if (childItem) return childItem;
      }
    }
  }
  return null;
}

// Helper function to get breadcrumbs using centralized registry
export function getBreadcrumbs(path: string): string[] {
  const breadcrumbs = getPageBreadcrumbs(path);
  return breadcrumbs.map(b => b.name);
}

// Legacy helper for backward compatibility
export function getNavigationPath(path: string): { group: string; item: string } | null {
  const page = getPageByPath(path);
  if (!page) return null;
  
  for (const group of navigationGroups) {
    const item = group.items.find(i => i.path === path);
    if (item) {
      return { group: group.name, item: item.name };
    }
    for (const groupItem of group.items) {
      if (groupItem.children?.some(child => child.path === path)) {
        return { group: group.name, item: groupItem.name };
      }
    }
  }
  return null;
}
