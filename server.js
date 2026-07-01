require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Op } = require('sequelize');

const nodemailer = require('nodemailer');
const { Resolver } = require('dns');

const signupOtpCss = fs.readFileSync(
  path.join(__dirname, 'public', 'css', 'email-signup-otp.css'),
  'utf8'
);

const forgotPasswordCss = fs.readFileSync(
  path.join(__dirname, 'public', 'css', 'email-forgot-password.css'),
  'utf8'
);

const orderStatusCss = fs.readFileSync(
  path.join(__dirname, 'public', 'css', 'email-order-status.css'),
  'utf8'
);

const dnsOverGoogle = new Resolver();
dnsOverGoogle.setServers(['8.8.8.8', '1.1.1.1']);

async function resolveSmtpHost(hostname) {
  try {
    const addrs = await dnsOverGoogle.resolve4(hostname);
    console.log('[DNS]', hostname, 'via Google DNS ->', addrs);
    return addrs;
  } catch (err) {
    console.error('[DNS] Failed to resolve', hostname, 'via Google DNS:', err.message);
    return [];
  }
}

function makeSmtpConfig(host, port, secure, user, pass, servername) {
  const cfg = {
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  };
  if (secure) {
    cfg.tls = { servername: servername || host };
  } else {
    cfg.requireTLS = true;
    if (servername) cfg.tls = { servername };
  }
  return cfg;
}

