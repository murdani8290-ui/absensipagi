import express from 'express';
import * as absensiController from '../controllers/absensi.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// QR Code based
router.post('/qr-generate', authenticate, authorize('GURU'), absensiController.generateQRCode);
router.post('/qr-submit', absensiController.submitAbsensiQR);

// Manual input
router.post('/manual', authenticate, authorize('GURU', 'WALI'), absensiController.submitAbsensiManual);

export default router;
