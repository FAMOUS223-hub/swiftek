const API_BASE = '';

function getAuthToken() {
  return sessionStorage.getItem('swiftek_admin_token');
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() }
  });
  if (res.status === 401) {
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
    if (window.location.pathname.includes('admin.html')) {
      window.location.reload();
    }
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function apiPost(path, body, skipAuth) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(skipAuth ? {} : authHeaders())
    },
    body: JSON.stringify(body)
  });
  if (res.status === 401) {
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
    if (window.location.pathname.includes('admin.html')) {
      window.location.reload();
    }
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  if (res.status === 401) {
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
    if (window.location.pathname.includes('admin.html')) {
      window.location.reload();
    }
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// ───── Products (public) ─────

async function fetchProducts() {
  return apiGet('/api/products');
}

async function fetchProduct(id) {
  return apiGet(`/api/products/${id}`);
}

// ───── Trash (auth required) ─────

async function fetchTrash() {
  return apiGet('/api/trash');
}

async function deleteProductApi(id) {
  return apiDelete(`/api/products/${id}`);
}

async function restoreProductApi(id) {
  return apiPost(`/api/trash/${id}/restore`, {});
}

async function deleteForeverApi(id) {
  return apiDelete(`/api/trash/${id}`);
}

// ───── Admin Products (auth required) ─────

async function fetchAdminProducts() {
  return apiGet('/api/admin/products');
}

async function saveAdminProductApi(data) {
  return apiPost('/api/admin/products', data);
}

// ───── Auth ─────

async function loginApi(password) {
  const result = await apiPost('/api/auth/login', { password }, true);
  if (result.token) {
    sessionStorage.setItem('swiftek_admin_token', result.token);
    sessionStorage.setItem('swiftek_admin_logged_in', 'true');
  }
  return result;
}

async function logoutApi() {
  try {
    await apiPost('/api/auth/logout', {});
  } finally {
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
  }
}

async function changePasswordApi(currentPassword, newPassword) {
  return apiPost('/api/auth/change-password', { currentPassword, newPassword });
}

async function fetchConfig() {
  return apiGet('/api/config');
}

// ───── Stats (public) ─────

async function fetchStats() {
  return apiGet('/api/stats');
}
