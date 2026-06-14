const API_BASE = '';

function getAuthToken() {
  return localStorage.getItem('swiftek_admin_token') || sessionStorage.getItem('swiftek_admin_token');
}

function getUserToken() {
  return localStorage.getItem('swiftek_user_token');
}

function authHeaders() {
  const token = getAuthToken() || getUserToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() }
  });
  if (res.status === 401) {
    localStorage.removeItem('swiftek_admin_token');
    localStorage.removeItem('swiftek_admin_logged_in');
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
    localStorage.removeItem('swiftek_user_token');
    localStorage.removeItem('swiftek_user_data');
    if (window.location.pathname.includes('admin.html')) {
      window.location.reload();
    }
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function apiPost(path, body, skipAuth) {
  const headers = {
    'Content-Type': 'application/json',
    ...(skipAuth ? {} : authHeaders())
  };
  const hadAuth = !!headers.Authorization;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (res.status === 401) {
    if (hadAuth) {
      localStorage.removeItem('swiftek_admin_token');
      localStorage.removeItem('swiftek_admin_logged_in');
      sessionStorage.removeItem('swiftek_admin_token');
      sessionStorage.removeItem('swiftek_admin_logged_in');
      localStorage.removeItem('swiftek_user_token');
      localStorage.removeItem('swiftek_user_data');
      if (window.location.pathname.includes('admin.html')) {
        window.location.reload();
      }
      throw new Error('Session expired');
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Authentication failed');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(body)
  });
  if (res.status === 401) throw new Error('Session expired');
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
    localStorage.removeItem('swiftek_admin_token');
    localStorage.removeItem('swiftek_admin_logged_in');
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
    localStorage.removeItem('swiftek_user_token');
    localStorage.removeItem('swiftek_user_data');
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

// ───── User Auth ─────

async function registerApi(name, email, password) {
  const result = await apiPost('/api/auth/register', { name, email, password }, true);
  if (result.token) {
    localStorage.setItem('swiftek_user_token', result.token);
    localStorage.setItem('swiftek_user_data', JSON.stringify({ ...result.user, role: result.role }));
  }
  return result;
}

async function sendSignupOtpApi(email) {
  return apiPost('/api/auth/send-signup-otp', { email }, true);
}

async function checkSignupOtpApi(email, otp) {
  return apiPost('/api/auth/check-signup-otp', { email, otp }, true);
}

async function completeSignupApi(email, otp, name, password) {
  const result = await apiPost('/api/auth/complete-signup', { email, otp, name, password }, true);
  if (result.token) {
    localStorage.setItem('swiftek_user_token', result.token);
    localStorage.setItem('swiftek_user_data', JSON.stringify({ ...result.user, role: result.role }));
  }
  return result;
}

async function checkEmailApi(email) {
  return apiPost('/api/auth/check-email', { email }, true);
}

async function userLoginApi(email, password, requiredRole) {
  const body = { email, password };
  if (requiredRole) body.requiredRole = requiredRole;
  const result = await apiPost('/api/auth/login', body, true);
  if (result.token) {
    localStorage.setItem('swiftek_user_token', result.token);
    localStorage.setItem('swiftek_user_data', JSON.stringify({ ...result.user, role: result.role }));
  }
  return result;
}

async function userLogoutApi() {
  try {
    await apiPost('/api/auth/logout', {});
  } finally {
    localStorage.removeItem('swiftek_user_token');
    localStorage.removeItem('swiftek_user_data');
  }
}

async function forgotPasswordApi(email) {
  return apiPost('/api/auth/forgot-password', { email }, true);
}

async function verifyResetOtpApi(email, otp) {
  return apiPost('/api/auth/verify-reset-otp', { email, otp }, true);
}

async function resetPasswordApi(token, password) {
  return apiPost('/api/auth/reset-password', { token, password }, true);
}

async function fetchUserOrders() {
  return apiGet('/api/orders');
}

async function createOrderApi(orderData) {
  return apiPost('/api/orders', orderData);
}

// ───── Admin Auth (legacy) ─────

async function loginApi(password) {
  const result = await apiPost('/api/auth/admin-login', { password }, true);
  if (result.token) {
    localStorage.setItem('swiftek_admin_token', result.token);
    localStorage.setItem('swiftek_admin_logged_in', 'true');
  }
  return result;
}

async function logoutApi() {
  try {
    await apiPost('/api/auth/logout', {});
  } finally {
    localStorage.removeItem('swiftek_admin_token');
    localStorage.removeItem('swiftek_admin_logged_in');
    sessionStorage.removeItem('swiftek_admin_token');
    sessionStorage.removeItem('swiftek_admin_logged_in');
  }
}

async function changePasswordApi(currentPassword, newPassword) {
  return apiPost('/api/auth/change-password', { currentPassword, newPassword });
}

async function fetchMe() {
  return apiGet('/api/auth/me');
}

async function updateProfileApi({ name, email, currentPassword, newPassword }) {
  return apiPatch('/api/auth/profile', { name, email, currentPassword, newPassword });
}

// ───── Admin: Users & Orders ─────

async function fetchAdminUsers() {
  return apiGet('/api/admin/users');
}

async function fetchAdminUserOrders(userId) {
  return apiGet(`/api/admin/users/${userId}/orders`);
}

async function updateUserStatusApi(userId, status) {
  return apiPatch(`/api/admin/users/${userId}/status`, { status });
}

async function deleteUserApi(userId) {
  return apiDelete(`/api/admin/users/${userId}`);
}

async function fetchAdminOrders() {
  return apiGet('/api/admin/orders');
}

async function updateOrderStatusApi(orderId, status) {
  return apiPatch(`/api/admin/orders/${orderId}/status`, { status });
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

// ───── Stats (public) ─────

async function fetchStats() {
  return apiGet('/api/stats');
}

async function fetchPendingOrderCount() {
  return apiGet('/api/orders/pending-count');
}

// ───── Admin Management (super admin) ─────

async function fetchAdmins() {
  return apiGet('/api/admin/admins');
}

async function createAdminApi(data) {
  return apiPost('/api/admin/admins', data);
}

async function updateAdminPermissionsApi(adminId, data) {
  return apiPatch(`/api/admin/admins/${adminId}`, data);
}

async function deleteAdminApi(adminId) {
  return apiDelete(`/api/admin/admins/${adminId}`);
}

// ───── Session helpers ─────

// ───── Ratings ─────

async function fetchProductRatings(productId) {
  return apiGet(`/api/products/${productId}/ratings`);
}

async function submitRatingApi(productId, rating, review) {
  return apiPost(`/api/products/${productId}/ratings`, { rating, review });
}

// ───── Comments ─────

async function fetchProductComments(productId) {
  return apiGet(`/api/products/${productId}/comments`);
}

async function submitCommentApi(productId, text) {
  return apiPost(`/api/products/${productId}/comments`, { text });
}

function clearUserSession() {
  localStorage.removeItem('swiftek_user_token');
  localStorage.removeItem('swiftek_user_data');
}
