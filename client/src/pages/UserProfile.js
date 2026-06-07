import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Profile.css';

const UserProfile = ({ onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://savorsphere-production.up.railway.app/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setProfile(data);
        else setError(data.message || 'Error loading profile');
      })
      .catch(() => setError('Failed to load profile.'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/');
  };

  if (error) return <div style={{ padding: '40px', textAlign: 'center' }}>Error: {error}</div>;
  if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  const { user, reservations, reviews, likes } = profile;
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ background: '#f05545', borderRadius: '12px', padding: '30px', color: 'white', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px' }}>👋 Welcome, {user.username}!</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {storedUser.is_admin && (
            <button onClick={() => navigate('/admin')} style={{ padding: '10px 18px', background: 'white', color: '#f05545', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⚙️ Admin Panel
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Reservations', value: reservations.length, icon: '📅' },
          { label: 'Reviews', value: reviews.length, icon: '⭐' },
          { label: 'Liked', value: likes.length, icon: '❤️' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '28px' }}>{icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f05545' }}>{value}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Reservations */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>📅 My Reservations</h3>
        {reservations.length > 0 ? (
          <div>
            {reservations.map(r => (
              <div key={r.id} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.restaurant_name}</strong>
                  <div style={{ fontSize: '14px', color: '#666' }}>{r.date} at {r.time} · {r.party_size} guests</div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                  background: r.status === 'confirmed' ? '#e8f5e9' : '#fff3e0',
                  color: r.status === 'confirmed' ? '#2e7d32' : '#e65100'
                }}>{r.status}</span>
              </div>
            ))}
          </div>
        ) : <p style={{ color: '#999', margin: 0 }}>No reservations yet. <span style={{ color: '#f05545', cursor: 'pointer' }} onClick={() => navigate('/reservations')}>Make one!</span></p>}
      </div>

      {/* Reviews */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>⭐ My Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map(r => (
            <div key={r.id} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{r.restaurant_name}</strong>
                <span style={{ color: '#f05545' }}>{'⭐'.repeat(r.rating)}</span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#555', fontSize: '14px' }}>{r.comment}</p>
            </div>
          ))
        ) : <p style={{ color: '#999', margin: 0 }}>No reviews yet.</p>}
      </div>

      {/* Liked Restaurants */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>❤️ Liked Restaurants</h3>
        {likes.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {likes.map(like => (
              <span key={like.id} style={{ padding: '6px 14px', background: '#fce4ec', color: '#c62828', borderRadius: '20px', fontSize: '14px' }}>
                {like.name}
              </span>
            ))}
          </div>
        ) : <p style={{ color: '#999', margin: 0 }}>No liked restaurants yet.</p>}
      </div>
    </div>
  );
};

export default UserProfile;
