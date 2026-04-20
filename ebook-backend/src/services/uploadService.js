import { v4 as uuidv4 } from 'uuid';
import { convertPdfToWebP } from '../utils/convertPdf.js';
import { uploadToR2 } from '../utils/r2.js';

export const uploadService = {

  uploadEbook: async (title, pdfBuffer) => {
    const ebookId = uuidv4();

    // PDF → WebP 변환
    const pages = await convertPdfToWebP(pdfBuffer);

    // R2에 페이지별 업로드
    for (const { pageNum, buffer } of pages) {
      const key = `ebooks/${ebookId}/page-${pageNum}.webp`;
      await uploadToR2(key, buffer);
    }

    return {
      ebookId,
      totalPages: pages.length,
      title,
    };
  }
};