// ===== PURE CLARA – ADMIN PANEL SCRIPT =====
// NO IIFE – All functions are truly global for reliable onclick access

'use strict';

// ── STATE ─────────────────────────────────────────────────────────
var _adminData       = null;
var _inquiries       = [];
var _editingIndex    = null;
var _currentFilter   = 'all';
var _uploadedImages  = {};

var ADMIN_KEY        = 'claraAdmin';
var DEFAULT_CREDS    = { username: 'admin', password: 'clara123' };

// ── HELPERS ───────────────────────────────────────────────────────
function _getData()    { if (!_adminData) _adminData = getClaraData(); return _adminData; }
function _getCreds()   { try { var s = localStorage.getItem(ADMIN_KEY); if (s) return JSON.parse(s); } catch(e){} return JSON.parse(JSON.stringify(DEFAULT_CREDS)); }
function _saveCreds(c) { localStorage.setItem(ADMIN_KEY, JSON.stringify(c)); }
function _el(id)       { return document.getElementById(id); }
function _val(id)      { var el = _el(id); return el ? (el.value || '').trim() : ''; }
function _setVal(id,v) { var el = _el(id); if (el) el.value = (v || ''); }
function _setText(id,t){ var el = _el(id); if (el) el.textContent = (t || ''); }

function _showToast(msg, type) {
  var toast = _el('toast'); if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + (type || 'success');
  setTimeout(function(){ toast.classList.remove('show'); }, 3000);
}

function _saveAndNotify(msg) {
  saveClaraData(_adminData);
  _showToast('✅ ' + (msg || 'Saved!'));
  try { window.dispatchEvent(new StorageEvent('storage', { key: 'claraData' })); } catch(e){}
  _updateDashboard();
}

function _openModal()  { var m = _el('admin-modal'); if(m){ m.classList.add('open'); document.body.style.overflow='hidden'; } }
function closeAdminModal() { var m = _el('admin-modal'); if(m){ m.classList.remove('open'); document.body.style.overflow=''; _editingIndex=null; } }

// ── AUTH ──────────────────────────────────────────────────────────
function _initAuth() {
  var loginForm = _el('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var u = _val('admin-user'), p = _val('admin-pass');
      var creds = _getCreds();
      var errEl = _el('login-error');
      if (u === creds.username && p === creds.password) {
        sessionStorage.setItem('claraAdminLoggedIn', '1');
        if(errEl) errEl.classList.remove('show');
        _showApp();
      } else {
        if(errEl) errEl.classList.add('show');
        var btn = _el('login-btn');
        if(btn){ btn.textContent='Invalid!'; setTimeout(function(){ btn.textContent='Login'; }, 1500); }
      }
    });
  }

  var logoutBtn = _el('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem('claraAdminLoggedIn');
      var app = _el('admin-app'), screen = _el('login-screen');
      if(app) app.classList.add('hidden');
      if(screen) screen.classList.remove('hidden');
      _setVal('admin-user',''); _setVal('admin-pass','');
    });
  }

  if (sessionStorage.getItem('claraAdminLoggedIn') === '1') _showApp();
}

function _showApp() {
  var screen = _el('login-screen'), app = _el('admin-app');
  if(screen) screen.classList.add('hidden');
  if(app) app.classList.remove('hidden');
  _adminData = getClaraData();
  _inquiries = JSON.parse(localStorage.getItem('claraInquiries') || '[]');
  _loadAllTabs();
  _updateDashboard();
}

// ── DASHBOARD ─────────────────────────────────────────────────────
function _updateDashboard() {
  _adminData = getClaraData();
  _inquiries = JSON.parse(localStorage.getItem('claraInquiries') || '[]');
  _setText('d-products-count',   _adminData.products.length);
  _setText('d-benefits-count',   _adminData.benefits.length);
  _setText('d-gallery-count',    _adminData.gallery.length);
  _setText('d-testimonials-count', _adminData.testimonials.length);
  _setText('dash-instagram', _adminData.contact.instagram);
  _setText('dash-phone',     _adminData.contact.phone);
  _setText('dash-email',     _adminData.contact.email);
  _updateInquiryBadge();
}

function _updateInquiryBadge() {
  var badge = _el('inquiry-count-badge'); if(!badge) return;
  var newCount = _inquiries.filter(function(i){ return i.status === 'new'; }).length;
  badge.textContent = newCount;
  badge.style.display = newCount > 0 ? 'inline-block' : 'none';
}

