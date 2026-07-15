import { NextResponse } from 'next/server';
import { isValidAdminSession } from '@/lib/admin-session';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const isProtectedPage = pathname.startsWith('/admin');
  const isProtectedApi = pathname.startsWith('/api/admin');

  if (isProtectedPage || isProtectedApi) {
    const token = request.cookies.get('admin_session')?.value;

    // ===== VALIDASI TOKEN LEWAT REDIS (BUKAN BANDING KE 1 SECRET STATIS) =====
    let valid = false;
    try {
      valid = await isValidAdminSession(token);
    } catch (redisError) {
      console.error('[SESSION VALIDATION ERROR]', redisError.message);
      // Fail-closed sengaja di sini (beda dari rate limit yang fail-open) --
      // untuk validasi AUTH, kalau Redis lagi down lebih aman anggap sesi
      // tidak valid daripada malah meloloskan akses admin tanpa verifikasi.
      valid = false;
    }
    // ===== END VALIDASI =====

    if (!valid) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};