function togglePassword(btn) {
  const input = btn.parentElement.querySelector('input');
  const icon = btn.querySelector('i');
  if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { input.type = 'password'; icon.className = 'fas fa-eye'; }
}

let editingId = null;

function isStaticProduct(id) {
  return id < 101;
}

function isAdminCreated(id, adminProducts) {
  return adminProducts.some(p => p.id === id && p._adminCreated);
}

/* ───── Login ───── */
const loginForm = document.getElementById('admin-login-form');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginError = document.getElementById('login-error');
const emailInput = document.getElementById('admin-email');
const passwordInput = document.getElementById('admin-password');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    try {
      const result = await userLoginApi(emailInput.value.trim(), passwordInput.value);
      if (result.role !== 'admin') {
        loginError.textContent = 'This account does not have admin access';
        loginError.classList.remove('hidden');
        return;
      }
      localStorage.setItem('swiftek_admin_token', result.token);
      localStorage.setItem('swiftek_admin_logged_in', 'true');
      if (result.user) {
        localStorage.setItem('swiftek_user_data', JSON.stringify({ ...result.user, role: result.role }));
      }
      showDashboard();
    } catch {
      loginError.textContent = 'Invalid email or password';
      loginError.classList.remove('hidden');
      passwordInput.value = '';
    }
  });
}

async function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');

  initLiquidNavbar();

  const userData = (() => { try { return JSON.parse(localStorage.getItem('swiftek_user_data') || '{}'); } catch(e) { return {}; } })();
  const adminsBtn = document.getElementById('admins-btn');
  if (adminsBtn) {
    adminsBtn.style.display = userData.isSuperAdmin ? '' : 'none';
  }

  const heroVideo = document.querySelector('.admin-hero-video');
  if (heroVideo) {
    heroVideo.play().catch(function() {
      function tryPlay() {
        heroVideo.play().catch(function(){});
        document.removeEventListener('touchstart', tryPlay);
        document.removeEventListener('click', tryPlay);
      }
      document.addEventListener('touchstart', tryPlay, {once: true});
      document.addEventListener('click', tryPlay, {once: true});
    });
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
  if (localStorage.getItem('swiftek_admin_token')) {
    showDashboard();
    fetchAndBadgeAdminOrders();
    return;
  }
  const userToken = localStorage.getItem('swiftek_user_token');
  if (userToken) {
    try {
      const userData = JSON.parse(localStorage.getItem('swiftek_user_data') || '{}');
      if (userData && userData.role === 'admin') {
        localStorage.setItem('swiftek_admin_token', userToken);
        localStorage.setItem('swiftek_admin_logged_in', 'true');
        showDashboard();
        fetchAndBadgeAdminOrders();
      }
    } catch(e) {}
  }
}

async function fetchAndBadgeAdminOrders() {
  try {
    const data = await fetchPendingOrderCount();
    const count = data.count || 0;
    const btn = document.getElementById('orders-btn');
    if (btn && count > 0) {
      const existing = btn.querySelector('.notif-badge');
      if (existing) existing.textContent = count > 99 ? '99+' : count;
      else btn.insertAdjacentHTML('beforeend', `<span class="notif-badge">${count > 99 ? '99+' : count}</span>`);
    }
  } catch (e) {}
}

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await logoutApi();
  localStorage.removeItem('swiftek_admin_token');
  localStorage.removeItem('swiftek_admin_logged_in');
  localStorage.removeItem('swiftek_user_token');
  localStorage.removeItem('swiftek_user_data');
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  passwordInput.value = '';
  const heroVideo = document.querySelector('.admin-hero-video');
  if (heroVideo) { heroVideo.pause(); }
});

