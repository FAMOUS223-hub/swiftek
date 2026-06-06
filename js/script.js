const WHATSAPP_NUMBER = '233204694657';
let cart = JSON.parse(localStorage.getItem('swiftek_cart')) || [];

function getAdminProducts() {
  try {
    return JSON.parse(localStorage.getItem('swiftek_admin_products')) || [];
  } catch {
    return [];
  }
}

function getDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem('swiftek_admin_deleted')) || [];
  } catch {
    return [];
  }
}

function getStoreProducts() {
  const adminProducts = getAdminProducts();
  const deletedIds = getDeletedIds();
  const merged = products
    .filter(p => !deletedIds.includes(p.id))
    .map(p => ({ ...p }));

  adminProducts.forEach(item => {
    if (item._adminCreated) {
      merged.push(item);
      return;
    }

    const existingIndex = merged.findIndex(p => p.id === item.id);
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...item };
    } else {
      merged.push(item);
    }
  });

  return merged;
}

function saveCart() {
  localStorage.setItem('swiftek_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(productId, selectedOptions = {}) {
  const product = getProductById(productId);
  if (!product) return;

  let totalPrice = product.basePrice;
  const specParts = [];

  for (const [key, value] of Object.entries(selectedOptions)) {
    if (product.options[key]) {
      const opt = product.options[key].find(o => o.label === value);
      if (opt) {
        totalPrice += opt.price || 0;
        specParts.push(value);
      }
    }
  }

  const existingIndex = cart.findIndex(item =>
    item.productId === productId &&
    JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
  );

  if (existingIndex >= 0) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      productId,
      selectedOptions: selectedOptions || {},
      qty: 1,
      price: totalPrice,
      specs: specParts.join(', ')
    });
  }

  saveCart();
  showToast(`<span class="toast-icon">✓</span> ${product.name} added to cart`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function updateQty(index, delta) {
  if (cart[index].qty + delta <= 0) {
    removeFromCart(index);
    return;
  }
  cart[index].qty += delta;
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getProductById(id) {
  return getStoreProducts().find(p => p.id === id);
}

function formatPrice(price) {
  return `GH₵ ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 2600);
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  const total = getCartTotal();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true });
  const orderRef = `SWF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  let message = `┌──────────────────────────────────────────%0A`;
  message += `│  🛍️  *NEW ORDER — SwifTek Accessories*%0A`;
  message += `│  ${dateStr} at ${timeStr}%0A`;
  message += `│  Ref: *${orderRef}*%0A`;
  message += `└──────────────────────────────────────────%0A%0A`;

  message += `*📋 ORDER ITEMS*%0A`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0A`;

  cart.forEach((item, i) => {
    const product = getProductById(item.productId);
    if (!product) return;
    message += `%0A`;
    message += `*${i + 1}. ${escapeHtml(product.name)}*%0A`;
    if (item.specs) message += `   ─ ${escapeHtml(item.specs)}%0A`;
    message += `   Qty: ${item.qty}  ×  ${formatPrice(item.price)}%0A`;
    message += `   ─────────────────────────%0A`;
  });

  message += `%0A━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0A`;
  message += `*💰  TOTAL AMOUNT  ${formatPrice(total)}*%0A`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0A%0A`;

  message += `*👤 CUSTOMER INFO*%0A`;
  message += `Please provide your full name and delivery address so we can process your order.%0A%0A`;

  message += `*📦 DELIVERY*%0A`;
  message += `📍 Delivery: *Accra, Ghana* (or specify your location)%0A`;
  message += `🚚 Shipping: *Free*%0A`;
  message += `⏱️ Estimated: 1–3 business days%0A%0A`;

  message += `*💳 PAYMENT*%0A`;
  message += `Pay on delivery (Cash / Mobile Money) or bank transfer.%0A%0A`;

  message += `────────────────────────────────────────────%0A`;
  message += `*SwifTek Accessories* — Premium Tech Store 🇬🇭%0A`;
  message += `📞 ${WHATSAPP_NUMBER}%0A`;
  message += `Thank you for your order! 🙏`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');

  clearCart();
}

function applyPromo() {
  showToast('No promo codes are available at the moment.');
}

function renderProducts(productsToRender, containerId = 'products-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!productsToRender || productsToRender.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter</p>
      </div>
    `;
    return;
  }

  container.innerHTML = productsToRender.map(product => {
    const img = product.images[0] || '';
    const badge = product.featured
      ? '<span class="product-badge featured">Featured</span>'
      : '';
    const name = escapeHtml(product.name);
    const brand = escapeHtml(product.brand);
    return `
      <a href="product.html?id=${product.id}" class="product-card">
        <div class="product-card-image">
          <img src="${img}" alt="${name}" loading="lazy"
               onerror="this.onerror=null;this.src='https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?w=400&q=80'">
          <div class="product-card-badges">
            ${badge}
            ${!product.inStock ? '<span class="product-badge badge-sold-out">Sold Out</span>' : ''}
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-brand">${brand}</div>
          <div class="product-card-title">${name}</div>
          <div class="product-card-footer">
            <div class="product-card-price">
              <span class="label">from </span>${formatPrice(product.basePrice)}
            </div>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function renderCart() {
  const container = document.querySelector('.cart-items');
  const summary = document.querySelector('.cart-summary');
  const empty = document.querySelector('.cart-empty');
  const countLabel = document.querySelector('.cart-count-label');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    if (summary) summary.classList.add('hidden');
    if (countLabel) countLabel.textContent = '0 items';
    return;
  }

  if (empty) empty.classList.add('hidden');
  if (summary) summary.classList.remove('hidden');
  if (countLabel) countLabel.textContent = `${cart.length} item${cart.length > 1 ? 's' : ''}`;

  container.innerHTML = cart.map((item, index) => {
    const product = getProductById(item.productId);
    if (!product) return '';
    const img = product.images[0];
    const name = escapeHtml(product.name);
    const specs = item.specs ? escapeHtml(item.specs) : '';
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${img}" alt="${name}"
               loading="lazy"
               onerror="this.onerror=null;this.src='https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?w=200&q=80'">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          ${specs ? `<div class="cart-item-specs">${specs}</div>` : ''}
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Remove">✕</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (summary) {
    const total = getCartTotal();
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = formatPrice(total);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }
}

function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = getProductById(id);

  if (!product) {
    const el = document.querySelector('.product-detail');
    if (el) {
      el.innerHTML = `
        <div class="container">
          <div class="no-results">
            <div class="icon">😕</div>
            <h3>Product not found</h3>
            <p>The product you're looking for doesn't exist</p>
            <a href="index.html" class="btn btn-primary" style="display:inline-flex;margin-top:16px;">Back to Store</a>
          </div>
        </div>
      `;
    }
    return;
  }

  document.title = `${product.name} — SwifTek`;

  let selectedOptions = {};

  for (const [key, options] of Object.entries(product.options)) {
    if (options.length > 0 && !selectedOptions[key]) {
      selectedOptions[key] = options[0].label;
    }
  }

  function getTotalPrice() {
    let price = product.basePrice;
    for (const [key, value] of Object.entries(selectedOptions)) {
      if (product.options[key]) {
        const opt = product.options[key].find(o => o.label === value);
        if (opt) price += opt.price || 0;
      }
    }
    return price;
  }

  function renderOptions() {
    let html = '';
    for (const [key, options] of Object.entries(product.options)) {
      if (!options.length) continue;
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const isColor = key === 'color';

      html += `<div class="opt-group">`;
      html += `<div class="opt-label">${label}: <span class="opt-selected" id="sel-${key}">${selectedOptions[key] || ''}</span></div>`;
      html += `<div class="opt-list">`;

      options.forEach(opt => {
        const optLabel = escapeHtml(opt.label);
        const optValue = opt.label.replace(/'/g, "\\'");
        if (isColor) {
          html += `
            <button class="color-swatch ${selectedOptions[key] === opt.label ? 'selected' : ''}"
                    style="background:${opt.hex}"
                    data-key="${key}"
                    data-value="${optValue}"
                    onclick="window.selectOption('${key}', '${optValue}', this)">
              <span class="tooltip">${optLabel}</span>
            </button>
          `;
        } else {
          const priceStr = opt.price > 0 ? ` +${formatPrice(opt.price)}` : '';
          html += `
            <button class="opt-btn ${selectedOptions[key] === opt.label ? 'selected' : ''}"
                    data-key="${key}"
                    data-value="${optValue}"
                    onclick="window.selectOption('${key}', '${optValue}', this)">
              ${optLabel}${priceStr}
            </button>
          `;
        }
      });

      html += `</div></div>`;
    }
    return html;
  }

  window.selectOption = function(key, value, btnEl) {
    selectedOptions[key] = value;

    document.querySelectorAll(`[data-key="${key}"]`).forEach(el => {
      el.classList.remove('selected');
    });

    if (btnEl) btnEl.classList.add('selected');

    const selSpan = document.getElementById(`sel-${key}`);
    if (selSpan) selSpan.textContent = value;

    updatePrice();
  };

  function updatePrice() {
    const el = document.getElementById('detail-price');
    if (el) el.textContent = formatPrice(getTotalPrice());
  }

  let currentImageIndex = 0;

  function renderGallery() {
    const main = document.getElementById('gallery-main');
    const thumbs = document.getElementById('gallery-thumbs');
    if (!main) return;

    main.innerHTML = `<img src="${product.images[currentImageIndex]}" alt="${product.name}"
      onerror="this.onerror=null;this.src='https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?w=600&q=80'">`;

    if (thumbs && product.images.length > 1) {
      thumbs.innerHTML = product.images.map((img, i) =>
        `<img src="${img}" alt="" class="${i === currentImageIndex ? 'active' : ''}"
          onclick="window.selectImage(${i})"
          onerror="this.onerror=null;this.src='https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?w=100&q=80'">`
      ).join('');
    }
  }

  window.selectImage = function(index) {
    currentImageIndex = index;
    renderGallery();
  };

  window.addCurrentToCart = function() {
    addToCart(product.id, { ...selectedOptions });
    const btn = document.querySelector('.add-cart-btn');
    if (btn) {
      btn.classList.add('added');
      btn.innerHTML = '✓ Added to Cart';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        Add to Cart — ${formatPrice(getTotalPrice())}`;
      }, 2000);
    }
  };

  const specsRows = Object.entries(product.specifications).map(([key, val]) =>
    `<div class="spec-row"><div class="spec-label">${escapeHtml(key.replace(/([A-Z])/g, ' $1').trim())}</div><div class="spec-value">${escapeHtml(val)}</div></div>`
  ).join('');

  const contentEl = document.getElementById('product-detail-content');
  if (!contentEl) return;

  const pName = escapeHtml(product.name);
  const pBrand = escapeHtml(product.brand);
  const pDesc = escapeHtml(product.description);
  const pCategory = escapeHtml(product.category);

  contentEl.innerHTML = `
    <div>
      <div class="gallery">
        <div class="gallery-main" id="gallery-main"></div>
        <div class="gallery-thumbs" id="gallery-thumbs"></div>
      </div>
    </div>
    <div>
      <a href="index.html" class="back-link">← Back to Store</a>

      <div class="product-meta">
        <h1 class="product-name">${pName}</h1>
        <div class="product-sub">
          <span class="product-sub-brand">${pBrand}</span>
          <span class="product-sub-divider"></span>
          <span class="product-sub-brand">${pCategory}</span>
          ${product.inStock ? '<span class="product-sub-divider"></span><span class="product-sub-stock">● In Stock</span>' : ''}
        </div>
      </div>

      <div class="product-pricing">
        <span class="product-price-main" id="detail-price">${formatPrice(getTotalPrice())}</span>
        ${product.options && Object.keys(product.options).length > 0 ? '<span class="product-price-label">(as configured)</span>' : ''}
      </div>

      <p class="product-desc">${pDesc}</p>

      ${product.family ? (function() {
        const familyProducts = getStoreProducts().filter(p => p.family === product.family);
        if (familyProducts.length < 2) return '';
        return `
          <div class="opt-group">
            <div class="opt-label">Model: <span class="opt-selected">${pName}</span></div>
            <div class="opt-list">
              ${familyProducts.map(fp => `
                <a href="product.html?id=${fp.id}" class="opt-btn ${fp.id === product.id ? 'selected' : ''}">
                  ${escapeHtml(fp.name)}${fp.basePrice !== product.basePrice ? ` — ${formatPrice(fp.basePrice)}` : ''}
                </a>
              `).join('')}
            </div>
          </div>
        `;
      })() : ''}

      <div class="product-options" id="product-options">
        ${renderOptions()}
      </div>

      <button class="add-cart-btn" onclick="addCurrentToCart()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        Add to Cart — ${formatPrice(getTotalPrice())}
      </button>

      <div class="product-tabs">
        <div class="tab-nav">
          <button class="tab-btn active" onclick="switchTab(this, 'specs')">Specifications</button>
        </div>
        <div class="tab-content active" id="tab-specs">
          <div class="specs-grid">${specsRows}</div>
        </div>
      </div>
    </div>
  `;

  window.switchTab = function(btn, tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
  };

  renderGallery();
  updatePrice();
}

function initSearch() {
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (query) {
          if (currentPage !== 'index.html') {
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
          } else {
            applySearch(query);
          }
        }
      }
    });

    input.addEventListener('input', (e) => {
      if (!document.getElementById('products-grid')) return;
      applySearch(e.target.value.trim());
    });
  });
}

function applySearch(query) {
  const storeProducts = getStoreProducts();
  if (!query) {
    const activeCat = document.querySelector('.nav-inner a.active') ||
                     document.querySelector('.cat-pill.active');
    const cat = activeCat ? activeCat.dataset.category : 'all';
    if (cat === 'all') renderProducts(storeProducts);
    else renderProducts(storeProducts.filter(p => p.category.toLowerCase() === cat.toLowerCase()));
    return;
  }

  const q = query.toLowerCase();
  const filtered = storeProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
  renderProducts(filtered);
}

function initCategoryFilter() {
  const allTriggers = document.querySelectorAll('.nav-inner a[data-category], .cat-pill[data-category]');

  allTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();

      const category = el.dataset.category;
      const isNav = el.closest('.nav-inner');

      if (isNav) {
        document.querySelectorAll('.nav-inner a').forEach(a => a.classList.remove('active'));
        el.classList.add('active');
      }

      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === category);
      });

      if (category === 'all') {
        renderProducts(getStoreProducts());
      } else {
        renderProducts(getStoreProducts().filter(p =>
          p.category.toLowerCase() === category.toLowerCase()
        ));
      }

      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initSidebar() {
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.mobile-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const closeBtn = document.querySelector('.sidebar-close');

  if (!menuBtn || !sidebar) return;

  function open() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', close);
}

/* ───── Theme Toggle ───── */
function initTheme() {
  const saved = localStorage.getItem('swiftek_theme');
  if (saved === 'dark') document.body.classList.add('dark-theme');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = saved === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('swiftek_theme', isDark ? 'dark' : 'light');
      document.querySelectorAll('.theme-toggle').forEach(b => {
        b.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      });
    });
  });
}

/* ───── Modals (FAQ, Returns) ───── */
function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => {
  const overlay = e.target.closest('.custom-modal-overlay:not(.hidden)');
  if (overlay && !e.target.closest('.custom-modal')) {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

/* ───── FAQ accordion ───── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.faq-question');
  if (!btn) return;
  const item = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('open');
  item.closest('.faq-body')?.querySelectorAll('.faq-item.open').forEach(el => {
    if (el !== item) el.classList.remove('open');
  });
  item.classList.toggle('open', !isOpen);
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateCartCount();

  if (document.getElementById('products-grid')) {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const catParam = params.get('cat');
    const allProducts = getStoreProducts();

    let productsToRender = allProducts;

    if (searchParam) {
      const q = searchParam.toLowerCase();
      productsToRender = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
      const searchInput = document.querySelector('.search-input');
      if (searchInput) searchInput.value = searchParam;
    } else if (catParam) {
      productsToRender = allProducts.filter(p =>
        p.category.toLowerCase() === catParam.toLowerCase()
      );
      document.querySelectorAll('.nav-inner a, .cat-pill').forEach(el => {
        el.classList.toggle('active', el.dataset.category?.toLowerCase() === catParam.toLowerCase());
      });
    }

    renderProducts(productsToRender);
    initSearch();
    initCategoryFilter();
  }

  if (document.getElementById('product-detail-content')) {
    renderProductDetail();
    initSearch();
  }

  if (document.querySelector('.cart-items')) {
    renderCart();
  }

  initSidebar();
});
