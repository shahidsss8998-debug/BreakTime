import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listenToOrders, STATUS_FLOW, STATUS_LABELS } from '../../services/orderService';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/StatusBadge';
import CreateOrderModal from '../components/CreateOrderModal';
import { ClipboardList, Inbox, ClipboardPenLine, CheckCircle, ChefHat, Package, Bike, PartyPopper, Plus } from 'lucide-react';

const ADMIN_STATUS_ICONS = {
  placed: <ClipboardPenLine size={16} />,
  confirmed: <CheckCircle size={16} />,
  preparing: <ChefHat size={16} />,
  ready: <Package size={16} />,
  out_for_delivery: <Bike size={16} />
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToOrders((orderData) => {
      // Active orders only
      const activeOrders = orderData.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
      setOrders(activeOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  STATUS_FLOW.filter(s => s !== 'delivered').forEach(s => {
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
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={28} /> Orders Management</h1>
            <span className="admin-page-count">{orders.length} active orders</span>
          </div>
          <button
            className="admin-add-btn"
            onClick={() => setShowCreateModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Plus size={18} /> Create Manual Order
          </button>
        </div>

        {showCreateModal && (
          <CreateOrderModal
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {/* Filter Tabs */}
        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All {statusCounts.all > 0 && <span className="admin-filter-badge">{statusCounts.all}</span>}
          </button>
          {STATUS_FLOW.filter(s => s !== 'delivered').map(status => (
            <button
              key={status}
              className={`admin-filter-tab ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {ADMIN_STATUS_ICONS[status]} {STATUS_LABELS[status]}
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
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-detail-loading">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Inbox size={48} /></div>
              <p>No orders matching filter</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="admin-orders-table admin-orders-table-desktop">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
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
                      <td>{order.items?.length || 0} items</td>
                      <td className="admin-table-total">₹{order.total}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="admin-table-date">{formatDate(order.createdAt)}</td>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="admin-table-view-btn">
                          Manage →
                        </Link>
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
                          Manage →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
