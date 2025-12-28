import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Office {
  id: string;
  name: string;
  country: string;
  coordinates: number[];
  type: string;
  services: string[];
  email: string;
  phone: string;
}

interface ContactMapProps {
  offices: Office[];
}

const ContactMap = ({ offices }: ContactMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with a center point and zoom level that shows the whole world
    mapRef.current = L.map(mapContainerRef.current).setView([30, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Custom icons for different office types
    const headquarterIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const regionalIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const portIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add markers for each office location
    offices.forEach(office => {
      const icon = office.type === "headquarter" 
        ? headquarterIcon 
        : office.type === "regional" 
          ? regionalIcon 
          : portIcon;
      
      // Create a popup with office details
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">${office.name}</h3>
          <p>${office.country}</p>
          <div class="mt-2">
            <p><strong>Contact:</strong></p>
            <p>${office.email}</p>
            <p>${office.phone}</p>
          </div>
          <div class="mt-2">
            <p><strong>Services:</strong></p>
            <p>${office.services.join(', ')}</p>
          </div>
        </div>
      `;
      
      L.marker([office.coordinates[0], office.coordinates[1]], { icon })
        .bindPopup(popupContent)
        .addTo(mapRef.current!);
    });

    // Draw lines between offices to show connections
    if (offices.length > 1) {
      const headquarters = offices.find(o => o.type === "headquarter");
      
      if (headquarters) {
        offices.forEach(office => {
          // Don't connect headquarters to itself
          if (office.id !== headquarters.id) {
            const latlngs: L.LatLngTuple[] = [
              [headquarters.coordinates[0], headquarters.coordinates[1]],
              [office.coordinates[0], office.coordinates[1]]
            ];

            L.polyline(latlngs, {
              color: 'rgb(59, 130, 246)',
              weight: 2,
              opacity: 0.6,
              dashArray: '5, 10'
            }).addTo(mapRef.current!);
          }
        });
      }
    }

    // Create a custom legend control
    const LegendControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      
      onAdd: function(map: L.Map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
          <div style="background-color: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 5px;"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" style="width: 15px; height: 25px;"> Headquarters</div>
            <div style="margin-bottom: 5px;"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style="width: 15px; height: 25px;"> Regional Offices</div>
            <div><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" style="width: 15px; height: 25px;"> Port Offices</div>
          </div>
        `;
        return div;
      }
    });
    
    new LegendControl().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [offices]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[400px] rounded-lg shadow-lg"
      style={{ zIndex: 0 }}
    />
  );
};

export default ContactMap;