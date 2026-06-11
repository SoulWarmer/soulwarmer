const { verifyToken, ghGet, ghPutBase64 } = require('../_lib');

const ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  const { filename, content } = req.body || {};
  if (!filename || !content) return res.status(400).json({ error: 'Thiếu filename hoặc content' });

  const ext = filename.split('.').pop().toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) return res.status(400).json({ error: 'Định dạng không hỗ trợ' });

  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')}`;
  const path = `images/uploads/${safeName}`;

  const { status: checkStatus, data: checkData } = await ghGet(path);
  const existingSha = checkStatus === 200 ? checkData.sha : undefined;

  const { status } = await ghPutBase64(path, content, existingSha, `Upload image: ${safeName}`);
  if (status !== 200 && status !== 201) {
    return res.status(500).json({ error: 'Lỗi upload ảnh lên GitHub' });
  }

  return res.status(200).json({ url: `/images/uploads/${safeName}` });
};
