import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, Activity } from 'lucide-react';

interface ServiceStatsProps {
  totalServices?: number;
  categories?: any[];
  services?: any[];
}

export function ServiceStats({ totalServices = 52, categories = [], services = [] }: ServiceStatsProps) {
  const stats = [
    {
      title: 'Total Services',
      value: '52',
      change: '+8%',
      trend: 'up',
      icon: Package,
      color: 'text-blue-500'
    },
    {
      title: 'Active Users',
      value: '12,458',
      change: '+15%',
      trend: 'up',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Revenue',
      value: '$2.4M',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-yellow-500'
    },
    {
      title: 'Avg. Response Time',
      value: '45ms',
      change: '-5%',
      trend: 'down',
      icon: Activity,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
        const trendColor = stat.trend === 'up' ? 'text-green-500' : 'text-red-500';
        
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}