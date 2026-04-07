require('dotenv').config();
const { google } = require('googleapis');

async function getAuthClient() {
  let auth;
  if (process.env.GOOGLE_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    auth = new google.auth.GoogleAuth({
      keyFile: './credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  return auth.getClient();
}

async function writeToSheet(pieces) {
  console.log('📊 Writing to Google Sheets...');

  const authClient = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

 const headers = [
    '#', 'Quote', 'Setup', 'Punchline', 'Speaker',
    'Theme', 'Visual Mood', 'Caption', 'Hashtags', 'Type', 'Status'
  ];

  const rows = pieces.map((piece, i) => [
    i + 1,
    piece.quote || '',
    piece.setup || '',
    piece.punchline || '',
    piece.speaker || '',
    piece.theme_label || '',
    piece.visual_mood || '',
    piece.caption || '',
    (piece.hashtags || []).join(', '),
    piece.quote_type || '',
    'Ready'
  ]);

  const values = [headers, ...rows];

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });

  console.log(`✅ Wrote ${rows.length} pieces to Google Sheets`);
}

module.exports = { writeToSheet };