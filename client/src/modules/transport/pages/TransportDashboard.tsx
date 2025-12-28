import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Ship, Truck, Train, Globe, Package, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

export default function TransportDashboard() {
  const modules = [
    {
      id: 'air-transport',
      name: 'Air Transport',
      description: 'Fast worldwide air cargo solutions',
      icon: <Plane className="w-8 h-8" />,
      path: '/modules/air-transport',
      status: 'active',
      metrics: {
        activeShipments: 247,
        onTimeRate: '98.5%',
        compliance: 'IATA, ICAO, TSA'
      },
      color: 'bg-blue-500'
    },
    {
      id: 'maritime-transport',
      name: 'Maritime Transport',
      description: 'Ocean freight and container services',
      icon: <Ship className="w-8 h-8" />,
      path: '/modules/maritime-transport',
      status: 'active',
      metrics: {
        activeVessels: 45,
        containerUtilization: '78%',
        compliance: 'IMO, SOLAS, MARPOL'
      },
      color: 'bg-cyan-500'
    },
    {
      id: 'land-transport',
      name: 'Land Transport',
      description: 'Road and rail transportation',
      icon: <Truck className="w-8 h-8" />,
      path: '/modules/land-transport',
      status: 'active',
      metrics: {
        fleetSize: 197,
        onTimeDelivery: '96.8%',
        compliance: 'DOT, FMCSA, ADR'
      },
      color: 'bg-green-500'
    }
  ];

  const globalMetrics = {
    totalShipments: '12,458',
    countriesCovered: '180+',
    avgTransitTime: '3.2 days',
    customerSatisfaction: '4.8/5'
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Globe className="w-10 h-10 text-primary" />
            Transport & Logistics Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Integrated global transportation management system
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 px-4 py-2">
          All Systems Operational
        </Badge>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold">{globalMetrics.totalShipments}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-2xl font-bold">{globalMetrics.countriesCovered}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Transit Time</p>
                <p className="text-2xl font-bold">{globalMetrics.avgTransitTime}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{globalMetrics.customerSatisfaction}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transport Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${module.color} text-white`}>
                  {module.icon}
                </div>
                <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                  {module.status}
                </Badge>
              </div>
              <CardTitle>{module.name}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {module.id === 'air-transport' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Shipments</span>
                      <span className="font-medium">{module.metrics.activeShipments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">On-time Rate</span>
                      <span className="font-medium text-green-600">{module.metrics.onTimeRate}</span>
                    </div>
                  </>
                )}
                {module.id === 'maritime-transport' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Vessels</span>
                      <span className="font-medium">{module.metrics.activeVessels}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Container Utilization</span>
                      <span className="font-medium">{module.metrics.containerUtilization}</span>
                    </div>
                  </>
                )}
                {module.id === 'land-transport' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fleet Size</span>
                      <span className="font-medium">{module.metrics.fleetSize}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">On-time Delivery</span>
                      <span className="font-medium text-green-600">{module.metrics.onTimeDelivery}</span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Compliance: {module.metrics.compliance}</p>
                </div>
              </div>
              <Link href={module.path}>
                <Button className="w-full">
                  Access Module
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common transport management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4">
              <Package className="w-6 h-6 mb-2" />
              <span className="text-xs">New Shipment</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-xs">Track Cargo</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Globe className="w-6 h-6 mb-2" />
              <span className="text-xs">Route Planning</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Modal Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Modal Integration</CardTitle>
          <CardDescription>Seamless connectivity across all transport modes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <div className="flex items-center gap-4">
              <Plane className="w-6 h-6 text-blue-600" />
              <Train className="w-6 h-6 text-gray-600" />
              <Ship className="w-6 h-6 text-cyan-600" />
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="font-medium">Integrated Network</p>
              <p className="text-sm text-gray-600">450+ connection points worldwide</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}