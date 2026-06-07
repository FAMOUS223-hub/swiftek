let editingId = null;

function isStaticProduct(id) {
  return id < 101;
}

function isAdminCreated(id, adminProducts) {
  return adminProducts.some(p => p.id === id && p._adminCreated);
}

/* ───── Login ───── */
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginError = document.getElementById('login-error');
const passwordInput = document.getElementById('admin-password');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await loginApi(passwordInput.value);
      showDashboard();
    } catch {
      loginError.classList.remove('hidden');
      passwordInput.value = '';
    }
  });
}

async function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');

  var heroVideo = document.querySelector('.admin-hero-video');
  if (heroVideo) {
    heroVideo.load();
    setTimeout(function() { heroVideo.play().catch(function() {}); }, 100);
  }

  await renderAdminProducts();

  const hour = new Date().getHours();
  let greeting = 'Welcome back';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  const title = document.querySelector('.admin-hero-title span');
  if (title) title.textContent = greeting;
}

function checkLogin() {
  if (sessionStorage.getItem('swiftek_admin_token')) {
    showDashboard();
  }
}

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await logoutApi();
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  passwordInput.value = '';
  var heroVideo = document.querySelector('.admin-hero-video');
  if (heroVideo) { heroVideo.pause(); }
});

/* ───── Product List ───── */
async function renderAdminProducts() {
  const adminProducts = await fetchAdminProducts();
  const storeProducts = await fetchProducts();
  const container = document.getElementById('admin-product-list');
  const search = (document.getElementById('admin-search')?.value || '').toLowerCase();

  const allProducts = storeProducts;
  const trash = await fetchTrash();
  document.getElementById('stat-total').textContent = allProducts.length;
  document.getElementById('stat-admin').textContent = adminProducts.filter(p => p._adminCreated).length;
  document.getElementById('stat-trash').textContent = trash.length;
  updateTrashBadge();

  let filtered = allProducts;
  if (search) {
    filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="admin-empty">No products match your search.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isAdmin = isAdminCreated(p.id, adminProducts);
    return `
    <div class="admin-product-item">
      <div class="admin-product-img">
        ${p.images && p.images[0]
          ? `<img src="${p.images[0]}" alt="" onerror="this.style.display='none'">`
          : '<div class="admin-no-img">📷</div>'}
      </div>
      <div class="admin-product-info">
        <div class="admin-product-name">${escapeHtml(p.name)}</div>
        <div class="admin-product-meta">${escapeHtml(p.brand)} · ${escapeHtml(p.category)} · GH₵ ${p.basePrice.toLocaleString()}</div>
        <div class="admin-product-badge ${isAdmin ? 'badge-admin' : 'badge-static'}">${isAdmin ? 'Admin' : 'Static'}</div>
      </div>
      <div class="admin-product-actions">
        <button class="admin-btn-sm admin-btn-outline" onclick="editProduct(${p.id})">Edit</button>
        <button class="admin-btn-sm admin-btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    </div>`;
  }).join('');
}

/* ───── Delete / Trash ───── */

