// ===== PURE CLARA – MAIN SCRIPT =====

(function () {
  'use strict';

  // ── DATA ─────────────────────────────────────────────────────────
  let data = getClaraData();

  // ── LOADER ───────────────────────────────────────────────────────
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 2200);
  });

  // ── CURSOR ───────────────────────────────────────────────────────
  const cursor = document.getElementById('water-cursor');
  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .product-card, .hero-bottle, .benefit-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ── PARTICLES ────────────────────────────────────────────────────
  const particleContainer = document.getElementById('particles');
  if (particleContainer) {
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 1 + Math.random() * 4;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        --dur: ${5 + Math.random() * 12}s;
        --tx: ${(Math.random() - 0.5) * 140}px;
        animation-delay: ${Math.random() * 12}s;
        opacity: ${0.15 + Math.random() * 0.6};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
      `;
      particleContainer.appendChild(p);
    }
  }

  // ── NAVBAR ───────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    document.getElementById('scroll-top').classList.toggle('visible', window.scrollY > 400);
  });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => navObs.observe(s));

  // ── PREMIUM ANIMATION ENGINE ──────────────────────────────────────

  // Step 1: Split section titles into word spans for word-reveal
  function splitIntoWords(selector) {
    document.querySelectorAll(selector).forEach(el => {
      if (el.dataset.split) return; // already split
      el.dataset.split = 'true';
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="word">${w}&nbsp;</span>`).join('');
      el.classList.add('word-reveal');
    });
  }

  // Add shimmer lines under section headers
  function addShimmerLines() {
    document.querySelectorAll('.section-header').forEach(header => {
      if (!header.querySelector('.shimmer-line')) {
        const line = document.createElement('div');
        line.className = 'shimmer-line';
        const tag = header.querySelector('.section-tag');
        if (tag) tag.after(line); else header.prepend(line);
      }
    });
  }

  // Step 2: Master Intersection Observer
  function createRevealObserver(threshold = 0.12) {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay ? parseFloat(el.dataset.delay) * 1000 : 0;
          setTimeout(() => {
            el.classList.add('visible');
            // Trigger section-tag line animation
            el.querySelectorAll && el.querySelectorAll('.section-tag').forEach(t => t.classList.add('animate'));
          }, delay);
        }
      });
    }, { threshold, rootMargin: '0px 0px -60px 0px' });
  }

  const revealObs = createRevealObserver(0.1);

  // Observe all reveal types
  function observeRevealElements() {
    document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-flip, .word-reveal, .shimmer-line, .glow-on-scroll'
    ).forEach(el => {
      if (!el._observed) { el._observed = true; revealObs.observe(el); }
    });
  }

  // Step 3: Staggered card animations (Products, Benefits, Testimonials)
  function applyStaggerToGrids() {
    document.querySelectorAll('.products-grid, .benefits-grid, .testimonials-wrap, .deal-info, .footer-grid').forEach(grid => {
      if (grid.dataset.staggered) return;
      grid.dataset.staggered = 'true';
      const children = Array.from(grid.children);
      children.forEach((child, i) => {
        if (!child.classList.contains('reveal-up') && !child.classList.contains('reveal-scale')) {
          child.classList.add('reveal-up');
        }
        child.dataset.delay = (i * 0.12).toFixed(2);
        revealObs.observe(child);
      });
    });
  }

  // Step 4: Parallax on scroll
  function updateParallax() {
    const scrollY = window.scrollY;

    // Hero bottle parallax
    const bottle = document.getElementById('hero-bottle');
    if (bottle) {
      bottle.style.transform = `translateY(${scrollY * 0.04}px)`;
    }

    // Hero ripples parallax
    document.querySelectorAll('.water-ripple').forEach((ripple, i) => {
      ripple.style.transform = `scale(${1 + scrollY * 0.00015 * (i + 1)}) translateY(${scrollY * 0.03 * (i + 1)}px)`;
    });

    // About image parallax
    const aboutImg = document.querySelector('.about-img');
    if (aboutImg) {
      const rect = aboutImg.closest('section')?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight / 2 - rect.top) * 0.08;
        aboutImg.style.transform = `translateY(${offset}px)`;
      }
    }

    // Background text parallax (Why Clara section)
    const bgText = document.querySelector('.why-bg-text');
    if (bgText) {
      const rect = bgText.parentElement?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * 0.06;
        bgText.style.transform = `translateY(${offset}px)`;
      }
    }
  }

  // Step 5: Smooth eased counter animation
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Store original target value before first animation
        if (!e.target.dataset.target) {
          e.target.dataset.target = e.target.textContent.replace(/[^0-9.]/g, '');
          e.target.dataset.suffix = e.target.textContent.replace(/[0-9.]/g, '').trim();
        }
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.7 });
  document.querySelectorAll('.stat-num').forEach(el => {
    if (!el.dataset.target) {
      el.dataset.target = el.textContent.replace(/[^0-9.]/g, '');
      el.dataset.suffix = el.textContent.replace(/[0-9.]/g, '').trim();
    }
    counterObs.observe(el);
  });

  // Step 6: Section entrance animations (orchestrated per section)
  function addSectionAnimations() {
    // About section
    const aboutImg = document.querySelector('.about-image-wrap');
    if (aboutImg && !aboutImg.classList.contains('reveal-left')) aboutImg.classList.add('reveal-left');
    const aboutText = document.querySelector('.about-text');
    if (aboutText && !aboutText.classList.contains('reveal-right')) aboutText.classList.add('reveal-right');
    document.querySelectorAll('.feature-item').forEach((item, i) => {
      item.classList.add('reveal-up');
      item.dataset.delay = (0.2 + i * 0.12).toFixed(2);
    });

    // Contact section
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo && !contactInfo.classList.contains('reveal-left')) contactInfo.classList.add('reveal-left');
    const contactForm = document.querySelector('.contact-form-wrap');
    if (contactForm && !contactForm.classList.contains('reveal-right')) { contactForm.classList.add('reveal-right'); contactForm.dataset.delay = '0.2'; }

    // Dealership
    const dealContent = document.querySelector('.deal-content');
    if (dealContent && !dealContent.classList.contains('reveal-blur')) dealContent.classList.add('reveal-blur');

    // Hero elements (immediate stagger)
    const heroBadge = document.querySelector('.hero-badge');
    const heroTitle = document.querySelector('.hero-title');
    const heroSub   = document.querySelector('.hero-sub');
    const heroBtns  = document.querySelector('.hero-buttons');
    const heroStats = document.querySelector('.hero-stats');
    [heroBadge, heroTitle, heroSub, heroBtns, heroStats].forEach((el, i) => {
      if (el) {
        el.style.animationDelay = `${0.3 + i * 0.15}s`;
        el.style.animation = `fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.15}s both`;
      }
    });

    // Section titles - word reveal
    splitIntoWords('.section-title');
    addShimmerLines();
  }

  // Step 7: Scroll progress indicator
  function updateScrollProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    let indicator = document.getElementById('scroll-progress');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'scroll-progress';
      Object.assign(indicator.style, {
        position: 'fixed', top: '0', left: '0', height: '3px', zIndex: '10001',
        background: 'linear-gradient(90deg, #0e7490, #22d3ee)',
        transition: 'width 0.1s ease', pointerEvents: 'none'
      });
      document.body.appendChild(indicator);
    }
    indicator.style.width = (progress * 100) + '%';
  }

  // ── INIT ALL ANIMATIONS ────────────────────────────────────────────
  addSectionAnimations();
  applyStaggerToGrids();
  observeRevealElements();

  // Scroll listener for parallax + progress
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateParallax();
        updateScrollProgress();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── SCROLL TOP ────────────────────────────────────────────────────
  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ── POPULATE CONTENT ──────────────────────────────────────────────
  function populateAll() {
    data = getClaraData();
    populateHero();
    populateAbout();
    populateCampaign();
    populateArBeverages();
    populateProducts();
    populateBenefits();
    populateGallery();
    populateTestimonials();
    populateContact();
    populateDealer();
    populateFooter();
    // Re-apply animations on dynamically generated content
    setTimeout(() => {
      splitIntoWords('.section-title');
      addShimmerLines();
      applyStaggerToGrids();
      observeRevealElements();
    }, 50);
  }

  function populateHero() {
    const tagline = document.getElementById('hero-tagline');
    if (tagline) tagline.textContent = data.hero.tagline;
    const badge = document.querySelector('.hero-badge');
    if (badge) badge.textContent = data.hero.badge || 'Premium Packaged Drinking Water';
    const bottle = document.getElementById('hero-bottle');
    if (bottle && data.hero.image) bottle.src = data.hero.image;
  }

  function populateAbout() {
    const desc = document.getElementById('about-description');
    if (desc) desc.textContent = data.about.description;
    const img = document.querySelector('.about-img');
    if (img && data.about.image) img.src = data.about.image;
  }

  function populateProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    data.products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card reveal-up';
      card.innerHTML = `
        <div class="product-card-img">
          <img src="${p.image}" alt="${p.name} – CLARA Pure Water" loading="lazy" />
          <div class="product-badge">${p.badge}</div>
        </div>
        <div class="product-card-body">
          <h3>${p.name}</h3>
          <p class="product-desc">${p.shortDesc}</p>
          <div class="product-specs">
            ${p.specs.slice(0, 3).map(s => `<span class="spec">${s.label}: ${s.value}</span>`).join('')}
          </div>
          <div class="product-footer">
            <span class="product-price">${p.price}</span>
            <button class="product-btn" data-product-id="${p.id}">View Details</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-observe new elements
    document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));

    // Bind product buttons
    document.querySelectorAll('[data-product-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.currentTarget.dataset.productId;
        openProductModal(id);
      });
    });
  }

  function populateBenefits() {
    const grid = document.getElementById('benefits-grid');
    if (!grid) return;
    grid.innerHTML = '';
    data.benefits.forEach(b => {
      const card = document.createElement('div');
      card.className = 'benefit-card reveal-up';
      card.innerHTML = `<span class="benefit-icon">${b.icon}</span><h3>${b.title}</h3><p>${b.desc}</p>`;
      grid.appendChild(card);
    });
    document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));
  }

  function populateGallery() {
    const strip = document.getElementById('gallery-strip');
    const dots = document.getElementById('gal-dots');
    if (!strip || !dots) return;
    strip.innerHTML = '';
    dots.innerHTML = '';
    data.gallery.forEach((g, i) => {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      slide.innerHTML = `
        <img src="${g.image}" alt="${g.title} – CLARA Water" loading="lazy" />
        <div class="gallery-slide-overlay"></div>
        <div class="gallery-slide-text">
          <h3>${g.title}</h3>
          <p>${g.subtitle}</p>
        </div>
      `;
      strip.appendChild(slide);
      const dot = document.createElement('button');
      dot.className = 'gal-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      dots.appendChild(dot);
    });
    initGallery();
  }

  function populateTestimonials() {
    const wrap = document.getElementById('testimonials-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    data.testimonials.forEach(t => {
      const card = document.createElement('div');
      card.className = 'testimonial-card reveal-up';
      card.innerHTML = `
        <div class="testi-stars">${'★'.repeat(t.rating)}</div>
        <p class="testi-text">"${t.text}"</p>
        <div class="testi-author">
          <div class="testi-avatar">${t.name.charAt(0)}</div>
          <div>
            <div class="testi-name">${t.name}</div>
            <div class="testi-role">${t.role}</div>
          </div>
        </div>
      `;
      wrap.appendChild(card);
    });
    document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));
  }

  function populateContact() {
    const c = data.contact;
    setText('contact-phone', c.phone);
    setText('contact-email', c.email);
    setText('contact-address', c.address);
    setText('footer-phone', c.phone);
    setText('footer-email', c.email);
    setText('footer-address', c.address);
    const wabtn = document.getElementById('social-wa-btn');
    if (wabtn) wabtn.href = `https://wa.me/${c.whatsapp}`;
    const instabtn = document.getElementById('social-insta-btn');
    if (instabtn) instabtn.href = `https://instagram.com/${c.instagram.replace('@', '')}`;
  }

  function populateDealer() {
    const d = data.dealer;
    setText('dealer-text', d.text);
    const phoneLink = document.getElementById('dealer-phone-link');
    if (phoneLink) { phoneLink.textContent = d.phone; phoneLink.href = `tel:${d.phone}`; }
    const emailLink = document.getElementById('dealer-email-link');
    if (emailLink) { emailLink.textContent = d.email; emailLink.href = `mailto:${d.email}`; }
  }

  function populateFooter() {
    const f = data.footer;
    setText('footer-desc', f.description);
    setText('footer-copyright', f.copyright);
    const finsta = document.getElementById('footer-instagram');
    if (finsta) {
      finsta.textContent = data.contact.instagram;
      finsta.href = `https://instagram.com/${data.contact.instagram.replace('@', '')}`;
    }
  }

  function populateCampaign() {
    const c = data.campaign;
    if (!c) return;
    setText('campaign-badge', c.badge || 'Brand Initiative');
    setText('campaign-desc', c.description);
    setText('poster-title-text', c.videoTitle || 'Pure CLARA - Feel The Purity');
    
    const titleEl = document.getElementById('campaign-title');
    if (titleEl && c.title) {
      const words = c.title.split(' ');
      if (words.length > 2) {
        const mainPart = words.slice(0, -2).join(' ');
        const scriptPart = words.slice(-2).join(' ');
        titleEl.innerHTML = `${mainPart} <span class="script-font">${scriptPart}</span>`;
      } else {
        titleEl.textContent = c.title;
      }
    }
  }

  function populateArBeverages() {
    const a = data.arBeverages;
    if (!a) return;
    setText('ar-badge', a.badge || 'Parent Venture');
    setText('ar-slogan-text', a.slogan || 'Believe In Purity');
    setText('ar-desc-text', a.description);
    
    const titleEl = document.getElementById('ar-title');
    if (titleEl && a.title) {
      const words = a.title.split(' ');
      if (words.length > 1) {
        const mainPart = words.slice(0, -1).join(' ');
        const scriptPart = words.slice(-1).join(' ');
        titleEl.innerHTML = `${mainPart} <span class="script-font">${scriptPart}</span>`;
      } else {
        titleEl.textContent = a.title;
      }
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── GALLERY SLIDER ────────────────────────────────────────────────
  let currentSlide = 0;

  function goToSlide(index) {
    const strip = document.getElementById('gallery-strip');
    const dotsEl = document.querySelectorAll('.gal-dot');
    currentSlide = (index + data.gallery.length) % data.gallery.length;
    strip.style.transform = `translateX(-${currentSlide * 100}vw)`;
    dotsEl.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function initGallery() {
    document.getElementById('gal-prev').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('gal-next').addEventListener('click', () => goToSlide(currentSlide + 1));
    let timer = setInterval(() => goToSlide(currentSlide + 1), 4500);
    const gallery = document.querySelector('.gallery');
    if (gallery) {
      gallery.addEventListener('mouseenter', () => clearInterval(timer));
      gallery.addEventListener('mouseleave', () => { timer = setInterval(() => goToSlide(currentSlide + 1), 4500); });
    }
    // Touch support
    let touchStartX = 0;
    const strip = document.getElementById('gallery-strip');
    if (strip) {
      strip.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
      strip.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goToSlide(currentSlide + (diff > 0 ? 1 : -1));
      });
    }
  }

  // ── PRODUCT MODAL ─────────────────────────────────────────────────
  const overlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalContent = document.getElementById('modal-content');

  function openProductModal(id) {
    const product = data.products.find(p => p.id === id);
    if (!product) return;
    modalContent.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="modal-img" />
      <div class="modal-body">
        <span class="modal-badge">${product.badge}</span>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <div class="modal-specs">
          ${product.specs.map(s => `
            <div class="modal-spec-item">
              <strong>${s.label}</strong>
              <span>${s.value}</span>
            </div>
          `).join('')}
        </div>
        <div class="modal-price-row">
          <span class="modal-price">${product.price}</span>
          <a href="#contact" class="btn-primary" onclick="closeModal()">Order Now</a>
        </div>
      </div>
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window.closeModal = function () {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  modalClose.addEventListener('click', window.closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.closeModal(); });

  // Hero bottle click
  const heroBotlle = document.getElementById('hero-bottle');
  if (heroBotlle) {
    heroBotlle.addEventListener('click', () => openProductModal(1));
    heroBotlle.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProductModal(1); });
  }

  // ── CONTACT FORM ──────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = document.getElementById('form-submit');
      
      // Robust field selection relative to the form
      const name = (this.querySelector('#form-name')?.value || "").trim();
      const email = (this.querySelector('#form-email')?.value || "").trim();
      const phone = (this.querySelector('#form-phone')?.value || "").trim();
      const subject = (this.querySelector('#form-inquiry')?.value || "").trim();
      const message = (this.querySelector('#form-message')?.value || "").trim();

      // Basic validation
      if (!name) {
        alert('Please enter your name.');
        return;
      }

      const inquiry = {
        id: Date.now(),
        name: name,
        email: email || 'Not shared',
        phone: phone || 'Not shared',
        subject: subject || 'General Query',
        message: message || '(No message content)',
        date: new Date().toLocaleString(),
        status: 'new'
      };

      try {
        const inquiries = JSON.parse(localStorage.getItem('claraInquiries') || '[]');
        inquiries.unshift(inquiry);
        localStorage.setItem('claraInquiries', JSON.stringify(inquiries));
        
        console.log('✅ Inquiry saved:', inquiry);

        btn.textContent = 'Sending...';
        btn.disabled = true;

        setTimeout(() => {
          const successEl = document.getElementById('form-success');
          if (successEl) successEl.classList.add('show');
          btn.textContent = 'Send Message';
          btn.disabled = false;
          this.reset();
          
          // Safely dispatch storage event (blocked on file:// but not an error)
          try {
            window.dispatchEvent(new StorageEvent('storage', { key: 'claraInquiries', newValue: localStorage.getItem('claraInquiries') }));
          } catch(storageErr) { /* file:// protocol restriction – safe to ignore */ }
          
          if (successEl) setTimeout(() => successEl.classList.remove('show'), 5000);
        }, 1500);
      } catch (err) {
        console.error('❌ Error saving inquiry:', err);
        alert('Failed to save request. Please try again.');
      }
    });
  }

  // ── CAMPAIGN VIDEO PLAYER ─────────────────────────────────────────
  function initCampaignVideoPlayer() {
    const canvas = document.getElementById('campaign-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const playerContainer = document.getElementById('campaign-player');
    const poster = document.getElementById('player-poster');
    const centerPlayBtn = document.getElementById('center-play-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const seekBar = document.getElementById('seek-bar');
    const seekProgress = document.getElementById('seek-progress');
    const volumeSlider = document.getElementById('volume-slider');
    const timeDisplay = document.getElementById('time-display');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    const volumeUpIcon = muteBtn.querySelector('.volume-up-icon');
    const volumeMuteIcon = muteBtn.querySelector('.volume-mute-icon');

    // State variables
    let isPlaying = false;
    let isMuted = false;
    let currentVolume = 0.8;
    let currentTime = 0;
    const duration = 24; // 24 seconds total
    let lastTime = 0;
    let animFrameId = null;
    
    // Particle arrays
    let waterParticles = [];
    let splashParticles = [];
    let ripples = [];

    // Faucet path drawing details
    const faucetSpoutX = 350;
    const faucetSpoutY = 125;

    // Web Audio State
    let audioCtx = null;
    let droneOsc1 = null;
    let droneOsc2 = null;
    let droneGain = null;
    let bubbleInterval = null;

    function startAudio() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
          
          droneGain = audioCtx.createGain();
          droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
          
          const filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, audioCtx.currentTime);
          
          droneOsc1 = audioCtx.createOscillator();
          droneOsc1.type = 'triangle';
          droneOsc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2 (110Hz)
          
          droneOsc2 = audioCtx.createOscillator();
          droneOsc2.type = 'sine';
          droneOsc2.frequency.setValueAtTime(165, audioCtx.currentTime); // E3 (165Hz)
          
          droneOsc1.connect(droneGain);
          droneOsc2.connect(droneGain);
          droneGain.connect(filter);
          filter.connect(audioCtx.destination);
          
          droneOsc1.start();
          droneOsc2.start();
          
          // Bubbling droplet sound interval
          bubbleInterval = setInterval(() => {
            if (isPlaying && !isMuted) {
              playBubbleSound();
            }
          }, 140);
        }
        
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        
        updateAudioVolume();
      } catch (err) {
        console.warn("Web Audio failed to start:", err);
      }
    }

    function stopAudio() {
      if (droneGain && audioCtx) {
        droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      }
    }

    function updateAudioVolume() {
      if (!audioCtx || !droneGain) return;
      const targetGain = (isPlaying && !isMuted) ? currentVolume * 0.12 : 0;
      droneGain.gain.linearRampToValueAtTime(targetGain, audioCtx.currentTime + 0.2);
    }

    function playBubbleSound() {
      if (!audioCtx || audioCtx.state === 'suspended') return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      // High frequency pure drop sound
      const baseFreq = 750 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(currentVolume * 0.03 * (0.4 + Math.random() * 0.6), audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }

    // Canvas drawing helper function: draws one single frame of animation
    function drawFrame(t) {
      // 1. Clear with gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#040712');
      bgGrad.addColorStop(0.5, '#080d22');
      bgGrad.addColorStop(1, '#0c1b3e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid overlay
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Draw animated Spotlights
      drawSpotlight(150, 0, 180, 'rgba(14, 116, 144, 0.2)', Math.sin(t * 0.8) * 0.12);
      drawSpotlight(640, 0, 260, 'rgba(34, 211, 238, 0.15)', Math.cos(t * 0.5) * 0.15);
      drawSpotlight(1100, 0, 200, 'rgba(168, 85, 247, 0.18)', Math.sin(t * 0.6) * 0.1);

      // 3. Draw Water ripples at the bottom
      drawRipples();

      // 4. Draw Water particles & splash particles
      drawParticles();

      // 5. Draw Faucet silhouette
      drawFaucet();

      // 6. Draw Text slide
      drawTextSlide(t);
    }

    function drawSpotlight(x, y, radius, color, rotationOffset) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotationOffset);
      
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 400, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-radius, 720);
      ctx.lineTo(radius, 720);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }

    function drawFaucet() {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
      ctx.fillStyle = '#ffffff';
      
      // Vertical pipe going down from ceiling
      ctx.fillRect(180, 0, 30, 60);
      
      // Elbow joint
      ctx.beginPath();
      ctx.arc(195, 60, 15, 0, Math.PI);
      ctx.fill();
      
      // Horizontal pipe extending right
      ctx.fillRect(195, 45, 150, 30);
      
      // Valve housing (thick middle cylinder)
      ctx.fillRect(260, 35, 25, 50);
      
      // T-handle on top
      ctx.fillRect(270, 15, 5, 20); // neck
      ctx.fillRect(250, 10, 45, 8); // bar
      ctx.beginPath();
      ctx.arc(250, 14, 4, 0, Math.PI * 2);
      ctx.arc(295, 14, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Spout nozzle bend downwards
      ctx.beginPath();
      ctx.moveTo(330, 45);
      ctx.lineTo(360, 45);
      ctx.arcTo(360, 90, 340, 90, 15);
      ctx.lineTo(340, 90);
      ctx.arcTo(335, 90, 335, 75, 15);
      ctx.closePath();
      ctx.fill();
      
      // Nozzle flange
      ctx.fillRect(330, 75, 30, 10);
      
      ctx.restore();
    }

    function drawParticles() {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
      
      // Draw falling water stream drops
      waterParticles.forEach(p => {
        ctx.fillStyle = `rgba(226, 242, 254, ${p.opacity})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.radius * 0.7, p.radius * 1.5, p.angle || 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw splash particles
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      splashParticles.forEach(p => {
        ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    }

    function drawRipples() {
      ctx.save();
      ctx.lineWidth = 1.5;
      ripples.forEach(r => {
        ctx.strokeStyle = `rgba(34, 211, 238, ${r.opacity})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.3)';
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    }

    function drawTextSlide(t) {
      const campaignData = data.campaign;
      if (!campaignData || !campaignData.slides) return;
      
      // Find current active slide
      let currentSlide = null;
      for (let i = campaignData.slides.length - 1; i >= 0; i--) {
        if (t >= campaignData.slides[i].time) {
          currentSlide = campaignData.slides[i];
          break;
        }
      }
      
      if (!currentSlide) return;

      const slideIndex = campaignData.slides.indexOf(currentSlide);
      const nextSlide = campaignData.slides[slideIndex + 1];
      const endTime = nextSlide ? nextSlide.time : duration;
      
      let opacity = 1.0;
      const transitionTime = 0.8;
      const timeInSlide = t - currentSlide.time;
      const timeLeftInSlide = endTime - t;
      
      if (timeInSlide < transitionTime) {
        opacity = timeInSlide / transitionTime;
      } else if (timeLeftInSlide < transitionTime) {
        opacity = timeLeftInSlide / transitionTime;
      }
      
      if (opacity <= 0) return;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      
      const textX = 520;
      const textY = 280;
      
      // 1. Draw Section Tag (cyan uppercase)
      ctx.fillStyle = '#22d3ee';
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText((campaignData.subtitle || "").toUpperCase(), textX, textY - 40);
      
      // 2. Draw Title Text (white elegant Playfair serif)
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 36px "Playfair Display", serif';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      
      wrapText(ctx, currentSlide.text, textX, textY, 650, 46);
      
      // 3. Draw Subtitle / Description Text (silver Inter sans-serif)
      ctx.fillStyle = '#8ba8c0';
      ctx.font = '400 16px "Inter", sans-serif';
      ctx.shadowBlur = 0;
      
      const titleRowsCount = getWrappedRowsCount(ctx, currentSlide.text, 650);
      const subtextY = textY + (titleRowsCount * 46) + 12;
      wrapText(ctx, currentSlide.subtext, textX, subtextY, 600, 26);
      
      ctx.restore();
    }

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, currentY);
    }
    
    function getWrappedRowsCount(context, text, maxWidth) {
      const words = text.split(' ');
      let line = '';
      let count = 1;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          line = words[n] + ' ';
          count++;
        } else {
          line = testLine;
        }
      }
      return count;
    }

    // Physics Update Logic
    function updatePhysics(dt) {
      // 1. Generate new falling water droplets
      if (currentTime > 0.8 && currentTime < 23.5) {
        const spawnCount = 2;
        for (let i = 0; i < spawnCount; i++) {
          waterParticles.push({
            x: faucetSpoutX - 4 + Math.random() * 8,
            y: faucetSpoutY,
            vx: -0.3 + Math.random() * 0.6,
            vy: 1 + Math.random() * 2,
            radius: 2.0 + Math.random() * 1.5,
            opacity: 0.6 + Math.random() * 0.4
          });
        }
      }

      // 2. Update falling water droplets
      const gravity = 0.22;
      const targetY = canvas.height * 0.82; // ripple splash line
      
      waterParticles = waterParticles.filter(p => {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.angle = Math.atan2(p.vy, p.vx) - Math.PI / 2;
        
        if (p.y >= targetY) {
          const splashCount = 1 + Math.floor(Math.random() * 2);
          for (let j = 0; j < splashCount; j++) {
            splashParticles.push({
              x: p.x,
              y: targetY - 2,
              vx: -1.5 + Math.random() * 3,
              vy: -2.0 - Math.random() * 2.5,
              radius: p.radius * 0.4 + 0.4,
              opacity: 0.8 + Math.random() * 0.2,
              life: 1.0,
              decay: 0.05 + Math.random() * 0.05
            });
          }
          
          if (Math.random() < 0.20) {
            ripples.push({
              x: p.x,
              y: targetY,
              rx: 2,
              ry: 0.5,
              opacity: 0.7,
              expansion: 1.2 + Math.random() * 1.5
            });
          }
          return false;
        }
        return p.y < canvas.height;
      });

      // 3. Update splash particles
      splashParticles = splashParticles.filter(p => {
        p.vy += gravity * 0.8;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= p.decay;
        return p.opacity > 0 && p.y < canvas.height;
      });

      // 4. Update ripples expansion
      ripples = ripples.filter(r => {
        r.rx += r.expansion;
        r.ry = r.rx * 0.25;
        r.opacity -= 0.02;
        return r.opacity > 0;
      });
    }

    // Main Loop
    function animLoop(timestamp) {
      if (!isPlaying) return;

      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      
      const cappedDt = Math.min(dt, 0.1);
      currentTime += cappedDt;
      
      if (currentTime >= duration) {
        handleVideoEnded();
        return;
      }

      seekBar.value = currentTime;
      updateProgressBar();
      updateTimeDisplay();

      updatePhysics(cappedDt);
      drawFrame(currentTime);

      animFrameId = requestAnimationFrame(animLoop);
    }

    function updateProgressBar() {
      const pct = (currentTime / duration) * 100;
      seekProgress.style.width = pct + '%';
    }

    function updateTimeDisplay() {
      const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };
      timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }

    function playVideo() {
      isPlaying = true;
      poster.classList.add('hidden');
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      playPauseBtn.setAttribute('aria-label', 'Pause');
      
      startAudio();
      
      lastTime = 0;
      animFrameId = requestAnimationFrame(animLoop);
    }

    function pauseVideo() {
      isPlaying = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      playPauseBtn.setAttribute('aria-label', 'Play');
      
      stopAudio();
      
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      drawFrame(currentTime);
    }

    function togglePlay() {
      if (isPlaying) {
        pauseVideo();
      } else {
        playVideo();
      }
    }

    function handleVideoEnded() {
      isPlaying = false;
      currentTime = 0;
      seekBar.value = 0;
      updateProgressBar();
      updateTimeDisplay();
      
      waterParticles = [];
      splashParticles = [];
      ripples = [];
      
      poster.classList.remove('hidden');
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      playPauseBtn.setAttribute('aria-label', 'Play');
      
      stopAudio();
      
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      drawFrame(0);
    }

    // Event Bindings
    centerPlayBtn.addEventListener('click', playVideo);
    playPauseBtn.addEventListener('click', togglePlay);
    canvas.addEventListener('click', togglePlay);

    seekBar.addEventListener('input', (e) => {
      currentTime = parseFloat(e.target.value);
      updateProgressBar();
      updateTimeDisplay();
      waterParticles = [];
      splashParticles = [];
      drawFrame(currentTime);
    });

    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (isMuted) {
        volumeUpIcon.classList.add('hidden');
        volumeMuteIcon.classList.remove('hidden');
        muteBtn.setAttribute('aria-label', 'Unmute');
        volumeSlider.value = 0;
      } else {
        volumeUpIcon.classList.remove('hidden');
        volumeMuteIcon.classList.add('hidden');
        muteBtn.setAttribute('aria-label', 'Mute');
        volumeSlider.value = currentVolume;
      }
      updateAudioVolume();
    });

    volumeSlider.addEventListener('input', (e) => {
      currentVolume = parseFloat(e.target.value);
      if (currentVolume === 0) {
        isMuted = true;
        volumeUpIcon.classList.add('hidden');
        volumeMuteIcon.classList.remove('hidden');
        muteBtn.setAttribute('aria-label', 'Unmute');
      } else {
        isMuted = false;
        volumeUpIcon.classList.remove('hidden');
        volumeMuteIcon.classList.add('hidden');
        muteBtn.setAttribute('aria-label', 'Mute');
      }
      updateAudioVolume();
    });

    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().catch(err => {
          console.warn("Fullscreen request failed:", err);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Custom cursor hover states for player elements
    const cursor = document.getElementById('water-cursor');
    if (window.innerWidth > 768 && cursor) {
      playerContainer.querySelectorAll('button, input[type="range"]').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      });
    }

    // Initial render
    drawFrame(0);
  }

  // ── INIT ──────────────────────────────────────────────────────────
  populateAll();
  initCampaignVideoPlayer();

  // Listen for data updates from admin panel
  window.addEventListener('storage', (e) => {
    if (e.key === 'claraData') populateAll();
  });

})();
