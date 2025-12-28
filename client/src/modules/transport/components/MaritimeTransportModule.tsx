import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ship, Anchor, Container, Globe, Activity, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MaritimeTransportModule() {
  const [activeService, setActiveService] = useState('container');
  const { toast } = useToast();

  const services = [
    {
      id: 'container',
      name: 'Container Services',
      description: 'FCL, LCL, and specialized container solutions',
      capacity: 78,
      status: 'active',
      icon: <Container className="w-5 h-5" />
    },
    {
      id: 'tranship',
      name: 'Transhipment',
      description: 'Expert cargo transfer and logistics',
      capacity: 65,
      status: 'active',
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'port-services',
      name: 'Port Operations',
      description: 'Terminal operations and cargo handling',
      capacity: 82,
      status: 'active',
      icon: <Anchor className="w-5 h-5" />
    },
    {
      id: 'chartering',
      name: 'Vessel Chartering',
      description: 'Voyage and time charter solutions',
      capacity: 45,
      status: 'available',
      icon: <Ship className="w-5 h-5" />
    }
  ];

  const vessels = [
    {
      name: 'MSC Gülsün',
      route: 'Shanghai → Rotterdam',
      status: 'At Sea',
      eta: '5 days',
      load: 85
    },
    {
      name: 'Ever Given',
      route: 'Singapore → Los Angeles',
      status: 'In Port',
      eta: 'Loading',
      load: 42
    },
    {
      name: 'COSCO Shipping',
      route: 'Hamburg → New York',
      status: 'At Sea',
      eta: '3 days',
      load: 93
    }
  ];

  const handleServiceManage = (serviceId: string) => {
    setActiveService(serviceId);
    toast({
      title: "Service Selected",
      description: `Managing ${serviceId} operations`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maritime Transport Module</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ocean freight, container services, and port operations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-800">IMO Certified</Badge>
          <Badge className="bg-green-100 text-green-800">SOLAS Compliant</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`hover:shadow-lg transition-all cursor-pointer ${
              activeService === service.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleServiceManage(service.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {service.icon}
                <Badge 
                  variant={service.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {service.status}
                </Badge>
              </div>
              <CardTitle className="text-base">{service.name}</CardTitle>
              <CardDescription className="text-xs">
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Utilization</span>
                  <span>{service.capacity}%</span>
                </div>
                <Progress value={service.capacity} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Vessel Tracking</CardTitle>
          <CardDescription>Real-time monitoring of maritime shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vessels.map((vessel, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Ship className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium">{vessel.name}</p>
                    <p className="text-sm text-gray-600">{vessel.route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Load</p>
                    <p className="font-bold">{vessel.load}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">ETA</p>
                    <p className="font-medium">{vessel.eta}</p>
                  </div>
                  <Badge 
                    variant={vessel.status === 'At Sea' ? 'default' : 'secondary'}
                  >
                    {vessel.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Port Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Active Ports</span>
                <span className="font-bold">147</span>
              </div>
              <div className="flex justify-between">
                <span>Countries</span>
                <span className="font-bold">82</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Sailings</span>
                <span className="font-bold">450+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Container Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>20' Containers</span>
                <span className="font-bold">12,500</span>
              </div>
              <div className="flex justify-between">
                <span>40' Containers</span>
                <span className="font-bold">8,200</span>
              </div>
              <div className="flex justify-between">
                <span>Reefer Units</span>
                <span className="font-bold">1,850</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>On-time Arrival</span>
                <span className="font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Cargo Damage Rate</span>
                <span className="font-bold text-green-600">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Satisfaction</span>
                <span className="font-bold text-green-600">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}