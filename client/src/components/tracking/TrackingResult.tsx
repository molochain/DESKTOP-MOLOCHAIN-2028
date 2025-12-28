import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  MapPin,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TrackingResultProps {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; bgColor: string; label: string }> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Pending'
  },
  in_transit: {
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'In Transit'
  },
  delivered: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Delivered'
  },
  delayed: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'Delayed'
  },
  cancelled: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Cancelled'
  }
};

export default function TrackingResult({
  trackingNumber,
  status,
  origin,
  destination,
  currentLocation,
  estimatedDelivery
}: TrackingResultProps) {
  const statusInfo = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-2 shadow-lg" data-testid="tracking-result-card">
        <CardHeader className={`${statusInfo.bgColor} border-b`}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div>
                <span className="text-lg" data-testid="text-tracking-number">{trackingNumber}</span>
                <Badge 
                  className={`ml-3 ${statusInfo.bgColor} ${statusInfo.color} border-0`}
                  data-testid="badge-status"
                >
                  {statusInfo.label}
                </Badge>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">Origin</p>
              <p className="font-semibold" data-testid="text-origin">{origin}</p>
            </div>
            <div className="flex items-center px-4">
              <div className="w-12 h-0.5 bg-primary/30" />
              <ArrowRight className="w-5 h-5 text-primary mx-1" />
              <div className="w-12 h-0.5 bg-primary/30" />
            </div>
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">Destination</p>
              <p className="font-semibold" data-testid="text-destination">{destination}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Current Location</p>
                <p className="font-medium" data-testid="text-current-location">
                  {currentLocation || 'Location pending'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                </p>
                <p className="font-medium" data-testid="text-delivery-date">
                  {formatDate(estimatedDelivery)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
