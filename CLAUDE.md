# CLAUDE.md — SoulWarmer

## Dự án là gì

SoulWarmer là website dịch vụ tư vấn tâm lý và đồng hành của người sáng lập — một người Việt đang sống ở Mỹ cùng con. Dịch vụ nhắm đến hai nhóm: phụ huynh ở Việt Nam lo lắng cho con đang du học / làm việc xa nhà, và du học sinh / người mới sang Mỹ còn lạ lẫm, chưa có kinh nghiệm xử lý thực tiễn.

## Quy tắc bắt buộc (áp dụng cho mọi trang)

Mobile friendly là yêu cầu tối thiểu, không phải tùy chọn. Mọi layout mới phải được thiết kế theo hướng mobile-first: stack về 1 cột trên dưới 640px, font size và spacing phải đọc được trên điện thoại, không có overflow ngang.

Scroll animation là bắt buộc. Tất cả card, grid item, section nội dung đều phải có class `fade-up` và được observe bởi IntersectionObserver trong main.js. Khi element vào viewport thì thêm class `visible`. CSS cho `.fade-up` và `.fade-up.visible` đã có trong style.css.

Font bắt buộc: `Montserrat` (600, 700) cho tiêu đề, `Be Vietnam Pro` (400, 500, 600) cho body. Google Fonts link phải nhúng trực tiếp trong thẻ `<head>` của từng file HTML.

Không dùng tên "chị Châu" ở bất kỳ đâu trên website. Tên pháp nhân là SoulWarmer.

## Quyết định quan trọng đã chốt

**Không dùng ảnh cá nhân.** Thay bằng một bài bio viết sâu, kể câu chuyện thật của người sáng lập. Lý do: tạo sự tin tưởng qua ngôn ngữ thay vì diện mạo.

**Dịch vụ là tư vấn để yên tâm, không phải dịch vụ "nghe tiếng Việt".** Ngôn ngữ là môi trường, không phải sản phẩm.

**Màu sắc: hồng nhạt, trắng ấm, sạch.** `--color-rose: #D4849A`, `--color-bg: #FFF6F8`, `--color-rose-pale: #FCE8EE`. Font: Montserrat 600/700 cho tiêu đề, Be Vietnam Pro 400/500/600 cho body. Base font-size: 18px desktop, 15px mobile. Heading weight: 600.

**Giá tính bằng VND.** Gói 10 phút: 530.000đ. Gói 45 phút: 1.300.000đ. Thanh toán trước qua PayOS, không thu tiền mặt.

**Blog dùng Markdown + Decap CMS.** Bài viết lưu trong `posts/*.md`, build script tạo `data/posts.json`. Khi CMS hoạt động, đăng bài qua `/admin` mà không cần đụng code.

**Form đặt lịch:** họ tên, email, radio chọn phụ huynh / du học sinh / gift card, ô nội dung cần tư vấn. Sau khi submit thì redirect sang PayOS thanh toán.

**Không dùng dấu gạch nối (—) hay dash bullet points** vì trông như AI viết. Viết văn xuôi tự nhiên.

**Chưa có Calendly.** Form đặt lịch hiện dùng flow PayOS. Bổ sung Calendly sau khi có tài khoản.

## Hạ tầng hiện tại

- **GitHub:** github.com/SoulWarmer/soulwarmer
- **Hosting:** Vercel — soulwarmer.vercel.app
- **Serverless API:** Vercel Functions trong `/api/`
- **Email:** Resend (free tier) — sender `onboarding@resend.dev`, reply-to `soulwarmerpodcast@gmail.com`
- **Thanh toán:** PayOS (VND) — credentials lưu trong Vercel environment variables
- **CMS admin:** Decap CMS tại `/admin` — hiện tạm ngưng vì Netlify hết credit (reset ngày 25/5). Khi Netlify mở lại thì admin hoạt động trở lại.

