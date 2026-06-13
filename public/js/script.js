const WHATSAPP_NUMBER = '233204694657';
let cart = JSON.parse(localStorage.getItem('swiftek_cart')) || [];

let _cachedProducts = null;

async function getStoreProducts() {
  if (_cachedProducts) return _cachedProducts;
  try {
    const res = await fetch('/api/products');
    _cachedProducts = await res.json();
    return _cachedProducts;
  } catch {
    const merged = products
      .filter(p => !(JSON.parse(localStorage.getItem('swiftek_admin_deleted') || '[]')).includes(p.id))
      .map(p => ({ ...p }));

    const adminProducts = JSON.parse(localStorage.getItem('swiftek_admin_products') || '[]');
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
    _cachedProducts = merged;
    return merged;
  }
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
  getProductById(productId).then(product => {
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
  });
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

async function getProductById(id) {
  const storeProducts = await getStoreProducts();
  return storeProducts.find(p => p.id === id);
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

function getUserData() {
  try { return JSON.parse(localStorage.getItem('swiftek_user_data') || 'null'); } catch(e) { return null; }
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  const token = typeof getUserToken === 'function' ? getUserToken() : null;
  const userData = getUserData();
  if (!token || !userData) {
    showToast('Please login to place an order');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    return;
  }

  if (typeof fetchMe === 'function') {
    fetchMe().catch(() => {
      showToast('Session expired or account access revoked');
      clearUserSession();
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    });
  }

  const total = getCartTotal();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit', hour12: true });
  const orderRef = `SWF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const recipientName = document.getElementById('checkout-recipient-name')?.value.trim() || userData.name;
  const deliveryAddress = document.getElementById('checkout-address')?.value.trim() || '';
  const isDifferent = document.getElementById('checkout-different')?.checked || false;

  let message = `┌──────────────────────────────────────────%0A`;
  message += `│  🛍️  *NEW ORDER — SwifTek Accessories*%0A`;
  message += `│  ${dateStr} at ${timeStr}%0A`;
  message += `│  Ref: *${orderRef}*%0A`;
  message += `└──────────────────────────────────────────%0A%0A`;

  message += `*📋 ORDER ITEMS*%0A`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0A`;

  const promises = cart.map(async (item, i) => {
    const product = await getProductById(item.productId);
    if (!product) return '';
    let msg = `%0A`;
    msg += `*${i + 1}. ${escapeHtml(product.name)}*%0A`;
    if (item.specs) msg += `   ─ ${escapeHtml(item.specs)}%0A`;
    msg += `   Qty: ${item.qty}  ×  ${formatPrice(item.price)}%0A`;
    msg += `   ─────────────────────────%0A`;
    return msg;
  });

  Promise.all(promises).then(async (items) => {
    message += items.join('');
    message += `%0A━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `*💰  TOTAL AMOUNT  ${formatPrice(total)}*%0A`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%0A%0A`;

    message += `*👤 ACCOUNT HOLDER*%0A`;
    message += `Name: ${escapeHtml(userData.name)}%0A`;
    message += `Email: ${escapeHtml(userData.email)}%0A%0A`;

    message += `*📦 DELIVERY*%0A`;
    message += `Recipient: ${escapeHtml(recipientName)}%0A`;
    message += `Address: ${deliveryAddress ? escapeHtml(deliveryAddress) : 'To be provided'}%0A%0A`;

    message += `*💳 PAYMENT*%0A`;
    message += `Pay on delivery (Cash / Mobile Money) or bank transfer.%0A%0A`;

    message += `────────────────────────────────────────────%0A`;
    message += `*SwifTek Accessories* — Premium Tech Store 🇬🇭%0A`;
    message += `📞 ${WHATSAPP_NUMBER}%0A`;
    message += `Thank you for your order! 🙏`;

    if (typeof createOrderApi === 'function') {
      const orderItems = await Promise.all(cart.map(async (item) => {
        const product = await getProductById(item.productId);
        return {
          productId: item.productId,
          name: product ? product.name : 'Unknown Product',
          price: item.price,
          qty: item.qty,
          specs: item.specs || '',
          image: product && product.images ? product.images[0] : ''
        };
      }));

      try {
        await createOrderApi({
          items: orderItems,
          total,
          customerInfo: {
            name: userData.name,
            email: userData.email
          },
          recipient: isDifferent ? { name: recipientName, address: deliveryAddress } : {}
        });
      } catch (e) {
        console.error('Failed to save order:', e);
      }
    }

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    clearCart();
  });
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
    const negotiableBadge = product.negotiable
      ? '<span class="product-badge badge-negotiable">Price Negotiable</span>'
      : '<span class="product-badge badge-fixed">Fixed Price</span>';
    const name = escapeHtml(product.name);
    const brand = escapeHtml(product.brand);
    return `
      <a href="product.html?id=${product.id}" class="product-card">
        <div class="product-card-image">
          <img src="${img}" alt="${name}" loading="lazy"
               onerror="this.onerror=null;this.src='https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?w=400&q=80'">
          <div class="product-card-badges">
            ${badge}
            ${product.inStock === false ? '<span class="product-badge badge-sold-out">Sold Out</span>' : ''}
            ${negotiableBadge}
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-brand">${brand}</div>
          <div class="product-card-title">${name}</div>
          <div class="product-card-footer">
            <div class="product-card-price">
              <span class="label">from </span>${formatPrice(product.basePrice)}
            </div>
            <span class="price-${product.negotiable ? 'negotiable' : 'fixed'}-tag">${product.negotiable ? 'Negotiable' : 'Fixed Price'}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

async function renderCart() {
  const container = document.querySelector('.cart-items');
  const summary = document.querySelector('.cart-summary');
  const empty = document.querySelector('.cart-empty');
  const countLabel = document.querySelector('.cart-count-label');

  if (!container) return;

  const skeletonEl = document.getElementById('cart-skeleton');
  if (skeletonEl) skeletonEl.remove();

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

  const itemsHtml = await Promise.all(cart.map(async (item, index) => {
    const product = await getProductById(item.productId);
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
  }));

  container.innerHTML = itemsHtml.join('');

  if (summary) {
    const total = getCartTotal();
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = formatPrice(total);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }
}

async function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = await getProductById(id);

  if (!product) {
    const el = document.querySelector('.product-detail');
    if (el) {
      el.innerHTML = `
        <div class="container">
          <div class="no-results">
            <div class="icon">😕</div>
            <h3>Product not found</h3>
            <p>The product you're looking for doesn't exist</p>
            <a href="index.html" class="btn btn-primary btn-back-inline">Back to Store</a>
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
        const optValue = opt.label.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        if (isColor) {
          html += `
            <button class="color-swatch ${selectedOptions[key] === opt.label ? 'selected' : ''}"
                    data-color="${opt.hex}"
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

  const skeletonEl = document.getElementById('product-skeleton');
  if (skeletonEl) skeletonEl.remove();
  contentEl.classList.remove('hidden');

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
          ${product.inStock !== false ? '<span class="product-sub-divider"></span><span class="product-sub-stock">● In Stock</span>' : ''}
        </div>
      </div>

      <div class="product-pricing">
        <span class="product-price-main" id="detail-price">${formatPrice(getTotalPrice())}</span>
        ${product.options && Object.keys(product.options).length > 0 ? '<span class="product-price-label">(as configured)</span>' : ''}
        <span class="product-price-${product.negotiable ? 'negotiable' : 'fixed'}">${product.negotiable ? 'Price Negotiable' : 'Fixed Price'}</span>
      </div>

      <p class="product-desc">${pDesc}</p>

      <div id="family-products"></div>

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
          <button class="tab-btn" onclick="switchTab(this, 'reviews')">Reviews</button>
          <button class="tab-btn" onclick="switchTab(this, 'comments')">Comments</button>
        </div>
        <div class="tab-content active" id="tab-specs">
          <div class="specs-grid">${specsRows}</div>
        </div>
        <div class="tab-content" id="tab-reviews">
          <div id="reviews-container">
            <div class="reviews-loading">Loading reviews...</div>
          </div>
        </div>
        <div class="tab-content" id="tab-comments">
          <div id="comments-container">
            <div class="comments-loading">Loading comments...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.color-swatch[data-color]').forEach(btn => {
    const color = btn.dataset.color;
    if (color) {
      btn.style.background = color;
    }
  });

  if (product.family) {
    getStoreProducts().then(familyProducts => {
      const familyFiltered = familyProducts.filter(p => p.family === product.family);
      if (familyFiltered.length < 2) return;
      const el = document.getElementById('family-products');
      if (!el) return;
      el.innerHTML = `
        <div class="opt-group">
          <div class="opt-label">Model: <span class="opt-selected">${pName}</span></div>
          <div class="opt-list">
            ${familyFiltered.map(fp => `
              <a href="product.html?id=${fp.id}" class="opt-btn ${fp.id === product.id ? 'selected' : ''}">
                ${escapeHtml(fp.name)}${fp.basePrice !== product.basePrice ? ` — ${formatPrice(fp.basePrice)}` : ''}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    });
  }

  window.switchTab = function(btn, tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
  };

  renderGallery();
  updatePrice();

  renderRatings(product.id);
  renderComments(product.id);
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= full) html += '<i class="fas fa-star star-filled"></i>';
    else if (i === full + 1 && half) html += '<i class="fas fa-star-half-alt star-filled"></i>';
    else html += '<i class="far fa-star star-empty"></i>';
  }
  return html;
}

async function renderRatings(productId) {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  try {
    const data = await fetchProductRatings(productId);
    const userData = getUserData();
    const token = getUserToken();
    let userRating = null;

    if (token && userData) {
      userRating = data.ratings.find(r => r.userId && r.userId === userData.id);
    }

    let html = '';

    // Average rating display
    if (data.count > 0) {
      html += `
        <div class="reviews-summary">
          <div class="reviews-avg">${data.average.toFixed(1)}</div>
          <div class="reviews-stars-large">${renderStars(data.average)}</div>
          <div class="reviews-count">${data.count} review${data.count !== 1 ? 's' : ''}</div>
        </div>
      `;
    }

    // Rating form (only for logged-in users)
    if (token && userData) {
      html += `
        <div class="review-form">
          <h4>${userRating ? 'Your Review' : 'Write a Review'}</h4>
          <div class="rating-input">
            ${[1,2,3,4,5].map(s => `
              <i class="fas fa-star ${userRating && s <= userRating.rating ? 'star-filled' : 'star-empty'}"
                 data-value="${s}" onclick="setRating(${s})" id="star-${s}"></i>
            `).join('')}
          </div>
          <input type="hidden" id="selected-rating" value="${userRating ? userRating.rating : 0}">
          <textarea class="review-textarea" id="review-text" placeholder="Write your review (optional)">${userRating ? userRating.review : ''}</textarea>
          <button class="admin-btn admin-btn-primary" onclick="submitReview(${productId})">
            ${userRating ? 'Update Review' : 'Submit Review'}
          </button>
          <p class="review-error hidden" id="review-error"></p>
        </div>
      `;
    }

    // Reviews list
    if (data.ratings.length > 0) {
      const reviewsList = data.ratings.map(r => `
        <div class="review-item">
          <div class="review-header">
            <span class="review-author">${r.userId ? escapeHtml(r.userId.name) : 'Anonymous'}</span>
            <span class="review-stars">${renderStars(r.rating)}</span>
            <span class="review-date">${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          ${r.review ? `<div class="review-text">${escapeHtml(r.review)}</div>` : ''}
        </div>
      `).join('');
      html += `<div class="reviews-list">${reviewsList}</div>`;
    } else if (!token) {
      html += '<p class="reviews-empty">No reviews yet. <a href="login.html">Log in</a> to leave a review.</p>';
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p class="reviews-empty">Failed to load reviews.</p>';
  }
}

window.setRating = function(value) {
  document.getElementById('selected-rating').value = value;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star-${i}`);
    if (star) {
      star.className = i <= value ? 'fas fa-star star-filled' : 'far fa-star star-empty';
    }
  }
};

window.submitReview = async function(productId) {
  const rating = parseInt(document.getElementById('selected-rating').value);
  const review = document.getElementById('review-text').value.trim();
  const errorEl = document.getElementById('review-error');

  if (!rating || rating < 1) {
    errorEl.textContent = 'Please select a star rating';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    await submitRatingApi(productId, rating, review);
    errorEl.classList.add('hidden');
    showToast('Review submitted!');
    renderRatings(productId);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
};

async function renderComments(productId) {
  const container = document.getElementById('comments-container');
  if (!container) return;

  try {
    const data = await fetchProductComments(productId);
    const userData = getUserData();
    const token = getUserToken();

    let html = '';

    // Comment form (only for logged-in users)
    if (token && userData) {
      html += `
        <div class="comment-form">
          <h4>Leave a Comment</h4>
          <textarea class="comment-textarea" id="comment-text" placeholder="Share your thoughts about this product..."></textarea>
          <button class="admin-btn admin-btn-primary" onclick="submitComment(${productId})">Post Comment</button>
          <p class="comment-error hidden" id="comment-error"></p>
        </div>
      `;
    }

    // Comments list
    if (data.comments.length > 0) {
      const commentsList = data.comments.map(c => `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">${c.userId ? escapeHtml(c.userId.name) : 'Anonymous'}</span>
            <span class="comment-date">${new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      `).join('');
      html += `<div class="comments-list">${commentsList}</div>`;
    } else {
      html += '<p class="comments-empty">No comments yet. Be the first to comment!</p>';
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p class="comments-empty">Failed to load comments.</p>';
  }
}

window.submitComment = async function(productId) {
  const text = document.getElementById('comment-text').value.trim();
  const errorEl = document.getElementById('comment-error');

  if (!text) {
    errorEl.textContent = 'Please write a comment';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    await submitCommentApi(productId, text);
    document.getElementById('comment-text').value = '';
    errorEl.classList.add('hidden');
    showToast('Comment posted!');
    renderComments(productId);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
};

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

async function applySearch(query) {
  const storeProducts = await getStoreProducts();
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

      getStoreProducts().then(products => {
        if (category === 'all') {
          renderProducts(products);
        } else {
          renderProducts(products.filter(p =>
            p.category.toLowerCase() === category.toLowerCase()
          ));
        }
      });

      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initHeroVideo() {
  var video = document.querySelector('.hero-video');
  if (!video) return;
  video.play().catch(function() {
    function tryPlay() {
      video.play().catch(function(){});
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('click', tryPlay);
    }
    document.addEventListener('touchstart', tryPlay, {once: true});
    document.addEventListener('click', tryPlay, {once: true});
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

/* ───── Profile Edit Modal ───── */

function showUserProfileModal() {
  const existing = document.querySelector('.profile-modal-overlay');
  if (existing) existing.remove();

  const userData = getUserData();
  const overlay = document.createElement('div');
  overlay.className = 'profile-modal-overlay custom-modal-overlay';
  overlay.innerHTML = `
    <div class="custom-modal modal-profile">
      <div class="custom-modal-header">
        <h3><i class="fas fa-user-edit"></i> Edit Profile</h3>
      </div>
      <div class="custom-modal-body">
        <form id="profile-edit-form">
          <div class="admin-field">
            <label for="pe-name">Name</label>
            <input type="text" id="pe-name" class="admin-input" value="${escapeHtml(userData ? userData.name : '')}" autocomplete="off" placeholder="Your name">
          </div>
          <div class="admin-field">
            <label for="pe-email">Email</label>
            <input type="email" id="pe-email" class="admin-input" value="${escapeHtml(userData ? userData.email : '')}" autocomplete="off" placeholder="Your email">
          </div>
          <hr class="profile-divider">
          <label class="profile-label">Change Password <span>(leave blank to keep current)</span></label>
          <div class="admin-field">
            <label for="pe-current-pw">Current Password</label>
            <input type="password" id="pe-current-pw" class="admin-input" autocomplete="off" placeholder="Current password">
          </div>
          <div class="admin-field">
            <label for="pe-new-pw">New Password</label>
            <input type="password" id="pe-new-pw" class="admin-input" minlength="6" autocomplete="off" placeholder="New password">
          </div>
          <div class="admin-field">
            <label for="pe-confirm-pw">Confirm New Password</label>
            <input type="password" id="pe-confirm-pw" class="admin-input" minlength="6" autocomplete="off" placeholder="Confirm new password">
          </div>
          <p id="pe-error" class="admin-error hidden"></p>
          <button type="submit" class="admin-btn admin-btn-primary admin-btn-full admin-btn-mt8">Save Changes</button>
        </form>
      </div>
      <div class="custom-modal-footer">
        <button type="button" class="admin-btn admin-btn-outline" id="pe-cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('pe-name').value.trim();
    const email = document.getElementById('pe-email').value.trim();
    const currentPw = document.getElementById('pe-current-pw').value;
    const newPw = document.getElementById('pe-new-pw').value;
    const confirmPw = document.getElementById('pe-confirm-pw').value;
    const errorEl = document.getElementById('pe-error');

    if (newPw && newPw !== confirmPw) {
      errorEl.textContent = 'New passwords do not match';
      errorEl.classList.remove('hidden');
      return;
    }
    if (newPw && newPw.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const result = await updateProfileApi({
        name: name || undefined,
        email: email || undefined,
        currentPassword: newPw ? currentPw : undefined,
        newPassword: newPw || undefined
      });
      if (result.user) {
        localStorage.setItem('swiftek_user_data', JSON.stringify(result.user));
      }
      overlay.remove();
      showToast('Profile updated successfully');
      updateHeaderUser();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
  });

  document.getElementById('pe-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

/* ───── Cart helpers ───── */

function toggleRecipientFields() {
  const checked = document.getElementById('checkout-different')?.checked;
  const fields = document.getElementById('checkout-recipient-fields');
  if (fields) fields.classList.toggle('hidden', !checked);
}

function updateCheckoutUserInfo() {
  const info = document.getElementById('checkout-user-info');
  const name = document.getElementById('checkout-user-name');
  const email = document.getElementById('checkout-user-email');
  if (!info || !name || !email) return;
  const userData = getUserData();
  if (userData && userData.name) {
    info.classList.remove('hidden');
    name.textContent = userData.name;
    email.textContent = userData.email;
  } else {
    info.classList.add('hidden');
  }
}

function updateHeaderUser() {
  const btn = document.getElementById('header-user-btn');
  if (!btn) return;
  const token = typeof getUserToken === 'function' ? getUserToken() : null;
  const userData = (() => { try { return JSON.parse(localStorage.getItem('swiftek_user_data') || 'null'); } catch(e) { return null; } })();

  function buildBadge(count) {
    if (count < 1) return '';
    return `<span class="notif-badge">${count > 99 ? '99+' : count}</span>`;
  }

  async function fetchAndBadge() {
    try {
      const data = await fetchPendingOrderCount();
      const count = data.count || 0;
      if (count > 0) {
        const existing = btn.querySelector('.notif-badge');
        if (existing) existing.textContent = count > 99 ? '99+' : count;
        else btn.insertAdjacentHTML('beforeend', buildBadge(count));
      }
    } catch (e) {}
  }

  if (token && userData) {
    if (userData.role === 'admin') {
      btn.innerHTML = '<i class="fas fa-user-shield"></i>';
      btn.title = 'Admin Panel';
      btn.href = 'admin.html';
      btn.onclick = null;
      fetchAndBadge();
    } else {
      btn.innerHTML = '<i class="fas fa-user-check"></i>';
      btn.title = userData.name || 'Account';
      btn.href = '#';
      btn.onclick = function(e) {
        e.preventDefault();
        const existing = document.querySelector('.user-menu-overlay');
        if (existing) { existing.remove(); return; }
        const overlay = document.createElement('div');
        overlay.className = 'user-menu-overlay';
        overlay.innerHTML = `
          <div class="user-menu-panel">
            <button class="user-menu-close" aria-label="Close">&times;</button>
            <div class="user-menu-header">
              <div class="user-menu-avatar">${(userData.name || 'U')[0].toUpperCase()}</div>
              <div class="user-menu-name">${escapeHtml(userData.name)}</div>
              <div class="user-menu-email">${escapeHtml(userData.email)}</div>
            </div>
            <div class="user-menu-links">
              <button id="user-edit-profile-link" class="user-menu-link"><i class="fas fa-user-edit"></i> Edit Profile</button>
              <a href="order-history.html" class="user-menu-link" id="user-order-history-link"><i class="fas fa-box"></i> Order History</a>
              <button id="user-logout-link" class="user-menu-link user-menu-link-danger"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('open'));

        fetchPendingOrderCount().then(d => {
          const c = d.count || 0;
          if (c > 0) {
            const link = overlay.querySelector('#user-order-history-link');
            if (link) link.insertAdjacentHTML('beforeend', buildBadge(c));
          }
        }).catch(() => {});

        overlay.querySelector('.user-menu-close').addEventListener('click', () => {
          overlay.classList.remove('open');
          setTimeout(() => overlay.remove(), 300);
        });
        overlay.addEventListener('click', function onBackdrop(e2) {
          if (e2.target === overlay) {
            overlay.classList.remove('open');
            setTimeout(() => overlay.remove(), 300);
          }
        });
        document.getElementById('user-logout-link').addEventListener('click', async (e2) => {
          e2.preventDefault();
          if (typeof userLogoutApi === 'function') await userLogoutApi().catch(() => {});
          overlay.classList.remove('open');
          setTimeout(() => { overlay.remove(); window.location.reload(); }, 300);
        });
        document.getElementById('user-edit-profile-link').addEventListener('click', (e2) => {
          e2.preventDefault();
          overlay.classList.remove('open');
          setTimeout(() => { overlay.remove(); showUserProfileModal(); }, 300);
        });
      };
      fetchAndBadge();
    }
  } else {
    btn.innerHTML = '<i class="fas fa-user"></i>';
    btn.title = 'Sign In';
    btn.href = 'login.html';
    btn.onclick = null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  updateCartCount();
  updateHeaderUser();

  if (document.getElementById('products-grid')) {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const catParam = params.get('cat');
    const allProducts = await getStoreProducts();

    let productsToRender = allProducts;

      if (searchParam) {
      const q = searchParam.toLowerCase();
      productsToRender = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
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
    await renderProductDetail();
    initSearch();
  }

  if (document.querySelector('.cart-items')) {
    await renderCart();
    updateCheckoutUserInfo();
  }

  initHeroVideo();
  initSidebar();
  initLiquidNavbar();

  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

function initLiquidNavbar() {
  if (window.innerWidth < 768) return;

  const nav = document.querySelector('.nav-inner');
  const indicator = document.querySelector('.liquid-indicator');
  const links = document.querySelectorAll('.nav-inner a');

  if (!nav || !indicator || links.length === 0) return;

  function moveIndicator(el) {
    const rect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    
    const left = rect.left - navRect.left;
    const width = rect.width;
    
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';
  }

  // Initial position based on active link
  const activeLink = document.querySelector('.nav-inner a.active');
  if (activeLink) {
    moveIndicator(activeLink);
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
    
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicator(link);
    });
  });

  nav.addEventListener('mouseleave', () => {
    const currentActive = document.querySelector('.nav-inner a.active');
    if (currentActive) {
      moveIndicator(currentActive);
    }
  });

  // Handle window resize to keep indicator aligned
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.nav-inner a.active');
    if (currentActive) {
      moveIndicator(currentActive);
    }
  });
}
