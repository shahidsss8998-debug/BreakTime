import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listenToOrder, updateOrderStatus, STATUS_LABELS } from '../../services/orderService';
import StatusBadge from '../components/StatusBadge';
import AdminSidebar from '../components/AdminSidebar';
import StatusUpdateButtons from '../components/StatusUpdateButtons';
import Toast from '../../components/Toast';
import CancelOrderModal from '../components/CancelOrderModal';
import { Search, XCircle, Trash2, ShoppingBag, User, Clock, Zap, X, ClipboardPenLine, CheckCircle, ChefHat, Package, Bike, PartyPopper } from 'lucide-react';

const ADMIN_STATUS_ICONS = {
  placed: <ClipboardPenLine size={16} />,
  confirmed: <CheckCircle size={16} />,
  preparing: <ChefHat size={16} />,
  ready: <Package size={16} />,
  out_for_delivery: <Bike size={16} />,
  delivered: <PartyPopper size={16} />,
  cancelled: <XCircle size={16} />
};

export default function OrderDetails() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = listenToOrder(orderId, (orderData) => {
      setOrder(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const cancelledBy = newStatus === 'cancelled' ? 'admin' : null;
      await updateOrderStatus(orderId, newStatus, cancelledBy);
      setToast({
        message: `Order status updated to ${newStatus.replace(/_/g, ' ')}!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({
        message: 'Failed to update order status.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-detail-loading">
            <div className="admin-loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-detail-error">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Search size={48} /></div>
            <h2>Order Not Found</h2>
            <Link to="/admin/orders" className="admin-add-btn" style={{ display: 'inline-block', marginTop: '16px' }}>
              Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {/* Header */}
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/admin/orders" className="admin-detail-back">← Back</Link>
            <h1>Order {order.orderNumber || `#${orderId.slice(0, 8).toUpperCase()}`}</h1>
          </div>
          <StatusBadge status={order.status} cancelledBy={order.cancelledBy} customerName={order.customerName} />
        </div>

        <div className="admin-detail-grid">
          {/* Left Column: Controls & Items */}
          <div>
            {/* Status Update Card */}
            <div className="admin-detail-card">
              <h3>Order Status Control</h3>
              <StatusUpdateButtons
                currentStatus={order.status}
                onStatusUpdate={handleStatusUpdate}
                updating={updating}
                cancelledBy={order.cancelledBy}
                customerName={order.customerName}
              />
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  className="admin-cancel-order-btn"
                  onClick={() => setShowCancelModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                >
                  <X size={16} /> Cancel Order
                </button>
              )}

            </div>

            {/* Order Items */}
            <div className="admin-detail-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={20} /> Items ({order.items?.length || 0})</h3>
              <div className="admin-detail-items">
                {order.items?.map((item, index) => (
                  <div key={index} className="admin-detail-item">
                    <div className="admin-detail-item-left">
                      {item.img && <img src={item.img} alt={item.name} className="admin-detail-item-img" />}
                      <div>
                        <span className="admin-detail-item-name">{item.name}</span>
                        <span className="admin-detail-item-qty">Qty: {item.quantity} × ₹{item.price}</span>
                      </div>
                    </div>
                    <span className="admin-detail-item-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="admin-detail-totals">
                <div className="admin-detail-row">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="admin-detail-row">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                </div>
                <div className="admin-detail-row total">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Info & Timeline */}
          <div>
            {/* Customer Details */}
            <div className="admin-detail-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> Customer Details</h3>
              <div className="admin-detail-info">
                <div className="admin-detail-row">
                  <span>Name</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{order.customerName || 'N/A'}</span>
                </div>
                {order.customerEmail && (
                  <div className="admin-detail-row">
                    <span>Email</span>
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="admin-detail-row">
                    <span>Phone</span>
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                {(order.deliveryDetails?.date || order.deliveryDetails?.time || order.deliveryDetails?.deliveryDateTime) && (
                  <div className="admin-detail-row" style={{ flexWrap: 'wrap', gap: '4px' }}>
                    <span>Requested Delivery</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {order.deliveryDetails?.deliveryDateTime || `${order.deliveryDetails?.date || 'Today'} ${order.deliveryDetails?.time ? `at ${order.deliveryDetails.time}` : ''}`}
                    </span>
                  </div>
                )}
                {order.isManualOrder && (
                  <div className="admin-detail-row">
                    <span>Order Source</span>
                    <span className="admin-filter-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>Manual Admin Order</span>
                  </div>
                )}
                {order.orderType && (
                  <div className="admin-detail-row">
                    <span>Order Type</span>
                    <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                      {order.orderType === 'dine_in' ? `🍽️ Dine-in ${order.tableNumber ? `(Table ${order.tableNumber})` : ''}` : order.orderType === 'takeaway' ? '🛍️ Takeaway' : '🛵 Delivery'}
                    </span>
                  </div>
                )}
                {order.paymentMethod && (
                  <div className="admin-detail-row">
                    <span>Payment</span>
                    <span style={{ fontWeight: '600' }}>
                      {order.paymentMethod} {order.paymentStatus ? `(${order.paymentStatus})` : ''}
                    </span>
                  </div>
                )}
                {(order.deliveryAddress || order.deliveryDetails?.place) && (
                  <div className="admin-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ fontWeight: '600' }}>Location / Address</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {order.deliveryAddress || order.deliveryDetails?.place}
                    </span>
                  </div>
                )}
                {(order.deliveryCharge != null || order.deliveryFee != null) && (
                  <div className="admin-detail-row">
                    <span>Delivery Charge</span>
                    <span style={{ fontWeight: '700', color: (order.deliveryCharge === 0 || order.deliveryFee === 0) ? 'var(--success)' : 'var(--primary)' }}>
                      {(order.deliveryCharge === 0 || order.deliveryFee === 0) ? 'FREE' : `₹${order.deliveryCharge ?? order.deliveryFee}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="admin-detail-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} /> Order Timeline</h3>
              <div className="admin-timeline-history">
                {order.statusHistory?.map((history, idx) => (
                  <div key={idx} className="admin-timeline-item">
                    <span className="admin-timeline-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ADMIN_STATUS_ICONS[history.status] ? (
                        <span style={{ transform: 'scale(0.8)' }}>{ADMIN_STATUS_ICONS[history.status]}</span>
                      ) : (
                        <Zap size={14} />
                      )}
                    </span>
                    <div className="admin-timeline-content">
                      <span className="admin-timeline-status">{STATUS_LABELS[history.status] || history.status}</span>
                      <span className="admin-timeline-time">{formatDate(history.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
      <CancelOrderModal
        isOpen={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          handleStatusUpdate('cancelled', 'admin');
        }}
      />
    </div>
  );
}