async function deleteProduct(id) {
  const storeProducts = await fetchProducts();
  const p = storeProducts.find(p => p.id === id);
  const confirmed = await showModal({
    title: 'Move to Trash',
    message: `Move "${p ? p.name : id}" to trash? You can restore it later.`,
    confirmText: 'Move to Trash',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  if (!confirmed) return;

  try {
    await deleteProductApi(id);
  } catch (e) {
    await showModal({ title: 'Error', message: e.message, type: 'alert' });
    return;
  }

  updateTrashBadge();
  location.reload();
}

async function restoreProduct(id) {
  try {
    await restoreProductApi(id);
  } catch (e) {
    await showModal({ title: 'Error', message: e.message, type: 'alert' });
    return;
  }
  updateTrashBadge();
  location.reload();
}

async function deleteForever(id) {
  const trash = await fetchTrash();
  const item = trash.find(t => t.id === id);
  const confirmed = await showModal({
    title: 'Delete Forever',
    message: `Permanently delete "${item ? item.name : id}"? This cannot be undone.`,
    confirmText: 'Delete Forever',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  if (!confirmed) return;

  try {
    await deleteForeverApi(id);
  } catch (e) {
    await showModal({ title: 'Error', message: e.message, type: 'alert' });
    return;
  }
  updateTrashBadge();
  await renderAdminProducts();
  await renderTrash();
}

async function updateTrashBadge() {
  const btn = document.getElementById('trash-btn');
  const trash = await fetchTrash();
  if (btn) {
    btn.textContent = trash.length > 0 ? `🗑️ Trash (${trash.length})` : '🗑️ Trash';
  }
}

async function renderTrash() {
  const container = document.getElementById('trash-list');
  const section = document.getElementById('trash-section');
  const trash = await fetchTrash();
  if (!container || !section) return;

  if (trash.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  container.innerHTML = trash.map(t => `
    <div class="admin-product-item">
      <div class="admin-product-img">
        ${t.images && t.images[0]
          ? `<img src="${t.images[0]}" alt="" onerror="this.style.display='none'">`
          : '<div class="admin-no-img">📷</div>'}
      </div>
      <div class="admin-product-info">
        <div class="admin-product-name">${escapeHtml(t.name)}</div>
        <div class="admin-product-meta">${escapeHtml(t.brand)} · ${escapeHtml(t.category)} · GH₵ ${t.basePrice.toLocaleString()}</div>
        <div class="admin-product-meta admin-product-meta-trashed">Trashed ${new Date(t._trashedAt).toLocaleDateString()}</div>
      </div>
      <div class="admin-product-actions">
        <button class="admin-btn-sm admin-btn-primary" onclick="restoreProduct(${t.id})">Restore</button>
        <button class="admin-btn-sm admin-btn-danger" onclick="deleteForever(${t.id})">Delete Forever</button>
      </div>
    </div>
  `).join('');
}

/* ───── Toggle admin products view ───── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#admin-prod-btn');
  if (btn) {
    e.preventDefault();
    const section = document.getElementById('admin-prod-section');
    const list = document.getElementById('admin-product-list');
    const trashSection = document.getElementById('trash-section');
    if (section) {
      const isVisible = !section.classList.contains('hidden');
      section.classList.toggle('hidden');
      if (list) list.style.display = isVisible ? '' : 'none';
      if (trashSection) trashSection.classList.add('hidden');
      if (!isVisible) renderAdminProdList();
    }
  }
});

async function renderAdminProdList() {
  const container = document.getElementById('admin-prod-list');
  const section = document.getElementById('admin-prod-section');
  const allProducts = await fetchAdminProducts();
  if (!container || !section) return;

  if (allProducts.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  container.innerHTML = allProducts.map(p => {
    const img = p.images && p.images[0] ? p.images[0] : '';
    return `
      <div class="admin-product-item">
        <div class="admin-product-img">
          ${img
            ? `<img src="${img}" alt="" onerror="this.style.display='none'">`
            : '<div class="admin-no-img"><i class="fas fa-box"></i></div>'}
        </div>
        <div class="admin-product-info">
          <div class="admin-product-name">${escapeHtml(p.name)}</div>
          <div class="admin-product-meta">${escapeHtml(p.brand)} · ${escapeHtml(p.category)} · GH₵ ${p.basePrice?.toLocaleString()}</div>
        </div>
        <div class="admin-product-actions">
          <button class="admin-btn-sm admin-btn-outline" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i> Edit</button>
        </div>
      </div>
    `;
  }).join('');
}

/* ───── Toggle trash view ───── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#trash-btn');
  if (btn) {
    e.preventDefault();
    const section = document.getElementById('trash-section');
    const list = document.getElementById('admin-product-list');
    const formSection = document.getElementById('product-form-modal');
    const adminProdSection = document.getElementById('admin-prod-section');
    if (section) {
      const isVisible = !section.classList.contains('hidden');
      section.classList.toggle('hidden');
      if (list) list.style.display = isVisible ? '' : 'none';
      if (formSection) formSection.classList.add('hidden');
      if (adminProdSection) adminProdSection.classList.add('hidden');
      if (!isVisible) renderTrash();
    }
  }
});

/* ───── Edit ───── */
async function editProduct(id) {
  const adminProducts = await fetchAdminProducts();
  const storeProducts = await fetchProducts();
  const product = storeProducts.find(p => p.id === id);
  if (!product) return;

  editingId = id;
  document.getElementById('form-title').textContent = 'Edit Product';
  document.getElementById('field-editing-id').value = id;
  document.getElementById('field-name').value = product.name || '';
  document.getElementById('field-brand').value = product.brand || '';
  document.getElementById('field-category').value = product.category || '';
  updateScreenSpecs();
  document.getElementById('field-family').value = product.family || '';
  document.getElementById('field-price').value = product.basePrice || '';
  document.getElementById('field-description').value = product.description || '';
  document.getElementById('field-images').value = (product.images || []).join('\n');
  renderImagePreviews();
  document.getElementById('field-instock').checked = product.inStock !== false;
  document.getElementById('field-featured').checked = product.featured === true;

  const specsContainer = document.getElementById('specs-container');
  specsContainer.innerHTML = '';
  const specEntries = product.specifications ? Object.entries(product.specifications) : [];
  if (specEntries.length === 0) {
    addSpecRow();
  } else {
    specEntries.forEach(([key, val]) => addSpecRow(key, val));
  }

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  if (product.options && Object.keys(product.options).length > 0) {
    Object.entries(product.options).forEach(([type, items]) => {
      addOptionGroup(type, items);
    });
  }

  document.getElementById('product-form-modal').classList.remove('hidden');
}

/* ───── Add New ───── */
function resetForm() {
  editingId = null;
  document.getElementById('form-title').textContent = 'Add New Product';
  document.getElementById('field-editing-id').value = '';
  document.getElementById('field-name').value = '';
  document.getElementById('field-brand').value = '';
  document.getElementById('field-category').value = '';
  document.getElementById('field-family').value = '';
  document.getElementById('field-price').value = '';
  document.getElementById('field-description').value = '';
  document.getElementById('field-images').value = '';
  renderImagePreviews();
  document.getElementById('field-instock').checked = true;
  document.getElementById('field-featured').checked = false;
  document.getElementById('specs-container').innerHTML = '';
  document.getElementById('options-container').innerHTML = '';
  addSpecRow('Display', '');
  addSpecRow('Processor', '');
  addSpecRow('Battery', '');
  updateScreenSpecs();
}

const SCREEN_CATEGORIES = ['Phones', 'Keypads', 'Laptops', 'Wearables'];

function updateScreenSpecs() {
  const cat = document.getElementById('field-category').value;
  const hasScreen = SCREEN_CATEGORIES.includes(cat);
  document.querySelectorAll('#specs-container .admin-spec-row').forEach(row => {
    const key = row.querySelector('.spec-key')?.value.trim();
    if (key === 'Display' || key === 'Processor' || key === 'Battery') {
      row.style.display = hasScreen ? '' : 'none';
    }
  });
}

document.getElementById('field-category')?.addEventListener('change', updateScreenSpecs);

document.getElementById('add-product-btn')?.addEventListener('click', () => {
  resetForm();
  document.getElementById('product-form-modal').classList.remove('hidden');
});

document.getElementById('cancel-form-btn')?.addEventListener('click', () => {
  document.getElementById('product-form-modal').classList.add('hidden');
});

document.getElementById('product-form-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('product-form-modal').classList.add('hidden');
  }
});

/* ───── Image Upload ───── */
document.getElementById('field-image-upload')?.addEventListener('change', function() {
  const textarea = document.getElementById('field-images');
  const files = Array.from(this.files);
  if (files.length === 0) return;

  let pending = files.length;
  const results = [];

  files.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      results[i] = e.target.result;
      pending--;
      if (pending === 0) {
        const existing = textarea.value.trim();
        const newImages = results.filter(Boolean).join('\n');
        textarea.value = existing ? existing + '\n' + newImages : newImages;
        renderImagePreviews();
      }
    };
    reader.readAsDataURL(file);
  });
  this.value = '';
});

