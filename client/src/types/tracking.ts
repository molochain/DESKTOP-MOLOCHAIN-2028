export interface ShipmentData {
  id: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  updates: TrackingUpdate[];
  events?: TrackingUpdate[];
  carrier: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  lastUpdated?: string;
}

export interface TrackingUpdate {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
  updateType: 'location' | 'status' | 'delay' | 'delivery' | 'status_change' | 'location_update';
  data?: any;
}

// Helper function for tracking socket connection
export function connectTrackingSocket(onUpdate: (data: any) => void) {
  // Using polling instead of WebSocket for stability
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/tracking/updates');
      if (response.ok) {
        const updates = await response.json();
        onUpdate(updates);
      }
    } catch (error) {
      console.warn('Tracking update polling failed:', error);
    }
  }, 5000);

  return {
    disconnect: () => clearInterval(pollInterval)
  };
}