// ── TAB NAVIGATION ────────────────────────────────────────────────
function _initTabs() {
  document.querySelectorAll('.sidebar-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var tab = this.dataset.tab;
      document.querySelectorAll('.sidebar-link').forEach(function(l){ l.classList.remove('active'); });
      this.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(function(t){ t.classList.remove('active'); });
      var tabEl = _el('tab-' + tab);
      if(tabEl) tabEl.classList.add('active');
      
      // Re-fetch inquiries from localStorage on navigation to sync fresh data (especially under file:// protocol)
      _inquiries = JSON.parse(localStorage.getItem('claraInquiries') || '[]');
      _updateInquiryBadge();
      
      if (tab === 'inquiries') {
        renderInquiries();
      } else if (tab === 'dashboard') {
        _updateDashboard();
      }
    });
  });

  document.querySelectorAll('.qa-card').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var link = document.querySelector('.sidebar-link[data-tab="' + this.dataset.goto + '"]');
      if(link) link.click();
    });
  });

  var modal = _el('admin-modal');
  if(modal) {
    modal.addEventListener('click', function(e) {
      if(e.target === this) closeAdminModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if(e.key === 'Escape') closeAdminModal();
  });
  document.addEventListener('click', function(e) {
    var resultsDiv = _el('map-search-results');
    var input = _el('map-search-input');
    if (resultsDiv && e.target !== input && !resultsDiv.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });
}

// ── LOAD ALL TABS ─────────────────────────────────────────────────
function _loadAllTabs() {
  _loadHeroTab();
  _loadAboutTab();
  _loadProductsTab();
  _loadBenefitsTab();
  _loadGalleryTab();
  _loadTestimonialsTab();
  _loadContactTab();
  _loadDealerTab();
  _loadFooterTab();
  _loadArBeveragesTab();
  _loadMapTab();
  _loadInquiriesTab();
  _updateInquiryBadge();
}

// ── IMAGE UPLOADER ────────────────────────────────────────────────
function _imageUploaderHTML(key, currentSrc, label) {
  label = label || 'Image';
  var src = currentSrc || 'images/clara_real_bottle.png';
  return '<div class="img-uploader" id="uploader-'+key+'">' +
    '<div class="img-preview-wrap">' +
      '<img class="img-preview" id="preview-'+key+'" src="'+src+'" onerror="this.src=\'images/clara_real_bottle.png\'" />' +
      '<div class="img-overlay"><span>📷</span><span>Change Image</span></div>' +
    '</div>' +
    '<div class="img-uploader-info">' +
      '<label class="img-label">'+label+'</label>' +
      '<label class="btn-upload" for="file-'+key+'">📁 Select File</label>' +
      '<input type="file" id="file-'+key+'" class="file-input" accept="image/*" data-key="'+key+'" />' +
      '<div class="img-status" id="status-'+key+'"></div>' +
    '</div></div>';
}

function _bindImageUpload(key) {
  var input   = _el('file-' + key);
  var preview = _el('preview-' + key);
  var status  = _el('status-' + key);
  if (!input) return;
  input.addEventListener('change', function() {
    var file = this.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if(status) status.innerHTML = '<span style="color:#f87171">⚠️ Max 5MB</span>';
      return;
    }
    if(status) status.innerHTML = '<span style="color:#22d3ee">⏳ Loading...</span>';
    var reader = new FileReader();
    reader.onload = function(ev) {
      var b64 = ev.target.result;
      _uploadedImages[key] = b64;
      if(preview) preview.src = b64;
      if(status) status.innerHTML = '<span style="color:#4ade80">✅ Ready</span>';
    };
    reader.readAsDataURL(file);
  });
}

// ── HERO TAB ──────────────────────────────────────────────────────
function _loadHeroTab() {
  var d = _getData();
  _setVal('hero-tagline', d.hero.tagline);
  _setVal('hero-badge', d.hero.badge);
  var wrap = _el('hero-img-uploader');
  if(wrap){ wrap.innerHTML = _imageUploaderHTML('hero-bottle', d.hero.image, 'Hero Bottle'); _bindImageUpload('hero-bottle'); }
}
function saveHero() {
  var d = _getData();
  if(_uploadedImages['hero-bottle']) d.hero.image = _uploadedImages['hero-bottle'];
  d.hero.tagline = _val('hero-tagline');
  d.hero.badge   = _val('hero-badge');
  _saveAndNotify('Hero section saved!');
}

// ── ABOUT TAB ─────────────────────────────────────────────────────
function _loadAboutTab() {
  var d = _getData();
  _setVal('about-desc-input', d.about.description);
  var wrap = _el('about-img-uploader');
  if(wrap){ wrap.innerHTML = _imageUploaderHTML('about-img', d.about.image, 'About Image'); _bindImageUpload('about-img'); }
}
function saveAbout() {
  var d = _getData();
  if(_uploadedImages['about-img']) d.about.image = _uploadedImages['about-img'];
  d.about.description = _val('about-desc-input');
  _saveAndNotify('About section saved!');
}

