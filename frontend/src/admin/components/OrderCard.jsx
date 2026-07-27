/**
 * Order Card Component
 * Compact card showing an order summary for the admin dashboard.
 * Displays customer name, item count, total, status, and time.
 */
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order }) {
  // Format the timestamp to a relative "time ago" or date string
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Link to={`/admin/orders/${order.id}`} className="admin-order-card">
      <div className="admin-order-card-header">
        <span className="admin-order-card-id">{order.orderNumber || `#${order.id?.slice(0, 8).toUpperCase()}`}</span>
        <span className="admin-order-card-time">{formatTimeAgo(order.createdAt)}</span>
      </div>

      <div className="admin-order-card-body">
        <div className="admin-order-card-customer">
          <span className="admin-order-card-avatar">
            {(order.customerName || 'C').charAt(0).toUpperCase()}
          </span>
          <div>
            <span className="admin-order-card-name">{order.customerName || 'Customer'}</span>
            <span className="admin-order-card-items">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
        </div>

        <div className="admin-order-card-right">
          <span className="admin-order-card-total">₹{order.total}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Quick preview of items */}
      <div className="admin-order-card-preview">
        {order.items?.slice(0, 3).map((item, i) => (
          <span key={i} className="admin-order-card-preview-item">
            {item.name} ×{item.quantity}
          </span>
        ))}
        {order.items?.length > 3 && (
          <span className="admin-order-card-preview-more">+{order.items.length - 3} more</span>
        )}
      </div>
    </Link>
  );
}
