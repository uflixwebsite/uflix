const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Leads';
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  // Defer throwing — functions will check and log gracefully when invoked.
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let sheetsClient = null;

const isProduction = process.env.NODE_ENV === 'production';

const logSheetsEvent = (event, details = {}) => {
  if (!isProduction) return;
  console.info('[sheets]', {
    event,
    ...details,
  });
};

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  if (!CLIENT_EMAIL || !PRIVATE_KEY || !SPREADSHEET_ID) {
    throw new Error('Google Sheets credentials (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID) are required');
  }

  const auth = new google.auth.JWT(
    CLIENT_EMAIL,
    null,
    // private key in env may contain escaped newlines
    PRIVATE_KEY.replace(/\\n/g, '\n'),
    SCOPES
  );

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

const HEADER_ROW = [
  'Timestamp',
  'ContactID',
  'Name',
  'Email',
  'Phone',
  'Subject',
  'SelectedProduct',
  'Message',
  'Status',
  'Source',
  'Referrer',
  'UTM_Source',
  'UTM_Medium',
  'UTM_Campaign',
  'AdminNotes',
  'UpdatedAt',
];

async function ensureHeaders() {
  const sheets = getSheetsClient();

  const headerRange = `${SHEET_NAME}!A1:P1`;

  const startedAt = Date.now();
  logSheetsEvent('header_check_start', {
    spreadsheetId: SPREADSHEET_ID,
    range: headerRange,
  });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: headerRange,
  });

  const values = res.data.values || [];

  const firstRowEmpty = values.length === 0 || !values[0] || values[0].length === 0;

  if (firstRowEmpty) {
    const headerWriteStartedAt = Date.now();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: headerRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [HEADER_ROW],
      },
    });

    logSheetsEvent('header_written', {
      spreadsheetId: SPREADSHEET_ID,
      range: headerRange,
      durationMs: Date.now() - headerWriteStartedAt,
    });
  }

  logSheetsEvent('header_check_complete', {
    spreadsheetId: SPREADSHEET_ID,
    range: headerRange,
    durationMs: Date.now() - startedAt,
    firstRowEmpty,
  });
}

async function appendLeadToSheet(contact) {
  if (!contact) throw new Error('Contact data is required');

  const startedAt = Date.now();
  logSheetsEvent('append_start', {
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    contactId: String(contact._id),
  });

  try {
    await ensureHeaders();
  } catch (err) {
    console.error('Failed to ensure Google Sheet headers:', err);
    // proceed — append may still work, but header init failure shouldn't block
  }

  const sheets = getSheetsClient();

  const timestamp = contact.createdAt ? new Date(contact.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = contact.updatedAt ? new Date(contact.updatedAt).toISOString() : '';

  const row = [
    timestamp,
    String(contact._id),
    contact.name || '',
    contact.email || '',
    contact.phone || '',
    contact.subject || '',
    contact.selectedProduct || '',
    contact.message || '',
    contact.status || 'pending',
    contact.source || 'contact-page',
    contact.referrer || '',
    contact.utm?.source || contact.utm_source || '',
    contact.utm?.medium || contact.utm_medium || '',
    contact.utm?.campaign || contact.utm_campaign || '',
    contact.adminNotes || contact.notes || '',
    updatedAt,
  ];

  const appendRange = `${SHEET_NAME}!A:P`;

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: appendRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });

  // Log a concise success message for operational visibility
  try {
    const updates = res.data.updates || res.data;
    console.info('Google Sheets: appended lead', {
      spreadsheetId: SPREADSHEET_ID,
      range: appendRange,
      updates,
    });
  } catch (logErr) {
    // non-fatal logging error
    console.error('Google Sheets: append succeeded but logging failed', logErr);
  }

  logSheetsEvent('append_complete', {
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    contactId: String(contact._id),
    durationMs: Date.now() - startedAt,
    updatedRange: res?.data?.updates?.updatedRange,
  });

  return res.data;
}

module.exports = {
  appendLeadToSheet,
};
