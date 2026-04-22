import { pdf } from 'pdf-to-img';
import sharp from 'sharp';

export async function convertPdfToWebP(pdfBuffer) {
  const document = await pdf(pdfBuffer, {
    scale: 2  // 기존 코드와 동일한 스케일
  });

  const pages = [];
  let pageNum = 0;

  // pdf-to-img는 async iterator를 반환합니다
  for await (const pngBuffer of document) {
    pageNum++;

    const webp = await sharp(pngBuffer)
      .webp({ quality: 85 })
      .toBuffer();

    pages.push({ pageNum, buffer: webp });
  }

  return pages;
}