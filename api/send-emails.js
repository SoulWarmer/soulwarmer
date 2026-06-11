const { ghGet, ghPut } = require('./_lib');

async function saveBooking(booking) {
  try {
    const { status, data } = await ghGet('data/bookings.json');
    const existing = status === 200
      ? JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'))
      : [];
    const sha = status === 200 ? data.sha : undefined;
    existing.unshift(booking);
    await ghPut('data/bookings.json', JSON.stringify(existing, null, 2), sha, 'Add booking');
  } catch (e) {
    console.error('saveBooking failed:', e);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, packageDisplay, amount, who, message } = req.body;
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

  const whoLabels = {
    parent: 'Phụ huynh',
    student: 'Du học sinh',
    worker: 'Người đi làm xa',
    gift: 'Gift card',
  };

  await send(
    email,
    'SoulWarmer đã nhận được thanh toán của bạn',
    `<!DOCTYPE html>
    <html lang="vi">
    <body style="margin:0;padding:0;background:#FFF6F8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF6F8;padding:40px 16px;">
        <tr><td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(212,132,154,0.12);">

            <tr>
              <td style="background:linear-gradient(135deg,#D4849A,#e8a0b4);padding:36px 40px;text-align:center;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">SoulWarmer</p>
                <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Đồng hành cùng bạn trên hành trình xa nhà</p>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 40px 32px;">
                <p style="margin:0 0 8px;font-size:15px;color:#888;">Xin chào,</p>
                <h2 style="margin:0 0 24px;font-size:22px;color:#2d2d2d;font-weight:700;">${name} 👋</h2>

                <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;">SoulWarmer đã nhận được thanh toán của bạn. Mình sẽ liên hệ trong vòng <strong style="color:#D4849A;">24 giờ</strong> để xác nhận lịch và chuẩn bị cho buổi nói chuyện.</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF6F8;border-radius:12px;padding:20px 24px;margin:24px 0;">
                  <tr>
                    <td style="font-size:13px;color:#888;padding-bottom:8px;">Gói đã đặt</td>
                  </tr>
                  <tr>
                    <td style="font-size:17px;font-weight:700;color:#D4849A;">${packageDisplay}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#888;padding-top:12px;">Số tiền thanh toán</td>
                  </tr>
                  <tr>
                    <td style="font-size:17px;font-weight:700;color:#2d2d2d;">${amount}đ</td>
                  </tr>
                </table>

                <p style="margin:0;font-size:14px;color:#888;line-height:1.7;">Trong lúc chờ, nếu có câu hỏi gì bạn cứ reply email này nhé.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px 40px;border-top:1px solid #FCE8EE;">
                <p style="margin:24px 0 4px;font-size:14px;color:#888;">Trân trọng,</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#D4849A;">SoulWarmer</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`
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
      <tr><td style="padding:6px 16px 6px 0;color:#888">Loại</td><td>${whoLabels[who] || who || ''}</td></tr>
      ${message ? `<tr><td style="padding:6px 16px 6px 0;color:#888;vertical-align:top">Nội dung</td><td style="white-space:pre-wrap">${message}</td></tr>` : ''}
    </table>`
  );

  await saveBooking({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    package: packageDisplay,
    amount,
    who: who || '',
    message: message || '',
    createdAt: new Date().toISOString(),
  });

  return res.status(200).json({ ok: true });
};
