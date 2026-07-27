// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar({ isAuthenticated, user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          SavorSphere
        </Link>

        <button
          className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <NavLink to="/" className="navbar-link" onClick={closeMenu}>Home</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/restaurants" className="navbar-link" onClick={closeMenu}>Restaurants</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/reservations" className="navbar-link" onClick={closeMenu}>Reservations</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/about" className="navbar-link" onClick={closeMenu}>About</NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <NavLink to="/profile" className="navbar-link" onClick={closeMenu}>
                  {user?.username || 'Profile'}
                </NavLink>
              </li>
              <li className="navbar-item">
                <button onClick={() => { onLogout(); closeMenu(); }} className="navbar-button sign-out">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <NavLink to="/login" className="navbar-link" onClick={closeMenu}>Sign In</NavLink>
              </li>
              <li className="navbar-item">
                <NavLink to="/register" className="navbar-button sign-up" onClick={closeMenu}>Sign Up</NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;