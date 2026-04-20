// import { pdf } from 'pdf-to-img';
// import sharp from 'sharp';

// export async function convertPdfToWebP(pdfBuffer) {
//   const pages = [];
//   const doc = await pdf(pdfBuffer, { scale: 2 });

//   let pageNum = 1;
//   for await (const page of doc) {
//     const webp = await sharp(page).webp({ quality: 85 }).toBuffer();
//     pages.push({ pageNum, buffer: webp });
//     pageNum++;
//   }

//   return pages;
// }

// PDF 변환은 Railway 배포 후 진행
export async function convertPdfToWebP(pdfBuffer) {
  throw new Error('PDF 변환은 Railway 배포 후 사용 가능합니다.');
}