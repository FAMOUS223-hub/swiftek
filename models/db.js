const { Sequelize } = require('sequelize');

const COCKROACHDB_URL = process.env.COCKROACHDB_URL || process.env.DATABASE_URL;

if (!COCKROACHDB_URL) {
  console.error('COCKROACHDB_URL or DATABASE_URL environment variable is required');
  process.exit(1);
}

const sequelize = new Sequelize(COCKROACHDB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
