import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listenToOrder } from '../services/orderService';

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = listenToOrder(orderId, (orderData) => {
      setOrder(orderData);
    });
    return () => unsubscribe();
  }, [orderId]);

  return (
    <div style={{
      minHeight: '70vh',
      padding: 'calc(var(--navbar-h) + 40px) 20px 80px',
      background: 'var(--bg-section)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(24px, 5vw, 40px)',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--success-light)',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          margin: '0 auto 20px'
        }}>
          ✓
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
          Thank you for ordering from Break Time! Your order has been placed and is being prepared.
        </p>

        {order && (
          <div style={{
            background: 'var(--bg-section)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '28px',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', gap: '16px' }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Order ID</span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}>
                {order.orderNumber || `#${orderId.slice(0, 8).toUpperCase()}`}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', gap: '16px' }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Total Amount</span>
              <strong style={{ color: 'var(--primary)', textAlign: 'right' }}>₹{order.total}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Payment</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '500', textAlign: 'right' }}>Cash on Delivery</span>
            </div>
            {(order.deliveryDetails?.date || order.deliveryDetails?.time || order.deliveryDetails?.deliveryDateTime) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Requested Time</span>
                <span style={{ color: 'var(--primary)', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  {order.deliveryDetails?.deliveryDateTime || `${order.deliveryDetails?.date || 'Today'} ${order.deliveryDetails?.time ? `at ${order.deliveryDetails.time}` : ''}`}
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${orderId}`} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.88rem' }}>
            Track Order Live →
          </Link>
          <Link to="/menu" className="btn-outline" style={{ padding: '12px 24px', fontSize: '0.88rem' }}>
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
