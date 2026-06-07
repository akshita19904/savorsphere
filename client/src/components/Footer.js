// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#2c3e50', 
      color: 'white',
      padding: '40px 0 20px',
      marginTop: '40px'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          <div>
            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>SavorSphere</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.8' }}>
              Find and book the best restaurants in your city with SavorSphere.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '18px' }}>Quick Links</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/restaurants" style={{ color: 'white', textDecoration: 'none' }}>Restaurants</Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '18px' }}>Contact</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.8' }}>
              Email: info@savorsphere.com<br />
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          paddingTop: '20px', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <p>© 2025 SavorSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
