import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { logoutCustomer } from '../services/authService';
import { ClipboardList, ShoppingCart, User, LogOut } from 'lucide-react';
import LogoutModal from './LogoutModal';
import MobileMenuButton from './navigation/MobileMenuButton';
import MobileOverlay from './navigation/MobileOverlay';
import MobileSidebar from './navigation/MobileSidebar';

export default function CustomerNavigation() {
  const { isLoggedIn, userProfile, user } = useAuth();
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isLoggedIn) return null;

  const cartCount = getCartCount();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    {
      path: '/orders',
      label: 'My Orders',
      icon: <ClipboardList size={18} />
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: <ShoppingCart size={18} />,
      badge: cartCount > 0 ? `(${cartCount})` : null
    },
    {
      path: '/profile',
      label: 'My Profile',
      icon: <User size={18} />
    }
  ];

  const userInfo = {
    avatarInitial: (userProfile?.name || user?.email || 'C').charAt(0).toUpperCase(),
    name: userProfile?.name || 'Customer',
    email: user?.email || ''
  };

  return (
    <>
      {/* Mobile/Tablet Hamburger Button (Top Right) */}
      <MobileMenuButton
        isOpen={isMobileOpen}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      />

      {/* Mobile/Tablet Overlay Backdrop */}
      <MobileOverlay
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Mobile/Tablet Slide-in Drawer (From Right) */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        title="BREAK TIME"
        subtitle="Customer Panel"
        navItems={navItems}
        isActive={isActive}
        user={userInfo}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* Desktop Sidebar (Visible only on screens > 1024px) */}
      <aside className="customer-sidebar">
        <div className="customer-sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`customer-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label} {item.badge && item.badge}</span>
            </Link>
          ))}
        </div>
        
        <div className="customer-sidebar-footer">
          <div className="customer-sidebar-user">
            <span className="customer-sidebar-user-avatar">
              {userInfo.avatarInitial}
            </span>
            <div className="customer-sidebar-user-info">
              <span className="customer-sidebar-user-name">
                {userInfo.name}
              </span>
              <span className="customer-sidebar-user-email">
                {userInfo.email}
              </span>
            </div>
          </div>
          <button className="customer-sidebar-logout" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="bottom-nav-inner">
          <Link to="/" className={`bottom-nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </Link>

          <Link to="/menu" className={`bottom-nav-item ${isActive('/menu') ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            <span>Menu</span>
          </Link>

          <Link to="/orders" className={`bottom-nav-item ${isActive('/orders') ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Orders</span>
          </Link>

          <Link to="/cart" className={`bottom-nav-item ${isActive('/cart') ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
            <span>Cart</span>
          </Link>

          <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile</span>
          </Link>
        </div>
      </nav>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onCancel={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
}
