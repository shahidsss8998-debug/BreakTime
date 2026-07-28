import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../services/adminAuthService';
import { BarChart3, ShoppingBag, Utensils, LogOut, History } from 'lucide-react';
import { auth } from '../../firebase/config';
import LogoutModal from '../../components/LogoutModal';
import MobileMenuButton from '../../components/navigation/MobileMenuButton';
import MobileOverlay from '../../components/navigation/MobileOverlay';
import MobileSidebar from '../../components/navigation/MobileSidebar';

export default function AdminSidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { path: '/admin/history', label: 'Order History', icon: <History size={18} /> },
    { path: '/admin/menu', label: 'Menu Manager', icon: <Utensils size={18} /> }
  ];

  const adminUserInfo = {
    avatarInitial: (auth.currentUser?.displayName || auth.currentUser?.email || 'A').charAt(0).toUpperCase(),
    name: auth.currentUser?.displayName || 'Admin',
    email: auth.currentUser?.email || ''
  };

  return (
    <>
      {/* Mobile/Tablet Fixed Top Header Bar (≤ 1024px) */}
      <div className="admin-mobile-header">
          <div className="admin-mobile-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Break Time Logo" style={{ height: '32px', width: 'auto' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1, color: 'white' }}>BREAK <span style={{ color: 'var(--primary)' }}>TIME</span></span>
              <span className="admin-mobile-header-subtitle" style={{ marginLeft: 0, marginTop: '2px', fontSize: '0.65rem' }}>Admin Panel</span>
            </div>
          </div>
        <MobileMenuButton
          isOpen={isMobileOpen}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        />
      </div>

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
        subtitle="Admin Panel"
        navItems={navItems}
        isActive={isActive}
        user={adminUserInfo}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* Desktop / Large Screen Sidebar (Visible on > 1024px) */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 16px 16px' }}>
          <img src="/logo.png" alt="Break Time Logo" style={{ height: '54px', width: 'auto' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>BREAK <span style={{ color: 'var(--primary)' }}>TIME</span></div>
            <span className="admin-sidebar-subtitle" style={{ fontSize: '0.7rem', marginTop: '4px', display: 'inline-block' }}>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={onToggle ? () => onToggle(false) : undefined}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-user-avatar">
              {adminUserInfo.avatarInitial}
            </span>
            <div className="admin-sidebar-user-info">
              <span className="admin-sidebar-user-name">
                {adminUserInfo.name}
              </span>
              <span className="admin-sidebar-user-email">
                {adminUserInfo.email}
              </span>
            </div>
          </div>
          <button className="admin-sidebar-logout" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="admin-bottom-nav" role="navigation" aria-label="Admin navigation">
        <div className="admin-bottom-nav-inner">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="admin-bottom-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
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
