import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plane, Package, Clock, TrendingUp, Globe, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AirTransportModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const services = [
    {
      id: 'next-flight-out',
      name: 'Next Flight Out',
      status: 'active',
      capacity: 85,
      icon: <Plane className="w-5 h-5" />
    },
    {
      id: 'charter-solutions',
      name: 'Charter Solutions',
      status: 'available',
      capacity: 60,
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'express-delivery',
      name: 'Express Delivery',
      status: 'active',
      capacity: 92,
      icon: <Clock className="w-5 h-5" />
    }
  ];

  const handleServiceAction = (serviceId: string) => {
    toast({
      title: "Service Activated",
      description: `Air transport service ${serviceId} is now active`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Air Transport Module</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fast and reliable worldwide air cargo transportation solutions
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800">IATA Certified</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                {service.icon}
                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                  {service.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Capacity</span>
                    <span>{service.capacity}%</span>
                  </div>
                  <Progress value={service.capacity} className="h-2" />
                </div>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => handleServiceAction(service.id)}
                >
                  Manage Service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-time Flight Tracking</CardTitle>
          <CardDescription>Monitor active air freight shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Plane className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">Flight LH-8392</p>
                  <p className="text-sm text-gray-600">Frankfurt → New York</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                <p className="text-sm text-gray-600 mt-1">ETA: 4h 30m</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Plane className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium">Flight SQ-402</p>
                  <p className="text-sm text-gray-600">Singapore → London</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">On-time Delivery</span>
                <span className="font-bold text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Transit Time</span>
                <span className="font-bold">18.4 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Shipments</span>
                <span className="font-bold">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compliance Rate</span>
                <span className="font-bold text-green-600">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>IATA</span>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>ICAO</span>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>TSA</span>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Dangerous Goods</span>
                <Badge className="bg-green-100 text-green-800">Certified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}