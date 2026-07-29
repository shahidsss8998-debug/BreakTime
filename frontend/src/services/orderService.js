/**
 * Order Service
 * Handles creating orders, listening to order updates in real-time,
 * and updating order statuses (for admins).
 * 
 * Status flow: placed → confirmed → preparing → ready → out_for_delivery → delivered
 * Each status change is logged in the statusHistory array.
 */
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Reference to the orders collection
const ordersRef = collection(db, 'orders');

// Valid statuses in order
export const STATUS_FLOW = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered'
];

// Human-readable labels for each status
export const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

// Icons for each status
export const STATUS_ICONS = {
  placed: '📝',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '📦',
  out_for_delivery: '🛵',
  delivered: '🎉',
  cancelled: '❌'
};

/**
 * Generate a short order number like "BT-1A2B3C"
 */
function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BT-${code}`;
}

/**
 * Place a new order — saves to Firestore with status "placed"
 * Includes statusHistory for timeline tracking.
 * @param {string} customerId - The authenticated user's UID
 * @param {string} customerName - Display name of the customer
 * @param {string} customerEmail - Email of the customer
 * @param {Array} items - Array of cart items: { id, name, price, quantity, img }
 * @param {number} total - Total amount including delivery
 * @param {Object} deliveryDetails - { place, phone, deliveryZone, deliveryFee, date, time }
 * @returns {string} The new order document ID
 */
export async function placeOrder(customerId, customerName, customerEmail, items, total, deliveryDetails) {
  const now = Timestamp.now();

  const orderData = {
    orderNumber: generateOrderNumber(),
    customerId,
    customerName,
    customerEmail,
    customerPhone: deliveryDetails.phone || '',
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      img: item.img || ''
    })),
    total,
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    deliveryFee: deliveryDetails.deliveryFee || 0,
    deliveryAddress: deliveryDetails.place || '',
    // Delivery location data (from geolocation-based delivery check)
    latitude: deliveryDetails.latitude || null,
    longitude: deliveryDetails.longitude || null,
    distance: deliveryDetails.distance || null,
    deliveryCharge: typeof deliveryDetails.deliveryCharge === 'number' ? deliveryDetails.deliveryCharge : (deliveryDetails.deliveryFee || 0),
    deliveryDetails: {
      place: deliveryDetails.place || '',
      phone: deliveryDetails.phone || '',
      deliveryZone: deliveryDetails.deliveryZone || 'within100',
      deliveryFee: deliveryDetails.deliveryFee || 0,
      date: deliveryDetails.date || '',
      time: deliveryDetails.time || '',
      // Location fields stored inside deliveryDetails as well
      latitude: deliveryDetails.latitude || null,
      longitude: deliveryDetails.longitude || null,
      distance: deliveryDetails.distance || null,
      deliveryCharge: typeof deliveryDetails.deliveryCharge === 'number' ? deliveryDetails.deliveryCharge : null,
    },
    status: 'placed',
    statusHistory: [
      { status: 'placed', timestamp: now }
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(ordersRef, orderData);
  return docRef.id;
}

/**
 * Create a manual order directly from the Admin Panel
 * @param {Object} orderPayload
 * @returns {Object} { id, orderNumber }
 */
export async function createManualOrder(orderPayload) {
  const now = Timestamp.now();
  const orderNumber = generateOrderNumber();

  const orderData = {
    orderNumber,
    customerId: 'admin_manual',
    isManualOrder: true,
    customerName: orderPayload.customerName || 'Walk-in Customer',
    customerEmail: orderPayload.customerEmail || '',
    customerPhone: orderPayload.customerPhone || '',
    orderType: orderPayload.orderType || 'dine_in', // dine_in, takeaway, delivery
    tableNumber: orderPayload.tableNumber || '',
    items: orderPayload.items.map(item => ({
      id: item.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      img: item.img || ''
    })),
    subtotal: Number(orderPayload.subtotal || 0),
    deliveryFee: Number(orderPayload.deliveryFee || 0),
    total: Number(orderPayload.total || 0),
    paymentMethod: orderPayload.paymentMethod || 'Cash', // Cash, UPI, Card, Pending
    paymentStatus: orderPayload.paymentStatus || 'Paid', // Paid, Pending
    deliveryAddress: orderPayload.deliveryAddress || (orderPayload.orderType === 'dine_in' ? `Table ${orderPayload.tableNumber || 'N/A'}` : 'In-Store Counter'),
    deliveryDetails: {
      place: orderPayload.deliveryAddress || '',
      phone: orderPayload.customerPhone || '',
      orderType: orderPayload.orderType || 'dine_in',
      tableNumber: orderPayload.tableNumber || '',
      deliveryZone: orderPayload.orderType === 'delivery' ? 'manual' : 'in_store',
      deliveryFee: Number(orderPayload.deliveryFee || 0),
      notes: orderPayload.notes || ''
    },
    status: orderPayload.status || 'confirmed',
    statusHistory: [
      { status: orderPayload.status || 'confirmed', timestamp: now }
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(ordersRef, orderData);
  return { id: docRef.id, orderNumber };
}

// ─── Backend API URL ────────────────────────────────────────────
// Points to the Express backend on Render (production) or localhost (dev).
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BACKEND_URL = rawBackendUrl.replace(/\/$/, '');

/**
 * Place a new order via the Express backend (with email notification).
 *
 * This function sends the order data to the Express backend, which:
 *   1. Validates the data
 *   2. Saves the order to Firestore
 *   3. Sends an email notification to the admin
 *   4. Returns the order ID
 *
 * If the backend is unreachable, it falls back to the original
 * placeOrder() function (direct Firestore write, no email).
 *
 * @param {string} customerId - The authenticated user's UID
 * @param {string} customerName - Display name of the customer
 * @param {string} customerEmail - Email of the customer
 * @param {Array} items - Array of cart items: { id, name, price, quantity, img }
 * @param {number} total - Total amount including delivery
 * @param {Object} deliveryDetails - { place, phone, deliveryZone, deliveryFee, date, time, notes }
 * @returns {string} The new order document ID
 */
export async function placeOrderWithEmail(customerId, customerName, customerEmail, items, total, deliveryDetails) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        customerName,
        customerEmail,
        items,
        total,
        deliveryDetails,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Backend returned an error');
    }

    return data.orderId;
  } catch (error) {
    console.warn('[orderService] Backend call failed, using direct Firestore write:', error.message);

    // Fallback: use original placeOrder (no email, but order is saved)
    return placeOrder(customerId, customerName, customerEmail, items, total, deliveryDetails);
  }
}

/**
 * Listen to ALL orders in real-time (for admin dashboard)
 * Orders are sorted by createdAt descending (newest first).
 * @param {Function} callback - Called with array of order objects
 * @param {string|null} statusFilter - Optional: filter by status
 * @param {Function|null} onError - Optional: error handler
 * @returns {Function} Unsubscribe function
 */
export function listenToOrders(callback, statusFilter = null, onError = null) {
  let q;

  if (statusFilter && statusFilter !== 'all') {
    q = query(
      ordersRef,
      where('status', '==', statusFilter)
    );
  } else {
    q = query(ordersRef, orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    let orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter out orders that the admin has "deleted" (hidden)
    orders = orders.filter(order => !order.adminHidden);

    // Sort client-side to avoid needing a composite index
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds * 1000 || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds * 1000 || 0);
      return timeB - timeA;
    });

    callback(orders);
  }, (error) => {
    console.error('[orderService] Error listening to orders:', error);
    if (onError) onError(error);
    else callback([]);
  });
}

/**
 * Listen to a specific customer's orders in real-time
 * @param {string} customerId - The customer's UID
 * @param {Function} callback - Called with array of order objects
 * @param {Function|null} onError - Optional: error handler
 * @returns {Function} Unsubscribe function
 */
export function listenToCustomerOrders(customerId, callback, onError = null) {
  const q = query(
    ordersRef,
    where('customerId', '==', customerId)
  );

  return onSnapshot(q, (snapshot) => {
    let orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter out orders that the customer has cleared (hidden)
    orders = orders.filter(order => !order.customerHidden);

    // Sort client-side to avoid needing a composite index
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds * 1000 || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds * 1000 || 0);
      return timeB - timeA;
    });

    callback(orders);
  }, (error) => {
    console.error(`[orderService] Error for customer ${customerId}:`, error);
    if (onError) onError(error);
    else callback([]);
  });
}

/**
 * Get a single order by its document ID
 * @param {string} orderId 
 * @returns {Object|null} Order data or null if not found
 */
export async function getOrderById(orderId) {
  const docSnap = await getDoc(doc(db, 'orders', orderId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Listen to a single order in real-time (for order tracking page)
 * @param {string} orderId 
 * @param {Function} callback - Called with order object
 * @param {Function|null} onError - Optional: error handler
 * @returns {Function} Unsubscribe function
 */
export function listenToOrder(orderId, callback, onError = null) {
  return onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
    if (docSnap.exists()) {
      const orderData = { id: docSnap.id, ...docSnap.data() };
      callback(orderData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`[orderService] Error for order ${orderId}:`, error);
    if (onError) onError(error);
  });
}

/**
 * Update the status of an order (admin action)
 * Appends to statusHistory with timestamp for timeline tracking.
 * @param {string} orderId 
 * @param {string} newStatus 
 */
export async function updateOrderStatus(orderId, newStatus, cancelledBy = null) {
  const allStatuses = [...STATUS_FLOW, 'cancelled'];
  if (!allStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const updateData = {
    status: newStatus,
    statusHistory: arrayUnion({
      status: newStatus,
      timestamp: Timestamp.now()
    }),
    updatedAt: serverTimestamp()
  };

  if (newStatus === 'cancelled' && cancelledBy) {
    updateData.cancelledBy = cancelledBy;
  }

  await updateDoc(doc(db, 'orders', orderId), updateData);
}

/**
 * Get the next status in the flow
 * @param {string} currentStatus 
 * @returns {string|null} Next status or null if at end
 */
export function getNextStatus(currentStatus) {
  const index = STATUS_FLOW.indexOf(currentStatus);
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

/**
 * Hide all orders from the admin portal (soft delete).
 * Customers will still see their orders.
 */
export async function deleteAllOrders() {
  const querySnapshot = await getDocs(ordersRef);
  const promises = [];
  querySnapshot.forEach((document) => {
    promises.push(updateDoc(doc(db, 'orders', document.id), { adminHidden: true }));
  });
  await Promise.all(promises);
}

/**
 * Hide a specific order from the admin portal (soft delete).
 * @param {string} orderId
 */
export async function deleteOrderForAdmin(orderId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/hide-admin-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) return;
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  } catch (err) {
    console.warn('[orderService] deleteOrderForAdmin backend call failed:', err.message || err);
  }

  try {
    await updateDoc(doc(db, 'orders', orderId), { adminHidden: true });
  } catch (firestoreErr) {
    console.warn('[orderService] Client update restricted:', firestoreErr.message);
  }
}

/**
 * Hide all completed or cancelled orders for a specific customer.
 * @param {string} customerId 
 */
export async function clearPastCustomerOrders(customerId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/clear-past-customer-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });
    if (res.ok) return;
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  } catch (err) {
    console.warn('[orderService] clearPastCustomerOrders backend call failed:', err.message || err);
  }

  try {
    const q = query(ordersRef, where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    const promises = [];
    querySnapshot.forEach((document) => {
      const data = document.data();
      if (data.status === 'delivered' || data.status === 'cancelled') {
        promises.push(updateDoc(doc(db, 'orders', document.id), { customerHidden: true }));
      }
    });
    await Promise.all(promises);
  } catch (firestoreErr) {
    console.warn('[orderService] Client update restricted:', firestoreErr.message);
  }
}

/**
 * Hide a specific order for a customer.
 * @param {string} orderId 
 */
export async function hideCustomerOrder(orderId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/hide-customer-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) return;
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  } catch (err) {
    console.warn('[orderService] hideCustomerOrder backend call failed:', err.message || err);
  }

  try {
    await updateDoc(doc(db, 'orders', orderId), { customerHidden: true });
  } catch (firestoreErr) {
    console.warn('[orderService] Client update restricted:', firestoreErr.message);
  }
}

/**
 * Hide all completed or cancelled orders from the admin history portal.
 */
export async function clearAdminHistory() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/clear-admin-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) return;
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  } catch (err) {
    console.warn('[orderService] clearAdminHistory backend call failed:', err.message || err);
  }

  try {
    const querySnapshot = await getDocs(ordersRef);
    const promises = [];
    querySnapshot.forEach((document) => {
      const data = document.data();
      if (data.status === 'delivered' || data.status === 'cancelled') {
        if (!data.adminHidden) {
          promises.push(updateDoc(doc(db, 'orders', document.id), { adminHidden: true }));
        }
      }
    });
    await Promise.all(promises);
  } catch (firestoreErr) {
    console.warn('[orderService] Client update restricted:', firestoreErr.message);
  }
}
