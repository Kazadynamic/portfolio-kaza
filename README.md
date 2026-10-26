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
- `GET  /api/contacts` — butuh header `X-Admin-Token: <ADMIN_TOKEN