// ── PRODUCTS TAB ──────────────────────────────────────────────────
function _loadProductsTab() {
  var d = _getData();
  var list = _el('products-list'); if(!list) return;
  list.innerHTML = '';
  d.products.forEach(function(p, i) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<img class="item-thumb" src="'+p.image+'" onerror="this.src=\'images/clara_real_bottle.png\'" />' +
      '<div class="item-info"><strong>'+p.name+'</strong><span>'+p.shortDesc+'</span></div>' +
      '<span class="item-badge">'+p.badge+'</span>' +
      '<span class="item-price">'+p.price+'</span>' +
      '<div class="item-actions">' +
        '<button class="btn-sm btn-edit" onclick="editProduct('+i+')">✏️</button>' +
        '<button class="btn-sm btn-del"  onclick="deleteProduct('+i+')">🗑️</button>' +
      '</div>';
    list.appendChild(row);
  });
}

function openAddProduct()   { _editingIndex = null; _openProductModal(null); }
function editProduct(i)     { _editingIndex = i;    _openProductModal(_getData().products[i]); }
function deleteProduct(i) {
  if (!confirm('Delete this product?')) return;
  _getData().products.splice(i, 1);
  _saveAndNotify('Product deleted!');
  _loadProductsTab();
}
function _openProductModal(p) {
  var d = _getData();
  var imgKey = 'product-img-' + (p ? p.id : 'new');
  var specsText = p ? p.specs.map(function(s){ return s.label+': '+s.value; }).join('\n')
    : 'Volume: 750 ml\nType: Non-Carbonated\npH Level: 7.0 – 7.5\nTDS: < 50 ppm\nCertification: BIS Certified\nPackaging: PET Bottle';
  var content = _el('modal-form-content'); if(!content) return;
  content.innerHTML =
    '<h2 class="modal-title">'+(p?'Edit':'Add')+' Product</h2>' +
    _imageUploaderHTML(imgKey, p ? p.image : null, 'Product Image') +
    '<div class="form-group mt-1"><label>Product Name</label><input type="text" id="mp-name" class="form-input" value="'+(p?p.name:'')+'" /></div>' +
    '<div class="form-group"><label>Badge</label><input type="text" id="mp-badge" class="form-input" value="'+(p?p.badge:'')+'" /></div>' +
    '<div class="form-group"><label>Short Description</label><input type="text" id="mp-short" class="form-input" value="'+(p?p.shortDesc:'')+'" /></div>' +
    '<div class="form-group"><label>Full Description</label><textarea id="mp-desc" class="form-input form-textarea" rows="3">'+(p?p.description:'')+'</textarea></div>' +
    '<div class="form-group"><label>Price</label><input type="text" id="mp-price" class="form-input" value="'+(p?p.price:'')+'" /></div>' +
    '<div class="form-group"><label>Specs (Label: Value per line)</label><textarea id="mp-specs" class="form-input form-textarea" rows="6">'+specsText+'</textarea></div>' +
    '<input type="hidden" id="mp-imgkey" value="'+imgKey+'" />' +
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeAdminModal()">Cancel</button><button class="btn-primary" onclick="saveProduct()">💾 Save</button></div>';
  _bindImageUpload(imgKey);
  _openModal();
}
function saveProduct() {
  var d = _getData();
  var imgKey = _val('mp-imgkey');
  var name   = _val('mp-name');
  if (!name) { _showToast('❌ Product name required', 'error'); return; }
  var specsRaw = _val('mp-specs').split('\n').filter(function(l){ return l.includes(':'); });
  var specs = specsRaw.map(function(l){ var idx=l.indexOf(':'); return { label:l.slice(0,idx).trim(), value:l.slice(idx+1).trim() }; });
  var currentImg = _editingIndex !== null ? d.products[_editingIndex].image : 'images/clara_real_bottle.png';
  var product = {
    id: _editingIndex !== null ? d.products[_editingIndex].id : Date.now(),
    image: _uploadedImages[imgKey] || currentImg,
    badge: _val('mp-badge'), name: name,
    shortDesc: _val('mp-short'), description: _val('mp-desc'),
    specs: specs, price: _val('mp-price'), available: true
  };
  if (_editingIndex !== null) d.products[_editingIndex] = product; else d.products.push(product);
  _saveAndNotify('Product saved!'); _loadProductsTab(); closeAdminModal();
}

