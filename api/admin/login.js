const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }

  const ts = Date.now();
  const sig = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback')
    .update(`${ts}:admin`)
    .digest('hex');

  return res.status(200).json({ token: `${ts}:${sig}` });
};
