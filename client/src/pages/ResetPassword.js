import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './styles/Auth.css';
import './styles/Button.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setStatus('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');

      setStatus('success');
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Enter your new password below.
        </p>

        {status === 'success' && (
          <div style={{
            background: '#e8f5e9', border: '1px solid #a5d6a7',
            borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#2e7d32'
          }}>
            ✅ {message}
          </div>
        )}

        {status === 'error' && (
          <div className="error-message"><p>{message}</p></div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength="8"
                placeholder="Repeat your new password"
              />
            </div>

            <button
              type="submit"
              className="btn primary-btn"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p><Link to="/login" className="auth-link">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;