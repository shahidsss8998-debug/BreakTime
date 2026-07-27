import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const location = useLocation();
  const { getCartCount, toast } = useCart();
  const { isLoggedIn } = useAuth();
  const cartCount = getCartCount();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show navbar when cart count changes
  useEffect(() => {
    if (cartCount > 0) {
      setVisible(true);
    }
  }, [cartCount]);

  return (
    <>
      <nav id="navbar" className={`${scrolled ? 'scrolled' : ''} ${visible ? '' : 'nav-hidden'}`}>
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Break Time Logo" style={{ height: '40px', width: 'auto' }} />
          BREAK<span>TIME</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/delivery">Delivery</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className="nav-right">
          {!isLoggedIn && (
            <Link to="/cart" className="nav-icon cart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
          )}

          {!isLoggedIn && (
            <Link to="/login" className="nav-cta">Login</Link>
          )}
        </div>
      </nav>

      {/* Cart Add Toast */}
      <div
        style={{
          position: 'fixed',
          bottom: '90px',
          left: '50%',
          transform: `translateX(-50%) ${toast?.show ? 'translateY(0)' : 'translateY(20px)'}`,
          opacity: toast?.show ? 1 : 0,
          background: 'var(--text-primary)',
          color: '#fff',
          padding: '10px 22px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.85rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          zIndex: 9999,
          display: 'block',
          whiteSpace: 'nowrap',
          maxWidth: '90vw',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none',
          textAlign: 'center'
        }}
      >
        <span>
          <strong>{toast?.name}</strong> added to cart ✓
        </span>
      </div>
    </>
  );
}
