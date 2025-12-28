import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MetricCard } from '@/types/dashboard';

interface MetricsCardsProps {
  metrics: MetricCard[];
  className?: string;
}

export function MetricsCards({ metrics, className }: MetricsCardsProps) {
  const getColorClasses = (color: MetricCard['color']) => {
    switch (color) {
      case 'primary':
        return {
          icon: 'bg-primary/20 text-primary',
          value: 'text-primary',
        };
      case 'secondary':
        return {
          icon: 'bg-green-500/20 text-green-500',
          value: 'text-green-500',
        };
      case 'warning':
        return {
          icon: 'bg-yellow-500/20 text-yellow-500',
          value: 'text-yellow-500',
        };
      case 'critical':
        return {
          icon: 'bg-red-500/20 text-red-500',
          value: 'text-red-500',
        };
      default:
        return {
          icon: 'bg-gray-500/20 text-gray-400',
          value: 'text-gray-400',
        };
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6', className)}>
      {metrics.map((metric, index) => {
        const colors = getColorClasses(metric.color);
        
        return (
          <Card
            key={index}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{metric.title}</p>
                  <p className={cn('text-3xl font-bold', colors.value)}>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                  {metric.trend && (
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend.direction)}
                      <span className={cn(
                        'text-sm',
                        metric.trend.direction === 'up' ? 'text-green-500' :
                        metric.trend.direction === 'down' ? 'text-red-500' : 'text-gray-400'
                      )}>
                        {metric.trend.value}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colors.icon)}>
                  <span className="text-xl">{metric.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
