import { useState, useEffect, useRef } from 'react';
// Tracking socket functionality simplified for stability
import { PulseIndicator } from '@/components/ui/pulse-indicator';
import { ShipmentData, TrackingUpdate, connectTrackingSocket } from '@/types/tracking';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  PackageCheck, 
  Truck, 
  Ship, 
  AlertCircle, 
  Package, 
  Warehouse,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  Clipboard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ShipmentJourneyTrackerProps {
  trackingNumber: string;
  className?: string;
  compact?: boolean;
}

// Define shipment journey stages
const JOURNEY_STAGES = [
  {
    id: 'BOOKING_CONFIRMED',
    label: 'Booking Confirmed',
    description: 'Your shipment has been booked',
    icon: <Clipboard />,
    color: 'bg-blue-500'
  },
  {
    id: 'PREPARING_SHIPMENT',
    label: 'Preparing',
    description: 'Your shipment is being prepared',
    icon: <Warehouse />,
    color: 'bg-indigo-500'
  },
  {
    id: 'DEPARTED',
    label: 'Departed',
    description: 'Your shipment has departed from origin',
    icon: <Navigation />,
    color: 'bg-purple-500'
  },
  {
    id: 'IN_TRANSIT',
    label: 'In Transit',
    description: 'Your shipment is on the way',
    icon: <Truck />,
    color: 'bg-violet-500'
  },
  {
    id: 'ARRIVED_AT_PORT',
    label: 'Arrived at Port',
    description: 'Your shipment has arrived at port',
    icon: <Ship />,
    color: 'bg-amber-500'
  },
  {
    id: 'CUSTOMS_CLEARANCE',
    label: 'Customs',
    description: 'Going through customs clearance',
    icon: <Clipboard />,
    color: 'bg-orange-500'
  },
  {
    id: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    description: 'Your shipment is out for delivery',
    icon: <Truck />,
    color: 'bg-emerald-500'
  },
  {
    id: 'DELIVERED',
    label: 'Delivered',
    description: 'Your shipment has been delivered',
    icon: <PackageCheck />,
    color: 'bg-green-500'
  }
];

// Map status codes to journey stages
const STATUS_TO_STAGE_INDEX: Record<string, number> = {};
JOURNEY_STAGES.forEach((stage, index) => {
  STATUS_TO_STAGE_INDEX[stage.id] = index;
});

