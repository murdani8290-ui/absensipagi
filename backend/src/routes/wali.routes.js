import express from 'express';
import * as waliController from '../controllers/wali.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/rekap', authenticate, authorize('WALI'), waliController.getKelasRekap);
router.get('/download', authenticate, authorize('WALI'), waliController.downloadRekap);

export default router;
