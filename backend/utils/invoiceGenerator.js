const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const currency = (value = 0) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const LOCAL_LOGO_PATH = path.resolve(__dirname, '../../frontend/public/Logos/Uflix_Logo.png');
const DEFAULT_LOGO_URL = process.env.INVOICE_LOGO_URL || process.env.EMAIL_LOGO_URL || 'https://uflixfurniture.in/Logos/Uflix_Logo.png';
const COMPANY_GSTIN = process.env.COMPANY_GSTIN || '09AACCU6989R1Z1';

const getInvoiceLogoSrc = () => {
  try {
    if (fs.existsSync(LOCAL_LOGO_PATH)) {
      const fileBuffer = fs.readFileSync(LOCAL_LOGO_PATH);
      return `data:image/png;base64,${fileBuffer.toString('base64')}`;
    }
  } catch (error) {
    // Fallback to public URL when local logo is not accessible
  }

  return DEFAULT_LOGO_URL;
};

const invoiceHtml = (order, customer) => {
  const logoSrc = getInvoiceLogoSrc();
  const isBusinessInvoice = Boolean(order.isBusinessPurchase && order.businessDetails?.gstNumber);
  const invoiceHeading = isBusinessInvoice ? 'TAX INVOICE (B2B)' : 'TAX INVOICE';
  const rows = (order.items || [])
    .map((item) => {
      const unit = Number(item.discountPrice || item.price || 0);
      return `<tr>
        <td>${item.name}</td>
        <td style="text-align:center;">${item.quantity}</td>
        <td style="text-align:right;">${currency(unit)}</td>
        <td style="text-align:right;">${currency(unit * item.quantity)}</td>
      </tr>`;
    })
    .join('');

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; color: #1f2937; padding: 24px; }
        h1, h2, h3, p { margin: 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .muted { color: #6b7280; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; font-size: 13px; }
        th { text-align: left; background: #f9fafb; }
        .totals { margin-top: 16px; width: 320px; margin-left: auto; }
        .totals .line { display:flex; justify-content: space-between; padding: 6px 0; }
        .grand { font-weight: 700; font-size: 16px; border-top: 1px solid #d1d5db; margin-top: 8px; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="row">
        <div>
          <img src="${logoSrc}" alt="UFLIX" style="display:block;width:130px;height:auto;margin-bottom:10px;" />
          <h2>UFLIX</h2>
          <p class="muted">Premium Furniture & Metal Fabrication</p>
          <p class="muted">ebusiness@uflix.co.in | +91 730 383 6300</p>
          <p class="muted">Seller GSTIN: ${COMPANY_GSTIN}</p>
        </div>
        <div style="text-align:right;">
          <h1>${invoiceHeading}</h1>
          <p class="muted">Invoice #: ${order.orderNumber}</p>
          <p class="muted">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <div class="row" style="margin-top: 18px;">
        <div>
          <h3>Bill To</h3>
          <p>${order.shippingAddress?.name || customer?.name || ''}</p>
          <p class="muted">${order.shippingAddress?.phone || customer?.phone || ''}</p>
          <p class="muted">${order.shippingAddress?.addressLine1 || ''} ${order.shippingAddress?.addressLine2 || ''}</p>
          <p class="muted">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</p>
          ${isBusinessInvoice ? `<p class="muted" style="margin-top:6px;">Company: ${order.businessDetails?.companyName || ''}</p>` : ''}
          ${isBusinessInvoice ? `<p class="muted">Buyer GSTIN: ${order.businessDetails?.gstNumber || ''}</p>` : ''}
        </div>
        <div style="text-align:right;">
          <h3>Payment</h3>
          <p class="muted">Method: ${(order.paymentMethod || '').toUpperCase()}</p>
          <p class="muted">Status: ${order.paymentInfo?.status || 'pending'}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="line"><span>Subtotal</span><span>${currency(order.itemsPrice)}</span></div>
        <div class="line"><span>Shipping</span><span>${order.shippingPrice > 0 ? currency(order.shippingPrice) : 'FREE'}</span></div>
        <div class="line grand"><span>Total</span><span>${currency(order.totalPrice)}</span></div>
      </div>
      <p class="muted" style="margin-top: 28px; text-align:center;">Thank you for your business.</p>
    </body>
  </html>`;
};

const generateInvoice = async (order, customer) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(invoiceHtml(order, customer), { waitUntil: 'networkidle0' });
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
  } finally {
    await browser.close();
  }
};

const uploadInvoiceToCloudinary = async (pdfBuffer, orderNumber) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'uflix/invoices',
        resource_type: 'raw',
        public_id: `invoice_${orderNumber}`,
        format: 'pdf'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(pdfBuffer);
  });
};

exports.generateAndUploadInvoice = async (order, customer) => {
  try {
    const pdfBuffer = await generateInvoice(order, customer);
    
    // Upload to Cloudinary
    const result = await uploadInvoiceToCloudinary(pdfBuffer, order.orderNumber);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      pdfBuffer,
      filename: `invoice-${order.orderNumber}.pdf`,
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};
