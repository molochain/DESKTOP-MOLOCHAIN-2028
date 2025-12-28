import { Router } from 'express';
import { WebSocketServer } from 'ws';
import { db } from '../db';
import { shipments, insertShipmentSchema } from '../../shared/schema';
import { requireAuth, requireRole } from '../middleware/auth';
import { eq, count, sql } from 'drizzle-orm';

const router = Router();

interface SupplyChainMetrics {
  activeShipments: number;
  pendingShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
  totalShipments: number;
  efficiency: number;
  timestamp: Date;
}

interface ShipmentUpdate {
  id: string;
  location: [number, number];
  status: 'active' | 'delayed' | 'completed';
  progress: number;
  eta: string;
}

interface HotspotData {
  location: [number, number];
  name: string;
  intensity: number;
  shipments: number;
  avgDelay: number;
  type: 'port' | 'airport' | 'warehouse' | 'customs';
}

const locationCoordinates: Record<string, [number, number]> = {
  'Shanghai, China': [31.2304, 121.4737],
  'Los Angeles, USA': [34.0522, -118.2437],
  'Singapore': [1.3521, 103.8198],
  'Rotterdam, Netherlands': [51.9244, 4.4777],
  'Hamburg, Germany': [53.5511, 9.9937],
  'New York, USA': [40.7128, -74.0060],
  'Hong Kong': [22.3193, 114.1694],
  'Dubai, UAE': [25.2048, 55.2708],
  'Tokyo, Japan': [35.6762, 139.6503],
  'San Francisco, USA': [37.7749, -122.4194],
  'Sydney, Australia': [-33.8688, 151.2093],
  'Mumbai, India': [19.0760, 72.8777],
  'London, UK': [51.5074, -0.1278],
  'Busan, South Korea': [35.1796, 129.0756],
  'Vancouver, Canada': [49.2827, -123.1207],
  'Antwerp, Belgium': [51.2194, 4.4025],
  'Shenzhen, China': [22.5431, 114.0579],
  'Felixstowe, UK': [51.9614, 1.3514],
};

function getCoordinates(location: string): [number, number] {
  return locationCoordinates[location] || [0, 0];
}

function calculateProgress(createdAt: Date, estimatedDelivery: Date | null): number {
  if (!estimatedDelivery) return 0;
  const now = new Date();
  const total = estimatedDelivery.getTime() - createdAt.getTime();
  const elapsed = now.getTime() - createdAt.getTime();
  const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
  return Math.round(progress);
}

