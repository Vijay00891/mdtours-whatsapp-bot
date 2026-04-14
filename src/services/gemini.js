const axios = require('axios');
const { SYSTEM_PROMPT } = require('../config/constants');

// Waits for a given number of milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(history, retries = 2) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Gemini uses 'model' instead of 'assistant' for its role
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents,
    generationConfig: {
      temperature: 0.3,      // low = more consistent, factual replies
      maxOutputTokens: 300,  // keep replies short for WhatsApp
      topP: 0.9
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000  // 15 second timeout
    });

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      throw new Error('Gemini returned empty response');
    }

    return reply;

  } catch (err) {
    const status = err.response?.status;

    // 429 = rate limited — wait and retry with exponential backoff
    if (status === 429 && retries > 0) {
      const waitMs = (3 - retries) * 5000; // 5s first retry, 10s second
      console.warn(`Gemini rate limited (429). Retrying in ${waitMs / 1000}s... (${retries} retries left)`);
      await sleep(waitMs);
      return callGemini(history, retries - 1);
    }

    throw err;
  }
}

module.exports = { callGemini };