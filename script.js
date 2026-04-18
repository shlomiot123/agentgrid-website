/* ============================================================
   AGENTGRID — JAVASCRIPT
   ============================================================ */

'use strict';

/* ---- 1. CUSTOM CURSOR ---- */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;
let hasMoved = false;

function moveCursor(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!hasMoved) {
    hasMoved = true;
    document.body.classList.add('has-cursor');
    ringX = mouseX; ringY = mouseY;
  }
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
}

function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
  requestAnimationFrame(animateRing);
}

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', moveCursor);
  animateRing();

  document.querySelectorAll('a, button, .serve-card, .svc-card, .why-item, .process-step').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
  });
}

/* ---- 2. SCROLL PROGRESS BAR ---- */
const scrollBar = document.getElementById('scrollBar');

function updateScrollBar() {
  const doc = document.documentElement;
  const progress = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
  scrollBar.style.width = Math.min(progress, 100) + '%';
}

/* ---- 3. NAV SCROLL STATE ---- */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
  const scrolled = window.scrollY > 40;
  nav.classList.toggle('scrolled', scrolled);
}

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - var_navH() - 60;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

function var_navH() { return 80; }

/* ---- 4. HERO PARTICLE CANVAS ---- */
class ParticleCanvas {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.stars   = [];
    this.W = this.H = this.cx = this.cy = 0;

    const STAR_COLORS = [
      [255,255,255],[255,255,255],[255,255,255],
      [200,220,255],[180,210,255],[140,190,255],[200,170,255],[56,189,248],
    ];
    this.STAR_COUNT = 180;
    this.SPEED      = 0.4;
    this.FOV        = 300;
    this.COLORS     = STAR_COLORS;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  makeStar() {
    const col = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    return {
      x:    (Math.random() - 0.5) * this.W * 2,
      y:    (Math.random() - 0.5) * this.H * 2,
      z:    Math.random() * this.W,
      pz:   0,
      col,
      size: 0.4 + Math.random() * 1.2,
    };
  }

  resize() {
    this.W  = this.canvas.width  = window.innerWidth;
    this.H  = this.canvas.height = window.innerHeight;
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.stars = Array.from({ length: this.STAR_COUNT }, () => {
      const s = this.makeStar();
      s.pz = s.z;
      return s;
    });
  }

  animate() {
    const { ctx, W, H, cx, cy, stars, FOV, SPEED } = this;

    ctx.fillStyle = 'rgba(5,5,16,0.25)';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      s.pz = s.z;
      s.z -= SPEED;
      if (s.z <= 1) { Object.assign(s, this.makeStar()); s.z = W; s.pz = W; return; }

      const sx = (s.x / s.z) * FOV + cx;
      const sy = (s.y / s.z) * FOV + cy;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;

      const px    = (s.x / s.pz) * FOV + cx;
      const py    = (s.y / s.pz) * FOV + cy;
      const depth = 1 - s.z / W;
      const alpha = Math.min(1, depth * 1.4 + 0.05);
      const r     = Math.max(0.15, depth * s.size * 2.2);
      const [cr, cg, cb] = s.col;

      const trailLen = Math.hypot(sx - px, sy - py);
      if (trailLen > 0.5) {
        const grad = ctx.createLinearGradient(px, py, sx, sy);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},${alpha * 0.6})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = r * 0.8;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
      ctx.fill();

      if (depth > 0.7 && r > 1) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 5);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.25})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sx, sy, r * 5, 0, Math.PI * 2); ctx.fill();
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

/* ---- 5. HERO TEXT REVEAL ---- */
function revealHero() {
  // Badge
  setTimeout(() => document.getElementById('heroBadge')?.classList.add('visible'), 100);

  // Lines
  const lines = document.querySelectorAll('.hero-heading .line-inner');
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('visible'), 250 + i * 180);
  });

  // Rest
  setTimeout(() => document.getElementById('heroSub')?.classList.add('visible'), 820);
  setTimeout(() => document.getElementById('heroCtas')?.classList.add('visible'), 1020);
  setTimeout(() => document.getElementById('heroStats')?.classList.add('visible'), 1220);
}

/* ---- 6. INTERSECTION OBSERVER — SCROLL REVEALS ---- */
function initReveal() {
  const opts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, opts);

  document.querySelectorAll('.reveal, .reveal-up, .reveal-text').forEach(el => {
    observer.observe(el);
  });
}

/* ---- 7. COUNTER ANIMATION ---- */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out expo
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('.count');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ---- 8. MOBILE MENU ---- */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && mobileMenu.classList.contains('open')) closeMenu();
  });
}

/* ---- 9. SERVICE CARD — MOUSE GLOW ---- */
function initSvcGlow() {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
}

/* ---- 10. CONTACT FORM ---- */
function initForm() {
  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('formSubmit');
  const success = document.getElementById('formSuccess');

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending...';

    const data = new FormData(form);
    data.append('access_key', '358ed785-0ccc-4750-b47e-5d5a5c6bea48');
    data.append('subject',    'New contact from AgentGrid');
    data.append('from_name',  'AgentGrid Website');

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        body:    data,
      });
      const json = await res.json();

      if (json.success) {
        form.reset();
        btn.style.display = 'none';
        success.classList.add('show');
      } else {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Try Again';
      }
    } catch {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Try Again';
    }
  });
}

/* ---- 11. SMOOTH SCROLL ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.offsetTop - var_navH() + 4;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---- SCROLL HANDLER ---- */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollBar();
      updateNav();
      updateActiveLink();
      ticking = false;
    });
    ticking = true;
  }
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Particle canvas (hero only)
  const canvas = document.getElementById('heroCanvas');
  if (canvas) new ParticleCanvas(canvas);

  revealHero();
  initReveal();
  initCounters();
  initMobileMenu();
  initSvcGlow();
  initForm();
  initSmoothScroll();

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNav();
  updateScrollBar();
});
