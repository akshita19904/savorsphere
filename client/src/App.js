import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import Footer from './components/Footer';
import About from './pages/about';
import './App.css';
import Reservations from './pages/Reservations';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';
import { ErrorBoundary } from 'react-error-boundary';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AdminRoute = ({ element, isAuthenticated }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user.is_admin) return <Navigate to="/" />;
  return element;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservation/:restaurantId" element={<Reservations />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/profile" /> : <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<UserProfile onLogout={handleLogout} />} />} />
          <Route path="/admin" element={<AdminRoute isAuthenticated={isAuthenticated} element={<AdminPanel />} />} />
        </Routes>
        <ErrorBoundary fallback={<div>Footer Error</div>}>
          <Footer />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
