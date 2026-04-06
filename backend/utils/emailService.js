const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'uflixwebsite@gmail.com';
const MAIL_USER = process.env.EMAIL_USER;
const MAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
const LOCAL_LOGO_PATH = path.resolve(__dirname, '../../frontend/public/Logos/Uflix_Logo.png');
const DEFAULT_LOGO_URL = process.env.EMAIL_LOGO_URL || 'https://uflixfurniture.in/Logos/Uflix_Logo.png';

let inlineLogoAttachmentCache;

const getInlineLogoAttachment = () => {
  if (inlineLogoAttachmentCache !== undefined) {
    return inlineLogoAttachmentCache;
  }

  try {
    if (fs.existsSync(LOCAL_LOGO_PATH)) {
      inlineLogoAttachmentCache = {
        filename: 'uflix-logo.png',
        content: fs.readFileSync(LOCAL_LOGO_PATH),
        cid: 'uflix-logo',
        contentType: 'image/png',
      };
      return inlineLogoAttachmentCache;
    }
  } catch (error) {
    // Fallback to hosted logo URL when local file is unavailable
  }

  inlineLogoAttachmentCache = null;
  return inlineLogoAttachmentCache;
};

const getEmailLogoSrc = () => (getInlineLogoAttachment() ? 'cid:uflix-logo' : DEFAULT_LOGO_URL);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const currency = (value = 0) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const baseEmailLayout = ({ title, subtitle = '', body }) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#1f2937;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:22px 24px;background:linear-gradient(135deg,#0f172a,#1f2937);color:#ffffff;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
                    <tr>
                      <td style="vertical-align:middle;">
                        <img src="${getEmailLogoSrc()}" alt="UFLIX" width="118" style="display:block;height:auto;max-width:118px;border:0;" />
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:0;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
                  ${subtitle ? `<p style="margin:8px 0 0;font-size:14px;opacity:.92;">${escapeHtml(subtitle)}</p>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:22px 24px;">
                  ${body}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
                  UFLIX Interio | Premium Furniture & Metal Fabrication
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const orderSummaryTable = (order) => {
  const rows = (order.items || [])
    .map((item) => {
      const itemPrice = Number(item.discountPrice || item.price || 0);
      const lineTotal = itemPrice * Number(item.quantity || 0);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name || 'Item')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${Number(item.quantity || 0)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${currency(itemPrice)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${currency(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;border-collapse:separate;border-spacing:0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 12px;text-align:left;font-size:13px;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:13px;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;">Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

const customerOrderEmailHtml = ({ order, customerName, invoiceUrl }) =>
  baseEmailLayout({
    title: 'Hooray! Your order has been confirmed',
    subtitle: `Order ${order.orderNumber}`,
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(customerName)}, your order is now confirmed and we have started processing it.</p>

      <div style="margin:0 0 18px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        <p style="margin:0 0 6px;font-size:14px;"><strong>Order Number:</strong> ${escapeHtml(order.orderNumber || '')}</p>
        <p style="margin:0 0 6px;font-size:14px;"><strong>Payment Method:</strong> ${escapeHtml(String(order.paymentMethod || '').toUpperCase())}</p>
        <p style="margin:0;font-size:14px;"><strong>Total:</strong> ${currency(order.totalPrice)}</p>
      </div>

      <h3 style="margin:0 0 10px;font-size:16px;">Order Details</h3>
      ${orderSummaryTable(order)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#374151;">Subtotal</td>
          <td style="padding:4px 0;font-size:14px;color:#111827;text-align:right;">${currency(order.itemsPrice)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:#374151;">Shipping</td>
          <td style="padding:4px 0;font-size:14px;color:#111827;text-align:right;">${order.shippingPrice > 0 ? currency(order.shippingPrice) : 'FREE'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0 0;font-size:16px;color:#111827;"><strong>Grand Total</strong></td>
          <td style="padding:6px 0 0;font-size:16px;color:#111827;text-align:right;"><strong>${currency(order.totalPrice)}</strong></td>
        </tr>
      </table>

      ${invoiceUrl ? `<p style="margin:16px 0 0;font-size:14px;">Invoice link: <a href="${escapeHtml(invoiceUrl)}" target="_blank" rel="noreferrer" style="color:#0f766e;">Download invoice</a></p>` : ''}
      <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">You will receive another email when your order is shipped.</p>
    `,
  });