async function sendEmail({ to, subject, html }) {
  const fromName = 'SwifTek Accessories';
  const DEFAULT_FROM = 'bigscany455@gmail.com';
  const rawEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || DEFAULT_FROM;
  const fromAddr = rawEmail.includes('<') ? rawEmail.replace(/.*<(.+)>$/, '$1') : rawEmail;
  const from = rawEmail.includes('<') ? rawEmail : `${fromName} <${rawEmail}>`;

  const errors = [];

  if (process.env.RESEND_API_KEY) {
    console.log('[EMAIL] Attempting Resend...');
    try {
      const resendFrom = process.env.RESEND_FROM || `onboarding@resend.dev`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${resendFrom}>`,
          to: [to],
          subject,
          html
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Resend ${res.status}: ${text}`);
      }
      console.log('[EMAIL] Sent via Resend to', to);
      return;
    } catch (err) {
      console.error('[EMAIL] Resend failed:', err.message);
      errors.push(`Resend: ${err.message}`);
    }
  } else {
    console.log('[EMAIL] Resend not configured (set RESEND_API_KEY)');
  }

  if (process.env.BREVO_API_KEY) {
    console.log('[EMAIL] Attempting Brevo API...');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromAddr },
          to: [{ email: to }],
          subject,
          htmlContent: html
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Brevo API ${res.status}: ${text}`);
      }
      console.log('[EMAIL] Sent via Brevo API to', to);
      return;
    } catch (err) {
      console.error('[EMAIL] Brevo failed:', err.message);
      errors.push(`Brevo: ${err.message}`);
    }
  } else {
    console.log('[EMAIL] Brevo not configured (set BREVO_API_KEY)');
  }

  if (process.env.SENDGRID_API_KEY) {
    console.log('[EMAIL] Attempting SendGrid...');
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({ to, from, subject, html });
      console.log('[EMAIL] Sent via SendGrid to', to);
      return;
    } catch (err) {
      console.error('[EMAIL] SendGrid failed:', err.message);
      errors.push(`SendGrid: ${err.message}`);
      if (err.response) console.error('[EMAIL] SendGrid response:', err.response.body);
    }
  } else {
    console.log('[EMAIL] SendGrid not configured (set SENDGRID_API_KEY)');
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const hostname = process.env.SMTP_HOST;

  if (hostname && user && pass) {
    console.log('[EMAIL] Attempting SMTP', hostname, 'with user', user, 'on port', process.env.SMTP_PORT || '587');
    const port587 = parseInt(process.env.SMTP_PORT || '587');

    try {
      const testIps = await resolveSmtpHost(hostname);
      console.log('[EMAIL] DNS resolved', hostname, '->', testIps.length ? testIps.join(',') : 'NO IPS');
    } catch (dnsErr) {
      console.error('[EMAIL] DNS failed for', hostname + ':', dnsErr.message);
    }

    const configs = [
      makeSmtpConfig(hostname, port587, false, user, pass),
      makeSmtpConfig(hostname, 465, true, user, pass)
    ];

    for (const config of configs) {
      try {
        const t = nodemailer.createTransport(config);
        const info = await t.sendMail({ from, to, subject, html });
        console.log('[EMAIL] Sent via', config.host + ':' + config.port, 'to', to);
        return info;
      } catch (err) {
        const msg = config.host + ':' + config.port + ' - ' + err.message;
        console.error('[EMAIL]', msg);
        errors.push(`SMTP ${msg}`);
      }
    }

    const ips = await resolveSmtpHost(hostname);
    if (ips.length) {
      console.log('[EMAIL] Trying DNS fallback with', ips.length, 'IPs...');
      for (const port of [port587, 465]) {
        const secure = port === 465;
        for (const ip of ips) {
          try {
            const cfg = makeSmtpConfig(ip, port, secure, user, pass, hostname);
            const t = nodemailer.createTransport(cfg);
            const info = await t.sendMail({ from, to, subject, html });
            console.log('[EMAIL] Sent via', ip + ':' + port, 'to', to);
            return info;
          } catch (err) {
            const msg = ip + ':' + port + ' - ' + err.message;
            console.error('[EMAIL]', msg);
            errors.push(`SMTP ${msg}`);
          }
        }
      }
    }
  } else {
    console.log('[EMAIL] SMTP not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS)');
  }

  throw new Error(
    'Email delivery failed. Tried:\n' + errors.join('\n') + '\n\n' +
    'Check SMTP_HOST / SMTP_USER / SMTP_PASS env vars on Render'
  );
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, function (m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    return '&#x27;';
  });
}

const {
  sequelize,
  AdminProduct,
  TrashItem,
  Session,
  Config,
  User,
  Order,
  EmailVerification,
  Rating,
  Comment
} = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(compression({ level: 6, memLevel: 8 }));

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const productCache = { data: null, time: 0, TTL: 30000 };
function invalidateProductCache() {
  productCache.data = null;
  productCache.time = 0;
}
async function ensureAdminUser() {
  const targetEmail = 'bigscany455@gmail.com';
  let admin = await User.findOne({ where: { email: targetEmail } });
  if (admin) {
    admin.role = 'admin';
    admin.isSuperAdmin = true;
    admin.permissions = ['products', 'orders', 'users'];
    admin.verified = true;
    admin.password = 'admin';
    await admin.save();
    console.log(`Admin promoted (${targetEmail} / admin)`);
  } else {
    admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      admin.email = targetEmail;
      admin.password = 'admin';
      admin.isSuperAdmin = true;
      admin.permissions = ['products', 'orders', 'users'];
      await admin.save();
      console.log(`Admin email changed to ${targetEmail} / password: admin`);
    } else {
      await User.create({
        name: 'Admin',
        email: targetEmail,
        password: 'admin',
        role: 'admin',
        isSuperAdmin: true,
        permissions: ['products', 'orders', 'users'],
        verified: true
      });
      console.log(`Admin user created (${targetEmail} / admin)`);
    }
  }
}

async function getStoreProducts() {
  const now = Date.now();
  if (productCache.data && (now - productCache.time) < productCache.TTL) {
    return productCache.data;
  }

  const adminProducts = await AdminProduct.findAll({ raw: true });
  const result = adminProducts.map(p => ({ ...p, id: Number(p.id) }));

  productCache.data = result;
  productCache.time = now;
  return result;
}

app.get('/api/products', async (req, res) => {
  res.json(await getStoreProducts());
});

app.get('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const products = await getStoreProducts();
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products/:id/ratings', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existing = await Rating.findOne({ where: { productId, userId: req.userId } });
    if (existing) {
      existing.rating = rating;
      if (review !== undefined) existing.review = review;
      await existing.save();
      return res.json({ success: true, rating: existing.toJSON() });
    }

    const newRating = await Rating.create({
      productId,
      userId: req.userId,
      rating,
      review: review || ''
    });

    res.json({ success: true, rating: newRating.toJSON() });
  } catch (err) {
    console.error('[RATING ERROR]', err.message);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

app.get('/api/products/:id/ratings', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const ratings = await Rating.findAll({
      where: { productId },
      include: { model: User, attributes: ['name'] },
      order: [['createdAt', 'DESC']]
    });

    const avgResult = await Rating.findOne({
      where: { productId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      raw: true
    });

    res.json({
      ratings: ratings.map(r => r.toJSON()),
      average: avgResult.average ? Math.round(parseFloat(avgResult.average) * 10) / 10 : 0,
      count: parseInt(avgResult.count) || 0
    });
  } catch (err) {
    console.error('[RATING FETCH ERROR]', err.message);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

app.post('/api/products/:id/comments', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await Comment.create({
      productId,
      userId: req.userId,
      text: text.trim()
    });

    const populated = await Comment.findByPk(comment.id, {
      include: { model: User, attributes: ['name'] }
    });

    res.json({ success: true, comment: populated.toJSON() });
  } catch (err) {
    console.error('[COMMENT ERROR]', err.message);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.get('/api/products/:id/comments', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const comments = await Comment.findAll({
      where: { productId },
      include: { model: User, attributes: ['name'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ comments: comments.map(c => c.toJSON()) });
  } catch (err) {
    console.error('[COMMENT FETCH ERROR]', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.get('/api/stats', async (req, res) => {
  const [adminProducts, trash] = await Promise.all([
    AdminProduct.findAll({ where: { _adminCreated: true }, raw: true }),
    TrashItem.findAll({ raw: true })
  ]);
  res.json({
    total: (await getStoreProducts()).length,
    adminCreated: adminProducts.length,
    inTrash: trash.length
  });
});

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const session = await Session.findOne({ where: { token } });
  if (!session) return res.status(401).json({ error: 'Invalid or expired session' });

  const now = new Date();
  if (!session.lastUsed || (now - new Date(session.lastUsed)) > 60000) {
    session.lastUsed = now;
    await session.save();
  }
  req.session = session;
  req.userId = session.userId;
  req.userRole = session.role;
  next();
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const user = await User.findByPk(req.userId, { attributes: ['isSuperAdmin', 'permissions', 'role'] });
    if (!user) return res.status(403).json({ error: 'Admin not found' });
    req.adminUser = user;
    next();
  });
}

async function requireSuperAdmin(req, res, next) {
  await requireAdmin(req, res, () => {
    if (!req.adminUser.isSuperAdmin) return res.status(403).json({ error: 'Super admin access required' });
    next();
  });
}

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await User.findOne({ where: { email: normalized } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalized,
      password,
      verified: true
    });

    const token = generateToken();
    await Session.create({
      token,
      userId: user.id,
      role: user.role,
      lastUsed: new Date()
    });

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role, isSuperAdmin: false };
    console.log('[REGISTER] User created and auto-logged in:', user.email);
    res.json({
      success: true,
      message: 'Account created successfully!',
      token,
      role: user.role,
      user: userData
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/check-email', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ available: false, error: 'Check failed' });
  }
});

app.post('/api/auth/send-signup-otp', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalized = email.toLowerCase().trim();
    const existing = await User.findOne({ where: { email: normalized } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const recent = await EmailVerification.findOne({
      where: { email: normalized },
      order: [['sentAt', 'DESC']]
    });
    if (recent && (Date.now() - new Date(recent.sentAt).getTime()) < 60000) {
      const remaining = Math.ceil((60000 - (Date.now() - new Date(recent.sentAt).getTime())) / 1000);
      return res.status(429).json({ error: `Please wait ${remaining}s before requesting a new OTP.` });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 600000);
    await EmailVerification.destroy({ where: { email: normalized } });
    await EmailVerification.create({
      email: normalized,
      otp,
      expiresAt,
      sentAt: new Date()
    });

    const expiryTime = expiresAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const expiryDate = expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = expiresAt.toDateString() === new Date().toDateString();

    const emailHtml = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <meta name="color-scheme" content="light">',
      '  <style>' + signupOtpCss + '</style>',
      '</head>',
      '<body style="margin:0;padding:0;background-color:#f2f2f5;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">',
      '  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f5;">',
      '    <tr>',
      '      <td align="center" style="padding:48px 16px;">',
      '        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">',
      '',
      '          <!-- Letterhead -->',
      '          <tr>',
      '            <td class="email-header"',
      '                style="background:linear-gradient(135deg,#0071e3 0%,#003a70 50%,#001d3d 100%);border-radius:20px 20px 0 0;padding:40px 32px 28px;text-align:center;">',
      '              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">',
      '                <tr>',
      '                  <td align="center" class="email-logo-cell"',
      '                      style="width:64px;height:64px;background:rgba(255,255,255,0.12);border-radius:18px;font-size:32px;font-weight:800;color:#ffffff;line-height:64px;letter-spacing:-1px;">S</td>',
      '                </tr>',
      '              </table>',
      '              <h1 class="email-brand-name"',
      '                  style="font-size:13px;font-weight:700;color:#ffffff;margin:0 0 2px;letter-spacing:3px;text-transform:uppercase;">SwifTek</h1>',
      '              <p class="email-brand-sub"',
      '                 style="font-size:10px;font-weight:400;color:rgba(255,255,255,0.45);margin:0;letter-spacing:5px;text-transform:uppercase;">Accessories</p>',
      '              <div class="email-divider-accent"',
      '                   style="width:48px;height:3px;background:linear-gradient(90deg,#0071e3,#00a8ff);border-radius:2px;margin:16px auto 0;"></div>',
      '            </td>',
      '          </tr>',
      '',
      '          <!-- Body -->',
      '          <tr>',
      '            <td class="email-body"',
      '                style="background:#ffffff;padding:40px 32px 32px;text-align:center;border-radius:0 0 20px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.04);">',
      '',
      '              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">',
      '                <tr>',
      '                  <td align="center" valign="middle" class="email-icon-circle"',
      '                      style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#e8f4fd,#d0eafc);font-size:32px;line-height:72px;">✉️</td>',
      '                </tr>',
      '              </table>',
      '',
      '              <h1 class="email-heading"',
      '                  style="font-size:26px;font-weight:700;color:#1d1d1f;margin:0 0 8px;letter-spacing:-0.5px;">Verify your email</h1>',
      '              <p class="email-body-text"',
      '                 style="font-size:16px;color:#6e6e73;margin:0 0 32px;line-height:1.6;">Hi there,<br>use the code below to verify your <strong style="color:#1d1d1f;">SwifTek Accessories</strong> account.</p>',
      '',
      '              <!-- OTP Box -->',
      '              <table role="presentation" cellpadding="0" cellspacing="0" class="email-otp-box"',
      '                     style="margin:0 auto 28px;background:#f5f5f7;border-radius:16px;width:100%;">',
      '                <tr>',
      '                  <td align="center" class="email-otp-digits"',
      '                      style="padding:20px 16px;letter-spacing:4px;font-size:16px;font-weight:700;color:#1d1d1f;font-variant-numeric:tabular-nums;white-space:nowrap;">' + otp + '</td>',
      '                </tr>',
      '              </table>',
      '',
      '              <p class="email-expiry"',
      '                 style="font-size:14px;color:#8e8e93;margin:0 0 24px;line-height:1.6;">Code expires <strong style="color:#1d1d1f;">' + (isToday ? 'today at' : expiryDate) + ' ' + expiryTime + '</strong> &middot; <strong style="color:#1d1d1f;">10:00</strong> minutes remaining. If you didn\'t request this, you can safely ignore this email.</p>',
      '',
      '              <!-- Divider -->',
      '              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">',
      '                <tr>',
      '                  <td class="email-hr"',
      '                      style="border-bottom:1px solid #e8e8ed;line-height:1px;height:1px;">&nbsp;</td>',
      '                </tr>',
      '              </table>',
      '',
      '              <p class="email-footer-text"',
      '                 style="font-size:13px;color:#8e8e93;margin:20px 0 0;line-height:1.5;">SwifTek Accessories &mdash; Premium Tech Accessories<br><span class="email-footer-sub" style="color:#aeaeb2;">Built by Famous Tech &middot; Accra, Ghana</span></p>',
      '              <p class="email-footer-link"',
      '                 style="font-size:12px;color:#aeaeb2;margin:12px 0 0;">Need help? <a href="https://wa.me/233545277534" style="color:#0071e3;text-decoration:none;font-weight:600;">Contact us on WhatsApp</a></p>',
      '',
      '            </td>',
      '          </tr>',
      '        </table>',
      '      </td>',
      '    </tr>',
      '  </table>',
      '</body>',
      '</html>'
    ].join('\n');

    await sendEmail({
      to: normalized,
      subject: 'Verify your email — SwifTek Accessories',
      html: emailHtml
    });

    console.log('[SIGNUP OTP] Sent to', normalized);
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('[SEND-SIGNUP-OTP ERROR]', err);
    res.status(500).json({ error: 'Failed to send OTP: ' + err.message });
  }
});

app.post('/api/auth/check-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ valid: false, error: 'Email and OTP are required' });

    const normalized = email.toLowerCase().trim();
    const record = await EmailVerification.findOne({ where: { email: normalized } });

    if (!record) {
      return res.json({ valid: false, error: 'No OTP request found. Please request a new one.' });
    }
    if (record.verified) {
      return res.json({ valid: false, error: 'This email has already been verified.' });
    }
    if (new Date() > record.expiresAt) {
      return res.json({ valid: false, error: 'OTP has expired. Please request a new one.' });
    }
    if (record.attempts >= 5) {
      return res.json({ valid: false, error: 'Too many failed attempts. Please request a new OTP.' });
    }
    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.json({ valid: false, error: 'Invalid OTP. Please check and try again.' });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('[CHECK-SIGNUP-OTP ERROR]', err.message);
    res.status(500).json({ valid: false, error: 'Failed to verify OTP' });
  }
});

app.post('/api/auth/complete-signup', async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;
    if (!email || !otp || !name || !password) {
      return res.status(400).json({ error: 'Email, OTP, name, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalized = email.toLowerCase().trim();
    const record = await EmailVerification.findOne({ where: { email: normalized } });

    if (!record) {
      return res.status(400).json({ error: 'No OTP request found. Please request a new OTP.' });
    }
    if (record.verified) {
      return res.status(400).json({ error: 'This email has already been verified.' });
    }
    if (new Date() > record.expiresAt) {
      await EmailVerification.destroy({ where: { id: record.id } });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (record.attempts >= 5) {
      await EmailVerification.destroy({ where: { id: record.id } });
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }
    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    const existing = await User.findOne({ where: { email: normalized } });
    if (existing) {
      await EmailVerification.destroy({ where: { id: record.id } });
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalized,
      password,
      verified: true
    });

    await EmailVerification.destroy({ where: { id: record.id } });

    const token = generateToken();
    await Session.create({
      token,
      userId: user.id,
      role: user.role,
      lastUsed: new Date()
    });

    console.log('[SIGNUP] User created and auto-logged in:', user.email);
    res.json({
      success: true,
      message: 'Account created successfully!',
      token,
      role: user.role,
      user: { id: user.id, name: user.name, email: user.email, isSuperAdmin: false }
    });
  } catch (err) {
    console.error('[COMPLETE-SIGNUP ERROR]', err.message);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.get('/api/auth/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ where: { verificationToken: req.params.token } });
    if (!user) {
      return res.status(400).send(`
        <html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f7">
        <div style="text-align:center;padding:40px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
          <div style="font-size:48px;margin-bottom:16px;color:#ff453a;"><i class="fas fa-times-circle"></i></div>
          <h1 style="font-size:22px;margin-bottom:8px">Verification Failed</h1>
          <p style="color:#6e6e73">Invalid or expired verification link.</p>
          <a href="/signup.html" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#0071e3;color:#fff;border-radius:99px;text-decoration:none">Log In</a>
        </div></body></html>
      `);
    }

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.send(`
      <html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f7">
      <div style="text-align:center;padding:40px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
        <div style="font-size:48px;margin-bottom:16px;color:#30d158;"><i class="fas fa-check-circle"></i></div>
        <h1 style="font-size:22px;margin-bottom:8px">Email Verified!</h1>
        <p style="color:#6e6e73">Your account is now active. You can log in.</p>
        <a href="/login.html" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#0071e3;color:#fff;border-radius:99px;text-decoration:none">Log In</a>
      </div></body></html>
    `);
  } catch (err) {
    res.status(500).send('Verification failed');
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Contact support for assistance.' });
    }

    if (user.status === 'revoked') {
      return res.status(403).json({ error: 'Your account has been revoked. Contact support for assistance.' });
    }

    if (!user.verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken();
    await Session.create({
      token,
      userId: user.id,
      role: user.role,
      lastUsed: new Date()
    });

    res.json({
      success: true,
      token,
      role: user.role,
      user: { id: user.id, name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin || false }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  await Session.destroy({ where: { token } });
  res.json({ success: true });
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    if (user.resetOtpSentAt && (Date.now() - new Date(user.resetOtpSentAt).getTime()) < 120000) {
      const remaining = Math.ceil((120000 - (Date.now() - new Date(user.resetOtpSentAt).getTime())) / 1000);
      return res.status(429).json({ error: `Please wait ${remaining}s before requesting a new OTP.` });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 600000);
    user.resetOtpSentAt = new Date();
    user.resetOtpAttempts = 0;
    await user.save();

    const expiryTime = user.resetOtpExpires.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const expiryDate = user.resetOtpExpires.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = user.resetOtpExpires.toDateString() === new Date().toDateString();

    const emailHtml = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <meta name="color-scheme" content="light">',
      '  <style>' + forgotPasswordCss + '</style>',
      '</head>',
      '<body style="margin:0;padding:0;background-color:#f2f2f5;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">',
      '  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f5;">',
      '    <tr>',
      '      <td align="center" style="padding:48px 16px;">',
      '        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">',
      '',
      '          <!-- Letterhead -->',
      '          <tr>',
      '            <td class="email-header"',
      '                style="background:linear-gradient(135deg,#0071e3 0%,#003a70 50%,#001d3d 100%);border-radius:20px 20px 0 0;padding:40px 32px 28px;text-align:center;">',
      '              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">',
      '                <tr>',
      '                  <td align="center" class="email-logo-cell"',
      '                      style="width:64px;height:64px;background:rgba(255,255,255,0.12);border-radius:18px;font-size:32px;font-weight:800;color:#ffffff;line-height:64px;letter-spacing:-1px;">S</td>',
      '                </tr>',
      '              </table>',
      '              <h1 class="email-brand-name"',
      '                  style="font-size:13px;font-weight:700;color:#ffffff;margin:0 0 2px;letter-spacing:3px;text-transform:uppercase;">SwifTek</h1>',
      '              <p class="email-brand-sub"',
      '                 style="font-size:10px;font-weight:400;color:rgba(255,255,255,0.45);margin:0;letter-spacing:5px;text-transform:uppercase;">Accessories</p>',
      '              <div class="email-divider-accent"',
      '                   style="width:48px;height:3px;background:linear-gradient(90deg,#0071e3,#00a8ff);border-radius:2px;margin:16px auto 0;"></div>',
      '            </td>',
      '          </tr>',
      '',
      '          <!-- Body -->',
      '          <tr>',
      '            <td class="email-body"',
      '                style="background:#ffffff;padding:40px 32px 32px;text-align:center;border-radius:0 0 20px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.04);">',
      '',
      '              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">',
      '                <tr>',
      '                  <td align="center" valign="middle" class="email-icon-circle"',
      '                      style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#e8f4fd,#d0eafc);font-size:32px;line-height:72px;">🔐</td>',
      '                </tr>',
      '              </table>',
      '',
      '              <h1 class="email-heading"',
      '                  style="font-size:26px;font-weight:700;color:#1d1d1f;margin:0 0 8px;letter-spacing:-0.5px;">Reset your password</h1>',
      '              <p class="email-body-text"',
      '                 style="font-size:16px;color:#6e6e73;margin:0 0 32px;line-height:1.6;">Hi ' + user.name + ',<br>use the code below to reset your <strong style="color:#1d1d1f;">SwifTek Accessories</strong> account password.</p>',
      '',
      '              <!-- OTP Box -->',
      '              <table role="presentation" cellpadding="0" cellspacing="0" class="email-otp-box"',
      '                     style="margin:0 auto 28px;background:#f5f5f7;border-radius:16px;width:100%;">',
      '                <tr>',
      '                  <td align="center" class="email-otp-digits"',
      '                      style="padding:24px 16px;letter-spacing:8px;font-size:38px;font-weight:700;color:#1d1d1f;font-variant-numeric:tabular-nums;white-space:nowrap;">' + otp.split('').join(' ') + '</td>',
      '                </tr>',
      '              </table>',
      '',
      '              <p class="email-expiry"',
      '                 style="font-size:14px;color:#8e8e93;margin:0 0 24px;line-height:1.6;">Code expires <strong style="color:#1d1d1f;">' + (isToday ? 'today at' : expiryDate) + ' ' + expiryTime + '</strong> &middot; <strong style="color:#1d1d1f;">10:00</strong> minutes remaining. If you didn\'t request this, you can safely ignore this email.</p>',
      '',
      '              <!-- Divider -->',
      '              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">',
      '                <tr>',
      '                  <td class="email-hr"',
      '                      style="border-bottom:1px solid #e8e8ed;line-height:1px;height:1px;">&nbsp;</td>',
      '                </tr>',
      '              </table>',
      '',
      '              <p class="email-footer-text"',
      '                 style="font-size:13px;color:#8e8e93;margin:20px 0 0;line-height:1.5;">SwifTek Accessories &mdash; Premium Tech Accessories<br><span class="email-footer-sub" style="color:#aeaeb2;">Built by Famous Tech &middot; Accra, Ghana</span></p>',
      '              <p class="email-footer-link"',
      '                 style="font-size:12px;color:#aeaeb2;margin:12px 0 0;">Need help? <a href="https://wa.me/233545277534" style="color:#0071e3;text-decoration:none;font-weight:600;">Contact us on WhatsApp</a></p>',
      '',
      '            </td>',
      '          </tr>',
      '        </table>',
      '      </td>',
      '    </tr>',
      '  </table>',
      '</body>',
      '</html>'
    ].join('\n');

    await sendEmail({
      to: user.email,
      subject: 'Reset your password — SwifTek Accessories',
      html: emailHtml
    });
    console.log('[EMAIL] Password reset OTP sent to', user.email);

    res.json({
      success: true,
      message: 'If that email exists, an OTP has been sent.'
    });
  } catch (err) {
    console.error('[FORGOT-PASSWORD ERROR]', err.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.post('/api/auth/verify-reset-otp', authLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ error: 'No reset request found for this email.' });
    }

    if (!user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ error: 'No OTP has been requested. Please request a new one.' });
    }

    if (user.resetOtpAttempts >= 5) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (new Date() > user.resetOtpExpires) {
      user.resetOtp = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (user.resetOtp !== otp) {
      user.resetOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
    }

    const resetToken = generateToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 300000);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ success: true, resetToken });
  } catch (err) {
    console.error('[VERIFY-OTP ERROR]', err.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ error: 'Reset token is required' });
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token. Please start over.' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await Session.destroy({ where: { userId: user.id } });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await User.findByPk(req.userId, { attributes: ['name', 'email', 'role', 'isSuperAdmin', 'status', 'verified'] });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended. Contact support for assistance.' });
  }
  if (user.status === 'revoked') {
    return res.status(403).json({ error: 'Your account has been revoked. Contact support for assistance.' });
  }
  res.json(user.toJSON());
});

app.post('/api/auth/admin-login', authLimiter, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const adminUser = await User.findOne({ where: { role: 'admin' } });
  if (!adminUser) return res.status(401).json({ error: 'No admin user found' });

  const isMatch = await adminUser.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

  const token = generateToken();
  await Session.create({ token, userId: adminUser.id, role: 'admin', lastUsed: new Date() });

  res.json({ success: true, token });
});

app.patch('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalized = email.toLowerCase().trim();
      if (!normalized) return res.status(400).json({ error: 'Email cannot be empty' });
      const existing = await User.findOne({ where: { email: normalized, id: { [Op.ne]: user.id } } });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
      user.email = normalized;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required to set new password' });
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { items, total, customerInfo, recipient } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const orderRef = `SWF-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

    const order = await Order.create({
      userId: req.userId,
      orderRef,
      items,
      total,
      customerInfo: customerInfo || {},
      recipient: recipient || {},
      status: 'pending'
    });

    res.json({ success: true, orderRef: order.orderRef, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      raw: true
    });
    if (!orders.length) return res.json([]);

    const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))];
    const users = await User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'name', 'email'], raw: true });
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const result = orders.map(o => ({
      ...o,
      user: userMap[o.userId] || null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/pending-count', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, { attributes: ['role'], raw: true });
    let count;
    if (user && user.role === 'admin') {
      count = await Order.count({ where: { status: 'pending' } });
    } else {
      count = await Order.count({ where: { userId: req.userId, status: 'pending' } });
    }
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get pending count' });
  }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};
    if (date) {
      where.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lte]: new Date(date + 'T23:59:59.999Z')
      };
    }
    const orders = await Order.findAll({
      where,
      include: { model: User, attributes: ['name', 'email'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(orders.map(o => {
      const json = o.toJSON();
      json.userName = json.User?.name || json.customerInfo?.name || 'Unknown';
      json.userEmail = json.User?.email || json.customerInfo?.email || '';
      return json;
    }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id, {
      include: { model: User, attributes: ['name', 'email'] }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await Order.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true });

    if (status !== 'pending' && order.User?.email) {
      const user = order.User;
      const itemsList = order.items.map(i =>
        `<tr><td class="os-item-cell">${escapeHtml(i.name)}${i.specs ? '<br><span class="os-item-specs">' + escapeHtml(i.specs) + '</span>' : ''}</td><td class="os-item-qty">x${i.qty}</td><td class="os-item-price">GH₵ ${i.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>`
      ).join('');

      const statusConfig = {
        confirmed: { badgeColor: '#30d158', badgeIcon: '✓', heading: 'Order Confirmed', message: 'Good news! Your order has been confirmed and is being processed.' },
        delivered: { badgeColor: '#30d158', badgeIcon: '✓', heading: 'Order Delivered', message: 'Your order has been delivered. Thank you for shopping with SwifTek!' },
        cancelled: { badgeColor: '#ff453a', badgeIcon: '✕', heading: 'Order Cancelled', message: 'Your order has been cancelled. If you have any questions, please contact our support team.' }
      };

      const cfg = statusConfig[status] || { badgeColor: '#0071e3', badgeIcon: 'ℹ', heading: 'Order Updated', message: 'Your order status has been updated.' };
      const { badgeColor, badgeIcon, heading, message } = cfg;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${orderStatusCss}</style>
        </head>
        <body>
          <table class="os-outer-table" role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="os-wrapper" align="center">
                <table class="os-container" role="presentation" width="520" cellpadding="0" cellspacing="0">

                  <tr>
                    <td class="os-header">
                      <table class="os-logo-table" role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="os-logo-cell" align="center">S</td>
                          <td class="os-logo-gap"></td>
                          <td align="left" valign="middle">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr><td class="os-brand-name">SwifTek</td></tr>
                              <tr><td class="os-brand-sub">Accessories</td></tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <div class="os-divider"></div>
                    </td>
                  </tr>

                  <tr>
                    <td class="os-content">

                      <table class="os-badge-table" role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="os-badge-cell" align="center" style="background:${badgeColor}20;">
                            <span class="os-badge-icon" style="color:${badgeColor};">${badgeIcon}</span>
                          </td>
                        </tr>
                      </table>

                      <h1 class="os-heading">${heading}</h1>
                      <p class="os-message">${message}</p>

                      <table class="os-info-card" role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="os-info-padding">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td class="os-info-label">Order Reference</td>
                                <td class="os-info-value">${escapeHtml(order.orderRef)}</td>
                              </tr>
                              <tr>
                                <td class="os-info-label-top">Date</td>
                                <td class="os-info-value-plain-top">${new Date(order.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <h3 class="os-items-title">Items Ordered</h3>
                      <table class="os-items-table" role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        ${itemsList}
                      </table>

                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td class="os-total-border">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td class="os-total-label">Total</td>
                                <td class="os-total-amount">GH₵ ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p class="os-footer-text">SwifTek Accessories &mdash; Premium Tech Store</p>
                      <p class="os-footer-sub">Accra, Ghana &middot; Built by Famous Tech</p>
                      <p class="os-footer-link">Need help? Contact us on <a href="https://wa.me/233545277534">WhatsApp</a></p>

                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const subject = `${heading} — ${order.orderRef} — SwifTek Accessories`;

      sendEmail({ to: user.email, subject, html: emailHtml }).catch(err => {
        console.error('[ORDER EMAIL FAILED]', err.message);
      });
    }
  } catch (err) {
    console.error('[ORDER STATUS ERROR]', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'verificationToken'] },
      order: [['createdAt', 'DESC']],
      raw: true
    });

    const userOrderCounts = await Order.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSpent']
      ],
      group: ['userId'],
      raw: true
    });

    const countMap = {};
    userOrderCounts.forEach(u => { countMap[u.userId] = { orderCount: parseInt(u.orderCount) || 0, totalSpent: parseFloat(u.totalSpent) || 0 }; });

    const result = users.map(u => ({
      ...u,
      orderCount: countMap[u.id]?.orderCount || 0,
      totalSpent: countMap[u.id]?.totalSpent || 0
    }));

    res.json(result);
  } catch (err) {
    console.error('[ADMIN USERS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/users/:id/orders', requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};
    if (date) {
      where.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lte]: new Date(date + 'T23:59:59.999Z')
      };
    }
    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      raw: true
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

