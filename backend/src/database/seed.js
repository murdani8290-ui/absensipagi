import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const seedDatabase = async () => {
  try {
    logger.info('Seeding database...');

    // Create default admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await query(
      `INSERT INTO guru (username, password, nama, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', adminPassword, 'Administrator', 'ADMIN']
    );
    logger.info('✓ Admin user created (username: admin, password: admin123)');

    // Create default teacher
    const teacherPassword = await bcrypt.hash('guru123', 10);
    await query(
      `INSERT INTO guru (username, password, nama, role, kelas_wali) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      ['guru1', teacherPassword, 'Guru Piket 1', 'GURU', 'XI IPA 1']
    );
    logger.info('✓ Teacher user created (username: guru1, password: guru123)');

    // Create default wali kelas
    const waliPassword = await bcrypt.hash('wali123', 10);
    await query(
      `INSERT INTO guru (username, password, nama, role, kelas_wali) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING`,
      ['wali1', waliPassword, 'Wali Kelas XI IPA 1', 'WALI', 'XI IPA 1']
    );
    logger.info('✓ Wali kelas user created (username: wali1, password: wali123)');

    // Create sample students
    const sampleStudents = [
      { nis: '001', nama: 'Ahmad Fauzi', kelas: 'XI IPA 1', hp_ortu: '08123456789' },
      { nis: '002', nama: 'Budi Santoso', kelas: 'XI IPA 1', hp_ortu: '08234567890' },
      { nis: '003', nama: 'Citra Dewi', kelas: 'XI IPA 1', hp_ortu: '08345678901' },
      { nis: '004', nama: 'Doni Kurniawan', kelas: 'XI IPA 2', hp_ortu: '08456789012' },
      { nis: '005', nama: 'Eka Pratama', kelas: 'XI IPA 2', hp_ortu: '08567890123' },
    ];

    for (const student of sampleStudents) {
      await query(
        `INSERT INTO siswa (nis, nama, kelas, hp_ortu) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (nis) DO NOTHING`,
        [student.nis, student.nama, student.kelas, student.hp_ortu]
      );
    }
    logger.info(`✓ Created ${sampleStudents.length} sample students`);

    logger.info('✓ Database seeding completed');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
};