// ── BENEFITS TAB ──────────────────────────────────────────────────
function _loadBenefitsTab() {
  var d = _getData();
  var list = _el('benefits-list'); if(!list) return;
  list.innerHTML = '';
  d.benefits.forEach(function(b, i) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<div class="item-icon">'+b.icon+'</div>' +
      '<div class="item-info"><strong>'+b.title+'</strong><span>'+b.desc+'</span></div>' +
      '<div class="item-actions">' +
        '<button class="btn-sm btn-edit" onclick="editBenefit('+i+')">✏️</button>' +
        '<button class="btn-sm btn-del"  onclick="deleteBenefit('+i+')">🗑️</button>' +
      '</div>';
    list.appendChild(row);
  });
}
function openAddBenefit()  { _editingIndex = null; _openBenefitModal(null); }
function editBenefit(i)    { _editingIndex = i;    _openBenefitModal(_getData().benefits[i]); }
function deleteBenefit(i)  { if(!confirm('Delete benefit?')) return; _getData().benefits.splice(i,1); _saveAndNotify('Benefit deleted!'); _loadBenefitsTab(); }
function _openBenefitModal(b) {
  var content = _el('modal-form-content'); if(!content) return;
  content.innerHTML =
    '<h2 class="modal-title">'+(b?'Edit':'Add')+' Benefit</h2>' +
    '<div class="form-group"><label>Icon (Emoji)</label><input type="text" id="mb-icon" class="form-input" value="'+(b?b.icon:'')+'" /></div>' +
    '<div class="form-group"><label>Title</label><input type="text" id="mb-title" class="form-input" value="'+(b?b.title:'')+'" /></div>' +
    '<div class="form-group"><label>Description</label><textarea id="mb-desc" class="form-input form-textarea" rows="3">'+(b?b.desc:'')+'</textarea></div>' +
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeAdminModal()">Cancel</button><button class="btn-primary" onclick="saveBenefit()">💾 Save</button></div>';
  _openModal();
}
function saveBenefit() {
  var title = _val('mb-title'); if(!title){ _showToast('❌ Title required','error'); return; }
  var b = { icon: _val('mb-icon') || '💧', title: title, desc: _val('mb-desc') };
  if(_editingIndex !== null) _getData().benefits[_editingIndex] = b; else _getData().benefits.push(b);
  _saveAndNotify('Benefit saved!'); _loadBenefitsTab(); closeAdminModal();
}

// ── GALLERY TAB ───────────────────────────────────────────────────
function _loadGalleryTab() {
  var d = _getData();
  var list = _el('gallery-list'); if(!list) return;
  list.innerHTML = '';
  d.gallery.forEach(function(g, i) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<img class="item-thumb" src="'+g.image+'" onerror="this.src=\'images/clara_real_bottle.png\'" />' +
      '<div class="item-info"><strong>'+g.title+'</strong><span>'+g.subtitle+'</span></div>' +
      '<div class="item-actions">' +
        '<button class="btn-sm btn-edit" onclick="editGallery('+i+')">✏️</button>' +
        '<button class="btn-sm btn-del"  onclick="deleteGallery('+i+')">🗑️</button>' +
      '</div>';
    list.appendChild(row);
  });
}
function openAddGallery()   { _editingIndex = null; _openGalleryModal(null); }
function editGallery(i)     { _editingIndex = i;    _openGalleryModal(_getData().gallery[i]); }
function deleteGallery(i)   { if(!confirm('Delete slide?')) return; _getData().gallery.splice(i,1); _saveAndNotify('Slide deleted!'); _loadGalleryTab(); }
function _openGalleryModal(g) {
  var d = _getData();
  var imgKey = 'gallery-img-' + (g ? d.gallery.indexOf(g) : 'new');
  var content = _el('modal-form-content'); if(!content) return;
  content.innerHTML =
    '<h2 class="modal-title">'+(g?'Edit':'Add')+' Gallery Slide</h2>' +
    _imageUploaderHTML(imgKey, g ? g.image : null, 'Slide Image') +
    '<div class="form-group mt-1"><label>Title</label><input type="text" id="mg-title" class="form-input" value="'+(g?g.title:'')+'" /></div>' +
    '<div class="form-group"><label>Subtitle</label><input type="text" id="mg-subtitle" class="form-input" value="'+(g?g.subtitle:'')+'" /></div>' +
    '<input type="hidden" id="mg-imgkey" value="'+imgKey+'" />' +
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeAdminModal()">Cancel</button><button class="btn-primary" onclick="saveGallery()">💾 Save</button></div>';
  _bindImageUpload(imgKey); _openModal();
}
function saveGallery() {
  var imgKey = _val('mg-imgkey');
  var currentImg = _editingIndex !== null ? _getData().gallery[_editingIndex].image : 'images/clara_real_bottle.png';
  var slide = { image: _uploadedImages[imgKey] || currentImg, title: _val('mg-title'), subtitle: _val('mg-subtitle') };
  if(_editingIndex !== null) _getData().gallery[_editingIndex] = slide; else _getData().gallery.push(slide);
  _saveAndNotify('Slide saved!'); _loadGalleryTab(); closeAdminModal();
}

