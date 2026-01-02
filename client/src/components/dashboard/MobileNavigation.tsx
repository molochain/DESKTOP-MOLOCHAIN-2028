import { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, Search, Home, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationSearch } from './NavigationSearch';
import { NavigationGroup } from './NavigationGroup';
import { navigationGroups, findNavigationItem } from '@/config/navigation-optimized';
import { cn } from '@/lib/utils';

export function MobileNavigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('navigation-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('navigation-recent');
    return saved ? JSON.parse(saved).slice(0, 5) : [];
  });

  const toggleFavorite = (path: string) => {
    const updated = favorites.includes(path)
      ? favorites.filter(fav => fav !== path)
      : [...favorites, path];
    
    setFavorites(updated);
    localStorage.setItem('navigation-favorites', JSON.stringify(updated));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-0 flex flex-col" aria-describedby={undefined}>
        <SheetHeader className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <SheetTitle className="text-gray-900 dark:text-white">Navigation</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <NavigationSearch />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={location === '/' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  window.location.href = '/';
                  setOpen(false);
                }}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Home className="h-4 w-4" />
                <span className="text-xs">Home</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const search = document.querySelector('[data-search-trigger]') as HTMLElement;
                  search?.click();
                  setOpen(false);
                }}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Search className="h-4 w-4" />
                <span className="text-xs">Search</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = '/settings';
                  setOpen(false);
                }}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Star className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">Favorites</span>
              </div>
              <div className="space-y-2">
                {favorites.map(path => {
                  const item = findNavigationItem(path);
                  if (!item) return null;
                  const Icon = item.icon;
                  const isActive = location === path;
                  
                  return (
                    <a 
                      key={path} 
                      href={path}
                      onClick={() => setOpen(false)}
                    >
                      <div className={cn(
                        'flex items-center space-x-3 rounded-lg p-2 transition-colors',
                        isActive ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-100 dark:bg-gray-700'
                      )}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent */}
          {recentItems.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">Recent</span>
              </div>
              <div className="space-y-2">
                {recentItems.slice(0, 3).map(path => {
                  const item = findNavigationItem(path);
                  if (!item) return null;
                  const Icon = item.icon;
                  const isActive = location === path;
                  
                  return (
                    <a 
                      key={path} 
                      href={path}
                      onClick={() => setOpen(false)}
                    >
                      <div className={cn(
                        'flex items-center space-x-3 rounded-lg p-2 transition-colors',
                        isActive ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-100 dark:bg-gray-700'
                      )}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Groups */}
          <nav className="p-4 space-y-4">
            {navigationGroups.map((group, index) => (
              <NavigationGroup 
                key={group.name} 
                group={group} 
                collapsed={false}
                defaultExpanded={index < 2}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
