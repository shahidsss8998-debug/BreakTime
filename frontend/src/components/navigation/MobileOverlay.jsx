export default function MobileOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className={`mobile-sidebar-overlay ${isOpen ? 'active' : ''}`}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
