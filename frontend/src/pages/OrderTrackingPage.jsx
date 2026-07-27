import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listenToOrder, STATUS_LABELS, updateOrderStatus } from '../services/orderService';
import OrderStatusTracker from '../components/OrderStatusTracker';
import { Search, ShoppingBag, MapPin } from 'lucide-react';

import ConfirmModal from '../components/ConfirmModal';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = listenToOrder(orderId, (orderData) => {
      setOrder(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    try {
      await updateOrderStatus(orderId, 'cancelled', 'customer');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="admin-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Search size={48} /></div>
          <h2 style={{ color: 'var(--text-primary)', margin: '16px 0 8px' }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>We couldn't find the order you're looking for.</p>
          <Link to="/orders" className="btn-primary">View My Orders</Link>
        </div>
      </div>
    );
  }

  const isLive = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <div className="tracking-page">
      <div className="container">
        <Link to="/orders" className="tracking-back">← Back to My Orders</Link>

        <div className="tracking-title-row" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Order {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}</h1>
            <p className="tracking-date">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {order.status === 'placed' && (
              <button 
                onClick={handleCancelClick}
                disabled={cancelling}
                style={{
                  background: 'transparent',
                  color: 'var(--error)',
                  border: '1px solid var(--error)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <span className={`tracking-status-badge tracking-status--${order.status}`}>
              {order.status === 'cancelled'
                ? (order.cancelledBy === 'customer' ? 'Cancelled by You' : 'Cancelled by Admin')
                : (STATUS_LABELS[order.status] || order.status)}
            </span>
          </div>
        </div>

        {/* Live Status Tracker Section */}
        <div className="tracking-tracker-section">
          <h2>Order Status</h2>
          {isLive && (
            <div className="tracking-live-badge">
              <span className="tracking-live-dot"></span>
              Live Updates
            </div>
          )}
          <OrderStatusTracker currentStatus={order.status} statusHistory={order.statusHistory} cancelledBy={order.cancelledBy} />
        </div>

        {/* Two Column Detail Grid */}
        <div className="tracking-details-grid">
          {/* Order Items */}
          <div className="tracking-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={20} /> Order Items ({order.items?.length || 0})</h3>
            <div className="tracking-items">
              {order.items?.map((item, idx) => (
                <div key={idx} className="tracking-item">
                  <div className="tracking-item-left">
                    {item.img && <img src={item.img} alt={item.name} className="tracking-item-img" />}
                    <div>
                      <span className="tracking-item-name">{item.name}</span>
                      <span className="tracking-item-qty">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  </div>
                  <span className="tracking-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="tracking-totals">
              <div className="tracking-total-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="tracking-total-row">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="tracking-total-row tracking-total-final">
                <span>Total Amount</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="tracking-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} /> Delivery Information</h3>
            <div className="tracking-info-list">
              <div className="tracking-info-row">
                <span>Deliver to</span>
                <span>{order.customerName || 'N/A'}</span>
              </div>
              {order.customerPhone && (
                <div className="tracking-info-row">
                  <span>Phone</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="tracking-info-row" style={{ flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                  <span>Address</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.4' }}>
                    {order.deliveryAddress}
                  </span>
                </div>
              )}
              {(order.deliveryDetails?.date || order.deliveryDetails?.time || order.deliveryDetails?.deliveryDateTime) && (
                <div className="tracking-info-row" style={{ flexWrap: 'wrap', gap: '4px' }}>
                  <span>Requested Time</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600', whiteSpace: 'nowrap', display: 'inline-block' }}>
                    {order.deliveryDetails?.deliveryDateTime || `${order.deliveryDetails?.date || 'Today'} ${order.deliveryDetails?.time ? `at ${order.deliveryDetails.time}` : ''}`}
                  </span>
                </div>
              )}
              <div className="tracking-info-row">
                <span>Payment</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Popup Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancelOrder}
        title="Cancel Order?"
        message={`Are you sure to cancel this Order ${order.orderNumber || ''}?`}
        confirmText={cancelling ? "Cancelling..." : "Cancel Order"}
        cancelText="Keep Order"
        variant="danger"
      />
    </div>
  );
}
