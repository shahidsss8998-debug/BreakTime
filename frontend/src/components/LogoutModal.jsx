import { LogOut } from 'lucide-react';

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">
          <LogOut size={28} strokeWidth={2.5} />
        </div>
        <h2 className="modal-title">Sign Out</h2>
        <p className="modal-text">
          Are you sure to log out your account?
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
