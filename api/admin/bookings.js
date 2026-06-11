const { verifyToken, ghGet } = require('../_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  const { status, data } = await ghGet('data/bookings.json');
  if (status === 404) return res.status(200).json([]);
  if (status !== 200) return res.status(500).json({ error: 'Lỗi đọc dữ liệu' });

  const content = Buffer.from(data.content, 'base64').toString('utf8');
  const bookings = JSON.parse(content);
  return res.status(200).json(
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
};
