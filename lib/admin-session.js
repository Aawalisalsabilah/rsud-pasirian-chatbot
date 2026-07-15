import { Redis } from '@upstash/redis';
import { randomBytes } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SESSION_PREFIX = 'admin_session:';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 hari, samain kayak maxAge cookie

// Bikin token acak baru & simpen ke Redis dengan expiry otomatis.
// Redis yang urus kadaluarsa (TTL) -- kita nggak perlu cek manual tanggal.
export async function createAdminSession() {
  const token = randomBytes(32).toString('hex'); // 64 karakter hex, cukup acak & sulit ditebak
  await redis.set(`${SESSION_PREFIX}${token}`, {
    createdAt: new Date().toISOString(),
  }, { ex: SESSION_DURATION_SECONDS });
  return token;
}

// Cek apakah token ini masih valid (ada di Redis & belum expired).
export async function isValidAdminSession(token) {
  if (!token) return false;
  const data = await redis.get(`${SESSION_PREFIX}${token}`);
  return data !== null;
}

// Cabut 1 sesi spesifik (dipakai waktu logout).
export async function revokeAdminSession(token) {
  if (!token) return;
  await redis.del(`${SESSION_PREFIX}${token}`);
}