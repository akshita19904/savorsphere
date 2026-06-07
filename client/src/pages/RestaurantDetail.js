import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantDetail.css';
import './styles/Button.css';


const RestaurantDetail = ({ restaurant }) => {
  if (!restaurant) {
    return <div className="restaurant-detail-container">Restaurant not found</div>;
  }

  return (
    <div className="restaurant-detail-container">
      <div className="back-button-container">
        <Link to="/restaurants" className="back-button">
          &larr; Back to Restaurants
        </Link>
      </div>

      <div className="restaurant-header">
        <h1>{restaurant.name}</h1>
        <div className="restaurant-meta">
          <span className="rating">★ {restaurant.rating}</span>
          <span className="price">{restaurant.price}</span>
          <span className="cuisine">{restaurant.cuisine}</span>
          <span className="distance">{restaurant.distance} away</span>
        </div>
      </div>

      <div className="restaurant-content">
        <div className="restaurant-gallery">
        <img 
  src={restaurant.image_url}  // Changed from restaurant.image
  alt={restaurant.name}
  className="main-image"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/placeholder-restaurant.jpg';
  }}
/>
        </div>

        <div className="restaurant-info">
          <div className="description-section">
            <h2>About</h2>
            <p>{restaurant.description || "No description available."}</p>
          </div>

          <div className="action-buttons">
            <Link 
              to={`/reservation/${restaurant.id}`}
              className="btn primary-btn"
            >
              Make Reservation
            </Link>
            <button className="btn secondary-btn">
              Save to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
