import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Reservation.css';

import { fetchRestaurants } from '../services/api';

const Reservations = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [confirmed, setConfirmed] = useState(null);

  // Available time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', 
    '1:30 PM', '2:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', 
    '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'
  ];

  useEffect(() => {
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
    
    const fetchAllRestaurants = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        const fetchedRestaurants = await fetchRestaurants();
        setRestaurants(fetchedRestaurants);
        
        // Set the first restaurant as default
        if (fetchedRestaurants && fetchedRestaurants.length > 0) {
          setSelectedRestaurant(fetchedRestaurants[0]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setApiError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllRestaurants();
  }, []);

  const handleRestaurantChange = (e) => {
    const restaurantId = e.target.value;
    const selected = restaurants.find(r => r.id == restaurantId);
    setSelectedRestaurant(selected);
  };

  const validateForm = () => {
    // Clear previous errors first
    setMissingFields([]);
    const missing = [];
    
    if (!selectedRestaurant) missing.push('Restaurant');
    if (!date) missing.push('Date');
    if (!time) missing.push('Time');
    if (!fullName) missing.push('Full Name');
    if (!email) missing.push('Email');
    
    setMissingFields(missing);
    return missing.length === 0;
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    // Clear the missingFields state
    setMissingFields([]);

    // Check if user is logged in first
    const token = localStorage.getItem('token');
    if (!token) {
      // Store reservation data to resume after login
      localStorage.setItem('pendingReservation', JSON.stringify({
        restaurant_id: selectedRestaurant ? selectedRestaurant.id : null,
        date,
        time,
        party_size: partySize,
        special_request: specialRequests
      }));
      
      setIsSubmitting(false);
      navigate('/login?redirect=reservations');
      return;
    }

    // Validate form fields
    if (!validateForm()) {
      setFormError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Format time from '7:30 PM' to '19:30:00'
      const convertTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
          hours = '00';
        }
        
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        
        return `${hours}:${minutes}:00`;
      };

      // Ensure the date is properly formatted
      const formattedDate = new Date(date).toISOString().split('T')[0];
      // Format time to match MySQL TIME format
      const formattedTime = convertTime(time);

      const response = await axios.post('https://savorsphere-production.up.railway.app/api/reservations', {
        restaurant_id: parseInt(selectedRestaurant.id),
        date: formattedDate,
        time: formattedTime,
        party_size: parseInt(partySize),
        special_request: specialRequests,
        // The server will extract user_id from the token
        // Including user details for any additional server-side logic
        full_name: fullName,
        email: email,
        phone: phone
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data) {
        setConfirmed({
          restaurant: selectedRestaurant.name,
          date: response.data.date || date,
          time: time,
          party_size: partySize,
          full_name: fullName,
          email: email,
          email_sent: response.data.email_sent
        });
      } else {
        setFormError('Reservation created but confirmation details are unavailable.');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      
      let errorMessage = 'Failed to complete your reservation. Please try again.';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Please check that all required fields are filled correctly.';
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          localStorage.removeItem('token');
          navigate('/login?redirect=reservations');
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="error-container">
        <h2>Error Loading Restaurants</h2>
        <p className="error-message">{apiError}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="error-container">
        <h2>No Restaurants Available</h2>
        <p>We couldn't find any restaurants in our system.</p>
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ color: '#f05545', marginBottom: '8px' }}>Reservation Confirmed!</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            {confirmed.email_sent
              ? `A confirmation email has been sent to ${confirmed.email}`
              : 'Your reservation has been booked successfully.'}
          </p>

          <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
            <p style={{ margin: '8px 0' }}><strong>🍽️ Restaurant:</strong> {confirmed.restaurant}</p>
            <p style={{ margin: '8px 0' }}><strong>📅 Date:</strong> {confirmed.date}</p>
            <p style={{ margin: '8px 0' }}><strong>🕐 Time:</strong> {confirmed.time}</p>
            <p style={{ margin: '8px 0' }}><strong>👥 Guests:</strong> {confirmed.party_size} {confirmed.party_size === 1 ? 'person' : 'people'}</p>
            <p style={{ margin: '8px 0' }}><strong>👤 Name:</strong> {confirmed.full_name}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setConfirmed(null)}
              style={{ padding: '12px 24px', background: '#f05545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Make Another Reservation
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{ padding: '12px 24px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
            >
              View My Reservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="reservation-header">
        <h1>Make a Reservation</h1>
      </div>

      <form className="reservation-form" onSubmit={handleReservation}>
        {formError && (
          <div className="form-error">
            <span>{formError}</span>
          </div>
        )}
        
        <div className="form-group">
          <label>Restaurant<span className="required">*</span></label>
          <select
            value={selectedRestaurant ? selectedRestaurant.id : ''}
            onChange={handleRestaurantChange}
            required
            disabled={isSubmitting}
            className={missingFields.includes('Restaurant') ? 'field-error' : ''}
          >
            <option value="">Select a restaurant</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date<span className="required">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={isSubmitting}
              className={missingFields.includes('Date') ? 'field-error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Time<span className="required">*</span></label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={isSubmitting}
              className={missingFields.includes('Time') ? 'field-error' : ''}
            >
              <option value="">Select a time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Guests<span className="required">*</span></label>
            <select
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value))}
              required
              disabled={isSubmitting}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                <option key={size} value={size}>
                  {size} {size === 1 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name<span className="required">*</span></label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
              className={missingFields.includes('Full Name') ? 'field-error' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email<span className="required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              className={missingFields.includes('Email') ? 'field-error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Special Requests (optional)</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requests? (allergies, high chair, etc.)"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-note">
          <span className="required">*</span> Required fields
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Complete Reservation'}
        </button>
      </form>
    </div>
  );
};

export default Reservations;