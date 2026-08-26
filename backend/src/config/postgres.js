import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'app_db',
  connectionTimeoutMillis: 3000,
});

let isPostgresConnected = false;

export async function initPostgres() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully.');

    // Create users table if it does not exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ "users" table is initialized.');
    client.release();
    isPostgresConnected = true;
    return true;
  } catch (error) {
    console.warn('⚠️ PostgreSQL connection failed:', error.message);
    console.warn('💡 Ensure PostgreSQL service is running and credentials in .env are correct.');
    isPostgresConnected = false;
    return false;
  }
}

export function getPostgresStatus() {
  return isPostgresConnected;
}
