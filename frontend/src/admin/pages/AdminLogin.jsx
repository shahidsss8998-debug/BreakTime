import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/adminAuthService';
import { XCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@breaktime.com');
  const [password, setPassword] = useState('admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessages = {
        'auth/user-not-found': 'No admin account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please wait.',
        'auth/invalid-credential': 'Invalid email or password.'
      };
      setError(err.message || errorMessages[err.code] || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-section">
      <div className="auth-container">
        {/* Left Side — Illustration / Branding */}
        <div className="auth-bg-glow">
          <div style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: '700', marginBottom: '12px', lineHeight: '1.2' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Admin Panel<br />Break Time</span>
            </h2>
            <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: '1.6', maxWidth: '320px' }}>
              Manage orders, update menu items, and monitor cafe operations.
            </p>
          </div>
        </div>

        {/* Right Side — Form */}
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/logo.png" alt="Break Time Logo" style={{ height: '48px', width: 'auto' }} />
            </div>
            <h1>Admin Login</h1>
            <p>Enter your credentials to access the portal</p>
          </div>

          {error && (
            <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="admin-email">Email Address</label>
              <div className="auth-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@breaktime.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="admin-password">Password</label>
              <div className="auth-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : 'Sign In to Portal'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/">← Back to Customer Website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
