// utils/token.js
import crypto from 'crypto';

// 토큰 생성
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// 해시
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}