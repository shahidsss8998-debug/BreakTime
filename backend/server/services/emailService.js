/**
 * Email Service
 *
 * Reusable service for sending order notification emails.
 * Supports:
 *   1. Resend HTTPS API (Port 443 - Recommended for Render)
 *   2. Brevo HTTPS API (Port 443 - Fallback)
 *   3. Gmail SMTP Transporter (Port 587 / 465)
 *
 * Handles errors gracefully — never throws, always returns a result object.
 */
const { transporter, fallbackTransporter } = require('../config/mailConfig');
const { generateOrderEmailHTML } = require('../utils/emailTemplate');

/**
 * Send an order notification email to the restaurant admin.
 *
 * @param {Object} orderData - Complete order data for the email
 * @returns {{ success: boolean, messageId?: string, provider?: string, error?: string }}
 */
async function sendOrderNotification(orderData) {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '').trim().replace(/["']/g, '');
    const senderEmail = (process.env.EMAIL_USER || '').trim().replace(/["']/g, '');

    const htmlContent = generateOrderEmailHTML(orderData);
    const orderNumber = orderData.orderNumber || orderData.orderId || 'New';
    const textContent = buildPlainText(orderData);

    // ── Mode 1: Resend HTTPS API (Port 443 — NEVER BLOCKED BY RENDER) ──
    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    if (resendApiKey) {
      console.log(`📧 Sending order notification via Resend HTTPS API...`);
      try {
        const resendFrom = (process.env.RESEND_FROM_EMAIL || 'Break Time Cafe <onboarding@resend.dev>').trim();
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resendFrom,
            to: [adminEmail || senderEmail],
            subject: `🍽 New Order Received — ${orderNumber}`,
            html: htmlContent,
            text: textContent,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok) {
          console.log(`✅ Email sent via Resend HTTPS API — ID: ${resendData.id}`);
          return { success: true, messageId: resendData.id, provider: 'Resend (HTTPS)' };
        } else {
          const errMsg = resendData.message || JSON.stringify(resendData);
          console.warn(`⚠️ Resend API returned error:`, errMsg);

          // Smart recovery: If Resend restricts recipients to account owner email, automatically deliver to owner email
          if (errMsg.includes('only send testing emails to your own email address')) {
            const ownerEmailMatch = errMsg.match(/\(([^)]+)\)/);
            const ownerEmail = ownerEmailMatch ? ownerEmailMatch[1] : senderEmail;
            if (ownerEmail) {
              console.log(`🔄 Resend testing mode active — delivering order notification to account owner (${ownerEmail})...`);
              const retryRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: resendFrom,
                  to: [ownerEmail],
                  subject: `🍽 New Order Received — ${orderNumber}`,
                  html: htmlContent,
                  text: textContent,
                }),
              });
              const retryData = await retryRes.json();
              if (retryRes.ok) {
                console.log(`✅ Email delivered to account owner ${ownerEmail} — ID: ${retryData.id}`);
                return { success: true, messageId: retryData.id, provider: `Resend (HTTPS to ${ownerEmail})` };
              }
            }
          }

          return { success: false, error: `Resend API Error: ${errMsg}`, provider: 'Resend (HTTPS)' };
        }
      } catch (resendErr) {
        console.warn(`⚠️ Resend HTTPS API call failed:`, resendErr.message);
        return { success: false, error: `Resend Fetch Failed: ${resendErr.message}`, provider: 'Resend (HTTPS)' };
      }
    }

    // ── Mode 2: Brevo HTTPS API (Port 443 — NEVER BLOCKED BY RENDER) ──
    const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
    if (brevoApiKey) {
      console.log(`📧 Sending order notification via Brevo HTTPS API...`);
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Break Time Cafe', email: senderEmail || adminEmail },
            to: [{ email: adminEmail || senderEmail }],
            subject: `🍽 New Order Received — ${orderNumber}`,
            htmlContent,
            textContent,
          }),
        });

        const brevoData = await brevoRes.json();
        if (brevoRes.ok) {
          console.log(`✅ Email sent via Brevo HTTPS API — Message ID: ${brevoData.messageId}`);
          return { success: true, messageId: brevoData.messageId, provider: 'Brevo (HTTPS)' };
        } else {
          console.warn(`⚠️ Brevo API returned error:`, brevoData.message || brevoData);
        }
      } catch (brevoErr) {
        console.warn(`⚠️ Brevo HTTPS API call failed:`, brevoErr.message);
      }
    }

    // ── Mode 3: Gmail SMTP (Ports 587 & 465) ──
    if (!senderEmail) {
      console.error('❌ EMAIL_USER not configured — cannot send email');
      return { success: false, error: 'EMAIL_USER not configured in environment variables' };
    }

    const mailOptions = {
      from: `"Break Time Cafe" <${senderEmail}>`,
      to: adminEmail || senderEmail,
      subject: `🍽 New Order Received — ${orderNumber}`,
      html: htmlContent,
      text: textContent,
    };

    console.log(`📧 Sending order notification email via Gmail SMTP to ${adminEmail}...`);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully via Port 587 — Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'Gmail SMTP (Port 587)' };
    } catch (primaryErr) {
      console.warn(`⚠️ Primary SMTP (Port 587) failed: ${primaryErr.message}. Trying Port 465 fallback...`);
      const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully via Port 465 — Message ID: ${fallbackInfo.messageId}`);
      return { success: true, messageId: fallbackInfo.messageId, provider: 'Gmail SMTP (Port 465)' };
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
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
