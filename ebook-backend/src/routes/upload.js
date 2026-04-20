import express from 'express';
import multer from 'multer';
import { uploadEbook } from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('pdf'), uploadEbook);

export default router;