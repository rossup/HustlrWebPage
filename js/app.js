// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

// Reveal on scroll
const observer = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Pricing toggle
const toggle = document.getElementById('billingToggle');
if (toggle) {
  toggle.addEventListener('change', () => {
    document.querySelectorAll('[data-month]').forEach(s => {
      s.textContent = toggle.checked ? s.getAttribute('data-annual') : s.getAttribute('data-month');
    });
  });
}

// Copy demo link
const copyBtn = document.getElementById('copyLink');
const note = document.getElementById('copyNote');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('https://wa.me/263712345678');
      if (note) { note.hidden = false; setTimeout(() => (note.hidden = true), 2000); }
    } catch (e) {}
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
      if (navLinks && navLinks.classList.contains('open')) navLinks.classList.remove('open');
    }
  });
});

// ===== HERO CAROUSEL LOADER =====
const strip = document.querySelector('.hc-strip');
const viewport = document.querySelector('.hc-viewport');
const prevBtn = document.querySelector('.hc-btn.prev');
const nextBtn = document.querySelector('.hc-btn.next');
const dots = document.querySelector('.hc-dots');

function candidateNames(max = 6) {
  const exts = ['jpg','jpeg','png','webp','JPG','JPEG','PNG','WEBP'];
  const names = [];
  for (let i = 1; i <= max; i++) for (const e of exts) names.push(`assets/slide${i}.${e}`);
  return names;
}

function preload(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.decoding = 'async';
    img.alt = 'Hustrl slide';
    img.src = src;
  });
}

(async () => {
  if (!strip) return;
  const candidates = candidateNames(6);
  const loaded = [];
  for (const c of candidates) {
    const img = await preload(c);
    if (img) {
      strip.appendChild(img);
      if (!loaded.includes(c)) loaded.push(c);
    }
  }
  if (loaded.length === 0) {
    const p = document.createElement('div');
    p.style.color = '#9aa4b2';
    p.style.padding = '16px';
    p.textContent = 'Add images to /assets as slide1.jpg … slide6.jpg and redeploy.';
    strip.appendChild(p);
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }
  // Dots
  loaded.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Go to slide ${i+1}`);
    b.addEventListener('click', () => { index = i; update(true); resetAutoplay(); });
    dots.appendChild(b);
  });

  let index = 0;
  function update(animate=true) {
    const w = viewport.clientWidth;
    if (!animate) strip.style.transition = 'none'; else strip.style.transition = 'transform .45s ease';
    strip.style.transform = `translateX(${-index * w}px)`;
    Array.from(dots.children).forEach((d, i) => d.classList.toggle('active', i === index));
  }
  window.addEventListener('resize', () => update(false));
  update(false);

  if (prevBtn) prevBtn.addEventListener('click', () => { index = (index - 1 + loaded.length) % loaded.length; update(); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { index = (index + 1) % loaded.length; update(); resetAutoplay(); });

  // Autoplay
  let timer = null;
  function resetAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      index = (index + 1) % loaded.length;
      update();
    }, 4500);
  }
  resetAutoplay();
})();
