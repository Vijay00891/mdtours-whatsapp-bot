const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — MD Tours WhatsApp Bot</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #333; line-height: 1.7; }
    h1 { color: #1a56db; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #2d3748; margin-top: 32px; }
    p, li { color: #4a5568; }
    footer { margin-top: 48px; color: #718096; font-size: 0.85rem; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p><strong>MD Tours (Matrubhoomi Darshan Tours)</strong><br>
  Website: <a href="https://mdtours.in">mdtours.in</a> | Contact: 84469 44445</p>
  <p>Last updated: April 2026</p>

  <h2>1. Information We Collect</h2>
  <p>When you send a WhatsApp message to MD Tours, we collect:</p>
  <ul>
    <li>Your WhatsApp phone number</li>
    <li>Your name (as provided in WhatsApp)</li>
    <li>Messages you send us during enquiries</li>
    <li>Travel preferences you share (destination, dates, group size, budget)</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <p>Your information is used solely to:</p>
  <ul>
    <li>Respond to your tour enquiries via our automated WhatsApp assistant</li>
    <li>Share your contact details with MD Tours travel agents for follow-up</li>
    <li>Improve our service quality</li>
  </ul>

  <h2>3. Data Storage</h2>
  <p>Conversation history is stored securely in our database to provide context-aware responses during your enquiry. We do not sell or share your data with third parties other than MD Tours staff.</p>

  <h2>4. Third-Party Services</h2>
  <p>Our WhatsApp bot uses the following third-party services:</p>
  <ul>
    <li><strong>Meta WhatsApp Business API</strong> — for message delivery</li>
    <li><strong>Google Gemini AI</strong> — for generating responses (no personal data is permanently stored by Google)</li>
  </ul>

  <h2>5. Data Retention</h2>
  <p>Conversation data is retained for up to 90 days and then deleted. You may request deletion of your data at any time by contacting us at <a href="tel:+918446944445">84469 44445</a>.</p>

  <h2>6. Your Rights</h2>
  <p>You have the right to:</p>
  <ul>
    <li>Request access to your data</li>
    <li>Request deletion of your data</li>
    <li>Opt out of automated responses at any time</li>
  </ul>

  <h2>7. Contact Us</h2>
  <p>For any privacy concerns, contact MD Tours at:<br>
  📞 84469 44445 | 🌐 <a href="https://mdtours.in">mdtours.in</a></p>

  <footer>
    &copy; 2026 MD Tours (Matrubhoomi Darshan Tours), Pune, India. All rights reserved.
  </footer>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