/* ───── Product List ───── */
async function renderAdminProducts() {
  const container = document.getElementById('admin-product-list');
  const search = (document.getElementById('admin-search')?.value || '').toLowerCase();
  const isSearch = !!search;

  if (!isSearch) {
    container.innerHTML = skeletonCards(5);
  } else {
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
  }

  let adminProducts = [];
  let storeProducts = [];

  try {
    [adminProducts, storeProducts] = await Promise.all([
      fetchAdminProducts(),
      fetchProducts()
    ]);
  } catch {
    container.innerHTML = '<div class="admin-empty">Failed to load products. Try refreshing.</div>';
    return;
  }

  const allProducts = storeProducts;
  document.getElementById('stat-total').textContent = allProducts.length;
  document.getElementById('stat-admin').textContent = adminProducts.filter(p => p._adminCreated).length;

  fetchTrash().then(trash => {
    document.getElementById('stat-trash').textContent = trash.length;
  }).catch(() => {});
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
          : '<div class="admin-no-img"><i class="fas fa-camera"></i></div>'}
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
    const count = trash.length;
    btn.innerHTML = `<i class="fas fa-trash"></i> Trash${count > 0 ? ` (${count})` : ''}`;
  }
}

async function renderTrash() {
  const container = document.getElementById('trash-list');
  const section = document.getElementById('trash-section');
  if (!container || !section) return;
  container.innerHTML = skeletonCards(2);
  const trash = await fetchTrash();

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
          : '<div class="admin-no-img"><i class="fas fa-camera"></i></div>'}
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

/* ───── Section Navigation ───── */

const SECTION_MAP = {
  main:      { panel: null,          render: null,              hidesList: false },
  'admin-prod': { panel: 'admin-prod-section', render: 'renderAdminProdList', hidesList: true },
  trash:     { panel: 'trash-section', render: 'renderTrash',     hidesList: true },
  users:     { panel: 'users-section', render: 'renderUsers',     hidesList: true },
  'user-orders': { panel: 'user-orders-section', render: 'renderUserOrders', hidesList: true },
  orders:    { panel: 'orders-section', render: 'renderAllOrders', hidesList: true },
  admins:    { panel: 'admins-section', render: 'renderAdmins',   hidesList: true },
  settings:  { panel: 'settings-section', render: null,           hidesList: true }
};

let currentSection = 'main';

function switchSection(sectionId) {
  const list = document.getElementById('admin-product-list');
  const search = document.getElementById('admin-search');
  const formModal = document.getElementById('product-form-modal');

  if (sectionId === 'main' || sectionId === currentSection) {
    currentSection = 'main';
    Object.keys(SECTION_MAP).forEach(key => {
      const info = SECTION_MAP[key];
      if (info.panel) document.getElementById(info.panel)?.classList.add('hidden');
    });
    if (list) list.style.display = '';
    document.getElementById('settings-modal')?.classList.add('hidden');
    if (formModal) formModal.classList.add('hidden');
    updateActiveButton();
    return;
  }

  const info = SECTION_MAP[sectionId];
  if (!info) return;

  Object.keys(SECTION_MAP).forEach(key => {
    const other = SECTION_MAP[key];
    if (other.panel && other.panel !== info.panel) {
      document.getElementById(other.panel)?.classList.add('hidden');
    }
  });

  if (list) list.style.display = info.hidesList ? 'none' : '';
  if (info.panel) document.getElementById(info.panel)?.classList.remove('hidden');
  document.getElementById('settings-modal')?.classList.add('hidden');
  if (formModal) formModal.classList.add('hidden');

  currentSection = sectionId;
  updateActiveButton();

  if (info.render && typeof window[info.render] === 'function') {
    window[info.render]();
  }

  if (sectionId === 'settings') {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.getElementById('pw-current').value = '';
      document.getElementById('pw-new').value = '';
      document.getElementById('pw-confirm').value = '';
      document.getElementById('pw-error').classList.add('hidden');
      loadAdminProfile();
    }
  }
}

function updateActiveButton() {
  document.querySelectorAll('.admin-controls .admin-btn, .admin-stat-card').forEach(el => {
    const section = el.dataset.section;
    el.classList.toggle('active', section === currentSection && currentSection !== 'main');
  });
}

