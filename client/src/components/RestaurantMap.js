import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons by using CDN URLs
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RestaurantMap = ({ restaurants, center = [12.9716, 77.5946], zoom = 12, userLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const isElementVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      el.offsetParent !== null
    );
  };

  // Initialize map on component mount with proper safeguards
  useEffect(() => {
    // Skip if map already exists or container not ready
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      if (!isElementVisible(mapRef.current)) {
        // Wait until element is visible before initializing
        const checkTimer = setTimeout(initMap, 100);
        return () => clearTimeout(checkTimer);
      }

      try {
        // Create map with initial settings
        const map = L.map(mapRef.current, {
          center: center,
          zoom: zoom,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Wait for the map to be ready before setting initialized state
        map.whenReady(() => {
          // Safe invalidation with additional delay
          setTimeout(() => {
            if (map && map._container && isElementVisible(map._container)) {
              map.invalidateSize();
              setIsMapInitialized(true);
            }
          }, 300);
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Start the initialization process
    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, [center, zoom]);

  // Handle window resize to ensure map sizes correctly
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const handleResize = () => {
      try {
        if (mapInstanceRef.current && isElementVisible(mapInstanceRef.current._container)) {
          setTimeout(() => {
            mapInstanceRef.current.invalidateSize();
          }, 100);
        }
      } catch (error) {
        console.error("Error handling resize:", error);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMapInitialized]);

  // Add/update user location marker
  useEffect(() => {
    if (!isMapInitialized || !userLocation || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    try {
      // Remove previous marker if exists
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      // Create and add user marker
      userMarkerRef.current = L.circleMarker(
        [userLocation.latitude, userLocation.longitude],
        {
          radius: 8,
          fillColor: '#3388ff',
          fillOpacity: 1,
          color: '#fff',
          weight: 2
        }
      ).addTo(map);

      // Add circle radius indicator
      L.circle(
        [userLocation.latitude, userLocation.longitude],
        {
          radius: 100,
          fillColor: '#3388ff',
          fillOpacity: 0.15,
          color: '#3388ff',
          weight: 1
        }
      ).addTo(map);

    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [userLocation, isMapInitialized]);

  // Add/update restaurant markers
  useEffect(() => {
    if (!isMapInitialized || !restaurants || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker) map.removeLayer(marker);
      });
      markersRef.current = [];

      const bounds = L.latLngBounds();
      let markersAdded = 0;

      // Add markers for each restaurant
      restaurants.forEach((restaurant) => {
        let latitude, longitude;

        if (restaurant.latitude && restaurant.longitude) {
          latitude = parseFloat(restaurant.latitude);
          longitude = parseFloat(restaurant.longitude);
        } else if (restaurant.lat && restaurant.lng) {
          latitude = parseFloat(restaurant.lat);
          longitude = parseFloat(restaurant.lng);
        } else if (restaurant.location?.lat && restaurant.location?.lng) {
          latitude = parseFloat(restaurant.location.lat);
          longitude = parseFloat(restaurant.location.lng);
        }

        if (isValidCoordinate(latitude, longitude)) {
          const popupContent = `
            <div style="max-width: 200px">
              <strong>${restaurant.name || 'Restaurant'}</strong><br>
              ${restaurant.cuisine || ''}<br>
              ${restaurant.address || ''}<br>
              ${restaurant.rating ? `<strong>Rating:</strong> ${restaurant.rating}` : ''}
              ${restaurant.priceRange ? `<br><strong>Price:</strong> ${restaurant.priceRange}` : ''}
              ${restaurant.distance ? `<p style="margin: 4px 0 0"><strong>Distance:</strong> ${restaurant.distance} miles</p>` : ''}
            </div>
          `;

          const marker = L.marker([latitude, longitude], { icon: DefaultIcon })
            .addTo(map)
            .bindPopup(popupContent);

          markersRef.current.push(marker);
          bounds.extend([latitude, longitude]);
          markersAdded++;
        }
      });

      // Add user location to bounds if available
      if (userLocation && isValidCoordinate(userLocation.latitude, userLocation.longitude)) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }

      // Fit bounds if we have markers
      if (markersAdded > 0 || (userLocation && isValidCoordinate(userLocation.latitude, userLocation.longitude))) {
        // Safely fit bounds with delay to ensure map is ready
        setTimeout(() => {
          try {
            if (map && map._container && isElementVisible(map._container)) {
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
          } catch (error) {
            console.error("Error fitting bounds:", error);
            if (userLocation) {
              map.setView([userLocation.latitude, userLocation.longitude], zoom);
            } else {
              map.setView(center, zoom);
            }
          }
        }, 200);
      } else {
        map.setView(center, zoom);
      }
    } catch (error) {
      console.error("Error updating restaurant markers:", error);
    }
  }, [restaurants, isMapInitialized, userLocation, center, zoom]);

  const isValidCoordinate = (lat, lng) => {
    return lat !== undefined && lng !== undefined &&
      !isNaN(lat) && !isNaN(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180;
  };

  return (
    <div className="map-container" style={{ width: '100%', position: 'relative' }}>
      <div
        ref={mapRef}
        style={{ height: '500px', width: '100%', position: 'relative' }}
        data-testid="leaflet-map"
      ></div>
      {restaurants && restaurants.length > 0 && (
        <div className="map-info">
          <span>Showing {restaurants.length} restaurants on the map</span>
          {userLocation && (
            <span>
              <span className="user-location-indicator"></span>
              Your location
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantMap;
