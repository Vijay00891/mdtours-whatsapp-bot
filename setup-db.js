require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL');

  // Create DB if not exists
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await conn.query(`USE \`${process.env.DB_NAME}\``);
  console.log(`Using database: ${process.env.DB_NAME}`);

  // whatsapp_sessions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      phone VARCHAR(20) PRIMARY KEY,
      contact_name VARCHAR(255) DEFAULT '',
      history JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ Table ready: whatsapp_sessions');

  // leads table — includes full_conversation for audit trail
  await conn.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(20),
      contact_name VARCHAR(255),
      destination VARCHAR(255),
      tour_type VARCHAR(100),
      travel_dates VARCHAR(100),
      adults VARCHAR(20),
      children VARCHAR(20),
      departure_city VARCHAR(100),
      full_conversation LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ Table ready: leads');

  // Add full_conversation column if upgrading from older schema
  try {
    await conn.query(`ALTER TABLE leads ADD COLUMN full_conversation LONGTEXT`);
    console.log('✅ Added full_conversation column to existing leads table');
  } catch (e) {
    // Column already exists — this is expected on fresh installs
    if (!e.message.includes('Duplicate column')) throw e;
  }

  await conn.end();
  console.log('\n🎉 Database setup complete! You can now run: node server.js');
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
