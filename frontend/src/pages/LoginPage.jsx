import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/authService';
import { XCircle, Utensils } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

export default function LoginPage() {
  const { isLoggedIn, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (login) {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/invalid-credential': 'Invalid email or password.'
      };
      setError(errorMessages[err.code] || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen message="Checking session..." />;
  }

  return (
    <div className="auth-section">
      <div className="auth-container">
        {/* Left Side — Illustration / Branding */}
        <div className="auth-bg-glow">
          <div style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: '700', marginBottom: '12px', lineHeight: '1.2' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Welcome Back to<br />Break Time! <Utensils size={28} /></span>
            </h2>
            <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: '1.6', maxWidth: '320px' }}>
              Order your favorite burgers, momos, and shakes in just a few taps.
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
            <h1>Sign In</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="auth-error">
              <XCircle size={16} /> <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="auth-divider">or sign in with email</div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading || googleLoading}>
              {loading ? <span className="auth-spinner"></span> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
