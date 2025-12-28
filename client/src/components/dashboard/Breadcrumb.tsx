import { Fragment } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { findNavigationItem } from '@/config/navigation-optimized';

export function Breadcrumb() {
  const [location] = useLocation();
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    if (location === '/' || !location) {
      return [];
    }

    const segments = location.split('/').filter(Boolean);
    const breadcrumbs: Array<{ name: string; path: string }> = [];
    
    segments.forEach((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const navItem = findNavigationItem(path);
      
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, path });
      } else {
        // Format segment name for display
        const name = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbs.push({ name, path });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            <li>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </li>
            <li>
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium">{crumb.name}</span>
              ) : (
                <Link href={crumb.path} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {crumb.name}
                </Link>
              )}
            </li>
          </div>
        ))}
      </ol>
    </nav>
  );
}