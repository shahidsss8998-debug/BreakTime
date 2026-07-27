import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listenToOrders, STATUS_FLOW } from '../../services/orderService';
import AdminSidebar from '../components/AdminSidebar';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { BarChart3, Trash2, Package, Zap, IndianRupee, Clock, ChefHat, PartyPopper, Inbox } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToOrders((orderData) => {
      setOrders(orderData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);



  // Calculate stats
  const statusCounts = {};
  STATUS_FLOW.forEach(s => { statusCounts[s] = 0; });
  orders.forEach(o => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
  });

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const recentOrders = orders.slice(0, 8);

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={28} /> Dashboard</h1>
            <span className="admin-page-count">Real-time metrics & recent orders</span>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="admin-stats">
          <StatsCard icon={<Package size={24} />} count={orders.length} label="Total Orders" variant="total" />
          <StatsCard icon={<Zap size={24} />} count={activeOrders.length} label="Active Orders" variant="active" />
          <StatsCard icon={<IndianRupee size={24} />} count={`₹${totalRevenue}`} label="Total Revenue" variant="revenue" />
          <StatsCard icon={<Clock size={24} />} count={statusCounts.placed || 0} label="New Orders" variant="pending" />
          <StatsCard icon={<ChefHat size={24} />} count={statusCounts.preparing || 0} label="Preparing" variant="preparing" />
          <StatsCard icon={<PartyPopper size={24} />} count={statusCounts.delivered || 0} label="Delivered" variant="completed" />
        </div>

        {/* Recent Orders */}
        <div className="admin-section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="admin-view-all">View All Orders →</Link>
        </div>

        <div className="admin-orders-table-wrap">
          {loading ? (
            <div className="admin-detail-loading">
              <div className="admin-loading-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="admin-detail-loading">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Inbox size={48} /></div>
              <p>No orders received yet</p>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="admin-table-order-id">
                        {order.orderNumber || `#${order.id.slice(0, 6).toUpperCase()}`}
                      </td>
                      <td className="admin-table-customer">
                        <span>{order.customerName || 'N/A'}</span>
                        <small>{order.customerPhone || ''}</small>
                      </td>
                      <td className="admin-table-total">₹{order.total}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="admin-table-date">{formatDate(order.createdAt)}</td>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="admin-table-view-btn">View Details →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="admin-orders-card-list">
                {recentOrders.map(order => (
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
                        <span>{order.customerPhone || ''}</span>
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
                          View Details →
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
