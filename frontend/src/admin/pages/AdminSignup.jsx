import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpAdmin } from '../../services/adminAuthService';
import { XCircle } from 'lucide-react';

export default function AdminSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.code) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      await signUpAdmin(formData.email, formData.password, formData.name, formData.code);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin signup error:', err);
      setError(err.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <div className="admin-auth-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h1>Admin Registration</h1>
            <p>Register new administrator account</p>
          </div>

          {error && (
            <div className="auth-error">
              <XCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-auth-form">
            <div className="admin-auth-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Admin Name"
                required
              />
            </div>

            <div className="admin-auth-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@breaktime.com"
                required
              />
            </div>

            <div className="admin-auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="admin-auth-field">
              <label>Admin Security Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Enter registration code"
                required
              />
            </div>

            <button type="submit" className="admin-auth-btn" disabled={loading}>
              {loading ? (
                <span className="admin-loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
              ) : (
                'Register Admin Account'
              )}
            </button>
          </form>

          <div className="admin-auth-footer">
            <Link to="/admin/login" className="admin-back-link">
              Already registered? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
