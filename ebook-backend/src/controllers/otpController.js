import { authService } from '../services/authService.js';
import { otpService } from '../services/otpService.js';
import { hashToken } from '../utils/token.js';

export async function verifyOtp(req, res) {
  try {
    const { otp } = req.body;
    const token = req.cookies.session;

    if (!token) return res.status(401).json({ error: 'NO_TOKEN' });

    const session = await authService.getSessionByToken(token);
    if (!session) return res.status(401).json({ error: 'INVALID_SESSION' });

    const isValid = await otpService.verifyOTP(session.user_id, otp);
    if (!isValid) return res.status(400).json({ error: 'INVALID_OTP' });

    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function resendOtp(req, res) {
  try {
    const token = req.cookies.session;
    if (!token) return res.status(401).json({ error: 'NO_TOKEN' });

    const session = await authService.getSessionByToken(token);
    if (!session) return res.status(401).json({ error: 'INVALID_SESSION' });

    const user = await authService.findUserById(session.user_id);
    await otpService.createOTP(session.user_id, user.email);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
}