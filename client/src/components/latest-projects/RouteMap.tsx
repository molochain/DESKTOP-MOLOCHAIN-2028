import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect } from 'react';

// Define the marker icon to avoid the missing marker icon issue
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PortData {
  name: string;
  coordinates: [number, number];
  country: string;
}

// Port coordinates mapping
const portCoordinates: Record<string, PortData> = {
  "Istanbul Port": {
    name: "Istanbul Port",
    coordinates: [41.0082, 28.9784],
    country: "Turkey"
  },
  "Lagos Port": {
    name: "Lagos Port",
    coordinates: [6.4531, 3.4067],
    country: "Nigeria"
  },
  "Mersin Port": {
    name: "Mersin Port",
    coordinates: [36.8000, 34.6333],
    country: "Turkey"
  },
  "Tema Port": {
    name: "Tema Port",
    coordinates: [5.6167, -0.0167],
    country: "Ghana"
  },
  "Izmir Port": {
    name: "Izmir Port",
    coordinates: [38.4361, 27.1518],
    country: "Turkey"
  },
  "Buenos Aires Port": {
    name: "Buenos Aires Port",
    coordinates: [-34.6037, -58.3816],
    country: "Argentina"
  },
  "Santos Port": {
    name: "Santos Port",
    coordinates: [-23.9619, -46.3042],
    country: "Brazil"
  },
  "Jebel Ali Port": {
    name: "Jebel Ali Port",
    coordinates: [25.0159, 55.0533],
    country: "UAE"
  },
  "Shanghai Port": {
    name: "Shanghai Port",
    coordinates: [31.2304, 121.4737],
    country: "China"
  }
};

interface RouteMapProps {
  origin: string;
  destination: string;
  transportType: string;
  metrics?: Record<string, string>;
  minified?: boolean;
}

const getRouteColor = (transportType: string): string => {
  switch (transportType.toLowerCase()) {
    case 'maritime':
      return '#3b82f6'; // blue
    case 'air':
      return '#ef4444'; // red
    case 'road':
      return '#22c55e'; // green
    case 'rail':
      return '#f97316'; // orange
    default:
      return '#6b7280'; // gray
  }
};

const PortTooltip = ({ port }: { port: PortData }) => (
  <div className="bg-white p-3 rounded-lg shadow-lg">
    <h3 className="font-medium text-gray-900">{port.name}</h3>
    <p className="text-sm text-gray-600">{port.country}</p>
  </div>
);

export default function RouteMap({ origin, destination, transportType, metrics, minified = false }: RouteMapProps) {
  const originPort = portCoordinates[origin];
  const destinationPort = portCoordinates[destination];

  if (!originPort || !destinationPort) {
    return <div className="h-full w-full rounded-lg bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Port data not available</p>
    </div>;
  }

  const points = [originPort, destinationPort];

  // Calculate center point and bounds for initial view
  const centerLat = (originPort.coordinates[0] + destinationPort.coordinates[0]) / 2;
  const centerLng = (originPort.coordinates[1] + destinationPort.coordinates[1]) / 2;
  const center: [number, number] = [centerLat, centerLng];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 relative">
      <MapContainer
        center={center}
        zoom={minified ? 2 : 3}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!minified}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((port) => (
          <Marker 
            key={port.name}
            position={port.coordinates}
            icon={customIcon}
          >
            {minified ? (
              <Tooltip direction="top" offset={[0, -20]} permanent={false}>
                <div className="text-sm font-medium">{port.name}</div>
              </Tooltip>
            ) : (
              <Popup>
                <PortTooltip port={port} />
              </Popup>
            )}
          </Marker>
        ))}
        <Polyline 
          positions={points.map(p => p.coordinates)}
          pathOptions={{
            color: getRouteColor(transportType),
            weight: minified ? 2 : 3,
            opacity: 0.8,
            dashArray: transportType.toLowerCase() === 'air' ? '10, 10' : undefined
          }}
        >
          {metrics && !minified && (
            <Tooltip sticky>
              <div className="bg-white p-2 rounded shadow-lg">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}
                  </div>
                ))}
              </div>
            </Tooltip>
          )}
        </Polyline>
      </MapContainer>
    </div>
  );
}