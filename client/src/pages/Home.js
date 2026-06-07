import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Home.css';
import './styles/Button.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Amazing Dining Experiences</h1>
          <p>Find and book the best restaurants in your city with SavorSphere.</p>
          <div className="hero-buttons">
            <Link to="/restaurants" className="btn primary-btn">
              Browse Restaurants
            </Link>
            <Link to="/reservations" className="btn secondary-btn">
              Make Reservation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;