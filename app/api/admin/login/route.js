import { NextResponse } from 'next/server';
import { loginRateLimit, getClientIp } from '@/lib/rate-limit';
import { createAdminSession } from '@/lib/admin-session';

export async function POST(request) {
  // ===== RATE LIMITING KHUSUS LOGIN =====
  try {
    const ip = getClientIp(request);
    const { success, remaining, reset } = await loginRateLimit.limit(ip);

    if (!success) {
      console.warn('[LOGIN RATE LIMIT EXCEEDED]', { ip, remaining });
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  } catch (rateLimitError) {
    console.error('[LOGIN RATE LIMIT ERROR - FAIL OPEN]', rateLimitError.message);
  }
  // ===== END RATE LIMITING =====

  try {
    const { password } = await request.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Password salah.' }, { status: 401 });
    }

    // ===== BUAT TOKEN SESI BARU (BUKAN SECRET STATIS) =====
    // Setiap login sukses dapet token acak baru yang disimpen di Redis.
    // Ini yang memungkinkan 1 sesi bisa dicabut sendiri-sendiri tanpa
    // ngaruh ke sesi lain (beda dari sebelumnya yang pakai 1 secret sama
    // buat semua orang).
    let sessionToken;
    try {
      sessionToken = await createAdminSession();
    } catch (redisError) {
      console.error('[SESSION CREATE ERROR]', redisError.message);
      return NextResponse.json(
        { error: 'Gagal membuat sesi. Silakan coba lagi.' },
        { status: 500 }
      );
    }
    // ===== END BUAT TOKEN SESI =====

    const response = NextResponse.json({ success: true });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari, samain kayak TTL di Redis
    });

    return response;
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}