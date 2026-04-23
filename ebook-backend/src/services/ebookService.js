import { supabase } from '../utils/supabase.js';
import { r2 } from '../utils/r2.js';
import { GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

async function getUserWithEbook(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*, ebooks!ebook_id(*)')
    .eq('id', userId)
    .single();

  if (error || !user) throw new Error('ACCESS_DENIED');

  if (!user.ebooks) throw new Error('EBOOK_NOT_FOUND');

  return user;
}

// function createWatermarkSvg(width, height, text) {
//   const lines = [];
//   const gap = 180;
//   const angle = -30;

//   for (let y = -height; y < height * 2; y += gap) {
//     for (let x = -width; x < width * 2; x += gap) {
//       lines.push(`
//         <text
//           x="${x}"
//           y="${y}"
//           fill="rgba(0,0,0,0.12)"
//           font-size="14"
//           font-family="Noto Sans CJK KR, sans-serif"
//           font-weight="bold"
//           transform="rotate(${angle}, ${x}, ${y})"
//         >${text}</text>
//       `);
//     }
//   }

//   return Buffer.from(`
//     <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
//       ${lines.join('')}
//     </svg>
//   `);
// }

function createBannerSvg(width, height, text, position) {
  const bannerHeight = 40;
  const bannerY = position === 'top' ? 0 : height - bannerHeight;
  const textY = bannerY + bannerHeight / 2;

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${width / 2}"
        y="${textY}"
        fill="black"
        font-size="14"
        font-family="Noto Sans CJK KR, sans-serif"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="middle"
      >${text}</text>
    </svg>
  `);
}

async function fetchImageBuffer(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  const response = await r2.send(command);
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function checkCacheExists(key) {
  try {
    await r2.send(new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch {
    return false;
  }
}

async function applyAndCacheWatermark(originalKey, cacheKey, watermarkText) {
  const imageBuffer = await fetchImageBuffer(originalKey);
  const image = sharp(imageBuffer);
  const { width, height } = await image.metadata();

  // const svgBuffer = createWatermarkSvg(width, height, watermarkText);
  const bannerBuffer = createBannerSvg(width, height, watermarkText, 'bottom');

  // const watermarked = await image
  //   .composite([{ input: svgBuffer, top: 0, left: 0 }])
  //   .jpeg({ quality: 85 })
  //   .toBuffer();

  const watermarked = await image
    .composite([{ input: bannerBuffer, top: 0, left: 0 }])
    .webp({ quality: 85 })
    .toBuffer();

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: cacheKey,
    Body: watermarked,
    ContentType: 'image/webp',
  }));
}

async function generateSignedUrl(key) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
}

export const ebookService = {

  getEbookInfo: async (userId) => {
    const user = await getUserWithEbook(userId);
    return {
      title: user.ebooks.title,
      totalPages: user.ebooks.total_pages,
    };
  },

  getPageUrls: async (userId, startPage, limit = 50) => {
    const user = await getUserWithEbook(userId);

    const totalPages = user.ebooks.total_pages;
    const endPage = Math.min(startPage + limit - 1, totalPages);
    // const watermarkText = `ID:${user.id}  CODE:${user.code}`;
    const watermarkText = `${user.user_name}님 해당 제작물은 저작권법에 의해 보호되며 무단 복제 및 배포를 금지합니다`;

    const urlPromises = [];

    for (let i = startPage; i <= endPage; i++) {
      const originalKey = `${user.ebooks.r2_prefix}/page-${i}.webp`;
      const cacheKey = `watermarked/${user.id}/page-${i}.webp`;

      urlPromises.push(
        (async () => {
          const cached = await checkCacheExists(cacheKey);
          if (!cached) {
            await applyAndCacheWatermark(originalKey, cacheKey, watermarkText);
          }
          return generateSignedUrl(cacheKey);
        })()
      );
    }

    const urls = await Promise.all(urlPromises);
    return { urls, totalPages };
  },

  getPreviewUrls: async (ebookId) => {
    const { data: ebook, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .single();

    if (error || !ebook) throw new Error('EBOOK_NOT_FOUND');

    const PREVIEW_LIMIT = 6;
    const urlPromises = [];

    for (let i = 1; i <= PREVIEW_LIMIT; i++) {
      const key = `${ebook.r2_prefix}/page-${i}.webp`;
      urlPromises.push(generateSignedUrl(key));
    }

    const urls = await Promise.all(urlPromises);
    return { urls, totalPages: ebook.total_pages };
  },
};

