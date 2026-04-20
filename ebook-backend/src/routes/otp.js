import express from 'express';
import { verifyOtp, resendOtp } from '../controllers/otpController.js';

const router = express.Router();

router.post('/otp/verify', verifyOtp);
router.post('/otp/resend', resendOtp);

export default router;