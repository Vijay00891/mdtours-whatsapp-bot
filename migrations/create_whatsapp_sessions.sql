-- Migration to create missing whatsapp_sessions table
-- Run: mysql -u your_user -p mdtours_bot &lt; migrations/create_whatsapp_sessions.sql

USE mdtours_bot;

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone VARCHAR(20) PRIMARY KEY,
  contact_name VARCHAR(255) DEFAULT '',
  history JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
