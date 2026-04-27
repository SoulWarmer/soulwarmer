# CLAUDE.md — SoulWarmer

## Dự án là gì

SoulWarmer là website dịch vụ tư vấn tâm lý và đồng hành của chị Châu, một người Việt đang sống ở Mỹ cùng con. Dịch vụ nhắm đến hai nhóm: phụ huynh ở Việt Nam lo lắng cho con đang du học / làm việc xa nhà, và du học sinh / người mới sang Mỹ còn lạ lẫm, chưa có kinh nghiệm xử lý thực tiễn. Điểm khác biệt là chị Châu hiểu được cả hai đầu của hành trình đó vì chính chị cũng đang sống qua nó.

## Quy tắc bắt buộc (áp dụng cho mọi trang)

Mobile friendly là yêu cầu tối thiểu, không phải tùy chọn. Mọi layout mới phải được thiết kế theo hướng mobile-first: stack về 1 cột trên dưới 640px, font size và spacing phải đọc được trên điện thoại, không có overflow ngang.

Scroll animation là bắt buộc. Tất cả card, grid item, section nội dung đều phải có class `fade-up` và được observe bởi IntersectionObserver trong main.js. Khi element vào viewport thì thêm class `visible`. CSS cho `.fade-up` và `.fade-up.visible` đã có trong style.css.

Font bắt buộc: `Montserrat` (600, 700) cho tiêu đề, `Be Vietnam Pro` (400, 500, 600) cho body. Google Fonts link phải nhúng trực tiếp trong thẻ `<head>` của từng file HTML.

Không dùng tên "chị Châu" ở bất kỳ đâu trên website. Tên pháp nhân là SoulWarmer.

## Quyết định quan trọng đã chốt

**Không dùng ảnh cá nhân.** Thay bằng một bài bio viết sâu, kể câu chuyện thật của chị Châu. Lý do: tạo sự tin tưởng qua ngôn ngữ thay vì diện mạo, phù hợp với tone của dịch vụ.

**Dịch vụ là tư vấn để yên tâm, không phải dịch vụ "nghe tiếng Việt".** Đừng viết lại điều này theo hướng tiếng Việt là điểm bán hàng chính. Ngôn ngữ là môi trường, không phải sản phẩm.

**Màu sắc: hồng nhạt, trắng ấm, sạch.** `--color-rose: #D4849A`, `--color-bg: #FFF6F8`, `--color-rose-pale: #FCE8EE`. Font: Montserrat 600/700 cho tiêu đề, Be Vietnam Pro 400/500/600 cho body.

**Giá theo khung Mỹ (USD).** Tối thiểu $20/10 phút theo quy định. Tư vấn chuyên sâu có thể lên đến $600/giờ. Cần hiển thị giá minh bạch để tránh shock.

**Blog dùng Markdown + Decap CMS + Netlify.** Bài viết lưu trong `posts/*.md`, build script tạo `data/posts.json` khi deploy. Chị Châu vào `/admin` để đăng bài mà không cần đụng code.

**Form đặt lịch đơn giản:** họ tên, email/sđt, radio chọn phụ huynh hoặc du học sinh, ô nội dung cần tư vấn. Không phức tạp hơn.

**Không dùng dấu gạch nối (—) hay dash bullet points** vì trông như AI viết. Viết văn xuôi tự nhiên.

**Chưa có Calendly.** Trang services.html tạm dùng form liên hệ thay vì nút Calendly. Bổ sung sau khi có tài khoản.

## Hạ tầng đã deploy

- **GitHub:** github.com/SoulWarmer/soulwarmer
- **Netlify:** zesty-sherbet-869e72.netlify.app
- **Admin CMS:** zesty-sherbet-869e72.netlify.app/admin (email: soulwarmerpodcast@gmail.com)
- Netlify Identity đã bật, Git Gateway đã bật, user admin đã tạo

## Cấu trúc hiện tại

```
soulwarmer/
├── index.html              ← Landing page (đã xong, có block 3 bài mới nhất)
├── post.html               ← Trang đọc bài viết đơn lẻ (đã xong)
├── css/style.css           ← Design system (đã xong)
├── js/main.js              ← Menu mobile, scroll animation, form handlers (đã xong)
├── admin/                  ← Decap CMS (đã xong, hoạt động)
│   ├── index.html
│   └── config.yml
├── netlify.toml            ← Build command: node scripts/build-posts.js (đã xong)
├── scripts/build-posts.js  ← Tạo data/posts.json từ posts/*.md (đã xong)
├── data/posts.json         ← Manifest bài viết (2 bài, đang hoạt động)
├── posts/                  ← File markdown (2 bài, đăng qua Decap CMS)
└── pages/
    ├── content-hub.html    ← Trang danh sách bài, filter theo chủ đề (đã xong)
    ├── services.html       ← Trang dịch vụ và đặt lịch (đã xong, xem ghi chú)
    ├── about.html          ← CHƯA LÀM
    └── contact.html        ← CHƯA LÀM
```

## Trạng thái từng trang

**index.html** — Xong. Có block "Bài viết mới nhất" fetch từ data/posts.json, hiển thị 3 bài gần nhất với fade-up animation. Netlify Identity Widget đã nhúng để hỗ trợ CMS login redirect.

**pages/services.html** — Xong về giao diện. Gồm:
- Hai gói: Phiên nhanh 10 phút / $20 và Tư vấn chuyên sâu 45 phút / $49 (featured, badge "Phổ biến")
- Gift card section với 2 nút chọn gói
- Intake form: họ tên, email/sđt, chọn gói (visual radio), bạn là ai (phụ huynh / du học sinh / gift card), nội dung cần hỏi
- **CHÚ Ý:** Form hiện vẫn ghi "Không cần thanh toán trước" nhưng thực tế phải thanh toán trước qua PayOS. Chưa tích hợp PayOS vì cần Netlify Functions backend.

**admin/** — Decap CMS hoạt động tốt. Chị Châu vào zesty-sherbet-869e72.netlify.app/admin để đăng bài, bài sẽ tự deploy lên Netlify và hiện trên website.

**js/main.js** — Đã fix hai bug quan trọng: (1) `window.observeFadeUp` được expose để các inline script trong HTML khác gọi được sau khi render động; (2) Tất cả element có class `fade-up` sẵn trong HTML cũng được observe ngay khi load.

## Bước tiếp theo (theo thứ tự ưu tiên)

1. **`pages/about.html`** — bio viết sâu, không có ảnh. Kể câu chuyện thật: chị là ai, tại sao làm điều này, trải nghiệm sống ở Mỹ với con. Cần user cung cấp thông tin thật trước khi viết.

2. **`pages/contact.html`** — form liên hệ + lead magnet (Checklist 72h đầu miễn phí, nhận qua email).

3. **PayOS integration** — Cập nhật services.html để thanh toán trước. Cần Netlify Functions gọi PayOS API sinh checkout link. Khi bấm "Đặt lịch" sẽ tạo link thanh toán rồi redirect. Sau khi thanh toán thành công mới xác nhận lịch.

4. **Custom domain** — đổi từ zesty-sherbet-869e72.netlify.app sang domain riêng.

5. **Calendly** — khi có tài khoản, thay form đặt lịch trong services.html bằng Calendly embed.

## Lưu ý khi viết content

Tone ấm, không sến. Đoạn ngắn. Khoảng trắng nhiều. Không dùng các cụm sáo rỗng như "hành trình của bạn", "chúng tôi đồng hành cùng bạn" quá nhiều lần. Viết như người thật nói chuyện, không như brochure.
