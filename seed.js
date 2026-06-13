require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { sequelize, SeedProduct, AdminProduct, DeletedId, TrashItem, Session, Config } = require('./models');

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to CockroachDB');
  await sequelize.sync();
  console.log('Tables synced');

  await SeedProduct.destroy({ where: {} });
  await AdminProduct.destroy({ where: {} });
  await DeletedId.destroy({ where: {} });
  await TrashItem.destroy({ where: {} });
  await Session.destroy({ where: {} });
  await Config.destroy({ where: {} });

  const raw = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
  const products = JSON.parse(raw);
  await SeedProduct.bulkCreate(products);
  console.log(`Seeded ${products.length} products`);

  await Config.create({
    key: 'passwordHash',
    value: crypto.createHash('sha256').update('admin').digest('hex')
  });
  console.log('Default password set to "admin"');

  await sequelize.close();
  console.log('Done');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
