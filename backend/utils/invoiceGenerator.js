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

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const INDIAN_STATE_CODES = {
  andamanandnicobarislands: '35',
  andhrapradesh: '37',
  arunachalpradesh: '12',
  assam: '18',
  bihar: '10',
  chandigarh: '04',
  chhattisgarh: '22',
  dadraandnagarhavelianddamananddiu: '26',
  delhi: '07',
  goa: '30',
  gujarat: '24',
  haryana: '06',
  himachalpradesh: '02',
  jammuandkashmir: '01',
  jharkhand: '20',
  karnataka: '29',
  kerala: '32',
  ladakh: '38',
  lakshadweep: '31',
  madhyapradesh: '23',
  maharashtra: '27',
  manipur: '14',
  meghalaya: '17',
  mizoram: '15',
  nagaland: '13',
  odisha: '21',
  puducherry: '34',
  punjab: '03',
  rajasthan: '08',
  sikkim: '11',
  tamilnadu: '33',
  telangana: '36',
  tripura: '16',
  uttarpradesh: '09',
  uttarakhand: '05',
  westbengal: '19',
};

const getStateCode = (state = '') => {
  const normalized = String(state).toLowerCase().replace(/[^a-z]/g, '');
  return INDIAN_STATE_CODES[normalized] || '--';
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

const invoiceHtml = (order, customer) => {
  const logoSrc = getInvoiceLogoSrc();
  const billedTo = order.billingAddress || order.shippingAddress || {};
  const shippedTo = order.shippingAddress || order.billingAddress || {};
  const placeOfSupply = shippedTo.state || billedTo.state || '';
  const stateCode = getStateCode(placeOfSupply);
  const invoiceId = `UFL-${String(order.orderNumber || order._id || '').slice(-8)}`;
  const invoiceDate = new Date(order.createdAt || Date.now());
  const taxAmount = Number(order.taxPrice || 0);
  const netAmount = Number(order.itemsPrice || 0);
  const unitPrice = Number(order.items?.[0]?.discountPrice || order.items?.[0]?.price || 0);
  const quantity = Number(order.items?.[0]?.quantity || 1);
  const taxRate = netAmount > 0 ? ((taxAmount / netAmount) * 100).toFixed(0) : '0';
  const totalAmount = Number(order.totalPrice || 0);
  const amountInWords = `${numberToWords(Math.round(totalAmount))} only`;

  const itemRows = (order.items || [])
    .map((item, index) => {
      const qty = Number(item.quantity || 0);
      const itemUnitPrice = Number(item.discountPrice || item.price || 0);
      const lineNet = itemUnitPrice * qty;
      const lineTax = netAmount > 0 ? (lineNet / netAmount) * taxAmount : 0;
      const lineTotal = lineNet + lineTax;

      return `<tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(item.name || 'Product')}</td>
        <td class="right">${itemUnitPrice.toFixed(2)}</td>
        <td class="center">${qty}</td>
        <td class="right">${lineNet.toFixed(2)}</td>
        <td class="center">${taxRate}%</td>
        <td class="center">IGST</td>
        <td class="right">${lineTax.toFixed(2)}</td>
        <td class="right">${lineTotal.toFixed(2)}</td>
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
        .spaceLg { height: 14px; }
        .twoCol { display: flex; justify-content: space-between; gap: 24px; margin-top: 10px; }
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
              <div>UFLIX Interio</div>
              <div>*</div>
              <div>${escapeHtml(process.env.COMPANY_ADDRESS_LINE1 || '472, A-1, Sultan Puri, New Delhi')}</div>
              <div>${escapeHtml(process.env.COMPANY_ADDRESS_LINE2 || 'North West Delhi, DELHI, 110086')}</div>
              <div>IN</div>

              <div class="meta">
                <div><span class="strong">GST Registration No:</span>${escapeHtml(COMPANY_GSTIN)}</div>
              </div>
            </div>

            <div class="block right">
              <div class="blockTitle">Billing Address :</div>
              <div>${escapeHtml(billedTo.name || customer?.name || '')}</div>
              <div>${escapeHtml(billedTo.addressLine1 || '')}</div>
              ${billedTo.addressLine2 ? `<div>${escapeHtml(billedTo.addressLine2)}</div>` : ''}
              <div>${escapeHtml(`${billedTo.city || ''}, ${billedTo.state || ''}, ${billedTo.pincode || ''}`)}</div>
              <div>IN</div>
              <div class="strong">State/UT Code:${escapeHtml(getStateCode(billedTo.state || ''))}</div>

              <div class="spaceLg"></div>

              <div class="blockTitle">Shipping Address :</div>
              <div>${escapeHtml(shippedTo.name || customer?.name || '')}</div>
              <div>${escapeHtml(shippedTo.addressLine1 || '')}</div>
              ${shippedTo.addressLine2 ? `<div>${escapeHtml(shippedTo.addressLine2)}</div>` : ''}
              <div>${escapeHtml(`${shippedTo.city || ''}, ${shippedTo.state || ''}, ${shippedTo.pincode || ''}`)}</div>
              <div>IN</div>
              <div class="strong">State/UT Code:${escapeHtml(getStateCode(shippedTo.state || ''))}</div>
            </div>
          </div>

          <div class="twoCol" style="margin-top:8px;">
            <div class="block">
              <div><span class="strong">Order Number:</span>${escapeHtml(order.orderNumber || '')}</div>
              <div><span class="strong">Order Date:</span>${invoiceDate.toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
            </div>
            <div class="block right">
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
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Net Amount</th>
                  <th>Tax Rate</th>
                  <th>Tax Type</th>
                  <th>Tax Amount</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows || `<tr>
                  <td class="center">1</td>
                  <td class="desc">${escapeHtml(order.items?.[0]?.name || 'Product')}</td>
                  <td class="right">${unitPrice.toFixed(2)}</td>
                  <td class="center">${quantity}</td>
                  <td class="right">${netAmount.toFixed(2)}</td>
                  <td class="center">${taxRate}%</td>
                  <td class="center">IGST</td>
                  <td class="right">${taxAmount.toFixed(2)}</td>
                  <td class="right">${totalAmount.toFixed(2)}</td>
                </tr>`}
                <tr class="totals">
                  <td colspan="8" class="right">TOTAL:</td>
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
