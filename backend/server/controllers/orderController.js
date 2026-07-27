/**
 * Order Controller
 *
 * Handles the POST /api/orders endpoint.
 * Orchestrates: Validate → Save to Firestore → Send Email → Respond.
 *
 * Error handling strategy:
 *   - If Firestore fails → return error, do NOT send email
 *   - If Firestore succeeds but email fails → order is saved, log error, return success
 *   - Customer never loses their order because of an email issue
 */
const { db } = require('../config/firebase');
const { sendOrderNotification } = require('../services/emailService');
const admin = require('firebase-admin');

/**
 * Generate a short order number like "BT-1A2B3C"
 * Must match the frontend's generateOrderNumber() format exactly.
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
 * Create a new order
 * POST /api/orders
 */
async function createOrder(req, res) {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      items,
      total,
      deliveryDetails,
    } = req.body;

    // ── 1. Build order data matching existing Firestore schema ──
    const now = admin.firestore.Timestamp.now();
    const orderNumber = generateOrderNumber();

    const orderData = {
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone: deliveryDetails.phone || '',
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        img: item.img || '',
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
        notes: deliveryDetails.notes || '',
        // Location fields stored inside deliveryDetails as well
        latitude: deliveryDetails.latitude || null,
        longitude: deliveryDetails.longitude || null,
        distance: deliveryDetails.distance || null,
        deliveryCharge: typeof deliveryDetails.deliveryCharge === 'number' ? deliveryDetails.deliveryCharge : null,
      },
      status: 'placed',
      statusHistory: [{ status: 'placed', timestamp: now }],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // ── 2. Save order to Firestore ──
    console.log(`📋 Saving order for ${customerName} (${customerEmail})...`);
    let docRef;
    try {
      docRef = await db.collection('orders').add(orderData);
    } catch (firestoreError) {
      console.error('❌ Firestore error — order NOT saved:', firestoreError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save order. Please try again.',
        error: firestoreError.message,
      });
    }

    const orderId = docRef.id;
    console.log(`✅ Order saved to Firestore — ID: ${orderId}, Number: ${orderNumber}`);

    // ── 3. Send email notification (fire-and-forget on failure) ──
    // Email failure must NOT affect the order. We log errors but return success.
    const emailData = {
      ...orderData,
      orderId,
      specialInstructions: deliveryDetails.notes || '',
      createdAt: new Date(),
    };

    const emailResult = await sendOrderNotification(emailData);

    if (emailResult.success) {
      console.log(`📧 Notification email sent for order ${orderNumber}`);
    } else {
      // Log the failure but do NOT return an error to the customer
      console.error(`⚠️  Email notification failed for order ${orderNumber}:`, emailResult.error);
      console.error('   Order is saved. Email can be resent manually.');
    }

    // ── 4. Return success to the customer ──
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      orderNumber,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('❌ Unexpected error in createOrder:', error.message);
    console.error('   Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

/**
 * Hide a specific order for a customer (using Admin SDK)
 * POST /api/orders/hide-customer-order
 */
async function hideCustomerOrder(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    await db.collection('orders').doc(orderId).update({ customerHidden: true });
    return res.status(200).json({ success: true, message: 'Order hidden for customer' });
  } catch (error) {
    console.error('Error in hideCustomerOrder:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Clear all past (delivered/cancelled) orders for a customer
 * POST /api/orders/clear-past-customer-orders
 */
async function clearPastCustomerOrders(req, res) {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'customerId is required' });
    }

    const snapshot = await db.collection('orders')
      .where('customerId', '==', customerId)
      .get();

    const batch = db.batch();
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'delivered' || data.status === 'cancelled') {
        batch.update(docSnap.ref, { customerHidden: true });
      }
    });

    await batch.commit();
    return res.status(200).json({ success: true, message: 'Past orders cleared for customer' });
  } catch (error) {
    console.error('Error in clearPastCustomerOrders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Hide a specific order for admin
 * POST /api/orders/hide-admin-order
 */
async function hideAdminOrder(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    await db.collection('orders').doc(orderId).update({ adminHidden: true });
    return res.status(200).json({ success: true, message: 'Order hidden for admin' });
  } catch (error) {
    console.error('Error in hideAdminOrder:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Clear past history for admin
 * POST /api/orders/clear-admin-history
 */
async function clearAdminHistory(req, res) {
  try {
    const snapshot = await db.collection('orders').get();
    const batch = db.batch();
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if ((data.status === 'delivered' || data.status === 'cancelled') && !data.adminHidden) {
        batch.update(docSnap.ref, { adminHidden: true });
      }
    });

    await batch.commit();
    return res.status(200).json({ success: true, message: 'Admin history cleared' });
  } catch (error) {
    console.error('Error in clearAdminHistory:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createOrder,
  hideCustomerOrder,
  clearPastCustomerOrders,
  hideAdminOrder,
  clearAdminHistory,
};
