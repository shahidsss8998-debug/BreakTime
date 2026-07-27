import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'var(--success-light)',
    error: 'var(--error-light)',
    info: 'var(--primary-light)'
  };

  const borderColors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--primary)'
  };

  const textColors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--primary)'
  };

  const icons = {
    success: <CheckCircle size={18} color="var(--success)" />,
    error: <XCircle size={18} color="var(--error)" />,
    info: <Info size={18} color="var(--primary)" />
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: bgColors[type] || bgColors.info,
        border: `1px solid ${borderColors[type] || borderColors.info}`,
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        color: textColors[type] || textColors.info,
        boxShadow: 'var(--shadow-md)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.88rem',
        animation: 'toastSlideIn 0.3s ease forwards',
        maxWidth: '360px'
      }}
    >
      <span>{icons[type]}</span>
      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          marginLeft: 'auto',
          fontSize: '0.9rem',
          padding: '0 4px'
        }}
      >
        <X size={16} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
