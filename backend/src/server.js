import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool, initPostgres, getPostgresStatus } from './config/postgres.js';
import { initRedis, getRedisStatus, incrementVisits, getVisits } from './config/redis.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files if directory exists
const frontendPath = path.join(__dirname, '../../frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// In-memory fallback users store if PostgreSQL is disconnected
let fallbackUsers = [
  { id: 1, username: 'demo_user', email: 'demo@example.com', created_at: new Date() }
];

// --- API Endpoints ---

// 1. Service Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    services: {
      postgres: getPostgresStatus() ? 'Connected' : 'Disconnected',
      redis: getRedisStatus() ? 'Connected' : 'Disconnected',
    }
  });
});

// 2. Visits API (Redis)
app.get('/api/visits', async (req, res) => {
  const result = await getVisits();
  res.json({ success: true, visits: result.count, source: result.source });
});

app.post('/api/visits/increment', async (req, res) => {
  const result = await incrementVisits();
  res.json({ success: true, visits: result.count, source: result.source });
});

// 3. Users API (PostgreSQL)
app.get('/api/users', async (req, res) => {
  if (getPostgresStatus()) {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
      return res.json({ success: true, users: result.rows, source: 'PostgreSQL' });
    } catch (error) {
      console.error('Error fetching users from PostgreSQL:', error.message);
    }
  }
  return res.json({ success: true, users: fallbackUsers, source: 'Memory (PostgreSQL Disconnected)' });
});

app.post('/api/users', async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ success: false, error: 'اسم المستخدم والبريد الإلكتروني مطلوبان' });
  }

  if (getPostgresStatus()) {
    try {
      const query = `
        INSERT INTO users (username, email)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const result = await pool.query(query, [username, email]);
      return res.status(201).json({ success: true, user: result.rows[0], source: 'PostgreSQL' });
    } catch (error) {
      console.error('Error creating user in PostgreSQL:', error.message);
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'اسم المستخدم هذا مسجل بالفعل' });
      }
      return res.status(500).json({ success: false, error: 'حدث خطأ أثناء حفظ المستخدم في قاعدة البيانات' });
    }
  }

  // Fallback if Postgres is disconnected
  const newUser = {
    id: fallbackUsers.length + 1,
    username,
    email,
    created_at: new Date()
  };
  fallbackUsers.unshift(newUser);
  return res.status(201).json({ success: true, user: newUser, source: 'Memory (PostgreSQL Disconnected)' });
});

// Catch-all route: serve frontend index.html if present, or JSON API response
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ message: 'Backend API is running. Frontend is hosted separately.' });
});

// Initialize database connections and start server
async function startServer() {
  console.log('🚀 Initializing services...');
  await initPostgres();
  await initRedis();

  app.listen(PORT, () => {
    console.log(`✨ Server is running at http://localhost:${PORT}`);
  });
}

await startServer();
