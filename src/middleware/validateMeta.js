const crypto = require('crypto');

function validateMetaSignature(req, res, next) {
  const appSecret = process.env.META_APP_SECRET;
  const signature = req.headers['x-hub-signature-256'];

  // If no signature header exists, reject immediately
  if (!signature) {
    console.warn('Missing x-hub-signature-256 header');
    return res.sendStatus(401);
  }

  // req.body here is the raw Buffer (because we used express.raw())
  // We need the raw bytes to compute the same hash Meta computed
  const rawBody = req.body;

  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    console.warn('Raw body missing or not a buffer');
    return res.sendStatus(400);
  }

  // Compute expected signature
  const expectedSignature = 'sha256=' +
    crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

  // timingSafeEqual prevents timing attacks where an attacker
  // could guess the signature byte by byte based on how long
  // the comparison takes. Always use this instead of ===
  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (e) {
    // timingSafeEqual throws if buffers are different lengths
    isValid = false;
  }

  if (!isValid) {
    console.warn('Invalid Meta signature — request rejected');
    return res.sendStatus(401);
  }

  // Signature valid — parse the raw body to JSON for the route handler
  try {
    req.body = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.sendStatus(400);
  }

  next();
}

module.exports = validateMetaSignature;