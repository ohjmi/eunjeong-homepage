import { ebookService } from '../services/ebookService.js';
import { authService } from '../services/authService.js';

async function getVerifiedUserId(req) {
  const token = req.cookies.session;
  if (!token) throw new Error('NO_TOKEN');

  const session = await authService.getSessionByToken(token);
  if (!session || !session.is_verified) throw new Error('UNAUTHORIZED');

  return session.user_id;
}

export async function getEbookInfo(req, res) {
  try {
    const userId = await getVerifiedUserId(req);
    const result = await ebookService.getEbookInfo(userId);
    res.json({ success: true, ...result });

  } catch (err) {
    if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: '인증이 필요해요.' });
    }
    if (err.message === 'EBOOK_NOT_FOUND') {
      return res.status(404).json({ error: 'ebook을 찾을 수 없어요.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function getPageUrls(req, res) {
  try {
    const userId = await getVerifiedUserId(req);

    // 이 세 줄만 바꿔도 충분히 의미 있음
    const startPage = Math.max(1, parseInt(req.query.start) || 1);
    const rawLimit = parseInt(req.query.limit) || 10;
    const limit = Math.max(1, Math.min(rawLimit, 20));

    const result = await ebookService.getPageUrls(userId, startPage, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    // 기존 에러 처리 그대로 유지
    if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
      return res.status(401).json({ error: '인증이 필요해요.' });
    }
    if (err.message === 'EBOOK_NOT_FOUND') {
      return res.status(404).json({ error: 'ebook을 찾을 수 없어요.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function getPreviewUrls(req, res) {
  try {
    const ebookId = parseInt(req.params.ebookId);
    if (isNaN(ebookId)) {
      return res.status(400).json({ error: '잘못된 ebookId 형식이에요.' });
    }

    const result = await ebookService.getPreviewUrls(ebookId);
    res.json({ success: true, ...result });
  } catch (err) {
    // 기존 에러 처리 그대로
    if (err.message === 'EBOOK_NOT_FOUND') {
      return res.status(404).json({ error: 'ebook을 찾을 수 없어요.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
}