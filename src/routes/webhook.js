const express = require('express');
const router = express.Router();

const { loadSession, saveSession } = require('../services/session');
const { callGemini } = require('../services/gemini');
const { sendMessage } = require('../services/whatsapp');
const { extractAndSaveLead } = require('../services/lead');
const { HANDOFF_PHRASES } = require('../config/constants');
const logger = require('../config/logger');

// In-memory dedup guard — prevents double-replies when Meta retries delivery
// Stores last 1000 message IDs (auto-evicts oldest to prevent memory leak)
const seenMessageIds = new Set();
function isDuplicate(id) {
  if (seenMessageIds.has(id)) return true;
  seenMessageIds.add(id);
  if (seenMessageIds.size > 1000) {
    const first = seenMessageIds.values().next().value;
    seenMessageIds.delete(first);
  }
  return false;
}

// ─── GET: Meta webhook verification ───────────────────────────────────────────
// When you register your webhook URL in Meta Dashboard, Meta sends a GET request
// with these 3 query params to verify you own the URL.
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    logger.info('Meta webhook verified successfully');
    return res.status(200).send(challenge);
  }

  logger.warn('Webhook verification failed — token mismatch');
  return res.sendStatus(403);
});

// ─── POST: Incoming WhatsApp messages ─────────────────────────────────────────
// validateMetaSignature middleware has already run before this.
// req.body is already parsed JSON at this point.
router.post('/', async (req, res) => {
  // Always respond 200 immediately.
  // Meta will retry the message if it does not get 200 within 5 seconds.
  // All actual processing happens after this line.
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Ignore delivery receipts, read receipts, and status updates.
    if (!message) return;
    if (message.type !== 'text') return;

    // Duplicate guard — Meta sometimes retries the same message
    if (isDuplicate(message.id)) {
      logger.warn('Duplicate message ignored', { id: message.id });
      return;
    }

    const phone = message.from;
    const messageText = message.text.body.trim();
    const contactName = value?.contacts?.[0]?.profile?.name || '';

    logger.info('Incoming message', { phone, text: messageText });

    // 1. Load existing conversation history from DB
    const { history, contactName: savedName } = await loadSession(phone);
    const name = savedName || contactName;

    // 2. Append the new user message to history
    history.push({ role: 'user', content: messageText });

    // 3. Call Gemini with full history
    const aiReply = await callGemini(history);

    // 4. Append Gemini’s reply to history
    history.push({ role: 'assistant', content: aiReply });

    // 5. Save updated history back to DB
    await saveSession(phone, name, history);

    // 6. Send the reply back to the customer on WhatsApp
    await sendMessage(phone, aiReply);
    logger.info('Reply sent', { phone });

    // 7. Check if handoff was triggered — check all 5 language variants
    const replyLower = aiReply.toLowerCase();
    const isHandoff = HANDOFF_PHRASES.some(phrase => replyLower.includes(phrase.toLowerCase()));

    if (isHandoff) {
      logger.info('Handoff triggered', { phone, name });
      await extractAndSaveLead(phone, name, history);
    }

  } catch (err) {
    logger.error('Error processing message', { error: err.message });
  }
});

module.exports = router;