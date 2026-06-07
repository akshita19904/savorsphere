// src/services/locationService.js
// This service handles user location functionality

const getDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            // Default to Bangalore center if location access is denied
            resolve({
              latitude: 12.9716,
              longitude: 77.5946
            });
          }
        );
      }
    });
  };
  
  // Calculate distance between user and each restaurant
  export const calculateDistances = (restaurants, userLocation) => {
    if (!userLocation || !restaurants) return restaurants;
    
    return restaurants.map(restaurant => {
      if (restaurant.latitude && restaurant.longitude) {
        const distance = getDistance(
          parseFloat(userLocation.latitude),
          parseFloat(userLocation.longitude),
          parseFloat(restaurant.latitude),
          parseFloat(restaurant.longitude)
        );
        
        // Convert to miles and round to 1 decimal place
        return {
          ...restaurant,
          distance: parseFloat((distance * 0.621371).toFixed(1))
        };
      }
      return restaurant;
    });
  };
