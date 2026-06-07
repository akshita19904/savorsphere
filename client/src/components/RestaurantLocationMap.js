import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const RestaurantLocationMap = ({ restaurant }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Generate a unique ID for this map instance
  const mapId = useRef(`single-map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
      return;
    }
    
    // Clean up any existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    
    // Wait for the DOM to be ready
    setTimeout(() => {
      const mapContainer = document.getElementById(mapId.current);
      if (!mapContainer) return;
      
      // Create map
      const map = L.map(mapId.current).setView([
        parseFloat(restaurant.latitude),
        parseFloat(restaurant.longitude)
      ], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Add marker
      L.marker([
        parseFloat(restaurant.latitude),
        parseFloat(restaurant.longitude)
      ])
        .addTo(map)
        .bindPopup(`
          <div style="max-width: 200px">
            <h4 style="margin: 0 0 4px">${restaurant.name}</h4>
            <p style="margin: 0">${restaurant.address || ''}</p>
          </div>
        `);
      
      mapInstanceRef.current = map;
    }, 0);
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restaurant]);

  if (!restaurant || !restaurant.latitude || !restaurant.longitude) {
    return <div>Location data not available</div>;
  }

  return (
    <div className="map-container" style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '20px' }}>
      <div id={mapId.current} ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default RestaurantLocationMap;
