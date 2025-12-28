import { useEffect, useState } from 'react';
import { Clock, Users, Activity, Crown, Shield, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccessibilityMode } from '@/hooks/use-accessibility-mode';
import { MobileNavigation } from './MobileNavigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { DashboardStats } from '@/types/dashboard';

interface HeaderProps {
  stats?: DashboardStats;
  isOnline?: boolean;
}

export function Header({ stats, isOnline = true }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isEnabled: accessibilityMode, toggle: toggleAccessibility } = useAccessibilityMode();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Navigation */}
          <MobileNavigation />
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 text-gray-900 dark:text-white font-bold px-3 py-1">
                  GOD LAYER
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Owner: <span className="text-gray-900 dark:text-white font-semibold">Afsin Mert Movasi</span></span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MoloChain Ecosystem Control Panel</h1>
            <p className="text-gray-600 dark:text-gray-400">Everything starts from here - Global logistics command center</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Accessibility Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAccessibility}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title={accessibilityMode ? "Disable accessibility tooltips" : "Enable accessibility tooltips"}
          >
            {accessibilityMode ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </Button>
          
          {/* System Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isOnline ? 'System Online' : 'System Offline'}
            </span>
          </div>

          {/* Current Time */}
          <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)}</span>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-secondary" />
                <span className="text-sm text-secondary">
                  Active Users: {stats.activeUsers.toLocaleString()}
                </span>
              </div>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">|</span>
              
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="text-sm text-secondary">
                  Daily Transactions: {stats.dailyTransactions.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
