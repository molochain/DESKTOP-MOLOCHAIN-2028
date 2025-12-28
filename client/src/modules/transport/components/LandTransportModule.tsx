import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Truck, Train, Package, MapPin, Navigation, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LandTransportModule() {
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState('trucking');

  const transportModes = [
    {
      id: 'trucking',
      name: 'Trucking Services',
      icon: <Truck className="w-5 h-5" />,
      active: 142,
      capacity: 88,
      status: 'optimal'
    },
    {
      id: 'rail',
      name: 'Rail Freight',
      icon: <Train className="w-5 h-5" />,
      active: 28,
      capacity: 72,
      status: 'good'
    },
    {
      id: 'special',
      name: 'Special Transport',
      icon: <Package className="w-5 h-5" />,
      active: 15,
      capacity: 65,
      status: 'available'
    }
  ];

  const activeShipments = [
    {
      id: 'TRK-2024-001',
      type: 'FTL',
      route: 'Berlin → Paris',
      vehicle: 'MB Actros #4521',
      status: 'In Transit',
      progress: 65,
      eta: '6 hours'
    },
    {
      id: 'RAIL-2024-042',
      type: 'Intermodal',
      route: 'Munich → Rotterdam',
      vehicle: 'Rail Unit #892',
      status: 'Loading',
      progress: 15,
      eta: '2 days'
    },
    {
      id: 'TRK-2024-002',
      type: 'LTL',
      route: 'Madrid → Barcelona',
      vehicle: 'Volvo FH #3210',
      status: 'In Transit',
      progress: 85,
      eta: '2 hours'
    }
  ];

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    toast({
      title: "Transport Mode Selected",
      description: `Viewing ${modeId} operations`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Land Transport Module</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Road, rail, and overland transportation solutions
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">DOT Compliant</Badge>
          <Badge className="bg-blue-100 text-blue-800">ADR Certified</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {transportModes.map((mode) => (
          <Card 
            key={mode.id}
            className={`hover:shadow-lg transition-all cursor-pointer ${
              selectedMode === mode.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                {mode.icon}
                <Badge 
                  variant={mode.status === 'optimal' ? 'default' : 'secondary'}
                >
                  {mode.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{mode.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Active Units</span>
                  <span className="font-bold">{mode.active}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Capacity</span>
                    <span>{mode.capacity}%</span>
                  </div>
                  <Progress value={mode.capacity} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Shipment Tracking</CardTitle>
          <CardDescription>Real-time monitoring of land transport operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeShipments.map((shipment) => (
              <div 
                key={shipment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {shipment.type.includes('RAIL') ? 
                      <Train className="w-5 h-5 text-blue-600" /> : 
                      <Truck className="w-5 h-5 text-green-600" />
                    }
                    <div>
                      <p className="font-medium">{shipment.id}</p>
                      <p className="text-sm text-gray-600">{shipment.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={shipment.status === 'In Transit' ? 'default' : 'secondary'}>
                      {shipment.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">ETA: {shipment.eta}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{shipment.vehicle}</span>
                    <span>{shipment.type}</span>
                  </div>
                  <Progress value={shipment.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Available</span>
                <span className="font-bold text-green-600">47</span>
              </div>
              <div className="flex justify-between">
                <span>In Transit</span>
                <span className="font-bold text-blue-600">138</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance</span>
                <span className="font-bold text-orange-600">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Deliveries</span>
                <span className="font-bold">342</span>
              </div>
              <div className="flex justify-between">
                <span>On-time Rate</span>
                <span className="font-bold text-green-600">96.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Distance</span>
                <span className="font-bold">28,450 km</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Network Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Countries</span>
                <span className="font-bold">28</span>
              </div>
              <div className="flex justify-between">
                <span>Cities</span>
                <span className="font-bold">450+</span>
              </div>
              <div className="flex justify-between">
                <span>Terminals</span>
                <span className="font-bold">85</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Door-to-Door</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Express</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Temperature</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}