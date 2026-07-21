const crypto = require('crypto');

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

const REPO = 'SoulWarmer/soulwarmer';
const BRANCH = 'main';
const GH_BASE = `https://api.github.com/repos/${REPO}/contents`;

function verifyToken(token) {
  if (!token) return false;
  const idx = token.indexOf(':');
  if (idx === -1) return false;
  const ts = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age < 0 || age > 86400000) return false;
  const expected = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback')
    .update(`${ts}:admin`)
    .digest('hex');
  if (sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

function ghHeaders() {
  return {
    Authorization: `token ${process.env.GITHUB_PAT}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'SoulWarmer-Admin',
    'Content-Type': 'application/json',
  };
}

async function ghGet(path) {
  const r = await fetch(`${GH_BASE}/${path}?ref=${BRANCH}`, { headers: ghHeaders() });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}

async function ghPut(path, textContent, sha, message) {
  const body = {
    message,
    content: Buffer.from(textContent, 'utf8').toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH_BASE}/${path}`, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}

async function ghDelete(path, sha, message) {
  const r = await fetch(`${GH_BASE}/${path}`, {
    method: 'DELETE',
    headers: ghHeaders(),
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}

async function ghPutBase64(path, base64Content, sha, message) {
  const body = { message, content: base64Content, branch: BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH_BASE}/${path}`, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}

module.exports = { verifyToken, ghGet, ghPut, ghPutBase64, ghDelete, toSlug };
