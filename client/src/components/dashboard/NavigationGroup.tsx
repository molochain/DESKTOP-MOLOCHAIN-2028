import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import type { NavigationGroup as NavigationGroupType } from '@/config/navigation-optimized';

interface NavigationGroupProps {
  group: NavigationGroupType;
  collapsed: boolean;
  defaultExpanded?: boolean;
  favorites: string[];
  onToggleFavorite: (path: string) => void;
}

export function NavigationGroup({ 
  group, 
  collapsed, 
  defaultExpanded = true,
  favorites,
  onToggleFavorite 
}: NavigationGroupProps) {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Check if any item in this group is active
  const hasActiveItem = group.items.some(item => location === item.path);

  // Auto-expand if an item is active
  const isExpanded = expanded || hasActiveItem;

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full justify-between px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200',
          hasActiveItem && 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50',
          collapsed && 'justify-center'
        )}
      >
        <div className="flex items-center space-x-3">
          {group.icon && <group.icon className={cn("w-4 h-4", hasActiveItem && "text-amber-500")} />}
          {!collapsed && (
            <span className="font-medium text-sm">{group.name}</span>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center space-x-2">
            {group.items.filter(item => item.isNew).length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {group.items.filter(item => item.isNew).length}
              </Badge>
            )}
            {(group.isCollapsible ?? true) && (isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            ))}
          </div>
        )}
      </Button>

      {/* Group Items */}
      {isExpanded && (
        <div className={cn('space-y-1', !collapsed && 'ml-4')}>
          {group.items.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            const isFavorite = favorites.includes(item.path);
            
            const NavigationItem = (
              <div
                className={cn(
                  'flex items-center space-x-3 rounded-lg p-2.5 transition-all duration-200 cursor-pointer group relative transform hover:scale-[1.02]',
                  isActive
                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-l-4 border-amber-500 text-amber-700 dark:text-amber-300 pl-2 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm pl-3',
                  collapsed && 'justify-center px-2',
                  item.isImportant && !isActive && 'ring-1 ring-amber-200 dark:ring-amber-800 bg-amber-50 dark:bg-amber-950/20'
                )}
              >
                <Link href={item.path} className="flex items-center space-x-3 flex-1">
                  <Icon className={cn(
                    'w-4 h-4 transition-colors',
                    item.isNew && 'animate-pulse text-blue-500',
                    item.isImportant && 'text-amber-600 dark:text-amber-400',
                    isActive && 'text-amber-600 dark:text-amber-400',
                    collapsed && 'w-5 h-5'
                  )} />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            {item.badge}
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            NEW
                          </Badge>
                        )}
                        {item.isImportant && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                    </div>
                  )}
                </Link>
                {!collapsed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFavorite(item.path);
                    }}
                  >
                    <Star 
                      className={cn(
                        'h-3 w-3',
                        isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400'
                      )}
                    />
                  </Button>
                )}
              </div>
            );

            return (
              <div key={item.path}>
                {NavigationItem}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}