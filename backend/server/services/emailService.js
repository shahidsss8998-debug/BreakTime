/**
 * Email Service
 *
 * Reusable service for sending order notification emails.
 * Separated from the controller for clean architecture and testability.
 * Handles errors gracefully — never throws, always returns a result object.
 */
const { transporter } = require('../config/mailConfig');
const { generateOrderEmailHTML } = require('../utils/emailTemplate');

/**
 * Send an order notification email to the restaurant admin.
 *
 * @param {Object} orderData - Complete order data for the email
 * @returns {{ success: boolean, messageId?: string, error?: string }}
 */
async function sendOrderNotification(orderData) {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '').trim().replace(/["']/g, '');
    const senderEmail = (process.env.EMAIL_USER || '').trim().replace(/["']/g, '');

    if (!senderEmail) {
      console.error('❌ EMAIL_USER not configured — cannot send email');
      return { success: false, error: 'EMAIL_USER not configured' };
    }

    // Build the email content
    const htmlContent = generateOrderEmailHTML(orderData);
    const orderNumber = orderData.orderNumber || orderData.orderId || 'New';

    const mailOptions = {
      from: `"Break Time Cafe" <${senderEmail}>`,
      to: adminEmail,
      subject: `🍽 New Order Received — ${orderNumber}`,
      html: htmlContent,
      // Plain text fallback for email clients that don't support HTML
      text: buildPlainText(orderData),
    };

    console.log(`📧 Sending order notification email to ${adminEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully — Message ID: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('   Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Build a plain-text fallback of the order notification
 * @param {Object} orderData
 * @returns {string}
 */
function buildPlainText(orderData) {
  const {
    orderNumber,
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    items = [],
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    deliveryDetails = {},
    latitude,
    longitude,
    distance,
    deliveryCharge,
  } = orderData;

  const displayId = orderNumber || (orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : 'N/A');
  const address = deliveryAddress || deliveryDetails.place || 'N/A';
  const phone = customerPhone || deliveryDetails.phone || 'N/A';
  const itemsList = items.map((item) => `  ${item.quantity} × ${item.name} — ₹${item.price * item.quantity}`).join('\n');
  const charge = deliveryCharge ?? deliveryFee ?? 0;

  // Build location info section (only if coordinates are available)
  const locationInfo = (latitude && longitude) ? `
━━━━ Delivery Location ━━━━
Distance: ${distance != null ? `${distance} meters` : 'N/A'}
Delivery Charge: ${charge === 0 ? 'FREE' : `₹${charge}`}
Latitude: ${latitude}
Longitude: ${longitude}
` : '';

  return `
🍽 NEW ORDER RECEIVED — Break Time Cafe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${displayId}

Customer: ${customerName}
Email: ${customerEmail}
Phone: ${phone}
Address: ${address}
${locationInfo}
━━━━ Items ━━━━
${itemsList}

━━━━ Total ━━━━
Subtotal: ₹${subtotal}
Delivery: ${charge === 0 ? 'FREE' : `₹${charge}`}
Grand Total: ₹${total}

Payment: Cash on Delivery
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from Break Time Cafe.
  `.trim();
}

module.exports = { sendOrderNotification };