function renderImagePreviews() {
  const container = document.getElementById('image-preview-container');
  const textarea = document.getElementById('field-images');
  const images = textarea.value.trim().split('\n').map(s => s.trim()).filter(Boolean);
  container.innerHTML = '';
  images.forEach((src, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'admin-image-preview';
    wrapper.innerHTML = `
      <img src="${src}" alt="Product image ${i + 1}">
      <button type="button" class="admin-image-remove" data-index="${i}" title="Remove image">&times;</button>
    `;
    container.appendChild(wrapper);
  });
}

document.getElementById('image-preview-container')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.admin-image-remove');
  if (!btn) return;
  const textarea = document.getElementById('field-images');
  const images = textarea.value.trim().split('\n').map(s => s.trim()).filter(Boolean);
  const idx = parseInt(btn.dataset.index);
  images.splice(idx, 1);
  textarea.value = images.join('\n');
  renderImagePreviews();
});

/* ───── Add Spec Row ───── */
function addSpecRow(key = '', value = '') {
  const container = document.getElementById('specs-container');
  const row = document.createElement('div');
  row.className = 'admin-spec-row';
  row.innerHTML = `
    <input type="text" class="admin-input spec-key admin-input-flex" placeholder="Key (e.g. Display)" value="${escapeHtml(key)}">
    <input type="text" class="admin-input spec-val admin-input-flex2" placeholder="Value (e.g. 6.1-inch OLED)" value="${escapeHtml(value)}">
    <button type="button" class="admin-btn-sm admin-btn-danger remove-spec-btn" title="Remove">✕</button>
  `;
  row.querySelector('.remove-spec-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

document.getElementById('add-spec-btn')?.addEventListener('click', () => addSpecRow());

/* ───── Add Option Group ───── */
function addOptionGroup(type = '', items = []) {
  const container = document.getElementById('options-container');
  const group = document.createElement('div');
  group.className = 'admin-option-group';
  group.innerHTML = `
    <div class="admin-opt-group-header">
      <input type="text" class="admin-input opt-type admin-input-flex" placeholder="Type (e.g. storage, color)" value="${escapeHtml(type)}">
      <button type="button" class="admin-btn-sm admin-btn-danger remove-opt-group-btn" title="Remove Group">✕</button>
    </div>
    <div class="admin-opt-items"></div>
    <button type="button" class="admin-btn-sm admin-btn-outline add-opt-item-btn">+ Add Option</button>
  `;

  const itemsContainer = group.querySelector('.admin-opt-items');
  (items.length > 0 ? items : [{ label: '', value: '' }]).forEach(item => {
    addOptionItem(itemsContainer, item.label, item.price !== undefined ? String(item.price) : (item.hex || ''));
  });

  group.querySelector('.add-opt-item-btn').addEventListener('click', () => addOptionItem(itemsContainer));
  group.querySelector('.remove-opt-group-btn').addEventListener('click', () => group.remove());
  container.appendChild(group);
}

function addOptionItem(container, label = '', value = '') {
  const row = document.createElement('div');
  row.className = 'admin-opt-row';
  row.innerHTML = `
    <input type="text" class="admin-input opt-label admin-input-flex" placeholder="Label (e.g. 256GB)" value="${escapeHtml(label)}">
    <input type="text" class="admin-input opt-value admin-input-flex" placeholder='Price or hex (e.g. "0" or "#4A6FA5")' value="${escapeHtml(value)}">
    <button type="button" class="admin-btn-sm admin-btn-danger remove-opt-btn" title="Remove">✕</button>
  `;
  row.querySelector('.remove-opt-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

document.getElementById('add-opt-group-btn')?.addEventListener('click', () => addOptionGroup());

/* ───── Save ───── */
document.getElementById('product-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('field-name').value.trim();
  const brand = document.getElementById('field-brand').value.trim();
  const category = document.getElementById('field-category').value;
  const family = document.getElementById('field-family').value.trim();
  const basePrice = parseInt(document.getElementById('field-price').value);
  const description = document.getElementById('field-description').value.trim();
  const imagesRaw = document.getElementById('field-images').value.trim();
  const inStock = document.getElementById('field-instock').checked;
  const featured = document.getElementById('field-featured').checked;

  if (!name || !brand || !category || !basePrice || !description) {
    await showModal({ title: 'Missing Fields', message: 'Please fill in all required fields.', type: 'alert' });
    return;
  }

  const images = imagesRaw ? imagesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const specifications = {};
  document.querySelectorAll('#specs-container .admin-spec-row').forEach(row => {
    const key = row.querySelector('.spec-key').value.trim();
    const val = row.querySelector('.spec-val').value.trim();
    if (key && val) specifications[key] = val;
  });

  const options = {};
  document.querySelectorAll('#options-container .admin-option-group').forEach(group => {
    const type = group.querySelector('.opt-type').value.trim();
    if (!type) return;
    const items = [];
    group.querySelectorAll('.admin-opt-row').forEach(row => {
      const label = row.querySelector('.opt-label').value.trim();
      const value = row.querySelector('.opt-value').value.trim();
      if (!label) return;
      if (type === 'color') {
        items.push({ label, hex: value || '#CCCCCC' });
      } else {
        items.push({ label, price: parseInt(value) || 0 });
      }
    });
    if (items.length > 0) options[type] = items;
  });

  const editingIdVal = document.getElementById('field-editing-id').value;

  const productData = {
    name, brand, category, family, basePrice, description, images,
    specifications, options, inStock, featured
  };

  if (editingIdVal) {
    productData.id = parseInt(editingIdVal);
  }

  try {
    await saveAdminProductApi(productData);
  } catch (e) {
    await showModal({ title: 'Error', message: e.message, type: 'alert' });
    return;
  }

  await showModal({ title: 'Saved', message: 'Product saved!', type: 'alert' });
  location.reload();
});

/* ───── Search ───── */
let searchTimeout;
document.getElementById('admin-search')?.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(renderAdminProducts, 200);
});

/* ───── Settings ───── */

document.getElementById('settings-btn')?.addEventListener('click', () => {
  const modal = document.getElementById('settings-modal');
  modal.classList.remove('hidden');
  document.getElementById('pw-current').value = '';
  document.getElementById('pw-new').value = '';
  document.getElementById('pw-confirm').value = '';
  document.getElementById('pw-error').classList.add('hidden');
});

document.getElementById('pw-cancel')?.addEventListener('click', () => {
  document.getElementById('settings-modal').classList.add('hidden');
});

document.getElementById('settings-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('settings-modal').classList.add('hidden');
  }
});