// ── TESTIMONIALS TAB ──────────────────────────────────────────────
function _loadTestimonialsTab() {
  var d = _getData();
  var list = _el('testimonials-list'); if(!list) return;
  list.innerHTML = '';
  d.testimonials.forEach(function(t, i) {
    var row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<div class="item-icon">💬</div>' +
      '<div class="item-info"><strong>'+t.name+'</strong><span>'+t.role+'</span></div>' +
      '<div class="item-actions">' +
        '<button class="btn-sm btn-edit" onclick="editTestimonial('+i+')">✏️</button>' +
        '<button class="btn-sm btn-del"  onclick="deleteTestimonial('+i+')">🗑️</button>' +
      '</div>';
    list.appendChild(row);
  });
}
function openAddTestimonial()  { _editingIndex = null; _openTestimonialModal(null); }
function editTestimonial(i)    { _editingIndex = i;    _openTestimonialModal(_getData().testimonials[i]); }
function deleteTestimonial(i)  { if(!confirm('Delete review?')) return; _getData().testimonials.splice(i,1); _saveAndNotify('Review deleted!'); _loadTestimonialsTab(); }
function _openTestimonialModal(t) {
  var content = _el('modal-form-content'); if(!content) return;
  content.innerHTML =
    '<h2 class="modal-title">'+(t?'Edit':'Add')+' Review</h2>' +
    '<div class="form-group"><label>Name</label><input type="text" id="mt-name" class="form-input" value="'+(t?t.name:'')+'" /></div>' +
    '<div class="form-group"><label>Role / Location</label><input type="text" id="mt-role" class="form-input" value="'+(t?t.role:'')+'" /></div>' +
    '<div class="form-group"><label>Rating (1-5)</label><input type="number" id="mt-rating" class="form-input" min="1" max="5" value="'+(t?t.rating:5)+'" /></div>' +
    '<div class="form-group"><label>Message</label><textarea id="mt-text" class="form-input form-textarea" rows="4">'+(t?t.text:'')+'</textarea></div>' +
    '<div class="modal-actions"><button class="btn-cancel" onclick="closeAdminModal()">Cancel</button><button class="btn-primary" onclick="saveTestimonial()">💾 Save</button></div>';
  _openModal();
}
function saveTestimonial() {
  var name = _val('mt-name'); if(!name){ _showToast('❌ Name required','error'); return; }
  var t = { name: name, role: _val('mt-role'), rating: Math.min(5, Math.max(1, parseInt(_val('mt-rating')) || 5)), text: _val('mt-text') };
  if(_editingIndex !== null) _getData().testimonials[_editingIndex] = t; else _getData().testimonials.push(t);
  _saveAndNotify('Review saved!'); _loadTestimonialsTab(); closeAdminModal();
}

// ── CONTACT TAB ────────────────────────────────────────────────────
function _loadContactTab() {
  var d = _getData();
  _setVal('c-phone', d.contact.phone); _setVal('c-email', d.contact.email);
  _setVal('c-address', d.contact.address); _setVal('c-instagram', d.contact.instagram);
  _setVal('c-whatsapp', d.contact.whatsapp);
}
function saveContact() {
  var d = _getData();
  d.contact.phone = _val('c-phone'); d.contact.email = _val('c-email');
  d.contact.address = _val('c-address'); d.contact.instagram = _val('c-instagram');
  d.contact.whatsapp = _val('c-whatsapp');
  _saveAndNotify('Contact info saved!');
}

// ── DEALER TAB ─────────────────────────────────────────────────────
function _loadDealerTab() {
  var d = _getData();
  _setVal('d-text', d.dealer.text); _setVal('d-phone', d.dealer.phone); _setVal('d-email', d.dealer.email);
}
function saveDealer() {
  var d = _getData();
  d.dealer.text = _val('d-text'); d.dealer.phone = _val('d-phone'); d.dealer.email = _val('d-email');
  _saveAndNotify('Dealership info saved!');
}

// ── FOOTER TAB ─────────────────────────────────────────────────────
function _loadFooterTab() {
  var d = _getData();
  _setVal('f-desc', d.footer.description); _setVal('f-copyright', d.footer.copyright);
}
function saveFooter() {
  var d = _getData();
  d.footer.description = _val('f-desc'); d.footer.copyright = _val('f-copyright');
  _saveAndNotify('Footer saved!');
}

