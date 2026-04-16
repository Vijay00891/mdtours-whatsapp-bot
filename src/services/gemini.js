const axios = require('axios');
const { SYSTEM_PROMPT } = require('../config/constants');

// Waits for a given number of milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(history, retries = 2) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-2.5-flash'; // confirmed available on this API key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
      temperature: 0.3,
      maxOutputTokens: 300,
      topP: 0.9
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    });

    // Extract text — handle both normal and thinking-mode responses
    // Thinking models return multiple parts; the last text part is the actual reply
    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.filter(p => p.text).pop(); // get last text part
    const reply = textPart?.text?.trim();

    if (!reply) {
      console.error('Gemini raw response:', JSON.stringify(response.data?.candidates?.[0]));
      throw new Error('Gemini returned empty response');
    }

    return reply;

  } catch (err) {
    const status = err.response?.status;

    // Log full Gemini error for debugging
    const geminiError = err.response?.data?.error;
    if (geminiError) {
      console.error(`Gemini API error: ${status} — code: ${geminiError.code}, message: ${geminiError.message}`);
    }

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