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
    const startPage = parseInt(req.query.start) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await ebookService.getPageUrls(userId, startPage, limit);
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

export async function getPreviewUrls(req, res) {
  try {
    const { ebookId } = req.params;
    const result = await ebookService.getPreviewUrls(ebookId);
    res.json({ success: true, ...result });

  } catch (err) {
    if (err.message === 'EBOOK_NOT_FOUND') {
      return res.status(404).json({ error: 'ebook을 찾을 수 없어요.' });
    }
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
}