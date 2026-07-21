// Danh mục dự phòng, dùng khi chưa tải xong data/categories.json (nguồn thật, có thể có thêm chủ đề mới từ admin)
const categoryLabels = {
  'soc-van-hoa': 'Sốc văn hóa',
  'ngon-ngu-ket-noi': 'Ngôn ngữ kết nối',
  'ban-do-thich-nghi': 'Bản đồ thích nghi',
  'quan-tri-noi-lo': 'Quản trị nỗi lo',
  'tinh-huong-kho': 'Tình huống khó',
  'truoc-khi-di': 'Trước khi đi',
  'chuan-bi-truoc-bay': 'Chuẩn bị trước bay',
  'canh-bao-di-lam': 'Cảnh báo đi làm',
};
let categoryList = Object.entries(categoryLabels).map(([slug, label]) => ({ slug, label }));

window.categoryLabelsReady = fetch('/data/categories.json')
  .then(r => r.ok ? r.json() : null)
  .then(cats => {
    if (Array.isArray(cats) && cats.length) {
      categoryList = cats;
      Object.keys(categoryLabels).forEach(k => delete categoryLabels[k]);
      cats.forEach(c => { categoryLabels[c.slug] = c.label; });
    }
    return { categoryLabels, categoryList };
  })
  .catch(() => ({ categoryLabels, categoryList }));

// Mobile navigation
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// Scroll fade-in
const FADE_SELECTORS = '.why-item, .path-card, .testimonial-card, .post-card, .booking-single, .boundary-col';

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(FADE_SELECTORS).forEach(el => {
  el.classList.add('fade-up');
});

document.querySelectorAll('.fade-up').forEach(el => {
  observer.observe(el);
});

window.observeFadeUp = function() {
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
};
