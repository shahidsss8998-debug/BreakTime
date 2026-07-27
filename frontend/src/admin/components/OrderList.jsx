/**
 * Order List Component
 * Renders a list of OrderCards with loading and empty states.
 */
import OrderCard from './OrderCard';
import { Inbox } from 'lucide-react';

export default function OrderList({ orders, loading }) {
  if (loading) {
    return (
      <div className="admin-order-list-loading">
        <div className="admin-loading-skeleton">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="admin-skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="admin-order-list-empty">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Inbox size={48} /></div>
        <h3>No Orders Found</h3>
        <p>Orders matching this filter will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="admin-order-list">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
