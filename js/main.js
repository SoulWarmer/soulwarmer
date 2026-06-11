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
