import { query } from '../config/database.js';
import { success, error } from '../utils/response.js';
import logger from '../utils/logger.js';

export const getProfile = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nis, nama, kelas, hp_ortu, created_at FROM siswa WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(error('Student not found', 404));
    }

    res.json(success(result.rows[0], 'Profile retrieved'));
  } catch (err) {
    logger.error('Get student profile error:', err);
    res.status(500).json(error('Failed to get profile'));
  }
};

export const getAbsensiToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT id, status, waktu_absen, keterangan FROM absensi 
       WHERE nis = $1 AND DATE(waktu_absen) = $2`,
      [req.user.nis, today]
    );

    const absensi = result.rows.length > 0 ? result.rows[0] : null;

    res.json(
      success(
        { absensi, hasSubmitted: !!absensi },
        'Today attendance retrieved'
      )
    );
  } catch (err) {
    logger.error('Get today attendance error:', err);
    res.status(500).json(error('Failed to get attendance'));
  }
};

export const getAbsensiHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const result = await query(
      `SELECT id, status, waktu_absen, keterangan FROM absensi 
       WHERE nis = $1 AND waktu_absen BETWEEN $2 AND $3
       ORDER BY waktu_absen DESC`,
      [req.user.nis, startDate, endDate]
    );

    res.json(success(result.rows, 'Attendance history retrieved'));
  } catch (err) {
    logger.error('Get attendance history error:', err);
    res.status(500).json(error('Failed to get attendance history'));
  }
};
