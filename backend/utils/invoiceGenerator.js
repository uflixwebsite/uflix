const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const FooterSettings = require('../models/FooterSettings');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const currency = (value = 0) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const LOCAL_LOGO_PATH = path.resolve(__dirname, '../../frontend/public/Logos/Uflix_Logo.png');
const DEFAULT_LOGO_URL = process.env.INVOICE_LOGO_URL || process.env.EMAIL_LOGO_URL || 'https://uflixfurniture.in/Logos/Uflix_Logo.png';
const GST_RATE = 0.18;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getSellerProfile = async () => {
  try {
    const footerSettings = await FooterSettings.findOne({ isActive: true }).lean();
    const contactItems = Array.isArray(footerSettings?.contactItems)
      ? footerSettings.contactItems.filter((item) => item?.enabled !== false)
      : [];

    const addressValues = contactItems
      .filter((item) => item?.type === 'address' && item?.value)
      .map((item) => String(item.value).trim())
      .filter(Boolean);

    const splitAddressLines = addressValues
      .flatMap((value) => value.split(/\r?\n|\|/).map((line) => line.trim()))
      .filter(Boolean);

    const sellerAddressLine1 =
      splitAddressLines[0] ||
      process.env.COMPANY_ADDRESS_LINE1 ||
      'UFLIX Interio';

    const sellerAddressLine2 =
      splitAddressLines[1] ||
      process.env.COMPANY_ADDRESS_LINE2 ||
      '';

    return {
      sellerName: footerSettings?.brandName || process.env.COMPANY_NAME || 'UFLIX Interio',
      sellerAddressLine1,
      sellerAddressLine2,
    };
  } catch (error) {
    return {
      sellerName: process.env.COMPANY_NAME || 'UFLIX Interio',
      sellerAddressLine1: process.env.COMPANY_ADDRESS_LINE1 || 'UFLIX Interio',
      sellerAddressLine2: process.env.COMPANY_ADDRESS_LINE2 || '',
    };
  }
};

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigits = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return `${tens[ten]}${one ? ` ${ones[one]}` : ''}`.trim();
  };

  const threeDigits = (n) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (!hundred) return twoDigits(rest);
    return `${ones[hundred]} Hundred${rest ? ` ${twoDigits(rest)}` : ''}`.trim();
  };

  if (!num || num <= 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  const parts = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(' ').trim();
};

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

