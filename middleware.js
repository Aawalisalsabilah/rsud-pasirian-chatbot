import { NextResponse } from 'next/server';

// Proteksi semua route /admin/* dan /api/admin/*
// kecuali halaman login itu sendiri.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const isProtectedPage = pathname.startsWith('/admin');
  const isProtectedApi = pathname.startsWith('/api/admin');

  if (isProtectedPage || isProtectedApi) {
    const session = request.cookies.get('admin_session')?.value;

    if (!session || session !== process.env.ADMIN_SESSION_SECRET) {
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