document.getElementById('password-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const current = document.getElementById('pw-current').value;
  const newPw = document.getElementById('pw-new').value;
  const confirmPw = document.getElementById('pw-confirm').value;
  const errorEl = document.getElementById('pw-error');

  if (newPw !== confirmPw) {
    errorEl.textContent = 'New passwords do not match';
    errorEl.classList.remove('hidden');
    return;
  }
  if (newPw.length < 4) {
    errorEl.textContent = 'Password must be at least 4 characters';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    await changePasswordApi(current, newPw);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
    return;
  }

  document.getElementById('pw-current').value = '';
  document.getElementById('pw-new').value = '';
  document.getElementById('pw-confirm').value = '';
  errorEl.classList.add('hidden');
  document.getElementById('settings-modal').classList.add('hidden');
  showModal({ title: 'Password Updated', message: 'Your admin password has been changed successfully.', type: 'alert' });
});

/* ───── Helpers ───── */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

/* ───── Custom Modal ───── */
function showModal({ title, message, confirmText, cancelText, type }) {
  return new Promise((resolve) => {
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="custom-modal-body">${escapeHtml(message)}</div>
        <div class="custom-modal-footer">
          ${type === 'confirm'
            ? `<button class="admin-btn admin-btn-outline modal-cancel">${escapeHtml(cancelText || 'Cancel')}</button>
               <button class="admin-btn admin-btn-primary modal-ok">${escapeHtml(confirmText || 'Yes')}</button>`
            : `<button class="admin-btn admin-btn-primary modal-ok">OK</button>`}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const okBtn = overlay.querySelector('.modal-ok');
    const cancelBtn = overlay.querySelector('.modal-cancel');

    if (okBtn) okBtn.addEventListener('click', () => { overlay.remove(); resolve(true); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { overlay.remove(); resolve(false); });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { overlay.remove(); resolve(false); }
    });
  });
}

/* ───── Init ───── */
initTheme();
checkLogin();
