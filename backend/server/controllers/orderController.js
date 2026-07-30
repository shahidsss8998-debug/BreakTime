/**
 * Order Controller
 *
 * Handles POST /api/orders and POST /api/orders/send-email endpoints.
 * Orchestrates: Save to Firestore → Trigger Email → Respond.
 */
const { db } = require('../config/firebase');
const { sendOrderNotification } = require('../services/emailService');
const admin = require('firebase-admin');

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

    const emailData = {
      ...orderData,
      orderId,
      specialInstructions: deliveryDetails.notes || '',
      createdAt: new Date(),
    };

    sendOrderNotification(emailData)
      .then((emailResult) => {
        if (emailResult.success) {
          console.log(`📧 Notification email sent for order ${orderNumber}`);
        } else {
          console.error(`⚠️ Email notification failed for order ${orderNumber}:`, emailResult.error);
        }
      })
      .catch((err) => {
        console.error(`⚠️ Unhandled error in sendOrderNotification for order ${orderNumber}:`, err);
      });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      orderNumber,
      emailSent: 'pending',
    });
  } catch (error) {
    console.error('❌ Unexpected error in createOrder:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

/**
 * Send email notification for an order (Background Fast-Path)
 * POST /api/orders/send-email
 */
async function sendOrderEmailNotification(req, res) {
  try {
    const {
      orderId,
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      items,
      total,
      deliveryDetails = {},
    } = req.body;

    const emailData = {
      orderId: orderId || 'N/A',
      orderNumber: orderNumber || 'New',
      customerId,
      customerName,
      customerEmail,
      items: items || [],
      total: total || 0,
      subtotal: items ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : total,
      deliveryFee: deliveryDetails.deliveryFee || 0,
      deliveryAddress: deliveryDetails.place || '',
      deliveryDetails,
      specialInstructions: deliveryDetails.notes || '',
      createdAt: new Date(),
    };

    sendOrderNotification(emailData)
      .then((emailResult) => {
        if (emailResult.success) {
          console.log(`📧 Notification email sent for fast-path order ${orderId}`);
        } else {
          console.error(`⚠️ Fast-path email notification failed for order ${orderId}:`, emailResult.error);
        }
      })
      .catch((err) => {
        console.error(`⚠️ Error in sendOrderNotification for order ${orderId}:`, err);
      });

    return res.status(200).json({ success: true, message: 'Email notification triggered' });
  } catch (error) {
    console.error('Error in sendOrderEmailNotification:', error);
    return res.status(500).json({ success: false, message: error.message });
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
  sendOrderEmailNotification,
  hideCustomerOrder,
  clearPastCustomerOrders,
  hideAdminOrder,
  clearAdminHistory,
};
