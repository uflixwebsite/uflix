const nodemailer = require('nodemailer');

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'uflixwebsite@gmail.com';
const MAIL_USER = process.env.EMAIL_USER;
const MAIL_PASS = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const currency = (value = 0) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const getFromAddress = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'UFLIX';
  const fromEmail = process.env.EMAIL_FROM || MAIL_USER;
  return `${fromName} <${fromEmail}>`;
};

const sendEmail = async (options) => {
  if (!options?.to) return;
  const mailOptions = {
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderPlacedNotifications = async ({ order, customer, invoice }) => {
  const customerName = customer?.name || 'Customer';
  const customerEmail = customer?.email || '';

  const itemRows = (order.items || [])
    .map((item) => {
      const itemPrice = item.discountPrice || item.price;
      return `<li>${item.name} | Qty: ${item.quantity} | ${currency(itemPrice * item.quantity)}</li>`;
    })
    .join('');

  // Admin notification
  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Order Received | ${order.orderNumber}`,
    html: `
      <h2>New order received</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
      <p><strong>Total:</strong> ${currency(order.totalPrice)}</p>
      <h3>Items</h3>
      <ul>${itemRows}</ul>
      <p>Please review this order in the admin panel.</p>
    `,
  });

  // Customer confirmation (only if email entered)
  if (customerEmail) {
    await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation | ${order.orderNumber}`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
        <h3>Order summary</h3>
        <ul>${itemRows}</ul>
        <p><strong>Subtotal:</strong> ${currency(order.itemsPrice)}</p>
        <p><strong>Shipping:</strong> ${order.shippingPrice > 0 ? currency(order.shippingPrice) : 'FREE'}</p>
        <p><strong>Total:</strong> ${currency(order.totalPrice)}</p>
        ${invoice?.url ? `<p>Invoice link: <a href="${invoice.url}" target="_blank" rel="noreferrer">Download Invoice</a></p>` : ''}
        <p>We will notify you when your order status changes.</p>
      `,
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

const sendOrderStatusUpdate = async (order, recipient, status) => {
  if (!recipient?.email) return;

  await sendEmail({
    to: recipient.email,
    subject: `Order Status Updated | ${order.orderNumber}`,
    html: `
      <h2>Order status update</h2>
      <p>Hello ${recipient.name || 'Customer'},</p>
      <p>Your order <strong>${order.orderNumber}</strong> status is now <strong>${status}</strong>.</p>
      ${order.trackingInfo?.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingInfo.trackingNumber} (${order.trackingInfo.carrier || 'Carrier'})</p>` : ''}
      <p>Thank you for shopping with UFLIX.</p>
    `,
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
