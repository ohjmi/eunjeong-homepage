import { supabase } from '../utils/supabase.js';
import { generateSessionToken, hashToken } from '../utils/token.js';

export const authService = {

  findUserByCode: async (code) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) throw new Error('INVALID_CODE');
    return data;
  },

  findUserById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('USER_NOT_FOUND');
    return data;
  },

  createSession: async (userId) => {
    const token = generateSessionToken();
    const tokenHash = hashToken(token);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await supabase.from('sessions').insert({
      user_id: userId,
      token_hash: tokenHash,
      is_verified: false,
      expires_at: expiresAt.toISOString(),
    });

    return { token, tokenHash };
  },

  hasActiveSession: async (userId) => {
    const { data } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_verified', true);

    return data && data.length > 0;
  },

  getSessionByToken: async (token) => {
    const tokenHash = hashToken(token);

    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    return data;
  },

  activateSession: async (tokenHash) => {
    await supabase
      .from('sessions')
      .update({ is_verified: true })
      .eq('token_hash', tokenHash);
  },

  replaceSession: async (userId) => {
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const { error } = await supabase
      .from('sessions')
      .update({
        token_hash: tokenHash,
        is_verified: false,
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', userId);

    return { token, tokenHash };
  },
};