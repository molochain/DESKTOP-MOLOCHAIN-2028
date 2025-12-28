import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '@/components/ui/reveal';
import { 
  PackageCheck, 
  Truck, 
  Ship, 
  AlertCircle, 
  Package, 
  Warehouse,
  MapPin 
} from 'lucide-react';

interface LocalShipmentData {
  id: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  location: string;
  updates: any[];
  carrier?: string;
}

interface ShipmentStatusAnimationProps {
  trackingNumber: string;
  className?: string;
  showText?: boolean;
}

export default function ShipmentStatusAnimation({ 
  trackingNumber, 
  className,
  showText = true 
}: ShipmentStatusAnimationProps) {
  const [shipmentData, setShipmentData] = useState<LocalShipmentData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingNumber) return;

    // Simplified polling approach for tracking data
    const fetchTrackingData = async () => {
      try {
        const response = await fetch(`/api/shipments/track/${trackingNumber}`);
        if (response.ok) {
          const data = await response.json();
          setShipmentData(data);
          setIsConnected(true);
          setConnectionError(null);
        }
      } catch (error) {
        setConnectionError('Failed to fetch tracking data');
        setIsConnected(false);
      }
    };

    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [trackingNumber]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="w-6 h-6 text-yellow-500" />;
      case 'in_transit':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'delivered':
        return <PackageCheck className="w-6 h-6 text-green-500" />;
      case 'delayed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'in_transit':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'delayed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (connectionError) {
    return (
      <div className={cn("flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg", className)}>
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-700">{connectionError}</span>
      </div>
    );
  }

  if (!shipmentData) {
    return (
      <div className={cn("flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg", className)}>
        <div className="w-5 h-5 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-gray-600">Loading tracking information...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-4 p-4 border rounded-lg", getStatusColor(shipmentData.status), className)}>
      <div className="flex items-center space-x-2">
        {getStatusIcon(shipmentData.status)}
        <div className={cn(
          "w-3 h-3 rounded-full",
          isConnected && shipmentData?.status === 'in_transit' 
            ? "bg-blue-500 animate-pulse" 
            : "bg-gray-400"
        )} />
      </div>
      
      {showText && (
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {shipmentData.status.replace('_', ' ').toUpperCase()}
            </span>
            {shipmentData.carrier && (
              <span className="text-xs bg-white px-2 py-1 rounded">
                {shipmentData.carrier}
              </span>
            )}
          </div>
          {shipmentData.location && (
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">{shipmentData.location}</span>
            </div>
          )}
        </div>
      )}

      <motion.div
        animate={{ 
          scale: isConnected ? [1, 1.1, 1] : 1,
          opacity: isConnected ? [1, 0.7, 1] : 0.5
        }}
        transition={{ 
          duration: 2, 
          repeat: isConnected ? Infinity : 0,
          ease: "easeInOut" 
        }}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
      </motion.div>
    </div>
  );
}