import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://savorsphere-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const fetchRestaurantById = async (id) => {
  try {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

export const fetchRestaurants = async (filters = {}) => {
    try {
      console.log('Attempting to fetch restaurants from:', API_BASE_URL);
      const response = await axios.get('https://savorsphere-production.up.railway.app/api/restaurants', { params: filters });
      return response.data;
    } catch (error) {
      console.error('API Connection Error:', error.message);
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}`);
    }
  };

  export const fetchAvailability = async (restaurantId, date, partySize) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/availability`, {
        params: { date, partySize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  };

  // Add this at the end of api.js
export default api;
