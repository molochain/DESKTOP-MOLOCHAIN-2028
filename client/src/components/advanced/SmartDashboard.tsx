import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Globe,
  BarChart3,
  Activity,
  Settings,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIAssistant from './AIAssistant';

interface DashboardMetrics {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  delayedShipments: number;
  efficiency: number;
  costSavings: number;
  alerts: Alert[];
  recommendations: Recommendation[];
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  actionRequired: boolean;
}

interface Recommendation {
  id: string;
  category: 'cost' | 'efficiency' | 'sustainability' | 'compliance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings?: number;
}

export function SmartDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/metrics?range=${timeRange}`);
      if (!response.ok) {
        // Return mock data structure for development
        return {
          totalShipments: 1247,
          activeShipments: 89,
          completedShipments: 1158,
          delayedShipments: 12,
          efficiency: 92,
          costSavings: 45680,
          alerts: [
            {
              id: '1',
              type: 'warning' as const,
              title: 'Route Optimization Available',
              description: 'Potential 15% time savings identified for Route B-47',
              timestamp: new Date(),
              actionRequired: true
            }
          ],
          recommendations: [
            {
              id: '1',
              category: 'cost' as const,
              title: 'Consolidate Shipments',
              description: 'Combine smaller shipments to reduce costs',
              impact: 'high' as const,
              savings: 12500
            }
          ]
        };
      }
      return response.json() as Promise<DashboardMetrics>;
    },
    refetchInterval: 30000,
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRecommendationColor = (category: string) => {
    switch (category) {
      case 'cost': return 'bg-green-100 text-green-800';
      case 'efficiency': return 'bg-blue-100 text-blue-800';
      case 'sustainability': return 'bg-emerald-100 text-emerald-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleServiceRecommendation = (service: string) => {
    if (import.meta.env.DEV) {
      console.log('AI recommended service:', service);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights for your logistics operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('24h')}
          >
            24h
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7d
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30d
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalShipments || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeShipments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.delayedShipments || 0} delayed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.efficiency || 0}%</div>
            <Progress value={metrics?.efficiency || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics?.costSavings || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Shipment #SH001 delivered</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New quote request received</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Route optimization completed</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics?.recommendations?.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getRecommendationColor(rec.category)}>
                        {rec.category}
                      </Badge>
                      <Badge variant={rec.impact === 'high' ? 'destructive' : 
                                   rec.impact === 'medium' ? 'default' : 'secondary'}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    {rec.savings && (
                      <p className="text-xs text-green-600 mt-1">
                        Potential savings: ${rec.savings.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-sm text-muted-foreground">On-time Delivery</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4.2</div>
                  <p className="text-sm text-muted-foreground">Average Transit Days</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15%</div>
                  <p className="text-sm text-muted-foreground">Cost Reduction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics?.alerts?.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {alert.actionRequired && (
                    <Button size="sm" variant="outline">
                      Action Required
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AIAssistant 
                context="logistics" 
                onServiceRecommendation={handleServiceRecommendation}
                className="h-[600px]"
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Track Shipment
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Get Quote
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    Find Services
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SmartDashboard;