require('dotenv').config();

const express = require('express');
const webhookRouter = require('./src/routes/webhook');
const adminRouter = require('./src/routes/admin');
const validateMetaSignature = require('./src/middleware/validateMeta');
const logger = require('./src/config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Skip ngrok/cloudflare browser warning page
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// ─── /webhook ──────────────────────────────────────────────────────────────────
// GET  → Meta verification (no body, no signature check)
// POST → Incoming messages (raw body needed for HMAC, then signature validated)
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use('/webhook', (req, res, next) => {
  if (req.method === 'POST') {
    return validateMetaSignature(req, res, next);
  }
  next();
}, webhookRouter);

// ─── Admin dashboard ───────────────────────────────────────────────────────────
app.use('/admin', adminRouter);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});