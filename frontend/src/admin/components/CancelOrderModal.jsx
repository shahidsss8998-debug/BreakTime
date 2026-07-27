import { AlertTriangle } from 'lucide-react';

export default function CancelOrderModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
          <AlertTriangle size={28} strokeWidth={2.5} />
        </div>
        <h2 className="modal-title">Cancel Order</h2>
        <p className="modal-text">
          Are you sure you want to cancel this order? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            No, Keep It
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
