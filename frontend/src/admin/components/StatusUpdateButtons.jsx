import React from 'react';
import { ClipboardPenLine, CheckCircle, ChefHat, Package, Bike, PartyPopper, XCircle } from 'lucide-react';
import { STATUS_FLOW, STATUS_LABELS, getNextStatus } from '../../services/orderService';

const ADMIN_STATUS_ICONS = {
  placed: <ClipboardPenLine size={16} />,
  confirmed: <CheckCircle size={16} />,
  preparing: <ChefHat size={16} />,
  ready: <Package size={16} />,
  out_for_delivery: <Bike size={16} />,
  delivered: <PartyPopper size={16} />,
  cancelled: <XCircle size={16} />
};

export default function StatusUpdateButtons({ currentStatus, onStatusUpdate, updating, cancelledBy = null, customerName = '' }) {
  const nextStatus = getNextStatus(currentStatus);

  const buttonLabels = {
    placed: { text: 'Confirm Order', icon: <CheckCircle size={16} /> },
    confirmed: { text: 'Start Preparing', icon: <ChefHat size={16} /> },
    preparing: { text: 'Mark as Ready', icon: <Package size={16} /> },
    ready: { text: 'Out for Delivery', icon: <Bike size={16} /> },
    out_for_delivery: { text: 'Mark as Delivered', icon: <PartyPopper size={16} /> }
  };

  return (
    <div className="status-update-controls">
      {/* Status progress tracker */}
      <div className="admin-status-flow">
        {STATUS_FLOW.map((status, index) => {
          const currentIndex = STATUS_FLOW.indexOf(currentStatus);
          const isCompleted = index <= currentIndex && currentStatus !== 'cancelled';
          const isCurrent = currentStatus === status;

          return (
            <div
              key={status}
              className={`admin-status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="admin-status-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ADMIN_STATUS_ICONS[status]}</div>
              <span style={{ fontSize: '0.72rem', marginTop: '4px', fontWeight: isCurrent ? '700' : '400', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="admin-status-actions">
        {nextStatus && currentStatus !== 'cancelled' ? (
          <button
            className="admin-status-advance-btn"
            onClick={() => onStatusUpdate(nextStatus)}
            disabled={updating}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
          >
            {updating ? (
              <span className="admin-loading-spinner" style={{ width: '18px', height: '18px' }}></span>
            ) : (
              <>
                {buttonLabels[nextStatus]?.icon}
                {buttonLabels[nextStatus]?.text || `Advance to ${STATUS_LABELS[nextStatus]}`}
              </>
            )}
          </button>
        ) : null}

        {currentStatus === 'delivered' && (
          <div className="admin-status-notice admin-status-notice--success">
            <div className="admin-status-notice-header">
              <PartyPopper size={20} color="var(--success)" />
              <span className="admin-status-notice-title" style={{ color: 'var(--success)' }}>
                Order Successfully Delivered
              </span>
            </div>
            <p className="admin-status-notice-text">
              This order has been completed and delivered to the customer.
            </p>
          </div>
        )}

        {currentStatus === 'cancelled' && (
          <div className="admin-status-notice admin-status-notice--error">
            <div className="admin-status-notice-header">
              <XCircle size={20} color="var(--error)" />
              <span className="admin-status-notice-title">
                {cancelledBy === 'customer'
                  ? `Order Cancelled by Customer ${customerName ? `(${customerName})` : ''}`
                  : 'Order Cancelled by You (Admin)'}
              </span>
            </div>
            <p className="admin-status-notice-text">
              {cancelledBy === 'customer'
                ? `This order was cancelled by customer ${customerName || ''} before confirmation. No further status updates can be made.`
                : 'This order was cancelled by you (Admin). No further status updates can be made.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
