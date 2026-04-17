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
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.particles = [];
    this.mouse  = { x: -9999, y: -9999 };
    this.raf    = null;
    this.resize();
    this.createParticles();
    window.addEventListener('resize', () => { this.resize(); this.createParticles(); });
    document.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.animate();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const area  = this.canvas.width * this.canvas.height;
    const count = Math.floor(area / 14000);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r:  Math.random() * 1.4 + 0.5,
        a:  Math.random() * 0.45 + 0.15,
      });
    }
  }

  animate() {
    const { ctx, canvas, particles, mouse } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // Mouse repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const f = (140 - dist) / 140;
        p.x += dx * f * 0.022;
        p.y += dy * f * 0.022;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${p.a})`;
      ctx.fill();
    });

    // Connections
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const alpha = ((maxDist - d) / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    this.raf = requestAnimationFrame(() => this.animate());
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

  form?.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending...';

    // Simulate async
    setTimeout(() => {
      form.reset();
      btn.style.display = 'none';
      success.classList.add('show');
    }, 1200);
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
