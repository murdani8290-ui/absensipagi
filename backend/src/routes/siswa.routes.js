import express from 'express';
import * as siswaController from '../controllers/siswa.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, siswaController.getProfile);
router.get('/absensi/today', authenticate, siswaController.getAbsensiToday);
router.get('/absensi/history', authenticate, siswaController.getAbsensiHistory);

export default router;
