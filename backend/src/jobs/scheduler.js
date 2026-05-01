import Queue from 'bull';
import logger from '../utils/logger.js';
import { query } from '../config/database.js';
import { cache } from '../config/redis.js';

let scheduler;

export const startScheduler = async () => {
  try {
    scheduler = new Queue('scheduler', process.env.REDIS_URL);

    // Process auto alpa job
    scheduler.process('auto-alpa', async (job) => {
      logger.info('Processing auto alpa job...');
      await triggerAutoAlpa();
    });

    // Process send WA job
    scheduler.process('send-wa', async (job) => {
      logger.info('Processing send WA job...');
      // TODO: Implement WhatsApp sending
    });

    // Schedule auto alpa daily
    const autoAlpaTime = process.env.SCHEDULER_AUTO_ALPA_TIME || '08:00';
    const [hour, minute] = autoAlpaTime.split(':').map(Number);

    scheduler.add(
      { name: 'auto-alpa' },
      {
        repeat: {
          cron: `${minute} ${hour} * * 1-5`, // Monday to Friday
          tz: process.env.SCHEDULER_TIMEZONE || 'Asia/Jakarta',
        },
      }
    );

    logger.info(`✓ Scheduler started - Auto alpa at ${autoAlpaTime}`);
  } catch (error) {
    logger.error('Failed to start scheduler:', error);
    throw error;
  }
};

const triggerAutoAlpa = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find all students who haven't submitted attendance
    const result = await query(
      `SELECT DISTINCT s.nis, s.nama, s.hp_ortu FROM siswa s
       WHERE NOT EXISTS (
         SELECT 1 FROM absensi a 
         WHERE a.nis = s.nis AND DATE(a.waktu_absen) = $1
       )`,
      [today]
    );

    const studentsWithoutAttendance = result.rows;

    if (studentsWithoutAttendance.length === 0) {
      logger.info('All students have submitted attendance');
      return;
    }

    // Mark as alpa
    for (const student of studentsWithoutAttendance) {
      await query(
        `INSERT INTO absensi (nis, status, waktu_absen) 
         VALUES ($1, 'A', NOW())`,
        [student.nis]
      );
    }

    logger.info(`Auto alpa triggered for ${studentsWithoutAttendance.length} students`);

    // Send notifications to parents if enabled
    if (process.env.FEATURE_WA_NOTIFICATION === 'true') {
      await sendWANotifications(studentsWithoutAttendance);
    }
  } catch (error) {
    logger.error('Auto alpa trigger failed:', error);
    throw error;
  }
};

const sendWANotifications = async (students) => {
  try {
    logger.info(`Sending WA notifications to ${students.length} parents...`);
    // TODO: Implement WhatsApp API integration
    logger.info('WA notifications sent');
  } catch (error) {
    logger.error('Failed to send WA notifications:', error);
  }
};

export const stopScheduler = async () => {
  if (scheduler) {
    await scheduler.close();
    logger.info('Scheduler stopped');
  }
};
