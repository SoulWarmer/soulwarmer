module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, packageDisplay, amount } = req.body;
  if (!name || !email || !packageDisplay) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = 'soulwarmerpodcast@gmail.com';

  async function send(to, subject, html) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SoulWarmer <onboarding@resend.dev>',
        reply_to: ownerEmail,
        to,
        subject,
        html,
      }),
    });
    return r.ok;
  }

  await send(
    email,
    'SoulWarmer đã nhận được thanh toán của bạn',
    `<p>Xin chào <strong>${name}</strong>,</p>
    <p>SoulWarmer đã nhận được thanh toán của bạn cho gói <strong>${packageDisplay}</strong> (${amount}đ).</p>
    <p>Mình sẽ liên hệ với bạn trong vòng <strong>24 giờ</strong> để xác nhận lịch và chuẩn bị cho buổi nói chuyện.</p>
    <p>Trong lúc chờ, nếu có câu hỏi gì bạn cứ reply email này nhé.</p>
    <br/>
    <p>Cảm ơn bạn đã tin tưởng SoulWarmer.</p>
    <p>— SoulWarmer</p>`
  );

  await send(
    ownerEmail,
    `Đơn hàng mới — ${name} — ${packageDisplay}`,
    `<h2 style="color:#D4849A">Có đơn hàng mới!</h2>
    <table style="border-collapse:collapse;font-size:15px">
      <tr><td style="padding:6px 16px 6px 0;color:#888">Khách</td><td><strong>${name}</strong></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888">Email</td><td>${email}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888">Gói</td><td>${packageDisplay}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888">Số tiền</td><td>${amount}đ</td></tr>
    </table>`
  );

  return res.status(200).json({ ok: true });
};
