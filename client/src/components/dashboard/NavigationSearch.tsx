import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Search, Command } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { navigationGroups, type NavigationGroup } from '@/config/navigation-optimized';

export function NavigationSearch() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setLocation(path);
    setOpen(false);
    setSearchQuery('');
  }, [setLocation]);

  // Flatten all navigation items for search
  const allItems = navigationGroups.flatMap(group => 
    group.items.map(item => ({
      ...item,
      groupName: group.name
    }))
  );

  // Filter items based on search query
  const filteredItems = searchQuery
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.groupName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems;

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search navigation...
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search navigation..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
          aria-label="Search navigation items"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navigationGroups.map((group) => {
            const groupFilteredItems = group.items.filter(item =>
              searchQuery === '' || 
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (groupFilteredItems.length === 0) return null;

            return (
              <CommandGroup key={group.name} heading={group.name}>
                {groupFilteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.path}
                      onSelect={() => handleSelect(item.path)}
                      className="cursor-pointer"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}