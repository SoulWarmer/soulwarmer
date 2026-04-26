const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const outputFile = path.join(__dirname, '../data/posts.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    meta[key] = val;
  });
  return { ...meta, body: match[2].trim() };
}

const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(filename => {
    const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    const data = parseFrontmatter(raw);
    if (!data || !data.title) return null;
    return { ...data, slug: filename.replace('.md', '') };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2), 'utf8');
console.log(`Đã build ${posts.length} bài viết.`);
