import { useState, useEffect } from 'react';
import { listenToMenuItems } from '../../services/menuService';
import { OFFICIAL_MENU_ITEMS } from '../../components/Menu';
import { createManualOrder } from '../../services/orderService';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Utensils,
  User,
  Phone,
  MapPin,
  CreditCard,
  XCircle,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function CreateOrderModal({ onClose, onSuccess }) {
  const [menuItems, setMenuItems] = useState(OFFICIAL_MENU_ITEMS);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Customer & Details State
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderType, setOrderType] = useState('dine_in'); // dine_in, takeaway, delivery
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment & Status State
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Card, Pending
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // Paid, Pending
  const [initialStatus, setInitialStatus] = useState('confirmed'); // placed, confirmed, preparing, ready
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Search & Custom Item State
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = listenToMenuItems(
      (items) => {
        if (items && items.length > 0) {
          setMenuItems(items);
        } else {
          setMenuItems(OFFICIAL_MENU_ITEMS);
        }
      },
      () => {
        setMenuItems(OFFICIAL_MENU_ITEMS);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filtered menu items for selection
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cart operations
  const addItemToOrder = (item) => {
    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      return [...prev, {
        id: item.id || `menu-${Date.now()}`,
        name: item.name,
        price: Number(item.price),
        quantity: 1,
        img: item.img || item.imageUrl || ''
      }];
    });
  };

  const updateQuantity = (index, delta) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomItem = () => {
    if (!customName.trim()) {
      setError('Please enter custom item name');
      return;
    }
    const priceNum = Number(customPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price for the custom item');
      return;
    }
    setError('');

    const newCustomItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      price: priceNum,
      quantity: 1,
      img: ''
    };

    setSelectedItems(prev => [...prev, newCustomItem]);
    setCustomName('');
    setCustomPrice('');
    setShowCustomInput(false);
  };

  // Calculations
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + Number(deliveryFee || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedItems.length === 0) {
      setError('Please select at least one menu item for the order.');
      return;
    }

    if (!customerName.trim()) {
      setError('Please enter a customer name.');
      return;
    }

    if (orderType === 'dine_in' && !tableNumber.trim()) {
      setError('Please enter table number for dine-in order.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Please enter delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        orderType,
        tableNumber: tableNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
        paymentMethod,
        paymentStatus,
        status: initialStatus,
        items: selectedItems,
        subtotal,
        deliveryFee: Number(deliveryFee || 0),
        total
      };

      const result = await createManualOrder(orderPayload);
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error creating manual order:', err);
      setError(err.message || 'Failed to create manual order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container manual-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={22} /> Create Manual Order</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add walk-in, phone, or in-store order to system</p>
          </div>
          <button className="admin-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ margin: '0 24px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="manual-order-body">
          <div className="manual-order-grid">
            {/* Left Column: Customer & Order Configuration */}
            <div className="manual-order-section">
              <h3 className="section-subtitle"><User size={18} /> Customer Info</h3>

              <div className="admin-menu-field">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Walk-in / Rahul"
                  required
                />
              </div>

              <div className="manual-order-row">
                <div className="admin-menu-field">
                  <label><Phone size={14} /> Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 7092170741"
                  />
                </div>
                <div className="admin-menu-field">
                  <label>Order Type</label>
                  <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                    <option value="dine_in">🍽️ Dine-in</option>
                    <option value="takeaway">🛍️ Takeaway / Counter</option>
                    <option value="delivery">🛵 Home Delivery</option>
                  </select>
                </div>
              </div>

              {orderType === 'dine_in' && (
                <div className="admin-menu-field">
                  <label>Table Number / Location *</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. Table 4 / Corner"
                    required
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <>
                  <div className="admin-menu-field">
                    <label><MapPin size={14} /> Delivery Address *</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter full delivery address..."
                      rows="2"
                      required
                    />
                  </div>
                  <div className="admin-menu-field">
                    <label>Delivery Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="manual-order-row" style={{ marginTop: '12px' }}>
                <div className="admin-menu-field">
                  <label><CreditCard size={14} /> Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Cash">💵 Cash</option>
                    <option value="UPI">📱 UPI / GPay</option>
                    <option value="Card">💳 Card</option>
                    <option value="Pending">⏳ Pay Later / Pending</option>
                  </select>
                </div>
                <div className="admin-menu-field">
                  <label>Payment Status</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                    <option value="Paid">✅ Paid</option>
                    <option value="Pending">⚠️ Unpaid / Pending</option>
                  </select>
                </div>
              </div>

              <div className="admin-menu-field">
                <label>Initial Order Status</label>
                <select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value)}>
                  <option value="confirmed">Confirmed (Default)</option>
                  <option value="preparing">Preparing in Kitchen</option>
                  <option value="placed">Placed (Pending confirmation)</option>
                  <option value="ready">Ready for Pickup / Serve</option>
                </select>
              </div>

              <div className="admin-menu-field">
                <label>Special Instructions / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Less spicy, extra cheese"
                />
              </div>
            </div>

            {/* Right Column: Menu Picker & Selected Items */}
            <div className="manual-order-section">
              <h3 className="section-subtitle"><Utensils size={18} /> Select Items ({selectedItems.length})</h3>

              {/* Menu Item Quick Selector */}
              <div className="manual-menu-picker">
                <input
                  type="text"
                  className="manual-menu-search"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="manual-menu-scroll">
                  {filteredMenuItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="manual-menu-item-chip"
                      onClick={() => addItemToOrder(item)}
                    >
                      <span className="chip-name">{item.name}</span>
                      <span className="chip-price">₹{item.price}</span>
                      <Plus size={14} className="chip-icon" />
                    </button>
                  ))}
                </div>

                {/* Custom Off-Menu Item Entry */}
                <div className="custom-item-toggle">
                  <button
                    type="button"
                    className="custom-item-btn"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                  >
                    <Sparkles size={14} /> {showCustomInput ? 'Hide Custom Item' : '+ Add Custom / Off-Menu Item'}
                  </button>

                  {showCustomInput && (
                    <div className="custom-item-box">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Extra Sauce)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Price ₹"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        style={{ width: '90px' }}
                      />
                      <button
                        type="button"
                        className="admin-add-btn"
                        onClick={handleAddCustomItem}
                        style={{ padding: '6px 12px' }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Cart List */}
              <div className="manual-cart-list">
                {selectedItems.length === 0 ? (
                  <div className="manual-cart-empty">
                    <ShoppingBag size={32} />
                    <p>No items added yet. Click menu items above to add to this order.</p>
                  </div>
                ) : (
                  <table className="manual-cart-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="item-name-cell">{item.name}</td>
                          <td>₹{item.price}</td>
                          <td>
                            <div className="manual-qty-control">
                              <button type="button" onClick={() => updateQuantity(idx, -1)}><Minus size={12} /></button>
                              <span>{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(idx, 1)}><Plus size={12} /></button>
                            </div>
                          </td>
                          <td className="item-subtotal">₹{item.price * item.quantity}</td>
                          <td>
                            <button type="button" className="remove-item-btn" onClick={() => removeItem(idx)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Summary Calculations */}
              <div className="manual-order-summary">
                <div className="summary-row">
                  <span>Items Subtotal:</span>
                  <strong>₹{subtotal}</strong>
                </div>
                {orderType === 'delivery' && (
                  <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <strong>₹{deliveryFee || 0}</strong>
                  </div>
                )}
                <div className="summary-row total-row">
                  <span>Grand Total:</span>
                  <strong className="grand-price">₹{total}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-clear-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-add-btn" disabled={submitting || selectedItems.length === 0}>
              {submitting ? 'Creating Order...' : `Confirm & Save Order (₹${total})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
