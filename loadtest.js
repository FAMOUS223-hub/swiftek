import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = 'https://swiftek.onrender.com';

const errorRate = new Rate('errors');
const browseTime = new Trend('browse_time_ms');
const signupTime = new Trend('signup_time_ms');
const loginTime = new Trend('login_time_ms');
const orderTime = new Trend('order_time_ms');
const adminTime = new Trend('admin_time_ms');
const forgotTime = new Trend('forgot_time_ms');
const rateCommentTime = new Trend('rate_comment_time_ms');

const THINK_TIME_MAX = 3;

function randSleep(max) {
  sleep(Math.random() * (max || THINK_TIME_MAX) + 0.3);
}

function jsonHeaders() {
  return { 'Content-Type': 'application/json' };
}

function authHeaders(token) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function randomProductId(ids) {
  return ids[Math.floor(Math.random() * ids.length)];
}

function collectErrors(status, checkResult) {
  if (!checkResult) errorRate.add(1);
}

export const options = {
  thresholds: {
    errors: ['rate<0.15'],
    http_req_duration: ['p(95)<8000', 'p(99)<15000'],
  },
  scenarios: {
    browsing: {
      executor: 'constant-vus',
      vus: 80,
      duration: '4m',
      exec: 'browseProducts',
      gracefulStop: '10s',
    },
    registration: {
      executor: 'constant-vus',
      vus: 20,
      duration: '4m',
      exec: 'userRegistration',
      gracefulStop: '10s',
    },
    login: {
      executor: 'constant-vus',
      vus: 40,
      duration: '4m',
      exec: 'userLogin',
      gracefulStop: '10s',
    },
    shopper: {
      executor: 'constant-vus',
      vus: 30,
      duration: '4m',
      exec: 'shopperFlow',
      gracefulStop: '10s',
    },
    admin: {
      executor: 'constant-vus',
      vus: 15,
      duration: '4m',
      exec: 'adminActions',
      gracefulStop: '10s',
    },
    forgot: {
      executor: 'constant-vus',
      vus: 15,
      duration: '4m',
      exec: 'forgotPassword',
      gracefulStop: '10s',
    },
  },
};

export function setup() {
  console.log('Fetching products and logging in admin...');

  const productsRes = http.get(`${BASE_URL}/api/products`, {
    tags: { name: 'setup_products' },
  });
  const products = productsRes.json();
  const productIds = Array.isArray(products) ? products.slice(0, 80).map(p => p.id) : [1, 2, 3, 4, 5];
  console.log(`Loaded ${productIds.length} product IDs`);

  const adminLogin = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@swiftek.com',
    password: 'admin',
  }), { headers: jsonHeaders(), tags: { name: 'setup_admin_login' } });

  const adminToken = adminLogin.json('token') || '';
  console.log(`Admin login: ${adminLogin.status} ${adminToken ? 'token obtained' : 'FAILED'}`);

  return { productIds, adminToken };
}

export function browseProducts(data) {
  const ids = data.productIds;

  const res = http.get(`${BASE_URL}/api/products`, {
    tags: { name: 'browse_list' },
  });
  browseTime.add(res.timings.duration);
  collectErrors(res.status, check(res, { 'list products ok': r => r.status === 200 }));
  randSleep(2);

  const id = randomProductId(ids);
  const detailRes = http.get(`${BASE_URL}/api/products/${id}`, {
    tags: { name: 'browse_detail' },
  });
  browseTime.add(detailRes.timings.duration);
  collectErrors(detailRes.status, check(detailRes, { 'product detail ok': r => r.status === 200 }));
  randSleep(1.5);

  const id2 = randomProductId(ids);
  const ratingRes = http.get(`${BASE_URL}/api/products/${id2}/ratings`, {
    tags: { name: 'browse_ratings' },
  });
  browseTime.add(ratingRes.timings.duration);
  randSleep(1);

  const id3 = randomProductId(ids);
  const commentRes = http.get(`${BASE_URL}/api/products/${id3}/comments`, {
    tags: { name: 'browse_comments' },
  });
  browseTime.add(commentRes.timings.duration);
  randSleep(1);

  const statsRes = http.get(`${BASE_URL}/api/stats`, {
    tags: { name: 'browse_stats' },
  });
  browseTime.add(statsRes.timings.duration);
  randSleep(3);
}

