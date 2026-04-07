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

  // ── INIT ──────────────────────────────────────────────────────────
  populateAll();

  // Listen for data updates from admin panel
  window.addEventListener('storage', (e) => {
    if (e.key === 'claraData') populateAll();
  });

})();
