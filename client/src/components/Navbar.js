// src/components/Navbar.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar({ isAuthenticated, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          SavorSphere
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <NavLink to="/" className="navbar-link">Home</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/restaurants" className="navbar-link">Restaurants</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/reservations" className="navbar-link">Reservations</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/about" className="navbar-link">About</NavLink>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <NavLink to="/profile" className="navbar-link">
                  {user?.username || 'Profile'}
                </NavLink>
              </li>
              <li className="navbar-item">
                <button onClick={onLogout} className="navbar-button sign-out">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <NavLink to="/login" className="navbar-link">Sign In</NavLink>
              </li>
              <li className="navbar-item">
                <NavLink to="/register" className="navbar-button sign-up">Sign Up</NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