// ── AR BEVERAGES TAB ────────────────────────────────────────────────
function _loadArBeveragesTab() {
  var d = _getData();
  var ar = d.arBeverages || { badge: "Parent Venture", title: "AR BEVERAGES", slogan: "Believe In Purity", description: "" };
  _setVal('ar-badge-input', ar.badge);
  _setVal('ar-title-input', ar.title);
  _setVal('ar-slogan-input', ar.slogan);
  _setVal('ar-desc-input', ar.description);
}
function saveArBeverages() {
  var d = _getData();
  d.arBeverages = {
    badge: _val('ar-badge-input'),
    title: _val('ar-title-input'),
    slogan: _val('ar-slogan-input'),
    description: _val('ar-desc-input')
  };
  _saveAndNotify('AR Beverages section saved!');
}

// ── MAP TAB ────────────────────────────────────────────────────────
var _autocompleteInitialized = false;

function _loadMapTab() {
  var d = _getData();
  var m = d.map || {
    apiKey: "",
    latitude: 23.073171,
    longitude: 72.731736,
    zoom: 8,
    factoryName: "Huka Gam, Huka, Gujarat 382330",
    address: "Huka Gam, Huka, Gujarat 382330",
    phone: "+91 96625 50051",
    email: "info@pureclarawater.com",
    timings: "Mon - Sat: 9:00 AM - 6:00 PM"
  };
  _setVal('map-api-key', m.apiKey);
  _setVal('map-lat', m.latitude);
  _setVal('map-lng', m.longitude);
  _setVal('map-zoom', m.zoom);
  _setVal('map-factory-name', m.factoryName);
  _setVal('map-address', m.address);
  _setVal('map-phone', m.phone || '');
  _setVal('map-email', m.email || '');
  _setVal('map-timings', m.timings || '');
  _setVal('map-search-input', '');

  // Hide custom search results dropdown
  var resultsDiv = _el('map-search-results');
  if (resultsDiv) resultsDiv.style.display = 'none';

  // Auto-init search autocomplete if key is saved
  if (m.apiKey && m.apiKey.trim() !== "" && m.apiKey.indexOf("YOUR_") === -1) {
    setTimeout(function() {
      initSearchAutocomplete();
    }, 300);
  } else {
    // If no Google API key, initialize OpenStreetMap search fallback automatically
    setTimeout(function() {
      initOsmSearchFallback();
    }, 300);
  }
}

function initSearchAutocomplete() {
  var apiKey = _val('map-api-key');
  if (!apiKey || apiKey.trim() === "" || apiKey.indexOf("YOUR_") !== -1) {
    _showToast('ℹ️ Using free OpenStreetMap search (no Google key set).');
    initOsmSearchFallback();
    return;
  }

  if (window.google && window.google.maps && window.google.maps.places) {
    _setupAutocomplete();
    return;
  }

  var btn = _el('btn-init-search');
  if (btn) btn.textContent = '⏳ Loading...';

  var script = document.getElementById('admin-google-maps-api-script');
  if (script) {
    var checkInterval = setInterval(function() {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(checkInterval);
        if (btn) btn.textContent = 'Initialize Search';
        _setupAutocomplete();
      }
    }, 100);
    return;
  }

  script = document.createElement('script');
  script.id = 'admin-google-maps-api-script';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey.trim()) + '&libraries=places&callback=initAdminGoogleMapPlaces';
  script.async = true;
  script.defer = true;
  
  window.initAdminGoogleMapPlaces = function() {
    delete window.initAdminGoogleMapPlaces;
    if (btn) btn.textContent = 'Initialize Search';
    _setupAutocomplete();
  };

  document.head.appendChild(script);
}

var _osmSearchInitialized = false;

function initOsmSearchFallback() {
  var input = _el('map-search-input');
  if (!input) return;

  if (_osmSearchInitialized || _autocompleteInitialized) {
    return;
  }

  var searchTimeout = null;
  input.addEventListener('input', function() {
    if (_autocompleteInitialized) return;

    clearTimeout(searchTimeout);
    var query = input.value.trim();
    if (query.length < 3) {
      var resultsDiv = _el('map-search-results');
      if (resultsDiv) resultsDiv.style.display = 'none';
      return;
    }
    searchTimeout = setTimeout(function() {
      fetchNominatimSearch(query);
    }, 600);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimeout);
      var query = input.value.trim();
      if (query.length >= 2) {
        fetchNominatimSearch(query);
      }
    }
  });

  _osmSearchInitialized = true;
  var btn = _el('btn-init-search');
  if (btn) {
    btn.textContent = '✓ OSM Active';
    btn.style.background = 'rgba(74, 222, 128, 0.2)';
    btn.style.border = '1px solid rgba(74, 222, 128, 0.4)';
    btn.style.color = 'var(--success)';
  }
}

