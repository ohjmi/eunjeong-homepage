import { uploadService } from '../services/uploadService.js';

export async function uploadEbook(req, res) {
  try {
    const { title } = req.body;
    const pdfBuffer = req.file.buffer;

    if (!title || !pdfBuffer) {
      return res.status(400).json({ error: 'title 또는 파일이 없어요.' });
    }

    const result = await uploadService.uploadEbook(title, pdfBuffer);
    res.json({ success: true, ...result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '업로드 실패' });
  }
}