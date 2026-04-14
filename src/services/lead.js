const axios = require('axios');
const db = require('../config/db');

async function extractAndSaveLead(phone, contactName, history) {
  const conversationText = history
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Ask Gemini to extract structured data from the conversation
  // Works for all languages since Gemini understands Hindi, Marathi etc.
  const payload = {
    system_instruction: {
      parts: [{
        text: `Extract lead information from this WhatsApp conversation.
Return ONLY a valid JSON object. No markdown. No extra text. No code blocks.
Format: {"name":"","destination":"","tour_type":"","travel_dates":"","adults":"","children":"","departure_city":""}
If a field was not mentioned, use empty string.`
      }]
    },
    contents: [{
      role: 'user',
      parts: [{ text: conversationText }]
    }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 200
    }
  };

  let lead = {};
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    // Clean any accidental markdown fences Gemini might add
    const cleaned = raw.replace(/```json|```/g, '').trim();
    lead = JSON.parse(cleaned);
  } catch (e) {
    console.error('Lead extraction failed:', e.message);
    // Still save the lead with whatever we have
  }

  await db.query(
    `INSERT INTO leads
      (phone, contact_name, destination, tour_type, travel_dates, adults, children, departure_city, full_conversation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      phone,
      lead.name || contactName,
      lead.destination || '',
      lead.tour_type || '',
      lead.travel_dates || '',
      lead.adults || '',
      lead.children || '',
      lead.departure_city || '',
      JSON.stringify(history)
    ]
  );

  console.log(`Lead saved for ${phone}`);
}

module.exports = { extractAndSaveLead };