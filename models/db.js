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
    max: 25,
    min: 2,
    acquire: 15000,
    idle: 5000,
    evict: 1000
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /SequelizeTimeoutError/,
      /TimeoutError/
    ],
    max: 3
  }
});

module.exports = sequelize;
