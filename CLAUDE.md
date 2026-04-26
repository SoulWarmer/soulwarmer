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

**Màu sắc: hồng nhạt, trắng ấm, sạch.** `--color-rose: #D4849A`, `--color-bg: #FFF6F8`, `--color-rose-pale: #FCE8EE`. Font: Playfair Display 600/700 cho tiêu đề, Inter 400/500 cho body.

**Giá theo khung Mỹ (USD).** Tối thiểu $20/10 phút theo quy định. Tư vấn chuyên sâu có thể lên đến $600/giờ. Cần hiển thị giá minh bạch để tránh shock.

**Blog dùng Markdown + Decap CMS + Netlify.** Bài viết lưu trong `posts/*.md`, build script tạo `data/posts.json` khi deploy. Chị Châu vào `/admin` để đăng bài mà không cần đụng code.

**Form đặt lịch đơn giản:** họ tên, email/sđt, radio chọn phụ huynh hoặc du học sinh, ô nội dung cần tư vấn. Không phức tạp hơn.

**Không dùng dấu gạch nối (—) hay dash bullet points** vì trông như AI viết. Viết văn xuôi tự nhiên.

## Cấu trúc hiện tại

```
soulwarmer/
├── index.html              ← Landing page (đã xong)
├── post.html               ← Trang đọc bài viết đơn lẻ (đã xong)
├── css/style.css           ← Design system (đã xong)
├── js/main.js              ← Menu mobile, form handlers (đã xong)
├── admin/                  ← Decap CMS (đã xong)
│   ├── index.html
│   └── config.yml
├── netlify.toml            ← Build command: node scripts/build-posts.js (đã xong)
├── scripts/build-posts.js  ← Tạo data/posts.json từ posts/*.md (đã xong)
├── data/posts.json         ← Manifest bài viết (đã xong)
├── posts/                  ← File markdown bài viết
└── pages/
    ├── content-hub.html    ← Trang danh sách bài (đã xong)
    ├── about.html          ← CHƯA LÀM
    ├── services.html       ← CHƯA LÀM
    └── contact.html        ← CHƯA LÀM
```

## Bước tiếp theo (theo thứ tự ưu tiên)

1. **`pages/services.html`** — trang dịch vụ và đặt lịch, tạo ra doanh thu trực tiếp. Gồm 2 gói (phiên lẻ 45' và gói 4 buổi), giá USD, intake form, nút đặt lịch qua Calendly.

2. **`pages/about.html`** — bio chị Châu viết sâu, không có ảnh. Kể câu chuyện thật: chị là ai, tại sao làm điều này, trải nghiệm sống ở Mỹ với con.

3. **`pages/contact.html`** — form liên hệ + lead magnet (Checklist 72h đầu miễn phí, nhận qua email).

4. **Deploy** — hướng dẫn tạo GitHub repo, kết nối Netlify, bật Netlify Identity để dùng Decap CMS.

## Lưu ý khi viết content

Tone ấm, không sến. Đoạn ngắn. Khoảng trắng nhiều. Không dùng các cụm sáo rỗng như "hành trình của bạn", "chúng tôi đồng hành cùng bạn" quá nhiều lần. Viết như người thật nói chuyện, không như brochure.