document.querySelectorAll('.admin-controls .admin-btn[data-section], .admin-stat-card[data-section]').forEach(el => {
  el.addEventListener('click', () => switchSection(el.dataset.section));
});

async function renderAdminProdList() {
  const container = document.getElementById('admin-prod-list');
  const section = document.getElementById('admin-prod-section');
  if (!container || !section) return;
  container.innerHTML = skeletonCards(3);
  const allProducts = await fetchAdminProducts();

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
  document.getElementById('field-negotiable').checked = product.negotiable === true;

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
  document.getElementById('field-negotiable').checked = false;
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
  const negotiable = document.getElementById('field-negotiable').checked;

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
    specifications, options, inStock, featured, negotiable
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

/* ───── Users ───── */

async function renderUsers() {
  const container = document.getElementById('users-list');
  const section = document.getElementById('users-section');
  if (!container || !section) return;
  container.innerHTML = skeletonCards(4);

  const users = await fetchAdminUsers();
  if (users.length === 0) {
    container.innerHTML = '<div class="admin-empty">No users registered yet.</div>';
    return;
  }

  container.innerHTML = users.map(u => {
    const statusBadge = u.status === 'active'
      ? '<span class="admin-status-active">● Active</span>'
      : u.status === 'suspended'
      ? '<span class="admin-status-suspended">● Suspended</span>'
      : '<span class="admin-status-revoked">● Revoked</span>';

    let statusActions = '';
    if (u.status === 'active') {
      if (u.role !== 'admin') {
        statusActions = `
          <button class="admin-btn-sm admin-btn-outline" onclick="suspendUser('${u.id}')" title="Suspend"><i class="fas fa-pause"></i></button>
          <button class="admin-btn-sm admin-btn-outline" onclick="revokeUser('${u.id}')" title="Revoke"><i class="fas fa-ban"></i></button>
        `;
      }
      statusActions += `<button class="admin-btn-sm admin-btn-outline admin-btn-sm-danger" onclick="deleteUserConfirm('${u.id}', '${escapeHtml(u.name)}')" title="Delete"><i class="fas fa-trash"></i></button>`;
    } else if (u.status === 'suspended') {
      statusActions = `
        <button class="admin-btn-sm admin-btn-outline" onclick="reactivateUser('${u.id}')" title="Reactivate"><i class="fas fa-play"></i> Reactivate</button>
        <button class="admin-btn-sm admin-btn-outline admin-btn-sm-danger" onclick="deleteUserConfirm('${u.id}', '${escapeHtml(u.name)}')" title="Delete"><i class="fas fa-trash"></i></button>
      `;
    } else if (u.status === 'revoked') {
      statusActions = `
        <button class="admin-btn-sm admin-btn-outline" onclick="reactivateUser('${u.id}')" title="Reactivate"><i class="fas fa-undo"></i> Reactivate</button>
        <button class="admin-btn-sm admin-btn-outline admin-btn-sm-danger" onclick="deleteUserConfirm('${u.id}', '${escapeHtml(u.name)}')" title="Delete"><i class="fas fa-trash"></i></button>
      `;
    }
    let actions = statusActions;

    return `
      <div class="admin-product-item">
        <div class="admin-user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="admin-product-info">
          <div class="admin-product-name">${escapeHtml(u.name)} ${u.role === 'admin' ? '<span class="admin-role-badge">ADMIN</span>' : ''}</div>
          <div class="admin-product-meta">${escapeHtml(u.email)} · ${statusBadge} · ${u.verified ? '<i class="fas fa-check-circle admin-icon-verified"></i> Verified' : '<i class="fas fa-times-circle admin-icon-unverified"></i> Unverified'} · Joined ${new Date(u.createdAt).toLocaleDateString()}</div>
          <div class="admin-product-meta">Orders: ${u.orderCount} · Total Spent: GH₵ ${(u.totalSpent || 0).toLocaleString()}</div>
        </div>
        <div class="admin-product-actions">
          ${actions}
        </div>
      </div>
    `;
  }).join('');
}

async function suspendUser(userId) {
  const confirmed = await showModal({
    title: 'Suspend User',
    message: 'Are you sure you want to suspend this user? They will not be able to log in until reactivated.',
    confirmText: 'Suspend',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  if (!confirmed) return;
  try {
    await updateUserStatusApi(userId, 'suspended');
    showToast('User suspended');
    renderUsers();
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

async function revokeUser(userId) {
  const confirmed = await showModal({
    title: 'Revoke User',
    message: 'Are you sure you want to revoke this user\'s access? This is a permanent action, though you can reactivate later.',
    confirmText: 'Revoke',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  if (!confirmed) return;
  try {
    await updateUserStatusApi(userId, 'revoked');
    showToast('User revoked');
    renderUsers();
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

async function reactivateUser(userId) {
  const confirmed = await showModal({
    title: 'Reactivate User',
    message: 'Restore this user\'s access? They will be able to log in again.',
    confirmText: 'Reactivate',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  if (!confirmed) return;
  try {
    await updateUserStatusApi(userId, 'active');
    showToast('User reactivated');
    renderUsers();
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

async function deleteUserConfirm(userId, userName) {
  const confirmed = await showModal({
    title: 'Delete User',
    message: `Permanently delete ${userName} and all their orders? This cannot be undone.`,
    confirmText: 'Delete Forever',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  if (!confirmed) return;
  try {
    await deleteUserApi(userId);
    showToast('User deleted permanently');
    renderUsers();
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

async function renderUserOrders() {
  const container = document.getElementById('user-orders-list');
  const section = document.getElementById('user-orders-section');
  if (!container || !section) return;

  const users = await fetchAdminUsers();
  if (users.length === 0) {
    container.innerHTML = '<div class="admin-empty">No users registered yet.</div>';
    return;
  }

  container.innerHTML = skeletonUoCards(3);

  const results = await Promise.all(users.map(async (u) => {
    let ordersHtml = '';
    let confirmedOrders = [];
    try {
      const orders = await fetchAdminUserOrders(u.id);
      confirmedOrders = (orders || []).filter(o => o.status !== 'pending');
      if (confirmedOrders.length > 0) {
        ordersHtml = confirmedOrders.map(order => `
          <div class="uo-order">
            <div class="uo-order-header">
              <strong>${escapeHtml(order.orderRef)}</strong>
              <span class="uo-order-status">${order.status}</span>
              <span class="uo-order-total">GH₵ ${(order.total || 0).toLocaleString()}</span>
            </div>
            <div class="uo-order-date">${new Date(order.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            <div class="uo-order-items">${order.items.map(item => `${escapeHtml(item.name)} x${item.qty}`).join(', ')}</div>
          </div>
        `).join('');
      }
    } catch {
      return null;
    }
    if (confirmedOrders.length === 0) return null;

    return `
      <div class="uo-user-card">
        <div class="uo-user-header">
          <div class="uo-user-avatar"><i class="fas fa-user"></i></div>
          <div class="uo-user-info">
            <div class="uo-user-name">${escapeHtml(u.name)}</div>
            <div class="uo-user-email">${escapeHtml(u.email)}</div>
          </div>
          <div class="uo-user-meta">
            <span>${confirmedOrders.length} order${confirmedOrders.length !== 1 ? 's' : ''}</span>
            <span>GH₵ ${(u.totalSpent || 0).toLocaleString()}</span>
          </div>
        </div>
        <div class="uo-orders-list">${ordersHtml}</div>
      </div>
    `;
  }));

  const filtered = results.filter(Boolean);
  container.innerHTML = filtered.length > 0
    ? filtered.join('')
    : '<div class="admin-empty">No confirmed orders yet.</div>';
}

/* ───── Orders ───── */


async function renderAllOrders() {
  const container = document.getElementById('orders-list-admin');
  const section = document.getElementById('orders-section');
  if (!container || !section) return;
  container.innerHTML = skeletonOrderCards(4);

  const orders = await fetchAdminOrders();
  if (orders.length === 0) {
    container.innerHTML = '<div class="admin-empty">No orders placed yet.</div>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="admin-product-item admin-order-col">
      <div class="admin-order-header">
        <div>
          <div class="admin-product-name">${escapeHtml(order.orderRef)} <span class="admin-badge-${order.status}">${order.status}</span></div>
          <div class="admin-product-meta">${order.User ? escapeHtml(order.User.name) : 'Unknown'} · ${order.User ? escapeHtml(order.User.email) : ''} · ${new Date(order.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        </div>
        <div class="admin-order-actions">
          <select class="admin-order-status-select" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <span class="admin-order-total">GH₵ ${(order.total || 0).toLocaleString()}</span>
        </div>
      </div>
      <div class="admin-order-items">
        ${order.items.map(item => `${escapeHtml(item.name)} x${item.qty}`).join(', ')}
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    await updateOrderStatusApi(orderId, status);
    showToast('Order status updated');
    fetchAndBadgeAdminOrders();
    renderAllOrders();
  } catch (err) {
    showToast('Failed to update status');
  }
}

/* ───── Search ───── */
let searchTimeout;
document.getElementById('admin-search')?.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(renderAdminProducts, 200);
});

/* ───── Settings ───── */

async function loadAdminProfile() {
  try {
    const user = await fetchMe();
    document.getElementById('prof-name').value = user.name || '';
    document.getElementById('prof-email').value = user.email || '';
  } catch (err) {
    document.getElementById('prof-name').value = '';
    document.getElementById('prof-email').value = '';
  }
}

document.getElementById('pw-cancel')?.addEventListener('click', () => {
  document.getElementById('settings-modal').classList.add('hidden');
});

document.getElementById('settings-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('settings-modal').classList.add('hidden');
  }
});

document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('prof-name').value.trim();
  const email = document.getElementById('prof-email').value.trim();
  const currentPw = document.getElementById('pw-current').value;
  const newPw = document.getElementById('pw-new').value;
  const confirmPw = document.getElementById('pw-confirm').value;
  const errorEl = document.getElementById('pw-error');

  if (newPw && newPw !== confirmPw) {
    errorEl.textContent = 'New passwords do not match';
    errorEl.classList.remove('hidden');
    return;
  }
  if (newPw && newPw.length < 4) {
    errorEl.textContent = 'Password must be at least 4 characters';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    await updateProfileApi({
      name: name || undefined,
      email: email || undefined,
      currentPassword: newPw ? currentPw : undefined,
      newPassword: newPw || undefined
    });
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
  showModal({ title: 'Settings Saved', message: 'Your profile has been updated successfully.', type: 'alert' });
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

/* ───── Toast ───── */
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
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2600);
}

/* ───── Admin Management ───── */

async function renderAdmins() {
  const container = document.getElementById('admins-list');
  if (!container) return;
  container.innerHTML = skeletonCards(3);

  try {
    const admins = await fetchAdmins();
    const userData = (() => { try { return JSON.parse(localStorage.getItem('swiftek_user_data') || '{}'); } catch(e) { return {}; } })();
    const currentEmail = userData.email || '';

    let html = `
      <div class="admin-mgmt-bar">
        <button class="admin-btn admin-btn-primary" onclick="showCreateAdminModal()"><i class="fas fa-plus"></i> Add Admin</button>
      </div>
    `;

    if (!admins || admins.length === 0) {
      html += '<div class="empty-state"><i class="fas fa-user-shield admin-empty-icon"></i><p class="text-muted">No admins found.</p></div>';
    } else {
      admins.forEach(admin => {
        const isSelf = admin.email === currentEmail;
        const badge = admin.isSuperAdmin
          ? '<span class="admin-meta-badge admin-badge-super">Super Admin</span>'
          : '<span class="admin-meta-badge admin-badge-admin">Admin</span>';

        const permChips = (admin.permissions || []).map(p =>
          `<span class="admin-perm-chip">${p.charAt(0).toUpperCase() + p.slice(1)}</span>`
        ).join('');

        html += `
          <div class="admin-user-item">
            <div class="admin-product-info">
              <div class="admin-product-name">
                ${escapeHtml(admin.name)} ${badge}
                ${isSelf ? '<span class="admin-meta-badge you-badge">You</span>' : ''}
              </div>
              <div class="admin-product-meta">${escapeHtml(admin.email)}</div>
              <div class="admin-perm-list">${permChips}</div>
              <div class="admin-product-meta admin-meta-mt6">Created ${new Date(admin.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="admin-product-actions">
              ${!admin.isSuperAdmin
                ? `<button class="admin-btn-sm admin-btn-primary" onclick="showEditAdminModal('${admin.id}')" title="Edit permissions"><i class="fas fa-edit"></i></button>
                   <button class="admin-btn-sm admin-btn-danger" onclick="deleteAdmin('${admin.id}')" title="Remove admin"><i class="fas fa-trash"></i></button>`
                : '<span class="admin-full-access">Full access</span>'
              }
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="text-danger">Failed to load admins.</p></div>`;
  }
}

function showCreateAdminModal() {
  document.getElementById('admin-modal-title').innerHTML = '<i class="fas fa-user-shield"></i> New Admin';
  document.getElementById('admin-submit-btn').textContent = 'Create Admin';
  document.getElementById('admin-editing-id').value = '';
  document.getElementById('admin-form').reset();
  document.getElementById('admin-password-field').style.display = '';
  document.getElementById('admin-modal-password').required = true;
  document.querySelectorAll('#admin-form .admin-checkbox input').forEach(cb => cb.checked = true);
  document.getElementById('admin-modal').classList.remove('hidden');
}

function showEditAdminModal(adminId) {
  document.getElementById('admin-modal-title').innerHTML = '<i class="fas fa-user-shield"></i> Edit Admin Permissions';
  document.getElementById('admin-submit-btn').textContent = 'Update Permissions';
  document.getElementById('admin-editing-id').value = adminId;
  document.getElementById('admin-password-field').style.display = 'none';
  document.getElementById('admin-modal-password').required = false;
  document.getElementById('admin-form').reset();
  document.getElementById('admin-modal').classList.remove('hidden');

  fetchAdmins().then(admins => {
    const admin = admins.find(a => a.id === adminId);
    if (!admin) return;
    document.getElementById('admin-name').value = admin.name || '';
    document.getElementById('admin-modal-email').value = admin.email || '';
    document.querySelectorAll('#admin-form .admin-checkbox input').forEach(cb => {
      cb.checked = (admin.permissions || []).includes(cb.value);
    });
  }).catch(() => {});
}

document.getElementById('admin-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const editingId = document.getElementById('admin-editing-id').value;
  const name = document.getElementById('admin-name').value.trim();
  const email = document.getElementById('admin-modal-email').value.trim();
  const password = document.getElementById('admin-modal-password').value;
  const perms = [];
  document.querySelectorAll('#admin-form .admin-checkbox input:checked').forEach(cb => perms.push(cb.value));

  try {
    if (editingId) {
      await updateAdminPermissionsApi(editingId, { permissions: perms });
      showToast('Permissions updated');
    } else {
      await createAdminApi({ name, email, password, permissions: perms });
      showToast('Admin created');
    }
    document.getElementById('admin-modal').classList.add('hidden');
    renderAdmins();
  } catch (err) {
    showToast(err.message || 'Failed');
  }
});

async function deleteAdmin(adminId) {
  if (!confirm('Remove this admin?')) return;
  try {
    await deleteAdminApi(adminId);
    showToast('Admin removed');
    renderAdmins();
  } catch (err) {
    showToast(err.message || 'Failed to delete');
  }
}

/* ───── Skeleton Helpers ───── */

function skeletonCards(count) {
  return Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton-content">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line-sm"></div>
      </div>
      <div class="skeleton skeleton-btn"></div>
    </div>
  `).join('');
}

function skeletonUoCards(count) {
  return Array(count).fill(`
    <div class="skeleton-card-uo">
      <div class="skeleton-card-uo-header">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-card-uo-body">
          <div class="skeleton skeleton-line skel-w50"></div>
          <div class="skeleton skeleton-line-sm skel-w30"></div>
        </div>
      </div>
      <div class="skeleton skeleton-line skel-w80"></div>
      <div class="skeleton skeleton-line-sm skel-w40"></div>
    </div>
  `).join('');
}

function skeletonOrderCards(count) {
  return Array(count).fill(`
    <div class="skeleton-card skeleton-card-col">
      <div class="skeleton-card-header">
        <div class="skeleton-card-fill"><div class="skeleton skeleton-line skel-w40"></div></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
      <div class="skeleton skeleton-line-sm skel-w70"></div>
    </div>
  `).join('');
}

/* ───── Init ───── */
initTheme();
checkLogin();

window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

function initLiquidNavbar() {
  if (window.innerWidth < 768) return;

  // 1. Main Header
  const headerInner = document.querySelector('.header-inner');
  const headerIndicator = headerInner?.querySelector('.liquid-indicator');
  const headerLogo = headerInner?.querySelector('.logo');
  const headerActions = headerInner?.querySelectorAll('.header-action-btn');
  
  if (headerInner && headerIndicator) {
    const moveHeader = (el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const parentRect = headerInner.getBoundingClientRect();
      headerIndicator.style.left = `${rect.left - parentRect.left}px`;
      headerIndicator.style.width = `${rect.width}px`;
      headerIndicator.style.opacity = '1';
    };
    
    // Default to logo
    if (headerLogo) moveHeader(headerLogo);
    
    headerInner.querySelectorAll('.logo, .header-action-btn').forEach(el => {
      el.addEventListener('mouseenter', () => moveHeader(el));
    });
    
    headerInner.addEventListener('mouseleave', () => {
      if (headerLogo) moveHeader(headerLogo);
    });
  }

  // 2. Admin Controls (Pills)
  const controls = document.querySelector('.admin-controls');
  const controlIndicator = controls?.querySelector('.liquid-indicator');
  const controlBtns = controls?.querySelectorAll('.admin-btn');

  if (controls && controlIndicator && controlBtns.length > 0) {
    const moveControl = (el) => {
      if (!el) {
        controlIndicator.style.opacity = '0';
        return;
      }
      const rect = el.getBoundingClientRect();
      const parentRect = controls.getBoundingClientRect();
      
      controlIndicator.style.opacity = '1';
      controlIndicator.style.left = `${rect.left - parentRect.left}px`;
      controlIndicator.style.top = `${rect.top - parentRect.top}px`;
      controlIndicator.style.width = `${rect.width}px`;
      controlIndicator.style.height = `${rect.height}px`;
    };

    // Initial position on active button
    const activeBtn = Array.from(controlBtns).find(btn => btn.classList.contains('active'));
    if (activeBtn) moveControl(activeBtn);

    controlBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => moveControl(btn));
      
      btn.addEventListener('click', () => {
        // Short delay to allow 'active' class to be swapped by other logic
        setTimeout(() => {
          const newActive = Array.from(controlBtns).find(b => b.classList.contains('active'));
          moveControl(newActive);
        }, 10);
      });
    });

    controls.addEventListener('mouseleave', () => {
      const currentActive = Array.from(controlBtns).find(btn => btn.classList.contains('active'));
      moveControl(currentActive);
    });
  }
}
