import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';

export default function MobileSidebar({
  isOpen,
  onClose,
  title = "BREAK TIME",
  subtitle = "Portal",
  navItems = [],
  isActive,
  user = {},
  onLogout
}) {
  const handleClose = () => {
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  // ESC key listener & focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      if (document.activeElement && document.activeElement.closest('.mobile-sidebar-drawer')) {
        document.activeElement.blur();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <aside
      className={`mobile-sidebar-drawer ${isOpen ? 'open' : ''}`}
      inert={!isOpen}
    >
      <div className="mobile-sidebar-header">
        <div className="mobile-sidebar-brand">
          <div className="mobile-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <img src="/logo.png" alt={title} style={{ height: '44px', width: 'auto' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
              {title === 'BREAK TIME' || title === 'Break Time' ? (
                <>BREAK <span style={{ color: 'var(--primary)' }}>TIME</span></>
              ) : (
                title
              )}
            </span>
          </div>
          {subtitle && <span className="mobile-sidebar-subtitle">{subtitle}</span>}
        </div>
        <button
          type="button"
          className="mobile-sidebar-close-btn"
          onClick={handleClose}
          aria-label="Close Navigation Sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mobile-sidebar-nav">
        {navItems.map((item) => {
          const active = isActive ? isActive(item.path) : false;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-sidebar-link ${active ? 'active' : ''}`}
              onClick={handleClose}
            >
              <span className="mobile-sidebar-icon">{item.icon}</span>
              <span className="mobile-sidebar-label">{item.label}</span>
              {item.badge ? (
                <span className="mobile-sidebar-item-badge">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mobile-sidebar-footer">
          <div className="mobile-sidebar-user">
            <span className="mobile-sidebar-user-avatar">
              {user.avatarInitial || 'U'}
            </span>
            <div className="mobile-sidebar-user-info">
              <span className="mobile-sidebar-user-name">
                {user.name || 'User'}
              </span>
              <span className="mobile-sidebar-user-email">
                {user.email || ''}
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              className="mobile-sidebar-logout"
              onClick={() => {
                handleClose();
                onLogout();
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
