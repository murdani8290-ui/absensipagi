# SIPAGI - Sistem Presensi Pagi SMAN 10 Pinrang

Aplikasi presensi pagi digital dengan arsitektur modern, keamanan tingkat production, dan skalabilitas tinggi.

## 🚀 Fitur Utama

- ✅ QR Code scanning untuk siswa
- ✅ Input manual oleh guru piket
- ✅ Dashboard wali kelas
- ✅ Admin management system
- ✅ Auto-trigger alpa dengan notifikasi WhatsApp
- ✅ Rekap harian, mingguan, dan bulanan
- ✅ Progressive Web App (PWA)
- ✅ Offline support

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT + Bcrypt
- **Queue**: Bull Redis
- **Validation**: Joi/Zod
- **Logging**: Winston

### Frontend
- **Framework**: Vue 3 / Vanilla JS (Modular)
- **Build Tool**: Vite / Webpack
- **State Management**: Pinia (if Vue 3)
- **UI**: Tailwind CSS
- **HTTP Client**: Axios
- **QR Scanning**: html5-qrcode

### DevOps
- **Container**: Docker
- **CI/CD**: GitHub Actions
- **Deployment**: Railway / Vercel / Render
- **Monitoring**: Sentry
- **Analytics**: Posthog

## 🏗️ Struktur Proyek

```
absensipagi/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Konfigurasi (DB, env)
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # Database models
│   │   ├── services/       # Business services
│   │   ├── jobs/           # Queue jobs (scheduler)
│   │   ├── utils/          # Helper functions
│   │   └── app.js          # Express app setup
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── Dockerfile
├── frontend/                # Frontend aplikasi
│   ├── src/
│   │   ├── components/     # Vue/Vanilla components
│   │   ├── pages/          # Pages/views
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   ├── styles/         # CSS/Tailwind
│   │   ├── utils/          # Helper functions
│   │   ├── App.js/App.vue  # Root component
│   │   └── main.js         # Entry point
│   ├── public/             # Static assets
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js      # Build config
│   └── Dockerfile
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── SETUP.md            # Setup guide
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── ARCHITECTURE.md     # Architecture docs
├── docker-compose.yml      # Local dev environment
├── .github/
│   └── workflows/          # CI/CD workflows
└── .env.example            # Root env template
```

## 🛠️ Setup Awal

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (atau Supabase account)
- Docker (optional)
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/murdani8290-ui/absensipagi.git
   cd absensipagi
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run migrate        # Setup database
   npm run seed          # Seed initial data
   npm run dev           # Start development server
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev           # Start development server
   ```

4. **Access aplikasi**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📚 Dokumentasi

Lihat folder `docs/` untuk dokumentasi lengkap:
- [API Documentation](./docs/API.md)
- [Setup Guide](./docs/SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](./docs/ARCHITECTURE.md)

## 🔒 Keamanan

- [x] Environment variables untuk credentials
- [x] Password hashing dengan Bcrypt
- [x] JWT untuk authentication
- [x] Input validation & sanitization
- [x] CORS configured
- [x] Rate limiting
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection (if needed)

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Siswa
- `POST /api/absensi/scan-qr` - Submit absensi dari QR
- `GET /api/siswa/profile` - Get profil siswa

### Guru Piket
- `POST /api/guru/login` - Login guru piket
- `GET /api/guru/qr-code` - Generate QR code
- `POST /api/absensi/manual` - Input absensi manual

### Wali Kelas
- `GET /api/wali/kelas/:kelasId/rekap` - Get rekap harian
- `GET /api/wali/kelas/:kelasId/siswa` - Get daftar siswa

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `POST /api/admin/siswa` - Tambah siswa
- `POST /api/admin/import` - Import data
- `POST /api/admin/scheduler/trigger` - Trigger auto-alpa

## 🚀 Deployment

Lihat [DEPLOYMENT.md](./docs/DEPLOYMENT.md) untuk panduan deploy ke:
- Railway
- Vercel
- Render
- Docker

## 🤝 Kontribusi

Contributions welcome! Silakan buat issue atau PR.

## 📄 Lisensi

MIT License - Murdani 2025
