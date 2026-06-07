import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchRestaurants } from '../services/api';
import { getUserLocation, calculateDistances } from '../services/locationService';
import './RestaurantList.css';
import './styles/Button.css';
import { useDebounce } from 'use-debounce';
import RestaurantMenuModal from './RestaurantMenuModal';
import RestaurantMap from '../components/RestaurantMap';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
      cuisine: '',
      priceRange: '',
      rating: '',
      distance: '',
      features: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedFilters] = useDebounce(filters, 500);
    const [debouncedSearch] = useDebounce(searchQuery, 300);
    const [menuModalOpen, setMenuModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default to Bangalore coordinates
    const [isLocationLoading, setIsLocationLoading] = useState(true);

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const restaurantsPerPage = 9; // Exactly 9 restaurants per page
  
  // Get user location on initial load
  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLocationLoading(true);
        const location = await getUserLocation();
        setUserLocation(location);
        setMapCenter([location.latitude, location.longitude]);
      } catch (err) {
        console.error('Error getting user location:', err);
        // Continue with default location
      } finally {
        setIsLocationLoading(false);
      }
    };
    
    getLocation();
  }, []);
  
  // Update restaurants when filters or location changes
  useEffect(() => {
    const getRestaurants = async () => {
      try {
        setLoading(true);
        const data = await fetchRestaurants(debouncedFilters);
        
        // Calculate distances if we have user location
        let processedData = data;
        if (userLocation) {
          processedData = calculateDistances(data, userLocation);
          // Sort by distance if no other specific filters are active
          if (!debouncedFilters.cuisine && !debouncedFilters.priceRange && !debouncedFilters.rating) {
            processedData.sort((a, b) => a.distance - b.distance);
          }
        }
        
        setRestaurants(processedData);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setError(`Backend server unavailable. Please ensure the backend is running on port 5000.`);
      } finally {
        setLoading(false);
      }
    };
    
    getRestaurants();
  }, [debouncedFilters, userLocation]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      cuisine: '',
      priceRange: '',
      rating: '',
      distance: '',
      features: ''
    });
    setSearchQuery('');
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenuModalOpen(true);
  };
  
  const filteredRestaurants = restaurants.filter(restaurant => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch = q === '' || 
      restaurant.name?.toLowerCase().includes(q) ||
      restaurant.cuisine?.toLowerCase().includes(q) ||
      restaurant.address?.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (filters.cuisine === '' || restaurant.cuisine?.toLowerCase().includes(filters.cuisine.toLowerCase())) &&
      (filters.priceRange === '' || restaurant.price_range === filters.priceRange) &&
      (filters.rating === '' || restaurant.rating >= parseFloat(filters.rating)) &&
      (filters.distance === '' || restaurant.distance <= parseFloat(filters.distance))
    );
  });

  // Pagination logic
  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle between list and map view
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };
  
  // Find current location again
  const refreshUserLocation = async () => {
    try {
      setIsLocationLoading(true);
      const location = await getUserLocation();
      setUserLocation(location);
      setMapCenter([location.latitude, location.longitude]);
    } catch (err) {
      console.error('Error refreshing user location:', err);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Helper function to safely parse features
  const getFeatures = (featuresData) => {
    if (!featuresData) return {};
    
    if (typeof featuresData === 'object') {
      return featuresData;
    }
    
    try {
      return JSON.parse(featuresData);
    } catch (e) {
      console.error('Error parsing features:', e);
      return {};
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading restaurants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Error loading restaurants</h3>
        <p>{error}</p>
        <button className="primary-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="restaurant-list-container">
      {/* Search Bar */}
      <div className="search-bar-container" style={{
        marginBottom: '1.5rem',
        position: 'relative'
      }}>
        <span style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)', fontSize: '1.1rem', color: '#999'
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name, cuisine, or area..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          style={{
            width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem',
            fontSize: '1rem', border: '2px solid #e0e0e0', borderRadius: '8px',
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#f05545'}
          onBlur={e => e.target.style.borderColor = '#e0e0e0'}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#999'
          }}>✕</button>
        )}
      </div>
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filter Restaurants</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* View toggle buttons */}
            <div className="view-toggle" style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <button 
                className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => toggleViewMode('list')}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'list' ? '#f05545' : '#f5f5f5',
                  color: viewMode === 'list' ? 'white' : '#333',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                List View
              </button>
              <button 
                className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => toggleViewMode('map')}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'map' ? '#f05545' : '#f5f5f5',
                  color: viewMode === 'map' ? 'white' : '#333',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Map View
              </button>
            </div>
            
            <button className="reset-button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="cuisine">Cuisine</label>
            <select 
              id="cuisine" 
              name="cuisine" 
              value={filters.cuisine}
              onChange={handleFilterChange}
            >
              <option value="">All Cuisines</option>
              <option value="north indian">North Indian</option>
              <option value="south indian">South Indian</option>
              <option value="seafood">Seafood</option>
              <option value="italian">Italian</option>
              <option value="pan-asian">Pan-Asian</option>
              <option value="american">American</option>
              <option value="modern indian">Modern Indian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="french">French</option>
              <option value="korean">Korean</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="barbecue">Barbecue</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="priceRange">Price Range</label>
            <select 
              id="priceRange" 
              name="priceRange" 
              value={filters.priceRange}
              onChange={handleFilterChange}
            >
              <option value="">Any Price</option>
              <option value="₹">₹</option>
              <option value="₹₹">₹₹</option>
              <option value="₹₹₹">₹₹₹</option>
              <option value="₹₹₹₹">₹₹₹₹</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="rating">Minimum Rating</label>
            <select 
              id="rating" 
              name="rating" 
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+</option>
              <option value="4.0">4.0+</option>
              <option value="3.5">3.5+</option>
              <option value="3.0">3.0+</option>
            </select>
          </div>
          
          {/* Distance filter */}
          <div className="filter-group">
            <label htmlFor="distance">Max Distance (miles)</label>
            <select 
              id="distance" 
              name="distance" 
              value={filters.distance}
              onChange={handleFilterChange}
            >
              <option value="">Any Distance</option>
              <option value="5">Within 5 mile</option>
              <option value="10">Within 10 miles</option>
              <option value="12">Within 12 miles</option>
              <option value="15">Within 15 miles</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Location indicator and refresh button */}
      <div className="location-indicator" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px',
        background: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div>
          <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>
            {userLocation ? 'Showing restaurants near you' : 'Using default location'}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {isLocationLoading ? 'Getting your location...' : 
             userLocation ? `Based on your current location` : 
             'Location access denied. Using Bangalore center.'}
          </p>
        </div>
        <button 
          className="secondary-button" 
          onClick={refreshUserLocation}
          disabled={isLocationLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f05545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLocationLoading ? 'default' : 'pointer',
            opacity: isLocationLoading ? 0.7 : 1
          }}
        >
          {isLocationLoading ? 'Locating...' : 'Refresh Location'}
        </button>
      </div>
      
      {filteredRestaurants.length === 0 ? (
        <div className="no-results">
          <h3>No restaurants found</h3>
          <p>Try adjusting your filters to see more results.</p>
          <button className="primary-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="map-view-container" style={{ marginBottom: '2rem' }}>
              <RestaurantMap 
                restaurants={filteredRestaurants} 
                center={mapCenter} 
                zoom={13}
                userLocation={userLocation}
              />
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="restaurants-grid">
              {currentRestaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card">
                  <div className="card-header">
                    <img 
                      src={restaurant.image_url}
                      alt={restaurant.name} 
                      className="restaurant-image"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/300x200?text=Restaurant+Image';
                      }}
                    />
                    {restaurant.isPromoted && (
                      <span className="promoted-tag">Promoted</span>
                    )}
                    <span className="price-badge">{restaurant.price_range}</span>
                    <span className="rating-badge">
                      <span className="star-icon">★</span> {restaurant.rating}
                    </span>
                  </div>
                  
                  <div className="restaurant-info">
                    <h4>{restaurant.name}</h4>
                    <p className="cuisine-type">{restaurant.cuisine}</p>
                    
                    <div className="restaurant-stats">
                      <span className="rating">
                        <span className="star-icon">★</span> {restaurant.rating}
                      </span>
                      <span className="price">{restaurant.price_range}</span>
                      <span className="distance">
                        {typeof restaurant.distance === 'number' 
                          ? `${restaurant.distance.toFixed(1)} miles` 
                          : '? miles'}
                      </span>
                    </div>
                    
                    {restaurant.features && (
                      <div className="restaurant-features">
                        {Object.entries(getFeatures(restaurant.features)).map(([feature, value], index) => (
                          value && <span key={index} className="feature-tag">{feature.replace('_', ' ')}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="card-actions">
                      <button 
                        className="view-details-button" 
                        onClick={() => handleViewDetails(restaurant)}
                      >
                        View Details
                      </button>
                      <Link 
                        to={`/reservation/${restaurant.id}`} 
                        className="quick-book-button"
                      >
                        Quick Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination - only show in list view */}
          {viewMode === 'list' && totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                className="pagination-button" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Restaurant Details Modal */}
      {menuModalOpen && (
        <RestaurantMenuModal 
          restaurant={selectedRestaurant}
          isOpen={menuModalOpen}
          onClose={() => setMenuModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RestaurantList;