app.patch('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'revoked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active, suspended, or revoked.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    if (status === 'suspended') user.suspendedAt = now;
    else if (status === 'revoked') user.revokedAt = now;
    else {
      user.suspendedAt = null;
      user.revokedAt = null;
    }
    user.status = status;
    await user.save();

    res.json({ success: true, message: `User ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.id === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const userId = user.id;
    const deleteOrders = req.query.deleteOrders !== 'false';

    const tasks = [
      Session.destroy({ where: { userId } }),
      Rating.destroy({ where: { userId } }),
      Comment.destroy({ where: { userId } }),
      EmailVerification.destroy({ where: { email: user.email } }),
      User.destroy({ where: { id: userId } })
    ];

    if (deleteOrders) {
      tasks.push(Order.destroy({ where: { userId } }));
    } else {
      tasks.push(Order.update({ userId: null }, { where: { userId } }));
    }

    await Promise.all(tasks);

    res.json({ success: true, message: 'User fully deleted.', ordersKept: !deleteOrders });
  } catch (err) {
    console.error('[DELETE USER ERROR]', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/admin/admins', requireAdmin, async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'isSuperAdmin', 'permissions', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      raw: true
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

app.post('/api/admin/admins', requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const admin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      isSuperAdmin: false,
      permissions: permissions || ['products', 'orders', 'users'],
      verified: true
    });

    res.json({ success: true, admin: { id: admin.id, name: admin.name, email: admin.email, permissions: admin.permissions, isSuperAdmin: false } });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

app.patch('/api/admin/admins/:id', requireSuperAdmin, async (req, res) => {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target || target.role !== 'admin') return res.status(404).json({ error: 'Admin not found' });

    if (target.isSuperAdmin) {
      return res.status(400).json({ error: 'Cannot modify a super admin' });
    }

    const { permissions } = req.body;
    if (permissions) target.permissions = permissions;
    await target.save();

    res.json({ success: true, message: 'Admin permissions updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

app.delete('/api/admin/admins/:id', requireSuperAdmin, async (req, res) => {
  try {
    const target = await User.findByPk(req.params.id);
    if (!target || target.role !== 'admin') return res.status(404).json({ error: 'Admin not found' });

    if (target.isSuperAdmin) {
      return res.status(400).json({ error: 'Cannot delete the super admin' });
    }

    if (target.id === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await User.destroy({ where: { id: target.id } });
    res.json({ success: true, message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

app.post('/api/admin/cleanup', requireAdmin, async (req, res) => {
  try {
    const keepEmails = [
      'bigscany455@gmail.com',
      'mohammedmaltiti9@gmail.com'
    ];

    const usersToDelete = await User.findAll({
      where: {
        email: { [Op.notIn]: keepEmails },
        role: { [Op.ne]: 'admin' }
      },
      attributes: ['id', 'email']
    });

    const ids = usersToDelete.map(u => u.id);
    const emails = usersToDelete.map(u => u.email);

    if (ids.length === 0) {
      return res.json({ success: true, deleted: 0, message: 'No test users found' });
    }

    await Promise.all([
      Session.destroy({ where: { userId: { [Op.in]: ids } } }),
      Order.destroy({ where: { userId: { [Op.in]: ids } } }),
      Rating.destroy({ where: { userId: { [Op.in]: ids } } }),
      Comment.destroy({ where: { userId: { [Op.in]: ids } } }),
      EmailVerification.destroy({ where: { email: { [Op.in]: emails } } }),
      User.destroy({ where: { id: { [Op.in]: ids } } })
    ]);

    res.json({ success: true, deleted: ids.length, emails });
  } catch (err) {
    console.error('[CLEANUP ERROR]', err);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

app.post('/api/admin/users/bulk', requireAdmin, async (req, res) => {
  try {
    const { userIds, action, deleteOrders } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }
    if (!['suspend', 'revoke', 'reactivate', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const users = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        role: { [Op.ne]: 'admin' }
      },
      attributes: ['id', 'email']
    });

    if (users.length === 0) {
      return res.json({ success: true, affected: 0 });
    }

    const ids = users.map(u => u.id);

    if (action === 'delete') {
      const tasks = [
        Session.destroy({ where: { userId: { [Op.in]: ids } } }),
        Rating.destroy({ where: { userId: { [Op.in]: ids } } }),
        Comment.destroy({ where: { userId: { [Op.in]: ids } } }),
        EmailVerification.destroy({ where: { email: { [Op.in]: users.map(u => u.email) } } }),
        User.destroy({ where: { id: { [Op.in]: ids } } })
      ];
      if (deleteOrders !== false) {
        tasks.push(Order.destroy({ where: { userId: { [Op.in]: ids } } }));
      } else {
        tasks.push(Order.update({ userId: null }, { where: { userId: { [Op.in]: ids } } }));
      }
      await Promise.all(tasks);
    } else if (action === 'suspend') {
      await User.update({ status: 'suspended' }, { where: { id: { [Op.in]: ids } } });
    } else if (action === 'revoke') {
      await User.update({ status: 'revoked' }, { where: { id: { [Op.in]: ids } } });
    } else if (action === 'reactivate') {
      await User.update({ status: 'active' }, { where: { id: { [Op.in]: ids } } });
    }

    res.json({ success: true, affected: users.length });
  } catch (err) {
    console.error('[BULK USER ERROR]', err);
    res.status(500).json({ error: 'Bulk operation failed' });
  }
});

app.post('/api/admin/orders/bulk', requireAdmin, async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds array is required' });
    }
    if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await Order.update({ status }, { where: { id: { [Op.in]: orderIds } } });
    res.json({ success: true, affected: orderIds.length });
  } catch (err) {
    console.error('[BULK ORDER ERROR]', err);
    res.status(500).json({ error: 'Bulk operation failed' });
  }
});

app.get('/api/trash', requireAuth, async (req, res) => {
  res.json(await TrashItem.findAll({ raw: true }));
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await AdminProduct.findOne({ where: { id }, raw: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await TrashItem.create({ ...product, _trashedAt: new Date(), _wasAdminProduct: true });
  await AdminProduct.destroy({ where: { id } });

  invalidateProductCache();
  res.json({ success: true });
});

app.post('/api/trash/:id/restore', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const item = await TrashItem.findOne({ where: { id }, raw: true });
  if (!item) return res.status(404).json({ error: 'Item not found in trash' });

  await TrashItem.destroy({ where: { id } });

  const exists = await AdminProduct.findOne({ where: { id } });
  if (!exists) {
    const restored = { ...item };
    delete restored._trashedAt;
    delete restored._wasAdminProduct;
    await AdminProduct.create(restored);
  }

  invalidateProductCache();
  res.json({ success: true });
});

app.delete('/api/trash/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await TrashItem.destroy({ where: { id } });
  invalidateProductCache();
  res.json({ success: true });
});

app.get('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};
    if (date) {
      where.createdAt = {
        [Op.gte]: new Date(date),
        [Op.lte]: new Date(date + 'T23:59:59.999Z')
      };
    }
    res.json(await AdminProduct.findAll({ where, raw: true }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin products' });
  }
});

app.post('/api/admin/products', requireAuth, async (req, res) => {
  const data = req.body;
  const id = data.id;

  if (id) {
    const existing = await AdminProduct.findOne({ where: { id } });
    if (existing) {
      await AdminProduct.update(data, { where: { id } });
    } else {
      await AdminProduct.create({ ...data, id, _adminCreated: true });
    }
  } else {
    const maxDoc = await AdminProduct.findOne({ order: [['id', 'DESC']], raw: true });
    const maxId = maxDoc ? maxDoc.id : 0;
    await AdminProduct.create({ ...data, id: maxId + 1, _adminCreated: true });
  }

  invalidateProductCache();
  res.json({ success: true });
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await User.findByPk(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();

  res.json({ success: true });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Connected to CockroachDB (PostgreSQL)');
    await sequelize.sync();
    console.log('Database tables synced');
    await sequelize.query('ALTER TABLE "Orders" ALTER COLUMN "userId" DROP NOT NULL').catch(() => {});
    await ensureAdminUser();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SwifTek server running at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