### Vercel environment variables đã cài
- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`
- `RESEND_API_KEY`

## Cấu trúc hiện tại

```
soulwarmer/
├── index.html              ← Landing page (xong)
├── post.html               ← Trang đọc bài đơn lẻ (xong)
├── css/style.css           ← Design system (xong)
├── js/main.js              ← Menu mobile, scroll animation (xong)
├── admin/                  ← Decap CMS (xong, tạm ngưng chờ Netlify)
│   ├── index.html
│   └── config.yml
├── api/
│   ├── create-payment.js   ← Tạo PayOS checkout link
│   └── send-emails.js      ← Gửi email xác nhận qua Resend
├── netlify.toml            ← Build command (giữ lại cho khi Netlify mở lại)
├── scripts/build-posts.js  ← Tạo data/posts.json từ posts/*.md
├── data/posts.json         ← Manifest bài viết (commit thủ công khi thêm bài)
├── posts/                  ← File markdown (4 bài)
└── pages/
    ├── content-hub.html    ← Danh sách bài, filter theo chủ đề (xong)
    ├── services.html       ← Dịch vụ, form đặt lịch, PayOS, email (xong)
    ├── about.html          ← Bio founder, không ảnh (xong)
    └── contact.html        ← 4 kênh: Facebook, YouTube, TikTok, Email (xong)
```

## Trạng thái từng trang

**index.html** — Xong. Block "Bài viết mới nhất" fetch từ data/posts.json, hiển thị 3 bài gần nhất.

**pages/services.html** — Xong hoàn toàn. Gồm:
- Hai gói: 530.000đ (10 phút) và 1.300.000đ (45 phút, badge "Phổ biến")
- Gift card section
- Form: họ tên, email, chọn gói, bạn là ai, nội dung cần hỏi
- Bấm "Thanh toán ngay" → validate form → gọi `/api/create-payment` → redirect PayOS
- Sau khi thanh toán, PayOS redirect về `?payment=success` → hiện banner xanh + gửi 2 email tự động

**pages/about.html** — Xong. Bio founder theo timeline 2016-2024, không ảnh cá nhân.

**pages/contact.html** — Xong. 4 channel card: Facebook, YouTube, TikTok, Email. Hover hiện viền hồng.

**pages/content-hub.html** — Xong. Filter theo chủ đề.

**admin/** — Decap CMS. Hiện tạm ngưng vì Netlify hết credit. Chờ reset ngày 25/5 để đăng bài lại.

**CHÚ Ý về blog:** Khi CMS hoạt động trở lại, sau khi đăng bài cần chạy `node scripts/build-posts.js` và commit `data/posts.json` để Vercel phục vụ đúng. Vercel không tự chạy build script (không có package.json / vercel.json).

## Luồng thanh toán + email

1. Khách điền form → thông tin lưu sessionStorage → gọi POST `/api/create-payment`
2. API tạo HMAC signature, gọi PayOS, trả về `checkoutUrl`
3. Browser redirect sang trang thanh toán PayOS
4. Khách thanh toán → PayOS redirect về `services.html?payment=success`
5. Trang đọc sessionStorage → gọi POST `/api/send-emails`
6. Resend gửi 2 email: xác nhận cho khách + alert cho owner (`soulwarmerpodcast@gmail.com`)

## Bước tiếp theo (theo thứ tự ưu tiên)

1. **Test luồng PayOS thật** — đặt 1 đơn thật để xác nhận email gửi đúng 2 chiều trước khi ra mắt.
2. **CMS admin** — chờ Netlify reset ngày 25/5. Sau đó nhớ: đăng bài xong → chạy build script → commit posts.json.
3. **Custom domain** — khi có domain, cập nhật `cancelUrl` / `returnUrl` trong `api/create-payment.js` và sender email trong Resend.
4. **Calendly** — khi có tài khoản, thay form đặt lịch trong services.html bằng Calendly embed.
5. **vercel.json** — thêm build command để Vercel tự chạy `build-posts.js` khi deploy, không cần commit posts.json thủ công.

## Lưu ý khi viết content

Tone ấm, không sến. Đoạn ngắn. Khoảng trắng nhiều. Không dùng các cụm sáo rỗng như "hành trình của bạn", "chúng tôi đồng hành cùng bạn" quá nhiều lần. Viết như người thật nói chuyện, không như brochure.
