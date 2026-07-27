import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, ChefHat, Package, Bike, PartyPopper, XCircle, Trash2, MapPin } from 'lucide-react';

const STATUS_ICONS = {
  placed: <ClipboardList size={16} />,
  confirmed: <CheckCircle size={16} />,
  preparing: <ChefHat size={16} />,
  ready: <Package size={16} />,
  out_for_delivery: <Bike size={16} />,
  delivered: <PartyPopper size={16} />,
  cancelled: <XCircle size={16} />
};

const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const STATUS_PROGRESS = {
  placed: 15,
  confirmed: 35,
  preparing: 60,
  ready: 80,
  out_for_delivery: 90,
  delivered: 100,
  cancelled: 0
};

export default function OrderCard({ order, onDelete }) {
  const isCompleted = order.status === 'delivered' || order.status === 'cancelled';
  const progressPercent = STATUS_PROGRESS[order.status] || 15;
  const address = order.deliveryAddress || order.deliveryDetails?.place;
  const totalItemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Link to={`/orders/${order.id}`} className="order-card-link">
      <div className={`order-card ${!isCompleted ? 'order-card--active' : ''}`}>
        <div className="order-card-header">
          <div className="order-card-meta">
            <span className="order-card-number">
              {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="order-card-date">{formatDate(order.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`order-card-status order-card-status--${order.status}`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {STATUS_ICONS[order.status]} {order.status === 'cancelled' ? (order.cancelledBy === 'admin' ? 'Cancelled by Admin' : 'Cancelled') : (STATUS_LABELS[order.status] || order.status)}
              </span>
            </span>
            {isCompleted && onDelete && (
              <button
                className="order-card-delete-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(order.id);
                }}
                title="Remove from history"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--error)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Detailed Item List */}
        <div className="order-card-detailed-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-card-item-row">
              <div className="order-card-item-info">
                <span className="order-card-item-qty">{item.quantity}×</span>
                <span className="order-card-item-name">{item.name}</span>
                {item.selectedVariant && (
                  <span className="order-card-item-variant">({item.selectedVariant})</span>
                )}
              </div>
              <span className="order-card-item-price">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Delivery Address Details */}
        {address && (
          <div className="order-card-address">
            <MapPin size={14} className="order-card-address-icon" />
            <span className="order-card-address-text">{address}</span>
          </div>
        )}

        {/* Active Progress Bar */}
        {!isCompleted && (
          <div className="order-card-progress">
            <div className="order-card-progress-bar">
              <div className="order-card-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="order-card-progress-label">
              In progress • Click to track order live →
            </span>
          </div>
        )}

        <div className="order-card-footer">
          <div className="order-card-footer-info">
            <span className="order-card-item-count">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
            <span className="order-card-total">₹{order.total}</span>
          </div>
          <span className="order-card-action">View Details →</span>
        </div>
      </div>
    </Link>
  );
}
