// server.js — Express backend + SQLite for portfolio contact messages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'portfolio.db');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// --- Database setup ---
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const insertStmt = db.prepare(
  'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)'
);

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// --- API routes ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post('/api/contact', (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || name.length > 100) {
      return res.status(400).json({ ok: false, error: 'Nama wajib diisi (maks 100 karakter).' });
    }
    if (message.length < 3 || message.length > 2000) {
      return res.status(400).json({ ok: false, error: 'Pesan wajib diisi (3-2000 karakter).' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Format email tidak valid.' });
    }

    const info = insertStmt.run(name, email || null, message);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('contact insert error:', err);
    res.status(500).json({ ok: false, error: 'Gagal menyimpan pesan.' });
  }
});

// Admin: list messages (protected by ADMIN_TOKEN)
app.get('/api/contacts', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized. Set ADMIN_TOKEN dan kirim via header X-Admin-Token.' });
  }
  const rows = db.prepare('SELECT * FROM contacts ORDER BY id DESC').all();
  res.json({ ok: true, count: rows.length, data: rows });
});

// Admin page (simple)
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- Static files (frontend) ---
app.use(express.static(__dirname, { index: 'index.html' }));

// Fallback for SPA-ish routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
  console.log(`DB: ${DB_PATH}`);
});
