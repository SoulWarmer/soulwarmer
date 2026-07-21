const { verifyToken, ghGet, ghPut, toSlug } = require('../_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

  if (req.method === 'DELETE') {
    const { slug } = req.body || {};
    if (!slug) return res.status(400).json({ error: 'Thiếu slug' });

    const { status: pStatus, data: pData } = await ghGet('data/posts.json');
    if (pStatus === 200) {
      const posts = JSON.parse(Buffer.from(pData.content, 'base64').toString('utf8'));
      const inUse = posts.filter(p => p.category === slug).length;
      if (inUse > 0) {
        return res.status(409).json({ error: `Còn ${inUse} bài viết đang dùng chủ đề này. Đổi chủ đề của bài đó trước khi xóa.` });
      }
    }

    const { status: jStatus, data: jData } = await ghGet('data/categories.json');
    if (jStatus !== 200) return res.status(500).json({ error: 'Lỗi đọc categories.json' });
    const existing = JSON.parse(Buffer.from(jData.content, 'base64').toString('utf8'));
    const next = existing.filter(c => c.slug !== slug);
    if (next.length === existing.length) return res.status(404).json({ error: 'Không tìm thấy chủ đề' });

    const { status: writeStatus, data: writeData } = await ghPut(
      'data/categories.json',
      JSON.stringify(next, null, 2),
      jData.sha,
      `Delete category: ${slug}`
    );
    if (writeStatus !== 200) {
      const ghMsg = writeData && writeData.message ? writeData.message : 'không rõ';
      return res.status(500).json({ error: `Lỗi xóa chủ đề (GitHub ${writeStatus}: ${ghMsg})` });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
