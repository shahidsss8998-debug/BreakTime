import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listenToCustomerOrders, clearPastCustomerOrders, hideCustomerOrder } from '../services/orderService';
import OrderCard from '../components/OrderCard';
import ConfirmModal from '../components/ConfirmModal';
import { Trash2, Package } from 'lucide-react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [clearing, setClearing] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToCustomerOrders(user.uid, (userOrders) => {
      setOrders(userOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClearPastOrders = () => {
    setModalConfig({
      isOpen: true,
      type: 'clear_all',
      data: null
    });
  };

  const handleDeleteOrder = (orderId) => {
    setModalConfig({
      isOpen: true,
      type: 'delete_single',
      data: orderId
    });
  };

  const confirmAction = async () => {
    const { type, data } = modalConfig;
    setModalConfig({ isOpen: false, type: null, data: null });

    if (type === 'clear_all') {
      setClearing(true);
      try {
        await clearPastCustomerOrders(user.uid);
      } catch (err) {
        console.error('Error clearing past orders:', err);
        alert('Failed to clear orders: ' + err.message);
      } finally {
        setClearing(false);
      }
    } else if (type === 'delete_single') {
      try {
        await hideCustomerOrder(data);
      } catch (err) {
        console.error('Error removing order:', err);
        alert('Failed to remove order: ' + err.message);
      }
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const filteredOrders = activeTab === 'active'
    ? activeOrders
    : activeTab === 'past'
    ? pastOrders
    : orders;

  return (
    <div className="my-orders-page">
      <div className="container">
        <div className="my-orders-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>My Orders</h1>
            <p>Track live orders and view past order history</p>
          </div>
          {activeTab === 'past' && pastOrders.length > 0 && (
            <button 
              onClick={handleClearPastOrders}
              disabled={clearing}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--error)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {clearing ? 'Clearing...' : <><Trash2 size={16} /> Clear Past Orders</>}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="my-orders-tabs">
          <button
            className={`my-orders-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className="my-orders-tab-label-full">All Orders</span>
            <span className="my-orders-tab-label-short">All</span>
            {orders.length > 0 && <span className="my-orders-tab-count">{orders.length}</span>}
          </button>
          <button
            className={`my-orders-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span className="my-orders-tab-label-full">Active Orders</span>
            <span className="my-orders-tab-label-short">Active</span>
            {activeOrders.length > 0 && <span className="my-orders-tab-count">{activeOrders.length}</span>}
          </button>
          <button
            className={`my-orders-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <span className="my-orders-tab-label-full">Past Orders</span>
            <span className="my-orders-tab-label-short">Past</span>
            {pastOrders.length > 0 && <span className="my-orders-tab-count">{pastOrders.length}</span>}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="my-orders-loading">
            <div className="admin-loading-spinner"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="my-orders-empty">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <Package size={64} strokeWidth={1.5} />
            </div>
            <h2>No orders found</h2>
            <p>
              {activeTab === 'active'
                ? 'You have no active orders right now.'
                : activeTab === 'past'
                ? 'You have no past order history yet.'
                : 'You haven\'t placed any orders yet.'}
            </p>
            <Link to="/menu" className="btn-primary">Explore Menu</Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onDelete={handleDeleteOrder} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onCancel={() => setModalConfig({ isOpen: false, type: null, data: null })}
        onConfirm={confirmAction}
        title={modalConfig.type === 'clear_all' ? 'Clear Order History' : 'Remove Order'}
        message={
          modalConfig.type === 'clear_all' 
            ? 'Are you sure to clear all past orders?'
            : 'Are you sure to remove this order?'
        }
        confirmText={modalConfig.type === 'clear_all' ? 'Clear All' : 'Remove'}
        cancelText="Cancel"
      />
    </div>
  );
}
