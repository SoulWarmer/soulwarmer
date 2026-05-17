const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { packageId } = req.body;

  const packages = {
    '10p': { name: 'SW 10phut', amount: 530000, display: 'Hỏi nhanh 10 phút' },
    '45p': { name: 'SW 45phut', amount: 1300000, display: 'Tư vấn đầy đủ 45 phút' },
  };

  const pkg = packages[packageId];
  if (!pkg) return res.status(400).json({ error: 'Invalid package' });

  const orderCode = Math.floor(Date.now() / 1000) % 9007199;
  const { amount, name: description } = pkg;
  const cancelUrl = 'https://soulwarmer.vercel.app/pages/services.html';
  const returnUrl = 'https://soulwarmer.vercel.app/pages/services.html?payment=success';

  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  const dataStr = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const signature = crypto.createHmac('sha256', checksumKey).update(dataStr).digest('hex');

  const payload = {
    orderCode,
    amount,
    description,
    cancelUrl,
    returnUrl,
    signature,
    items: [{ name: pkg.display, quantity: 1, price: amount }],
  };

  try {
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.PAYOS_CLIENT_ID,
        'x-api-key': process.env.PAYOS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.code === '00') {
      return res.status(200).json({
        checkoutUrl: data.data.checkoutUrl,
        qrCode: data.data.qrCode,
        orderCode,
        amount,
        display: pkg.display,
      });
    } else {
      return res.status(400).json({ error: data.desc || 'Lỗi tạo thanh toán' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