export default function ShipmentJourneyTracker({
  trackingNumber,
  className,
  compact = false
}: ShipmentJourneyTrackerProps) {
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [progressValue, setProgressValue] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [recentUpdate, setRecentUpdate] = useState<TrackingUpdate | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!trackingNumber) return;

    const handleTrackingData = (data: ShipmentData | TrackingUpdate) => {
      // If we got initial data (full shipment)
      if ('carrier' in data) {
        setShipment(data);
        
        // Set current stage based on status
        const stageIndex = STATUS_TO_STAGE_INDEX[data.status] ?? 0;
        setCurrentStageIndex(stageIndex);
        calculateProgress(stageIndex);
      } 
      // If we got an update
      else if ('updateType' in data) {
        // Show the notification
        setRecentUpdate(data);
        setShowUpdateNotification(true);
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set timeout to hide the notification after 5 seconds
        timeoutRef.current = setTimeout(() => {
          setShowUpdateNotification(false);
        }, 5000);
        
        if (data.updateType === 'status_change' && data.data?.status) {
          setShipment(prev => prev ? { ...prev, status: data.data.status } : null);
          
          // Update stage based on new status
          const stageIndex = STATUS_TO_STAGE_INDEX[data.data.status] ?? 0;
          setCurrentStageIndex(stageIndex);
          setAnimationPlaying(true);
          calculateProgress(stageIndex);
        }
      }
      
      setConnected(true);
    };

    // Connect to tracking updates with proper cleanup
    const cleanup = connectTrackingSocket(handleTrackingData);
    
    return () => {
      cleanup.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trackingNumber]);

  // Calculate progress based on current stage
  const calculateProgress = (stageIndex: number) => {
    const totalStages = JOURNEY_STAGES.length - 1;
    const newProgress = Math.round((stageIndex / totalStages) * 100);
    
    // Animate the progress
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev < newProgress) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setAnimationPlaying(false);
          return prev;
        }
      });
    }, 20);
    
    return () => clearInterval(interval);
  };

  // Format the status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (!connected) {
    return (
      <div className={cn('flex items-center justify-center h-40', className)}>
        <div className="flex flex-col items-center">
          <PulseIndicator active={false} className="mb-2" />
          <span className="text-sm text-muted-foreground">Connecting to tracking server...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative py-4', className)}>
      {/* Live connection indicator */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Shipment Journey</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <PulseIndicator active={connected} className="mr-2" />
          <span>{connected ? 'Live updates active' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Notification for recent updates */}
      <AnimatePresence>
        {showUpdateNotification && recentUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20 flex items-center"
          >
            <div className="bg-primary text-primary-foreground p-2 rounded-full mr-3">
              {recentUpdate.updateType === 'status_change' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {recentUpdate.updateType === 'status_change' 
                  ? `Status updated to: ${formatStatus(recentUpdate.data?.status || '')}`
                  : `Location updated: ${recentUpdate.data?.location || ''}`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(recentUpdate.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Origin</span>
          <span>Destination</span>
        </div>
        <div className="relative mb-1">
          <Progress 
            value={progressValue} 
            className={cn(
              "h-3 transition-all", 
              animationPlaying && "animate-pulse"
            )} 
          />
          
          {/* Current position indicator */}
          {currentStageIndex >= 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 transform -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${progressValue}%` }}
            >
              <motion.div 
                className="bg-primary text-primary-foreground rounded-full flex items-center justify-center h-8 w-8 border-2 border-background shadow-md"
                animate={animationPlaying ? { y: [0, -5, 0] } : {}}
                transition={animationPlaying ? { repeat: Infinity, duration: 1 } : {}}
              >
                {JOURNEY_STAGES[currentStageIndex]?.icon || <MapPin className="h-4 w-4" />}
              </motion.div>
            </motion.div>
          )}
        </div>
        
        {/* Current status display */}
        {shipment && (
          <div className="flex justify-between mt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">From: </span>
              {shipment.origin}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">To: </span>
              {shipment.destination}
            </div>
          </div>
        )}
      </div>

      {/* Journey stage markers */}
      {!compact && (
        <div className="mt-10 grid grid-cols-4 md:grid-cols-8 gap-2">
          {JOURNEY_STAGES.map((stage, index) => {
            const isActive = currentStageIndex >= index;
            const isCurrent = currentStageIndex === index;
            
            return (
              <TooltipProvider key={stage.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all",
                          isActive ? stage.color : "bg-muted",
                          isActive ? "text-white" : "text-muted-foreground",
                          isCurrent && "ring-2 ring-primary ring-offset-2"
                        )}
                        initial={{ scale: isActive ? 0.8 : 1 }}
                        animate={{ 
                          scale: isActive ? 1 : 0.8,
                          y: isCurrent && animationPlaying ? [0, -5, 0] : 0
                        }}
                        transition={isCurrent && animationPlaying ? 
                          { repeat: Infinity, duration: 1 } : 
                          { duration: 0.3 }
                        }
                      >
                        {stage.icon}
                      </motion.div>
                      <span className={cn(
                        "text-xs text-center leading-tight",
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {stage.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stage.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}

      {/* Current status badge */}
      {shipment && (
        <div className="mt-6 flex justify-center">
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-4 py-2 font-medium flex items-center gap-2",
              currentStageIndex >= 0 ? 
                JOURNEY_STAGES[currentStageIndex]?.color.replace('bg-', 'bg-opacity-20 border-') + 
                ' ' + JOURNEY_STAGES[currentStageIndex]?.color.replace('bg-', 'text-')
                : ""
            )}
          >
            {currentStageIndex >= 0 ? (
              <>
                {JOURNEY_STAGES[currentStageIndex]?.icon}
                <span>{formatStatus(shipment.status)}</span>
              </>
            ) : (
              <span>Unknown Status</span>
            )}
          </Badge>
        </div>
      )}

      {/* Show additional details if not in compact mode */}
      {!compact && shipment && (
        <div className="mt-8 grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Carrier</p>
            <p className="font-medium">{shipment.carrier}</p>
          </div>
          {shipment.currentLocation && (
            <div>
              <p className="text-xs text-muted-foreground">Current Location</p>
              <div className="flex items-center font-medium">
                <MapPin className="h-3 w-3 mr-1 text-primary" />
                {shipment.currentLocation?.address || 'Unknown'}
              </div>
            </div>
          )}
          {shipment.estimatedDelivery && (
            <div>
              <p className="text-xs text-muted-foreground">Estimated Delivery</p>
              <div className="flex items-center font-medium">
                <Clock className="h-3 w-3 mr-1 text-primary" />
                {format(new Date(shipment.estimatedDelivery), 'MMM d, yyyy')}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="font-medium">{shipment.lastUpdated ? format(new Date(shipment.lastUpdated || Date.now()), 'MMM d, yyyy h:mm a') : 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  );
}