const mysql = require('mysql2/promise');
const logger = require('./logger');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-migrate: create tables on startup if they don't exist
// This is the safest pattern — idempotent, runs every restart, never breaks
async function runMigrations(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      phone        VARCHAR(20)  PRIMARY KEY,
      contact_name VARCHAR(255) DEFAULT '',
      history      JSON,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      phone          VARCHAR(20),
      contact_name   VARCHAR(255),
      destination    VARCHAR(255),
      tour_type      VARCHAR(100),
      travel_dates   VARCHAR(100),
      adults         VARCHAR(20),
      children       VARCHAR(20),
      departure_city VARCHAR(100),
      full_conversation LONGTEXT,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Add full_conversation column if upgrading from older schema
  try {
    await conn.query(`ALTER TABLE leads ADD COLUMN full_conversation LONGTEXT`);
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e;
  }

  logger.info('Database tables ready');
}

// Connect on startup, run migrations, then release connection back to pool
pool.getConnection()
  .then(async conn => {
    logger.info('MySQL connected successfully');
    await runMigrations(conn);
    conn.release();
  })
  .catch(err => {
    logger.error('MySQL connection failed', { error: err.message });
    process.exit(1);
  });

module.exports = pool;