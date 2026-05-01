# SIPAGI Backend API Documentation

## Overview

Backend API untuk aplikasi SIPAGI (Sistem Presensi Pagi SMAN 10 Pinrang) dengan arsitektur modular, security first, dan production-ready.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Authentication**: JWT (JSON Web Tokens)
- **Queue**: Bull (Redis-based)
- **Validation**: Joi

## Setup

### Prerequisites

- Node.js 18+ dan npm 9+
- PostgreSQL 14+
- Redis 7+
- Git

### Installation

```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Change JWT_SECRET and DB_PASSWORD

# Install dependencies
npm install

# Setup database (run migrations & seed)
npm run migrate
npm run seed

# Start development server
npm run dev
```

## API Endpoints

### Authentication (`/api/auth`)

#### POST /api/auth/login

Login untuk semua role (siswa, guru, wali, admin).

**Request:**
```json
{
  "username": "guru1",
  "password": "guru123",
  "role": "GURU"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "username": "guru1",
    "nama": "Guru Piket 1",
    "role": "GURU",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/refresh

Refresh access token menggunakan refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### GET /api/auth/profile

Get profile user (memerlukan autentikasi).

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### POST /api/auth/logout

Logout user.

#### POST /api/auth/change-password

Ganti password (memerlukan autentikasi).

**Request:**
```json
{
  "oldPassword": "guru123",
  "newPassword": "newpassword123"
}
```

### Siswa (`/api/siswa`)

#### GET /api/siswa/profile

Get profil siswa.

#### GET /api/siswa/absensi/today

Get status kehadiran hari ini.

#### GET /api/siswa/absensi/history

Get riwayat kehadiran.

**Query Parameters:**
- `month`: Bulan (1-12)
- `year`: Tahun (YYYY)

### Absensi (`/api/absensi`)

#### POST /api/absensi/qr-generate

Generate QR code untuk scanning (hanya GURU).

**Response:**
```json
{
  "success": true,
  "data": {
    "qrId": "uuid",
    "qrImage": "data:image/png;base64,...",
    "expiresAt": "2026-05-01T12:00:00Z",
    "expiresIn": 20
  }
}
```

#### POST /api/absensi/qr-submit

Submit absensi via QR code.

**Request:**
```json
{
  "nis": "001",
  "qrId": "uuid"
}
```

#### POST /api/absensi/manual

Input absensi manual (GURU atau WALI).

**Request:**
```json
{
  "nis": "001",
  "status": "H",
  "keterangan": "(optional) catatan"
}
```

**Status Values:**
- `H` - Hadir (Present)
- `S` - Sakit (Sick)
- `I` - Izin (Permission)
- `A` - Alpa (Absent)

### Wali Kelas (`/api/wali`)

#### GET /api/wali/rekap

Get rekap kehadiran kelas.

**Query Parameters:**
- `date`: Tanggal (YYYY-MM-DD), default: hari ini
- `page`: Halaman (default: 1)
- `limit`: Items per page (default: 50)

#### GET /api/wali/download

Download rekap dalam format Excel.

**Query Parameters:**
- `month`: Bulan (1-12)
- `year`: Tahun (YYYY)

## Database Schema

### guru
```sql
- id (UUID PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- nama (VARCHAR)
- role (VARCHAR: GURU, WALI, ADMIN, BK)
- kelas_wali (VARCHAR, optional)
- hp (VARCHAR, optional)
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### siswa
```sql
- id (UUID PRIMARY KEY)
- nis (VARCHAR, UNIQUE)
- nama (VARCHAR)
- kelas (VARCHAR)
- hp_ortu (VARCHAR, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### absensi
```sql
- id (UUID PRIMARY KEY)
- nis (VARCHAR, FK siswa)
- guru_id (UUID, FK guru)
- status (VARCHAR: H, S, I, A)
- keterangan (TEXT, optional)
- waktu_absen (TIMESTAMP)
- created_at (TIMESTAMP)
- UNIQUE(nis, DATE(waktu_absen))
```

### qr_sessions
```sql
- id (UUID PRIMARY KEY)
- guru_id (UUID, FK guru)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

## Error Handling

Semua error response mengikuti format:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "timestamp": "2026-05-01T12:00:00Z"
}
```

## Security

✓ Password hashing dengan bcryptjs
✓ JWT token authentication
✓ Rate limiting (100 req/15min, 5 req/15min untuk auth)
✓ CORS protection
✓ Helmet.js untuk security headers
✓ Input validation & sanitization
✓ SQL injection prevention (parameterized queries)
✓ Environment variables untuk sensitive data
✓ Encryption untuk data sensitif

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Scripts
- `npm run dev` - Start development server dengan nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database dengan data awal
- `npm test` - Run tests
- `npm run lint` - Check code style

## Default Credentials (Development Only)

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Guru Piket | guru1 | guru123 |
| Wali Kelas | wali1 | wali123 |

⚠️ **Change these immediately in production!**

## Deployment

Lihat file `DEPLOYMENT.md` untuk panduan deployment ke production.

## Support

Untuk pertanyaan atau bug reports, buat issue di GitHub repository.
