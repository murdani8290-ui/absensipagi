import { query } from '../config/database.js';
import { success, error, paginated } from '../utils/response.js';
import logger from '../utils/logger.js';
import ExcelJS from 'exceljs';

export const getKelasRekap = async (req, res) => {
  try {
    const { date, page = 1, limit = 50 } = req.query;
    const waliId = req.user.id;
    const offset = (page - 1) * limit;

    // Get wali's kelas
    const kelasResult = await query(
      'SELECT kelas_wali FROM guru WHERE id = $1',
      [waliId]
    );

    if (kelasResult.rows.length === 0 || !kelasResult.rows[0].kelas_wali) {
      return res.status(403).json(error('No class assigned', 403));
    }

    const kelas = kelasResult.rows[0].kelas_wali;

    // Get attendance data
    const result = await query(
      `SELECT s.id, s.nis, s.nama, s.kelas, a.status, a.waktu_absen
       FROM siswa s
       LEFT JOIN absensi a ON s.nis = a.nis AND DATE(a.waktu_absen) = $1
       WHERE s.kelas = $2
       ORDER BY s.nama
       LIMIT $3 OFFSET $4`,
      [date || new Date().toISOString().split('T')[0], kelas, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM siswa WHERE kelas = $1',
      [kelas]
    );

    const total = parseInt(countResult.rows[0].total);

    // Calculate statistics
    const stats = {
      total: result.rows.length,
      hadir: result.rows.filter((r) => r.status === 'H').length,
      sakit: result.rows.filter((r) => r.status === 'S').length,
      izin: result.rows.filter((r) => r.status === 'I').length,
      alpa: result.rows.filter((r) => r.status === 'A').length,
      belum: result.rows.filter((r) => !r.status).length,
    };

    res.json(
      paginated(result.rows, total, page, limit)
    );
  } catch (err) {
    logger.error('Get kelas rekap error:', err);
    res.status(500).json(error('Failed to get attendance'));
  }
};

export const downloadRekap = async (req, res) => {
  try {
    const { month, year } = req.query;
    const waliId = req.user.id;

    // Get wali's kelas
    const kelasResult = await query(
      'SELECT kelas_wali FROM guru WHERE id = $1',
      [waliId]
    );

    if (kelasResult.rows.length === 0 || !kelasResult.rows[0].kelas_wali) {
      return res.status(403).json(error('No class assigned', 403));
    }

    const kelas = kelasResult.rows[0].kelas_wali;

    // Get all students in class
    const siswaResult = await query(
      'SELECT nis, nama FROM siswa WHERE kelas = $1 ORDER BY nama',
      [kelas]
    );

    // Get attendance data for the month
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const absensiResult = await query(
      `SELECT nis, DATE(waktu_absen) as tanggal, status FROM absensi
       WHERE nis IN (${siswaResult.rows.map((_, i) => `$${i + 1}`).join(',')}) 
       AND waktu_absen BETWEEN $${siswaResult.rows.length + 1} AND $${siswaResult.rows.length + 2}
       ORDER BY tanggal`,
      [...siswaResult.rows.map((s) => s.nis), startDate, endDate]
    );

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Rekap ${month}/${year}`);

    // Add headers
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'NIS', key: 'nis', width: 12 },
      { header: 'Nama', key: 'nama', width: 25 },
    ];

    // Add date columns
    for (let i = 1; i <= endDate.getDate(); i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), i);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      worksheet.addColumn({
        header: `${i}\n${dayName}`,
        key: `d${i}`,
        width: 8,
      });
    }

    // Add data rows
    siswaResult.rows.forEach((siswa, idx) => {
      const row = {
        no: idx + 1,
        nis: siswa.nis,
        nama: siswa.nama,
      };

      // Add attendance status for each day
      for (let i = 1; i <= endDate.getDate(); i++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), i)
          .toISOString()
          .split('T')[0];
        const absensi = absensiResult.rows.find(
          (a) => a.nis === siswa.nis && a.tanggal === date
        );
        row[`d${i}`] = absensi?.status || '-';
      }

      worksheet.addRow(row);
    });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Rekap_${kelas}_${month}_${year}.xlsx"`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
  } catch (err) {
    logger.error('Download rekap error:', err);
    res.status(500).json(error('Failed to download rekap'));
  }
};