function formatEta(estimatedDelivery: Date | null): string {
  if (!estimatedDelivery) return 'TBD';
  const now = new Date();
  const diff = estimatedDelivery.getTime() - now.getTime();
  if (diff <= 0) return 'Arrived';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

router.get('/api/supply-chain/metrics', requireAuth, async (req, res) => {
  try {
    const statusCountsResult = await db
      .select({
        status: shipments.status,
        count: sql<number>`count(*)::int`
      })
      .from(shipments)
      .groupBy(shipments.status);

    const statusCounts: Record<string, number> = {
      in_transit: 0,
      pending: 0,
      delivered: 0,
      delayed: 0,
      cancelled: 0,
    };

    statusCountsResult.forEach((row) => {
      if (row.status && row.status in statusCounts) {
        statusCounts[row.status] = row.count;
      }
    });

    const activeShipments = statusCounts.in_transit;
    const totalShipments = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const deliveredShipments = statusCounts.delivered;
    const delayedShipments = statusCounts.delayed;
    
    const efficiency = totalShipments > 0 
      ? ((deliveredShipments + activeShipments) / totalShipments) * 100 
      : 0;

    const metrics: SupplyChainMetrics = {
      activeShipments,
      pendingShipments: statusCounts.pending,
      deliveredShipments,
      delayedShipments,
      totalShipments,
      efficiency: Math.round(efficiency * 100) / 100,
      timestamp: new Date()
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching supply chain metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/api/supply-chain/shipments', requireAuth, async (req, res) => {
  try {
    const dbShipments = await db.select().from(shipments).orderBy(shipments.createdAt);
    
    const formattedShipments = dbShipments.map((shipment) => {
      const originCoords = getCoordinates(shipment.origin);
      const destCoords = getCoordinates(shipment.destination);
      const progress = calculateProgress(shipment.createdAt!, shipment.estimatedDelivery);
      
      let currentCoords: [number, number];
      if (shipment.status === 'delivered') {
        currentCoords = destCoords;
      } else if (shipment.status === 'pending') {
        currentCoords = originCoords;
      } else {
        const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * (progress / 100);
        const lng = originCoords[1] + (destCoords[1] - originCoords[1]) * (progress / 100);
        currentCoords = [lat, lng];
      }

      return {
        id: shipment.trackingNumber,
        dbId: shipment.id,
        origin: originCoords,
        originName: shipment.origin,
        destination: destCoords,
        destinationName: shipment.destination,
        current: currentCoords,
        currentLocation: shipment.currentLocation,
        status: shipment.status === 'in_transit' ? 'active' : shipment.status,
        type: 'sea',
        cargo: 'General Cargo',
        progress,
        eta: formatEta(shipment.estimatedDelivery),
        estimatedDelivery: shipment.estimatedDelivery,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      };
    });

    res.json(formattedShipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

router.post('/api/supply-chain/shipments', requireAuth, async (req, res) => {
  try {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingNumber = `MOLO-${timestamp}${random}`;

    const shipmentData = {
      ...req.body,
      trackingNumber,
      status: req.body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validatedData = insertShipmentSchema.parse(shipmentData);

    const [newShipment] = await db.insert(shipments).values(validatedData).returning();

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      shipment: newShipment,
    });
  } catch (error: any) {
    console.error('Error creating shipment:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

router.get('/api/supply-chain/hotspots', requireAuth, async (req, res) => {
  try {
    const hotspots: HotspotData[] = [
      {
        location: [31.2304, 121.4737],
        name: 'Shanghai Port',
        intensity: 85,
        shipments: 450,
        avgDelay: 1.5,
        type: 'port'
      },
      {
        location: [1.3521, 103.8198],
        name: 'Singapore Hub',
        intensity: 90,
        shipments: 380,
        avgDelay: 0.8,
        type: 'port'
      },
      {
        location: [40.7128, -74.0060],
        name: 'JFK Airport',
        intensity: 75,
        shipments: 220,
        avgDelay: 2.0,
        type: 'airport'
      },
      {
        location: [51.5074, -0.1278],
        name: 'Heathrow Airport',
        intensity: 80,
        shipments: 195,
        avgDelay: 1.2,
        type: 'airport'
      },
      {
        location: [25.2048, 55.2708],
        name: 'Dubai Logistics City',
        intensity: 70,
        shipments: 165,
        avgDelay: 0.9,
        type: 'warehouse'
      },
      {
        location: [22.3193, 114.1694],
        name: 'Hong Kong Port',
        intensity: 82,
        shipments: 310,
        avgDelay: 1.8,
        type: 'port'
      },
      {
        location: [34.0522, -118.2437],
        name: 'Los Angeles Port',
        intensity: 78,
        shipments: 355,
        avgDelay: 2.5,
        type: 'port'
      },
      {
        location: [52.5200, 13.4050],
        name: 'Berlin Logistics Hub',
        intensity: 62,
        shipments: 140,
        avgDelay: 1.0,
        type: 'warehouse'
      }
    ];

    res.json(hotspots);
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    res.status(500).json({ error: 'Failed to fetch hotspots' });
  }
});

router.get('/api/supply-chain/routes', requireAuth, async (req, res) => {
  try {
    const routes = [
      {
        route: 'Asia-Pacific → North America',
        volume: 45000,
        efficiency: 87,
        delays: 8,
        trend: 'up'
      },
      {
        route: 'Europe → North America',
        volume: 32000,
        efficiency: 91,
        delays: 5,
        trend: 'stable'
      },
      {
        route: 'Asia → Middle East',
        volume: 28000,
        efficiency: 79,
        delays: 12,
        trend: 'down'
      },
      {
        route: 'Europe → Asia',
        volume: 36000,
        efficiency: 85,
        delays: 9,
        trend: 'up'
      },
      {
        route: 'North America → Asia',
        volume: 39000,
        efficiency: 88,
        delays: 7,
        trend: 'stable'
      },
      {
        route: 'Middle East → Europe',
        volume: 26000,
        efficiency: 83,
        delays: 6,
        trend: 'up'
      }
    ];

    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

router.get('/api/supply-chain/alerts', requireAuth, async (req, res) => {
  try {
    const alerts = [
      {
        id: 'ALT001',
        type: 'warning',
        title: 'Port Congestion',
        description: 'Shanghai Port operating at 25% above capacity',
        location: 'Shanghai, China',
        timestamp: new Date(Date.now() - 1800000),
        severity: 'high'
      },
      {
        id: 'ALT002',
        type: 'danger',
        title: 'Weather Delay',
        description: 'Severe storms affecting North Atlantic shipping routes',
        location: 'North Atlantic',
        timestamp: new Date(Date.now() - 3600000),
        severity: 'critical'
      },
      {
        id: 'ALT003',
        type: 'info',
        title: 'Route Optimization',
        description: 'Alternative route available via Suez Canal',
        location: 'Mediterranean',
        timestamp: new Date(Date.now() - 7200000),
        severity: 'low'
      },
      {
        id: 'ALT004',
        type: 'warning',
        title: 'Customs Delay',
        description: 'Extended processing times at EU borders',
        location: 'European Union',
        timestamp: new Date(Date.now() - 10800000),
        severity: 'medium'
      }
    ];

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export function setupSupplyChainWebSocket(wss: WebSocketServer) {
  setInterval(() => {
    const update = {
      type: 'shipment_update',
      data: {
        id: `SHP00${Math.floor(Math.random() * 5) + 1}`,
        location: [
          Math.random() * 140 - 70,
          Math.random() * 360 - 180
        ],
        status: Math.random() > 0.8 ? 'delayed' : 'active',
        progress: Math.floor(Math.random() * 100),
        eta: `${Math.floor(Math.random() * 24) + 1} hours`
      },
      timestamp: new Date()
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(update));
      }
    });
  }, 5000);

  setInterval(() => {
    const metricsUpdate = {
      type: 'metrics_update',
      data: {
        activeShipments: Math.floor(Math.random() * 50) + 200,
        efficiency: Math.random() * 15 + 80,
        avgDelay: Math.random() * 3 + 1,
        timestamp: new Date()
      }
    };

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(metricsUpdate));
      }
    });
  }, 10000);
}

export default router;
