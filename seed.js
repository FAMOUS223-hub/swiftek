const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SeedProduct = require('./models/SeedProduct');
const AdminProduct = require('./models/AdminProduct');
const DeletedId = require('./models/DeletedId');
const TrashItem = require('./models/TrashItem');
const Session = require('./models/Session');
const Config = require('./models/Config');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swiftek';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await SeedProduct.deleteMany({});
  await AdminProduct.deleteMany({});
  await DeletedId.deleteMany({});
  await TrashItem.deleteMany({});
  await Session.deleteMany({});
  await Config.deleteMany({});

  const raw = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
  const products = JSON.parse(raw);
  await SeedProduct.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  await Config.create({
    key: 'passwordHash',
    value: crypto.createHash('sha256').update('admin').digest('hex')
  });
  console.log('Default password set to "admin"');

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
