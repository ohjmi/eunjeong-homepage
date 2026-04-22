import { createCanvas } from 'canvas';
import sharp from 'sharp';

let pdfjsLib = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = await import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
  }
  return pdfjsLib;
}

export async function convertPdfToWebP(pdfBuffer) {
  const { getDocument } = await getPdfjs();

  const loadingTask = getDocument({ data: new Uint8Array(pdfBuffer) });
  const doc = await loadingTask.promise;

  const pages = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({ canvasContext: context, viewport }).promise;

    const pngBuffer = canvas.toBuffer('image/png');
    const webp = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer();

    pages.push({ pageNum, buffer: webp });

    page.cleanup();
  }

  await doc.destroy();

  return pages;
}
