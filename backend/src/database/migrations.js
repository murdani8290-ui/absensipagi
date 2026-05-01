import { query } from '../config/database.js';
import logger from '../utils/logger.js';

const migrations = [
  // Create guru table
  `CREATE TABLE IF NOT EXISTS guru (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'GURU',
    kelas_wali VARCHAR(50),
    hp VARCHAR(15),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create siswa table
  `CREATE TABLE IF NOT EXISTS siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nis VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    hp_ortu VARCHAR(15),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create absensi table
  `CREATE TABLE IF NOT EXISTS absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nis VARCHAR(20) NOT NULL REFERENCES siswa(nis) ON DELETE CASCADE,
    guru_id UUID REFERENCES guru(id),
    status VARCHAR(1) NOT NULL,
    keterangan TEXT,
    waktu_absen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(nis, DATE(waktu_absen))
  )`,

  // Create QR sessions table
  `CREATE TABLE IF NOT EXISTS qr_sessions (
    id UUID PRIMARY KEY,
    guru_id UUID NOT NULL REFERENCES guru(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_siswa_kelas ON siswa(kelas)`,
  `CREATE INDEX IF NOT EXISTS idx_absensi_nis ON absensi(nis)`,
  `CREATE INDEX IF NOT EXISTS idx_absensi_waktu ON absensi(waktu_absen)`,
  `CREATE INDEX IF NOT EXISTS idx_guru_username ON guru(username)`,
  `CREATE INDEX IF NOT EXISTS idx_qr_sessions_guru_id ON qr_sessions(guru_id)`,
];

export const runMigrations = async () => {
  try {
    logger.info('Running migrations...');

    for (const migration of migrations) {
      await query(migration);
      logger.info(`✓ Migration executed: ${migration.substring(0, 50)}...`);
    }

    logger.info('✓ All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};
