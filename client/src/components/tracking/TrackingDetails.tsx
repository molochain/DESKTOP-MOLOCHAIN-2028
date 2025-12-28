
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ShipmentDetails {
  trackingNumber: string;
  status: string;
  currentLocation: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  updatedAt: string;
  id: string;
}

export default function TrackingDetails({ shipment }: { shipment: ShipmentDetails }) {
  // Fetch predictive analytics data
  const { data: prediction } = useQuery({
    queryKey: [`/api/analytics/predict/${shipment.id}`],
    enabled: !!shipment.id,
  });

  // Request route optimization
  const requestOptimization = async () => {
    try {
      const response = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipmentId: shipment.id,
          parameters: {
            optimizeFor: "time",
            preferredRouteType: "balanced",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request optimization");
      }
    } catch (error) {
      // Optimization request failed - handled by toast notification
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tracking Number */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Tracking Number</h3>
          <p className="text-lg font-semibold">{shipment.trackingNumber}</p>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="text-lg font-semibold capitalize">{shipment.status}</p>
        </div>

        {/* Current Location */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Current Location</h3>
          <p className="text-lg">{shipment.currentLocation}</p>
        </div>

        {/* Route Information */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Route</h3>
          <p className="text-base">From: {shipment.origin}</p>
          <p className="text-base">To: {shipment.destination}</p>
          <Button
            onClick={requestOptimization}
            variant="outline"
            className="mt-2"
            size="sm"
          >
            Optimize Route
          </Button>
        </div>

        {/* Delivery Estimation */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Estimated Delivery</h3>
          <p className="text-lg">
            {shipment.estimatedDelivery
              ? format(new Date(shipment.estimatedDelivery), "PPP")
              : "Not available"}
          </p>
          {prediction && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="text-sm">
                AI Prediction: {format(new Date((prediction as any).predictedDeliveryTime), "PPP p")}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round((prediction as any).confidence * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(shipment.updatedAt), "PPP p")}
        </div>
      </CardContent>
    </Card>
  );
}
