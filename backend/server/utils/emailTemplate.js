/**
 * Email Template Generator
 *
 * Builds a professional, responsive HTML email for new order notifications.
 * Styled to match Break Time Cafe's exact website theme:
 *   - Primary Orange: #FC8019
 *   - Dark Charcoal: #1C1C1C
 *   - Soft Light Orange Tint: #FFF4EB
 *   - Clean Light Background: #F8F8F8
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date
 * @returns {string} e.g., "26 July 2026, 08:45 PM"
 */
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Generate the complete HTML email for an order notification
 * matching the Break Time website UI branding.
 *
 * @param {Object} orderData - The full order data object
 * @returns {string} Complete HTML email string
 */
function generateOrderEmailHTML(orderData) {
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
    specialInstructions,
    createdAt,
    latitude,
    longitude,
    distance,
    deliveryCharge,
  } = orderData;

  // Build the items table rows with item images
  const itemRows = items
    .map((item) => {
      const imgUrl = item.img || item.imageUrl || '';
      let imgHtml = '';

      if (imgUrl && (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:'))) {
        imgHtml = `<img src="${imgUrl}" alt="${item.name}" width="48" height="48" class="email-item-img" style="width: 48px; height: 48px; min-width: 48px; min-height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E5E5; display: block; margin: 0 auto;" />`;
      } else {
        imgHtml = `<div class="email-item-img-placeholder" style="width: 48px; height: 48px; min-width: 48px; min-height: 48px; background-color: #FFF4EB; border: 1px solid #FED7AA; border-radius: 8px; text-align: center; font-size: 20px; line-height: 48px; margin: 0 auto;">🍽️</div>`;
      }

      return `
      <tr>
        <td class="email-cell-padding" style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; width: 56px; vertical-align: middle; text-align: center;">
          ${imgHtml}
        </td>
        <td class="email-cell-padding" style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1C1C1C; font-weight: 600; vertical-align: middle;">
          ${item.name}
        </td>
        <td class="email-cell-padding" style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #666666; text-align: center; vertical-align: middle; font-weight: 500;">
          ${item.quantity}
        </td>
        <td class="email-cell-padding" style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #666666; text-align: right; vertical-align: middle;">
          ₹${item.price}
        </td>
        <td class="email-cell-padding" style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1C1C1C; text-align: right; vertical-align: middle; font-weight: 700;">
          ₹${item.price * item.quantity}
        </td>
      </tr>`;
    })
    .join('');

  // Items summary for quick glance
  const itemsSummary = items.map((item) => `${item.quantity} × ${item.name}`).join(', ');

  // Delivery address & timing display
  const address = deliveryAddress || deliveryDetails.place || 'N/A';
  const phone = customerPhone || deliveryDetails.phone || 'N/A';
  const notes = specialInstructions || deliveryDetails.notes || '';
  const reqDate = deliveryDetails.date || '';
  const reqTime = deliveryDetails.time || '';
  const fullDateTime = deliveryDetails.deliveryDateTime || '';
  let requestedDelivery = fullDateTime || 'As soon as possible (ASAP)';
  if (!fullDateTime && (reqDate || reqTime)) {
    requestedDelivery = `${reqDate ? reqDate : 'Today'}${reqTime ? ' at ' + reqTime : ''}`;
  }

  const orderTime = formatDate(createdAt || new Date());
  const displayOrderId = orderNumber || (orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : 'N/A');
  const calculatedDeliveryFee = deliveryFee ?? deliveryDetails.deliveryFee ?? 0;
  const rawFrontendUrl = process.env.FRONTEND_URL || 'https://breaktime0.netlify.app';
  const frontendUrl = rawFrontendUrl.replace(/\/$/, '');
  const adminOrderUrl = orderId ? `${frontendUrl}/admin/orders/${orderId}` : `${frontendUrl}/admin/orders`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - Break Time Cafe</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-main-table { width: 100% !important; border-radius: 0 !important; }
      .email-pad-mobile { padding: 14px 12px !important; }
      .email-item-img { width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; }
      .email-item-img-placeholder { width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; font-size: 16px !important; line-height: 40px !important; }
      .email-cell-padding { padding: 8px 4px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F8F8; font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Wrapper Table -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F8F8; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table class="email-main-table" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E5E5;">

          <!-- ═══════════════════════════════════════════ -->
          <!-- HEADER — Brand Bar                          -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 24px 20px; text-align: center; border-bottom: 3px solid #FC8019;">
              <!-- Logo Text -->
              <h1 style="margin: 0 0 6px; font-size: 30px; font-weight: 800; letter-spacing: 0.5px;">
                <span style="color: #1C1C1C;">BREAK</span> <span style="color: #FC8019;">TIME</span>
              </h1>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #FC8019; letter-spacing: 2px; text-transform: uppercase; background-color: #FFF4EB; display: inline-block; padding: 4px 14px; border-radius: 20px;">
                Delicious Food, Delivered Fast
              </p>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- ALERT BAR — New Order Received             -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="background: linear-gradient(135deg, #FC8019 0%, #E5730F 100%); padding: 14px 24px; text-align: center;">
              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                🍽 NEW ORDER RECEIVED
              </p>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- ORDER ID & TIME BADGE                       -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 24px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #FFF4EB; border-radius: 12px; padding: 18px 20px; border: 1px solid #FED7AA;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 50%;">
                          <p style="margin: 0 0 4px; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Order ID</p>
                          <p style="margin: 0; font-size: 20px; font-weight: 800; color: #FC8019; font-family: 'Courier New', monospace;">${displayOrderId}</p>
                        </td>
                        <td style="width: 50%; text-align: right;">
                          <p style="margin: 0 0 4px; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Order Time</p>
                          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1C1C1C;">${orderTime}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- CUSTOMER INFORMATION CARD                    -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #E5E5E5; overflow: hidden;">
                <tr>
                  <td style="background-color: #1C1C1C; padding: 10px 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">👤 Customer Information</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666666; width: 100px;">Name</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1C1C1C; font-weight: 700;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666666;">Email</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1C1C1C;">${customerEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666666;">Phone</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #FC8019; font-weight: 700;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666666; width: 100px; vertical-align: top;">Delivery Time</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #FC8019; font-weight: 700;">
                          <span style="white-space: nowrap; display: inline-block;">📅 ${requestedDelivery}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666666; vertical-align: top;">Address</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1C1C1C; font-weight: 500;">${address}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- ORDER ITEMS TABLE                           -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #E5E5E5; overflow: hidden;">
                <tr>
                  <td style="background-color: #1C1C1C; padding: 10px 16px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">🛒 Ordered Items</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <!-- Table Header -->
                      <tr style="background-color: #FFF4EB;">
                        <td class="email-cell-padding" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #FC8019; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #FED7AA; width: 56px; text-align: center;">Item</td>
                        <td class="email-cell-padding" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #FC8019; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #FED7AA;">Name</td>
                        <td class="email-cell-padding" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #FC8019; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #FED7AA;">Qty</td>
                        <td class="email-cell-padding" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #FC8019; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border-bottom: 2px solid #FED7AA;">Price</td>
                        <td class="email-cell-padding" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #FC8019; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border-bottom: 2px solid #FED7AA;">Total</td>
                      </tr>
                      <!-- Item Rows -->
                      ${itemRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- FINANCIAL SUMMARY                           -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F8F8; border-radius: 12px; border: 1px solid #E5E5E5; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666666;">Subtotal</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1C1C1C; text-align: right; font-weight: 600;">₹${subtotal}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666666;">Delivery Charge</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1C1C1C; text-align: right; font-weight: 600;">${calculatedDeliveryFee === 0 ? '<span style="color: #16A34A; font-weight: 700;">FREE</span>' : `₹${calculatedDeliveryFee}`}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #666666;">Payment Method</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #1C1C1C; text-align: right; font-weight: 600;">Cash on Delivery</td>
                      </tr>
                      <!-- Dashed Divider -->
                      <tr>
                        <td colspan="2" style="padding: 10px 0 2px;">
                          <div style="border-top: 2px dashed #D1D5DB;"></div>
                        </td>
                      </tr>
                      <!-- Grand Total -->
                      <tr>
                        <td style="padding: 12px 0 4px; font-size: 18px; font-weight: 800; color: #1C1C1C;">Grand Total</td>
                        <td style="padding: 12px 0 4px; font-size: 24px; font-weight: 800; color: #FC8019; text-align: right;">₹${total}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${notes
      ? `
          <!-- ═══════════════════════════════════════════ -->
          <!-- SPECIAL INSTRUCTIONS                        -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF4EB; border-radius: 12px; border: 1px solid #FED7AA; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #FC8019; text-transform: uppercase; letter-spacing: 1px;">📝 Special Instructions</p>
                    <p style="margin: 0; font-size: 14px; color: #1C1C1C; line-height: 1.5; font-weight: 500;">${notes}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
      : ''
    }

          <!-- ═══════════════════════════════════════════ -->
          <!-- QUICK SUMMARY BAR                           -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 20px 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF4EB; border-radius: 12px; border: 1px solid #FED7AA;">
                <tr>
                  <td style="padding: 14px 16px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #1C1C1C; line-height: 1.6;">
                      <strong style="color: #FC8019;">${items.length} item${items.length > 1 ? 's' : ''}</strong> — ${itemsSummary}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- ADMIN CTA — Open Order Status Control       -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 24px 24px 8px; text-align: center;">
              <a href="${adminOrderUrl}" target="_blank" style="display: inline-block; background-color: #FC8019; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(252, 128, 25, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                Check The Order 
              </a>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!-- FOOTER                                      -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="padding: 28px 24px 24px; text-align: center; border-top: 1px solid #E5E5E5; margin-top: 20px;">
              <p style="margin: 0 0 4px; font-size: 16px; font-weight: 800;">
                <span style="color: #1C1C1C;">BREAK</span> <span style="color: #FC8019;">TIME</span>
              </p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #666666;">Est. in Your Neighbourhood • Delicious Food, Delivered Fast</p>
              <p style="margin: 0; font-size: 11px; color: #999999;">
                This is an automated order notification.
              </p>
            </td>
          </tr>

        </table>
        <!-- End Main Container -->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { generateOrderEmailHTML };
