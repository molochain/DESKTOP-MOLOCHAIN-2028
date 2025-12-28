import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Package, 
  Truck, 
  Plane, 
  Ship, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Bell,
  Share2,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingData {
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';
  currentLocation: string;
  destination: string;
  estimatedDelivery: string;
  shipmentType: 'ground' | 'air' | 'ocean' | 'rail';
  progress: number;
  timeline: TimelineEvent[];
  details: ShipmentDetails;
}

interface TimelineEvent {
  id: string;
  timestamp: Date;
  location: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

interface ShipmentDetails {
  weight: string;
  dimensions: string;
  value: string;
  carrier: string;
  service: string;
  reference: string;
}

interface ModernTrackingProps {
  className?: string;
}

export function ModernTracking({ className }: ModernTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedNumber, setSearchedNumber] = useState('');
  const [notifications, setNotifications] = useState(true);

  const { data: trackingData, isLoading, error, refetch } = useQuery({
    queryKey: ['tracking', searchedNumber],
    queryFn: async () => {
      if (!searchedNumber) return null;
      
      const response = await fetch(`/api/tracking/${searchedNumber}`);
      if (!response.ok) {
        throw new Error('Tracking information not found');
      }
      
      const data = await response.json();
      
      // Transform API response to match our interface
      return {
        trackingNumber: searchedNumber,
        status: data.status?.toLowerCase() || 'pending',
        currentLocation: data.currentLocation || 'Processing Center',
        destination: data.destination || 'Unknown',
        estimatedDelivery: data.estimatedDelivery || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        shipmentType: data.shipmentType || 'ground',
        progress: calculateProgress(data.status),
        timeline: generateTimeline(data),
        details: {
          weight: data.weight || '2.5 kg',
          dimensions: data.dimensions || '30x20x15 cm',
          value: data.value || '$250',
          carrier: data.carrier || 'Express Logistics',
          service: data.service || 'Standard Delivery',
          reference: data.reference || 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase()
        }
      } as TrackingData;
    },
    enabled: !!searchedNumber,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      setSearchedNumber(trackingNumber.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShipmentIcon = (type: string) => {
    switch (type) {
      case 'air': return <Plane className="w-5 h-5" />;
      case 'ocean': return <Ship className="w-5 h-5" />;
      case 'rail': return <Truck className="w-5 h-5" />;
      default: return <Truck className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Track Your Shipment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!trackingNumber.trim() || isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
          
          {/* Quick Links */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTrackingNumber('DEMO123456');
                setSearchedNumber('DEMO123456');
              }}
            >
              Try Demo: DEMO123456
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTrackingNumber('EXPRESS789');
                setSearchedNumber('EXPRESS789');
              }}
            >
              Try Demo: EXPRESS789
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tracking Not Found</h3>
              <p className="text-sm text-gray-600">
                Please check your tracking number and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getShipmentIcon(trackingData.shipmentType)}
                  <span>Tracking: {trackingData.trackingNumber}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Notify
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <Badge className={getStatusColor(trackingData.status)}>
                    {trackingData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Location</div>
                  <div className="font-medium">{trackingData.currentLocation}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Destination</div>
                  <div className="font-medium">{trackingData.destination}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. Delivery</div>
                  <div className="font-medium">{formatDate(trackingData.estimatedDelivery)}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{trackingData.progress}%</span>
                </div>
                <Progress value={trackingData.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingData.timeline.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full mt-2 flex-shrink-0",
                          event.status === 'completed' ? 'bg-green-500' :
                          event.status === 'current' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-300'
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{event.description}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(event.timestamp.toISOString())}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Package Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span>{trackingData.details.weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span>{trackingData.details.dimensions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Declared Value:</span>
                          <span>{trackingData.details.value}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Service Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carrier:</span>
                          <span>{trackingData.details.carrier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span>{trackingData.details.service}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span>{trackingData.details.reference}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle>Route Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Interactive map view</p>
                      <p className="text-sm">Route visualization would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// Helper functions
function calculateProgress(status: string): number {
  switch (status?.toLowerCase()) {
    case 'pending': return 10;
    case 'processing': return 25;
    case 'in_transit': return 60;
    case 'out_for_delivery': return 85;
    case 'delivered': return 100;
    case 'delayed': return 40;
    default: return 0;
  }
}

function generateTimeline(data: any): TimelineEvent[] {
  const now = new Date();
  return [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      location: 'Origin Facility',
      description: 'Package received',
      status: 'completed'
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000),
      location: 'Sorting Facility',
      description: 'In transit to destination',
      status: 'completed'
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      location: 'Regional Hub',
      description: 'Package sorted',
      status: 'current'
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      location: 'Local Facility',
      description: 'Out for delivery',
      status: 'pending'
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      location: data.destination || 'Destination',
      description: 'Delivered',
      status: 'pending'
    }
  ];
}

export default ModernTracking;