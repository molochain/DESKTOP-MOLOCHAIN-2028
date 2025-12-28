import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight,
  Crown,
  Settings
} from 'lucide-react';
import { NavigationSearch } from './NavigationSearch';
import { NavigationGroup } from './NavigationGroup';
import { navigationGroups } from '@/config/navigation-optimized';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('navigation-favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Toggle favorite function
  const toggleFavorite = (path: string) => {
    const updatedFavorites = favorites.includes(path)
      ? favorites.filter(fav => fav !== path)
      : [...favorites, path];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('navigation-favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Enhanced Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg flex items-center justify-center relative shadow-lg">
              <Crown className="text-white w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">MoloChain</h1>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-wider">GOD LAYER CONTROL</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all duration-200"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        {!collapsed && (
          <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded px-2 py-1">
            🚀 Mission Status: PERFECT
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <NavigationSearch />
      </div>

      {/* Navigation Groups */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-4">
          {navigationGroups.map((group, index) => (
            <NavigationGroup 
              key={group.name} 
              group={group} 
              collapsed={collapsed}
              defaultExpanded={group.defaultExpanded ?? (index < 2)} // Use group setting or expand first 2
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User Profile & Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full flex items-center justify-center relative">
            <Crown className="text-white w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">GOD LAYER</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Supreme Access</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/settings'}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}