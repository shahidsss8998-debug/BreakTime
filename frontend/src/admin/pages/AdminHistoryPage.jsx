import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listenToOrders, STATUS_LABELS, clearAdminHistory, deleteOrderForAdmin } from '../../services/orderService';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { History, Inbox, CheckCircle, PartyPopper, XCircle, Trash2 } from 'lucide-react';
import Toast from '../../components/Toast';

const HISTORY_STATUS_ICONS = {
  delivered: <PartyPopper size={16} />,
  cancelled: <XCircle size={16} />
};

export default function AdminHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  useEffect(() => {
    const unsubscribe = listenToOrders((orderData) => {
      // Only keep delivered or cancelled orders
      const historyOrders = orderData.filter(o => o.status === 'delivered' || o.status === 'cancelled');
      setOrders(historyOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleClearHistory = () => {
    setModalConfig({ isOpen: true, type: 'clear_all', data: null });
  };

  const handleDeleteSpecificOrder = (orderId) => {
    setModalConfig({ isOpen: true, type: 'delete_single', data: orderId });
  };

  const confirmAction = async () => {
    const { type, data } = modalConfig;
    setModalConfig({ isOpen: false, type: null, data: null });

    if (type === 'clear_all') {
      try {
        await clearAdminHistory();
        setToast({ message: 'Order history cleared successfully.', type: 'success' });
      } catch (err) {
        console.error(err);
        setToast({ message: 'Error clearing history.', type: 'error' });
      }
    } else if (type === 'delete_single') {
      try {
        await deleteOrderForAdmin(data);
        setToast({ message: 'Order deleted from history.', type: 'success' });
      } catch (err) {
        console.error(err);
        setToast({ message: 'Error deleting order.', type: 'error' });
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      order.customerName?.toLowerCase().includes(q) ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q) ||
      order.customerEmail?.toLowerCase().includes(q) ||
      order.customerPhone?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const statusCounts = { all: orders.length };
  ['delivered', 'cancelled'].forEach(s => {
    statusCounts[s] = orders.filter(o => o.status === s).length;
  });

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={28} /> Order History</h1>
            <span className="admin-page-count">{orders.length} past orders</span>
          </div>
          {orders.length > 0 && (
            <button 
              onClick={handleClearHistory} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--error)', 
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 16px', 
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={16} /> Clear All History
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All {statusCounts.all > 0 && <span className="admin-filter-badge">{statusCounts.all}</span>}
          </button>
          {['delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`admin-filter-tab ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {HISTORY_STATUS_ICONS[status]} {STATUS_LABELS[status]}
              {statusCounts[status] > 0 && (
                <span className="admin-filter-badge">{statusCounts[status]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="admin-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search by customer name, phone, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Orders Table */}
        <div className="admin-orders-table-wrap">
          {loading ? (
            <div className="admin-detail-loading">
              <div className="admin-loading-spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-detail-loading">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Inbox size={48} /></div>
              <p>No historical orders found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="admin-orders-table admin-orders-table-desktop">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td className="admin-table-order-id">
                        {order.orderNumber || `#${order.id.slice(0, 6).toUpperCase()}`}
                      </td>
                      <td>
                        <div className="admin-table-customer">
                          <span>{order.customerName || 'N/A'}</span>
                          <small>{order.customerPhone || order.customerEmail || ''}</small>
                        </div>
                      </td>
                      <td className="admin-table-total">₹{order.total}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="admin-table-date">{formatDate(order.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link to={`/admin/orders/${order.id}`} className="admin-table-view-btn">
                            View
                          </Link>
                          <button 
                            onClick={() => handleDeleteSpecificOrder(order.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--error)',
                              border: 'none',
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'inline-flex'
                            }}
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="admin-orders-card-list">
                {filteredOrders.map(order => (
                  <div key={order.id} className="admin-mobile-order-card">
                    <div className="admin-mobile-order-card-header">
                      <span className="admin-mobile-order-card-id">
                        {order.orderNumber || `#${order.id.slice(0, 6).toUpperCase()}`}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="admin-mobile-order-card-body">
                      <div className="admin-mobile-order-card-customer">
                        <strong>{order.customerName || 'N/A'}</strong>
                        <span>{order.customerPhone || order.customerEmail || ''}</span>
                      </div>

                      <div className="admin-mobile-order-card-meta">
                        <span>{order.items?.length || 0} items</span>
                        <span className="admin-mobile-order-card-date">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="admin-mobile-order-card-footer">
                      <span className="admin-mobile-order-card-total">₹{order.total}</span>
                      <div className="admin-mobile-order-card-actions">
                        <Link to={`/admin/orders/${order.id}`} className="admin-table-view-btn">
                          View
                        </Link>
                        <button 
                          onClick={() => handleDeleteSpecificOrder(order.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--error)',
                            border: 'none',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'inline-flex'
                          }}
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onCancel={() => setModalConfig({ isOpen: false, type: null, data: null })}
        onConfirm={confirmAction}
        title={modalConfig.type === 'clear_all' ? 'Clear Order History' : 'Delete Order'}
        message={
          modalConfig.type === 'clear_all' 
            ? 'Are you want to clear the entire order history?'
            : 'Are you sure to delete this order?'
        }
        confirmText={modalConfig.type === 'clear_all' ? 'Clear All' : 'Delete'}
        cancelText="Cancel"
      />
    </div>
  );
}