function fetchNominatimSearch(query) {
  var resultsDiv = _el('map-search-results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = '<div style="padding:12px;color:var(--text-secondary);font-size:0.82rem;">⏳ Searching OpenStreetMap...</div>';
  resultsDiv.style.display = 'block';

  var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=5';

  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data || data.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:12px;color:var(--text-secondary);font-size:0.82rem;">❌ No locations found. Try a different query.</div>';
        return;
      }
      resultsDiv.innerHTML = data.map(function(item) {
        var cleanAddress = escapeJsString(item.display_name);
        return '<div class="search-result-item" onclick="selectNominatimResult(' + 
          item.lat + ',' + item.lon + ',\'' + cleanAddress + '\')" ' +
          'style="padding:12px 14px; border-bottom:1px solid rgba(14,116,144,0.12); cursor:pointer; font-size:0.82rem; color:var(--text-primary); transition:background 0.2s; line-height:1.4;">' + 
          item.display_name + 
        '</div>';
      }).join('');

      resultsDiv.querySelectorAll('.search-result-item').forEach(function(el) {
        el.addEventListener('mouseenter', function() { el.style.background = 'rgba(14,116,144,0.15)'; });
        el.addEventListener('mouseleave', function() { el.style.background = 'transparent'; });
      });
    })
    .catch(function(err) {
      console.error("OSM Nominatim error:", err);
      resultsDiv.innerHTML = '<div style="padding:12px;color:var(--danger);font-size:0.82rem;">❌ Search failed. Check network connection.</div>';
    });
}

function selectNominatimResult(lat, lon, displayName) {
  _setVal('map-lat', lat);
  _setVal('map-lng', lon);
  _setVal('map-address', displayName);

  var parts = displayName.split(',');
  var title = parts[0] ? parts[0].trim() : 'Pure CLARA Factory';
  _setVal('map-factory-name', title);
  _setVal('map-search-input', displayName);

  var resultsDiv = _el('map-search-results');
  if (resultsDiv) resultsDiv.style.display = 'none';

  _showToast('📍 Selected: ' + title);
}

function escapeJsString(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function _setupAutocomplete() {
  var input = _el('map-search-input');
  if (!input) return;

  if (_autocompleteInitialized) {
    _showToast('✅ Search Autocomplete is already active!');
    return;
  }

  try {
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        _showToast('❌ No details available for input: \'' + place.name + '\'', 'error');
        return;
      }

      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();

      _setVal('map-lat', lat);
      _setVal('map-lng', lng);
      _setVal('map-address', place.formatted_address || place.name);
      _setVal('map-factory-name', place.name);

      _showToast('📍 Selected: ' + place.name);
    });

    _autocompleteInitialized = true;
    _showToast('✅ Google Places Autocomplete enabled!');
    var btn = _el('btn-init-search');
    if (btn) {
      btn.textContent = '✓ Active';
      btn.style.background = 'var(--gradient-gold)';
      btn.style.color = 'var(--black)';
    }
  } catch (err) {
    console.error("Error setting up places autocomplete:", err);
    _showToast('❌ Failed to enable search autocomplete.', 'error');
  }
}

function saveMapSettings() {
  var d = _getData();
  var lat = parseFloat(_val('map-lat'));
  var lng = parseFloat(_val('map-lng'));
  var zoom = parseInt(_val('map-zoom'));

  if (isNaN(lat) || isNaN(lng)) {
    _showToast('❌ Latitude and Longitude must be valid numbers.', 'error');
    return;
  }
  if (isNaN(zoom) || zoom < 1 || zoom > 20) {
    _showToast('❌ Zoom level must be a number between 1 and 20.', 'error');
    return;
  }

  d.map = {
    apiKey: _val('map-api-key'),
    latitude: lat,
    longitude: lng,
    zoom: zoom,
    factoryName: _val('map-factory-name') || 'Pure CLARA Factory',
    address: _val('map-address') || 'Gujarat, India',
    phone: _val('map-phone'),
    email: _val('map-email'),
    timings: _val('map-timings')
  };
  _saveAndNotify('Factory Map settings saved!');
}

// ── SETTINGS ───────────────────────────────────────────────────────
function changePassword() {
  var curr = _val('s-current'), newp = _val('s-new'), conf = _val('s-confirm');
  var creds = _getCreds(), msg = _el('pw-msg');
  function _pwMsg(color, text) {
    if(msg) { msg.style.cssText='color:'+color+';background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;margin-top:10px;display:block'; msg.textContent=text; }
  }
  if (curr !== creds.password) { _pwMsg('#f87171','❌ Current password is incorrect.'); return; }
  if (!newp || newp.length < 6)  { _pwMsg('#f87171','❌ Minimum 6 characters required.'); return; }
  if (newp !== conf)              { _pwMsg('#f87171','❌ Passwords do not match.'); return; }
  _saveCreds({ username: creds.username, password: newp });
  _pwMsg('#4ade80','✅ Password changed successfully!');
  ['s-current','s-new','s-confirm'].forEach(function(id){ _setVal(id,''); });
}

