# Portfolio KAZA — Backend + Database

Situs portfolio statis (HTML/CSS/JS) + backend Express (Node.js) + database SQLite untuk menyimpan pesan dari form contact.

## Struktur

```
portfolio-kaza/
├── index.html          # Frontend
├── style.css
├── script.js
├── admin.html          # Halaman admin (lihat pesan)
├── server.js           # Express API + static server
├── package.json
├── .env.example
└── data/               # SQLite DB (gitignored)
    └── portfolio.db
```

## Menjalankan lokal

```bash
npm install
cp .env.example .env
# edit .env: set ADMIN_TOKEN
npm run dev
# buka http://localhost:3000
# admin: http://localhost:3000/admin  (masukkan ADMIN_TOKEN)
```

## API

- `GET  /api/health` — cek server
- `POST /api/contact` — body `{name, email, message}` → simpan ke DB
- `GET  /api/contacts` — butuh header `X-Admin-Token: <ADMIN_TOKEN>`

## Deploy

### Render (direkomendasikan untuk SQLite)
1. Push ke GitHub.
2. Render → New Web Service → pilih repo.
3. Build: `npm install`, Start: `npm start`.
4. Tambah Environment: `ADMIN_TOKEN`, `DB_PATH=/var/data/portfolio.db`.
5. Tambah Disk (persistent) mount ke `/var/data` agar SQLite tidak hilang saat restart.

### Railway / Fly.io
Sama seperti Render, pastikan volume persistent untuk file DB.

### Vercel / Netlify (serverless)
SQLite file tidak persisten di serverless. Opsi:
- Gunakan DB managed (Turso, Supabase, Neon Postgres) dan ganti `better-sqlite3` dengan client yang sesuai, ATAU
- Deploy backend ke Render/Railway (lihat di atas) dan frontend saja ke Vercel/Netlify (ubah `fetch('/api/contact')` ke URL backend).

## Keamanan
- Jangan commit `.env` / `data/*.db`.
- Ganti `ADMIN_TOKEN` dengan string panjang acak di production.
- Endpoint admin dilindungi token; pertimbangkan tambah auth session untuk produksi.
