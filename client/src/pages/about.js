import React, { useEffect } from 'react';
import './About.css';
import { FaUtensils, FaMapMarkerAlt, FaStar, FaMobileAlt, FaClock, FaLeaf, FaAward } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true
    });
  }, []);

  return (
    <div className="about-container">
      {/* Hero Section with Parallax */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content" data-aos="fade-up">
          <h1>Discover the Story Behind <span className="brand">SavorSphere</span></h1>
          <p className="hero-subtitle">Revolutionizing how you experience dining</p>
          <div className="hero-buttons">
            <a href="/restaurants" className="primary-button">Explore Restaurants</a>
            <a href="#mission" className="secondary-button">Learn More</a>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="mission-section">
        <div className="section-container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-badge">Our Purpose</span>
            <h2 className="section-title">Our Mission</h2>
            <div className="title-underline"></div>
          </div>
          
          <div className="mission-content">
            <div className="mission-image" data-aos="fade-right">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Restaurant dining experience" />
              <div className="image-accent"></div>
            </div>
            
            <div className="mission-text" data-aos="fade-left">
              <p className="mission-statement">
                At SavorSphere, we're on a mission to connect food lovers with exceptional dining experiences. 
                We believe every meal should be an adventure, and every restaurant deserves to be discovered.
              </p>
              <p className="mission-details">
                Founded in 2025, SavorSphere has quickly become the go-to platform for food enthusiasts seeking 
                authentic culinary experiences. Our advanced matching algorithm considers your preferences, past 
                experiences, and even the weather to suggest the perfect restaurant for any occasion.
              </p>
              <div className="mission-principles">
                <div className="principle">
                  <div className="principle-icon">
                    <FaLeaf />
                  </div>
                  <div className="principle-text">
                    <h4>Quality First</h4>
                    <p>We carefully select each restaurant in our platform.</p>
                  </div>
                </div>
                <div className="principle">
                  <div className="principle-icon">
                    <FaAward />
                  </div>
                  <div className="principle-text">
                    <h4>Customer Satisfaction</h4>
                    <p>Your dining experience is our top priority.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="100">
              <FaUtensils className="stat-icon" />
              <h3>10,000+</h3>
              <p>Restaurants Listed</p>
            </div>
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="200">
              <FaMapMarkerAlt className="stat-icon" />
              <h3>50+</h3>
              <p>Cities Worldwide</p>
            </div>
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="300">
              <FaStar className="stat-icon" />
              <h3>1M+</h3>
              <p>Happy Diners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Gradient Background */}
      <section className="features-section">
        <div className="features-bg-dots"></div>
        <div className="section-container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-badge">Our Advantages</span>
            <h2 className="section-title">Why Choose SavorSphere?</h2>
            <div className="title-underline"></div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" data-aos="flip-up" data-aos-delay="100">
              <div className="feature-icon-container">
                <FaMobileAlt className="feature-icon" />
              </div>
              <h3>Seamless Booking</h3>
              <p>Reserve your table in just a few taps, anytime, anywhere, with instant confirmation sent to your device.</p>
            </div>
            <div className="feature-card" data-aos="flip-up" data-aos-delay="200">
              <div className="feature-icon-container">
                <FaUtensils className="feature-icon" />
              </div>
              <h3>Curated Selection</h3>
              <p>Hand-picked restaurants to match every taste and occasion, from casual brunches to fine dining experiences.</p>
            </div>
            <div className="feature-card" data-aos="flip-up" data-aos-delay="300">
              <div className="feature-icon-container">
                <FaClock className="feature-icon" />
              </div>
              <h3>Real-Time Availability</h3>
              <p>See live tables and get instant confirmation, no more waiting for callbacks or confirmation emails.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;