const invoiceHtml = (order, customer, sellerProfile) => {
  const logoSrc = getInvoiceLogoSrc();
  const billedTo = order.billingAddress || order.shippingAddress || {};
  const shippedTo = order.shippingAddress || order.billingAddress || {};
  const placeOfSupply = shippedTo.state || billedTo.state || '';
  const invoiceId = `UFL-${String(order.orderNumber || order._id || '').slice(-8)}`;
  const invoiceDate = new Date(order.createdAt || Date.now());
  const shippingAmount = Number(order.shippingPrice || 0);

  const itemBreakdown = (order.items || []).map((item) => {
    const qty = Number(item.quantity || 0);
    const paidUnitPrice = Number(item.discountPrice || item.price || 0);
    const linePaid = paidUnitPrice * qty;
    const lineNet = linePaid / (1 + GST_RATE);
    const lineTax = linePaid - lineNet;

    return {
      name: item.name || 'Product',
      qty,
      paidUnitPrice,
      unitBeforeGst: paidUnitPrice / (1 + GST_RATE),
      lineNet,
      lineTax,
      linePaid,
    };
  });

  const itemsNetAmount = itemBreakdown.reduce((sum, row) => sum + row.lineNet, 0);
  const itemsTaxAmount = itemBreakdown.reduce((sum, row) => sum + row.lineTax, 0);
  const itemsPaidAmount = itemBreakdown.reduce((sum, row) => sum + row.linePaid, 0);
  const totalAmount = Number(order.totalPrice || itemsPaidAmount + shippingAmount || 0);
  const amountInWords = `${numberToWords(Math.round(totalAmount))} only`;

  const itemRows = itemBreakdown
    .map((row, index) => {
      const taxRate = `${Math.round(GST_RATE * 100)}%`;

      return `<tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(row.name)}</td>
        <td class="right">${row.unitBeforeGst.toFixed(2)}</td>
        <td class="center">${row.qty}</td>
        <td class="right">${row.lineNet.toFixed(2)}</td>
        <td class="center">${taxRate}%</td>
        <td class="center">IGST</td>
        <td class="right">${row.lineTax.toFixed(2)}</td>
        <td class="right">${row.linePaid.toFixed(2)}</td>
      </tr>`;
    })
    .join('');

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; padding: 0; }
        .page { width: 100%; max-width: 210mm; margin: 0 auto; border: 1px solid #222; }
        .inner { padding: 10px 12px 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; min-height: 72px; }
        .logo { width: 165px; height: auto; }
        .titleWrap { text-align: right; line-height: 1.2; }
        .titleMain { font-size: 34px; font-weight: 700; letter-spacing: 0.3px; }
        .titleSub { font-size: 18px; font-weight: 700; }
        .subtitle { font-size: 16px; font-weight: 700; }
        .spaceLg { height: 4px; }
        .twoCol { display: flex; justify-content: space-between; gap: 20px; margin-top: 6px; }
        .block { width: 48%; font-size: 15px; line-height: 1.2; }
        .block.right { text-align: right; }
        .blockTitle { font-weight: 700; margin-bottom: 2px; }
        .meta { margin-top: 8px; font-size: 15px; line-height: 1.25; }
        .strong { font-weight: 700; }
        .tableWrap { margin-top: 14px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #222; padding: 3px 4px; font-size: 11px; vertical-align: top; }
        th { font-weight: 700; text-align: left; line-height: 1.05; }
        .right { text-align: right; }
        .center { text-align: center; }
        .desc { line-height: 1.15; }
        .totals td { font-size: 12px; font-weight: 700; }
        .words { border-top: 0; font-size: 12px; padding: 6px 8px; }
        .footerPad { height: 8px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="inner">
          <div class="header">
            <div>
              <img src="${logoSrc}" alt="UFLIX" class="logo" />
            </div>
            <div class="titleWrap">
              <div class="titleSub">Tax Invoice/Bill of Supply/Cash Memo</div>
              <div class="subtitle">(Triplicate for Supplier)</div>
            </div>
          </div>

          <div class="spaceLg"></div>

          <div class="twoCol">
            <div class="block">
              <div class="blockTitle">Sold By :</div>
              <div>${escapeHtml(sellerProfile?.sellerName || 'UFLIX Interio')}</div>
              <div>*</div>
              <div>${escapeHtml(sellerProfile?.sellerAddressLine1 || '')}</div>
              ${sellerProfile?.sellerAddressLine2 ? `<div>${escapeHtml(sellerProfile.sellerAddressLine2)}</div>` : ''}
              <div>IN</div>

              <div class="meta">
                <div><span class="strong">GST Registration No:</span></div>
                <div style="margin-top:6px;"><span class="strong">Order Number:</span>${escapeHtml(order.orderNumber || '')}</div>
                <div><span class="strong">Order Date:</span>${invoiceDate.toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
              </div>
            </div>

            <div class="block right">
              <div class="blockTitle">Billing Address :</div>
              <div>${escapeHtml(billedTo.name || customer?.name || '')}</div>
              <div>${escapeHtml(billedTo.addressLine1 || '')}</div>
              ${billedTo.addressLine2 ? `<div>${escapeHtml(billedTo.addressLine2)}</div>` : ''}
              <div>${escapeHtml(`${billedTo.city || ''}, ${billedTo.state || ''}, ${billedTo.pincode || ''}`)}</div>
              <div>IN</div>

              <div class="spaceLg"></div>

              <div class="blockTitle">Shipping Address :</div>
              <div>${escapeHtml(shippedTo.name || customer?.name || '')}</div>
              <div>${escapeHtml(shippedTo.addressLine1 || '')}</div>
              ${shippedTo.addressLine2 ? `<div>${escapeHtml(shippedTo.addressLine2)}</div>` : ''}
              <div>${escapeHtml(`${shippedTo.city || ''}, ${shippedTo.state || ''}, ${shippedTo.pincode || ''}`)}</div>
              <div>IN</div>
              <div><span class="strong">Place of supply:</span>${escapeHtml(placeOfSupply).toUpperCase()}</div>
              <div><span class="strong">Place of delivery:</span>${escapeHtml(placeOfSupply).toUpperCase()}</div>
              <div><span class="strong">Invoice Number :</span>IN-${escapeHtml(invoiceId)}</div>
              <div><span class="strong">Invoice Date :</span>${invoiceDate.toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
            </div>
          </div>

          <div class="tableWrap">
            <table>
              <colgroup>
                <col style="width:4%;" />
                <col style="width:43%;" />
                <col style="width:8%;" />
                <col style="width:5%;" />
                <col style="width:9%;" />
                <col style="width:5%;" />
                <col style="width:6%;" />
                <col style="width:8%;" />
                <col style="width:12%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Sl. No</th>
                  <th>Description</th>
                  <th>Unit Price (Before GST)</th>
                  <th>Qty</th>
                  <th>Net Amount (Before GST)</th>
                  <th>Tax Rate</th>
                  <th>Tax Type</th>
                  <th>Tax Amount</th>
                  <th>Total Paid</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows || `<tr>
                  <td class="center">1</td>
                  <td class="desc">${escapeHtml(order.items?.[0]?.name || 'Product')}</td>
                  <td class="right">0.00</td>
                  <td class="center">1</td>
                  <td class="right">0.00</td>
                  <td class="center">18%</td>
                  <td class="center">IGST</td>
                  <td class="right">0.00</td>
                  <td class="right">0.00</td>
                </tr>`}
                <tr class="totals">
                  <td colspan="8" class="right">TOTAL:</td>
                  <td class="right">${itemsPaidAmount.toFixed(2)}</td>
                </tr>
                <tr class="totals">
                  <td colspan="8" class="right">Total Amount (Before GST):</td>
                  <td class="right">${itemsNetAmount.toFixed(2)}</td>
                </tr>
                <tr class="totals">
                  <td colspan="8" class="right">Total GST (18%):</td>
                  <td class="right">${itemsTaxAmount.toFixed(2)}</td>
                </tr>
                <tr class="totals">
                  <td colspan="8" class="right">Shipping:</td>
                  <td class="right">${shippingAmount.toFixed(2)}</td>
                </tr>
                <tr class="totals">
                  <td colspan="8" class="right">Grand Total (Amount Paid):</td>
                  <td class="right">${totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="9" class="words"><span class="strong">Amount in Words:</span><br/>${escapeHtml(amountInWords)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footerPad"></div>
        </div>
      </div>
    </body>
  </html>`;
};

const generateInvoice = async (order, customer) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const sellerProfile = await getSellerProfile();
    const page = await browser.newPage();
    await page.setContent(invoiceHtml(order, customer, sellerProfile), { waitUntil: 'networkidle0' });
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
