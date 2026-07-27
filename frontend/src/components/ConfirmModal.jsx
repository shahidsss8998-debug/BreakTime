import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant = 'danger' }) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-icon" style={{ 
          background: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
          color: isDanger ? 'var(--error)' : 'var(--primary)' 
        }}>
          <AlertTriangle size={28} strokeWidth={2.5} />
        </div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">
          {message}
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            {cancelText || 'Cancel'}
          </button>
          <button 
            className="modal-btn modal-btn-confirm" 
            onClick={onConfirm}
            style={!isDanger ? { background: 'var(--primary)' } : {}}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
