import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpCustomer, signInWithGoogle } from '../services/authService';
import { XCircle } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await signUpCustomer(email, password, name);
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.'
      };
      setError(errorMessages[err.code] || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google sign-up error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign up with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-section">
      <div className="auth-container">
        {/* Left Side — Illustration */}
        <div className="auth-bg-glow">
          <div style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: '700', marginBottom: '12px', lineHeight: '1.2' }}>
              Create Your Account ✨
            </h2>
            <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: '1.6', maxWidth: '320px' }}>
              Join Break Time today and enjoy fast delivery, exclusive offers, and easy tracking.
            </p>
          </div>
        </div>

        {/* Right Side — Form */}
        <div className="auth-card">
          <div className="auth-header">
            {isStandalone ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <img src="/logo.png" alt="Break Time Logo" style={{ height: '48px', width: 'auto' }} />
              </div>
            ) : (
              <Link to="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <img src="/logo.png" alt="Break Time Logo" style={{ height: '48px', width: 'auto' }} />
              </Link>
            )}
            <h1>Create Account</h1>
            <p>Sign up to start ordering delicious food</p>
          </div>

          {error && (
            <div className="auth-error">
              <XCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleLoading ? 'Signing up...' : 'Sign up with Google'}
          </button>

          <div className="auth-divider">or sign up with email</div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading || googleLoading}>
              {loading ? <span className="auth-spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