function resetData() {
  if (!confirm('⚠️ Reset ALL data to defaults? This CANNOT be undone.')) return;
  localStorage.removeItem('claraData');
  _adminData = null;
  _uploadedImages = {};
  _loadAllTabs();
  _saveAndNotify('Data reset to defaults!');
}

// ── INQUIRIES TAB ──────────────────────────────────────────────────
function _loadInquiriesTab() {
  _inquiries = JSON.parse(localStorage.getItem('claraInquiries') || '[]');
  renderInquiries();
}

function setInquiryFilter(status) {
  _currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(function(btn){
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  renderInquiries();
}

function filterInquiries() { renderInquiries(); }

function renderInquiries() {
  var list = _el('inquiries-list'); if(!list) return;
  var query = (_el('inquiry-search') ? _el('inquiry-search').value || '' : '').toLowerCase().trim();
  var filtered = _inquiries.slice();

  if (_currentFilter !== 'all') {
    filtered = filtered.filter(function(i){ return i.status === _currentFilter; });
  }
  if (query) {
    filtered = filtered.filter(function(i){
      return (i.name||'').toLowerCase().includes(query) ||
             (i.email||'').toLowerCase().includes(query) ||
             (i.phone||'').toLowerCase().includes(query) ||
             (i.message||'').toLowerCase().includes(query);
    });
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📭 No matching requests found.</div>';
    return;
  }

  list.innerHTML = filtered.map(function(inq) {
    var statusTag = inq.status || 'new';
    var readBtn = statusTag === 'new'
      ? '<button class="btn-sm btn-edit" onclick="markInquiryRead(' + inq.id + ')">✅ Mark Read</button>'
      : '';
    return '<div class="inquiry-card ' + statusTag + '" style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:16px;">' +
      '<div class="inquiry-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px;">' +
        '<div>' +
          '<div class="inquiry-name" style="font-size:1.1rem;font-weight:600;color:#f1f5f9;margin-bottom:4px;">' +
            (inq.name || 'Anonymous') +
            ' <span style="font-size:0.7rem;padding:2px 8px;border-radius:20px;background:' + (statusTag==='new'?'#0ea5e9':'#22c55e') + ';color:#fff;margin-left:6px;">' + statusTag.toUpperCase() + '</span>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:0.83rem;color:#94a3b8;">' +
            '<span>📧 ' + (inq.email || 'Not shared') + '</span>' +
            '<span>📱 ' + (inq.phone || 'Not shared') + '</span>' +
            '<span>📋 ' + (inq.subject || 'General Query') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:#0f172a;border-radius:8px;padding:14px;color:#cbd5e1;font-size:0.9rem;line-height:1.6;margin-bottom:12px;">' +
        (inq.message || '(No message content)') +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:#64748b;">' +
        '<span>🕒 ' + (inq.date || 'Unknown date') + '</span>' +
        '<div style="display:flex;gap:8px;">' +
          readBtn +
          '<button class="btn-sm btn-del" onclick="deleteInquiry(' + inq.id + ')">🗑️ Delete</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function markInquiryRead(id) {
  var idx = _inquiries.findIndex(function(i){ return i.id === id; });
  if (idx !== -1) {
    _inquiries[idx].status = 'read';
    localStorage.setItem('claraInquiries', JSON.stringify(_inquiries));
    renderInquiries();
    _updateInquiryBadge();
    _showToast('✅ Marked as responded');
  }
}

function deleteInquiry(id) {
  if (!confirm('Permanently delete this inquiry?')) return;
  _inquiries = _inquiries.filter(function(i){ return i.id !== id; });
  localStorage.setItem('claraInquiries', JSON.stringify(_inquiries));
  renderInquiries();
  _updateInquiryBadge();
  _showToast('🗑️ Inquiry deleted');
}

// ── CROSS-TAB STORAGE SYNC ────────────────────────────────────────
window.addEventListener('storage', function(e) {
  if (e.key === 'claraInquiries') {
    _inquiries = JSON.parse(e.newValue || '[]');
    renderInquiries();
    _updateInquiryBadge();
  }
  if (e.key === 'claraData') {
    _adminData = null; // force re-fetch
    _loadAllTabs();
    _updateDashboard();
  }
});

// ── STARTUP ───────────────────────────────────────────────────────
// Wait for DOM to be ready before initializing
(function _init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      _initAuth();
      _initTabs();
    });
  } else {
    _initAuth();
    _initTabs();
  }
})();

console.log('✅ CLARA Admin Panel v3 – Fully Global Functions');
