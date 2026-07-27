/**
 * Cart — Shopping cart with item list, quantity controls, and order summary.
 * Uses CartContext for all state management.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Lock } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 500 ? 0 : subtotal > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login');
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart-section">
        <div className="container">
          <div className="empty-cart">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <ShoppingCart size={64} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/menu" className="btn-primary">Browse Menu</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-section">
      <div className="container">
        <div className="cart-header-actions">
          <span>{cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart</span>
          <button className="cart-clear-btn" onClick={clearCart}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Clear Cart
          </button>
        </div>

        <div className="cart-grid">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  {item.img && <img src={item.img} alt={item.name} className="cart-item-image" />}
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">₹{item.price}</p>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <span className="cart-item-total">
                    ₹{item.price * item.quantity}
                  </span>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row border-bottom">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            {deliveryFee > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '8px' }}>
                Add ₹{500 - subtotal} more for free delivery
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
            <p className="checkout-secure-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Lock size={12} /> Secure checkout
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
