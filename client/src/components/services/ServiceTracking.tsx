import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Box,
  Plane,
  Ship,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OTMSOrder {
  id: string;
  trackingId: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  shipper: string | null;
  recipient: string | null;
  weight: string | null;
  dimensions: string | null;
  serviceType: string | null;
  carrier: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any> | null;
}

interface OTMSOrderStatus {
  status: string;
  location: string;
  timestamp: string;
  description: string;
  code: string | null;
}

interface ServiceTrackingProps {
  initialTrackingId?: string;
  compact?: boolean;
  showSearch?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  in_transit: "bg-indigo-100 text-indigo-800 border-indigo-200",
  out_for_delivery: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  on_hold: "bg-orange-100 text-orange-800 border-orange-200",
  unknown: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  processing: <Box className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  out_for_delivery: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <AlertCircle className="h-4 w-4" />,
  on_hold: <Clock className="h-4 w-4" />,
};

const getStatusIcon = (status: string): React.ReactNode => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  return STATUS_ICONS[normalizedStatus] || <Package className="h-4 w-4" />;
};

const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  return STATUS_COLORS[normalizedStatus] || STATUS_COLORS.unknown;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const getTransportIcon = (serviceType: string | null): React.ReactNode => {
  if (!serviceType) return <Package className="h-5 w-5" />;
  const type = serviceType.toLowerCase();
  if (type.includes("air") || type.includes("flight")) return <Plane className="h-5 w-5" />;
  if (type.includes("sea") || type.includes("ocean") || type.includes("ship")) return <Ship className="h-5 w-5" />;
  if (type.includes("truck") || type.includes("road") || type.includes("ground")) return <Truck className="h-5 w-5" />;
  if (type.includes("warehouse") || type.includes("storage")) return <Building2 className="h-5 w-5" />;
  return <Package className="h-5 w-5" />;
};

export function ServiceTracking({
  initialTrackingId = "",
  compact = false,
  showSearch = true,
  className,
}: ServiceTrackingProps) {
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [searchInput, setSearchInput] = useState(initialTrackingId);
  const [showTimeline, setShowTimeline] = useState(!compact);

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
    isFetching: orderFetching,
  } = useQuery<{ success: boolean; data: OTMSOrder }>({
    queryKey: [`/api/otms/track/${trackingId}`],
    enabled: !!trackingId && trackingId.trim().length > 0,
  });

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
    isFetching: statusFetching,
  } = useQuery<{ success: boolean; data: OTMSOrderStatus[] }>({
    queryKey: [`/api/otms/status/${trackingId}`],
    enabled: !!trackingId && trackingId.trim().length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTrackingId(searchInput.trim());
    }
  };

  const handleRefresh = () => {
    refetchOrder();
    refetchStatus();
  };

  const order = orderData?.data;
  const statusHistory = statusData?.data || [];
  const isLoading = orderLoading || statusLoading;
  const isFetching = orderFetching || statusFetching;
  const hasError = orderError || statusError;
  const isServiceUnavailable = 
    hasError && 
    (String(hasError).includes("503") || 
     String(hasError).includes("unavailable") ||
     String(hasError).includes("ECONNREFUSED"));

  return (
    <Card className={cn("w-full", className)} data-testid="service-tracking-widget">
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Order Tracking</CardTitle>
              {!compact && (
                <CardDescription>Track your shipment status in real-time</CardDescription>
              )}
            </div>
          </div>
          {trackingId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              data-testid="tracking-refresh-button"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showSearch && (
          <form onSubmit={handleSearch} className="flex gap-2" data-testid="tracking-search-form">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter tracking ID (e.g., MCL-2024-12345)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                data-testid="tracking-search-input"
              />
            </div>
            <Button type="submit" disabled={!searchInput.trim()} data-testid="tracking-search-button">
              Track
            </Button>
          </form>
        )}

        <AnimatePresence mode="wait">
          {!trackingId && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8 text-gray-500"
              data-testid="tracking-empty-state"
            >
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Enter a tracking ID to view shipment details</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              data-testid="tracking-loading"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </motion.div>
          )}

          {isServiceUnavailable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              data-testid="tracking-service-unavailable"
            >
              <Alert variant="default" className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Service Temporarily Unavailable</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  The order tracking service is currently unavailable. Please try again later or contact support for assistance.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {hasError && !isServiceUnavailable && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              data-testid="tracking-error"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Unable to fetch tracking information. The tracking ID may be invalid or the order was not found.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {order && !isLoading && !hasError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
              data-testid="tracking-result"
            >
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  {getTransportIcon(order.serviceType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100" data-testid="tracking-id-display">
                      {order.trackingId}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", getStatusColor(order.status))}
                      data-testid="tracking-status-badge"
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status.replace(/_/g, " ")}</span>
                    </Badge>
                  </div>
                  {order.serviceType && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {order.serviceType} {order.carrier && `via ${order.carrier}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>Origin</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100" data-testid="tracking-origin">
                    {order.origin || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>Destination</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100" data-testid="tracking-destination">
                    {order.destination || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Est. Delivery</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100" data-testid="tracking-eta">
                    {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
                {order.actualDelivery && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Delivered</span>
                    </div>
                    <p className="font-medium text-green-600" data-testid="tracking-delivered">
                      {formatDate(order.actualDelivery)}
                    </p>
                  </div>
                )}
              </div>

              {statusHistory.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => setShowTimeline(!showTimeline)}
                      data-testid="tracking-timeline-toggle"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tracking Timeline ({statusHistory.length} updates)
                      </span>
                      {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    <AnimatePresence>
                      {showTimeline && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-0" data-testid="tracking-timeline">
                            {statusHistory.map((status, index) => (
                              <div
                                key={index}
                                className="relative pl-6 pb-4 last:pb-0"
                                data-testid={`tracking-timeline-item-${index}`}
                              >
                                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                </div>
                                {index < statusHistory.length - 1 && (
                                  <div className="absolute left-[7px] top-4 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                                )}
                                <div className="ml-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={cn("capitalize text-xs", getStatusColor(status.status))}>
                                      {status.status.replace(/_/g, " ")}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(status.timestamp)}
                                    </span>
                                  </div>
                                  {status.location && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {status.location}
                                    </p>
                                  )}
                                  {status.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                      {status.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {(order.shipper || order.recipient || order.weight || order.dimensions) && !compact && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {order.shipper && (
                      <div>
                        <span className="text-gray-500">Shipper:</span>
                        <span className="ml-2 font-medium">{order.shipper}</span>
                      </div>
                    )}
                    {order.recipient && (
                      <div>
                        <span className="text-gray-500">Recipient:</span>
                        <span className="ml-2 font-medium">{order.recipient}</span>
                      </div>
                    )}
                    {order.weight && (
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-2 font-medium">{order.weight}</span>
                      </div>
                    )}
                    {order.dimensions && (
                      <div>
                        <span className="text-gray-500">Dimensions:</span>
                        <span className="ml-2 font-medium">{order.dimensions}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default ServiceTracking;
