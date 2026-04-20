import express from 'express';
import { getEbookInfo, getPageUrls, getPreviewUrls } from '../controllers/ebookController.js';

const router = express.Router();

router.get('/ebook/info', getEbookInfo);
router.get('/ebook/pages', getPageUrls);
router.get('/ebook/preview/:ebookId', getPreviewUrls);

export default router;