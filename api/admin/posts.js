const { verifyToken, ghGet, ghPut, ghDelete } = require('../_lib');

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fm[key] = val;
  });
  return fm;
}

function buildMd(title, date, category, summary, body) {
  return `---\ntitle: ${title}\ndate: ${date}\ncategory: ${category || ''}\nsummary: ${summary || ''}\n---\n\n${body}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  // GET list — reads data/posts.json (fast)
  if (req.method === 'GET' && !req.query.slug) {
    const { status, data } = await ghGet('data/posts.json');
    if (status === 404) return res.status(200).json([]);
    if (status !== 200) return res.status(500).json({ error: 'Lỗi đọc posts.json' });
    const posts = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    return res.status(200).json(posts);
  }

  // GET single post for editing
  if (req.method === 'GET' && req.query.slug) {
    const slug = req.query.slug;
    const { status, data } = await ghGet(`posts/${slug}.md`);
    if (status === 404) return res.status(404).json({ error: 'Không tìm thấy bài' });
    if (status !== 200) return res.status(500).json({ error: 'Lỗi đọc bài viết' });
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return res.status(200).json({ slug, sha: data.sha, content });
  }

  // POST: create new post
  if (req.method === 'POST') {
    const { title, date, category, summary, body } = req.body || {};
    if (!title || !date || !body) return res.status(400).json({ error: 'Thiếu tiêu đề, ngày, hoặc nội dung' });

    const slug = `${date}-${toSlug(title)}`;
    const mdContent = buildMd(title, date, category, summary, body);

    const { status: writeStatus } = await ghPut(`posts/${slug}.md`, mdContent, undefined, `Add post: ${title}`);
    if (writeStatus !== 201) return res.status(500).json({ error: 'Lỗi lưu bài viết (slug có thể đã tồn tại)' });

    // Update posts.json
    const { status: jStatus, data: jData } = await ghGet('data/posts.json');
    const existing = jStatus === 200
      ? JSON.parse(Buffer.from(jData.content, 'base64').toString('utf8'))
      : [];
    const jSha = jStatus === 200 ? jData.sha : undefined;
    existing.unshift({ title, date, category: category || '', summary: summary || '', slug });
    existing.sort((a, b) => b.date.localeCompare(a.date));
    await ghPut('data/posts.json', JSON.stringify(existing, null, 2), jSha, `Update posts.json: add ${title}`);

    return res.status(200).json({ slug });
  }

  // PUT: update existing post
  if (req.method === 'PUT') {
    const { slug, sha, title, date, category, summary, body } = req.body || {};
    if (!slug || !sha || !title || !body) return res.status(400).json({ error: 'Thiếu thông tin' });

    const mdContent = buildMd(title, date, category, summary, body);
    const { status: writeStatus } = await ghPut(`posts/${slug}.md`, mdContent, sha, `Update post: ${title}`);
    if (writeStatus !== 200) return res.status(500).json({ error: 'Lỗi cập nhật bài viết' });

    // Update posts.json
    const { status: jStatus, data: jData } = await ghGet('data/posts.json');
    if (jStatus === 200) {
      let posts = JSON.parse(Buffer.from(jData.content, 'base64').toString('utf8'));
      const idx = posts.findIndex(p => p.slug === slug);
      if (idx !== -1) posts[idx] = { title, date, category: category || '', summary: summary || '', slug };
      posts.sort((a, b) => b.date.localeCompare(a.date));
      await ghPut('data/posts.json', JSON.stringify(posts, null, 2), jData.sha, `Update posts.json: edit ${title}`);
    }

    return res.status(200).json({ ok: true });
  }

  // DELETE: remove post
  if (req.method === 'DELETE') {
    const { slug, sha } = req.body || {};
    if (!slug || !sha) return res.status(400).json({ error: 'Thiếu slug hoặc sha' });

    const { status: delStatus } = await ghDelete(`posts/${slug}.md`, sha, `Delete post: ${slug}`);
    if (delStatus !== 200) return res.status(500).json({ error: 'Lỗi xóa bài viết' });

    // Update posts.json
    const { status: jStatus, data: jData } = await ghGet('data/posts.json');
    if (jStatus === 200) {
      let posts = JSON.parse(Buffer.from(jData.content, 'base64').toString('utf8'));
      posts = posts.filter(p => p.slug !== slug);
      await ghPut('data/posts.json', JSON.stringify(posts, null, 2), jData.sha, `Update posts.json: delete ${slug}`);
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
