import { query, transaction } from '../config/database.js';
import { success, error } from '../utils/response.js';
import logger from '../utils/logger.js';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const generateQRCode = async (req, res) => {
  try {
    const guruId = req.user.id;
    const qrId = uuidv4();
    const expiresAt = new Date(Date.now() + 20 * 1000); // 20 seconds

    // Save QR session
    await query(
      `INSERT INTO qr_sessions (id, guru_id, expires_at) VALUES ($1, $2, $3)`,
      [qrId, guruId, expiresAt]
    );

    // Generate QR code
    const qrData = JSON.stringify({ qrId, timestamp: Date.now() });
    const qrImage = await QRCode.toDataURL(qrData);

    res.json(
      success(
        {
          qrId,
          qrImage,
          expiresAt,
          expiresIn: 20,
        },
        'QR code generated'
      )
    );
  } catch (err) {
    logger.error('Generate QR error:', err);
    res.status(500).json(error('Failed to generate QR code'));
  }
};

export const submitAbsensiQR = async (req, res) => {
  try {
    const { nis, qrId } = req.body;

    if (!nis || !qrId) {
      return res.status(400).json(error('NIS and QR ID required', 400));
    }

    // Verify QR session
    const qrResult = await query(
      `SELECT guru_id FROM qr_sessions WHERE id = $1 AND expires_at > NOW()`,
      [qrId]
    );

    if (qrResult.rows.length === 0) {
      return res.status(400).json(error('Invalid or expired QR code', 400));
    }

    const guruId = qrResult.rows[0].guru_id;

    // Check if student exists
    const siswaResult = await query(
      'SELECT id FROM siswa WHERE nis = $1',
      [nis]
    );

    if (siswaResult.rows.length === 0) {
      return res.status(404).json(error('Student not found', 404));
    }

    const siswaId = siswaResult.rows[0].id;

    // Check if already submitted today
    const today = new Date().toISOString().split('T')[0];
    const existingResult = await query(
      `SELECT id FROM absensi WHERE nis = $1 AND DATE(waktu_absen) = $2`,
      [nis, today]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json(error('Already submitted attendance today', 400));
    }

    // Insert attendance
    await query(
      `INSERT INTO absensi (nis, guru_id, status, waktu_absen) 
       VALUES ($1, $2, 'H', NOW())`,
      [nis, guruId]
    );

    // Clean up expired QR sessions
    await query(
      'DELETE FROM qr_sessions WHERE expires_at < NOW()'
    );

    logger.info(`Attendance submitted: ${nis} via QR`);

    res.json(success({ nis, status: 'H' }, 'Attendance submitted successfully'));
  } catch (err) {
    logger.error('Submit attendance error:', err);
    res.status(500).json(error('Failed to submit attendance'));
  }
};

export const submitAbsensiManual = async (req, res) => {
  try {
    const { nis, status, keterangan } = req.body;
    const guruId = req.user.id;

    if (!nis || !status) {
      return res.status(400).json(error('NIS and status required', 400));
    }

    if (!['H', 'S', 'I', 'A'].includes(status)) {
      return res.status(400).json(error('Invalid status', 400));
    }

    // Check if student exists
    const siswaResult = await query(
      'SELECT id FROM siswa WHERE nis = $1',
      [nis]
    );

    if (siswaResult.rows.length === 0) {
      return res.status(404).json(error('Student not found', 404));
    }

    // Check if already submitted today
    const today = new Date().toISOString().split('T')[0];
    const existingResult = await query(
      `SELECT id FROM absensi WHERE nis = $1 AND DATE(waktu_absen) = $2`,
      [nis, today]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE absensi SET status = $1, keterangan = $2, guru_id = $3 
         WHERE nis = $4 AND DATE(waktu_absen) = $5`,
        [status, keterangan || null, guruId, nis, today]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO absensi (nis, guru_id, status, keterangan, waktu_absen) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [nis, guruId, status, keterangan || null]
      );
    }

    logger.info(`Attendance submitted manually: ${nis} - ${status}`);

    res.json(success({ nis, status }, 'Attendance recorded successfully'));
  } catch (err) {
    logger.error('Submit manual attendance error:', err);
    res.status(500).json(error('Failed to record attendance'));
  }
};
