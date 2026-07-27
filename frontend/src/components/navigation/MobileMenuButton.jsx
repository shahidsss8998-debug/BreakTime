import { Menu, X } from 'lucide-react';

export default function MobileMenuButton({ isOpen, onClick, ariaLabel = "Toggle Navigation Menu" }) {
  return (
    <button
      type="button"
      className="mobile-menu-btn"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}
