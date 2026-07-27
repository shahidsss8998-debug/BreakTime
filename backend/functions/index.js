/**
 * Firebase Cloud Functions for Raihan Cafe
 *
 * These functions handle server-side tasks:
 * - Order validation on creation
 * - Admin role verification
 * - Optional notification triggers
 */
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

/**
 * Trigger: When a new order is created in Firestore.
 * Validates order data and logs the order for monitoring.
 * Can be extended to send email/push notifications.
 */
exports.onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const orderData = snapshot.data();
  const orderId = event.params.orderId;

  console.log(`📋 New order received: ${orderId}`);
  console.log(`   Customer: ${orderData.customerName} (${orderData.customerEmail})`);
  console.log(`   Items: ${orderData.items?.length || 0} items`);
  console.log(`   Total: ₹${orderData.total}`);
  console.log(`   Status: ${orderData.status}`);

  // Validate the order has required fields
  if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
    console.error(`❌ Invalid order ${orderId}: missing required fields`);
    // Optionally delete or flag the invalid order
    return;
  }

  // Validate total matches items
  const calculatedSubtotal = orderData.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

  if (calculatedSubtotal !== orderData.subtotal) {
    console.warn(
      `⚠️ Order ${orderId}: subtotal mismatch. ` +
      `Expected ₹${calculatedSubtotal}, got ₹${orderData.subtotal}`
    );
  }

  // Future: Send notification to admin devices, send confirmation email, etc.
});

/**
 * Callable Function: Check if a user is an admin.
 * Can be called from the frontend to verify admin status server-side.
 */
exports.checkAdminRole = onCall(async (request) => {
  // Ensure the caller is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  const uid = request.auth.uid;

  try {
    const adminDoc = await db.collection("admins").doc(uid).get();
    return { isAdmin: adminDoc.exists };
  } catch (error) {
    console.error("Error checking admin role:", error);
    throw new HttpsError("internal", "Failed to check admin status.");
  }
});

/**
 * Callable Function: Validate and place an order (server-side validation).
 * This provides an extra layer of validation beyond client-side checks.
 * Optional — orders can also be created directly from the client.
 */
exports.validateOrder = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in to place an order.");
  }

  const { items, total, deliveryDetails } = request.data;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "Order must contain at least one item.");
  }

  // Validate each item has required fields
  for (const item of items) {
    if (!item.name || !item.price || !item.quantity) {
      throw new HttpsError("invalid-argument", "Each item must have name, price, and quantity.");
    }
    if (item.price < 0 || item.quantity < 1) {
      throw new HttpsError("invalid-argument", "Invalid price or quantity.");
    }
  }

  // Validate total
  if (typeof total !== "number" || total < 0) {
    throw new HttpsError("invalid-argument", "Invalid total amount.");
  }

  return { valid: true, message: "Order validation passed." };
});
