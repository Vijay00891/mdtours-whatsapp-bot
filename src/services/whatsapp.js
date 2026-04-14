const axios = require('axios');

async function sendMessage(phone, text) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

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

  console.log(`Message sent to ${phone}`);
}

module.exports = { sendMessage };