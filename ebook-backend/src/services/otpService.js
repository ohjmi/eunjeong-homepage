import { supabase } from '../utils/supabase.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 6자리 코드 생성
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpService = {

  createOTP: async (userId, email) => {
    const otp = generateOTP();

    const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5분

    await supabase.from('otp_requests').insert({
      user_id: userId,
      otp,
      is_used: false,
      expires_at: expiresAt.toISOString(),
    });

    // 👉 여기서 이메일 발송 로직 붙이면 됨
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'ebook 인증 코드',
      html: `
        <h2>인증 코드</h2>
        <p>아래 코드를 입력해주세요. (10분 이내 유효)</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
      `,
    });
    console.log('OTP:', otp);

    return otp;
  },

  verifyOTP: async (userId, otpInput) => {
    const { data, error } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('otp', otpInput)
      .eq('is_used', false)
      .single();

    console.log('verifyOTP data:', data);
    console.log('verifyOTP error:', error);

    if (error || !data) return false;

    console.log('expires_at:', new Date(data.expires_at));
    console.log('now:', new Date());
    console.log('expired?', new Date(data.expires_at) < new Date());

    if (new Date(data.expires_at) < new Date()) {
      return false;
    }
    // 사용 처리
    await supabase
      .from('otp_requests')
      .update({ is_used: true })
      .eq('id', data.id);

    return true;
  },
};