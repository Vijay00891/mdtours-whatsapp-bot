const db = require('../config/db');

// Load existing conversation history for a phone number
async function loadSession(phone) {
  const [rows] = await db.query(
    'SELECT history, contact_name FROM whatsapp_sessions WHERE phone = ?',
    [phone]
  );

  if (rows.length === 0) {
    return { history: [], contactName: '' };
  }

  const history = typeof rows[0].history === 'string'
    ? JSON.parse(rows[0].history)
    : rows[0].history;

  return { history, contactName: rows[0].contact_name };
}

// Save updated conversation history
async function saveSession(phone, contactName, history) {
  // Prevent history growing too large — keep last 30 messages
  // Gemini has a context limit and large histories slow things down
  const trimmed = history.slice(-30);

  await db.query(
    `INSERT INTO whatsapp_sessions (phone, contact_name, history)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       contact_name = VALUES(contact_name),
       history = VALUES(history),
       updated_at = CURRENT_TIMESTAMP`,
    [phone, contactName, JSON.stringify(trimmed)]
  );
}

module.exports = { loadSession, saveSession };