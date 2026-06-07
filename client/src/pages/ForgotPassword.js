import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/Auth.css';
import './styles/Button.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Something went wrong');

      setStatus('success');
      setMessage('Password reset link sent! Check your email inbox (and spam folder).');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {status === 'success' && (
          <div className="success-message" style={{
            background: '#e8f5e9', border: '1px solid #a5d6a7',
            borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#2e7d32'
          }}>
            ✅ {message}
          </div>
        )}

        {status === 'error' && (
          <div className="error-message">
            <p>{message}</p>
          </div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
              />
            </div>

            <button
              type="submit"
              className="btn primary-btn"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;