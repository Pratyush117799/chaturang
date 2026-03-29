/* =====================================================
   CHATURANGA WEBSITE — main.js
   Navbar scroll, parallax, particles, scroll-spy,
   tab switching, smooth scroll
   ===================================================== */

(function () {
  'use strict';

  /* ---- NAVBAR: scroll + hamburger ---- */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateScrollSpy();
  }, { passive: true });

  hamburger && hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close menu on link click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---- SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- SCROLL SPY ---- */
  const sections = ['hero', 'about', 'play', 'docs', 'contribute'];
  function updateScrollSpy() {
    const scrollY = window.scrollY + 100;
    sections.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!link) return;
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  /* ---- PARALLAX HERO ---- */
  const heroBg = document.getElementById('heroBg');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (heroBg) {
          heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.3}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Mouse parallax for hero
  const heroSection = document.getElementById('hero');
  heroSection && heroSection.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 10;
    if (heroBg) {
      heroBg.style.transform = `scale(1.07) translate(${x}px, ${y}px)`;
    }
  });
  heroSection && heroSection.addEventListener('mouseleave', () => {
    if (heroBg) heroBg.style.transform = 'scale(1.05) translateY(0)';
  });

  /* ---- PARTICLE SYSTEM ---- */
  const particlesContainer = document.getElementById('particles');

  function createParticle() {
    if (!particlesContainer) return;
    const p = document.createElement('div');
    const isEmber = Math.random() > 0.4;
    p.className = `particle ${isEmber ? 'ember' : 'spark'}`;

    const size = isEmber
      ? Math.random() * 6 + 2
      : Math.random() * 3 + 1;
    const startX = Math.random() * 100; // %
    const startY = Math.random() * 40 + 50; // % — from lower half
    const dx = (Math.random() - 0.5) * 120;
    const dy = -(Math.random() * 400 + 200);
    const dr = (Math.random() - 0.5) * 720;
    const ds = Math.random() * 0.3 + 0.1;
    const duration = Math.random() * 4 + 3;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}%;
      top: ${startY}%;
      --dx: ${dx}px;
      --dy: ${dy}px;
      --dr: ${dr}deg;
      --ds: ${ds};
      animation-duration: ${duration}s;
      animation-delay: ${Math.random() * 2}s;
    `;

    particlesContainer.appendChild(p);
    setTimeout(() => p.remove(), (duration + 2) * 1000);
  }

  // Spawn particles periodically
  setInterval(createParticle, 280);
  // Initial burst
  for (let i = 0; i < 20; i++) setTimeout(createParticle, i * 150);

  /* ---- INTERSECTION OBSERVER: scroll reveals ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('revealed'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ---- DOCS TABS ---- */
  const tabs = document.querySelectorAll('.docs-tab');
  const contents = document.querySelectorAll('.docs-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById('tab-' + target);
      if (targetContent) {
        targetContent.classList.add('active');
        // Trigger reveals in newly-shown tab
        targetContent.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
          observer.observe(el);
        });
      }
    });
  });

  /* ---- HERO PIECE tooltips (mobile tap toggle) ---- */
  document.querySelectorAll('.hero-piece').forEach(piece => {
    piece.addEventListener('click', () => {
      piece.classList.toggle('tapped');
    });
  });

  /* ---- NAVBAR logo shimmer random interval ---- */
  const logoDevanagari = document.querySelector('.nav-logo .logo-devanagari');
  if (logoDevanagari) {
    setInterval(() => {
      logoDevanagari.classList.add('shimmer');
      setTimeout(() => logoDevanagari.classList.remove('shimmer'), 1200);
    }, 5000);
  }

  /* ---- PLAY CARD ripple effect ---- */
  document.querySelectorAll('.play-card-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: 10px; height: 10px;
        background: rgba(255,255,255,0.4);
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${e.offsetX}px;
        top: ${e.offsetY}px;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ---- BATTLE COUNTER (seconds since 6th century CE for fun) ---- */
  const d = new Date();
  const sinceAncient = d.getFullYear() - 550;
  const badge = document.querySelector('.hero-badge');
  if (badge) {
    badge.title = `Chaturanga has lived for ~${sinceAncient} years`;
  }

  /* ---- ACCESSIBILITY: escape closes menu ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') navLinks.classList.remove('open');
  });

  /* ---- PAGE INIT scroll check ---- */
  if (window.scrollY > 60) navbar.classList.add('scrolled');

})();
