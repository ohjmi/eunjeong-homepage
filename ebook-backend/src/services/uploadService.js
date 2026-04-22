import { v4 as uuidv4 } from 'uuid';
import { convertPdfToWebP } from '../utils/convertPdf.js';
import { uploadToR2 } from '../utils/r2.js';
import { supabase } from '../utils/supabase.js';

export const uploadService = {

  uploadEbook: async (title, pdfBuffer) => {
    const ebookId = uuidv4();
    const r2Prefix = `ebooks/${ebookId}`;

    const pages = await convertPdfToWebP(pdfBuffer);

    for (const { pageNum, buffer } of pages) {
      const key = `${r2Prefix}/page-${pageNum}.webp`;
      await uploadToR2(key, buffer);
    }

    const { data, error } = await supabase
      .from('ebooks')
      .insert({ title, total_pages: pages.length, r2_prefix: r2Prefix })
      .select('id')
      .single();

    if (error) throw new Error('DB 저장 실패: ' + error.message);

    return {
      ebookId: data.id,
      totalPages: pages.length,
      title,
    };
  }
};