import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, Server, Shield, Activity, Users, TrendingUp } from 'lucide-react';

export function GlobalOperationsMonitor() {
  const operations = [
    {
      name: 'Global Network',
      status: 'operational',
      health: 98,
      icon: Globe,
      metrics: {
        'Active Nodes': '1,247',
        'Throughput': '12.5 GB/s',
        'Uptime': '99.97%'
      }
    },
    {
      name: 'Infrastructure',
      status: 'operational',
      health: 95,
      icon: Server,
      metrics: {
        'Servers': '342',
        'CPU Usage': '42%',
        'Memory': '68%'
      }
    },
    {
      name: 'Security',
      status: 'operational',
      health: 100,
      icon: Shield,
      metrics: {
        'Threats Blocked': '15,832',
        'Security Score': '98/100',
        'Last Incident': 'None'
      }
    },
    {
      name: 'Performance',
      status: 'optimal',
      health: 92,
      icon: Activity,
      metrics: {
        'Response Time': '45ms',
        'Error Rate': '0.02%',
        'SLA': '99.99%'
      }
    },
    {
      name: 'User Activity',
      status: 'high',
      health: 88,
      icon: Users,
      metrics: {
        'Active Users': '125K',
        'Sessions': '450K',
        'Requests/sec': '8,542'
      }
    },
    {
      name: 'Business Metrics',
      status: 'growing',
      health: 96,
      icon: TrendingUp,
      metrics: {
        'Revenue': '+15%',
        'Efficiency': '92%',
        'Growth Rate': '8.3%'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'operational':
      case 'optimal':
        return 'bg-green-500';
      case 'high':
      case 'growing':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {operations.map((op) => {
          const Icon = op.icon;
          return (
            <Card key={op.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{op.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(op.status)}>
                    {op.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Health</span>
                      <span className="text-sm font-medium">{op.health}%</span>
                    </div>
                    <Progress 
                      value={op.health} 
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    {Object.entries(op.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">180+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}