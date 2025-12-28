import { useState, useEffect } from 'react';
// Tracking socket functionality simplified for stability
import { cn } from '@/lib/utils';
import { ShipmentData, TrackingUpdate, connectTrackingSocket } from '@/types/tracking';
import { format, parseISO } from 'date-fns';
import { 
  PackageCheck, 
  Truck, 
  Ship, 
  AlertCircle, 
  Package, 
  Warehouse,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { PulseIndicator } from '@/components/ui/pulse-indicator';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TrackingStatusIndicator from './TrackingStatusIndicator';

interface TrackingTimelineProps {
  trackingNumber: string;
  className?: string;
  compact?: boolean;
}

export default function TrackingTimeline({
  trackingNumber,
  className,
  compact = false
}: TrackingTimelineProps) {
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [connected, setConnected] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [recentUpdate, setRecentUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingNumber) return () => {};

    const handleTrackingData = (data: ShipmentData | TrackingUpdate) => {
      // If we got initial data (full shipment)
      if ('carrier' in data) {
        setShipment(data);
        setConnected(true);
      } 
      // If we got an update
      else if ('updateType' in data) {
        if (data.updateType === 'status_change' && data.data?.status) {
          setShipment(prev => prev ? { 
            ...prev, 
            status: data.data.status,
            // Add the update to events
            events: prev.events ? [
              {
                id: `update-${Date.now()}`,
                updateType: 'status_change',
                timestamp: data.timestamp,
                location: data.data.location || prev.currentLocation || 'Unknown',
                status: data.data.status,
                description: `Status updated to: ${formatStatus(data.data.status)}`
              },
              ...prev.events
            ] : undefined
          } : null);
          
          setRecentUpdate(`Status updated to: ${formatStatus(data.data.status)}`);
          
          // Hide update notification after 3 seconds
          setTimeout(() => setRecentUpdate(null), 3000);
        } 
        else if (data.updateType === 'location_update' && data.data?.location) {
          setShipment(prev => prev ? { 
            ...prev, 
            currentLocation: data.data.location,
            // Add the update to events
            events: prev.events ? [
              {
                id: `location-${Date.now()}`,
                updateType: 'location_update',
                timestamp: data.timestamp,
                location: data.data.location,
                status: prev.status,
                description: `Location updated to: ${data.data.location}`
              },
              ...prev.events
            ] : undefined
          } : null);
          
          setRecentUpdate(`Location updated to: ${data.data.location}`);
          
          // Hide update notification after 3 seconds
          setTimeout(() => setRecentUpdate(null), 3000);
        }
      }
    };

    // Connect to tracking updates with proper cleanup
    const cleanup = connectTrackingSocket(handleTrackingData);
    
    return () => {
      if (cleanup && typeof cleanup.disconnect === 'function') {
        cleanup.disconnect();
      }
    };
  }, [trackingNumber]);

  // Format the status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Toggle expanded state for an event
  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Get appropriate icon for a status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BOOKING_CONFIRMED':
        return <Package className="h-4 w-4" />;
      case 'PREPARING_SHIPMENT':
        return <Warehouse className="h-4 w-4" />;
      case 'DEPARTED':
      case 'IN_TRANSIT':
        return <Truck className="h-4 w-4" />;
      case 'ARRIVED_AT_PORT':
      case 'CUSTOMS_CLEARANCE':
        return <Ship className="h-4 w-4" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <PackageCheck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };
  
  // Get color for a status
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'BOOKING_CONFIRMED':
        return 'bg-blue-500 text-white border-blue-600';
      case 'PREPARING_SHIPMENT':
        return 'bg-indigo-500 text-white border-indigo-600';
      case 'DEPARTED':
        return 'bg-purple-500 text-white border-purple-600';
      case 'IN_TRANSIT':
        return 'bg-violet-500 text-white border-violet-600';
      case 'ARRIVED_AT_PORT':
        return 'bg-amber-500 text-white border-amber-600';
      case 'CUSTOMS_CLEARANCE':
        return 'bg-orange-500 text-white border-orange-600';
      case 'OUT_FOR_DELIVERY':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'DELIVERED':
        return 'bg-green-500 text-white border-green-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  if (!connected) {
    return (
      <div className={cn('flex items-center justify-center h-40', className)}>
        <div className="flex flex-col items-center">
          <div className="mb-3 relative">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Package className="h-5 w-5 text-primary animate-bounce" />
            </div>
            <span className="absolute -bottom-1 -right-1">
              <PulseIndicator active={true} color="primary" size="sm" />
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-muted-foreground mt-3">Connecting to tracking server...</span>
        </div>
      </div>
    );
  }

  if (!shipment || !shipment.events || shipment.events.length === 0) {
    return (
      <div className={cn('p-6 border rounded-lg bg-muted/10 group transition-all hover:bg-muted/20', className)}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
            <AlertCircle className="h-7 w-7 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-center">
            <h4 className="font-medium mb-1">No tracking events yet</h4>
            <p className="text-sm text-muted-foreground">
              Tracking information will appear here once the shipment is processed.
            </p>
          </div>
          <div className="w-full max-w-xs h-2 rounded-full bg-muted/50 overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-amber-300 to-amber-500 w-1/3 animate-progress-indeterminate"></div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare events for display
  const events = showAll 
    ? shipment.events 
    : shipment.events.slice(0, compact ? 3 : 5);

  return (
    <div className={cn('relative', className)}>
      {/* Live connection indicator and notification */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Shipment Timeline</h3>
        <TrackingStatusIndicator trackingNumber={trackingNumber} />
      </div>

      {/* New update notification */}
      <AnimatePresence>
        {recentUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm"
          >
            {recentUpdate}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="relative space-y-2">
        {events.map((event, index) => {
          const isExpanded = expandedItems[index] || false;
          const isFirst = index === 0;
          const isLast = index === events.length - 1 && (!shipment.events || index === shipment.events.length - 1);
          
          return (
            <div
              key={`${event.timestamp}-${index}`}
              className={cn(
                "relative pl-8 pb-4",
                !isLast && "border-l-2 border-dashed border-muted ml-2"
              )}
            >
              {/* Timeline dot */}
              <div 
                className={cn(
                  "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110",
                  isFirst ? getStatusColorClass(event.status) : "bg-muted border-muted-foreground/20 group-hover:border-primary/30 group-hover:bg-primary/5"
                )}
              >
                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  {getStatusIcon(event.status)}
                </div>
                {isFirst && (
                  <span className="absolute -top-1 -right-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </span>
                )}
              </div>
              
              {/* Event card */}
              <div className={cn(
                "p-3 rounded-lg border transition-all duration-300 hover:shadow-sm group",
                isFirst ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-muted hover:bg-muted/40 hover:border-muted/70",
                isExpanded && "ring-1 ring-primary/20 shadow-sm"
              )}>
                {/* Clickable header */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "mr-2 text-xs",
                                getStatusColorClass(event.status)
                              )}
                            >
                              {formatStatus(event.status)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{event.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-sm font-medium">{event.description}</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{format(parseISO(event.timestamp), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t space-y-2 text-sm">
                        <div className="flex">
                          <span className="text-muted-foreground w-24">Location:</span>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-primary" />
                            {event.location || 'Unknown'}
                          </div>
                        </div>
                        <div className="flex">
                          <span className="text-muted-foreground w-24">Status:</span>
                          <span>{formatStatus(event.status)}</span>
                        </div>
                        {event.description && (
                          <div className="flex">
                            <span className="text-muted-foreground w-24">Details:</span>
                            <span>{event.description}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more/less button */}
      {shipment.events && shipment.events.length > (compact ? 3 : 5) && (
        <div className="mt-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
              className="text-xs relative group hover:scale-105 transition-transform"
            >
              <div className="flex items-center">
                {showAll ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1 group-hover:translate-x-0.5 transition-transform" />
                    <span>Show All ({shipment.events.length}) Events</span>
                  </>
                )}
              </div>
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}