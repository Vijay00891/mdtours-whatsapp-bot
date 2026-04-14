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

// ─── GET /webhook — Meta verification (no body parsing needed) ─────────────────
app.get('/webhook', webhookRouter);

// ─── POST /webhook — Incoming messages ────────────────────────────────────────
// Raw buffer required so validateMetaSignature can compute HMAC correctly
app.use('/webhook', express.raw({ type: 'application/json' }));
app.post('/webhook', validateMetaSignature, webhookRouter);

// ─── Admin dashboard ───────────────────────────────────────────────────────────
app.use('/admin', adminRouter);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});