export function userRegistration(data) {
  const vu = __VU;
  const ts = Date.now();
  const email = `signup_${vu}_${ts}@lt.swiftek`;

  const checkRes = http.post(`${BASE_URL}/api/auth/check-email`, JSON.stringify({
    email,
  }), { headers: jsonHeaders(), tags: { name: 'check_email' } });
  signupTime.add(checkRes.timings.duration);
  randSleep(1);

  const regRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: `Signup User ${vu}`,
    email,
    password: 'testpass123',
  }), { headers: jsonHeaders(), tags: { name: 'register' } });
  signupTime.add(regRes.timings.duration);

  const registered = check(regRes, {
    'registration ok': r => r.status === 200 && r.json('success') === true,
  });
  collectErrors(regRes.status, registered);
  randSleep(2);

  if (registered) {
    const token = regRes.json('token');
    http.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      tags: { name: 'reg_auth_me' },
    });
    randSleep(1);

    http.get(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
      tags: { name: 'reg_my_orders' },
    });
    randSleep(3);
  }
}

export function userLogin(data) {
  const vu = __VU;
  const state = {};
  const email = `loginuser_${vu}@lt.swiftek`;

  const regRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: `Login User ${vu}`,
    email,
    password: 'testpass123',
  }), { headers: jsonHeaders(), tags: { name: 'login_preregister' } });

  if (regRes.json('success')) {
    state.token = regRes.json('token');
  }
  randSleep(1);

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email,
    password: 'testpass123',
  }), { headers: jsonHeaders(), tags: { name: 'login' } });
  loginTime.add(loginRes.timings.duration);

  const loggedIn = check(loginRes, {
    'login ok': r => r.status === 200 && r.json('success') === true,
  });
  collectErrors(loginRes.status, loggedIn);

  if (loggedIn) {
    state.token = loginRes.json('token');
  }
  randSleep(2);

  if (state.token) {
    const meRes = http.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${state.token}` },
      tags: { name: 'login_auth_me' },
    });
    loginTime.add(meRes.timings.duration);
    randSleep(1);

    const ordersRes = http.get(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${state.token}` },
      tags: { name: 'login_my_orders' },
    });
    randSleep(3);
  }
}

export function shopperFlow(data) {
  const ids = data.productIds;
  const vu = __VU;
  const ts = Date.now();
  const email = `shopper_${vu}_${ts}@lt.swiftek`;

  const regRes = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: `Shopper ${vu}`,
    email,
    password: 'testpass123',
  }), { headers: jsonHeaders(), tags: { name: 'shopper_register' } });

  const token = regRes.json('token');
  if (!token) {
    randSleep(3);
    return;
  }
  randSleep(1);

  const headers = authHeaders(token);

  const listRes = http.get(`${BASE_URL}/api/products`, {
    tags: { name: 'shopper_browse' },
  });
  browseTime.add(listRes.timings.duration);
  randSleep(1.5);

  const detailId = randomProductId(ids);
  http.get(`${BASE_URL}/api/products/${detailId}`, {
    tags: { name: 'shopper_detail' },
  });
  randSleep(1);

  const rateId = randomProductId(ids);
  const rating = Math.floor(Math.random() * 5) + 1;
  const rateRes = http.post(`${BASE_URL}/api/products/${rateId}/ratings`, JSON.stringify({
    rating,
    review: 'Great product, fast delivery!',
  }), { headers, tags: { name: 'shopper_rate' } });
  rateCommentTime.add(rateRes.timings.duration);
  randSleep(1);

  const commentId = randomProductId(ids);
  const commentRes = http.post(`${BASE_URL}/api/products/${commentId}/comments`, JSON.stringify({
    text: 'Amazing quality! Worth every cedi.',
  }), { headers, tags: { name: 'shopper_comment' } });
  rateCommentTime.add(commentRes.timings.duration);
  randSleep(1.5);

  const orderRes = http.post(`${BASE_URL}/api/orders`, JSON.stringify({
    items: [
      { id: detailId, name: 'Test Product', qty: 1, price: 500 },
    ],
    total: 500,
    customerInfo: {
      name: `Shopper ${vu}`,
      email,
      phone: '233200000000',
      address: '123 Load Test Street, Accra',
    },
  }), { headers, tags: { name: 'shopper_order' } });
  orderTime.add(orderRes.timings.duration);
  collectErrors(orderRes.status, check(orderRes, { 'order created': r => r.status === 200 }));
  randSleep(2);

  http.get(`${BASE_URL}/api/orders`, {
    headers: { 'Authorization': `Bearer ${token}` },
    tags: { name: 'shopper_my_orders' },
  });
  randSleep(3);
}

