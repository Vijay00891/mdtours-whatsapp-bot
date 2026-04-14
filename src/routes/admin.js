const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Basic auth middleware for admin protection
function requireAuth(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const auth = req.headers['authorization'];

  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="MD Tours Admin"');
    return res.status(401).send('Authentication required.');
  }

  const [, encoded] = auth.split(' ');
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [, password] = decoded.split(':');

  if (password !== adminPassword) {
    res.setHeader('WWW-Authenticate', 'Basic realm="MD Tours Admin"');
    return res.status(401).send('Invalid password.');
  }

  next();
}

// GET /admin — Lead viewer dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const [leads] = await db.query(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT 200'
    );

    const rows = leads.map(l => `
      <tr>
        <td>${l.id}</td>
        <td>${l.phone}</td>
        <td>${l.contact_name || '—'}</td>
        <td>${l.destination || '—'}</td>
        <td>${l.tour_type || '—'}</td>
        <td>${l.travel_dates || '—'}</td>
        <td>${l.adults || '—'}</td>
        <td>${l.children || '—'}</td>
        <td>${l.departure_city || '—'}</td>
        <td>${new Date(l.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD Tours — Leads Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; color: #1a202c; }
    header { background: #1a56db; color: white; padding: 16px 24px; }
    header h1 { font-size: 1.4rem; font-weight: 600; }
    header p { font-size: 0.85rem; opacity: 0.8; margin-top: 2px; }
    .container { padding: 24px; overflow-x: auto; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { background: white; border-radius: 8px; padding: 16px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat .num { font-size: 2rem; font-weight: 700; color: #1a56db; }
    .stat .label { font-size: 0.8rem; color: #718096; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 0.85rem; }
    th { background: #1a56db; color: white; text-align: left; padding: 12px 14px; font-weight: 600; white-space: nowrap; }
    td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f7fafc; }
    .empty { text-align: center; padding: 48px; color: #718096; }
  </style>
</head>
<body>
  <header>
    <h1>MD Tours — Leads Dashboard</h1>
    <p>Showing latest ${leads.length} enquiries (newest first)</p>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat"><div class="num">${leads.length}</div><div class="label">Total Leads</div></div>
      <div class="stat"><div class="num">${leads.filter(l => l.destination).length}</div><div class="label">With Destination</div></div>
      <div class="stat"><div class="num">${leads.filter(l => l.tour_type).length}</div><div class="label">Tour Type Known</div></div>
    </div>
    ${leads.length === 0
      ? '<div class="empty">No leads yet. Waiting for enquiries...</div>'
      : `<table>
          <thead><tr>
            <th>#</th><th>Phone</th><th>Name</th><th>Destination</th>
            <th>Tour Type</th><th>Travel Dates</th><th>Adults</th>
            <th>Children</th><th>From City</th><th>Received At</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`
    }
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

module.exports = router;
