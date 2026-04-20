import express from 'express';
import { verifyCode, checkSession, confirmDevice } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/code', verifyCode);
router.get('/auth/session', checkSession);
router.post('/auth/confirm-device', confirmDevice);

export default router;