export function adminActions(data) {
  const token = data.adminToken;
  if (!token) {
    console.log(`VU ${__VU}: No admin token, skipping`);
    randSleep(5);
    return;
  }

  const headers = { 'Authorization': `Bearer ${token}`, ...jsonHeaders() };

  const ordersRes = http.get(`${BASE_URL}/api/admin/orders`, {
    headers, tags: { name: 'admin_orders_list' },
  });
  adminTime.add(ordersRes.timings.duration);
  collectErrors(ordersRes.status, check(ordersRes, { 'admin orders ok': r => r.status === 200 }));
  randSleep(1.5);

  const orders = ordersRes.json();
  if (Array.isArray(orders) && orders.length > 0 && __ITER % 3 === 0) {
    const orderId = orders[__ITER % orders.length].id;
    const statuses = ['confirmed', 'delivered', 'cancelled'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const patchRes = http.patch(`${BASE_URL}/api/admin/orders/${orderId}/status`, JSON.stringify({
      status: newStatus,
    }), { headers, tags: { name: 'admin_update_status' } });
    adminTime.add(patchRes.timings.duration);
    randSleep(1);

    http.patch(`${BASE_URL}/api/admin/orders/${orderId}/status`, JSON.stringify({
      status: 'pending',
    }), { headers, tags: { name: 'admin_reset_status' } });
    randSleep(1);
  }

  const usersRes = http.get(`${BASE_URL}/api/admin/users`, {
    headers, tags: { name: 'admin_users_list' },
  });
  adminTime.add(usersRes.timings.duration);
  collectErrors(usersRes.status, check(usersRes, { 'admin users ok': r => r.status === 200 }));
  randSleep(1.5);

  const users = usersRes.json();
  if (Array.isArray(users) && users.length > 0 && __ITER % 4 === 0) {
    const targetUser = users.find(u => u.email !== 'admin@swiftek.com' && u.status === 'active');
    if (targetUser) {
      http.get(`${BASE_URL}/api/admin/users/${targetUser.id}/orders`, {
        headers, tags: { name: 'admin_user_orders' },
      });
      randSleep(1);
    }
  }

  const adminsRes = http.get(`${BASE_URL}/api/admin/admins`, {
    headers, tags: { name: 'admin_admins_list' },
  });
  adminTime.add(adminsRes.timings.duration);
  randSleep(1);

  const adminProductsRes = http.get(`${BASE_URL}/api/admin/products`, {
    headers, tags: { name: 'admin_products_list' },
  });
  adminTime.add(adminProductsRes.timings.duration);
  randSleep(1);

  if (__ITER % 3 === 0) {
    const createRes = http.post(`${BASE_URL}/api/admin/products`, JSON.stringify({
      name: `Load Test Product ${__VU}_${Date.now()}`,
      category: 'Accessories',
      brand: 'SwifTek',
      family: 'Premium',
      basePrice: 299,
      description: 'Created during automated load testing',
      images: ['https://via.placeholder.com/400'],
      specifications: { Material: 'Premium', Color: 'Black' },
      options: {},
    }), { headers, tags: { name: 'admin_create_product' } });
    adminTime.add(createRes.timings.duration);
    collectErrors(createRes.status, check(createRes, { 'admin create product ok': r => r.status === 200 }));
    randSleep(2);
  }

  randSleep(3);
}

export function forgotPassword(data) {
  const vu = __VU;
  const email = `forgot_${vu}@lt.swiftek`;

  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: `Forgot User ${vu}`,
    email,
    password: 'testpass123',
  }), { headers: jsonHeaders(), tags: { name: 'forgot_preregister' } });
  randSleep(1);

  const forgotRes = http.post(`${BASE_URL}/api/auth/forgot-password`, JSON.stringify({
    email,
  }), { headers: jsonHeaders(), tags: { name: 'forgot_password' } });
  forgotTime.add(forgotRes.timings.duration);
  collectErrors(forgotRes.status, check(forgotRes, {
    'forgot password ok': r => r.status === 200 || r.status === 429,
  }));
  randSleep(2);

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email,
    password: 'testpass123',
  }), { headers: jsonHeaders(), tags: { name: 'forgot_login' } });
  forgotTime.add(loginRes.timings.duration);
  randSleep(4);
}
