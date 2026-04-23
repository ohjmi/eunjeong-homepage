import { authService } from '../services/authService.js';
import { otpService } from '../services/otpService.js';
import { hashToken } from '../utils/token.js';

export async function verifyCode(req, res) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: '코드를 입력해주세요.' });

    // 1. 쿠키에 기존 세션 있으면 먼저 확인 (코드 검증 전에)
    const existingToken = req.cookies.session;
    if (existingToken) {
      const session = await authService.getSessionByToken(existingToken);
      if (session && session.is_verified) {
        return res.json({ status: 'success' }); // 바로 반환, user 필요 없음
      }
    }

    // 2. 세션 없거나 미인증이면 코드 확인
    const user = await authService.findUserByCode(code);

    // 3. DB에 다른 기기 세션 있으면 device_change
    //    기존 세션은 건드리지 않고 현재 기기용 pending 세션만 새로 발급
    //    실제 교체는 confirmDevice에서 일어남
    const hasSession = await authService.hasActiveSession(user.id);
    if (hasSession) {
      const { token } = await authService.createSession(user.id);
      res.cookie('session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      await otpService.createOTP(user.id, user.email);
      return res.json({ status: 'device_change' });
    }

    // 4. 최초 로그인
    const { token, tokenHash } = await authService.createSession(user.id);
    res.cookie('session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    await authService.activateSession(tokenHash);
    return res.json({ status: 'success' });

  } catch (err) {
    if (err.message === 'INVALID_CODE') {
      return res.status(404).json({ error: '유효하지 않은 코드예요.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류111' });
  }
}

export async function checkSession(req, res) {
  try {
    const token = req.cookies.session;
    if (!token) return res.json({ isVerified: false });

    const session = await authService.getSessionByToken(token);
    if (!session || !session.is_verified) return res.json({ isVerified: false });

    return res.json({ isVerified: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류222' });
  }
}

export async function confirmDevice(req, res) {
  try {
    const token = req.cookies.session;
    if (!token) return res.status(401).json({ error: 'NO_TOKEN' });

    const session = await authService.getSessionByToken(token);
    if (!session) return res.status(401).json({ error: 'INVALID_SESSION' });

    const tokenHash = hashToken(token);

    // 현재 세션 활성화 + 다른 기기 세션 모두 제거 (여기서 기존 기기가 튕김)
    await authService.activateSession(tokenHash);
    await authService.kickOtherSessions(session.user_id, tokenHash);

    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류333' });
  }
}