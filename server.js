require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const SeedProduct = require('./models/SeedProduct');
const AdminProduct = require('./models/AdminProduct');
const DeletedId = require('./models/DeletedId');
const TrashItem = require('./models/TrashItem');
const Session = require('./models/Session');
const Config = require('./models/Config');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Amos_Nganbe:mynameis123MASTERcluster0.bzpm0f4.mongodb.net/swiftek?appName=Cluster0';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ───── Seed products on first run ─────

async function seedProducts() {
  const count = await SeedProduct.countDocuments();
  if (count > 0) return;

  const raw = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
  const products = JSON.parse(raw);
  await SeedProduct.insertMany(products);
  console.log(`Seeded ${products.length} products`);
}

async function ensureConfig() {
  const exists = await Config.findOne({ key: 'passwordHash' });
  if (!exists) {
    await Config.create({ key: 'passwordHash', value: crypto.createHash('sha256').update('admin').digest('hex') });
  }
}

// ───── Products (public) ─────

async function getStoreProducts() {
  const [seedProducts, adminProducts, deletedDocs] = await Promise.all([
    SeedProduct.find().lean(),
    AdminProduct.find().lean(),
    DeletedId.find().lean()
  ]);

  const deletedSet = new Set(deletedDocs.map(d => d.id));
  const merged = seedProducts.filter(p => !deletedSet.has(p.id));

  adminProducts.forEach(ap => {
    const idx = merged.findIndex(p => p.id === ap.id);
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...ap };
    } else {
      merged.push(ap);
    }
  });

  return merged;
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

app.get('/api/stats', async (req, res) => {
  const [adminProducts, trash, deleted] = await Promise.all([
    AdminProduct.find({ _adminCreated: true }).lean(),
    TrashItem.find().lean(),
    DeletedId.find().lean()
  ]);
  res.json({
    total: (await getStoreProducts()).length,
    adminCreated: adminProducts.length,
    inTrash: trash.length,
    deletedCount: deleted.length
  });
});

// ───── Auth (public) ─────

app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const config = await Config.findOne({ key: 'passwordHash' });
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== config.value) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await Session.create({ token, createdAt: new Date(), lastUsed: new Date() });
  res.json({ success: true, token });
});

app.post('/api/auth/logout', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  await Session.deleteOne({ token });
  res.json({ success: true });
});

// ───── Auth middleware ─────

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const session = await Session.findOne({ token });
  if (!session) return res.status(401).json({ error: 'Invalid or expired session' });

  session.lastUsed = new Date();
  await session.save();
  req.session = session;
  next();
}

// ───── Auth-protected endpoints ─────

app.get('/api/trash', requireAuth, async (req, res) => {
  res.json(await TrashItem.find().lean());
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [seedProduct, adminProduct] = await Promise.all([
    SeedProduct.findOne({ id }).lean(),
    AdminProduct.findOne({ id }).lean()
  ]);

  const product = seedProduct || adminProduct;
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const isStatic = id < 101;
  const isAdminManaged = !!adminProduct;

  await TrashItem.create({ ...product, _trashedAt: new Date(), _wasAdminProduct: isAdminManaged });

  await AdminProduct.deleteOne({ id });

  if (isStatic) {
    const exists = await DeletedId.findOne({ id });
    if (!exists) {
      await DeletedId.create({ id });
    }
  }

  res.json({ success: true });
});

app.post('/api/trash/:id/restore', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const item = await TrashItem.findOne({ id });
  if (!item) return res.status(404).json({ error: 'Item not found in trash' });

  await TrashItem.deleteOne({ id });

  if (item._wasAdminProduct) {
    const exists = await AdminProduct.findOne({ id });
    if (!exists) {
      const restored = item.toObject();
      delete restored._id;
      delete restored.__v;
      delete restored._trashedAt;
      delete restored._wasAdminProduct;
      await AdminProduct.create(restored);
    }
  } else {
    await DeletedId.deleteOne({ id });
  }

  res.json({ success: true });
});

app.delete('/api/trash/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await TrashItem.deleteOne({ id });
  res.json({ success: true });
});

app.get('/api/admin/products', requireAuth, async (req, res) => {
  res.json(await AdminProduct.find().lean());
});

app.post('/api/admin/products', requireAuth, async (req, res) => {
  const data = req.body;
  const id = data.id;

  if (id) {
    const existing = await AdminProduct.findOne({ id });
    if (existing) {
      await AdminProduct.updateOne({ id }, { $set: data });
    } else if (id < 101) {
      await AdminProduct.create({ ...data, id, _adminOverride: true });
    }
  } else {
    const maxDoc = await AdminProduct.findOne().sort({ id: -1 }).lean();
    const maxId = maxDoc ? Math.max(maxDoc.id, 100) : 100;
    await AdminProduct.create({ ...data, id: maxId + 1, _adminCreated: true });
  }

  res.json({ success: true });
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const config = await Config.findOne({ key: 'passwordHash' });

  const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
  if (currentHash !== config.value) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  config.value = crypto.createHash('sha256').update(newPassword).digest('hex');
  await config.save();
  res.json({ success: true });
});

// ───── Start ─────

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    await seedProducts();
    await ensureConfig();
    app.listen(PORT, () => {
      console.log(`SwifTek server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
