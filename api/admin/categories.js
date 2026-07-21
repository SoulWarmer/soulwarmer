const { verifyToken, ghGet, ghPut, toSlug } = require('../_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { status, data } = await ghGet('data/categories.json');
    if (status === 404) return res.status(200).json([]);
    if (status !== 200) return res.status(500).json({ error: 'Lỗi đọc categories.json' });
    const cats = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    return res.status(200).json(cats);
  }

  if (req.method === 'POST') {
    const { label } = req.body || {};
    if (!label || !label.trim()) return res.status(400).json({ error: 'Thiếu tên chủ đề' });

    const slug = toSlug(label.trim());
    if (!slug) return res.status(400).json({ error: 'Tên chủ đề không hợp lệ' });

    const { status: jStatus, data: jData } = await ghGet('data/categories.json');
    const existing = jStatus === 200
      ? JSON.parse(Buffer.from(jData.content, 'base64').toString('utf8'))
      : [];
    const jSha = jStatus === 200 ? jData.sha : undefined;

    if (existing.some(c => c.slug === slug)) {
      return res.status(409).json({ error: 'Chủ đề này đã tồn tại' });
    }

    existing.push({ slug, label: label.trim() });
    const { status: writeStatus, data: writeData } = await ghPut(
      'data/categories.json',
      JSON.stringify(existing, null, 2),
      jSha,
      `Add category: ${label.trim()}`
    );
    if (writeStatus !== 200 && writeStatus !== 201) {
      const ghMsg = writeData && writeData.message ? writeData.message : 'không rõ';
      return res.status(500).json({ error: `Lỗi lưu chủ đề (GitHub ${writeStatus}: ${ghMsg})` });
    }

    return res.status(200).json({ slug, label: label.trim() });
  }

  return res.status(405).end();
};
