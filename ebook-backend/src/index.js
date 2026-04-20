// import dotenv from 'dotenv';
import 'dotenv/config';
// dotenv.config();

import express from 'express';
import cors from 'cors';
import uploadRouter from './routes/upload.js';
import authRouter from './routes/auth.js';
import otpRouter from './routes/otp.js';
import ebookRouter from './routes/ebook.js';
import cookieParser from 'cookie-parser';

const app = express();
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // 프론트 주소
  credentials: true,               // 쿠키 허용
}));
app.use(express.json());
app.use(cookieParser());



app.use('/api', uploadRouter);
app.use('/api', authRouter);
app.use('/api', otpRouter);
app.use('/api', ebookRouter);

app.get('/', (req, res) => {
  res.json({ message: 'ebook backend running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});