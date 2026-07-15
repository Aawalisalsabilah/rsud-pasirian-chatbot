import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Batas: 10 request per menit per IP untuk chatbot. Sliding window lebih
// adil dibanding fixed window (nggak ada celah "reset" yang bisa dieksploitasi
// tepat di detik pergantian menit).
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:chat',
});

// Batas KHUSUS login admin: lebih ketat karena ini target brute-force
// password. 5 percobaan per 15 menit per IP -- cukup buat admin asli yang
// salah ketik beberapa kali, tapi bikin brute-force jadi sangat lambat
// (butuh 15 menit cuma buat nyoba 5 kombinasi password).
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
});

// Ambil IP asli user di balik proxy Vercel. x-forwarded-for bisa berisi
// beberapa IP dipisah koma (client, proxy1, proxy2, ...) -- kita ambil yang
// paling pertama karena itu IP client asli.
export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}