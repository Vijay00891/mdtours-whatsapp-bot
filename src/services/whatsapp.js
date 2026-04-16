const axios = require('axios');
const logger = require('../config/logger');

async function sendMessage(phone, text) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  try {
    await axios.post(url, {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: text }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    logger.info('Message sent to WhatsApp', { phone });

  } catch (err) {
    // Log full Meta error so we can debug exactly what went wrong
    const metaError = err.response?.data?.error;
    logger.error('WhatsApp send failed', {
      status: err.response?.status,
      code: metaError?.code,
      message: metaError?.message || err.message,
      phoneNumberId
    });
    throw err;
  }
}

module.exports = { sendMessage };