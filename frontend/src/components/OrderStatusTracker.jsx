import { STATUS_FLOW, STATUS_LABELS } from '../services/orderService';
import { ClipboardList, CheckCircle, ChefHat, Package, Bike, PartyPopper, XCircle, Check } from 'lucide-react';

const STATUS_ICONS = {
  placed: <ClipboardList size={16} />,
  confirmed: <CheckCircle size={16} />,
  preparing: <ChefHat size={16} />,
  ready: <Package size={16} />,
  out_for_delivery: <Bike size={16} />,
  delivered: <PartyPopper size={16} />,
  cancelled: <XCircle size={16} />
};

export default function OrderStatusTracker({ currentStatus, statusHistory = [], cancelledBy = null }) {
  if (currentStatus === 'cancelled') {
    const isCustomerCancelled = cancelledBy === 'customer';
    return (
      <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <XCircle size={44} />
        <p style={{ fontWeight: '700', fontSize: '1.05rem', margin: '8px 0 4px', color: 'var(--error)' }}>
          {isCustomerCancelled ? 'Order Cancelled by You' : 'Order Cancelled by Restaurant / Admin'}
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isCustomerCancelled 
            ? 'You cancelled this order before confirmation.'
            : 'This order was cancelled by the restaurant. Please contact support if you have any questions.'}
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const totalSteps = STATUS_FLOW.length - 1;
  const fillPercent = currentIndex >= 0 ? (currentIndex / totalSteps) * 100 : 0;

  // Find timestamp for each status if available
  const getTimeForStatus = (status) => {
    const historyItem = statusHistory.find(h => h.status === status);
    if (!historyItem || !historyItem.timestamp) return null;
    const date = historyItem.timestamp.toDate
      ? historyItem.timestamp.toDate()
      : new Date(historyItem.timestamp.seconds * 1000);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="status-tracker">
      <div className="status-tracker-line">
        <div
          className="status-tracker-line-fill"
          style={{ width: `${fillPercent}%` }}
        ></div>
      </div>

      <div className="status-tracker-steps">
        {STATUS_FLOW.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = status === currentStatus;
          const timeStr = getTimeForStatus(status);

          return (
            <div
              key={status}
              className={`status-tracker-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="status-tracker-dot">
                {isCompleted ? (isActive ? STATUS_ICONS[status] : <Check size={16} />) : index + 1}
              </div>
              <div className="status-tracker-info">
                <span className="status-tracker-label">{STATUS_LABELS[status]}</span>
                {timeStr && <span className="status-tracker-time">{timeStr}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
