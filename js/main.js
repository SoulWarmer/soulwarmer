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

// Lead magnet form
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    leadForm.innerHTML = '<p style="color:white;font-size:1rem;font-weight:500">✓ Cảm ơn bạn! Checklist sẽ được gửi đến email trong vài phút.</p>';
  });
}

// Booking form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    bookingForm.innerHTML = `
      <div style="text-align:center;padding:32px 0">
        <div style="font-size:2.5rem;margin-bottom:16px">✓</div>
        <p style="font-weight:600;color:#1C1C1C;font-size:1rem;margin-bottom:8px">Đã nhận thông tin của bạn!</p>
        <p style="font-size:0.875rem;color:#5C5C5C">Chúng tôi sẽ liên hệ trong vòng 24 giờ để xác nhận lịch tư vấn.</p>
      </div>`;
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
  observer.observe(el);
});

document.querySelectorAll('.fade-up').forEach(el => {
  observer.observe(el);
});

window.observeFadeUp = function() {
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
};
