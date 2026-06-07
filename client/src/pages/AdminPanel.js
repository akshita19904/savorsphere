import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'https://savorsphere-production.up.railway.app/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '', cuisine: '', price_range: '₹₹', address: '',
    city: 'Bangalore', state: 'Karnataka', zipcode: '560001',
    phone: '', website: '', image_url: '', rating: '4.0',
    distance: '1.0', latitude: '', longitude: ''
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (tab === 'restaurants') {
        const res = await fetch(`${API}/admin/restaurants`, { headers });
        setRestaurants(await res.json());
      } else if (tab === 'reservations') {
        const res = await fetch(`${API}/admin/reservations`, { headers });
        setReservations(await res.json());
      } else if (tab === 'users') {
        const res = await fetch(`${API}/admin/users`, { headers });
        setUsers(await res.json());
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to add');
      setShowAddForm(false);
      setForm({ name: '', cuisine: '', price_range: '₹₹', address: '', city: 'Bangalore', state: 'Karnataka', zipcode: '560001', phone: '', website: '', image_url: '', rating: '4.0', distance: '1.0', latitude: '', longitude: '' });
      fetchData();
      alert('Restaurant added!');
    } catch (err) {
      alert('Failed to add restaurant');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/restaurants/${editingRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingRestaurant)
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingRestaurant(null);
      fetchData();
      alert('Restaurant updated!');
    } catch (err) {
      alert('Failed to update restaurant');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/admin/restaurants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' };
  const btnStyle = (color) => ({ padding: '8px 16px', background: color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' });

  const RestaurantForm = ({ data, setData, onSubmit, title, onCancel }) => (
    <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Name *', key: 'name', required: true },
            { label: 'Cuisine *', key: 'cuisine', required: true },
            { label: 'Address *', key: 'address', required: true },
            { label: 'City', key: 'city' },
            { label: 'Phone', key: 'phone' },
            { label: 'Website', key: 'website' },
            { label: 'Rating (0-5)', key: 'rating' },
            { label: 'Distance (km)', key: 'distance' },
            { label: 'Latitude', key: 'latitude' },
            { label: 'Longitude', key: 'longitude' },
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>{label}</label>
              <input
                style={inputStyle}
                value={data[key] || ''}
                onChange={e => setData({ ...data, [key]: e.target.value })}
                required={required}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Price Range</label>
            <select style={inputStyle} value={data.price_range || '₹₹'} onChange={e => setData({ ...data, price_range: e.target.value })}>
              {['₹', '₹₹', '₹₹₹', '₹₹₹₹'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Image URL</label>
            <input style={inputStyle} value={data.image_url || ''} onChange={e => setData({ ...data, image_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button type="submit" style={btnStyle('#f05545')}>Save</button>
          <button type="button" onClick={onCancel} style={btnStyle('#999')}>Cancel</button>
        </div>
      </form>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#f05545' }}>⚙️ Admin Panel</h1>
        <button onClick={() => navigate('/')} style={btnStyle('#666')}>← Back to Site</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Restaurants', value: restaurants.length, icon: '🍽️' },
          { label: 'Reservations', value: reservations.length, icon: '📅' },
          { label: 'Users', value: users.length, icon: '👥' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px' }}>{icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f05545' }}>{value}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
        {['restaurants', 'reservations', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: '500', fontSize: '15px', textTransform: 'capitalize',
            borderBottom: tab === t ? '2px solid #f05545' : '2px solid transparent',
            color: tab === t ? '#f05545' : '#666', marginBottom: '-2px'
          }}>{t}</button>
        ))}
      </div>

      {error && <div style={{ background: '#fee', padding: '12px', borderRadius: '6px', color: '#c00', marginBottom: '16px' }}>{error}</div>}
      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div> : (
        <>
          {/* Restaurants Tab */}
          {tab === 'restaurants' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Restaurants ({restaurants.length})</h2>
                <button onClick={() => { setShowAddForm(!showAddForm); setEditingRestaurant(null); }} style={btnStyle('#f05545')}>
                  {showAddForm ? 'Cancel' : '+ Add Restaurant'}
                </button>
              </div>

              {showAddForm && (
                <RestaurantForm data={form} setData={setForm} onSubmit={handleAdd} title="Add New Restaurant" onCancel={() => setShowAddForm(false)} />
              )}

              {editingRestaurant && (
                <RestaurantForm data={editingRestaurant} setData={setEditingRestaurant} onSubmit={handleUpdate} title={`Edit: ${editingRestaurant.name}`} onCancel={() => setEditingRestaurant(null)} />
              )}

              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9' }}>
                      {['ID', 'Name', 'Cuisine', 'Price', 'Rating', 'City', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600', borderBottom: '1px solid #eee' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#999' }}>{r.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{r.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.cuisine}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.price_range}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>⭐ {r.rating}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.city}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setEditingRestaurant({...r}); setShowAddForm(false); window.scrollTo(0,0); }} style={{ ...btnStyle('#4a90d9'), padding: '6px 12px', fontSize: '13px' }}>Edit</button>
                            <button onClick={() => handleDelete(r.id, r.name)} style={{ ...btnStyle('#e74c3c'), padding: '6px 12px', fontSize: '13px' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {tab === 'reservations' && (
            <div>
              <h2 style={{ marginTop: 0 }}>All Reservations ({reservations.length})</h2>
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9' }}>
                      {['ID', 'User', 'Restaurant', 'Date', 'Time', 'Guests', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600', borderBottom: '1px solid #eee' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#999' }}>{r.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.username}<br/><span style={{ fontSize: '12px', color: '#999' }}>{r.user_email}</span></td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{r.restaurant_name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.date}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.time}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.party_size}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                            background: r.status === 'confirmed' ? '#e8f5e9' : r.status === 'cancelled' ? '#fce4ec' : '#fff3e0',
                            color: r.status === 'confirmed' ? '#2e7d32' : r.status === 'cancelled' ? '#c62828' : '#e65100'
                          }}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div>
              <h2 style={{ marginTop: 0 }}>All Users ({users.length})</h2>
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9' }}>
                      {['ID', 'Username', 'Email', 'Role', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600', borderBottom: '1px solid #eee' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#999' }}>{u.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{u.username}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                            background: u.is_admin ? '#fce4ec' : '#e3f2fd',
                            color: u.is_admin ? '#c62828' : '#1565c0'
                          }}>{u.is_admin ? 'Admin' : 'User'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#666' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
