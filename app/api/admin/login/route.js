import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Password salah.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('admin_session', process.env.ADMIN_SESSION_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}