const adminOrderEmailHtml = ({ order, customerName, customerEmail }) =>
  baseEmailLayout({
    title: 'New Order Received',
    subtitle: order.orderNumber,
    body: `
      <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        <p style="margin:0 0 6px;font-size:14px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        ${customerEmail ? `<p style="margin:0 0 6px;font-size:14px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>` : ''}
        <p style="margin:0;font-size:14px;"><strong>Total:</strong> ${currency(order.totalPrice)}</p>
      </div>

      <h3 style="margin:0 0 10px;font-size:16px;">Items</h3>
      ${orderSummaryTable(order)}

      <p style="margin:14px 0 0;font-size:14px;color:#6b7280;">Please review this order in the admin panel.</p>
    `,
  });

const getFromAddress = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'UFLIX';
  const fromEmail = process.env.EMAIL_FROM || MAIL_USER;
  return `${fromName} <${fromEmail}>`;
};

const sendEmail = async (options) => {
  if (!options?.to) return;
  const attachments = [...(options.attachments || [])];
  if (options.html?.includes('cid:uflix-logo')) {
    const inlineLogoAttachment = getInlineLogoAttachment();
    if (inlineLogoAttachment && !attachments.some((att) => att.cid === 'uflix-logo')) {
      attachments.push(inlineLogoAttachment);
    }
  }

  const mailOptions = {
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments,
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderPlacedNotifications = async ({ order, customer, invoice }) => {
  const customerName = customer?.name || 'Customer';
  const customerEmail = customer?.email || '';

  // Admin notification
  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Order Received | ${order.orderNumber}`,
    html: adminOrderEmailHtml({
      order,
      customerName,
      customerEmail,
    }),
  });

  // Customer confirmation (only if email entered)
  if (customerEmail) {
    await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation | ${order.orderNumber}`,
      html: customerOrderEmailHtml({
        order,
        customerName,
        invoiceUrl: invoice?.url,
      }),
      attachments: invoice?.pdfBuffer
        ? [
            {
              filename: invoice.filename || `invoice-${order.orderNumber}.pdf`,
              content: invoice.pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    });
  }
};

const orderStatusEmailHtml = ({ order, recipient, status }) => {
  const normalizedStatus = String(status || '').toLowerCase();
  const statusLabel = normalizedStatus ? `${normalizedStatus.charAt(0).toUpperCase()}${normalizedStatus.slice(1)}` : 'Updated';
  const statusColor =
    normalizedStatus === 'delivered' ? '#166534' :
    normalizedStatus === 'shipped' ? '#1d4ed8' :
    normalizedStatus === 'confirmed' ? '#047857' :
    normalizedStatus === 'cancelled' ? '#b91c1c' :
    '#374151';
  const statusBg =
    normalizedStatus === 'delivered' ? '#dcfce7' :
    normalizedStatus === 'shipped' ? '#dbeafe' :
    normalizedStatus === 'confirmed' ? '#d1fae5' :
    normalizedStatus === 'cancelled' ? '#fee2e2' :
    '#f3f4f6';

  return baseEmailLayout({
    title: 'Order Status Update',
    subtitle: `Order ${order.orderNumber}`,
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(recipient.name || 'Customer')}, your order status has been updated.</p>

      <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Order Number:</strong> ${escapeHtml(order.orderNumber || '')}</p>
        <p style="margin:0;font-size:14px;">
          <strong>Current Status:</strong>
          <span style="display:inline-block;margin-left:8px;padding:3px 10px;border-radius:999px;background:${statusBg};color:${statusColor};font-weight:700;font-size:12px;">
            ${escapeHtml(statusLabel)}
          </span>
        </p>
      </div>

      ${order.trackingInfo?.trackingNumber ? `
        <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#ffffff;">
          <p style="margin:0 0 6px;font-size:14px;"><strong>Tracking Number:</strong> ${escapeHtml(order.trackingInfo.trackingNumber)}</p>
          <p style="margin:0;font-size:14px;"><strong>Carrier:</strong> ${escapeHtml(order.trackingInfo.carrier || 'Carrier')}</p>
        </div>
      ` : ''}

      <p style="margin:14px 0 0;font-size:14px;color:#6b7280;">Thank you for shopping with UFLIX Interio.</p>
    `,
  });
};

const sendOrderStatusUpdate = async (order, recipient, status) => {
  if (!recipient?.email) return;

  await sendEmail({
    to: recipient.email,
    subject: `Order Status Updated | ${order.orderNumber}`,
    html: orderStatusEmailHtml({ order, recipient, status }),
  });
};

const sendQuotationNotifications = async (quotation) => {
  const productList = (quotation.products || [])
    .map((p) => `<li>${p.productName || 'Product'} | Qty: ${p.quantity || 1}</li>`)
    .join('');

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Quotation Request | ${quotation.name}`,
    html: `
      <h2>New quotation request received</h2>
      <p><strong>Name:</strong> ${quotation.name}</p>
      <p><strong>Email:</strong> ${quotation.email}</p>
      <p><strong>Mobile:</strong> ${quotation.mobile}</p>
      <h3>Requested products</h3>
      <ul>${productList}</ul>
      ${quotation.message ? `<p><strong>Message:</strong> ${quotation.message}</p>` : ''}
    `,
  });

  if (quotation.email) {
    await sendEmail({
      to: quotation.email,
      subject: 'Quotation Request Received | UFLIX',
      html: `
        <h2>Quotation request received</h2>
        <p>Hello ${quotation.name},</p>
        <p>We have received your quotation request. Our team will review and contact you shortly.</p>
        <p><strong>Reference ID:</strong> ${quotation._id}</p>
      `,
    });
  }
};

const sendContactFormNotifications = async (payload) => {
  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Contact Form Submission | ${payload.name}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Subject:</strong> ${payload.subject}</p>
      <p><strong>Message:</strong><br>${payload.message}</p>
    `,
  });

  if (payload.email) {
    await sendEmail({
      to: payload.email,
      subject: 'We Received Your Message | UFLIX',
      html: `
        <h2>Thanks for contacting UFLIX</h2>
        <p>Hello ${payload.name},</p>
        <p>We have received your message regarding "${payload.subject}".</p>
        <p>Our team will get back to you soon.</p>
      `,
    });
  }
};

module.exports = {
  sendEmail,
  sendOrderPlacedNotifications,
  sendOrderStatusUpdate,
  sendQuotationNotifications,
  sendContactFormNotifications,
};
